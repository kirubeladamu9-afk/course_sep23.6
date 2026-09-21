import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type DragEvent, type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Mode = 'find-output' | 'find-input' | 'find-rule'
type Rule = { label: string; calculate: (input: number) => number }
type Round = { mode: Mode; rule: Rule; givenInput?: number; target?: number; hint: string }
type Props = { topic: MathTopic; onComplete?: () => void }

type Row = { input: number; output: number }
const rounds: Round[] = [
  { mode: 'find-output', rule: { label: 'x + 3', calculate: (input) => input + 3 }, givenInput: 5, hint: 'Add 3 to the input.' },
  { mode: 'find-input', rule: { label: 'x × 2', calculate: (input) => input * 2 }, target: 12, hint: 'The machine doubles the input. Try an input that is half the target.' },
  { mode: 'find-rule', rule: { label: 'x × 2 + 2', calculate: (input) => input * 2 + 2 }, hint: 'Compare how the output changes when the input changes.' },
  { mode: 'find-output', rule: { label: 'x × −1 + 4', calculate: (input) => input * -1 + 4 }, givenInput: 3, hint: 'Multiply by −1, then add 4.' },
  { mode: 'find-input', rule: { label: 'x × 2 + 2', calculate: (input) => input * 2 + 2 }, target: 12, hint: 'Undo the +2 first, then undo the ×2.' },
]
const format = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')

const FunctionMachineActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const [input, setInput] = useState('')
  const [ruleAnswer, setRuleAnswer] = useState('')
  const [rows, setRows] = useState<Row[]>([])
  const [feeding, setFeeding] = useState(false)
  const [lastOutput, setLastOutput] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const isCorrect = useMemo(() => {
    if (config.mode === 'find-output') return rows.some((row) => row.input === config.givenInput && row.output === config.rule.calculate(config.givenInput!))
    if (config.mode === 'find-input') return rows.some((row) => row.output === config.target)
    return rows.length >= 2 && ruleAnswer.trim() === config.rule.label && rows.every((row) => row.output === config.rule.calculate(row.input))
  }, [config, rows, ruleAnswer])
  const correct = checked && isCorrect
  const feed = (value: number) => {
    if (!Number.isFinite(value)) return
    const output = config.rule.calculate(value)
    setRows((current) => [...current, { input: value, output }])
    setLastOutput(output)
    setFeeding(true)
    setChecked(false)
    setCompleted(false)
    window.setTimeout(() => setFeeding(false), 800)
  }
  const feedInput = () => { const value = Number(input); if (Number.isFinite(value)) feed(value) }
  const dropInput = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); const raw = event.dataTransfer.getData('text/function-input'); if (!raw.trim()) return; const value = Number(raw); if (Number.isFinite(value)) feed(value) }
  const reset = () => { setInput(''); setRuleAnswer(''); setRows([]); setFeeding(false); setLastOutput(null); setChecked(false); setCompleted(false) }
  const nextRound = () => { setRound((current) => current + 1); reset() }
  const goal = config.mode === 'find-output' ? `Feed ${config.givenInput} into the machine and find its output.` : config.mode === 'find-input' ? `Feed numbers into the machine until it outputs ${config.target}.` : 'Feed at least two numbers, study the table, and identify the hidden rule.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{goal}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Type a number or drag the tile into IN. Watch the output pop out.</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
        <Stack spacing={1} alignItems="center"><Box sx={{ width: 90, height: 52, border: 4, borderBottom: 0, borderColor: 'text.primary', borderRadius: '50% 50% 0 0', backgroundColor: 'warning.light', display: 'grid', placeItems: 'center', fontWeight: 900 }}>IN</Box><Box sx={{ width: 245, minHeight: 190, p: 2, border: 5, borderColor: correct ? 'success.main' : 'primary.main', borderRadius: 3, backgroundColor: 'primary.light', boxShadow: correct ? '0 0 24px rgba(46,125,50,.55)' : 'none', animation: feeding ? 'machineShake .25s ease infinite alternate' : 'none', '@keyframes machineShake': { from: { transform: 'rotate(-2deg)' }, to: { transform: 'rotate(2deg)' } } }}><Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 900 }}>FUNCTION MACHINE</Typography><Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mt: 3 }}><Typography sx={{ fontSize: 36 }}>⚙</Typography><Typography sx={{ fontSize: 36, animation: feeding ? 'gearSpin .5s linear infinite' : 'none', '@keyframes gearSpin': { to: { transform: 'rotate(360deg)' } } }}>⚙</Typography></Stack><Typography sx={{ mt: 1, textAlign: 'center', fontFamily: 'monospace', fontWeight: 800 }}>{config.mode === 'find-rule' ? '?' : config.rule.label}</Typography></Box><Box sx={{ width: 70, height: 45, border: 4, borderTop: 0, borderColor: 'text.primary', borderRadius: '0 0 12px 12px', display: 'grid', placeItems: 'center', backgroundColor: 'secondary.light' }}>OUT</Box>{lastOutput !== null && <Box sx={{ px: 2, py: .75, borderRadius: 1.5, backgroundColor: 'success.light', fontWeight: 800, animation: 'outputPop .55s ease', '@keyframes outputPop': { from: { transform: 'translateY(-12px) scale(.7)', opacity: .3 }, to: { transform: 'translateY(0) scale(1)', opacity: 1 } } }}>Output: {format(lastOutput)}</Box>}</Stack>
        <Stack spacing={1} sx={{ minWidth: 220 }}><TextField label="Input number" type="number" value={input} onChange={(event) => setInput(event.target.value)} placeholder="?" inputProps={{ 'aria-label': 'Function machine input' }} /><Stack direction="row" spacing={1}><Button variant="contained" onClick={feedInput} disabled={!input}>Feed in</Button><Box draggable onDragStart={(event) => event.dataTransfer.setData('text/function-input', input)} role="button" tabIndex={0} sx={{ px: 2, py: 1, borderRadius: 1, backgroundColor: 'warning.main', color: 'common.white', fontWeight: 800, cursor: input ? 'grab' : 'default' }}>{input || '?'}</Box></Stack>{config.mode === 'find-rule' && <TextField label="What is the rule?" value={ruleAnswer} onChange={(event) => { setRuleAnswer(event.target.value); setChecked(false) }} placeholder="x × 2 + 2" />}<Typography variant="body2" color="text.secondary">Hint: {config.hint}</Typography></Stack>
      </Stack>
      <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'background.default' }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Input → output table</Typography><Button size="small" onClick={() => setRows([])}>Clear table</Button></Stack>{rows.length ? <Stack spacing={.5} sx={{ mt: 1 }}>{rows.map((row, index) => <Typography key={`${row.input}-${index}`} sx={{ fontFamily: 'monospace' }}>{format(row.input)} → {format(row.output)}</Typography>)}</Stack> : <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No numbers tried yet.</Typography>}</Paper>
      <Stack direction="row" spacing={1} justifyContent="center"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)} disabled={!rows.length}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light', animation: correct ? 'machineCelebrate .7s ease' : 'machineError .45s ease', '@keyframes machineCelebrate': { '0%': { transform: 'scale(.98)' }, '60%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } }, '@keyframes machineError': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? config.mode === 'find-rule' ? `Correct! The rule is ${config.rule.label}.` : `Correct! ${format(config.mode === 'find-input' ? config.target! : config.givenInput!)} is matched by the machine.` : lastOutput !== null && config.mode === 'find-input' ? `That gave ${format(lastOutput)} – the target is ${config.target}, so try another input.` : 'Study the table and try again.'}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default FunctionMachineActivity
