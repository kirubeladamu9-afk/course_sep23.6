import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Props = { topic: MathTopic; onComplete?: () => void }

const PercentageBatteryActivity: FC<Props> = ({ topic, onComplete }) => {
  const targetOptions = [25, 40, 75]
  const [target, setTarget] = useState(topic.target)
  const [shaded, setShaded] = useState<boolean[]>(() => Array(100).fill(false))
  const [painting, setPainting] = useState<boolean | null>(null)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const count = shaded.filter(Boolean).length
  const correct = checked && count === target
  const feedback = count === target ? `Correct! ${count}/100 = ${target}%` : count > target ? `You are ${count - target}% over the target.` : `You are ${target - count}% under the target.`

  const paintCell = (index: number, nextValue?: boolean) => {
    setShaded((current) => current.map((cell, cellIndex) => cellIndex === index ? (nextValue ?? !cell) : cell))
    setChecked(false)
    setCompleted(false)
  }
  const startPainting = (index: number) => {
    const nextValue = !shaded[index]
    setPainting(nextValue)
    paintCell(index, nextValue)
  }
  const reset = () => {
    setShaded(Array(100).fill(false))
    setPainting(null)
    setChecked(false)
    setCompleted(false)
  }
  const nextRound = () => {
    const choices = targetOptions.filter((option) => option !== target)
    setTarget(choices[Math.floor(Math.random() * choices.length)])
    reset()
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5">{topic.activity}</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: .75, width: 'min(100%, 460px)', aspectRatio: '1.18 / 1' }} onPointerUp={() => setPainting(null)} onPointerLeave={() => setPainting(null)}>
          <Box sx={{ flex: 1, height: '82%', p: { xs: 1, sm: 1.5 }, border: 4, borderColor: correct ? 'success.main' : 'text.primary', borderRadius: 2.5, backgroundColor: 'background.default', boxShadow: correct ? '0 0 24px rgba(46, 125, 50, .55)' : 'inset 0 0 0 2px rgba(16, 125, 111, .15)', animation: checked && !correct ? 'batteryShake .45s ease' : 'none', '@keyframes batteryShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
            <Box role="grid" aria-label="100 square percentage grid" sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gridTemplateRows: 'repeat(10, minmax(0, 1fr))', gap: { xs: .35, sm: .55 }, width: '100%', height: '100%' }}>
              {shaded.map((isShaded, index) => <Box key={index} role="gridcell" aria-label={`${index + 1}% square${isShaded ? ', charged' : ''}`} aria-selected={isShaded} onPointerDown={(event) => { event.preventDefault(); startPainting(index) }} onPointerEnter={() => painting !== null && paintCell(index, painting)} sx={{ minWidth: 0, minHeight: 0, aspectRatio: '1 / 1', borderRadius: .7, border: 1, borderColor: isShaded ? 'primary.dark' : 'divider', backgroundColor: isShaded ? 'primary.main' : 'action.hover', cursor: 'crosshair', transition: 'background-color .15s ease, transform .15s ease', animation: isShaded ? 'cellCharge .3s ease' : 'none', '@keyframes cellCharge': { from: { transform: 'scale(.72)', opacity: .35 }, to: { transform: 'scale(1)', opacity: 1 } }, '&:hover': { transform: 'scale(.94)' } }} />)}
            </Box>
          </Box>
          <Box sx={{ width: { xs: 12, sm: 18 }, height: '24%', border: 3, borderLeft: 0, borderColor: correct ? 'success.main' : 'text.primary', borderRadius: '0 5px 5px 0', backgroundColor: correct ? 'success.main' : 'action.hover' }} />
        </Box>
        <Stack spacing={1} sx={{ minWidth: { md: 170 } }}>
          <Typography variant="h4" color={correct ? 'success.main' : 'primary.main'} sx={{ fontWeight: 800 }}>{count}% charged</Typography>
          <Typography variant="h6" sx={{ fontFamily: 'monospace' }}>{count}/100</Typography>
          <Typography variant="body2" color="text.secondary">Target: <strong>{target}%</strong></Typography>
          <Typography variant="body2" color="text.secondary">Click squares, or click and drag to paint. Click a charged square again to empty it.</Typography>
        </Stack>
      </Stack>
      <Stack direction="row" spacing={1} flexWrap="wrap">
        <Button variant="outlined" onClick={reset}>Reset</Button>
        <Button variant="contained" onClick={() => setChecked(true)}>Check Activity</Button>
      </Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light', animation: correct ? 'successPulse .7s ease' : 'none', '@keyframes successPulse': { '0%': { transform: 'scale(.98)' }, '60%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } } }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{feedback}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default PercentageBatteryActivity
