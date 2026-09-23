import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useEffect, useRef, useState } from 'react'

export type ForceMotionLabProps = { onComplete?: () => void }
type Feedback = 'idle' | 'correct' | 'incorrect'
type Simulation = { position: number; speed: number; elapsed: number; running: boolean }
type Challenge = { distance: number; time: number }

const MASS = 2
const TRACK_LENGTH = 70
const createChallenge = (): Challenge => ({ distance: 24 + Math.floor(Math.random() * 25), time: 5 })

const ForceMotionLabActivity: FC<ForceMotionLabProps> = ({ onComplete }) => {
  const [challenge, setChallenge] = useState(createChallenge)
  const [force, setForce] = useState(8)
  const [simulation, setSimulation] = useState<Simulation>({ position: 0, speed: 0, elapsed: 0, running: false })
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const challengeRef = useRef(challenge)
  const forceRef = useRef(force)
  const simulationRef = useRef(simulation)

  forceRef.current = force
  simulationRef.current = simulation

  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const delta = Math.min(.032, Math.max(.001, (now - previous) / 1000))
      previous = now
      setSimulation((current) => {
        if (!current.running) return current
        const acceleration = forceRef.current / MASS
        const nextElapsed = Math.min(challengeRef.current.time, current.elapsed + delta)
        const nextSpeed = current.speed + acceleration * delta
        const nextPosition = current.position + current.speed * delta + .5 * acceleration * delta * delta
        const running = nextElapsed < challengeRef.current.time
        const next = { position: nextPosition, speed: nextSpeed, elapsed: nextElapsed, running }
        simulationRef.current = next
        return next
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const acceleration = force / MASS
  const challengeCorrect = simulation.elapsed >= challenge.time - .05 && simulation.position >= challenge.distance
  const completed = feedback === 'correct' && challengeCorrect
  const cartPosition = `${Math.min(94, 8 + (simulation.position / TRACK_LENGTH) * 84)}%`
  const targetPosition = `${8 + (challenge.distance / TRACK_LENGTH) * 84}%`

  const setAppliedForce = (value: number) => {
    setForce(value)
    setFeedback('idle')
  }

  const startSimulation = () => {
    if (simulation.elapsed >= challenge.time) return
    setFeedback('idle')
    setSimulation((current) => ({ ...current, running: !current.running }))
  }

  const checkActivity = () => {
    setFeedback(challengeCorrect ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const reset = () => {
    const nextChallenge = createChallenge()
    challengeRef.current = nextChallenge
    setChallenge(nextChallenge)
    setForce(8)
    setSimulation({ position: 0, speed: 0, elapsed: 0, running: false })
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Force &amp; Motion Lab</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>See how forces cause objects to move.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Apply a force to the cart and watch it accelerate. The cart has a fixed mass of {MASS} kg, so acceleration follows force ÷ mass.</Typography>
      <Box sx={{ position: 'relative', minHeight: 260, p: { xs: 2, sm: 3 }, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: '#f4efe5', backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,.55), transparent 45%)' }}>
        <Typography variant="caption" sx={{ position: 'absolute', top: 10, left: 14, color: '#695d50', fontWeight: 800, letterSpacing: '.08em' }}>FLAT SURFACE</Typography>
        <Typography variant="caption" sx={{ position: 'absolute', top: 34, left: targetPosition, transform: 'translateX(-50%)', color: '#9b6b09', fontWeight: 800, whiteSpace: 'nowrap' }}>{challenge.distance} m finish</Typography>
        <Box sx={{ position: 'absolute', left: targetPosition, top: 58, bottom: 44, borderLeft: '3px dashed #d6a62b' }} />
        <Box sx={{ position: 'absolute', left: '8%', right: '6%', bottom: 46, borderBottom: '6px solid #a88f71' }} />
        <Box sx={{ position: 'absolute', left: '8%', right: '6%', bottom: 50, height: 14, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 8%, rgba(102,81,59,.18) 8% 8.5%)' }} />
        <Box sx={{ position: 'absolute', left: cartPosition, bottom: 54, transform: 'translateX(-50%)', transition: simulation.running ? 'none' : 'left .2s ease', animation: feedback === 'correct' ? 'forceMotionCelebrate .65s ease-in-out infinite alternate' : 'none', '@keyframes forceMotionCelebrate': { from: { transform: 'translateX(-50%) translateY(0) rotate(0deg)' }, to: { transform: 'translateX(-50%) translateY(-10px) rotate(3deg)' } } }}>
          <Box sx={{ position: 'relative', width: 72, height: 40, display: 'grid', placeItems: 'center', borderRadius: '12px 16px 5px 5px', backgroundColor: '#e56352', border: '3px solid #9c3432', color: 'common.white', fontSize: 11, fontWeight: 900 }}>CART<Box sx={{ position: 'absolute', left: 8, bottom: -11, width: 17, height: 17, borderRadius: '50%', backgroundColor: '#263238', border: '3px solid white' }} /><Box sx={{ position: 'absolute', right: 8, bottom: -11, width: 17, height: 17, borderRadius: '50%', backgroundColor: '#263238', border: '3px solid white' }} /><Box sx={{ position: 'absolute', left: 18, top: -14, width: 34, height: 16, borderRadius: '14px 14px 0 0', backgroundColor: '#82c8d2', border: '3px solid #9c3432', borderBottom: 0 }} /></Box>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ position: 'absolute', left: 16, right: 16, bottom: 12 }}><Typography variant="body2" sx={{ fontWeight: 800 }}>Position: {simulation.position.toFixed(1)} m</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>Speed: {simulation.speed.toFixed(1)} m/s</Typography><Typography variant="body2" color="text.secondary">Time: {simulation.elapsed.toFixed(1)} s</Typography></Stack>
      </Box>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>Applied Force: {force.toFixed(1)} N</Typography>
        <Slider min={0} max={20} step={.5} value={force} onChange={(_, value) => setAppliedForce(Array.isArray(value) ? value[0] : value)} aria-label="Applied Force" valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(1)} N`} />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Chip label={`Acceleration: ${acceleration.toFixed(1)} m/s²`} color="primary" /><Chip label={`Mass: ${MASS.toFixed(1)} kg`} variant="outlined" /><Chip label="Force = mass × acceleration" variant="outlined" /></Stack>
        <Button variant="contained" onClick={startSimulation} disabled={simulation.elapsed >= challenge.time} sx={{ mt: 1.5 }}>{simulation.running ? 'Pause simulation' : 'Start simulation'}</Button>
      </Paper>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: simulation.running ? 'rgba(25,118,210,.1)' : 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>{simulation.running ? `The cart is accelerating at ${acceleration.toFixed(1)} m/s².` : simulation.elapsed >= challenge.time ? `The ${challenge.time.toFixed(1)} second trial is complete.` : 'Set the applied force, then start the trial.'}</Typography><Typography variant="caption" color="text.secondary">More applied force produces more acceleration for the same mass, and speed keeps increasing while the force acts.</Typography></Paper>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'forceMotionCorrect .65s ease' : feedback === 'incorrect' ? 'forceMotionShake .45s ease-in-out' : 'none', '@keyframes forceMotionCorrect': { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.025)' }, '100%': { transform: 'scale(1)' } }, '@keyframes forceMotionShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge: Apply enough force to get the object moving past the finish line in {challenge.time.toFixed(0)} seconds.</Typography>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! More force made it accelerate faster.</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>{simulation.position < challenge.distance ? 'Try increasing the force so the cart travels farther.' : 'Try decreasing the force so the cart reaches the line within the trial time.'}</Typography>}
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={simulation.running || simulation.elapsed < challenge.time}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default ForceMotionLabActivity
