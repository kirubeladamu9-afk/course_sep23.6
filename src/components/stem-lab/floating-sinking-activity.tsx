import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useEffect, useMemo, useRef, useState } from 'react'

export type FloatingSinkingProps = { onComplete?: () => void }
type Outcome = 'float' | 'sink'
type DropState = 'dry' | 'dropping' | Outcome
type Feedback = 'idle' | 'correct' | 'incorrect'
type ObjectPreset = { id: string; name: string; icon: string; color: string; mass: number; volume: number }
type SimObject = ObjectPreset & { mass: number; volume: number }
type Round = { objects: SimObject[]; goal: Outcome }

const WATER_DENSITY = 1
const OBJECT_POOL: ObjectPreset[] = [
  { id: 'leaf', name: 'Leaf', icon: 'LEAF', color: '#6faf56', mass: .4, volume: 2.5 },
  { id: 'stone', name: 'Stone', icon: 'STONE', color: '#80909c', mass: 5.2, volume: 2 },
  { id: 'boat', name: 'Boat', icon: 'BOAT', color: '#d98d3c', mass: 4, volume: 16 },
  { id: 'coin', name: 'Coin', icon: 'COIN', color: '#d7a937', mass: 8.9, volume: 1 },
  { id: 'cork', name: 'Cork', icon: 'CORK', color: '#bc8658', mass: .6, volume: 2.5 },
  { id: 'apple', name: 'Apple', icon: 'APPLE', color: '#d95d55', mass: 1.2, volume: 1.5 },
  { id: 'ice', name: 'Ice', icon: 'ICE', color: '#8bc9e8', mass: 1.8, volume: 2 },
  { id: 'marble', name: 'Marble', icon: 'MARBLE', color: '#8e83ad', mass: 6.7, volume: 2.5 },
]

const startingObjects = OBJECT_POOL.filter((object) => ['leaf', 'stone', 'boat', 'coin'].includes(object.id))
const randomObjects = () => [...OBJECT_POOL].sort(() => Math.random() - .5).slice(0, 4).map((object) => ({ ...object }))
const createRound = (starting = false): Round => ({ objects: (starting ? startingObjects : randomObjects()).map((object) => ({ ...object })), goal: Math.random() > .5 ? 'float' : 'sink' })
const densityOf = (object: SimObject) => object.mass / object.volume
const outcomeOf = (object: SimObject): Outcome => densityOf(object) <= WATER_DENSITY ? 'float' : 'sink'
const outcomeLabel = (outcome: Outcome) => outcome === 'float' ? 'float at the surface' : 'sink to the bottom'

const FloatingSinkingActivity: FC<FloatingSinkingProps> = ({ onComplete }) => {
  const initialRound = useMemo(() => createRound(true), [])
  const [objects, setObjects] = useState(initialRound.objects)
  const [goal, setGoal] = useState<Outcome>(initialRound.goal)
  const [selectedId, setSelectedId] = useState(initialRound.objects[0].id)
  const [dropState, setDropState] = useState<DropState>('dry')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const dropTimerRef = useRef<number | null>(null)
  const selected = objects.find((object) => object.id === selectedId) ?? objects[0]
  const density = densityOf(selected)
  const actualOutcome = outcomeOf(selected)
  const hasObservedOutcome = dropState === 'float' || dropState === 'sink'
  const correct = hasObservedOutcome && dropState === goal && dropState === actualOutcome && (actualOutcome === 'float' ? density <= WATER_DENSITY : density > WATER_DENSITY)
  const completed = feedback === 'correct' && correct

  useEffect(() => () => {
    if (dropTimerRef.current !== null) window.clearTimeout(dropTimerRef.current)
  }, [])

  const updateSelected = (field: 'mass' | 'volume', value: number) => {
    setObjects((current) => current.map((object) => object.id === selectedId ? { ...object, [field]: value } : object))
    setDropState('dry')
    setFeedback('idle')
  }

  const selectObject = (id: string) => {
    if (dropTimerRef.current !== null) window.clearTimeout(dropTimerRef.current)
    setSelectedId(id)
    setDropState('dry')
    setFeedback('idle')
  }

  const dropIntoWater = () => {
    if (dropTimerRef.current !== null) window.clearTimeout(dropTimerRef.current)
    setDropState('dropping')
    setFeedback('idle')
    dropTimerRef.current = window.setTimeout(() => {
      setDropState(outcomeOf(selected))
      dropTimerRef.current = null
    }, 700)
  }

  const checkActivity = () => {
    setFeedback(correct ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const reset = () => {
    if (dropTimerRef.current !== null) window.clearTimeout(dropTimerRef.current)
    const nextRound = createRound()
    setObjects(nextRound.objects)
    setGoal(nextRound.goal)
    setSelectedId(nextRound.objects[0].id)
    setDropState('dry')
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Buoyancy Simulator</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Discover why some objects float and others sink.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Select a starting preset, adjust its mass and volume, then drop it into water. Water has a density of 1 g/cm³.</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {objects.map((object) => <Button key={object.id} size="small" variant={object.id === selectedId ? 'contained' : 'outlined'} onClick={() => selectObject(object.id)}>{object.name}</Button>)}
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
        <Box sx={{ flex: 1, minWidth: 0, minHeight: 340, position: 'relative', overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #eaf7ff 0 28%, #91d2ea 28% 100%)' }}>
          <Typography variant="caption" sx={{ position: 'absolute', top: 10, left: 12, zIndex: 3, fontWeight: 800, color: 'text.secondary', letterSpacing: '.08em' }}>WATER TANK</Typography>
          <Box sx={{ position: 'absolute', top: '28%', left: 0, right: 0, height: 5, backgroundColor: '#3d9bc2', opacity: .7 }} />
          <Box sx={{ position: 'absolute', top: '31%', left: '50%', transform: 'translate(-50%, -50%)', width: 130, height: 8, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,.4)' }} />
          <Box sx={{ position: 'absolute', left: '50%', top: dropState === 'dry' ? '13%' : dropState === 'dropping' ? '52%' : dropState === 'float' ? '34%' : '82%', transform: 'translate(-50%, -50%)', width: 92, height: 58, display: 'grid', placeItems: 'center', borderRadius: selected.id === 'leaf' || selected.id === 'apple' ? '50%' : 2, backgroundColor: selected.color, color: '#193243', border: '3px solid rgba(25,50,67,.55)', boxShadow: '0 5px 10px rgba(25,50,67,.18)', transition: dropState === 'dropping' ? 'top .7s cubic-bezier(.4,0,.2,1)' : 'top .7s cubic-bezier(.2,.8,.2,1)', animation: dropState === 'float' ? 'buoyancyBob 2.4s ease-in-out infinite' : 'none', '@keyframes buoyancyBob': { '0%, 100%': { transform: 'translate(-50%, -50%) rotate(-2deg)' }, '50%': { transform: 'translate(-50%, -54%) rotate(2deg)' } } }}>
            <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '.06em' }}>{selected.icon}</Typography>
          </Box>
          <Typography variant="caption" sx={{ position: 'absolute', bottom: 10, left: 12, color: '#1e617b', fontWeight: 800 }}>{dropState === 'float' ? 'Floating at the surface' : dropState === 'sink' ? 'Resting on the bottom' : dropState === 'dropping' ? 'Moving through the water…' : 'Ready to drop'}</Typography>
        </Box>
        <Paper elevation={0} sx={{ flex: 1, p: 2, border: 1, borderColor: 'divider' }}>
          <Typography variant="h6">{selected.name}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Adjust the physical properties.</Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Mass: {selected.mass.toFixed(1)} g</Typography>
          <Slider min={.1} max={10} step={.1} value={selected.mass} onChange={(_, value) => updateSelected('mass', Array.isArray(value) ? value[0] : value)} aria-label="Object mass" valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(1)} g`} />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Volume: {selected.volume.toFixed(1)} cm³</Typography>
          <Slider min={.5} max={20} step={.1} value={selected.volume} onChange={(_, value) => updateSelected('volume', Array.isArray(value) ? value[0] : value)} aria-label="Object volume" valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(1)} cm³`} />
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}><Chip label={`Density: ${density.toFixed(2)} g/cm³`} color={density <= WATER_DENSITY ? 'success' : 'warning'} /><Chip label="Water: 1.00 g/cm³" variant="outlined" /></Stack>
          <Button fullWidth variant="contained" onClick={dropIntoWater} disabled={dropState === 'dropping'} sx={{ mt: 2 }}>Drop into water</Button>
        </Paper>
      </Stack>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: actualOutcome === 'float' ? 'rgba(46,125,50,.1)' : 'rgba(198,40,40,.08)', border: 1, borderColor: actualOutcome === 'float' ? 'success.main' : 'error.main' }}>
        <Typography sx={{ fontWeight: 800 }}>{dropState === 'dry' ? `Current density is ${density.toFixed(2)} g/cm³.` : dropState === 'dropping' ? 'Watch the object move through the water.' : `${selected.name} will ${outcomeLabel(actualOutcome)}.`}</Typography>
        <Typography variant="caption" color="text.secondary">{density <= WATER_DENSITY ? 'Density is at or below water density, so buoyant force supports the object.' : 'Density is greater than water density, so weight pulls the object down.'}</Typography>
      </Paper>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'buoyancyCelebrate .65s ease' : feedback === 'incorrect' ? 'buoyancyShake .45s ease-in-out' : 'none', '@keyframes buoyancyCelebrate': { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.025)' }, '100%': { transform: 'scale(1)' } }, '@keyframes buoyancyShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge: Adjust the object so it will {goal === 'float' ? 'float' : 'sink'}, then drop it into the water.</Typography>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Correct! The density comparison explains why this object {goal === 'float' ? 'floats' : 'sinks'}.</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Hint: Compare {density.toFixed(2)} g/cm³ with water's 1.00 g/cm³, then drop the object to observe the result.</Typography>}
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default FloatingSinkingActivity
