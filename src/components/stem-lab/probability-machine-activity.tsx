import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Color = 'red' | 'blue' | 'green'
type BagConfig = { counts: Record<Color, number>; target: Color; label: string }
type Props = { topic: MathTopic; onComplete?: () => void }

const rounds: BagConfig[] = [
  { counts: { red: 5, blue: 3, green: 2 }, target: 'red', label: 'Predict the chance of drawing red, then test it.' },
  { counts: { red: 2, blue: 5, green: 3 }, target: 'blue', label: 'Predict the chance of drawing blue, then test it.' },
  { counts: { red: 4, blue: 4, green: 2 }, target: 'green', label: 'Predict the chance of drawing green, then test it.' },
]
const colors: Color[] = ['red', 'blue', 'green']
const colorHex: Record<Color, string> = { red: '#e94f64', blue: '#4f8cff', green: '#25a879' }
const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a
const parseProbability = (value: string) => { const fraction = value.trim().match(/^(\d+)\s*\/\s*(\d+)$/); if (fraction) return Number(fraction[1]) / Number(fraction[2]); const decimal = Number(value); return Number.isFinite(decimal) ? decimal : NaN }

const ProbabilityMachineActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const [prediction, setPrediction] = useState('')
  const [draws, setDraws] = useState<Record<Color, number>>({ red: 0, blue: 0, green: 0 })
  const [lastDraw, setLastDraw] = useState<Color | null>(null)
  const [shaking, setShaking] = useState(false)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const totalBalls = useMemo(() => colors.reduce((sum, color) => sum + config.counts[color], 0), [config])
  const totalDraws = colors.reduce((sum, color) => sum + draws[color], 0)
  const theoreticalNumerator = config.counts[config.target]
  const divisor = gcd(theoreticalNumerator, totalBalls)
  const theoreticalFraction = `${theoreticalNumerator}/${totalBalls}`
  const simplifiedFraction = `${theoreticalNumerator / divisor}/${totalBalls / divisor}`
  const targetExperimentalPercent = totalDraws ? Math.round(draws[config.target] / totalDraws * 100) : 0
  const predictionValue = parseProbability(prediction)
  const predictionCorrect = prediction !== '' && predictionValue === theoreticalNumerator / totalBalls
  const correct = checked && totalDraws >= 20 && predictionCorrect

  const randomColor = () => { const roll = Math.random() * totalBalls; let cumulative = 0; return colors.find((color) => { cumulative += config.counts[color]; return roll < cumulative }) ?? config.target }
  const drawMany = (amount: number) => {
    const additions: Record<Color, number> = { red: 0, blue: 0, green: 0 }
    let latest: Color = config.target
    for (let index = 0; index < amount; index += 1) { latest = randomColor(); additions[latest] += 1 }
    setDraws((current) => ({ red: current.red + additions.red, blue: current.blue + additions.blue, green: current.green + additions.green }))
    setLastDraw(latest)
    setShaking(true)
    setChecked(false)
    setCompleted(false)
    window.setTimeout(() => setShaking(false), 700)
  }
  const reset = () => { setPrediction(''); setDraws({ red: 0, blue: 0, green: 0 }); setLastDraw(null); setShaking(false); setChecked(false); setCompleted(false) }
  const nextRound = () => { setRound((current) => current + 1); reset() }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>The bag has {config.counts.red} red, {config.counts.blue} blue, and {config.counts.green} green balls.</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>{config.label}</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
        <Box sx={{ position: 'relative', width: 180, height: 170, display: 'grid', placeItems: 'end center' }}>
          <Box sx={{ position: 'absolute', top: 0, width: 105, height: 70, border: 5, borderBottom: 0, borderColor: '#9a6732', borderRadius: '50% 50% 0 0', backgroundColor: '#e5b46a' }} />
          <Box aria-label="Bag of colored balls" sx={{ position: 'relative', width: 160, height: 130, borderRadius: '45% 45% 25% 25%', backgroundColor: '#c98a4b', border: 5, borderColor: '#8c552c', p: 2, display: 'flex', alignContent: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: .75, animation: shaking ? 'bagShake .35s ease infinite alternate' : 'none', '@keyframes bagShake': { from: { transform: 'rotate(-3deg)' }, to: { transform: 'rotate(3deg)' } } }}>{colors.flatMap((color) => Array.from({ length: config.counts[color] }, (_, index) => <Box key={`${color}-${index}`} sx={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: colorHex[color], border: '2px solid rgba(255,255,255,.6)', boxShadow: 'inset -3px -3px 0 rgba(0,0,0,.16)' }} />))}</Box>
          {lastDraw && <Box aria-label={`Last drawn ${lastDraw} ball`} sx={{ position: 'absolute', top: 12, right: 3, width: 32, height: 32, borderRadius: '50%', backgroundColor: colorHex[lastDraw], border: 2, borderColor: 'common.white', animation: 'ballPop .65s ease', '@keyframes ballPop': { from: { transform: 'translateY(32px) scale(.5)', opacity: .3 }, to: { transform: 'translateY(0) scale(1)', opacity: 1 } } }} />}
        </Box>
        <Stack spacing={1} sx={{ minWidth: 220 }}>
          <Typography sx={{ fontWeight: 700 }}>What is P({config.target})?</Typography>
          <TextField label={`Prediction for ${config.target}`} value={prediction} onChange={(event) => { setPrediction(event.target.value); setChecked(false) }} placeholder={`${theoreticalNumerator}/${totalBalls}`} helperText="Enter a fraction, such as 5/10" inputProps={{ 'aria-label': `Prediction probability for ${config.target}` }} />
          <Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="contained" onClick={() => drawMany(1)}>Draw a ball</Button><Button variant="outlined" onClick={() => drawMany(10)}>Draw 10</Button><Button variant="outlined" onClick={() => drawMany(50)}>Draw 50</Button></Stack>
        </Stack>
      </Stack>
      <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.default' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Experimental results</Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 1.5, sm: 3 }, height: 190, pt: 2, borderBottom: 2, borderLeft: 2, borderColor: 'text.secondary' }}>
          {colors.map((color) => { const percent = totalDraws ? Math.round(draws[color] / totalDraws * 100) : 0; const height = totalDraws ? Math.max(draws[color] ? 8 : 0, draws[color] / totalDraws * 145) : 0; return <Box key={color} sx={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: .5 }}><Typography variant="caption">{percent}%</Typography><Box sx={{ width: '70%', height, minHeight: height ? 8 : 0, backgroundColor: colorHex[color], borderRadius: '6px 6px 0 0', transition: 'height .35s ease' }} /><Typography variant="caption" sx={{ fontWeight: 800 }}>{color}</Typography><Typography variant="caption">{draws[color]}</Typography></Box> })}
        </Box>
        <Typography variant="caption" color="text.secondary">y-axis: number drawn · x-axis: color · Total draws: {totalDraws}</Typography>
      </Box>
      <Typography role="status" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>Drawn {config.target}: {draws[config.target]}/{totalDraws || 0} = {targetExperimentalPercent}% (expected {Math.round(theoreticalNumerator / totalBalls * 100)}%)</Typography>
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)} disabled={!totalDraws}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light', animation: correct ? 'probabilityCelebrate .7s ease' : 'none', '@keyframes probabilityCelebrate': { '0%': { transform: 'scale(.98)' }, '60%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } } }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! P(${config.target}) = ${theoreticalFraction} = ${simplifiedFraction}, and your experiment came close at ${targetExperimentalPercent}%` : totalDraws < 20 ? `Draw at least ${20 - totalDraws} more balls before checking.` : predictionCorrect ? `Your experiment is ready, but check that the prediction uses ${theoreticalNumerator} ${config.target} balls out of ${totalBalls}.` : `Count the ${config.target} balls out of all ${totalBalls} balls in the bag.`}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default ProbabilityMachineActivity
