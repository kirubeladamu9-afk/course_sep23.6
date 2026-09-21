import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type DragEvent, type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type FactorPair = { a: number; b: number; id: string }
type Props = { topic: MathTopic; onComplete?: () => void }

const getFactorPairs = (number: number): FactorPair[] => Array.from({ length: Math.floor(Math.sqrt(number)) }, (_, index) => index + 1).filter((factor) => number % factor === 0).map((factor) => ({ a: factor, b: number / factor, id: `${factor}-${number / factor}` }))

const ArrayVisual: FC<{ pair: FactorPair }> = ({ pair }) => <Box aria-label={`${pair.a} rows of ${pair.b} dots`} sx={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(pair.b, 12)}, 8px)`, gap: .35, justifyContent: 'center', p: .75, minHeight: 34 }}>{Array.from({ length: pair.a * pair.b }, (_, index) => <Box key={index} sx={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: 'secondary.main' }} />)}</Box>

const FactorMachineActivity: FC<Props> = ({ topic, onComplete }) => {
  const options = [12, 18, 24, 30, 36]
  const [target, setTarget] = useState(topic.target)
  const [input, setInput] = useState('')
  const [fed, setFed] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [selected, setSelected] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const pairs = useMemo(() => getFactorPairs(target), [target])
  const correct = fed && checked && selected.length === pairs.length && pairs.every((pair) => selected.includes(pair.id))
  const missing = pairs.filter((pair) => !selected.includes(pair.id))

  const feed = (value: number) => {
    setTarget(value)
    setInput(String(value))
    setFed(true)
    setSpinning(true)
    setSelected([])
    setChecked(false)
    setCompleted(false)
    window.setTimeout(() => setSpinning(false), 850)
  }
  const togglePair = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    setChecked(false)
    setCompleted(false)
  }
  const dropPair = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const id = event.dataTransfer.getData('text/factor-pair')
    if (id && !selected.includes(id)) togglePair(id)
  }
  const reset = () => {
    setInput('')
    setFed(false)
    setSpinning(false)
    setSelected([])
    setChecked(false)
    setCompleted(false)
  }
  const nextRound = () => {
    const choices = options.filter((option) => option !== target)
    setTarget(choices[Math.floor(Math.random() * choices.length)])
    reset()
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Typography variant="h5">{topic.activity}</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography>
      </Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>Find all factor pairs of {target}.</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center" justifyContent="center">
        <TextField label="Number (2–100)" type="number" value={input} onChange={(event) => setInput(event.target.value)} inputProps={{ min: 2, max: 100 }} disabled={completed} />
        <Button variant="contained" onClick={() => { const value = Number(input); if (value >= 2 && value <= 100) feed(value) }} disabled={!input || completed}>Feed the machine</Button>
        <Box draggable={!completed} onDragStart={(event) => event.dataTransfer.setData('text/factor-number', String(target))} onClick={() => feed(target)} role="button" tabIndex={0} aria-label={`Number tile ${target}`} sx={{ px: 2, py: 1.25, borderRadius: 1.5, backgroundColor: 'warning.main', color: 'warning.contrastText', fontWeight: 800, cursor: completed ? 'default' : 'grab' }}>{target}</Box>
      </Stack>
      <Box sx={{ maxWidth: 380, mx: 'auto', width: '100%', textAlign: 'center' }}>
        <Box sx={{ width: 116, height: 50, mx: 'auto', border: 3, borderBottom: 0, borderColor: 'text.primary', borderRadius: '54% 54% 0 0', backgroundColor: 'warning.light', transform: spinning ? 'rotate(-4deg)' : 'none', animation: spinning ? 'machineWhir .25s ease-in-out infinite alternate' : 'none', '@keyframes machineWhir': { from: { transform: 'rotate(-4deg)' }, to: { transform: 'rotate(4deg)' } } }} />
        <Box sx={{ position: 'relative', p: 2, border: 4, borderColor: correct ? 'success.main' : 'text.primary', borderRadius: 2.5, backgroundColor: 'background.default', boxShadow: correct ? '0 0 24px rgba(46, 125, 50, .5)' : 'none', animation: checked && !correct ? 'machineShake .45s ease' : 'none', '@keyframes machineShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
          <Typography sx={{ fontWeight: 800, letterSpacing: 1 }}>FACTOR MACHINE</Typography>
          <Box sx={{ mt: 1, height: 32, borderRadius: 1, backgroundColor: spinning ? 'info.light' : 'action.hover', display: 'grid', placeItems: 'center', color: 'text.secondary' }}>{spinning ? 'Whirring…' : fed ? 'Pairs ready' : 'Feed a number'}</Box>
        </Box>
        <Box sx={{ width: 54, height: 18, mx: 'auto', border: 3, borderTop: 0, borderColor: 'text.primary', borderRadius: '0 0 8px 8px' }} />
      </Box>
      {fed && <><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Pairs popping out</Typography><Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">{pairs.map((pair, index) => <Box key={pair.id} draggable={!completed} onDragStart={(event) => event.dataTransfer.setData('text/factor-pair', pair.id)} onClick={() => togglePair(pair.id)} role="button" tabIndex={0} aria-pressed={selected.includes(pair.id)} sx={{ width: 104, p: .75, border: 2, borderColor: selected.includes(pair.id) ? 'primary.main' : 'divider', borderRadius: 1.5, backgroundColor: selected.includes(pair.id) ? 'primary.light' : 'background.default', cursor: 'pointer', animation: 'pairPop .45s ease both', animationDelay: `${index * .12}s`, '@keyframes pairPop': { from: { opacity: 0, transform: 'translateY(-8px) scale(.9)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } } }}><ArrayVisual pair={pair} /><Typography variant="body2" sx={{ fontWeight: 800 }}>{pair.a} × {pair.b} = {target}</Typography></Box>)}</Stack><Paper elevation={0} onDragOver={(event) => event.preventDefault()} onDrop={dropPair} sx={{ minHeight: 92, p: 1.5, border: 2, borderStyle: 'dashed', borderColor: correct ? 'success.main' : 'divider', backgroundColor: correct ? 'success.light' : 'background.default' }}><Typography variant="subtitle2">Output tray</Typography><Typography variant="caption" color="text.secondary">Tap a pair or drag it here. {selected.length}/{pairs.length} selected.</Typography>{selected.length > 0 && <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>{selected.map((id) => { const pair = pairs.find((item) => item.id === id)!; return <Button key={id} size="small" variant="contained" onClick={() => togglePair(id)}>{pair.a} × {pair.b}</Button> })}</Stack>}</Paper></>}
      <Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)} disabled={!fed}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `All ${pairs.length} factor pairs of ${target} found!` : `${missing.length} pair${missing.length === 1 ? '' : 's'} still missing.`}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default FactorMachineActivity
