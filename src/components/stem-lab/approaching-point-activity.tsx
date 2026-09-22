import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FC, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type LimitKind = 'removable hole' | 'continuous' | 'jump' | 'infinite' | 'estimate from a table'
type LimitRound = { kind: LimitKind; point: number; limit: number | null; equation: string; evaluate: (x: number) => number }
const rounds: LimitRound[] = [
  { kind: 'removable hole', point: 2, limit: 4, equation: 'f(x) = (x² − 4) ÷ (x − 2)', evaluate: (x) => x + 2 },
  { kind: 'continuous', point: 1, limit: 1, equation: 'f(x) = x²', evaluate: (x) => x ** 2 },
  { kind: 'jump', point: 2, limit: null, equation: 'f(x) = 1 when x < 2; 3 when x ≥ 2', evaluate: (x) => x < 2 ? 1 : 3 },
  { kind: 'infinite', point: 2, limit: null, equation: 'f(x) = 1 ÷ (x − 2)', evaluate: (x) => 1 / (x - 2) },
  { kind: 'estimate from a table', point: 3, limit: 6, equation: 'f(x) = x + 3', evaluate: (x) => x + 3 },
]

const ApproachingPointActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(() => rounds[Math.floor(Math.random() * rounds.length)])
  const [leftDistance, setLeftDistance] = useState(.5)
  const [rightDistance, setRightDistance] = useState(.5)
  const [leftValues, setLeftValues] = useState<Array<{ x: number; y: number }>>([])
  const [rightValues, setRightValues] = useState<Array<{ x: number; y: number }>>([])
  const [answer, setAnswer] = useState('')
  const [choice, setChoice] = useState<'exists' | 'dne' | ''>('')
  const [checked, setChecked] = useState<boolean | null>(null)
  const leftX = round.point - leftDistance
  const rightX = round.point + rightDistance
  const leftValue = round.evaluate(leftX)
  const rightValue = round.evaluate(rightX)
  const record = (side: 'left' | 'right') => {
    if (side === 'left') { const nextDistance = leftDistance / 2; setLeftDistance(nextDistance); setLeftValues((current) => [...current, { x: round.point - nextDistance, y: round.evaluate(round.point - nextDistance) }]) }
    else { const nextDistance = rightDistance / 2; setRightDistance(nextDistance); setRightValues((current) => [...current, { x: round.point + nextDistance, y: round.evaluate(round.point + nextDistance) }]) }
    setChecked(null)
  }
  const creep = () => { record('left'); record('right') }
  const correct = leftValues.length >= 3 && rightValues.length >= 3 && (round.limit === null ? choice === 'dne' : choice === 'exists' && answer.trim() !== '' && Math.abs(Number(answer) - round.limit) <= .05)
  const reset = () => { setLeftDistance(.5); setRightDistance(.5); setLeftValues([]); setRightValues([]); setAnswer(''); setChoice(''); setChecked(null) }
  const next = () => { const nextRound = rounds[Math.floor(Math.random() * rounds.length)]; setRound(nextRound); setLeftDistance(.5); setRightDistance(.5); setLeftValues([]); setRightValues([]); setAnswer(''); setChoice(''); setChecked(null) }
  const minX = round.point - 3
  const maxX = round.point + 3
  const mapX = (value: number) => 38 + ((value - minX) / (maxX - minX)) * 324
  const mapY = (value: number) => 180 - Math.max(-8, Math.min(8, value)) / 16 * 125
  const curvePoints = (side: 'left' | 'right') => Array.from({ length: 60 }, (_, index) => { const x = side === 'left' ? minX + index * 0.05 : round.point + 0.05 + index * 0.05; const y = round.evaluate(x); return Number.isFinite(y) && Math.abs(y) < 20 ? `${mapX(x)},${mapY(y)}` : '' }).filter(Boolean).join(' ')
  const xLabels = Array.from({ length: 7 }, (_, index) => minX + index)
  const statusText = correct ? round.limit === null ? 'Correct! The left and right values do not settle on the same limit.' : `Correct! As x approaches ${round.point}, f(x) approaches ${round.limit}.` : 'Compare the left and right values — do they settle on the same number?'
  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2.25}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box><Stack direction="row" spacing={1} flexWrap="wrap"><Chip label={`${round.kind} round`} color="primary" size="small" />{round.kind === 'infinite' && <Chip label="infinite round" color="secondary" size="small" />}</Stack><Typography variant="h6">Move the marker toward x = {round.point} from both sides. What value does f(x) approach?</Typography><Typography color="text.secondary" sx={{ fontFamily: 'monospace' }}>{round.equation}</Typography><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Box component="svg" viewBox="0 0 400 220" sx={{ width: '100%', height: 280, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`Graph of ${round.equation}`}><defs><pattern id="approach-grid" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M 25 0 L 0 0 0 25" fill="none" stroke="currentColor" opacity=".12" /></pattern></defs><rect width="400" height="220" fill="url(#approach-grid)" /><line x1="38" x2="362" y1={mapY(0)} y2={mapY(0)} stroke="currentColor" opacity=".55" /><line x1={mapX(round.point)} x2={mapX(round.point)} y1="18" y2="198" stroke="#f6a623" strokeDasharray="5 4" /><text x={mapX(round.point) + 5} y="28" fontSize="12" fill="#a86b00">x = {round.point} asymptote</text>{xLabels.map((label) => <g key={label}><line x1={mapX(label)} x2={mapX(label)} y1={mapY(0) - 4} y2={mapY(0) + 4} stroke="currentColor" /><text x={mapX(label)} y={mapY(0) + 18} textAnchor="middle" fontSize="11">{label}</text></g>)}{[-6, -3, 0, 3, 6].map((label) => <g key={label}><line x1="34" x2="42" y1={mapY(label)} y2={mapY(label)} stroke="currentColor" /><text x="29" y={mapY(label) + 4} textAnchor="end" fontSize="11">{label}</text></g>)}<text x="365" y={mapY(0) - 7} fontSize="12">x</text><text x="45" y="18" fontSize="12">y</text><polyline points={curvePoints('left')} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" /><polyline points={curvePoints('right')} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" /><circle cx={mapX(leftX)} cy={mapY(leftValue)} r="7" fill="var(--mui-palette-secondary-main)" /><circle cx={mapX(rightX)} cy={mapY(rightValue)} r="7" fill="var(--mui-palette-secondary-main)" /></Box><Typography variant="body2">Left: x = {leftX.toFixed(3)} → f(x) = {Number.isFinite(leftValue) ? leftValue.toFixed(3) : 'undefined'} · Right: x = {rightX.toFixed(3)} → f(x) = {Number.isFinite(rightValue) ? rightValue.toFixed(3) : 'undefined'}</Typography></Paper><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={() => record('left')}>Approach From Left</Button><Button variant="outlined" onClick={() => record('right')}>Approach From Right</Button><Button variant="outlined" onClick={creep}>Creep Closer</Button></Stack><Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><Paper elevation={0} sx={{ flex: 1, p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="subtitle2">Convergence table</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Box sx={{ flex: 1 }}><Typography variant="caption" color="text.secondary">From left</Typography>{leftValues.map((item, index) => <Typography key={index} variant="body2">{item.x.toFixed(3)} → {item.y.toFixed(3)}</Typography>)}</Box><Box sx={{ flex: 1 }}><Typography variant="caption" color="text.secondary">From right</Typography>{rightValues.map((item, index) => <Typography key={index} variant="body2">{item.x.toFixed(3)} → {item.y.toFixed(3)}</Typography>)}</Box></Stack></Paper>{round.limit !== null && <TextField size="small" label="Proposed limit" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(null) }} />}</Stack><Stack direction="row" spacing={1}><Button variant={choice === 'exists' ? 'contained' : 'outlined'} onClick={() => { setChoice('exists'); setChecked(null) }}>Limit exists</Button><Button variant={choice === 'dne' ? 'contained' : 'outlined'} onClick={() => { setChoice('dne'); setChecked(null) }}>Does not exist</Button></Stack><Stack direction="row" spacing={1}><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)}>Check Activity</Button><Button variant="outlined" onClick={next}>Next Round</Button></Stack>{checked !== null && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'warning.main', backgroundColor: correct ? 'success.light' : 'background.default' }}><Typography color={correct ? 'success.main' : 'warning.main'} sx={{ fontWeight: 700 }}>{statusText}</Typography></Paper>}{correct && <Button variant="contained" onClick={onComplete}>Complete Activity</Button>}</Stack></Paper>
}

export default ApproachingPointActivity
