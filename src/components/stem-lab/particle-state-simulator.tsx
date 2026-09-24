import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined'
import AirOutlinedIcon from '@mui/icons-material/AirOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined'
import ReplayIcon from '@mui/icons-material/Replay'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined'
import { type FC, type ReactNode, useEffect, useRef, useState } from 'react'
import { advanceParticleGroup, createParticleGroup, type ParticlePhase, type SimParticle } from './particle-engine'

type Substance = {
  id: string
  name: string
  formula: string
  meltingPoint: number
  boilingPoint: number
  minTemperature: number
  maxTemperature: number
  color: string
  icon: ReactNode
}

type Feedback = {
  kind: 'success' | 'warning'
  message: string
}

const SUBSTANCES: Substance[] = [
  { id: 'water', name: 'Water', formula: 'H₂O', meltingPoint: 0, boilingPoint: 100, minTemperature: -30, maxTemperature: 130, color: '#3f9bd6', icon: <WaterDropOutlinedIcon /> },
  { id: 'ethanol', name: 'Ethanol', formula: 'C₂H₅OH', meltingPoint: -114, boilingPoint: 78, minTemperature: -140, maxTemperature: 110, color: '#8c72c6', icon: <OpacityOutlinedIcon /> },
  { id: 'oxygen', name: 'Oxygen', formula: 'O₂', meltingPoint: -219, boilingPoint: -183, minTemperature: -240, maxTemperature: -160, color: '#48a9b8', icon: <AirOutlinedIcon /> },
]
const PHASE_COLORS: Record<ParticlePhase, string> = { Solid: '#4f8cff', Liquid: '#00897b', Gas: '#9c62d0' }
const PHASE_ICONS: Record<ParticlePhase, ReactNode> = { Solid: <AcUnitOutlinedIcon />, Liquid: <WaterDropOutlinedIcon />, Gas: <AirOutlinedIcon /> }
const PHASE_DESCRIPTIONS: Record<ParticlePhase, string> = {
  Solid: 'Particles are packed into a tight structure and vibrate around their neighbors.',
  Liquid: 'Particles stay close together while sliding past one another.',
  Gas: 'Particles move freely, spread through the container, and bounce from its walls.',
}

const shuffle = <T,>(items: T[]) => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

const phaseForTemperature = (substance: Substance, temperature: number): ParticlePhase => temperature < substance.meltingPoint ? 'Solid' : temperature >= substance.boilingPoint ? 'Gas' : 'Liquid'
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const startingTemperature = (substance: Substance, target: ParticlePhase) => {
  if (target === 'Solid') return clamp(substance.meltingPoint + 24, substance.minTemperature, substance.maxTemperature)
  if (target === 'Gas') return clamp(substance.boilingPoint - 24, substance.minTemperature, substance.maxTemperature)
  return clamp((substance.meltingPoint + substance.boilingPoint) / 2, substance.minTemperature, substance.maxTemperature)
}
const challengeText = (substance: Substance, target: ParticlePhase) => target === 'Gas' ? `Heat the ${substance.name.toLowerCase()} until it becomes a gas.` : target === 'Solid' ? `Cool the ${substance.name.toLowerCase()} until it becomes a solid.` : `Adjust the ${substance.name.toLowerCase()} until it becomes a liquid.`

const ParticleStateSimulator: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [substance, setSubstance] = useState<Substance>(() => shuffle(SUBSTANCES)[0])
  const [targetPhase, setTargetPhase] = useState<ParticlePhase>(() => shuffle(['Solid', 'Liquid', 'Gas'] as ParticlePhase[])[0])
  const [temperature, setTemperature] = useState(() => startingTemperature(substance, targetPhase))
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [validated, setValidated] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [, setRenderTick] = useState(0)
  const simulationRef = useRef<SimParticle[]>([])
  const phase = phaseForTemperature(substance, temperature)

  useEffect(() => {
    simulationRef.current = createParticleGroup(phase, substance.id.length * 19 + targetPhase.length, 24)
    let frame = 0
    let previousTime = performance.now()
    const animate = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.032)
      previousTime = time
      simulationRef.current = advanceParticleGroup(simulationRef.current, phase, delta)
      setRenderTick((current) => current + 1)
      frame = window.requestAnimationFrame(animate)
    }
    frame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(frame)
  }, [phase, substance.id, targetPhase])

  const updateTemperature = (nextTemperature: number) => {
    setTemperature(nextTemperature)
    setFeedback(null)
    setValidated(false)
    setCelebrating(false)
  }

  const checkActivity = () => {
    if (phase === targetPhase) {
      const transitionPoint = targetPhase === 'Gas' ? substance.boilingPoint : targetPhase === 'Solid' ? substance.meltingPoint : `${substance.meltingPoint}°C and ${substance.boilingPoint}°C`
      const explanation = targetPhase === 'Gas' ? `Right! At ${transitionPoint}°C, ${substance.name.toLowerCase()} has enough energy for its particles to break free and become a gas.` : targetPhase === 'Solid' ? `Right! At ${transitionPoint}°C, ${substance.name.toLowerCase()} particles settle into a tight structure and only vibrate in place.` : `Right! Between its phase boundaries, ${substance.name.toLowerCase()} particles stay close but can slide past one another.`
      setFeedback({ kind: 'success', message: explanation })
      setValidated(true)
      setCelebrating(true)
      return
    }
    const hint = targetPhase === 'Gas' ? 'Move the slider higher so the particles have more energy to spread apart.' : targetPhase === 'Solid' ? 'Move the slider lower so the particles can settle into a tighter structure.' : 'Move the slider toward the middle range so the particles stay close but can flow.'
    setFeedback({ kind: 'warning', message: hint })
    setValidated(false)
    setCelebrating(false)
  }

  const reset = () => {
    const nextSubstance = shuffle(SUBSTANCES)[0]
    const nextTarget = shuffle(['Solid', 'Liquid', 'Gas'] as ParticlePhase[])[0]
    setSubstance(nextSubstance)
    setTargetPhase(nextTarget)
    setTemperature(startingTemperature(nextSubstance, nextTarget))
    setFeedback(null)
    setValidated(false)
    setCelebrating(false)
  }

  const thermometerPercent = ((temperature - substance.minTemperature) / (substance.maxTemperature - substance.minTemperature)) * 100
  const particles = simulationRef.current

  return <Box sx={{ '@keyframes particleStateCelebrate': { '0%, 100%': { transform: 'translateY(0)' }, '35%': { transform: 'translateY(-8px) rotate(-1deg)' }, '70%': { transform: 'translateY(-3px) rotate(1deg)' } }, '@keyframes particleStateShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
    <Stack spacing={2.5}>
      <Box><Chip label="Particle State Simulator" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Heat and cool matter</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>See how heating and cooling change a substance&apos;s state.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}><Stack direction="row" spacing={1}><Chip label="Chemistry" color="warning" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack><Chip label={`State: ${phase}`} color={phase === 'Gas' ? 'secondary' : phase === 'Solid' ? 'info' : 'success'} icon={PHASE_ICONS[phase]} /></Stack>
      <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: 1, borderColor: validated ? 'success.main' : 'divider', backgroundColor: 'background.paper', animation: celebrating ? 'particleStateCelebrate .9s ease-in-out infinite' : feedback?.kind === 'warning' ? 'particleStateShake .45s ease-in-out' : undefined }}><Stack spacing={2}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}><Box><Typography variant="h6">{substance.name} <Typography component="span" color="text.secondary" variant="body2">({substance.formula})</Typography></Typography><Typography variant="body2" color="text.secondary">{PHASE_DESCRIPTIONS[phase]}</Typography></Box><Chip label={`${temperature}°C`} color="primary" aria-label={`Temperature ${temperature} degrees Celsius`} /></Stack><Box role="img" aria-label={`${substance.name} particles in the ${phase} state`} sx={{ position: 'relative', minHeight: { xs: 250, md: 300 }, overflow: 'hidden', borderRadius: 3, border: 3, borderColor: PHASE_COLORS[phase], background: `radial-gradient(circle at 50% 45%, ${PHASE_COLORS[phase]}22, transparent 68%)`, transition: 'border-color .5s ease, background .5s ease' }}>{particles.map((particle) => <Box key={particle.id} sx={{ position: 'absolute', left: `${particle.x}%`, top: `${particle.y}%`, width: particle.radius * 2.2, height: particle.radius * 2.2, borderRadius: '50%', backgroundColor: substance.color, border: '2px solid rgba(255,255,255,.9)', boxShadow: `0 2px 6px ${substance.color}99`, transform: 'translate(-50%, -50%)' }} />)}<Typography variant="caption" sx={{ position: 'absolute', left: 12, bottom: 10, color: 'text.secondary', fontWeight: 700 }}>{phase} · {PHASE_DESCRIPTIONS[phase]}</Typography></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}><Box sx={{ flex: 1 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Temperature</Typography><Typography variant="body2" color="primary.main" sx={{ fontWeight: 800 }}>{temperature}°C</Typography></Stack><Slider min={substance.minTemperature} max={substance.maxTemperature} step={1} value={temperature} onChange={(_, value) => updateTemperature(Array.isArray(value) ? value[0] : value)} valueLabelDisplay="auto" aria-label={`Heat or cool ${substance.name}`} /><Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">{substance.minTemperature}°C</Typography><Typography variant="caption" color="text.secondary">{substance.maxTemperature}°C</Typography></Stack></Box><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ position: 'relative', width: 20, height: 96, border: 2, borderColor: 'text.secondary', borderRadius: 4, backgroundColor: 'background.default', overflow: 'hidden' }}><Box sx={{ position: 'absolute', left: 2, right: 2, bottom: 2, height: `${clamp(thermometerPercent, 0, 100)}%`, backgroundColor: phase === 'Gas' ? 'secondary.main' : phase === 'Solid' ? 'info.main' : 'success.main', borderRadius: 2, transition: 'height .2s ease' }} /></Box><Box><Typography variant="caption" color="text.secondary">Thermometer</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{phase}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Melts at {substance.meltingPoint}°C · Boils at {substance.boilingPoint}°C</Typography></Box></Stack></Stack></Stack></Paper>
      <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'primary.main', backgroundColor: 'background.default' }}><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Challenge</Typography><Typography variant="body2" sx={{ mt: .35 }}> {challengeText(substance, targetPhase)}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .5 }}>Move the temperature until the live state matches the challenge, then check your activity.</Typography></Paper>
      {feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : 'warning.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : 'warning.light' }}><Typography sx={{ fontWeight: 700 }}>{feedback.message}</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={validated} startIcon={<CheckCircleOutlineIcon />}>Check Activity</Button><Button variant="contained" color="success" onClick={onComplete} disabled={!validated}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Box>
}

export default ParticleStateSimulator
