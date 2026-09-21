import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, type PointerEvent, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Round = { type: 'build' | 'find-c' | 'find-b' | 'decimal'; a: number; b: number; givenC?: number }
type Props = { topic: MathTopic; onComplete?: () => void }
const rounds: Round[] = [
  { type: 'build', a: 3, b: 4 },
  { type: 'build', a: 6, b: 8 },
  { type: 'find-c', a: 6, b: 8 },
  { type: 'find-b', a: 5, b: 12, givenC: 13 },
  { type: 'decimal', a: 1, b: 1 },
]
const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1)

const AreaSquare: FC<{ side: number; label: string; color: string; glowing: boolean }> = ({ side, label, color, glowing }) => <Stack spacing={.5} alignItems="center"><Box aria-label={`${label} area square with ${side * side} unit cells`} sx={{ width: 92, height: 92, p: .5, display: 'grid', gridTemplateColumns: `repeat(${Math.min(side, 12)}, 1fr)`, gap: .25, border: 3, borderColor: color, backgroundColor: `${color}22`, boxShadow: glowing ? `0 0 18px ${color}` : 'none', transition: 'box-shadow .35s ease', animation: glowing ? 'areaGlow .7s ease infinite alternate' : 'none', '@keyframes areaGlow': { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.05)' } } }}>{Array.from({ length: side * side }, (_, index) => <Box key={index} sx={{ minWidth: 0, minHeight: 0, backgroundColor: color, opacity: .7 }} />)}</Box><Typography variant="caption" sx={{ fontWeight: 800 }}>{label} = {side * side}</Typography></Stack>

const TriangleBuilderActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const [a, setA] = useState(config.a)
  const [b, setB] = useState(config.b)
  const [answer, setAnswer] = useState('')
  const [dragging, setDragging] = useState<'a' | 'b' | null>(null)
  const [proved, setProved] = useState(false)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const c = Math.sqrt(a * a + b * b)
  const expected = config.type === 'find-c' ? Math.sqrt(config.a * config.a + config.b * config.b) : config.type === 'find-b' ? Math.sqrt((config.givenC ?? 0) ** 2 - config.a ** 2) : config.type === 'decimal' ? Math.sqrt(config.a ** 2 + config.b ** 2) : c
  const answerValue = Number(answer)
  const answerCorrect = config.type === 'build' ? a === config.a && b === config.b : Number.isFinite(answerValue) && Math.abs(answerValue - expected) < (config.type === 'decimal' ? .06 : .01)
  const correct = checked && answerCorrect
  const setFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const localX = (event.clientX - bounds.left) / bounds.width * 500
    const localY = (event.clientY - bounds.top) / bounds.height * 320
    if (dragging === 'a') setA(Math.max(1, Math.min(12, Math.round((localX - 90) / 18))))
    else setB(Math.max(1, Math.min(12, Math.round((270 - localY) / 18))))
    setChecked(false)
    setCompleted(false)
  }
  const reset = () => { setA(config.a); setB(config.b); setAnswer(''); setDragging(null); setProved(false); setChecked(false); setCompleted(false) }
  const nextRound = () => { setRound((current) => current + 1); reset() }
  const instruction = config.type === 'build' ? `Build a right triangle with legs a = ${config.a} and b = ${config.b}.` : config.type === 'find-c' ? `The legs are a = ${config.a} and b = ${config.b}. Find the hypotenuse c.` : config.type === 'find-b' ? `The hypotenuse is c = ${config.givenC}. Find the missing leg b.` : 'Resize the triangle and calculate the hypotenuse to one decimal place.'
  const equation = `${a}² + ${b}² = ${format(c)}² → ${a * a} + ${b * b} = ${Math.round(c * c)}`

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{instruction}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Drag the two leg handles to resize the right triangle. The right angle stays fixed.</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
        <Box component="svg" viewBox="0 0 500 320" role="img" aria-label="Right triangle with draggable leg handles" onPointerMove={setFromPointer} onPointerUp={() => setDragging(null)} onPointerLeave={() => setDragging(null)} sx={{ width: 'min(100%, 540px)', height: 'auto', border: 2, borderColor: correct ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: 'background.default', animation: checked && !correct ? 'triangleShake .45s ease' : 'none', '@keyframes triangleShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}><defs><pattern id="unitGrid" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M 18 0 L 0 0 0 18" fill="none" stroke="rgba(16,125,111,.35)" strokeWidth="1" /></pattern></defs><line x1="90" y1="270" x2="310" y2="270" stroke="#107d6f" strokeWidth="4" /><line x1="90" y1="270" x2="90" y2="54" stroke="#107d6f" strokeWidth="4" /><polygon points="90,270 90,270 90,270" fill="none" /><path d="M 90 252 L 108 252 L 108 270" fill="none" stroke="#212121" strokeWidth="3" /><polygon points={`90,270 ${90 + a * 18},270 90,${270 - b * 18}`} fill="rgba(16,125,111,.16)" stroke="#107d6f" strokeWidth="4" /><text x={90 + a * 9} y="292" textAnchor="middle" fontWeight="700">a = {a}</text><text x="68" y={270 - b * 9} textAnchor="middle" fontWeight="700">b = {b}</text><text x={90 + a * 9} y={220 - b * 9} textAnchor="middle" fontWeight="700">c = {format(c)}</text><circle cx={90 + a * 18} cy="270" r="10" fill="#f6a623" stroke="white" strokeWidth="3" onPointerDown={(event) => { event.stopPropagation(); setDragging('a') }} /><circle cx="90" cy={270 - b * 18} r="10" fill="#f6a623" stroke="white" strokeWidth="3" onPointerDown={(event) => { event.stopPropagation(); setDragging('b') }} /><text x="102" y="248" fontSize="20">90°</text><text x="360" y="44" fontSize="13" fill="#e94f64">c² is the largest square</text></Box>
        <Stack spacing={1} alignItems="center"><AreaSquare side={a} label="a²" color="#107d6f" glowing={correct || proved} /><AreaSquare side={b} label="b²" color="#4f8cff" glowing={correct || proved} /><AreaSquare side={Math.max(1, Math.round(c))} label="c²" color="#e94f64" glowing={correct || proved} /></Stack>
      </Stack>
      <Typography variant="h6" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>{equation}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center" alignItems="center">{config.type !== 'build' && <TextField label={config.type === 'find-b' ? 'Missing b' : 'Missing c'} value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false) }} placeholder="?" inputProps={{ inputMode: 'decimal' }} />}<Button variant="outlined" onClick={() => setProved((current) => !current)}>{proved ? 'Hide proof' : 'Prove it'}</Button><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)} disabled={config.type !== 'build' && !answer}>Check Activity</Button></Stack>
      {proved && <Paper role="note" elevation={0} sx={{ p: 1.5, backgroundColor: 'info.light', animation: 'proofCells .8s ease', '@keyframes proofCells': { from: { transform: 'translateY(5px)', opacity: .5 }, to: { transform: 'translateY(0)', opacity: 1 } } }}><Typography sx={{ fontWeight: 700 }}>The {a * a} cells in a² and the {b * b} cells in b² combine to make the {Math.round(c * c)} cells in c².</Typography></Paper>}
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! ${a}² + ${b}² = ${a * a} + ${b * b} = ${Math.round(c * c)} = ${format(c)}²` : 'Add the areas of the two small squares first – that is c².'}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default TriangleBuilderActivity
