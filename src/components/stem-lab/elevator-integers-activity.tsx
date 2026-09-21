import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type DragEvent, type FC, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Round = { start: number; operator: '+' | '−'; amount: number }
type Props = { topic: MathTopic; onComplete?: () => void }
const rounds: Round[] = [
  { start: 3, operator: '+', amount: -5},
  { start: -2, operator: '+', amount: 4},
  { start: -4, operator: '−', amount: -3},
  { start: 2, operator: '+', amount: -6},
  { start: -1, operator: '−', amount: 5},
]
const floors = Array.from({ length: 11 }, (_, index) => index - 5)
const formatFloor = (floor: number) => floor > 0 ? `+${floor}` : String(floor)

const ElevatorIntegersActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const [position, setPosition] = useState(config.start)
  const [step, setStep] = useState(1)
  const [typedFloor, setTypedFloor] = useState('')
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [moving, setMoving] = useState(false)
  const correctAnswer = config.operator === '+' ? config.start + config.amount : config.start - config.amount
  const correct = checked && position === correctAnswer
  const directionHint = position > correctAnswer ? 'You need to go lower than that.' : 'You need to go higher than that.'

  const moveTo = (floor: number) => {
    if (floor < -5 || floor > 5) return
    setPosition(floor)
    setMoving(true)
    setChecked(false)
    setCompleted(false)
    window.setTimeout(() => setMoving(false), 500)
  }
  const moveBy = (amount: number) => moveTo(Math.max(-5, Math.min(5, position + amount)))
  const sendToFloor = () => { const floor = Number(typedFloor); if (Number.isInteger(floor)) moveTo(floor) }
  const dropFloor = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); const floor = Number(event.dataTransfer.getData('text/elevator-floor')); if (Number.isInteger(floor)) moveTo(floor) }
  const reset = () => { setPosition(config.start); setTypedFloor(''); setChecked(false); setCompleted(false); setMoving(false) }
  const nextRound = () => { setRound((current) => current + 1); setPosition(rounds[(round + 1) % rounds.length].start); setTypedFloor(''); setChecked(false); setCompleted(false) }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>The elevator starts on floor {formatFloor(config.start)}. {config.operator === '+' && config.amount < 0 ? `Go down ${Math.abs(config.amount)} floors.` : config.operator === '+' ? `Go up ${config.amount} floors.` : `Subtract ${formatFloor(config.amount)} floors.`}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Solve the expression, then move the elevator to the correct floor.</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
        <Box sx={{ position: 'relative', width: 'min(100%, 400px)', height: 460, p: 1.5, border: 5, borderColor: '#6f7f86', borderRadius: 2, backgroundColor: '#dfe8ea', boxShadow: 'inset 0 0 0 12px #b9c8cc', overflow: 'hidden' }}>
          <Typography sx={{ position: 'absolute', top: 8, left: 12, fontWeight: 800, zIndex: 2 }}>BUILDING A</Typography>
          <Box sx={{ position: 'absolute', top: 42, bottom: 30, left: 78, right: 18, backgroundColor: '#26383f', border: 4, borderColor: '#18262b' }}>{floors.map((floor) => { const row = 5 - floor; return <Box key={floor} onClick={() => moveTo(floor)} onDragOver={(event) => event.preventDefault()} onDrop={dropFloor} sx={{ position: 'absolute', left: 0, right: 0, top: `${row * 10}%`, height: '10%', borderTop: floor === 0 ? 3 : 1, borderColor: floor === 0 ? 'warning.main' : 'rgba(255,255,255,.18)', backgroundColor: floor < 0 ? 'rgba(79, 140, 255, .15)' : 'transparent', cursor: 'pointer' }}><Typography variant="caption" sx={{ position: 'absolute', left: -55, top: 5, width: 48, textAlign: 'right', color: floor === 0 ? 'warning.main' : 'common.white', fontWeight: 800 }}>{formatFloor(floor)}</Typography>{floor === 0 && <Typography variant="caption" sx={{ position: 'absolute', right: 8, top: 4, color: 'warning.main', fontWeight: 800 }}>GROUND</Typography>}</Box> })}<Box draggable onDragStart={(event) => event.dataTransfer.setData('text/elevator-floor', String(position))} aria-label={`Elevator at floor ${position}`} sx={{ position: 'absolute', left: '28%', width: '44%', height: '9%', top: `calc(${(5 - position) * 10}% + .5%)`, border: 4, borderColor: correct ? 'success.main' : '#d5a84c', borderRadius: 1, backgroundColor: correct ? 'success.light' : '#e5b46a', display: 'grid', placeItems: 'center', zIndex: 3, cursor: 'grab', transition: 'top .45s cubic-bezier(.2,.8,.2,1)', boxShadow: correct ? '0 0 18px rgba(46,125,50,.7)' : '0 3px 0 rgba(0,0,0,.25)', animation: moving ? 'elevatorDing .45s ease' : 'none', '@keyframes elevatorDing': { '0%': { transform: 'scale(.96)' }, '60%': { transform: 'scale(1.04)' }, '100%': { transform: 'scale(1)' } } }}><Typography sx={{ fontSize: 24 }}>🧑‍🚀</Typography></Box></Box>
          <Typography variant="caption" sx={{ position: 'absolute', bottom: 7, left: 12, color: 'text.secondary', fontWeight: 700 }}>Basement levels shaded blue</Typography>
        </Box>
        <Stack spacing={1.25} sx={{ minWidth: 220, alignItems: 'center' }}><Typography variant="h5" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{formatFloor(config.start)} {config.operator} ({formatFloor(config.amount)}) = ?</Typography><Typography role="status" sx={{ fontWeight: 800, color: correct ? 'success.main' : 'primary.main' }}>Now at floor {formatFloor(position)}</Typography><Typography variant="body2">Move {step} floor{step === 1 ? '' : 's'} at a time</Typography><Stack direction="row" spacing={1}><Button aria-label="Move elevator up" variant="outlined" onClick={() => moveBy(step)}>↑ Up</Button><Button aria-label="Move elevator down" variant="outlined" onClick={() => moveBy(-step)}>↓ Down</Button></Stack><TextField label="Step size" type="number" value={step} onChange={(event) => setStep(Math.max(1, Math.min(5, Number(event.target.value) || 1)))} inputProps={{ min: 1, max: 5 }} /><Stack direction="row" spacing={1}><TextField label="Go to floor" value={typedFloor} onChange={(event) => setTypedFloor(event.target.value)} placeholder="−2" inputProps={{ 'aria-label': 'Destination floor' }} /><Button variant="outlined" onClick={sendToFloor}>Go</Button></Stack><Typography variant="body2" color="text.secondary">Drag the elevator car or click a labeled floor.</Typography></Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{config.operator === '+' && config.amount < 0 ? `Adding ${formatFloor(config.amount)} means moving down ${Math.abs(config.amount)} floors.` : config.operator === '−' && config.amount < 0 ? `Subtracting ${formatFloor(config.amount)} means moving up ${Math.abs(config.amount)} floors.` : 'Positive moves go up; negative moves go down.'}</Typography>
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! ${formatFloor(config.start)} ${config.operator} (${formatFloor(config.amount)}) = ${formatFloor(correctAnswer)}` : directionHint}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default ElevatorIntegersActivity
