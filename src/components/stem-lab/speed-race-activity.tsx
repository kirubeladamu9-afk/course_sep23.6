import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useEffect, useState } from 'react'

export type SpeedRaceProps = { onComplete?: () => void }
type Racer = { id: 'rabbit' | 'turtle' | 'car' | 'runner'; name: string; icon: string; color: string }
type Round = { racers: [Racer, Racer]; speeds: Partial<Record<Racer['id'], number>> }
type RacePhase = 'ready' | 'running' | 'finished'
type Outcome = 'correct' | 'incorrect' | null

const racerPool: Racer[] = [
  { id: 'rabbit', name: 'Rabbit', icon: '🐇', color: '#d66a9b' },
  { id: 'turtle', name: 'Turtle', icon: '🐢', color: '#4d9b77' },
  { id: 'car', name: 'Blue car', icon: '🚙', color: '#4f82d5' },
  { id: 'runner', name: 'Runner', icon: '🏃', color: '#e28a3d' },
]

const randomRound = (): Round => {
  const racers = [...racerPool].sort(() => Math.random() - .5).slice(0, 2) as [Racer, Racer]
  const firstSpeed = 4 + Math.floor(Math.random() * 6)
  const secondSpeed = 4 + Math.floor(Math.random() * 6)
  return { racers, speeds: { [racers[0].id]: firstSpeed, [racers[1].id]: secondSpeed } }
}

const SpeedRaceActivity: FC<SpeedRaceProps> = ({ onComplete }) => {
  const [round, setRound] = useState<Round>(randomRound)
  const [prediction, setPrediction] = useState<Racer['id'] | null>(null)
  const [positions, setPositions] = useState<Partial<Record<Racer['id'], number>>>({})
  const [phase, setPhase] = useState<RacePhase>('ready')
  const [outcome, setOutcome] = useState<Outcome>(null)
  const [correctRounds, setCorrectRounds] = useState(0)
  const [activityChecked, setActivityChecked] = useState(false)
  const [feedbackVersion, setFeedbackVersion] = useState(0)

  useEffect(() => {
    if (phase !== 'running') return undefined
    const timer = window.setInterval(() => {
      setPositions((current) => {
        const next = { ...current }
        round.racers.forEach((racer) => { next[racer.id] = Math.min(100, (next[racer.id] ?? 0) + (round.speeds[racer.id] ?? 0) * .45) })
        if (round.racers.every((racer) => (next[racer.id] ?? 0) >= 100)) setPhase('finished')
        return next
      })
    }, 100)
    return () => window.clearInterval(timer)
  }, [phase, round])

  useEffect(() => {
    if (phase !== 'finished' || outcome !== null) return
    const winner = round.racers.reduce((current, racer) => (round.speeds[racer.id] ?? 0) > (round.speeds[current.id] ?? 0) ? racer : current, round.racers[0])
    const isCorrect = prediction === winner.id
    setOutcome(isCorrect ? 'correct' : 'incorrect')
    if (isCorrect) setCorrectRounds((count) => count + 1)
    setFeedbackVersion((version) => version + 1)
  }, [outcome, phase, prediction, round])

  const winner = round.racers.reduce((current, racer) => (round.speeds[racer.id] ?? 0) > (round.speeds[current.id] ?? 0) ? racer : current, round.racers[0])
  const startRace = () => { setPositions({ [round.racers[0].id]: 0, [round.racers[1].id]: 0 }); setOutcome(null); setPhase('running') }
  const nextRound = () => { setRound(randomRound()); setPrediction(null); setPositions({}); setOutcome(null); setPhase('ready'); setFeedbackVersion((version) => version + 1) }
  const reset = () => { setCorrectRounds(0); setActivityChecked(false); nextRound() }
  const completed = activityChecked

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Speed Race</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Compare the speeds of moving objects.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}><Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack><Typography variant="body2" sx={{ fontWeight: 800 }}>Correct races: {correctRounds} of 3</Typography></Stack>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>Predict the winner</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Tap one racer before the race starts, then watch their actual speeds.</Typography><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>{round.racers.map((racer) => <Button key={racer.id} variant={prediction === racer.id ? 'contained' : 'outlined'} disabled={phase !== 'ready'} onClick={() => setPrediction(racer.id)}>{racer.icon} {racer.name}</Button>)}</Stack></Paper>
      <Box sx={{ position: 'relative', p: { xs: 1.5, sm: 2.5 }, borderRadius: 2, border: 1, borderColor: 'divider', backgroundColor: '#eef4fa', overflow: 'hidden' }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>START</Typography><Box sx={{ position: 'absolute', right: 20, top: 10 }}><Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>FINISH</Typography></Box>
        <Stack spacing={2} sx={{ mt: 1.5 }}>{round.racers.map((racer) => { const speed = round.speeds[racer.id] ?? 0; const position = positions[racer.id] ?? 0; const isWinner = phase === 'finished' && winner.id === racer.id; return <Box key={`${racer.id}-${feedbackVersion}`}><Stack direction="row" alignItems="center" spacing={1}><Typography sx={{ width: { xs: 88, sm: 118 }, fontWeight: 800 }}>{racer.icon} {racer.name}</Typography><Box sx={{ flex: 1, height: 44, position: 'relative', borderBottom: '4px solid #829bb4', backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 9.5%, rgba(79, 140, 255, .14) 9.5% 10%)' }}><Box sx={{ position: 'absolute', left: `${position}%`, bottom: 3, transform: 'translateX(-50%)', transition: 'left .1s linear', fontSize: 28, lineHeight: 1, filter: isWinner && outcome === 'correct' ? 'drop-shadow(0 0 8px #f6b73c)' : 'none', animation: isWinner && outcome === 'correct' ? 'winnerBounce .55s ease-in-out infinite alternate' : 'none', '@keyframes winnerBounce': { from: { transform: 'translateX(-50%) translateY(0) rotate(-8deg)' }, to: { transform: 'translateX(-50%) translateY(-7px) rotate(8deg)' } } }}>{racer.icon}</Box></Box><Typography variant="body2" sx={{ width: { xs: 72, sm: 94 }, textAlign: 'right', fontWeight: 800 }}>Speed: {speed}</Typography></Stack></Box> })}</Stack>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}><Typography variant="body2" color="text.secondary">Each round uses new racers and generated speeds.</Typography><Button variant="contained" onClick={startRace} disabled={prediction === null || phase !== 'ready'}>Start Race</Button></Stack>
      {phase === 'finished' && <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: outcome === 'correct' ? 'success.main' : 'warning.main', animation: outcome === 'incorrect' ? 'raceShake .45s ease-in-out' : 'none', '@keyframes raceShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } } }}><Typography role="status" color={outcome === 'correct' ? 'success.main' : 'warning.main'} sx={{ fontWeight: 800 }}>{outcome === 'correct' ? `Great guess! The ${winner.name.toLowerCase()} was faster.` : `Not quite — the ${winner.name.toLowerCase()} was faster at ${(round.speeds[winner.id] ?? 0).toFixed(0)} speed units.`}</Typography><Button variant="text" size="small" onClick={nextRound} sx={{ mt: 1 }}>Next race</Button></Paper>}
      {completed && <Typography role="status" color="success.main" sx={{ fontWeight: 800 }}>Three correct predictions! You compared the racers&apos; speeds.</Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={() => setActivityChecked(true)} disabled={correctRounds < 3}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default SpeedRaceActivity
