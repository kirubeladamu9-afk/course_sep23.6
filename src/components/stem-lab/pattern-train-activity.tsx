import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Shape = 'circle' | 'triangle' | 'square' | 'star'
type PatternRound = { kind: 'shape' | 'number'; values: (Shape | number)[]; choices: (Shape | number)[]; correct: Shape | number; rule: string; hint: string }
type Props = { topic: MathTopic; onComplete?: () => void }
const shapeColors: Record<Shape, string> = { circle: '#4f8cff', triangle: '#f6a623', square: '#e94f64', star: '#25a879' }
const shapeSymbol: Record<Shape, string> = { circle: '●', triangle: '▲', square: '■', star: '★' }

const makeRound = (index: number): PatternRound => {
  const rounds: PatternRound[] = [
    { kind: 'shape', values: ['circle', 'triangle', 'circle', 'triangle'], choices: ['square', 'circle', 'star', 'triangle'], correct: 'circle', rule: 'The pattern repeats every 2 cars: circle, triangle.', hint: 'Look at which shape comes after the triangle.' },
    { kind: 'shape', values: ['circle', 'circle', 'triangle', 'circle', 'circle', 'triangle'], choices: ['star', 'triangle', 'circle', 'square'], correct: 'circle', rule: 'The pattern repeats every 3 cars: circle, circle, triangle.', hint: 'Find the three-car group and repeat it.' },
    { kind: 'shape', values: ['circle', 'triangle', 'star', 'circle', 'triangle', 'star'], choices: ['square', 'star', 'circle', 'triangle'], correct: 'circle', rule: 'The pattern repeats every 3 cars: circle, triangle, star.', hint: 'Count three cars, then start the same sequence again.' },
    { kind: 'shape', values: [1, 2, 3, 4] as unknown as Shape[], choices: [5, 3, 6, 4] as unknown as Shape[], correct: 5, rule: 'The number of dots grows by 1 each car.', hint: 'Count how many dots are on each car.' },
    { kind: 'number', values: [4, 7, 10, 13], choices: [], correct: 16, rule: 'Add 3 each time.', hint: 'Compare each number with the one before it.' },
    { kind: 'number', values: [2, 4, 8, 16], choices: [], correct: 32, rule: 'Multiply by 2 each time.', hint: 'Each number is twice the previous number.' },
    { kind: 'number', values: [20, 17, 14, 11], choices: [], correct: 8, rule: 'Count down by 3 each time.', hint: 'The numbers get smaller by the same amount.' },
  ]
  return rounds[index % rounds.length]
}

const TrainCar: FC<{ value: Shape | number; index: number; answer?: boolean }> = ({ value, index, answer }) => <Box sx={{ position: 'relative', minWidth: { xs: 62, sm: 78 }, height: { xs: 82, sm: 96 }, border: 3, borderColor: answer ? 'warning.main' : 'text.primary', borderRadius: 1.5, backgroundColor: typeof value === 'number' ? 'secondary.light' : shapeColors[value], display: 'grid', placeItems: 'center', animation: `carRoll .55s ease both`, animationDelay: `${index * .12}s`, '@keyframes carRoll': { from: { opacity: 0, transform: 'translateX(32px)' }, to: { opacity: 1, transform: 'translateX(0)' } } }}><Typography sx={{ fontSize: { xs: 28, sm: 38 }, fontWeight: 900, color: typeof value === 'number' ? 'text.primary' : 'common.white', textShadow: typeof value === 'number' ? 'none' : '1px 2px 0 rgba(0,0,0,.2)' }}>{typeof value === 'number' ? '●'.repeat(value) : shapeSymbol[value]}</Typography><Stack direction="row" spacing={1} sx={{ position: 'absolute', bottom: -13 }}>{[0, 1].map((wheel) => <Box key={wheel} sx={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'text.primary', border: 3, borderColor: 'divider', animation: 'wheelSpin .7s linear infinite', '@keyframes wheelSpin': { to: { transform: 'rotate(360deg)' } } }} />)}</Stack></Box>

const PatternTrainActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const pattern = useMemo(() => makeRound(round), [round])
  const [selected, setSelected] = useState<Shape | number | null>(null)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [numericInput, setNumericInput] = useState('')
  const isNumber = pattern.kind === 'number'
  const correct = checked && selected === pattern.correct
  const choices = isNumber ? [] : pattern.choices
  const choose = (value: Shape | number) => { setSelected(value); setNumericInput(typeof value === 'number' ? String(value) : ''); setChecked(false); setCompleted(false) }
  const reset = () => { setSelected(null); setNumericInput(''); setChecked(false); setCompleted(false) }
  const nextRound = () => { setRound((current) => current + 1); reset() }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>{isNumber ? 'What number belongs in the next car?' : 'Look at the train. What car comes next?'}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{isNumber ? 'Type the missing number and check the rule.' : 'Complete the empty car by tapping or dragging an answer from the tray.'}</Typography>
      <Box sx={{ overflowX: 'auto', p: { xs: 1.5, sm: 2 }, borderBottom: 5, borderColor: '#9a6732', background: 'repeating-linear-gradient(90deg, transparent 0 28px, rgba(154,103,50,.25) 29px 32px)', animation: correct ? 'trainChug .8s ease infinite alternate' : 'none', '@keyframes trainChug': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(8px)' } } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ minWidth: 'max-content', pt: 1.5, pb: 1.5 }}><Box sx={{ minWidth: 82, height: 104, border: 3, borderColor: 'text.primary', borderRadius: '48% 18% 18% 48%', backgroundColor: 'primary.main', display: 'grid', placeItems: 'center', position: 'relative', animation: correct ? 'trainChug .8s ease infinite alternate' : 'none' }}><Typography sx={{ fontSize: 30 }}>🚂</Typography><Stack direction="row" spacing={1} sx={{ position: 'absolute', bottom: -13 }}>{[0, 1].map((wheel) => <Box key={wheel} sx={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: 'text.primary', border: 3, borderColor: 'divider', animation: 'wheelSpin .7s linear infinite', '@keyframes wheelSpin': { to: { transform: 'rotate(360deg)' } } }} />)}</Stack></Box>{pattern.values.map((value, index) => <Box key={`${value}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Typography sx={{ fontSize: 24, color: 'text.secondary' }}>—</Typography><TrainCar value={value} index={index} /></Box>)}<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}><Typography sx={{ fontSize: 24, color: 'text.secondary' }}>—</Typography><Box onClick={() => selected !== null && choose(selected)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const value = choices.find((item) => String(item) === event.dataTransfer.getData('text/pattern-choice')); if (value !== undefined) choose(value) }} sx={{ minWidth: { xs: 62, sm: 78 }, height: { xs: 82, sm: 96 }, border: 3, borderStyle: 'dashed', borderColor: correct ? 'success.main' : 'text.secondary', borderRadius: 1.5, display: 'grid', placeItems: 'center', backgroundColor: correct ? 'success.light' : 'background.default', cursor: selected === null ? 'default' : 'pointer' }}><Typography variant="h3" color="text.secondary">{selected === null ? '?' : typeof selected === 'number' ? selected : shapeSymbol[selected]}</Typography></Box></Box></Stack>
      </Box>
      {isNumber ? <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="center"><TextField label="Missing number" type="number" value={numericInput} onChange={(event) => { setNumericInput(event.target.value); setSelected(event.target.value === '' ? null : Number(event.target.value)); setChecked(false) }} inputProps={{ 'aria-label': 'Missing pattern number' }} /><Typography variant="body2" color="text.secondary">Rule hint: compare neighboring numbers.</Typography></Stack> : <><Typography variant="subtitle1" sx={{ fontWeight: 800, textAlign: 'center' }}>Answer tray</Typography><Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap">{choices.map((choice, index) => <Box key={`${choice}-${index}`} draggable onDragStart={(event) => event.dataTransfer.setData('text/pattern-choice', String(choice))} onClick={() => choose(choice)} role="button" tabIndex={0} aria-label={`Choose ${choice}`} sx={{ cursor: 'grab' }}><TrainCar value={choice} index={index} answer /></Box>)}</Stack></>}
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)} disabled={selected === null}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light', animation: correct ? 'patternCelebrate .7s ease' : 'patternShake .45s ease', '@keyframes patternCelebrate': { '0%': { transform: 'scale(.98)' }, '60%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } }, '@keyframes patternShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! ${pattern.rule}` : pattern.hint}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default PatternTrainActivity
