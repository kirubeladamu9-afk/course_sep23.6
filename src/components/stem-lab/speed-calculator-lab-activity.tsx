import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useState } from 'react'

export type SpeedCalculatorLabProps = { onComplete?: () => void }
type Direction = 'forward' | 'backward'
type Feedback = 'idle' | 'correct' | 'incorrect'
type Challenge = { distance: number; time: number }

const MIN_DISTANCE = 20
const MAX_DISTANCE = 200
const MIN_TIME = 5
const MAX_TIME = 60
const trackMarkers = [0, 25, 50, 75, 100]
const challengeDistances = [50, 75, 100, 125, 150]
const challengeTimes = [10, 15, 20, 25, 30]

const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const createChallenge = (): Challenge => ({ distance: randomItem(challengeDistances), time: randomItem(challengeTimes) })
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const formatNumber = (value: number) => Number.isInteger(value) ? value.toString() : value.toFixed(2)

const TrackCar: FC<{ direction: Direction; duration: number; targetPercent: number }> = ({ direction, duration, targetPercent }) => {
  const forward = direction === 'forward'
  return <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', '@keyframes speedTravelForward': { from: { left: '6%' }, to: { left: `${targetPercent}%` } }, '@keyframes speedTravelBackward': { from: { left: `${targetPercent}%` }, to: { left: '6%' } }, animation: `${forward ? 'speedTravelForward' : 'speedTravelBackward'} ${duration}s linear infinite` }}>
    <Box role="img" aria-label={`Moving car traveling ${direction}`} sx={{ position: 'absolute', bottom: 25, transform: 'translateX(-50%)', width: 58, height: 28, borderRadius: '16px 18px 7px 7px', backgroundColor: '#e45757', border: '3px solid #922f3e', boxShadow: '0 5px 0 rgba(40, 52, 68, .16)' }}>
      <Box sx={{ position: 'absolute', left: 12, top: -11, width: 28, height: 13, borderRadius: '12px 12px 0 0', backgroundColor: '#f18b72', border: '3px solid #922f3e', borderBottom: 0 }} />
      <Box sx={{ position: 'absolute', left: 5, bottom: -8, width: 13, height: 13, borderRadius: '50%', backgroundColor: '#26384a', border: '2px solid #101a24' }} />
      <Box sx={{ position: 'absolute', right: 5, bottom: -8, width: 13, height: 13, borderRadius: '50%', backgroundColor: '#26384a', border: '2px solid #101a24' }} />
      <Typography aria-hidden sx={{ position: 'absolute', right: forward ? -22 : 'auto', left: forward ? 'auto' : -22, top: 3, color: '#922f3e', fontSize: 18, fontWeight: 900 }}>{forward ? '→' : '←'}</Typography>
    </Box>
  </Box>
}

const SpeedCalculatorLabActivity: FC<SpeedCalculatorLabProps> = ({ onComplete }) => {
  const [challenge, setChallenge] = useState<Challenge>(createChallenge)
  const [distance, setDistance] = useState(100)
  const [time, setTime] = useState(20)
  const [direction, setDirection] = useState<Direction>('forward')
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [animationKey, setAnimationKey] = useState('initial')

  const speed = distance / time
  const velocity = direction === 'forward' ? speed : -speed
  const targetPercent = 6 + (distance / MAX_DISTANCE) * 88
  const animationDuration = clamp((distance / speed) * .35, 1, 12)
  const completed = feedback === 'correct'

  const updateValues = (nextDistance: number, nextTime: number) => {
    setDistance(clamp(nextDistance, MIN_DISTANCE, MAX_DISTANCE))
    setTime(clamp(nextTime, MIN_TIME, MAX_TIME))
    setFeedback('idle')
    setAnimationKey(`${nextDistance}-${nextTime}-${direction}`)
  }

  const updateDirection = (nextDirection: Direction) => {
    setDirection(nextDirection)
    setFeedback('idle')
    setAnimationKey(`${distance}-${time}-${nextDirection}`)
  }

  const checkActivity = () => {
    const distanceCorrect = distance === challenge.distance
    const timeCorrect = time === challenge.time
    const speedCorrect = Math.abs(speed - challenge.distance / challenge.time) < 0.001
    setFeedback(distanceCorrect && timeCorrect && speedCorrect ? 'correct' : 'incorrect')
  }

  const reset = () => {
    setChallenge(createChallenge())
    setDistance(100)
    setTime(20)
    setDirection('forward')
    setFeedback('idle')
    setAnimationKey(`reset-${Date.now()}`)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Speed Calculator Lab</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Calculate and compare speed and velocity.</Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
        <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Core" variant="outlined" size="small" /></Stack>
        <Typography variant="body2" color="text.secondary">Speed is magnitude; velocity includes direction.</Typography>
      </Stack>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'action.hover' }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Set the values so the object travels {challenge.distance} m in {challenge.time} seconds.</Typography>
      </Paper>
      <Box sx={{ position: 'relative', minHeight: 190, px: { xs: 1, sm: 2 }, pt: 2, border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #eaf5f4 0%, #f9fbfc 68%)', overflow: 'hidden' }}>
        <Stack direction="row" justifyContent="space-between"><Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>STRAIGHT TRACK · 0–200 m</Typography><Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>{direction === 'forward' ? 'Forward →' : 'Backward ←'}</Typography></Stack>
        <Box sx={{ position: 'absolute', left: '6%', right: '6%', bottom: 48, borderBottom: '6px solid #41576b' }} />
        {trackMarkers.map((marker) => <Box key={marker} sx={{ position: 'absolute', left: `${6 + (marker / 100) * 88}%`, bottom: 39, transform: 'translateX(-50%)', height: 20, borderLeft: '2px solid #71879a' }}><Typography variant="caption" sx={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', color: 'text.secondary' }}>{marker * 2} m</Typography></Box>)}
        <Box sx={{ position: 'absolute', left: `${targetPercent}%`, bottom: 45, height: 32, borderLeft: '3px dashed #e28a3d' }}><Typography variant="caption" sx={{ position: 'absolute', bottom: 34, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: 'warning.dark', fontWeight: 800 }}>target: {distance} m</Typography></Box>
        <TrackCar key={animationKey} direction={direction} duration={animationDuration} targetPercent={targetPercent} />
      </Box>
      <Typography variant="caption" color="text.secondary">The car covers the selected distance in a time that changes with the calculated speed: higher speed means a faster trip.</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography sx={{ fontWeight: 700 }}>Distance</Typography><TextField size="small" type="number" value={distance} onChange={(event) => updateValues(Number(event.target.value), time)} inputProps={{ min: MIN_DISTANCE, max: MAX_DISTANCE, step: 5, 'aria-label': 'Distance in meters' }} sx={{ width: 112 }} /></Stack>
          <Slider min={MIN_DISTANCE} max={MAX_DISTANCE} step={5} value={distance} onChange={(_, next) => updateValues(Array.isArray(next) ? next[0] : next, time)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${value} m`} aria-label="Distance" />
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: 'divider' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography sx={{ fontWeight: 700 }}>Time</Typography><TextField size="small" type="number" value={time} onChange={(event) => updateValues(distance, Number(event.target.value))} inputProps={{ min: MIN_TIME, max: MAX_TIME, step: 5, 'aria-label': 'Time in seconds' }} sx={{ width: 112 }} /></Stack>
          <Slider min={MIN_TIME} max={MAX_TIME} step={5} value={time} onChange={(_, next) => updateValues(distance, Array.isArray(next) ? next[0] : next)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${value} s`} aria-label="Time" />
        </Paper>
      </Stack>
      <Stack spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Direction</Typography>
        <ToggleButtonGroup exclusive value={direction} onChange={(_, next: Direction | null) => next && updateDirection(next)} aria-label="Direction">
          <ToggleButton value="forward" aria-label="Forward direction">Forward →</ToggleButton>
          <ToggleButton value="backward" aria-label="Backward direction">Backward ←</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Paper elevation={0} sx={{ p: 1.5, flex: 1, backgroundColor: 'primary.light' }}><Typography variant="caption" sx={{ fontWeight: 800 }}>Speed (magnitude)</Typography><Typography variant="h5">{formatNumber(speed)} m/s</Typography><Typography variant="caption">distance ÷ time = {distance} ÷ {time}</Typography></Paper>
        <Paper elevation={0} sx={{ p: 1.5, flex: 1, backgroundColor: 'action.hover' }}><Typography variant="caption" sx={{ fontWeight: 800 }}>Velocity (directional)</Typography><Typography variant="h5">{velocity >= 0 ? '+' : '−'}{formatNumber(Math.abs(velocity))} m/s</Typography><Typography variant="caption">{direction}</Typography></Paper>
      </Stack>
      {feedback === 'correct' && <Paper role="status" elevation={0} sx={{ position: 'relative', p: 2, border: 1, borderColor: 'success.main', overflow: 'hidden', '@keyframes burst': { from: { transform: 'scale(.3)', opacity: 1 }, to: { transform: 'scale(1.8)', opacity: 0 } } }}>
        {Array.from({ length: 8 }, (_, index) => <Box key={index} sx={{ position: 'absolute', left: `${12 + index * 11}%`, top: `${20 + (index % 3) * 25}%`, width: 8, height: 8, borderRadius: '50%', backgroundColor: ['#107d6f', '#f6b73c', '#e94f64', '#4f8cff'][index % 4], animation: 'burst .8s ease-out infinite', animationDelay: `${index * 70}ms` }} />)}
        <Typography color="success.main" sx={{ fontWeight: 800 }}>Right! {challenge.distance} m ÷ {challenge.time} s = {formatNumber(challenge.distance / challenge.time)} m/s.</Typography>
        <Typography variant="body2" color="text.secondary">The object crossed the target marker. Speed stayed positive while velocity showed the chosen direction.</Typography>
      </Paper>}
      {feedback === 'incorrect' && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'warning.main' }}><Typography color="warning.dark" sx={{ fontWeight: 700 }}>Not quite yet. Check whether the distance marker and elapsed time both match the challenge, then try again.</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="outlined" onClick={checkActivity}>Check Activity</Button>
        <Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button>
        <Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button>
      </Stack>
    </Stack>
  </Paper>
}

export default SpeedCalculatorLabActivity
