import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type DragEvent, type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Mode = 'fill' | 'rule' | 'nth' | 'series'
type Round = { mode: Mode; terms: number[]; missing: number[]; choices: number[]; rule: string; formula: string; targetN?: number; sum?: number; prompt: string }
type Props = { topic: MathTopic; onComplete?: () => void }
const rounds: Round[] = [
  { mode: 'fill', terms: [3, 7, 11, 15, 19], missing: [2, 3], choices: [11, 15, 12, 16], rule: 'Each term adds 4.', formula: 'aₙ = 4n − 1', prompt: 'Arrange the terms to complete the arithmetic sequence.' },
  { mode: 'fill', terms: [2, 6, 18, 54, 162], missing: [1, 3], choices: [6, 54, 8, 56], rule: 'Each term multiplies by 3.', formula: 'aₙ = 2 × 3ⁿ⁻¹', prompt: 'Fill the missing terms in this geometric sequence.' },
  { mode: 'rule', terms: [5, 9, 13, 17, 21], missing: [], choices: [], rule: 'add 4', formula: 'aₙ = 4n + 1', prompt: 'Study the terms and identify the rule.' },
  { mode: 'nth', terms: [2, 5, 8, 11, 14], missing: [], choices: [], rule: 'add 3', formula: 'aₙ = 3n − 1', targetN: 20, prompt: 'Complete the nth-term formula and predict the 20th term.' },
  { mode: 'series', terms: [2, 5, 8, 11], missing: [], choices: [], rule: 'add 3', formula: 'S₄ = 26', sum: 26, prompt: 'Find the sum of the first four terms.' },
  { mode: 'fill', terms: [1, 1, 2, 3, 5, 8], missing: [3, 5], choices: [2, 5, 4, 9], rule: 'Add the previous two terms.', formula: 'Fibonacci pattern', prompt: 'Complete this Fibonacci-style sequence.' },
]

const SequenceBuilderActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const [slots, setSlots] = useState<(number | null)[]>(() => config.terms.map((term, index) => config.missing.includes(index) ? null : term))
  const [selected, setSelected] = useState<number | null>(null)
  const [ruleAnswer, setRuleAnswer] = useState('')
  const [formulaAnswer, setFormulaAnswer] = useState('')
  const [numberAnswer, setNumberAnswer] = useState('')
  const [played, setPlayed] = useState(false)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const allFilled = slots.every((slot) => slot !== null)
  const fillCorrect = allFilled && slots.every((slot, index) => slot === config.terms[index])
  const answerCorrect = config.mode === 'fill' ? fillCorrect : config.mode === 'rule' ? ruleAnswer.trim().toLowerCase() === config.rule : config.mode === 'nth' ? formulaAnswer.trim().replace(/\s/g, '') === config.formula.replace(/\s/g, '') && Number(numberAnswer) === config.terms[0] + (config.targetN! - 1) * 3 : Number(numberAnswer) === config.sum
  const correct = checked && answerCorrect
  const graphValues = played ? [...config.terms, config.mode === 'fill' ? config.terms[config.terms.length - 1] + 4 : config.terms[config.terms.length - 1]] : config.terms

  const place = (index: number, value: number) => { setSlots((current) => current.map((slot, slotIndex) => slotIndex === index ? value : slot)); setSelected(null); setChecked(false); setCompleted(false) }
  const dropSlot = (event: DragEvent<HTMLDivElement>, index: number) => { event.preventDefault(); const value = Number(event.dataTransfer.getData('text/sequence-value')); if (Number.isFinite(value)) place(index, value) }
  const reset = () => { setSlots(config.terms.map((term, index) => config.missing.includes(index) ? null : term)); setSelected(null); setRuleAnswer(''); setFormulaAnswer(''); setNumberAnswer(''); setPlayed(false); setChecked(false); setCompleted(false) }
  const nextRound = () => { const next = rounds[(round + 1) % rounds.length]; setRound((current) => current + 1); setSlots(next.terms.map((term, index) => next.missing.includes(index) ? null : term)); setSelected(null); setRuleAnswer(''); setFormulaAnswer(''); setNumberAnswer(''); setPlayed(false); setChecked(false); setCompleted(false) }
  const play = () => { setPlayed(false); window.setTimeout(() => setPlayed(true), 100) }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{config.prompt}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Terms animate forward when you press Play. Look for the difference, ratio, or recurrence rule.</Typography>
      <Stack direction="row" spacing={{ xs: 1, sm: 2 }} justifyContent="center" alignItems="center" flexWrap="wrap" sx={{ p: 2, borderBottom: 4, borderColor: '#9a6732', background: 'repeating-linear-gradient(90deg, transparent 0 30px, rgba(154,103,50,.2) 31px 34px)' }}>{slots.map((slot, index) => <Box key={index} onClick={() => selected !== null && place(index, selected)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropSlot(event, index)} sx={{ width: { xs: 56, sm: 76 }, height: { xs: 56, sm: 76 }, display: 'grid', placeItems: 'center', border: slot === null ? 3 : 2, borderStyle: slot === null ? 'dashed' : 'solid', borderColor: correct ? 'success.main' : 'primary.main', borderRadius: 1.5, backgroundColor: slot === null ? 'background.default' : 'primary.light', cursor: 'pointer', animation: played ? 'termBounce .45s ease both' : 'none', animationDelay: `${index * .1}s`, '@keyframes termBounce': { from: { transform: 'translateY(-8px)', opacity: .4 }, to: { transform: 'translateY(0)', opacity: 1 } } }}><Typography variant="h6" sx={{ fontWeight: 900 }}>{slot === null ? '?' : slot}</Typography><Typography variant="caption" sx={{ position: 'absolute', transform: 'translateY(37px)' }}>term {index + 1}</Typography></Box>)}</Stack>
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Button variant="outlined" onClick={play}>Play</Button>{config.mode === 'fill' && config.choices.map((choice, index) => <Button key={`${choice}-${index}`} draggable onDragStart={(event) => event.dataTransfer.setData('text/sequence-value', String(choice))} onClick={() => setSelected(choice)} variant={selected === choice ? 'contained' : 'outlined'}>{choice}</Button>)}</Stack>
      <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle2">Term graph</Typography><Box sx={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 1, borderLeft: 2, borderBottom: 2, borderColor: 'text.secondary', mt: 1 }}>{graphValues.map((value, index) => <Box key={`${value}-${index}`} sx={{ flex: 1, height: `${Math.min(90, Math.max(8, value * 3))}px`, backgroundColor: 'primary.main', transition: 'height .35s ease', animation: played ? 'termGrow .5s ease both' : 'none', animationDelay: `${index * .1}s`, '@keyframes termGrow': { from: { height: 0 }, to: { height: `${Math.min(90, Math.max(8, value * 3))}px` } } }} />)}</Box><Typography variant="caption" color="text.secondary">x-axis: term number · y-axis: value</Typography></Box>
      {config.mode === 'rule' && <TextField label="Rule (for example: add 4)" value={ruleAnswer} onChange={(event) => { setRuleAnswer(event.target.value); setChecked(false) }} placeholder="add 4" />}
      {config.mode === 'nth' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><TextField label="nth-term formula" value={formulaAnswer} onChange={(event) => { setFormulaAnswer(event.target.value); setChecked(false) }} placeholder="3n − 1" /><TextField label={`Term ${config.targetN}`} type="number" value={numberAnswer} onChange={(event) => { setNumberAnswer(event.target.value); setChecked(false) }} placeholder="?" /></Stack>}
      {config.mode === 'series' && <TextField label="Sum of the first 4 terms" type="number" value={numberAnswer} onChange={(event) => { setNumberAnswer(event.target.value); setChecked(false) }} placeholder="?" />}
      <Typography variant="body2" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>{config.mode === 'series' ? `${config.terms.join(' + ')} = ?` : config.mode === 'nth' ? `aₙ = ? · term ${config.targetN} = ?` : config.rule}</Typography>
      <Stack direction="row" spacing={1} justifyContent="center"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)} disabled={config.mode === 'fill' ? !allFilled : config.mode === 'rule' ? !ruleAnswer : config.mode === 'nth' ? !formulaAnswer || !numberAnswer : !numberAnswer}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! ${config.rule}` : config.mode === 'fill' ? 'Subtract the first term from the second — is the gap the same every time?' : 'Study the sequence and try the rule again.'}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default SequenceBuilderActivity
