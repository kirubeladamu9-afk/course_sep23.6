import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, type PointerEvent, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Line = { slope: number; intercept: number }
type Point = { x: number; y: number }
type Mode = 'drag' | 'marker' | 'algebra'
type Round = { mode: Mode; target: [Line, Line]; start: [Line, Line] }
type Props = { topic: MathTopic; onComplete?: () => void }
const rounds: Round[] = [
  { mode: 'drag', target: [{ slope: 2, intercept: 1 }, { slope: -1, intercept: 4 }], start: [{ slope: 1, intercept: 0 }, { slope: -1, intercept: 3 }] },
  { mode: 'marker', target: [{ slope: 1, intercept: 2 }, { slope: -2, intercept: 5 }], start: [{ slope: 1, intercept: 2 }, { slope: -2, intercept: 5 }] },
  { mode: 'algebra', target: [{ slope: 3, intercept: -1 }, { slope: -1, intercept: 3 }], start: [{ slope: 3, intercept: -1 }, { slope: -1, intercept: 3 }] },
  { mode: 'drag', target: [{ slope: -2, intercept: 1 }, { slope: 1, intercept: 4 }], start: [{ slope: -1, intercept: 0 }, { slope: 1, intercept: 3 }] },
]
const colors = ['#107d6f', '#e94f64']
const scale = 32
const origin = { x: 200, y: 160 }
const graphPoint = (point: Point) => ({ x: origin.x + point.x * scale, y: origin.y - point.y * scale })
const mathPoint = (x: number, y: number) => ({ x: (x - origin.x) / scale, y: (origin.y - y) / scale })
const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2)
const equationText = (line: Line) => `y = ${line.slope === 1 ? '' : line.slope === -1 ? '−' : line.slope}x ${line.intercept < 0 ? '−' : '+'} ${Math.abs(line.intercept)}`
const intersection = (first: Line, second: Line): Point | 'parallel' | 'coincident' => { if (first.slope === second.slope) return first.intercept === second.intercept ? 'coincident' : 'parallel'; const x = (second.intercept - first.intercept) / (first.slope - second.slope); return { x, y: first.slope * x + first.intercept } }

const LineIntersectionActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const [lines, setLines] = useState<[Line, Line]>(config.start)
  const [marker, setMarker] = useState<Point | null>(null)
  const [answer, setAnswer] = useState('')
  const [dragging, setDragging] = useState<{ line: 0 | 1; handle: 'intercept' | 'slope' } | null>(null)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const solution = useMemo(() => intersection(lines[0], lines[1]), [lines])
  const targetSolution = useMemo(() => intersection(config.target[0], config.target[1]), [config])
  const canDrag = config.mode === 'drag'
  const parsedAnswer = answer.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
  const enteredPoint = parsedAnswer ? { x: Number(parsedAnswer[1]), y: Number(parsedAnswer[2]) } : null
  const pointMatches = (first: Point | null, second: Point | 'parallel' | 'coincident') => first !== null && typeof second === 'object' && Math.abs(first.x - second.x) < .01 && Math.abs(first.y - second.y) < .01
  const lineMatch = lines.every((line, index) => line.slope === config.target[index].slope && line.intercept === config.target[index].intercept)
  const correct = checked && (config.mode === 'drag' ? lineMatch : pointMatches(marker ?? enteredPoint, targetSolution))
  const feedback = typeof solution === 'string' ? solution === 'parallel' ? 'No intersection – the lines are parallel.' : 'Infinitely many solutions.' : solution && !pointMatches(marker ?? enteredPoint, solution) ? 'That point is on one line but not the other.' : 'Adjust the lines or choose the exact meeting point.'

  const setHandle = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const point = mathPoint((event.clientX - bounds.left) / bounds.width * 400, (event.clientY - bounds.top) / bounds.height * 320)
    const snappedX = Math.max(-4, Math.min(4, Math.round(point.x)))
    const snappedY = Math.max(-4, Math.min(4, Math.round(point.y)))
    setLines((current) => current.map((line, index) => { if (index !== dragging.line) return line; return dragging.handle === 'intercept' ? { ...line, intercept: snappedY } : { ...line, slope: Math.max(-3, Math.min(3, snappedY - line.intercept)) } }) as [Line, Line])
    setChecked(false)
    setCompleted(false)
  }
  const reset = () => { setLines(config.start); setMarker(null); setAnswer(''); setChecked(false); setCompleted(false); setDragging(null) }
  const nextRound = () => { setRound((current) => current + 1); reset() }
  const check = () => setChecked(true)
  const instruction = config.mode === 'drag' ? 'Drag each line handle to match the equations, then check the intersection.' : config.mode === 'marker' ? 'Click the intersection or type its coordinate pair.' : 'Solve the two equations and type the intersection coordinate.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>Two lines are shown. Find the point where they meet.</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{instruction}</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
        <Box component="svg" viewBox="0 0 400 320" role="img" aria-label="Coordinate graph with two lines" onPointerMove={setHandle} onPointerUp={() => setDragging(null)} onPointerLeave={() => setDragging(null)} onClick={(event: PointerEvent<SVGSVGElement>) => { if (config.mode === 'drag') return; const bounds = event.currentTarget.getBoundingClientRect(); const point = mathPoint((event.clientX - bounds.left) / bounds.width * 400, (event.clientY - bounds.top) / bounds.height * 320); setMarker({ x: Math.round(point.x), y: Math.round(point.y) }); setChecked(false) }} sx={{ width: 'min(100%, 560px)', height: 'auto', border: 2, borderColor: correct ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: 'background.default', animation: checked && !correct ? 'graphShake .45s ease' : 'none', '@keyframes graphShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
          {Array.from({ length: 9 }, (_, index) => { const coordinate = index - 4; const x = origin.x + coordinate * scale; const y = origin.y - coordinate * scale; return <g key={coordinate}><line x1={x} x2={x} y1={32} y2={288} stroke="currentColor" opacity={coordinate === 0 ? .7 : .14} /><line x1={32} x2={368} y1={y} y2={y} stroke="currentColor" opacity={coordinate === 0 ? .7 : .14} /><text x={x + 3} y={origin.y + 16} fontSize="11">{coordinate}</text><text x={origin.x - 22} y={y + 4} fontSize="11">{coordinate}</text></g> })}
          <line x1={32} x2={368} y1={origin.y} y2={origin.y} stroke="currentColor" strokeWidth="2" /><line x1={origin.x} x2={origin.x} y1={32} y2={288} stroke="currentColor" strokeWidth="2" /><text x="370" y={origin.y - 8} fontSize="13" fontWeight="700">x</text><text x={origin.x + 8} y="28" fontSize="13" fontWeight="700">y</text><circle cx={origin.x} cy={origin.y} r="4" fill="currentColor" /><text x={origin.x + 8} y={origin.y - 8} fontSize="11">(0, 0)</text>
          {lines.map((line, index) => { const p1 = graphPoint({ x: -4, y: line.slope * -4 + line.intercept }); const p2 = graphPoint({ x: 4, y: line.slope * 4 + line.intercept }); const intercept = graphPoint({ x: 0, y: line.intercept }); const slopePoint = graphPoint({ x: 1, y: line.slope + line.intercept }); return <g key={index}><line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke={colors[index]} strokeWidth="5" strokeLinecap="round" /><circle cx={intercept.x} cy={intercept.y} r="9" fill={colors[index]} stroke="white" strokeWidth="3" onPointerDown={(event) => { if (!canDrag) return; event.stopPropagation(); setDragging({ line: index as 0 | 1, handle: 'intercept' }) }} /><circle cx={slopePoint.x} cy={slopePoint.y} r="9" fill={colors[index]} stroke="white" strokeWidth="3" onPointerDown={(event) => { if (!canDrag) return; event.stopPropagation(); setDragging({ line: index as 0 | 1, handle: 'slope' }) }} /></g> })}
          {typeof solution === 'object' && solution.x >= -4 && solution.x <= 4 && solution.y >= -4 && solution.y <= 4 && <circle cx={graphPoint(solution).x} cy={graphPoint(solution).y} r="9" fill={correct ? '#25a879' : '#f6a623'} stroke="white" strokeWidth="3"><animate attributeName="r" values="7;12;7" dur=".8s" repeatCount="indefinite" /></circle>}
          {marker && <circle cx={graphPoint(marker).x} cy={graphPoint(marker).y} r="6" fill="#6b46c1" />}
        </Box>
        <Stack spacing={1} sx={{ minWidth: 230 }}><Typography sx={{ color: colors[0], fontWeight: 800 }}>{equationText(lines[0])}</Typography><Typography sx={{ color: colors[1], fontWeight: 800 }}>{equationText(lines[1])}</Typography><Typography variant="body2" color="text.secondary">{typeof solution === 'string' ? solution === 'parallel' ? 'No intersection – the lines are parallel' : 'Infinitely many solutions' : `Lines meet at (${format(solution.x)}, ${format(solution.y)})`}</Typography>{config.mode !== 'drag' && <TextField label="Answer (x, y)" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false) }} placeholder="1, 3" />}{config.mode === 'drag' && <Typography variant="body2" color="text.secondary">White handles snap to integer grid points.</Typography>}</Stack>
      </Stack>
      <Stack direction="row" spacing={1} justifyContent="center"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={check}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! (${format((targetSolution as Point).x)}, ${format((targetSolution as Point).y)}) satisfies both equations.` : feedback}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default LineIntersectionActivity
