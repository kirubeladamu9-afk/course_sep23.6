import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { type FC, type PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'

type ObjectKind = 'Cannonball' | 'Golf ball' | 'Light sphere'
type Feedback = 'idle' | 'correct' | 'incorrect'
type ShotState = { x: number; y: number; vx: number; vy: number; time: number; maxHeight: number; landed: boolean }
export type ProjectileMotionActivityProps = { onComplete?: () => void }

const GRAVITY = 9.81
const AIR_DENSITY = 1.225
const TRACK_WIDTH = 52
const randomTarget = () => Number((12 + Math.random() * 13).toFixed(1))
const objectData: Record<ObjectKind, { diameter: number; mass: number; cd: number }> = { Cannonball: { diameter: 0.18, mass: 8, cd: 0.47 }, 'Golf ball': { diameter: 0.043, mass: 0.046, cd: 0.25 }, 'Light sphere': { diameter: 0.22, mass: 0.15, cd: 0.5 } }
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const ProjectileMotionActivity: FC<ProjectileMotionActivityProps> = ({ onComplete }) => {
  const [angle, setAngle] = useState(45)
  const [speed, setSpeed] = useState(18)
  const [objectKind, setObjectKind] = useState<ObjectKind>('Cannonball')
  const [diameter, setDiameter] = useState(objectData.Cannonball.diameter)
  const [mass, setMass] = useState(objectData.Cannonball.mass)
  const [airResistance, setAirResistance] = useState(false)
  const [displayMode, setDisplayMode] = useState<'Total' | 'Components'>('Total')
  const [velocityVectors, setVelocityVectors] = useState(false)
  const [accelerationVectors, setAccelerationVectors] = useState(false)
  const [forceVectors, setForceVectors] = useState(false)
  const [target, setTarget] = useState(randomTarget)
  const [shot, setShot] = useState<ShotState>({ x: 0, y: 0, vx: 0, vy: 0, time: 0, maxHeight: 0, landed: false })
  const [trajectory, setTrajectory] = useState<Array<{ x: number; y: number }>>([])
  const [running, setRunning] = useState(false)
  const [speedMode, setSpeedMode] = useState<'Normal' | 'Slow'>('Normal')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const animationRef = useRef<number | null>(null)
  const previousFrame = useRef(performance.now())
  const shotRef = useRef(shot)
  const trajectoryRef = useRef(trajectory)

  const dragCoefficient = objectData[objectKind].cd
  const area = Math.PI * (diameter / 2) ** 2
  const dragFactor = airResistance ? 0.5 * AIR_DENSITY * dragCoefficient * area / Math.max(mass, 0.01) : 0

  const stepSimulation = useCallback((dt: number) => {
    const current = shotRef.current
    if (current.landed || !trajectoryRef.current.length) return
    const velocityMagnitude = Math.hypot(current.vx, current.vy)
    const dragX = -dragFactor * velocityMagnitude * current.vx
    const dragY = -dragFactor * velocityMagnitude * current.vy
    const ax = dragX
    const ay = -GRAVITY + dragY
    const nextX = current.x + current.vx * dt + 0.5 * ax * dt * dt
    const nextY = current.y + current.vy * dt + 0.5 * ay * dt * dt
    const nextVx = current.vx + ax * dt
    const nextVy = current.vy + ay * dt
    const landed = nextY <= 0 && current.time > 0
    const next: ShotState = { x: Math.max(0, nextX), y: Math.max(0, nextY), vx: nextVx, vy: nextVy, time: current.time + dt, maxHeight: Math.max(current.maxHeight, nextY), landed }
    shotRef.current = next
    setShot(next)
    if (!landed) {
      trajectoryRef.current = [...trajectoryRef.current, { x: next.x, y: next.y }]
      setTrajectory(trajectoryRef.current)
    } else setRunning(false)
  }, [dragFactor])

  useEffect(() => {
    if (!running) return undefined
    const animate = (now: number) => {
      const dt = Math.min((now - previousFrame.current) / 1000, 0.04) * (speedMode === 'Slow' ? 0.3 : 1)
      previousFrame.current = now
      stepSimulation(dt)
      animationRef.current = requestAnimationFrame(animate)
    }
    previousFrame.current = performance.now()
    animationRef.current = requestAnimationFrame(animate)
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current) }
  }, [running, speedMode, stepSimulation])

  const selectObject = (next: ObjectKind) => { setObjectKind(next); setDiameter(objectData[next].diameter); setMass(objectData[next].mass); setFeedback('idle') }
  const fire = () => {
    const radians = angle * Math.PI / 180
    const next: ShotState = { x: 0, y: 4, vx: speed * Math.cos(radians), vy: speed * Math.sin(radians), time: 0, maxHeight: 4, landed: false }
    shotRef.current = next
    trajectoryRef.current = [{ x: 0, y: 4 }]
    setShot(next)
    setTrajectory(trajectoryRef.current)
    setFeedback('idle')
    setRunning(true)
  }
  const reset = () => { setRunning(false); setShot({ x: 0, y: 0, vx: 0, vy: 0, time: 0, maxHeight: 0, landed: false }); shotRef.current = { x: 0, y: 0, vx: 0, vy: 0, time: 0, maxHeight: 0, landed: false }; trajectoryRef.current = []; setTrajectory([]); setTarget(randomTarget()); setFeedback('idle'); setFeedbackVersion((value) => value + 1) }
  const checkActivity = () => { const correct = shot.landed && Math.abs(shot.x - target) <= 0.8 && Math.abs(speed - 18) < 0.05; setFeedback(correct ? 'correct' : 'incorrect'); setFeedbackVersion((value) => value + 1) }
  const handleTargetPointer = (event: PointerEvent<SVGCircleElement>) => { const svg = event.currentTarget.ownerSVGElement; if (!svg) return; const bounds = svg.getBoundingClientRect(); setTarget(Number(clamp(((event.clientX - bounds.left - 55) / (bounds.width - 75)) * TRACK_WIDTH, 5, TRACK_WIDTH).toFixed(1))); if (event.type === 'pointerdown') event.currentTarget.setPointerCapture(event.pointerId) }
  const step = () => { setRunning(false); stepSimulation(0.016) }

  const scaleX = (x: number) => 55 + x * 11
  const scaleY = (y: number) => 250 - y * 8
  const trail = useMemo(() => trajectory.map((point, index) => `${index === 0 ? 'M' : 'L'} ${scaleX(point.x).toFixed(1)} ${scaleY(point.y).toFixed(1)}`).join(' '), [trajectory])
  const vector = (x: number, y: number, dx: number, dy: number, color: string) => <line x1={x} y1={y} x2={x + dx} y2={y - dy} stroke={color} strokeWidth="2.5" markerEnd="url(#arrow)" />
  const velocityMagnitude = Math.hypot(shot.vx, shot.vy)
  const currentAcceleration = { x: -dragFactor * velocityMagnitude * shot.vx, y: -GRAVITY - dragFactor * velocityMagnitude * shot.vy }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}>
    <Box><Chip label="Applied Lab" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Projectile Motion Lab</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Adjust launch conditions and calculate the horizontal range of a projectile.</Typography></Box>
    <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Applied Lab" variant="outlined" size="small" /></Stack>
    <Paper elevation={0} sx={{ p: { xs: 1, md: 2 }, backgroundColor: '#edf6fb', border: 1, borderColor: 'divider' }}><Box component="svg" viewBox="0 0 680 290" role="img" aria-label="Projectile launched from a cannon" sx={{ width: '100%', height: { xs: 290, md: 350 }, backgroundColor: 'common.white', borderRadius: 2, border: 1, borderColor: 'divider' }}>
      <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="context-stroke" /></marker></defs><line x1="45" x2="650" y1="250" y2="250" stroke="#475569" strokeWidth="4" />{Array.from({ length: 53 }, (_, index) => <g key={index}><line x1={55 + index * 11} x2={55 + index * 11} y1="250" y2={index % 5 === 0 ? 238 : 244} stroke="#334155" /><text x={55 + index * 11} y="270" textAnchor="middle" fontSize="9">{index}</text></g>)}<rect x="32" y="210" width="48" height="40" fill="#64748b" /><line x1="56" y1="214" x2={56 + Math.cos(angle * Math.PI / 180) * 42} y2={214 - Math.sin(angle * Math.PI / 180) * 42} stroke="#1e293b" strokeWidth="12" strokeLinecap="round" />{trajectory.length > 1 && <path d={trail} fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" />}{shot.time > 0 && !shot.landed && <circle cx={scaleX(shot.x)} cy={scaleY(shot.y)} r="7" fill="#dc2626" />}{(velocityVectors || accelerationVectors || forceVectors) && shot.time > 0 && !shot.landed && <g>{velocityVectors && (displayMode === 'Total' ? vector(scaleX(shot.x), scaleY(shot.y), shot.vx * 2, shot.vy * 2, '#16a34a') : <>{vector(scaleX(shot.x), scaleY(shot.y), shot.vx * 2, 0, '#16a34a')}{vector(scaleX(shot.x), scaleY(shot.y), 0, shot.vy * 2, '#15803d')}</>)}{accelerationVectors && vector(scaleX(shot.x), scaleY(shot.y), currentAcceleration.x * 8, currentAcceleration.y * 8, '#f59e0b')}{forceVectors && vector(scaleX(shot.x), scaleY(shot.y), currentAcceleration.x * mass * 2, currentAcceleration.y * mass * 2, '#9333ea')}</g>}{<circle cx={scaleX(target)} cy="250" r="9" fill={feedback === 'correct' ? '#16a34a' : '#ef4444'} stroke="#7f1d1d" strokeWidth="3" onPointerDown={handleTargetPointer} onPointerMove={handleTargetPointer} />}</Box></Paper>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}><Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Launch angle: {angle}°</Typography><Slider min={5} max={85} value={angle} onChange={(_, value) => { setAngle(value as number); setFeedback('idle') }} aria-label="Launch angle" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Initial speed: {speed.toFixed(1)} m/s</Typography><Slider min={5} max={35} step={0.1} value={speed} onChange={(_, value) => { setSpeed(value as number); setFeedback('idle') }} aria-label="Initial speed" /></Box></Stack>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><FormControl size="small" fullWidth><InputLabel>Object</InputLabel><Select value={objectKind} label="Object" onChange={(event) => selectObject(event.target.value as ObjectKind)}>{(['Cannonball', 'Golf ball', 'Light sphere'] as ObjectKind[]).map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl><Box sx={{ flex: 1 }}><Typography variant="body2">Diameter: {diameter.toFixed(3)} m</Typography><Slider min={0.02} max={0.3} step={0.001} value={diameter} onChange={(_, value) => setDiameter(value as number)} aria-label="Diameter" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2">Mass: {mass.toFixed(2)} kg</Typography><Slider min={0.02} max={10} step={0.01} value={mass} onChange={(_, value) => setMass(value as number)} aria-label="Mass" /></Box></Stack>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center"><FormControlLabel control={<Checkbox checked={airResistance} onChange={(event) => setAirResistance(event.target.checked)} />} label={`Air resistance (Cd ${dragCoefficient.toFixed(2)})`} /><Chip label={`Target: ${target.toFixed(1)} m`} /><Button variant="outlined" onClick={() => setDisplayMode((value) => value === 'Total' ? 'Components' : 'Total')}>{displayMode} velocity</Button><FormControlLabel control={<Checkbox checked={velocityVectors} onChange={(event) => setVelocityVectors(event.target.checked)} />} label="Velocity vectors" /><FormControlLabel control={<Checkbox checked={accelerationVectors} onChange={(event) => setAccelerationVectors(event.target.checked)} />} label="Acceleration vectors" /><FormControlLabel control={<Checkbox checked={forceVectors} onChange={(event) => setForceVectors(event.target.checked)} />} label="Force vectors" /></Stack>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={fire}>Fire</Button><Button variant={running ? 'contained' : 'outlined'} onClick={() => setRunning((value) => !value)} startIcon={running ? <PauseIcon /> : <PlayArrowIcon />}>{running ? 'Pause' : 'Play'}</Button><Button variant="outlined" onClick={step}>Step</Button><Button variant="outlined" onClick={() => setSpeedMode((value) => value === 'Normal' ? 'Slow' : 'Normal')}>{speedMode} speed</Button><Button variant="outlined" onClick={() => { trajectoryRef.current = []; setTrajectory([]) }} startIcon={<DeleteSweepIcon />}>Eraser</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Chip label={`Time: ${shot.time.toFixed(2)} s`} /><Chip label={`Range: ${shot.landed ? shot.x.toFixed(2) : '—'} m`} /><Chip label={`Max height: ${shot.maxHeight.toFixed(2)} m`} /><Chip label={`Drag: ${airResistance ? 'on' : 'off'}`} /></Stack>
    <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'targetFlash .7s ease-in-out infinite alternate' : 'none', '@keyframes targetFlash': { from: { backgroundColor: 'background.paper' }, to: { backgroundColor: '#dcfce7' } } }}><Typography sx={{ fontWeight: 800 }}>Challenge: Hit the target using an initial speed of 18 m/s.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! The launch angle and real trajectory placed the projectile on the target.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>{shot.landed && shot.x < target ? 'Try raising the launch angle.' : 'Try lowering the launch angle.'}</Typography>}</Paper>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={feedback !== 'correct'} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button></Stack>
  </Stack></Paper>
}

export default ProjectileMotionActivity
