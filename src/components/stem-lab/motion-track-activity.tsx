import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useEffect, useState } from 'react'

export type MotionTrackProps = { onComplete?: () => void }
type MovementType = 'straight-line' | 'back-and-forth' | 'circular'
type Feedback = 'idle' | 'correct' | 'incorrect'

const movementLabels: Record<MovementType, string> = {
  'straight-line': 'Straight-line movement',
  'back-and-forth': 'Back-and-forth movement',
  circular: 'Circular movement',
}

const randomRound = () => ({ target: 16 + Math.floor(Math.random() * 9), movement: (['straight-line', 'back-and-forth', 'circular'] as MovementType[])[Math.floor(Math.random() * 3)] })

const MotionTrackActivity: FC<MotionTrackProps> = ({ onComplete }) => {
  const [round, setRound] = useState(randomRound)
  const [position, setPosition] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)

  useEffect(() => {
    if (velocity === 0) return undefined
    const timer = window.setInterval(() => {
      setPosition((currentPosition) => {
        const nextPosition = currentPosition + velocity * 0.1
        if (round.movement === 'back-and-forth' && nextPosition >= 30) {
          setVelocity(-Math.abs(velocity))
          return 30
        }
        if (round.movement === 'back-and-forth' && nextPosition <= 0) {
          setVelocity(Math.abs(velocity))
          return 0
        }
        if (round.movement === 'circular' && nextPosition > 30) return 0
        return Math.max(0, Math.min(30, nextPosition))
      })
    }, 100)
    return () => window.clearInterval(timer)
  }, [round.movement, velocity])

  const adjustVelocity = (nextVelocity: number) => {
    setVelocity(nextVelocity)
    setFeedback('idle')
  }

  const checkActivity = () => {
    const correct = Math.abs(position - round.target) <= .5 && position <= 30
    setFeedback(correct ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const reset = () => {
    setRound(randomRound())
    setPosition(0)
    setVelocity(0)
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  const difference = Math.abs(position - round.target).toFixed(1)
  const completed = feedback === 'correct' && Math.abs(position - round.target) <= .5
  const carLeft = `${(position / 30) * 100}%`

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Motion Track</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore different types of movement.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between"><Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack><Typography variant="body2" color="text.secondary">Target: {round.target} m</Typography></Stack>
      <Box sx={{ position: 'relative', minHeight: 190, p: { xs: 2, sm: 3 }, borderRadius: 2, backgroundColor: '#e9f3f1', border: 1, borderColor: 'rgba(16, 125, 111, .25)', overflow: 'hidden' }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}><Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.dark' }}>START · 0 m</Typography><Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.dark' }}>FINISH · 30 m</Typography></Stack>
        <Box sx={{ position: 'relative', height: 92, borderBottom: '7px solid #7b9f92', borderRadius: 1, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 9.5%, rgba(16, 125, 111, .18) 9.5% 10%)' }}>
          <Box sx={{ position: 'absolute', left: `${(round.target / 30) * 100}%`, top: -6, bottom: -7, borderLeft: '3px dashed #e5a522' }}><Typography variant="caption" sx={{ position: 'absolute', top: -22, left: 5, whiteSpace: 'nowrap', fontWeight: 800, color: '#936b0b' }}>{round.target} m target</Typography></Box>
          <Box sx={{ position: 'absolute', left: carLeft, bottom: 8, transform: 'translateX(-50%)', transition: 'left .1s linear', animation: feedback === 'correct' ? 'carVictory .7s ease-in-out infinite alternate' : 'none', '@keyframes carVictory': { from: { transform: 'translateX(-50%) rotate(0deg) scale(1)' }, to: { transform: 'translateX(-50%) rotate(360deg) scale(1.12)' } } }}>
            <Box sx={{ position: 'relative', width: 64, height: 34, borderRadius: '14px 18px 6px 6px', backgroundColor: '#e85c55', border: '3px solid #9f3433', color: 'white', fontWeight: 900, fontSize: 11, display: 'grid', placeItems: 'center' }}>CAR<Box sx={{ position: 'absolute', left: 7, bottom: -10, width: 15, height: 15, borderRadius: '50%', backgroundColor: '#263238', border: '3px solid white' }} /><Box sx={{ position: 'absolute', right: 7, bottom: -10, width: 15, height: 15, borderRadius: '50%', backgroundColor: '#263238', border: '3px solid white' }} /><Box sx={{ position: 'absolute', left: 17, top: -12, width: 28, height: 14, borderRadius: '14px 14px 0 0', backgroundColor: '#79c3cc', border: '3px solid #9f3433', borderBottom: 0 }} /></Box>
          </Box>
        </Box>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} sx={{ mt: 2 }}><Typography variant="body2" sx={{ fontWeight: 800 }}>Position: {position.toFixed(1)} m</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>Speed: {Math.abs(velocity).toFixed(1)} m/s</Typography><Typography variant="body2" color="text.secondary">Direction: {velocity < 0 ? 'reverse' : velocity > 0 ? 'forward' : 'stopped'}</Typography></Stack>
      </Box>
      <Typography variant="body2" color="primary.main" sx={{ textAlign: 'center', fontWeight: 800 }}>Movement shown: {movementLabels[round.movement]}</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center"><Button variant="contained" onClick={() => adjustVelocity(Math.min(12, Math.max(1, velocity) + 2))}>Accelerate</Button><Button variant="outlined" onClick={() => adjustVelocity(Math.abs(velocity) < .5 ? 0 : velocity * .45)}>Brake</Button><Button variant="outlined" color="secondary" onClick={() => adjustVelocity(-Math.max(3, Math.abs(velocity)))}>Reverse</Button></Stack>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Try each control and watch the position and speed change with the car&apos;s motion.</Typography>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'incorrect' ? 'warning.main' : feedback === 'correct' ? 'success.main' : 'divider', animation: feedback === 'incorrect' ? 'motionShake .45s ease-in-out' : 'none', '@keyframes motionShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } } }} key={feedbackVersion}>
        <Typography sx={{ fontWeight: 800 }}>Challenge: Get the car to {round.target} m without going past 30 m.</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Stop the car near the target, then check your position.</Typography>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>You stopped right at {round.target} m!</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Try again — you were {difference} m away from the target.</Typography>}
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={velocity !== 0}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default MotionTrackActivity
