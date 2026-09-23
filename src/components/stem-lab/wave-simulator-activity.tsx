import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useMemo, useState } from 'react'

export type WaveSimulatorProps = { onComplete?: () => void }
type Feedback = 'idle' | 'correct' | 'incorrect'

const randomTarget = () => 3 + Math.floor(Math.random() * 5)

const WaveSimulatorActivity: FC<WaveSimulatorProps> = ({ onComplete }) => {
  const [frequency, setFrequency] = useState(3)
  const [targetCycles, setTargetCycles] = useState(randomTarget)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const wavePath = useMemo(() => Array.from({ length: 121 }, (_, index) => {
    const x = index * 5
    const y = 90 - Math.sin((index / 120) * frequency * Math.PI * 2) * 48
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' '), [frequency])
  const checkActivity = () => {
    const correct = frequency === targetCycles
    setFeedback(correct ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }
  const reset = () => {
    setFrequency(3)
    setTargetCycles(randomTarget())
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }
  const completed = feedback === 'correct' && frequency === targetCycles
  const pitchMessage = frequency >= 5 ? 'Higher frequency means a higher pitch sound!' : frequency <= 2 ? 'Lower frequency means a lower pitch sound.' : 'The frequency controls how high or low the pitch sounds.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Wave Simulator</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how vibrations create sound.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: '#edf6fb', border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>Vibrating drum</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}><Box sx={{ width: 92, height: 52, borderRadius: '50%', backgroundColor: '#e5a55c', border: '6px solid #9c5f31', display: 'grid', placeItems: 'center', fontWeight: 900, animation: `drumPulse ${Math.max(.18, 1 / frequency)}s ease-in-out infinite`, '@keyframes drumPulse': { '0%, 100%': { transform: 'scaleY(1)' }, '50%': { transform: 'scaleY(1.12)' } } }}>DRUM</Box></Box>
        <Box component="svg" viewBox="0 0 600 180" role="img" aria-label={`Wave with ${frequency} full cycles`} sx={{ width: '100%', height: { xs: 150, md: 190 }, backgroundColor: 'common.white', borderRadius: 2, border: 1, borderColor: 'divider' }}><line x1="0" x2="600" y1="90" y2="90" stroke="#9bb1bf" strokeDasharray="5 5" /><path d={wavePath} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="5" strokeLinecap="round" /></Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: .5 }}>The wave repeats {frequency} full cycles across the screen.</Typography>
      </Paper>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>Frequency: {frequency} Hz</Typography>
      <Slider min={1} max={8} step={1} value={frequency} onChange={(_, next) => { setFrequency(Array.isArray(next) ? next[0] : next); setFeedback('idle') }} valueLabelDisplay="auto" aria-label="Frequency" />
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: 'action.hover', textAlign: 'center' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>{pitchMessage}</Typography></Paper>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'waveCelebrate .7s ease-in-out infinite alternate' : feedback === 'incorrect' ? 'waveShake .45s ease-in-out' : 'none', '@keyframes waveCelebrate': { from: { transform: 'scale(1)' }, to: { transform: 'scale(1.015)' } }, '@keyframes waveShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } } }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge: Set the frequency so the wave has {targetCycles} full cycles across the screen.</Typography>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! A higher frequency means the wave repeats more often.</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Try moving the slider until the wave has the requested number of repeats.</Typography>}
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default WaveSimulatorActivity
