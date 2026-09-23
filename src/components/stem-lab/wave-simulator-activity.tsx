import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type WaveSimulatorProps = { onComplete?: () => void }
type Mode = 'Manual' | 'Oscillate' | 'Pulse'
type EndCondition = 'Fixed End' | 'Loose End' | 'No End'
type Feedback = 'idle' | 'correct' | 'incorrect'

const POINTS = 56
const DT = 0.016
const randomTarget = () => Number((1.5 + Math.random() * 2).toFixed(1))

const WaveSimulatorActivity: FC<WaveSimulatorProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<Mode>('Oscillate')
  const [end, setEnd] = useState<EndCondition>('Fixed End')
  const [tension, setTension] = useState(58)
  const [damping, setDamping] = useState(12)
  const [frequency, setFrequency] = useState(1.5)
  const [amplitude, setAmplitude] = useState(42)
  const [speedMode, setSpeedMode] = useState<'Normal' | 'Slow'>('Normal')
  const [running, setRunning] = useState(true)
  const [rulers, setRulers] = useState(false)
  const [stopwatch, setStopwatch] = useState(false)
  const [reference, setReference] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)
  const [measuredWavelength, setMeasuredWavelength] = useState(0)
  const [target, setTarget] = useState(randomTarget)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const [renderTick, setRenderTick] = useState(0)
  const displacements = useRef(Array.from({ length: POINTS }, () => 0))
  const velocities = useRef(Array.from({ length: POINTS }, () => 0))
  const animationRef = useRef<number | null>(null)
  const previousFrame = useRef(performance.now())
  const manualValue = useRef(0)
  const pulseSent = useRef(false)

  const waveSpeed = 2.2 + tension / 24
  const wavelength = frequency > 0 ? waveSpeed / frequency : 0
  const pointSpacing = 8
  const centerY = 130
  const amplitudeScale = amplitude / 42

  const stepSimulation = useCallback((dt: number) => {
    const u = displacements.current
    const v = velocities.current
    const c2 = waveSpeed * waveSpeed
    const dampingRate = damping / 100 * 1.8
    if (mode === 'Oscillate') u[0] = Math.sin(elapsedRef.current * frequency * Math.PI * 2) * amplitudeScale
    if (mode === 'Manual') u[0] = manualValue.current
    if (mode === 'Pulse' && !pulseSent.current) {
      u[0] = amplitudeScale
      pulseSent.current = true
    }
    const nextU = u.slice()
    const nextV = v.slice()
    for (let i = 1; i < POINTS - 1; i += 1) {
      const acceleration = c2 * (u[i - 1] - 2 * u[i] + u[i + 1]) - dampingRate * v[i]
      nextV[i] = v[i] + acceleration * dt
      nextU[i] = u[i] + nextV[i] * dt
    }
    if (end === 'Fixed End') {
      nextU[POINTS - 1] = 0
      nextV[POINTS - 1] = 0
    } else if (end === 'Loose End') {
      const acceleration = c2 * (u[POINTS - 2] - u[POINTS - 1]) - dampingRate * v[POINTS - 1]
      nextV[POINTS - 1] = v[POINTS - 1] + acceleration * dt
      nextU[POINTS - 1] = u[POINTS - 1] + nextV[POINTS - 1] * dt
    } else {
      nextU[POINTS - 1] = u[POINTS - 2]
      nextV[POINTS - 1] = v[POINTS - 2]
    }
    nextU[0] = u[0]
    nextV[0] = 0
    displacements.current = nextU
    velocities.current = nextV
    elapsedRef.current += dt
    setElapsed(elapsedRef.current)
  }, [damping, end, frequency, mode, amplitudeScale, waveSpeed])

  useEffect(() => {
    if (!running) return undefined
    const animate = (now: number) => {
      const frameDelta = Math.min((now - previousFrame.current) / 1000, 0.05)
      previousFrame.current = now
      const scaledDelta = frameDelta * (speedMode === 'Slow' ? 0.35 : 1)
      stepSimulation(scaledDelta)
      setRenderTick((value) => value + 1)
      animationRef.current = requestAnimationFrame(animate)
    }
    previousFrame.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [running, speedMode, stepSimulation])

  useEffect(() => {
    const interval = window.setInterval(() => {
      const values = displacements.current
      const peaks: number[] = []
      for (let i = 1; i < POINTS - 1; i += 1) {
        if (values[i] > values[i - 1] && values[i] >= values[i + 1] && values[i] > 0.12) peaks.push(i)
      }
      if (peaks.length > 1) setMeasuredWavelength((peaks[peaks.length - 1] - peaks[peaks.length - 2]) * pointSpacing / 50)
      else setMeasuredWavelength(wavelength * 50 / 50)
    }, 180)
    return () => window.clearInterval(interval)
  }, [wavelength])

  const points = useMemo(() => displacements.current.map((value, index) => `${35 + index * 10.3},${centerY - value * 48}`).join(' '), [renderTick])
  const challengeCorrect = measuredWavelength > 0 && Math.abs(measuredWavelength - target) <= 0.25
  const completed = feedback === 'correct' && challengeCorrect

  const reset = () => {
    displacements.current = Array.from({ length: POINTS }, () => 0)
    velocities.current = Array.from({ length: POINTS }, () => 0)
    manualValue.current = 0
    pulseSent.current = false
    elapsedRef.current = 0
    setElapsed(0)
    setMeasuredWavelength(0)
    setTarget(randomTarget())
    setFeedback('idle')
    setFeedbackVersion((value) => value + 1)
  }

  const checkActivity = () => {
    setFeedback(challengeCorrect ? 'correct' : 'incorrect')
    setFeedbackVersion((value) => value + 1)
  }

  const handleManualPointer = (event: PointerEvent<SVGCircleElement>) => {
    if (mode !== 'Manual') return
    const svg = event.currentTarget.ownerSVGElement
    if (!svg) return
    const box = svg.getBoundingClientRect()
    const y = ((event.clientY - box.top) / box.height) * 260
    manualValue.current = Math.max(-1, Math.min(1, (centerY - y) / 48))
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Wave Machine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Wave Machine</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how amplitude and frequency shape a wave.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Advanced" variant="outlined" size="small" /></Stack>
      <Paper elevation={0} sx={{ p: { xs: 1, md: 2 }, backgroundColor: '#edf6fb', border: 1, borderColor: 'divider' }}>
        <Box component="svg" viewBox="0 0 680 260" role="img" aria-label="Connected point masses on a string wave machine" sx={{ width: '100%', height: { xs: 230, md: 300 }, backgroundColor: 'common.white', borderRadius: 2, border: 1, borderColor: 'divider' }}>
          {reference && <line x1="30" x2="650" y1={centerY} y2={centerY} stroke="#718096" strokeDasharray="7 6" strokeWidth="1.5" />}
          {rulers && Array.from({ length: 13 }, (_, i) => <g key={i}><line x1={35 + i * 51.5} x2={35 + i * 51.5} y1="236" y2="244" stroke="#334155" /><text x={35 + i * 51.5} y="256" textAnchor="middle" fontSize="11">{i}</text></g>)}
          <line x1="35" x2="610" y1={centerY} y2={centerY} stroke="#64748b" strokeWidth="3" opacity=".35" />
          <path d="M 19 97 L 8 112 L 19 127 M 8 112 L 35 112" stroke="#374151" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="35" cy={centerY - displacements.current[0] * 48} r="8" fill="#e67e22" stroke="#7c2d12" strokeWidth="3" onPointerDown={handleManualPointer} onPointerMove={handleManualPointer} />
          <polyline points={points} fill="none" stroke="#2563eb" strokeWidth="2" opacity=".45" />
          {displacements.current.map((value, index) => <circle key={index} cx={35 + index * 10.3} cy={centerY - value * 48} r={index === 0 ? 5 : 3.5} fill={index === 0 ? '#e67e22' : '#2563eb'} />)}
          <path d={end === 'No End' ? 'M 628 91 L 628 149' : 'M 625 82 L 625 158 M 633 82 L 633 158'} stroke="#475569" strokeWidth="5" />
          {end !== 'No End' && <path d="M 626 91 l 10 8 M 626 105 l 10 8 M 626 119 l 10 8 M 626 133 l 10 8" stroke="#94a3b8" strokeWidth="2" />}
          <text x="35" y="24" textAnchor="middle" fontSize="12" fontWeight="bold">HAND CRANK</text><text x="628" y="24" textAnchor="middle" fontSize="12" fontWeight="bold">{end.toUpperCase()}</text>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>Each blue dot is a connected point mass. Tension couples its motion to neighboring points.</Typography>
      </Paper>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <FormControl size="small" fullWidth><InputLabel>Mode</InputLabel><Select value={mode} label="Mode" onChange={(event) => { setMode(event.target.value as Mode); pulseSent.current = false }}>{(['Manual', 'Oscillate', 'Pulse'] as Mode[]).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl>
        <FormControl size="small" fullWidth><InputLabel>End condition</InputLabel><Select value={end} label="End condition" onChange={(event) => setEnd(event.target.value as EndCondition)}>{(['Fixed End', 'Loose End', 'No End'] as EndCondition[]).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl>
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Tension: {tension}% <Typography component="span" variant="caption" color="text.secondary">(wave speed {waveSpeed.toFixed(1)} units/s)</Typography></Typography><Slider min={10} max={100} value={tension} onChange={(_, value) => { setTension(value as number); setFeedback('idle') }} aria-label="Tension" /></Box>
        <Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Damping: {damping}%</Typography><Slider min={0} max={60} value={damping} onChange={(_, value) => { setDamping(value as number); setFeedback('idle') }} aria-label="Damping" /></Box>
      </Stack>
      {mode === 'Oscillate' && <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}><Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Frequency: {frequency.toFixed(1)} Hz</Typography><Slider min={0.5} max={4} step={0.1} value={frequency} onChange={(_, value) => { setFrequency(value as number); setFeedback('idle') }} aria-label="Frequency" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Amplitude: {amplitude}%</Typography><Slider min={10} max={80} value={amplitude} onChange={(_, value) => { setAmplitude(value as number); setFeedback('idle') }} aria-label="Amplitude" /></Box></Stack>}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}><Button variant="contained" onClick={() => setRunning((value) => !value)} startIcon={running ? <PauseIcon /> : <PlayArrowIcon />}>{running ? 'Pause' : 'Play'}</Button><Button variant="outlined" onClick={() => { setRunning(false); stepSimulation(DT) }}>Step</Button><Button variant={speedMode === 'Normal' ? 'outlined' : 'contained'} onClick={() => setSpeedMode((value) => value === 'Normal' ? 'Slow' : 'Normal')}>{speedMode} speed</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button><Box sx={{ flex: 1 }} /><FormControlLabel control={<Checkbox checked={rulers} onChange={(event) => setRulers(event.target.checked)} />} label="Rulers" /><FormControlLabel control={<Checkbox checked={stopwatch} onChange={(event) => setStopwatch(event.target.checked)} />} label="Stopwatch" /><FormControlLabel control={<Checkbox checked={reference} onChange={(event) => setReference(event.target.checked)} />} label="Reference line" /></Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Chip label={`Actual wavelength: ${measuredWavelength.toFixed(1)} rulers`} /><Chip label={`Predicted v ÷ f: ${wavelength.toFixed(1)} rulers`} />{stopwatch && <Chip label={`Stopwatch: ${elapsed.toFixed(2)} s`} />}</Stack>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'waveCelebrate .7s ease-in-out infinite alternate' : feedback === 'incorrect' ? 'waveShake .45s ease-in-out' : 'none', '@keyframes waveCelebrate': { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.015)' } }, '@keyframes waveShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } } }}><Typography sx={{ fontWeight: 800 }}>Challenge: Set the frequency so the measured wavelength is {target.toFixed(1)} rulers.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! Higher frequency means the wave repeats more often, shortening its wavelength.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Try adjusting frequency or tension; watch the measured wavelength, then check again.</Typography>}</Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button></Stack>
    </Stack>
  </Paper>
}

export default WaveSimulatorActivity
