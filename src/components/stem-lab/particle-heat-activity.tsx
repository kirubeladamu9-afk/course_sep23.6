import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useMemo, useState } from 'react'

export type ParticleHeatProps = { onComplete?: () => void }
type Phase = 'Solid' | 'Liquid' | 'Gas'
type Feedback = 'idle' | 'correct' | 'incorrect'
type Substance = { id: string; name: string; formula: string; freeze: number; boil: number; color: string }

const substances: Substance[] = [
  { id: 'water', name: 'Water', formula: 'H₂O', freeze: 0, boil: 100, color: '#3b82f6' },
  { id: 'oxygen', name: 'Oxygen', formula: 'O₂', freeze: -219, boil: -183, color: '#22b8cf' },
  { id: 'argon', name: 'Argon', formula: 'Ar', freeze: -189, boil: -186, color: '#8b5cf6' },
  { id: 'neon', name: 'Neon', formula: 'Ne', freeze: -249, boil: -246, color: '#f97316' },
]

const phases: Phase[] = ['Solid', 'Liquid', 'Gas']
const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const temperatureForPhase = (substance: Substance, phase: Phase) => {
  if (phase === 'Solid') return substance.freeze - Math.max(5, Math.abs(substance.boil - substance.freeze) * 0.15)
  if (phase === 'Gas') return substance.boil + Math.max(5, Math.abs(substance.boil - substance.freeze) * 0.15)
  return (substance.freeze + substance.boil) / 2
}
const phaseForTemperature = (substance: Substance, temperature: number): Phase => temperature < substance.freeze ? 'Solid' : temperature >= substance.boil ? 'Gas' : 'Liquid'
const challengeText = (phase: Phase, substance: Substance) => phase === 'Gas' ? `Heat the ${substance.name.toLowerCase()} until it becomes a gas.` : phase === 'Solid' ? `Cool the ${substance.name.toLowerCase()} until it freezes solid.` : `Adjust the ${substance.name.toLowerCase()} until it is a liquid.`

const ParticleHeatActivity: FC<ParticleHeatProps> = ({ onComplete }) => {
  const [substance, setSubstance] = useState<Substance>(() => randomItem(substances))
  const [temperature, setTemperature] = useState(() => temperatureForPhase(substance, 'Liquid'))
  const [targetPhase, setTargetPhase] = useState<Phase>(() => randomItem(phases))
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const phase = phaseForTemperature(substance, temperature)
  const rangeMin = -260
  const rangeMax = 120
  const thermometerPercent = Math.min(100, Math.max(0, ((temperature - rangeMin) / (rangeMax - rangeMin)) * 100))
  const particles = useMemo(() => Array.from({ length: 32 }, (_, index) => {
    const column = index % 8
    const row = Math.floor(index / 8)
    const seed = (index * 47) % 100
    if (phase === 'Solid') return { id: index, left: 29 + column * 5.8, top: 30 + row * 9.5, delay: `${-(index % 6) * .15}s` }
    if (phase === 'Liquid') return { id: index, left: 22 + ((seed * 1.7) % 56), top: 34 + ((seed * 2.3) % 32), delay: `${-(index % 8) * .12}s` }
    return { id: index, left: 8 + ((seed * 2.1) % 84), top: 14 + ((seed * 3.1) % 70), delay: `${-(index % 9) * .17}s` }
  }), [phase, substance.id])

  const updateTemperature = (value: number) => {
    setTemperature(value)
    setFeedback('idle')
  }

  const changeSubstance = (id: string) => {
    const next = substances.find((item) => item.id === id) ?? substances[0]
    setSubstance(next)
    setTemperature(temperatureForPhase(next, 'Liquid'))
    setFeedback('idle')
  }

  const checkActivity = () => {
    setFeedback(phase === targetPhase ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const reset = () => {
    const nextSubstance = randomItem(substances)
    setSubstance(nextSubstance)
    setTargetPhase(randomItem(phases))
    setTemperature(temperatureForPhase(nextSubstance, 'Liquid'))
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  const completed = feedback === 'correct' && phase === targetPhase
  const hint = targetPhase === 'Gas' ? 'Try moving the temperature higher; the particles need more energy to spread apart.' : targetPhase === 'Solid' ? 'Try moving the temperature lower; cooling lets the particles settle into a tight structure.' : 'Try moving the temperature between the freezing and boiling thresholds so the particles stay close but can slide past one another.'
  const phaseDescription = phase === 'Solid' ? 'Particles are locked into a close arrangement and vibrate in place.' : phase === 'Liquid' ? 'Particles stay close together but slide past one another.' : 'Particles have enough energy to spread freely through the container.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Particle Heat Simulator</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how energy changes matter from solid to liquid to gas.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 190 }}><InputLabel>Substance</InputLabel><Select value={substance.id} label="Substance" onChange={(event) => changeSubstance(event.target.value)}>{substances.map((item) => <MenuItem key={item.id} value={item.id}>{item.name} ({item.formula})</MenuItem>)}</Select></FormControl>
        <Chip label="Physics" color="primary" size="small" /><Chip label="Phase change" variant="outlined" size="small" />
      </Stack>
      <Typography variant="body2" color="text.secondary">Drag the temperature and watch the particle arrangement change at the substance&apos;s freezing and boiling points.</Typography>
      <Box sx={{ position: 'relative', height: { xs: 270, md: 310 }, overflow: 'hidden', borderRadius: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : 'divider', background: phase === 'Solid' ? 'linear-gradient(135deg, #dbeafe, #eff6ff)' : phase === 'Liquid' ? 'linear-gradient(135deg, #d8f3ff, #effcff)' : 'linear-gradient(135deg, #fff0d8, #fff9ed)', transition: 'background .35s ease, border-color .2s ease', animation: feedback === 'correct' ? 'phaseCelebrate .8s ease-in-out infinite alternate' : feedback === 'incorrect' ? 'phaseShake .45s ease-in-out' : 'none', '@keyframes phaseCelebrate': { from: { boxShadow: '0 0 0 rgba(34, 197, 94, 0)' }, to: { boxShadow: '0 0 28px rgba(34, 197, 94, .45)' } }, '@keyframes phaseShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
        <Typography variant="caption" sx={{ position: 'absolute', left: 14, top: 12, zIndex: 2, fontWeight: 800, letterSpacing: '.08em', color: 'text.secondary' }}>{substance.name.toUpperCase()} PARTICLES</Typography>
        <Box sx={{ position: 'absolute', left: 14, top: 42, zIndex: 2, px: 1.25, py: .5, borderRadius: 1.5, bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}><Typography variant="body2" sx={{ fontWeight: 800 }}>State: {phase}</Typography></Box>
        {particles.map((particle) => {
          const motionName = `particleMotion${phase}${particle.id}`
          const motionRange = phase === 'Solid' ? 3 : phase === 'Liquid' ? 18 : 42
          const x = ((particle.id * 17) % 19) - 9
          const y = ((particle.id * 29) % 17) - 8
          const duration = phase === 'Solid' ? 0.28 + (particle.id % 4) * 0.08 : phase === 'Liquid' ? 1.2 + (particle.id % 5) * 0.18 : 2 + (particle.id % 7) * 0.22
          return <Box key={particle.id} sx={{ position: 'absolute', left: `${particle.left}%`, top: `${particle.top}%`, width: phase === 'Gas' ? 11 : 14, height: phase === 'Gas' ? 11 : 14, borderRadius: '50%', bgcolor: substance.color, border: '2px solid rgba(255,255,255,.8)', boxShadow: `0 2px 5px ${substance.color}66`, animation: `${motionName} ${duration}s ease-in-out ${particle.delay} infinite`, [`@keyframes ${motionName}`]: { '0%': { transform: `translate(${-x}px, ${-y}px) rotate(0deg)` }, '50%': { transform: `translate(${x * 0.4}px, ${y * 0.4}px) rotate(${phase === 'Gas' ? 90 : 15}deg)` }, '100%': { transform: `translate(${x * motionRange / 9}px, ${y * motionRange / 8}px) rotate(${phase === 'Gas' ? 220 : 30}deg)` } }, transition: 'left .45s ease, top .45s ease, width .35s ease, height .35s ease' }} />
        })}
        <Typography sx={{ position: 'absolute', bottom: 12, left: 14, right: 14, textAlign: 'center', color: 'text.secondary', fontSize: 12 }}>{phaseDescription}</Typography>
      </Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="h6">Temperature</Typography><Typography variant="h5" color="primary.main" sx={{ fontWeight: 800 }}>{temperature}°C</Typography></Stack><Slider min={rangeMin} max={rangeMax} step={1} value={temperature} onChange={(_, next) => updateTemperature(Array.isArray(next) ? next[0] : next)} valueLabelDisplay="auto" aria-label={`Temperature for ${substance.name}`} /></Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}><Box sx={{ position: 'relative', width: 18, height: 86, border: 2, borderColor: 'text.secondary', borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}><Box sx={{ position: 'absolute', left: 2, right: 2, bottom: 2, height: `${thermometerPercent}%`, bgcolor: phase === 'Gas' ? 'error.main' : phase === 'Solid' ? 'info.main' : 'warning.main', borderRadius: 2, transition: 'height .25s ease' }} /></Box><Box><Typography variant="caption" color="text.secondary">Thermometer</Typography><Typography variant="body2" sx={{ fontWeight: 700 }}>{phase}</Typography><Typography variant="caption" color="text.secondary">Freeze {substance.freeze}°C · Boil {substance.boil}°C</Typography></Box></Box>
      </Stack>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: 'action.hover' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Challenge: {challengeText(targetPhase, substance)}</Typography>{feedback === 'correct' && <Typography color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! At the phase boundary, particle energy changes how freely the particles can move.</Typography>}{feedback === 'incorrect' && <Typography color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>{hint}</Typography>}</Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset for new round</Button></Stack>
    </Stack>
  </Paper>
}

export default ParticleHeatActivity
