import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type EquationType = 'one-step' | 'multiple' | 'two-step'
type Equation = { type: EquationType; xCount: number; constant: number; xValue: number }
type Props = { topic: MathTopic; onComplete?: () => void }
const equations: Equation[] = [
  { type: 'one-step', xCount: 1, constant: 3, xValue: 4 },
  { type: 'one-step', xCount: 1, constant: 5, xValue: 3 },
  { type: 'multiple', xCount: 2, constant: 0, xValue: 4 },
  { type: 'two-step', xCount: 2, constant: 3, xValue: 4 },
  { type: 'two-step', xCount: 2, constant: 2, xValue: 5 },
]

const BalanceEquationActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const equation = equations[round % equations.length]
  const rightTotal = equation.xCount * equation.xValue + equation.constant
  const [removedLeft, setRemovedLeft] = useState(0)
  const [removedRight, setRemovedRight] = useState(0)
  const [answer, setAnswer] = useState('')
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [divided, setDivided] = useState(false)
  const leftUnits = equation.constant - removedLeft
  const rightUnits = rightTotal - removedRight
  const xCount = divided ? 1 : equation.xCount
  const isolated = leftUnits === 0 && rightUnits > 0 && (equation.xCount === 1 || divided)
  const splitReady = !divided && equation.xCount > 1 && leftUnits === 0 && rightUnits % equation.xCount === 0
  const remainingX = xCount
  const leftValue = equation.xValue * remainingX + leftUnits
  const rightValue = rightUnits
  const tilt = Math.max(-16, Math.min(16, (rightValue - leftValue) * 2))
  const correct = checked && isolated && Number(answer) === equation.xValue
  const originalExpression = `${equation.xCount === 1 ? '' : equation.xCount}x${equation.constant ? ` + ${equation.constant}` : ''} = ${rightTotal}`
  const liveExpression = xCount === 1 && leftUnits === 0 ? `x = ${rightUnits}` : `${xCount === 1 ? '' : xCount}x${leftUnits ? ` + ${leftUnits}` : ''} = ${rightUnits}`
  const hint = !isolated ? `x is still not alone – remove ${leftUnits} from both sides.` : 'Enter the value of x, then check your answer.'
  const removeLeftWeight = () => { if (leftUnits > 0) { setRemovedLeft((current) => current + 1); setChecked(false); setCompleted(false) } }
  const removeRightWeight = () => { if (rightUnits > 0) { setRemovedRight((current) => current + 1); setChecked(false); setCompleted(false) } }
  const splitEvenly = () => { if (!splitReady) return; setRemovedRight((current) => current + rightUnits - rightUnits / equation.xCount); setDivided(true); setChecked(false); setCompleted(false) }
  const reset = () => { setRemovedLeft(0); setRemovedRight(0); setDivided(false); setAnswer(''); setChecked(false); setCompleted(false) }
  const nextRound = () => { setRound((current) => current + 1); reset() }
  const leftWeights = useMemo(() => Array.from({ length: leftUnits }, (_, index) => index), [leftUnits])
  const rightWeights = useMemo(() => Array.from({ length: rightUnits }, (_, index) => index), [rightUnits])

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>Find x. Remove the same weights from both sides until x is alone.</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Tap weights on either pan to remove them. Do the same operation on both sides.</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
        <Box sx={{ width: 'min(100%, 520px)', height: 255, position: 'relative', p: 2, borderRadius: 2, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}>
          <Box sx={{ position: 'absolute', left: '12%', right: '12%', top: 102, height: 10, borderRadius: 5, backgroundColor: 'primary.main', transform: `rotate(${tilt}deg)`, transformOrigin: 'center', transition: 'transform .45s ease', animation: checked && correct ? 'balanceBounce .55s ease' : 'none', '@keyframes balanceBounce': { '0%, 100%': { transform: `rotate(${tilt}deg)` }, '50%': { transform: `rotate(${tilt}deg) translateY(-6px)` } } }} />
          <Box sx={{ position: 'absolute', left: '47%', top: 108, width: 0, height: 0, borderLeft: '28px solid transparent', borderRight: '28px solid transparent', borderBottom: '76px solid #9a6732' }} />
          <Box sx={{ position: 'absolute', left: '9%', top: 110, width: '23%', height: 76, border: 4, borderTop: 0, borderColor: 'secondary.main', borderRadius: '0 0 50% 50%', transform: `rotate(${tilt}deg)`, transformOrigin: 'top center', transition: 'transform .45s ease', backgroundColor: 'rgba(79,140,255,.12)' }}><Stack direction="row" spacing={.5} justifyContent="center" flexWrap="wrap" sx={{ p: 1 }}>{Array.from({ length: xCount }, (_, index) => <Box key={`x-${index}`} sx={{ width: 26, height: 26, display: 'grid', placeItems: 'center', borderRadius: 1, backgroundColor: 'secondary.main', color: 'common.white', fontWeight: 800 }}>x</Box>)}{leftWeights.map((index) => <Button key={`left-${index}`} size="small" onClick={removeLeftWeight} sx={{ minWidth: 25, width: 25, height: 25, p: 0, borderRadius: '50%', backgroundColor: 'warning.main', color: 'common.white', fontWeight: 800 }}>1</Button>)}</Stack></Box>
          <Box sx={{ position: 'absolute', right: '9%', top: 110, width: '23%', height: 76, border: 4, borderTop: 0, borderColor: 'secondary.main', borderRadius: '0 0 50% 50%', transform: `rotate(${tilt}deg)`, transformOrigin: 'top center', transition: 'transform .45s ease', backgroundColor: 'rgba(79,140,255,.12)' }}><Stack direction="row" spacing={.5} justifyContent="center" flexWrap="wrap" sx={{ p: 1 }}>{rightWeights.map((index) => <Button key={`right-${index}`} size="small" onClick={removeRightWeight} sx={{ minWidth: 25, width: 25, height: 25, p: 0, borderRadius: '50%', backgroundColor: 'warning.main', color: 'common.white', fontWeight: 800 }}>1</Button>)}</Stack></Box>
        </Box>
        <Stack spacing={1} sx={{ minWidth: 210 }}><Typography variant="h5" sx={{ fontFamily: 'monospace', textAlign: 'center' }}>{originalExpression}</Typography><Typography variant="h6" sx={{ fontFamily: 'monospace', textAlign: 'center', color: correct ? 'success.main' : 'primary.main' }}>{liveExpression}</Typography><Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Remove matching unit weights. {splitReady ? 'Then split both sides evenly.' : ''}</Typography>{splitReady && <Button variant="outlined" onClick={splitEvenly}>Split both sides evenly</Button>}<TextField label="Value of x" value={answer} onChange={(event) => { setAnswer(event.target.value); setChecked(false) }} placeholder="?" inputProps={{ inputMode: 'numeric' }} /></Stack>
      </Stack>
      {checked && !correct && <Typography role="status" color="error.main" sx={{ textAlign: 'center', fontWeight: 700 }}>{hint}</Typography>}
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)} disabled={!answer}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light', animation: correct ? 'balanceCelebrate .7s ease' : 'balanceShake .45s ease', '@keyframes balanceCelebrate': { '0%': { transform: 'scale(.98)' }, '60%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } }, '@keyframes balanceShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! x = ${equation.xValue}, because ${equation.xValue} ${equation.constant ? `+ ${equation.constant}` : ''} = ${rightTotal}` : hint}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default BalanceEquationActivity
