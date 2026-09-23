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

export type ParticleHeatProps = { onComplete?: () => void }
type Feedback = 'idle' | 'correct' | 'incorrect'

const randomTarget = () => 70 + Math.floor(Math.random() * 3) * 10

const ParticleHeatActivity: FC<ParticleHeatProps> = ({ onComplete }) => {
  const [temperature, setTemperature] = useState(30)
  const [targetTemperature, setTargetTemperature] = useState(randomTarget)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const spread = 16 + temperature * .25
  const animationDuration = Math.max(.22, 2.8 - temperature * .022)
  const particles = useMemo(() => Array.from({ length: 24 }, (_, index) => {
    const angle = (index / 24) * Math.PI * 2
    const radius = 26 + (index % 5) * 6
    return { id: index, left: 50 + Math.cos(angle) * radius * (spread / 30), top: 50 + Math.sin(angle) * radius * (spread / 30), delay: `${(index % 7) * -.12}s` }
  }), [spread])
  const checkActivity = () => {
    const correct = Math.abs(temperature - targetTemperature) <= 2
    setFeedback(correct ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }
  const reset = () => {
    setTemperature(30)
    setTargetTemperature(randomTarget())
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }
  const completed = feedback === 'correct' && Math.abs(temperature - targetTemperature) <= 2
  const motionLabel = temperature >= 70 ? 'The particles are moving fast because it is hot!' : temperature <= 30 ? 'The particles are moving slowly because it is cool.' : 'The particles are moving at a medium speed.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Particle Heat Simulator</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>See how heat affects particle movement.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Adjust the temperature and watch the particles spread out and move faster as they heat up.</Typography>
      <Box sx={{ position: 'relative', height: 260, overflow: 'hidden', borderRadius: 2, border: 1, borderColor: 'divider', background: temperature >= 70 ? 'linear-gradient(135deg, #fff0df, #ffd4bf)' : 'linear-gradient(135deg, #e4f2ff, #d9ecf5)', transition: 'background .3s ease' }}>
        <Typography variant="caption" sx={{ position: 'absolute', left: 12, top: 10, fontWeight: 800, color: 'text.secondary' }}>MOLECULE CONTAINER</Typography>
        {particles.map((particle) => <Box key={particle.id} sx={{ position: 'absolute', left: `${particle.left}%`, top: `${particle.top}%`, width: temperature >= 70 ? 14 : 11, height: temperature >= 70 ? 14 : 11, borderRadius: '50%', backgroundColor: temperature >= 70 ? '#e66b4f' : '#4f8cff', boxShadow: '0 2px 5px rgba(44,62,80,.2)', animation: `particleJiggle ${animationDuration}s ease-in-out ${particle.delay} infinite alternate`, '@keyframes particleJiggle': { from: { transform: 'translate(0, 0)' }, to: { transform: `translate(${temperature * .12}px, ${temperature * -.08}px)` } }, transition: 'left .3s ease, top .3s ease, width .3s ease, height .3s ease, background .3s ease' }} />)}
        {feedback === 'correct' && <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', border: '5px solid', borderColor: 'success.main', animation: 'particleCelebrate .7s ease-in-out infinite alternate', '@keyframes particleCelebrate': { from: { opacity: .35 }, to: { opacity: .9 } } }} />}
      </Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>Temperature: {temperature}°C</Typography>
      <Slider min={0} max={100} step={5} value={temperature} onChange={(_, next) => { setTemperature(Array.isArray(next) ? next[0] : next); setFeedback('idle') }} valueLabelDisplay="auto" aria-label="Temperature" />
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: 'action.hover', textAlign: 'center' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>{motionLabel}</Typography><Typography variant="caption" color="text.secondary">Higher temperature gives particles more energy to move.</Typography></Paper>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'incorrect' ? 'particleShake .45s ease-in-out' : 'none', '@keyframes particleShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } } }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge: Set the temperature so the particles move as fast as boiling water.</Typography>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! Heating something up makes its particles move faster.</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Try moving the temperature higher or lower and watch the motion speed.</Typography>}
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default ParticleHeatActivity
