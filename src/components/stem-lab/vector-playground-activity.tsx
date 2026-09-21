import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, type PointerEvent, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Vector = { x: number; y: number }
type Mode = 'read' | 'build' | 'add' | 'scalar' | 'magnitude' | 'real-world'
type Round = { mode: Mode; u: Vector; v: Vector; target?: Vector; scalar?: number; prompt: string }
type Props = { topic: MathTopic; onComplete?: () => void }
const rounds: Round[] = [
  { mode: 'read', u: { x: 3, y: 2 }, v: { x: -2, y: 1 }, prompt: 'Read vector u from the grid and type its components.' },
  { mode: 'build', u: { x: 1, y: 1 }, v: { x: 2, y: -1 }, target: { x: -2, y: 4 }, prompt: 'Drag vector u to build the target vector ⟨−2, 4⟩.' },
  { mode: 'add', u: { x: 3, y: 2 }, v: { x: 2, y: -1 }, prompt: 'Combine u and v, then enter the resultant components.' },
  { mode: 'scalar', u: { x: 2, y: -1 }, v: { x: 0, y: 0 }, scalar: -1, prompt: 'Scale vector u by −1 and enter the new components.' },
  { mode: 'magnitude', u: { x: 3, y: 4 }, v: { x: 0, y: 0 }, prompt: 'Find the magnitude and direction of vector u.' },
  { mode: 'real-world', u: { x: 4, y: 1 }, v: { x: -1, y: 3 }, prompt: 'A boat velocity and river current combine. Find the resultant.' },
]
const origin = { x: 260, y: 180 }
const scale = 32
const screen = (vector: Vector) => ({ x: origin.x + vector.x * scale, y: origin.y - vector.y * scale })
const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1)
const parsePair = (value: string) => { const match = value.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/); return match ? { x: Number(match[1]), y: Number(match[2]) } : null }

const VectorPlaygroundActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const [u, setU] = useState<Vector>(config.u)
  const [combine, setCombine] = useState(false)
  const [answer, setAnswer] = useState('')
  const [dragging, setDragging] = useState(false)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const v = config.v
  const resultant = config.mode === 'scalar' ? { x: config.u.x * (config.scalar ?? 1), y: config.u.y * (config.scalar ?? 1) } : { x: u.x + v.x, y: u.y + v.y }
  const magnitude = (vector: Vector) => Math.hypot(vector.x, vector.y)
  const angle = (vector: Vector) => (Math.atan2(vector.y, vector.x) * 180 / Math.PI + 360) % 360
  const parsed = config.mode === 'magnitude' ? answer.split(',').map(Number) : parsePair(answer)
  const parsedPoint = Array.isArray(parsed) ? null : parsed
  const parsedMagnitude = Array.isArray(parsed) ? parsed : null
  const correct = checked && (config.mode === 'read' ? parsedPoint !== null && Math.abs(parsedPoint.x - config.u.x) < .01 && Math.abs(parsedPoint.y - config.u.y) < .01 : config.mode === 'build' ? u.x === config.target?.x && u.y === config.target?.y : config.mode === 'magnitude' ? parsedMagnitude !== null && Math.abs(parsedMagnitude[0] - magnitude(u)) < .1 && Math.abs(parsedMagnitude[1] - angle(u)) < 1 : parsedPoint !== null && Math.abs(parsedPoint.x - resultant.x) < .01 && Math.abs(parsedPoint.y - resultant.y) < .01)
  const setTip = (event: PointerEvent<SVGSVGElement>) => { if (!dragging) return; const bounds = event.currentTarget.getBoundingClientRect(); const x = Math.max(-6, Math.min(6, Math.round((((event.clientX - bounds.left) / bounds.width * 520) - origin.x) / scale))); const y = Math.max(-5, Math.min(5, Math.round((origin.y - ((event.clientY - bounds.top) / bounds.height * 360)) / scale))); setU({ x, y }); setChecked(false); setCompleted(false) }
  const reset = () => { setU(config.u); setCombine(false); setAnswer(''); setChecked(false); setCompleted(false); setDragging(false) }
  const nextRound = () => { const next = rounds[(round + 1) % rounds.length]; setRound((current) => current + 1); setU(next.u); setCombine(false); setAnswer(''); setChecked(false); setCompleted(false) }
  const targetText = config.mode === 'build' ? `Target: ⟨${config.target?.x}, ${config.target?.y}⟩` : config.mode === 'scalar' ? `Target: ${config.scalar}u` : config.mode === 'magnitude' ? `|u| and θ are the target.` : 'Use whole-number components.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{config.prompt}</Typography><Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{targetText} Drag the orange tip; it snaps to integer grid points.</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
        <Box component="svg" viewBox="0 0 520 360" role="img" aria-label="Vector coordinate grid" onPointerMove={setTip} onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)} sx={{ width: 'min(100%, 560px)', height: 'auto', border: 2, borderColor: correct ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: 'background.default', animation: checked && !correct ? 'vectorShake .45s ease' : 'none', '@keyframes vectorShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}><defs><marker id="arrowU" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#107d6f" /></marker><marker id="arrowV" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#e94f64" /></marker><marker id="arrowR" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#7357b8" /></marker></defs>{Array.from({ length: 13 }, (_, index) => <line key={`v-${index}`} x1={origin.x + (index - 6) * scale} x2={origin.x + (index - 6) * scale} y1={20} y2={340} stroke="currentColor" opacity=".12" />)}{Array.from({ length: 11 }, (_, index) => <line key={`h-${index}`} x1={20} x2={500} y1={origin.y + (index - 5) * scale} y2={origin.y + (index - 5) * scale} stroke="currentColor" opacity=".12" />)}<line x1="20" x2="500" y1={origin.y} y2={origin.y} stroke="currentColor" strokeWidth="2" /><line x1={origin.x} x2={origin.x} y1="20" y2="340" stroke="currentColor" strokeWidth="2" /><circle cx={origin.x} cy={origin.y} r="4" fill="currentColor" /><text x="485" y={origin.y - 8} fontSize="13">x</text><text x={origin.x + 8} y="28" fontSize="13">y</text>{Array.from({ length: 13 }, (_, index) => <text key={`tx-${index}`} x={origin.x + (index - 6) * scale + 3} y={origin.y + 16} fontSize="10">{index - 6}</text>)}{Array.from({ length: 11 }, (_, index) => <text key={`ty-${index}`} x={origin.x - 20} y={origin.y + (index - 5) * scale + 4} fontSize="10">{5 - index}</text>)}<line x1={origin.x} y1={origin.y} x2={screen(u).x} y2={screen(u).y} stroke="#107d6f" strokeWidth="5" markerEnd="url(#arrowU)" /><line x1={origin.x} y1={origin.y} x2={screen(v).x} y2={screen(v).y} stroke="#e94f64" strokeWidth="5" markerEnd="url(#arrowV)" /><circle cx={screen(u).x} cy={screen(u).y} r="10" fill="#f6a623" onPointerDown={(event) => { event.stopPropagation(); setDragging(true) }} />{combine && config.mode !== 'scalar' && <><line x1={origin.x} y1={origin.y} x2={screen(resultant).x} y2={screen(resultant).y} stroke="#7357b8" strokeWidth="7" markerEnd="url(#arrowR)" /><line x1={screen(u).x} y1={screen(u).y} x2={screen(resultant).x} y2={screen(resultant).y} stroke="#7357b8" strokeDasharray="6 5" opacity=".6" /></>}</Box>
        <Stack spacing={1} sx={{ minWidth: 220 }}><Typography sx={{ color: '#107d6f', fontWeight: 800 }}>u = ⟨{u.x}, {u.y}⟩ · |u| = √{u.x * u.x + u.y * u.y} ≈ {format(magnitude(u))} · θ = {format(angle(u))}°</Typography><Typography sx={{ color: '#e94f64', fontWeight: 800 }}>v = ⟨{v.x}, {v.y}⟩ · |v| ≈ {format(magnitude(v))}</Typography><Button variant={combine ? 'contained' : 'outlined'} onClick={() => setCombine((current) => !current)}>Combine u + v</Button>{combine && <Typography sx={{ color: '#7357b8', fontWeight: 800 }}>⟨{u.x}, {u.y}⟩ + ⟨{v.x}, {v.y}⟩ = ⟨{resultant.x}, {resultant.y}⟩, |R| ≈ {format(magnitude(resultant))}</Typography>}</Stack>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center" alignItems="center">{config.mode === 'magnitude' ? <TextField label="Magnitude, angle" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false) }} placeholder="5, 53.1" /> : config.mode !== 'build' && <TextField label="Answer components (x, y)" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false) }} placeholder="5, 1" />}<Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)} disabled={config.mode === 'build' ? false : !answer}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! The vector result is ⟨${resultant.x}, ${resultant.y}⟩ — add the x-components and y-components.` : 'Add the x-components first, then the y-components.'}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default VectorPlaygroundActivity
