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
import ReplayIcon from '@mui/icons-material/Replay'
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined'
import { type FC, type ReactElement, type ReactNode, useEffect, useRef, useState } from 'react'
import { advanceParticleGroup, createParticleGroup, type ParticlePhase, type SimParticle } from './particle-engine'

type Substance = { id: string; name: string; formula: string; meltingPoint: number; boilingPoint: number; minTemperature: number; maxTemperature: number; color: string; icon: ReactNode }
type Feedback = { kind: 'success' | 'warning'; message: string }

const SUBSTANCES: Substance[] = [
  { id: 'water', name: 'Water', formula: 'H₂O', meltingPoint: 0, boilingPoint: 100, minTemperature: -30, maxTemperature: 130, color: '#39a8e5', icon: <WaterDropOutlinedIcon /> },
  { id: 'ethanol', name: 'Ethanol', formula: 'C₂H₅OH', meltingPoint: -114, boilingPoint: 78, minTemperature: -140, maxTemperature: 110, color: '#9c7bd2', icon: <WaterDropOutlinedIcon /> },
]
const PHASE_COLORS: Record<ParticlePhase, string> = { Solid: '#67b8ff', Liquid: '#20b6c0', Gas: '#b58be8' }
const PHASE_ICONS: Record<ParticlePhase, ReactElement> = { Solid: <AcUnitOutlinedIcon />, Liquid: <WaterDropOutlinedIcon />, Gas: <AirOutlinedIcon /> }
const PHASE_DESCRIPTIONS: Record<ParticlePhase, string> = { Solid: 'Particles are locked in a tight lattice and gently vibrate in place.', Liquid: 'Particles stay close together while sliding and flowing past one another.', Gas: 'Particles move quickly, spread through the container, and bounce from its walls.' }
const PHASES: ParticlePhase[] = ['Solid', 'Liquid', 'Gas']
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5)
const phaseForTemperature = (substance: Substance, temperature: number): ParticlePhase => temperature < substance.meltingPoint ? 'Solid' : temperature >= substance.boilingPoint ? 'Gas' : 'Liquid'
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const startingTemperature = (substance: Substance, target: ParticlePhase) => target === 'Solid' ? clamp(substance.meltingPoint - 24, substance.minTemperature, substance.maxTemperature) : target === 'Gas' ? clamp(substance.boilingPoint + 24, substance.minTemperature, substance.maxTemperature) : clamp((substance.meltingPoint + substance.boilingPoint) / 2, substance.minTemperature, substance.maxTemperature)

const Beaker: FC<{ phase: ParticlePhase; particles: SimParticle[]; color: string; temperature: number; boilingPoint: number }> = ({ phase, particles, color, temperature, boilingPoint }) => {
  const nearBoiling = temperature >= boilingPoint - 12
  const nearFreezing = phase === 'Solid' || temperature < boilingPoint - 70
  return <Box role="img" aria-label={`Water particles in a ${phase.toLowerCase()} state`} sx={{ position: 'relative', height: { xs: 310, md: 350 }, overflow: 'hidden', borderRadius: '18px 18px 30px 30px', border: '3px solid rgba(185,225,255,.75)', background: 'linear-gradient(130deg, rgba(255,255,255,.25), rgba(100,170,220,.08) 35%, rgba(7,30,65,.22))', boxShadow: `inset 12px 0 20px rgba(255,255,255,.16), inset -16px -20px 30px rgba(8,25,54,.25), 0 0 28px ${color}55`, '&:before': { content: '""', position: 'absolute', inset: '8px 10px 12px', borderLeft: '2px solid rgba(255,255,255,.55)', borderRadius: '14px 0 0 22px', pointerEvents: 'none' } }}>
    <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: phase === 'Gas' ? '35%' : phase === 'Solid' ? '48%' : '52%', background: `linear-gradient(180deg, ${color}44, ${color}aa)`, transition: 'height .7s ease, background .7s ease', '&:after': { content: '""', position: 'absolute', top: -5, left: '4%', right: '4%', height: 10, borderRadius: '50%', borderTop: `3px solid ${color}aa`, animation: phase === 'Liquid' ? 'surfaceRipple 2.4s ease-in-out infinite' : 'none' } }} />
    {particles.map((particle) => <Box key={particle.id} sx={{ position: 'absolute', left: `${particle.x}%`, top: `${particle.y}%`, width: particle.radius * 2.5, height: particle.radius * 2.5, borderRadius: '50%', background: `radial-gradient(circle at 30% 25%, #fff 0 9%, ${color} 34%, ${color}99 68%, #10294d 100%)`, boxShadow: `0 0 9px ${color}aa, inset -2px -3px 4px rgba(5,26,54,.45)`, opacity: phase === 'Gas' ? .7 : 1, transition: 'background .5s ease, opacity .5s ease' }} />)}
    {nearBoiling && <Box sx={{ position: 'absolute', inset: '5% 20%', opacity: .55, background: 'radial-gradient(ellipse at 50% 90%, rgba(255,255,255,.7), transparent 60%)', animation: 'steamRise 2.2s ease-in-out infinite' }} />}
    {nearFreezing && <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(135deg, rgba(225,250,255,.24), transparent 40%)', animation: 'frostShimmer 3s ease-in-out infinite' }} />}
  </Box>
}

const Thermometer: FC<{ value: number; min: number; max: number; color: string }> = ({ value, min, max, color }) => <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 70 }} aria-label={`Thermometer at ${value} degrees Celsius`}><Box sx={{ position: 'relative', width: 18, height: 150, borderRadius: 10, background: 'linear-gradient(90deg, #d9e7f2, #fff 48%, #b4cce0)', border: '2px solid #9bb7ca' }}><Box sx={{ position: 'absolute', bottom: 7, left: 4, right: 4, height: `calc(${((value - min) / (max - min)) * 100}% - 8px)`, minHeight: 10, borderRadius: 8, background: `linear-gradient(180deg, #ffcf66, ${color})`, transition: 'height .25s ease' }} /><Box sx={{ position: 'absolute', bottom: -17, left: -6, width: 26, height: 26, borderRadius: '50%', background: color, boxShadow: `0 0 12px ${color}99` }} /></Box><Stack sx={{ height: 150, justifyContent: 'space-between' }}><Typography variant="caption">Hot</Typography><Typography variant="caption">Warm</Typography><Typography variant="caption">Cold</Typography></Stack></Box>

const ParticleStateSimulator: FC<{ onComplete?: () => void; subjectLabel?: 'Chemistry' | 'Physics' }> = ({ onComplete, subjectLabel = 'Chemistry' }) => {
  const [substance, setSubstance] = useState<Substance>(() => shuffle(SUBSTANCES)[0])
  const [targetPhase, setTargetPhase] = useState<ParticlePhase>(() => shuffle(PHASES)[0])
  const [temperature, setTemperature] = useState(() => startingTemperature(substance, targetPhase))
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [validated, setValidated] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [, setRenderTick] = useState(0)
  const simulationRef = useRef<SimParticle[]>([])
  const phase = phaseForTemperature(substance, temperature)
  const color = PHASE_COLORS[phase]

  useEffect(() => {
    simulationRef.current = createParticleGroup(phase, substance.id.length * 19 + targetPhase.length, 30)
    let frame = 0
    let previous = performance.now()
    const animate = (time: number) => { const delta = Math.min((time - previous) / 1000, .032); previous = time; simulationRef.current = advanceParticleGroup(simulationRef.current, phase, delta); setRenderTick((tick) => tick + 1); frame = requestAnimationFrame(animate) }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [phase, substance.id, targetPhase])

  const updateTemperature = (next: number) => { setTemperature(next); setFeedback(null); setValidated(false); setCelebrating(false) }
  const checkActivity = () => {
    if (phase === targetPhase) {
      const point = targetPhase === 'Gas' ? substance.boilingPoint : targetPhase === 'Solid' ? substance.meltingPoint : `${substance.meltingPoint}°C to ${substance.boilingPoint}°C`
      setFeedback({ kind: 'success', message: `Right! At ${point}${typeof point === 'number' ? '°C' : ''}, ${substance.name.toLowerCase()} particles ${targetPhase === 'Gas' ? 'have enough energy to break free and become a gas.' : targetPhase === 'Solid' ? 'settle into a tight structure and vibrate in place.' : 'stay close together while flowing as a liquid.'}` }); setValidated(true); setCelebrating(true)
    } else { setFeedback({ kind: 'warning', message: targetPhase === 'Gas' ? 'Try moving the temperature higher so the particles can spread apart.' : targetPhase === 'Solid' ? 'Try moving the temperature lower so the particles can settle together.' : 'Try moving toward the middle range so the particles can stay close and flow.' }); setValidated(false); setCelebrating(false) }
  }
  const reset = () => { const nextSubstance = shuffle(SUBSTANCES)[0]; const nextTarget = shuffle(PHASES)[0]; setSubstance(nextSubstance); setTargetPhase(nextTarget); setTemperature(startingTemperature(nextSubstance, nextTarget)); setFeedback(null); setValidated(false); setCelebrating(false) }
  const percent = ((temperature - substance.minTemperature) / (substance.maxTemperature - substance.minTemperature)) * 100
  const nearBoiling = temperature >= substance.boilingPoint - 12

  return <Box sx={{ '@keyframes surfaceRipple': { '0%, 100%': { transform: 'scaleX(.9)', opacity: .5 }, '50%': { transform: 'scaleX(1.05)', opacity: 1 } }, '@keyframes steamRise': { '0%, 100%': { transform: 'translateY(8px)', opacity: .25 }, '50%': { transform: 'translateY(-20px)', opacity: .7 } }, '@keyframes frostShimmer': { '0%, 100%': { opacity: .2 }, '50%': { opacity: .7 } }, '@keyframes celebrate': { '0%, 100%': { boxShadow: `0 0 0 ${color}00` }, '50%': { boxShadow: `0 0 34px ${color}aa` } } }}>
    <Stack spacing={2.5}>
      <Box><Chip label="Particle State Simulator" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Heat and cool matter</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>See how heating and cooling change a substance&apos;s state.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}><Stack direction="row" spacing={1}><Chip label={subjectLabel} color="warning" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack><Chip label={`State: ${phase}`} color={phase === 'Gas' ? 'secondary' : phase === 'Solid' ? 'info' : 'success'} icon={PHASE_ICONS[phase]} /></Stack>
      <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, border: 1, borderColor: validated ? 'success.main' : 'divider', animation: celebrating ? 'celebrate 1.2s ease-in-out infinite' : undefined }}><Stack spacing={2}><Stack direction="row" justifyContent="space-between" alignItems="center"><Box><Typography variant="h6">{substance.icon} {substance.name} <Typography component="span" color="text.secondary" variant="body2">({substance.formula})</Typography></Typography><Typography variant="body2" color="text.secondary">{PHASE_DESCRIPTIONS[phase]}</Typography></Box><Chip label={`${temperature}°C`} sx={{ backgroundColor: `${color}22`, color }} /></Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center"><Box sx={{ flex: 1, width: '100%' }}><Beaker phase={phase} particles={simulationRef.current} color={substance.color} temperature={temperature} boilingPoint={substance.boilingPoint} /></Box><Thermometer value={temperature} min={substance.minTemperature} max={substance.maxTemperature} color={color} /></Stack><Box><Stack direction="row" justifyContent="space-between"><Typography variant="body2" sx={{ fontWeight: 700 }}>Temperature</Typography><Typography variant="body2" color="text.secondary">{substance.minTemperature}°C to {substance.maxTemperature}°C</Typography></Stack><Slider min={substance.minTemperature} max={substance.maxTemperature} step={1} value={temperature} onChange={(_, next) => updateTemperature(Array.isArray(next) ? next[0] : next)} valueLabelDisplay="auto" aria-label="Water temperature" sx={{ color }} /><Stack direction="row" justifyContent="space-between"><Typography variant="caption">Freezing: {substance.meltingPoint}°C</Typography><Typography variant="caption">Boiling: {substance.boilingPoint}°C</Typography></Stack></Box>{nearBoiling && <Typography variant="caption" color="secondary.main">Bubbles are forming as the particles approach boiling.</Typography>}</Stack></Paper>
      <Paper elevation={0} sx={{ p: 1.75, border: 1, borderColor: 'primary.main', background: 'linear-gradient(110deg, rgba(40,120,200,.1), rgba(140,90,210,.08))' }}><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Challenge</Typography><Typography variant="body2" sx={{ mt: .35 }}>{targetPhase === 'Gas' ? `Heat the ${substance.name.toLowerCase()} until it becomes a gas.` : targetPhase === 'Solid' ? `Cool the ${substance.name.toLowerCase()} until it becomes a solid.` : `Adjust the ${substance.name.toLowerCase()} until it becomes a liquid.`}</Typography><Typography variant="caption" color="text.secondary">Drag the labeled temperature slider until the live state matches the challenge.</Typography></Paper>
      {feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : 'warning.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : 'warning.light' }}><Typography sx={{ fontWeight: 700 }}>{feedback.message}</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={validated} startIcon={<CheckCircleOutlineIcon />}>Check Activity</Button><Button variant="contained" color="success" onClick={onComplete} disabled={!validated}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Box>
}

export default ParticleStateSimulator
