import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useState } from 'react'

type Vector = { x: number; y: number }
type ActiveVector = 'u' | 'v' | null
type Feedback = 'idle' | 'correct' | 'incorrect'
export type VectorPlaygroundPhysicsProps = { onComplete?: () => void }

const origin = { x: 260, y: 180 }
const scale = 24
const gridWidth = 10
const gridHeight = 7
const challengeTargets = [6, 8, 10, 12]
const vectorColors = { u: '#107d6f', v: '#e94f64', resultant: '#7357b8' }

const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const createVector = (x: number, y: number): Vector => ({ x, y })
const magnitude = (vector: Vector) => Math.hypot(vector.x, vector.y)
const direction = (vector: Vector) => (Math.atan2(vector.y, vector.x) * 180 / Math.PI + 360) % 360
const format = (value: number) => value.toFixed(1)
const screenPoint = (vector: Vector) => ({ x: origin.x + vector.x * scale, y: origin.y - vector.y * scale })
const add = (first: Vector, second: Vector): Vector => ({ x: first.x + second.x, y: first.y + second.y })

const VectorPlaygroundPhysicsActivity: FC<VectorPlaygroundPhysicsProps> = ({ onComplete }) => {
  const [u, setU] = useState<Vector>(createVector(4, 2))
  const [v, setV] = useState<Vector>(createVector(2, 4))
  const [challengeTarget, setChallengeTarget] = useState(randomItem(challengeTargets))
  const [activeVector, setActiveVector] = useState<ActiveVector>(null)
  const [combine, setCombine] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [animationKey, setAnimationKey] = useState('initial')

  const resultant = add(u, v)
  const uMagnitude = magnitude(u)
  const vMagnitude = magnitude(v)
  const resultantMagnitude = magnitude(resultant)
  const targetReached = Math.abs(resultantMagnitude - challengeTarget) <= .15
  const completed = feedback === 'correct'
  const uTip = screenPoint(u)
  const vTip = screenPoint(v)
  const resultantTip = screenPoint(resultant)

  const setTip = (event: PointerEvent<SVGSVGElement>) => {
    if (!activeVector) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const pointX = ((event.clientX - bounds.left) / bounds.width) * 520
    const pointY = ((event.clientY - bounds.top) / bounds.height) * 360
    const next = { x: Number(clamp((pointX - origin.x) / scale, -gridWidth, gridWidth).toFixed(1)), y: Number(clamp((origin.y - pointY) / scale, -gridHeight, gridHeight).toFixed(1)) }
    if (activeVector === 'u') setU(next)
    if (activeVector === 'v') setV(next)
    setFeedback('idle')
    setAnimationKey(`${next.x}-${next.y}-${activeVector}`)
  }

  const reset = () => {
    setU(createVector(4, 2))
    setV(createVector(2, 4))
    setChallengeTarget(randomItem(challengeTargets))
    setActiveVector(null)
    setCombine(false)
    setFeedback('idle')
    setAnimationKey(`reset-${Date.now()}`)
  }

  const checkActivity = () => setFeedback(targetReached ? 'correct' : 'incorrect')
  const hint = resultantMagnitude < challengeTarget
    ? 'Hint: Increase one of the vector lengths or point the vectors in a more similar direction.'
    : 'Hint: Shorten one vector or turn the vectors so more of their components cancel.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Vector Playground</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Explore the difference between vectors and scalars.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Core" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Drag either colored tip from the origin to change its length and direction. The grid uses real x and y components to calculate the resultant.</Typography>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'action.hover' }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Build two vectors whose resultant has a magnitude of exactly {challengeTarget}.</Typography>
      </Paper>
      <Box component="svg" key={animationKey} viewBox="0 0 520 360" role="img" aria-label="Coordinate grid with two draggable vectors" onPointerMove={setTip} onPointerUp={() => setActiveVector(null)} onPointerLeave={() => setActiveVector(null)} sx={{ width: '100%', height: { xs: 310, md: 420 }, border: 1, borderColor: feedback === 'correct' ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: 'background.default', touchAction: 'none', '@keyframes gridCelebrate': { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.015)' } }, animation: feedback === 'correct' ? 'gridCelebrate .75s ease' : 'none' }}>
        <defs><marker id="vector-u-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={vectorColors.u} /></marker><marker id="vector-v-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill={vectorColors.v} /></marker><marker id="vector-resultant-arrow" markerWidth="9" markerHeight="9" refX="8" refY="3.5" orient="auto"><path d="M0,0 L0,7 L9,3.5 z" fill={vectorColors.resultant} /></marker><filter id="resultant-glow"><feGaussianBlur stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <text x="18" y="20" fontSize="13" fontWeight="700" fill="#526675">VECTOR COMPONENT GRID</text>
        {Array.from({ length: 21 }, (_, index) => <line key={`vertical-${index}`} x1={origin.x + (index - 10) * scale} x2={origin.x + (index - 10) * scale} y1={12} y2={348} stroke="currentColor" opacity=".12" />)}
        {Array.from({ length: 15 }, (_, index) => <line key={`horizontal-${index}`} x1={20} x2={500} y1={origin.y + (index - 7) * scale} y2={origin.y + (index - 7) * scale} stroke="currentColor" opacity=".12" />)}
        <line x1="20" x2="500" y1={origin.y} y2={origin.y} stroke="currentColor" opacity=".45" />
        <line x1={origin.x} x2={origin.x} y1="12" y2="348" stroke="currentColor" opacity=".45" />
        <text x={origin.x + 6} y={origin.y - 8} fontSize="12" fill="#526675">O (0, 0)</text>
        <line x1={origin.x} y1={origin.y} x2={uTip.x} y2={uTip.y} stroke={vectorColors.u} strokeWidth="4" markerEnd="url(#vector-u-arrow)" />
        <line x1={origin.x} y1={origin.y} x2={vTip.x} y2={vTip.y} stroke={vectorColors.v} strokeWidth="4" markerEnd="url(#vector-v-arrow)" />
        {combine && <line x1={uTip.x} y1={uTip.y} x2={resultantTip.x} y2={resultantTip.y} stroke={vectorColors.v} strokeWidth="3" strokeDasharray="7 5" opacity=".7"><animate attributeName="x1" from={origin.x} to={uTip.x} dur=".6s" fill="freeze" /><animate attributeName="y1" from={origin.y} to={uTip.y} dur=".6s" fill="freeze" /></line>}
        {combine && <line x1={origin.x} y1={origin.y} x2={resultantTip.x} y2={resultantTip.y} stroke={vectorColors.resultant} strokeWidth={feedback === 'correct' ? '7' : '5'} markerEnd="url(#vector-resultant-arrow)" filter={feedback === 'correct' ? 'url(#resultant-glow)' : undefined} />}
        <circle cx={uTip.x} cy={uTip.y} r="8" fill={vectorColors.u} stroke="white" strokeWidth="3" cursor="grab" onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setActiveVector('u') }} />
        <circle cx={vTip.x} cy={vTip.y} r="8" fill={vectorColors.v} stroke="white" strokeWidth="3" cursor="grab" onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setActiveVector('v') }} />
        <text x={uTip.x + 10} y={uTip.y - 10} fontSize="13" fontWeight="700" fill={vectorColors.u}>u</text>
        <text x={vTip.x + 10} y={vTip.y - 10} fontSize="13" fontWeight="700" fill={vectorColors.v}>v</text>
        {feedback === 'correct' && <circle cx={resultantTip.x} cy={resultantTip.y} r="14" fill="none" stroke="#f6c445" strokeWidth="3"><animate attributeName="r" values="8;22;8" dur=".8s" repeatCount="indefinite" /></circle>}
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        <Paper elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: vectorColors.u }}><Typography sx={{ color: vectorColors.u, fontWeight: 800 }}>Vector u</Typography><Typography variant="body2">Components: ⟨{format(u.x)}, {format(u.y)}⟩</Typography><Typography variant="body2">Magnitude: {format(uMagnitude)} units</Typography><Typography variant="body2">Direction: {format(direction(u))}°</Typography></Paper>
        <Paper elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: vectorColors.v }}><Typography sx={{ color: vectorColors.v, fontWeight: 800 }}>Vector v</Typography><Typography variant="body2">Components: ⟨{format(v.x)}, {format(v.y)}⟩</Typography><Typography variant="body2">Magnitude: {format(vMagnitude)} units</Typography><Typography variant="body2">Direction: {format(direction(v))}°</Typography></Paper>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}><ToggleButtonGroup exclusive value={combine ? 'combine' : 'separate'} onChange={(_, next: 'combine' | 'separate' | null) => setCombine(next === 'combine')} aria-label="Vector combination"><ToggleButton value="separate">Show vectors</ToggleButton><ToggleButton value="combine">Combine u + v</ToggleButton></ToggleButtonGroup><Typography variant="caption" color="text.secondary">Combine slides v tail-to-tip and draws the resultant from the origin.</Typography></Stack>
      {combine && <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: vectorColors.resultant, backgroundColor: 'rgba(115,87,184,.08)' }}><Typography sx={{ color: vectorColors.resultant, fontWeight: 800 }}>Resultant R = u + v = ⟨{format(resultant.x)}, {format(resultant.y)}⟩</Typography><Typography variant="body2">Magnitude: {format(resultantMagnitude)} units · Direction: {format(direction(resultant))}°</Typography></Paper>}
      <Paper elevation={0} sx={{ p: 1.5, backgroundColor: 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>Vector vs scalar</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: .75 }}><Typography variant="body2">Speed: {format(uMagnitude)} m/s <Typography component="span" variant="caption">(scalar — no direction)</Typography></Typography><Typography variant="body2">Velocity: {format(uMagnitude)} m/s at {format(direction(u))}° <Typography component="span" variant="caption">(vector — has direction)</Typography></Typography></Stack></Paper>
      {feedback === 'correct' && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: 'success.main' }}><Typography color="success.main" sx={{ fontWeight: 800 }}>Right! Combining the two vectors gives a resultant with magnitude {format(resultantMagnitude)}.</Typography><Typography variant="body2" color="text.secondary">The resultant comes from adding the x-components and y-components independently.</Typography></Paper>}
      {feedback === 'incorrect' && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'warning.main' }}><Typography color="warning.dark" sx={{ fontWeight: 700 }}>{hint}</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={!combine}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default VectorPlaygroundPhysicsActivity
