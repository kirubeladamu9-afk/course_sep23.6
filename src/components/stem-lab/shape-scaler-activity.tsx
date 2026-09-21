import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, type PointerEvent, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Point = { x: number; y: number }
type ShapeKind = 'triangle' | 'rectangle'
type Round = { type: 'scale' | 'missing' | 'similar' | 'real-world'; kind: ShapeKind; points: Point[]; targetK: number; similar: boolean; prompt: string; unknownSide?: number }
type Props = { topic: MathTopic; onComplete?: () => void }
const rounds: Round[] = [
  { type: 'scale', kind: 'triangle', points: [{ x: 0, y: 0 }, { x: 90, y: 0 }, { x: 30, y: -60 }], targetK: 2, similar: true, prompt: 'Triangle B is similar to Triangle A. Make B twice as tall as A.' },
  { type: 'missing', kind: 'triangle', points: [{ x: 0, y: 0 }, { x: 80, y: 0 }, { x: 25, y: -60 }], targetK: 1.5, similar: true, prompt: 'Triangle B has a side x. Use the ratio to find the missing side.', unknownSide: 80 * 1.5 },
  { type: 'similar', kind: 'rectangle', points: [{ x: 0, y: 0 }, { x: 80, y: 0 }, { x: 80, y: -48 }, { x: 0, y: -48 }], targetK: 2, similar: true, prompt: 'Are these shapes similar? Choose Yes and explain why.' },
  { type: 'real-world', kind: 'rectangle', points: [{ x: 0, y: 0 }, { x: 70, y: 0 }, { x: 70, y: -50 }, { x: 0, y: -50 }], targetK: 3, similar: true, prompt: 'A model is scaled by 3. Find the scale factor for the real object.' },
  { type: 'similar', kind: 'rectangle', points: [{ x: 0, y: 0 }, { x: 90, y: 0 }, { x: 90, y: -42 }, { x: 0, y: -42 }], targetK: 2, similar: false, prompt: 'Are these shapes similar? Compare both angles and side ratios.' },
]
const colors = ['#107d6f', '#e94f64', '#4f8cff', '#f6a623']
const distance = (a: Point, b: Point) => Math.round(Math.hypot(a.x - b.x, a.y - b.y))
const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1)

const ShapeScalerActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const [points, setPoints] = useState<Point[]>(config.points)
  const [scaleFactor, setScaleFactor] = useState(1)
  const [answer, setAnswer] = useState('')
  const [similarAnswer, setSimilarAnswer] = useState<'Yes' | 'No' | ''>('')
  const [reason, setReason] = useState<'equal angles' | 'proportional sides' | 'not proportional sides' | ''>('')
  const [selectedSide, setSelectedSide] = useState<number | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const currentK = config.type === 'scale' ? scaleFactor : config.targetK
  const twin = points.map((point, index) => config.similar ? { x: point.x * currentK, y: point.y * currentK } : { x: point.x * currentK, y: point.y * currentK * (index > 1 ? .8 : 1) })
  const sideLengths = points.map((point, index) => distance(point, points[(index + 1) % points.length]))
  const solution = config.type === 'similar' ? (config.similar ? similarAnswer === 'Yes' && reason === 'proportional sides' : similarAnswer === 'No' && reason === 'not proportional sides') : config.type === 'scale' ? scaleFactor === config.targetK : config.type === 'missing' ? Number(answer) === config.unknownSide : Number(answer) === config.targetK
  const correct = checked && solution
  const setVertex = (event: PointerEvent<SVGSVGElement>) => {
    if (dragging === null) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(130, Math.round(((event.clientX - bounds.left) / bounds.width * 300 - 55) / 10) * 10))
    const y = Math.max(-120, Math.min(0, Math.round(((event.clientY - bounds.top) / bounds.height * 220 - 190) / 10) * 10))
    setPoints((current) => current.map((point, index) => index === dragging ? { x, y } : point))
    setChecked(false)
    setCompleted(false)
  }
  const reset = () => { setPoints(config.points); setScaleFactor(1); setAnswer(''); setSimilarAnswer(''); setReason(''); setSelectedSide(null); setChecked(false); setCompleted(false); setDragging(null) }
  const nextRound = () => { setRound((current) => current + 1); reset() }
  const shapePoints = (values: Point[], offset: number) => values.map((point) => `${offset + point.x},${220 + point.y}`).join(' ')
  const graphLines = Array.from({ length: 16 }, (_, index) => <line key={`v-${index}`} x1={index * 40} x2={index * 40} y1={0} y2={260} stroke="currentColor" opacity=".1" />).concat(Array.from({ length: 7 }, (_, index) => <line key={`h-${index}`} x1={0} x2={600} y1={index * 40} y2={index * 40} stroke="currentColor" opacity=".1" />))
  const labelSide = (values: Point[], offset: number, side: number) => { const first = values[side]; const second = values[(side + 1) % values.length]; return <text x={offset + (first.x + second.x) / 2} y={220 + (first.y + second.y) / 2 - 7} textAnchor="middle" fontSize="13" fontWeight="700" fill={colors[side]}>{format(distance(first, second))}</text> }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{config.prompt}</Typography>
      <Box component="svg" viewBox="0 0 600 260" role="img" aria-label="Two similar shapes on a square grid" onPointerMove={setVertex} onPointerUp={() => setDragging(null)} onPointerLeave={() => setDragging(null)} sx={{ width: '100%', height: 'auto', border: 2, borderColor: correct ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: 'background.default', animation: checked && !correct ? 'scaleShake .45s ease' : 'none', '@keyframes scaleShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>{graphLines}<text x="105" y="24" textAnchor="middle" fontSize="16" fontWeight="800">Shape A</text><text x="430" y="24" textAnchor="middle" fontSize="16" fontWeight="800">Similar twin B</text><polygon points={shapePoints(points, 55)} fill="rgba(16,125,111,.18)" stroke="#107d6f" strokeWidth="4" />{points.map((point, index) => <circle key={`handle-${index}`} cx={55 + point.x} cy={220 + point.y} r="8" fill="#f6a623" stroke="white" strokeWidth="3" onPointerDown={(event) => { event.stopPropagation(); setDragging(index) }} />)}<polygon points={shapePoints(twin, 350)} fill="rgba(79,140,255,.18)" stroke="#4f8cff" strokeWidth="4" style={{ transition: 'all .35s ease' }} />{[points, twin].map((values, shapeIndex) => values.map((point, index) => <g key={`${shapeIndex}-${index}`}><path d={`M ${shapeIndex ? 350 : 55 + point.x} ${220 + point.y} l 9 -9`} stroke={colors[index]} strokeWidth="2" /><text x={(shapeIndex ? 350 : 55) + (point.x + values[(index + 1) % values.length].x) / 2} y={220 + (point.y + values[(index + 1) % values.length].y) / 2 - 7} textAnchor="middle" fontSize="13" fontWeight="700" fill={colors[index]}>{format(distance(point, values[(index + 1) % values.length]))}</text></g>))}{points.map((point, index) => <text key={`arc-a-${index}`} x={55 + point.x + 10} y={220 + point.y - 10} fontSize="16" fill="#7357b8">⌒</text>)}{twin.map((point, index) => <text key={`arc-b-${index}`} x={350 + point.x + 10} y={220 + point.y - 10} fontSize="16" fill="#7357b8">⌒</text>)}</Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center"><Stack sx={{ minWidth: 260 }}><Typography sx={{ fontWeight: 800 }}>Scale factor k = {format(currentK)}</Typography><Slider value={scaleFactor} onChange={(_, value) => { setScaleFactor(Array.isArray(value) ? value[0] : value); setChecked(false) }} min={.5} max={3} step={.5} marks={[{ value: .5, label: '.5' }, { value: 1, label: '1' }, { value: 1.5, label: '1.5' }, { value: 2, label: '2' }, { value: 3, label: '3' }]} aria-label="Scale factor" /><Typography variant="body2">Tap a matching side to highlight both.</Typography></Stack><Stack spacing={.5} sx={{ minWidth: 250 }}>{sideLengths.slice(0, 3).map((length, index) => <Typography key={index} onClick={() => setSelectedSide(index)} sx={{ color: selectedSide === index ? colors[index] : 'text.primary', fontWeight: selectedSide === index ? 800 : 400, cursor: 'pointer' }}>{format(length * currentK)} : {length} = {format(currentK)}</Typography>)}<Typography color="success.main">Angles are equal, sides are proportional</Typography></Stack></Stack>
      {config.type === 'missing' && <TextField label="Missing side x" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false) }} placeholder="?" inputProps={{ inputMode: 'decimal' }} />}{config.type === 'real-world' && <TextField label="Scale factor answer" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false) }} placeholder="?" />}{config.type === 'similar' && <Stack direction="row" spacing={1} justifyContent="center"><Button variant={similarAnswer === 'Yes' ? 'contained' : 'outlined'} onClick={() => setSimilarAnswer('Yes')}>Yes</Button><Button variant={similarAnswer === 'No' ? 'contained' : 'outlined'} onClick={() => setSimilarAnswer('No')}>No</Button><Button variant={reason === 'equal angles' ? 'contained' : 'outlined'} onClick={() => setReason('equal angles')}>Equal angles</Button><Button variant={reason === 'proportional sides' ? 'contained' : 'outlined'} onClick={() => setReason('proportional sides')}>Proportional sides</Button><Button variant={reason === 'not proportional sides' ? 'contained' : 'outlined'} onClick={() => setReason('not proportional sides')}>Not proportional</Button></Stack>}
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{config.type === 'missing' ? 'Divide a side of B by its matching side of A.' : 'Matching angle marks show equal angles; matching side ratios show proportional sides.'}</Typography>
      <Stack direction="row" spacing={1} justifyContent="center"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)} disabled={config.type === 'missing' || config.type === 'real-world' ? !answer : config.type === 'similar' ? !similarAnswer || !reason : false}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! k = ${format(currentK)}, so ${format(sideLengths[0])} × ${format(currentK)} = ${format(sideLengths[0] * currentK)}` : 'Divide a side of B by its matching side of A.'}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default ShapeScalerActivity
