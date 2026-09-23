import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type KinematicsActivityProps = { onComplete?: () => void }
type Sample = { time: number; position: number; velocity: number; acceleration: number }
type Feedback = 'idle' | 'correct' | 'incorrect'

const TRACK_MAX = 30
const DT = 0.016
const randomChallenge = () => ({ position: 14 + Math.floor(Math.random() * 13), time: 3 + Math.floor(Math.random() * 4) })
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const KinematicsActivity: FC<KinematicsActivityProps> = ({ onComplete }) => {
  const [position, setPosition] = useState(0)
  const [velocity, setVelocity] = useState(2)
  const [acceleration, setAcceleration] = useState(1)
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [recording, setRecording] = useState(true)
  const [samples, setSamples] = useState<Sample[]>([])
  const [challenge, setChallenge] = useState(randomChallenge)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const animationRef = useRef<number | null>(null)
  const previousFrame = useRef(performance.now())
  const physics = useRef({ position: 0, velocity: 2, acceleration: 1, elapsed: 0 })
  const samplesRef = useRef<Sample[]>([])

  const stepSimulation = useCallback((dt: number) => {
    const state = physics.current
    const nextPosition = state.position + state.velocity * dt + 0.5 * state.acceleration * dt * dt
    state.position = clamp(nextPosition, 0, TRACK_MAX)
    state.velocity = nextPosition <= 0 || nextPosition >= TRACK_MAX ? 0 : state.velocity + state.acceleration * dt
    state.elapsed += dt
    setPosition(state.position)
    setVelocity(state.velocity)
    setElapsed(state.elapsed)
    if (recording) {
      const nextSample = { time: state.elapsed, position: state.position, velocity: state.velocity, acceleration: state.acceleration }
      samplesRef.current = [...samplesRef.current.slice(-119), nextSample]
      setSamples(samplesRef.current)
    }
  }, [recording])

  useEffect(() => {
    if (!running) return undefined
    const animate = (now: number) => {
      const dt = Math.min((now - previousFrame.current) / 1000, 0.05)
      previousFrame.current = now
      stepSimulation(dt)
      animationRef.current = requestAnimationFrame(animate)
    }
    previousFrame.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [running, stepSimulation])

  useEffect(() => {
    physics.current.acceleration = acceleration
  }, [acceleration])

  const reset = () => {
    const nextChallenge = randomChallenge()
    physics.current = { position: 0, velocity: 2, acceleration: 1, elapsed: 0 }
    samplesRef.current = []
    setPosition(0)
    setVelocity(2)
    setAcceleration(1)
    setElapsed(0)
    setSamples([])
    setChallenge(nextChallenge)
    setFeedback('idle')
    setFeedbackVersion((value) => value + 1)
    setRunning(false)
  }

  const checkActivity = () => {
    const targetReached = Math.abs(physics.current.position - challenge.position) <= 0.5 && Math.abs(physics.current.elapsed - challenge.time) <= 0.12
    setFeedback(targetReached ? 'correct' : 'incorrect')
    setFeedbackVersion((value) => value + 1)
  }

  const handleTrackPointer = (event: PointerEvent<SVGCircleElement>) => {
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return
    const bounds = svg.getBoundingClientRect()
    const nextPosition = clamp(((event.clientX - bounds.left - 30) / (bounds.width - 60)) * TRACK_MAX, 0, TRACK_MAX)
    physics.current.position = nextPosition
    physics.current.velocity = 0
    setPosition(nextPosition)
    setVelocity(0)
    setFeedback('idle')
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const updateVelocity = (_: Event, value: number | number[]) => {
    const next = value as number
    physics.current.velocity = next
    setVelocity(next)
    setFeedback('idle')
  }
  const updateAcceleration = (_: Event, value: number | number[]) => {
    const next = value as number
    physics.current.acceleration = next
    setAcceleration(next)
    setFeedback('idle')
  }

  const graphPaths = useMemo(() => {
    const graph = (field: keyof Sample, min: number, max: number) => {
      if (!samples.length) return ''
      const startTime = Math.max(0, elapsed - 8)
      const visible = samples.filter((sample) => sample.time >= startTime)
      return visible.map((sample, index) => {
        const x = 34 + ((sample.time - startTime) / 8) * 586
        const y = 52 - ((sample[field] as number - min) / (max - min)) * 42
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${clamp(y, 8, 58).toFixed(1)}`
      }).join(' ')
    }
    return { position: graph('position', 0, TRACK_MAX), velocity: graph('velocity', -10, 10), acceleration: graph('acceleration', -10, 10) }
  }, [elapsed, samples])

  const graph = (label: string, path: string, color: string, unit: string) => <Box><Typography variant="caption" sx={{ fontWeight: 700 }}>{label} ({unit})</Typography><Box component="svg" viewBox="0 0 640 70" role="img" aria-label={`${label} graph`} sx={{ display: 'block', width: '100%', height: 82, backgroundColor: 'common.white', border: 1, borderColor: 'divider', borderRadius: 1 }}><line x1="34" x2="620" y1="52" y2="52" stroke="#cbd5e1" /><line x1="34" x2="34" y1="8" y2="58" stroke="#94a3b8" /><path d={path} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" /></Box></Box>

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}>
    <Box><Chip label="Kinematics Lab" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Kinematics Lab</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Analyze motion using position, velocity, and acceleration.</Typography></Box>
    <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Advanced" variant="outlined" size="small" /></Stack>
    <Paper elevation={0} sx={{ p: { xs: 1, md: 2 }, backgroundColor: '#edf6fb', border: 1, borderColor: 'divider' }}>
      <Box component="svg" viewBox="0 0 680 180" role="img" aria-label={`Object at ${position.toFixed(1)} meters`} sx={{ width: '100%', height: { xs: 180, md: 220 }, backgroundColor: 'common.white', borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <line x1="30" x2="650" y1="110" y2="110" stroke="#475569" strokeWidth="5" /><line x1="30" x2="650" y1="116" y2="116" stroke="#94a3b8" strokeWidth="2" />
        {Array.from({ length: 31 }, (_, index) => <g key={index}><line x1={30 + index * (620 / TRACK_MAX)} x2={30 + index * (620 / TRACK_MAX)} y1="106" y2={index % 5 === 0 ? 92 : 99} stroke="#334155" /><text x={30 + index * (620 / TRACK_MAX)} y="145" textAnchor="middle" fontSize="10">{index}</text></g>)}
        <circle cx={30 + position * (620 / TRACK_MAX)} cy="92" r="17" fill="#f59e0b" stroke="#92400e" strokeWidth="3" onPointerDown={handleTrackPointer} onPointerMove={handleTrackPointer} /><circle cx={25 + position * (620 / TRACK_MAX)} cy="88" r="3" fill="#fff" /><circle cx={35 + position * (620 / TRACK_MAX)} cy="88" r="3" fill="#fff" /><text x="340" y="26" textAnchor="middle" fontSize="13" fontWeight="bold">MOVING OBJECT · {position.toFixed(1)} m</text><text x="340" y="168" textAnchor="middle" fontSize="12" fill="#475569">Drag the object along the track or use the controls below</text>
      </Box>
    </Paper>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}><Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Velocity: {velocity.toFixed(1)} m/s</Typography><Slider min={-10} max={10} step={0.1} value={velocity} onChange={updateVelocity} aria-label="Velocity" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Acceleration: {acceleration.toFixed(1)} m/s²</Typography><Slider min={-10} max={10} step={0.1} value={acceleration} onChange={updateAcceleration} aria-label="Acceleration" /></Box></Stack>
    <Stack direction="row" spacing={1}><Button variant="contained" onClick={() => setRunning((value) => !value)} startIcon={running ? <PauseIcon /> : <PlayArrowIcon />}>{running ? 'Pause' : 'Play'}</Button><Button variant="outlined" onClick={() => { setRunning(false); stepSimulation(DT) }}>Step</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button><Chip sx={{ ml: 'auto' }} label={`Time: ${elapsed.toFixed(2)} s`} /></Stack>
    <Button variant={recording ? 'outlined' : 'text'} onClick={() => setRecording((value) => !value)}>{recording ? 'Recording trace' : 'Record trace'}</Button>
    <Stack spacing={1}>{graph('Position vs. Time', graphPaths.position, '#2563eb', 'm')}{graph('Velocity vs. Time', graphPaths.velocity, '#16a34a', 'm/s')}{graph('Acceleration vs. Time', graphPaths.acceleration, '#dc2626', 'm/s²')}</Stack>
    <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'kinematicsCelebrate .7s ease-in-out infinite alternate' : feedback === 'incorrect' ? 'kinematicsShake .45s ease-in-out' : 'none', '@keyframes kinematicsCelebrate': { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.015)' } }, '@keyframes kinematicsShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } } }}><Typography sx={{ fontWeight: 800 }}>Challenge: Reach {challenge.position} m in exactly {challenge.time} s.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! Using x = v₀t + ½at², your object reached the target at the target time.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Try adjusting velocity or acceleration, then run the object to the target time before checking again.</Typography>}</Paper>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={feedback !== 'correct'} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button></Stack>
  </Stack></Paper>
}

export default KinematicsActivity
