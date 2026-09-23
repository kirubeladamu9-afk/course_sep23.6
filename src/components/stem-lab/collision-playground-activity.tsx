import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useEffect, useRef, useState } from 'react'

export type CollisionPlaygroundProps = { onComplete?: () => void }
type Feedback = 'idle' | 'correct' | 'incorrect'
type MassOption = { id: string; name: string; mass: number; color: string }
type Simulation = { position: number; velocity: number; elapsed: number; running: boolean }
type VisibleReadouts = { sum: boolean; values: boolean; speed: boolean }
type Challenge = { targetSpeed: number; time: number }

const MASS_OPTIONS: MassOption[] = [
  { id: 'box', name: 'Light box', mass: 2, color: '#e3a15e' },
  { id: 'crate', name: 'Medium crate', mass: 5, color: '#b97845' },
  { id: 'fridge', name: 'Heavy fridge', mass: 12, color: '#8ca1aa' },
]
const MAX_FORCE = 500
const TRACK_HALF_LENGTH = 8
const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const createChallenge = (): Challenge => ({ targetSpeed: randomItem([4, 5, 6]), time: randomItem([2, 3, 4]) })
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const Team: FC<{ side: 'left' | 'right'; force: number }> = ({ side, force }) => <Stack alignItems={side === 'left' ? 'flex-end' : 'flex-start'} spacing={.5} sx={{ width: { xs: 88, sm: 118 }, flexShrink: 0 }}>
  <Typography variant="caption" sx={{ fontWeight: 900, color: side === 'left' ? '#336d82' : '#a34d43' }}>{side === 'left' ? 'LEFT TEAM' : 'RIGHT TEAM'}</Typography>
  <Stack direction={side === 'left' ? 'row-reverse' : 'row'} spacing={.5}>
    {[0, 1, 2].map((member) => <Box key={member} sx={{ position: 'relative', width: 25, height: 43 }}>
      <Box sx={{ position: 'absolute', left: 7, top: 0, width: 12, height: 12, borderRadius: '50%', backgroundColor: side === 'left' ? '#62a9bf' : '#de755f', border: '2px solid #fff' }} />
      <Box sx={{ position: 'absolute', left: 3, top: 13, width: 20, height: 27, borderRadius: '10px 10px 4px 4px', backgroundColor: side === 'left' ? '#397f98' : '#b95248', transform: side === 'left' ? 'rotate(-8deg)' : 'rotate(8deg)' }} />
    </Box>)}
  </Stack>
  <Typography variant="caption" sx={{ fontWeight: 800 }}>{force.toFixed(0)} N</Typography>
</Stack>

const SpeedDial: FC<{ speed: number; velocity: number }> = ({ speed, velocity }) => {
  const dialAngle = clamp(speed / 20, 0, 1) * 240 - 120
  return <Stack alignItems="center" spacing={.5} sx={{ minWidth: 142 }}>
    <Typography variant="caption" sx={{ fontWeight: 900, color: '#4b5968' }}>SPEEDOMETER</Typography>
    <Box sx={{ position: 'relative', width: 118, height: 68, overflow: 'hidden' }}>
      <Box sx={{ position: 'absolute', left: 9, top: 0, width: 100, height: 100, borderRadius: '50%', border: '9px solid #d7e0e6', borderBottomColor: '#e8a346', transform: 'rotate(-45deg)' }} />
      <Box sx={{ position: 'absolute', left: 57, top: 47, width: 4, height: 42, borderRadius: 2, backgroundColor: '#3c556c', transformOrigin: '50% 3px', transform: `rotate(${dialAngle}deg)` , transition: 'transform .12s linear' }} />
      <Box sx={{ position: 'absolute', left: 52, top: 42, width: 14, height: 14, borderRadius: '50%', backgroundColor: '#3c556c' }} />
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 900 }}>{speed.toFixed(2)} m/s</Typography>
    <Typography variant="caption" color="text.secondary">{velocity > .01 ? 'moving left' : velocity < -.01 ? 'moving right' : 'at rest'}</Typography>
  </Stack>
}

const CollisionPlaygroundActivity: FC<CollisionPlaygroundProps> = ({ onComplete }) => {
  const [challenge, setChallenge] = useState<Challenge>(createChallenge)
  const [appliedForce, setAppliedForce] = useState(0)
  const [mass, setMass] = useState(2)
  const [simulation, setSimulation] = useState<Simulation>({ position: 0, velocity: 0, elapsed: 0, running: false })
  const [selectedMass, setSelectedMass] = useState('box')
  const [visible, setVisible] = useState<VisibleReadouts>({ sum: true, values: true, speed: true })
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const challengeRef = useRef(challenge)
  const forceRef = useRef(appliedForce)
  const massRef = useRef(mass)
  const simulationRef = useRef(simulation)

  forceRef.current = appliedForce
  massRef.current = mass
  simulationRef.current = simulation

  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const delta = Math.min(.032, Math.max(.001, (now - previous) / 1000))
      previous = now
      setSimulation((current) => {
        if (!current.running) return current
        const acceleration = forceRef.current / massRef.current
        const nextElapsed = Math.min(challengeRef.current.time, current.elapsed + delta)
        const nextVelocity = current.velocity + acceleration * delta
        const nextPosition = current.position + current.velocity * delta + .5 * acceleration * delta * delta
        const next = { position: nextPosition, velocity: nextVelocity, elapsed: nextElapsed, running: nextElapsed < challengeRef.current.time }
        simulationRef.current = next
        return next
      })
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const leftForce = Math.max(0, -appliedForce)
  const rightForce = Math.max(0, appliedForce)
  const netForce = leftForce - rightForce
  const acceleration = netForce / mass
  const speed = Math.abs(simulation.velocity)
  const targetReached = simulation.elapsed >= challenge.time - .05 && Math.abs(speed - challenge.targetSpeed) <= .2
  const completed = feedback === 'correct' && targetReached
  const cartLeft = `${50 + clamp(simulation.position / TRACK_HALF_LENGTH, -1, 1) * 38}%`

  const updateForce = (value: number) => {
    setAppliedForce(value)
    setFeedback('idle')
  }

  const selectMass = (option: MassOption) => {
    setSelectedMass(option.id)
    setMass(option.mass)
    setFeedback('idle')
  }

  const toggleReadout = (key: keyof VisibleReadouts) => setVisible((current) => ({ ...current, [key]: !current[key] }))
  const toggleSimulation = () => {
    if (simulation.elapsed >= challenge.time) return
    setFeedback('idle')
    setSimulation((current) => ({ ...current, running: !current.running }))
  }
  const checkActivity = () => setFeedback(targetReached ? 'correct' : 'incorrect')
  const reset = () => {
    const nextChallenge = createChallenge()
    challengeRef.current = nextChallenge
    setChallenge(nextChallenge)
    setAppliedForce(0)
    setMass(2)
    setSelectedMass('box')
    setSimulation({ position: 0, velocity: 0, elapsed: 0, running: false })
    setFeedback('idle')
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Collision Playground</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Explore how force, mass, and motion relate.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Core" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Two teams pull against the cart. The net force and selected mass determine acceleration using Newton&apos;s second law: F = ma.</Typography>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'action.hover' }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Set the forces and mass so the object reaches a speed of {challenge.targetSpeed} m/s within {challenge.time} seconds.</Typography>
      </Paper>
      <Box sx={{ position: 'relative', minHeight: 300, p: { xs: 1.5, sm: 2.5 }, border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #f9fbfd 0%, #edf2f5 100%)', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ position: 'absolute', top: 18, left: { xs: 10, sm: 24 }, right: { xs: 10, sm: 24 } }}><Team side="left" force={leftForce} /><Team side="right" force={rightForce} /></Stack>
        <Box sx={{ position: 'absolute', left: '8%', right: '8%', bottom: 62, borderBottom: '6px solid #758795' }} />
        <Box sx={{ position: 'absolute', left: '50%', bottom: 49, height: 42, borderLeft: '2px dashed #c49438' }}><Typography variant="caption" sx={{ position: 'absolute', top: 42, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: '#896d2d', fontWeight: 800 }}>center</Typography></Box>
        <Box sx={{ position: 'absolute', left: cartLeft, bottom: 70, transform: 'translateX(-50%)', transition: simulation.running ? 'none' : 'left .2s ease', animation: feedback === 'correct' ? 'cartCelebrate .55s ease-in-out infinite alternate' : 'none', '@keyframes cartCelebrate': { from: { transform: 'translateX(-50%) translateY(0)' }, to: { transform: 'translateX(-50%) translateY(-9px)' } } }}>
          <Box sx={{ position: 'relative', width: 84, height: 52, display: 'grid', placeItems: 'center', borderRadius: 1.5, backgroundColor: MASS_OPTIONS.find((option) => option.id === selectedMass)?.color, border: '4px solid #445765', color: 'common.white', fontWeight: 900, boxShadow: '0 7px 0 rgba(61,77,88,.18)' }}>CART<Box sx={{ position: 'absolute', left: 8, bottom: -13, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#263238', border: '3px solid white' }} /><Box sx={{ position: 'absolute', right: 8, bottom: -13, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#263238', border: '3px solid white' }} /></Box>
        </Box>
        {visible.values && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ position: 'absolute', bottom: 14, left: 18 }}><Typography variant="body2" sx={{ fontWeight: 800 }}>Mass: {mass.toFixed(1)} kg</Typography><Typography variant="body2" color="text.secondary">Acceleration: {acceleration.toFixed(2)} m/s²</Typography><Typography variant="body2" color="text.secondary">Time: {simulation.elapsed.toFixed(2)} s</Typography></Stack>}
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper elevation={0} sx={{ p: 2, flex: 1, border: 1, borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 800 }}>Applied Force: {appliedForce.toFixed(0)} N</Typography>
          <Slider min={-MAX_FORCE} max={MAX_FORCE} step={1} value={appliedForce} onChange={(_, value) => updateForce(Array.isArray(value) ? value[0] : value)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(0)} N`} aria-label="Applied Force" />
          <Stack direction="row" justifyContent="space-between"><Typography variant="caption">−500 N · left</Typography><Typography variant="caption">0 N</Typography><Typography variant="caption">+500 N · right</Typography></Stack>
        </Paper>
        <Paper elevation={0} sx={{ p: 2, flex: 1, border: 1, borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 800, mb: .75 }}>Choose object mass</Typography>
          <Stack direction="row" spacing={.75} flexWrap="wrap" useFlexGap>{MASS_OPTIONS.map((option) => <Button key={option.id} size="small" variant={selectedMass === option.id ? 'contained' : 'outlined'} onClick={() => selectMass(option)}>{option.name} · {option.mass} kg</Button>)}</Stack>
        </Paper>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
        <Paper elevation={0} sx={{ p: 1.5, flex: 1, backgroundColor: 'action.hover' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: .5 }}>Live values</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {visible.sum && <Chip color="primary" label={`Sum of Forces: ${netForce.toFixed(0)} N`} />}
            {visible.values && <Chip variant="outlined" label={`Left Force: ${leftForce.toFixed(0)} N · Right Force: ${rightForce.toFixed(0)} N`} />}
            {visible.speed && <Chip color="secondary" label={`Speed: ${speed.toFixed(2)} m/s`} />}
          </Stack>
        </Paper>
        {visible.speed && <SpeedDial speed={speed} velocity={simulation.velocity} />}
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>Show labels:</Typography>
        <FormControlLabel control={<Checkbox checked={visible.sum} onChange={() => toggleReadout('sum')} size="small" />} label="Sum of Forces" />
        <FormControlLabel control={<Checkbox checked={visible.values} onChange={() => toggleReadout('values')} size="small" />} label="Values" />
        <FormControlLabel control={<Checkbox checked={visible.speed} onChange={() => toggleReadout('speed')} size="small" />} label="Speed" />
      </Stack>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: simulation.running ? 'rgba(25,118,210,.1)' : 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>{simulation.running ? `The cart is accelerating at ${acceleration.toFixed(2)} m/s².` : simulation.elapsed >= challenge.time ? `The ${challenge.time} second trial is complete.` : 'Set the applied force and mass, then start the simulation.'}</Typography><Typography variant="caption" color="text.secondary">Acceleration = net force ÷ mass. A heavier object responds more slowly to the same net force.</Typography></Paper>
      {feedback === 'correct' && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: 'success.main', animation: 'teamCelebrate .65s ease', '@keyframes teamCelebrate': { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.025)' }, '100%': { transform: 'scale(1)' } } }}><Typography color="success.main" sx={{ fontWeight: 800 }}>Right! A bigger net force on a lighter object gives faster acceleration.</Typography><Typography variant="body2" color="text.secondary">The cart reached {challenge.targetSpeed} m/s in the {challenge.time}-second trial using F = ma.</Typography></Paper>}
      {feedback === 'incorrect' && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'warning.main' }}><Typography color="warning.dark" sx={{ fontWeight: 700 }}>{speed < challenge.targetSpeed ? 'Hint: Increase the applied force or choose a lighter object.' : 'Hint: Reduce the applied force or choose a heavier object.'}</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={toggleSimulation} disabled={simulation.elapsed >= challenge.time} startIcon={simulation.running ? <PauseIcon /> : <PlayArrowIcon />}>{simulation.running ? 'Pause' : simulation.elapsed > 0 ? 'Resume' : 'Start'} Simulation</Button><Button variant="outlined" onClick={checkActivity} disabled={simulation.running || simulation.elapsed < challenge.time}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default CollisionPlaygroundActivity
