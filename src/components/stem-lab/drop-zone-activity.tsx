import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useEffect, useMemo, useState } from 'react'

export type DropZoneProps = { onComplete?: () => void }
type DropStatus = 'ready' | 'falling' | 'landed'
type ChallengeType = 'last' | 'air-resistance'
type Feedback = 'idle' | 'correct' | 'incorrect'
type DropObject = { id: string; name: string; weight: number; color: string; icon: string; airResistance: number }
type DropResult = { position: number; speed: number; elapsed: number; status: DropStatus; landingTime: number | null }
type Challenge = { type: ChallengeType }

const GRAVITY = 9.81
const DROP_HEIGHT = 12
const OBJECT_POOL: DropObject[] = [
  { id: 'feather', name: 'Feather', weight: .002, color: '#e8d7b4', icon: 'FEATHER', airResistance: .64 },
  { id: 'tennis-ball', name: 'Tennis ball', weight: .057, color: '#cbd74e', icon: 'BALL', airResistance: 0 },
  { id: 'bowling-ball', name: 'Bowling ball', weight: 7.3, color: '#4f648d', icon: 'BOWL', airResistance: 0 },
  { id: 'brick', name: 'Brick', weight: 2.3, color: '#bd684e', icon: 'BRICK', airResistance: 0 },
  { id: 'baseball', name: 'Baseball', weight: .145, color: '#f4f2e9', icon: 'BALL', airResistance: 0 },
  { id: 'basketball', name: 'Basketball', weight: .62, color: '#d78643', icon: 'BALL', airResistance: 0 },
  { id: 'apple', name: 'Apple', weight: .18, color: '#d76255', icon: 'APPLE', airResistance: 0 },
]

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - .5)
const createObjects = () => [OBJECT_POOL[0], ...shuffle(OBJECT_POOL.slice(1)).slice(0, 3)].map((object) => ({ ...object }))
const createResults = (objects: DropObject[]) => Object.fromEntries(objects.map((object) => [object.id, { position: 0, speed: 0, elapsed: 0, status: 'ready' as DropStatus, landingTime: null }])) as Record<string, DropResult>
const createChallenge = (): Challenge => ({ type: Math.random() > .5 ? 'last' : 'air-resistance' })
const labelForChallenge = (challenge: Challenge) => challenge.type === 'last' ? 'Predict which object lands last.' : 'Predict which object is slowed by air resistance.'

const DropZoneActivity: FC<DropZoneProps> = ({ onComplete }) => {
  const initialObjects = useMemo(createObjects, [])
  const [objects, setObjects] = useState(initialObjects)
  const [challenge, setChallenge] = useState(createChallenge)
  const [results, setResults] = useState<Record<string, DropResult>>(() => createResults(initialObjects))
  const [prediction, setPrediction] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const delta = Math.min(.032, Math.max(.001, (now - previous) / 1000))
      previous = now
      setResults((current) => {
        const next = { ...current }
        objects.forEach((object) => {
          const result = current[object.id]
          if (result.status !== 'falling') return
          const acceleration = GRAVITY * (1 - object.airResistance)
          const nextSpeed = result.speed + acceleration * delta
          const nextPosition = result.position + result.speed * delta + .5 * acceleration * delta * delta
          const landed = nextPosition >= DROP_HEIGHT
          next[object.id] = landed
            ? { position: DROP_HEIGHT, speed: nextSpeed, elapsed: result.elapsed + delta, status: 'landed', landingTime: result.elapsed + delta }
            : { position: nextPosition, speed: nextSpeed, elapsed: result.elapsed + delta, status: 'falling', landingTime: null }
        })
        return next
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [objects])

  const allLanded = objects.every((object) => results[object.id].status === 'landed')
  const lastObject = objects.reduce((current, object) => results[object.id].elapsed > results[current.id].elapsed ? object : current, objects[0])
  const actualAirResistantObject = objects.find((object) => object.airResistance > 0) ?? objects[0]
  const challengeCorrect = allLanded && prediction !== null && (challenge.type === 'last' ? prediction === lastObject.id : prediction === actualAirResistantObject.id)
  const completed = feedback === 'correct' && challengeCorrect

  const dropObject = (object: DropObject) => {
    setResults((current) => ({ ...current, [object.id]: { position: 0, speed: 0, elapsed: 0, status: 'falling', landingTime: null } }))
    setFeedback('idle')
  }

  const checkActivity = () => {
    setFeedback(challengeCorrect ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const reset = () => {
    const nextObjects = createObjects()
    setObjects(nextObjects)
    setChallenge(createChallenge())
    setResults(createResults(nextObjects))
    setPrediction(null)
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Drop Zone</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Explore how gravity pulls objects downward.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Choose any object and tap Drop. Gravity gives every object the same downward acceleration; air resistance is the extra factor that slows the feather.</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        {objects.map((object) => {
          const result = results[object.id]
          const top = `${8 + (result.position / DROP_HEIGHT) * 72}%`
          return <Paper key={object.id} elevation={0} sx={{ flex: 1, minHeight: 330, position: 'relative', overflow: 'hidden', p: 1.25, border: 1, borderColor: result.status === 'landed' ? 'success.main' : 'divider', background: 'linear-gradient(180deg, #ecf7ff 0 88%, #c8a06c 88% 100%)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography sx={{ fontWeight: 900 }}>{object.name}</Typography><Chip size="small" label={`${object.weight} kg`} /></Stack>
            <Typography variant="caption" color="text.secondary">Gravity: {GRAVITY.toFixed(2)} m/s²</Typography>
            <Box sx={{ position: 'absolute', left: '50%', top, transform: `translate(-50%, -50%) ${object.airResistance ? 'rotate(-10deg)' : ''}`, width: 66, height: 48, display: 'grid', placeItems: 'center', borderRadius: object.id === 'feather' ? '50% 40% 60% 35%' : object.id.includes('ball') ? '50%' : 1, backgroundColor: object.color, border: '3px solid rgba(33,54,69,.45)', color: '#243c4c', fontSize: 9, fontWeight: 900, transition: result.status === 'falling' ? 'none' : 'top .25s ease', animation: result.status === 'falling' && object.airResistance ? 'featherDrift .42s ease-in-out infinite alternate' : result.status === 'landed' && feedback === 'correct' ? 'dropBounce .65s ease-in-out infinite alternate' : 'none', '@keyframes featherDrift': { from: { marginLeft: -10, rotate: '-8deg' }, to: { marginLeft: 10, rotate: '8deg' } }, '@keyframes dropBounce': { from: { transform: 'translate(-50%, -50%)' }, to: { transform: 'translate(-50%, -62%)' } } }}>{object.icon}</Box>
            <Box sx={{ position: 'absolute', left: 10, right: 10, bottom: 10 }}><Typography variant="caption" sx={{ display: 'block', color: '#365d70', fontWeight: 800 }}>{result.status === 'ready' ? 'Ready to drop' : result.status === 'falling' ? `Falling… Speed: ${result.speed.toFixed(1)} m/s` : `Landed after ${result.landingTime?.toFixed(2)} seconds`}</Typography><Button fullWidth size="small" variant="contained" onClick={() => dropObject(object)} disabled={result.status === 'falling'} sx={{ mt: .5 }}>Drop</Button></Box>
          </Paper>
        })}
      </Stack>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>{allLanded ? 'All selected objects have landed. Compare their measured times.' : 'Drop multiple objects in quick succession to compare their landing times.'}</Typography><Typography variant="caption" color="text.secondary">Dense objects share the same gravity acceleration; the feather takes longer because air resistance reduces its acceleration.</Typography></Paper>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}><Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>Results log</Typography><Stack spacing={.5}>{objects.map((object) => { const result = results[object.id]; return <Stack key={object.id} direction="row" justifyContent="space-between"><Typography variant="body2">{object.name} · {object.weight} kg</Typography><Typography variant="body2" color="text.secondary">{result.landingTime === null ? 'Not landed yet' : `${result.landingTime.toFixed(2)} s`}</Typography></Stack> })}</Stack></Paper>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'dropCelebrate .65s ease' : feedback === 'incorrect' ? 'dropShake .45s ease-in-out' : 'none' }} key={feedbackVersion}>
        <Typography sx={{ fontWeight: 800 }}>Challenge: {labelForChallenge(challenge)}</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>{objects.map((object) => <Button key={object.id} size="small" variant={prediction === object.id ? 'contained' : 'outlined'} onClick={() => { setPrediction(object.id); setFeedback('idle') }}>{object.name}</Button>)}</Stack>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! Without air pushing back, dense objects fall at the same rate — only the feather is slowed by air resistance.</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Hint: Look for the object whose path is changed by air pushing against it.</Typography>}
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={!allLanded || prediction === null}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default DropZoneActivity
