import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
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

type Device = 'Diode' | 'LED'
type Feedback = 'idle' | 'correct' | 'incorrect'
const thermalVoltage = 0.02585
const randomTarget = () => 8 + Math.floor(Math.random() * 13)
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const solveCurrent = (voltage: number, device: Device) => {
  const saturation = device === 'LED' ? 1e-14 : 1e-12
  const ideality = device === 'LED' ? 2 : 1.6
  const seriesResistance = device === 'LED' ? 28 : 55
  let current = voltage > 0 ? Math.max(0, (voltage - (device === 'LED' ? 1.8 : 0.65)) / seriesResistance) : 0
  for (let iteration = 0; iteration < 18; iteration += 1) {
    const exponent = clamp((voltage - current * seriesResistance) / (ideality * thermalVoltage), -40, 40)
    const diodeCurrent = saturation * (Math.exp(exponent) - 1)
    const residual = current - diodeCurrent
    const derivative = 1 + seriesResistance * saturation * Math.exp(exponent) / (ideality * thermalVoltage)
    current = Math.max(0, current - residual / derivative)
  }
  return Number.isFinite(current) ? Math.max(0, current) : 0
}

const SemiconductorActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [device, setDevice] = useState<Device>('Diode')
  const [voltage, setVoltage] = useState(0)
  const [target, setTarget] = useState(randomTarget)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const [showCurrent, setShowCurrent] = useState(true)
  const current = solveCurrent(voltage, device)
  const currentMilliAmps = current * 1000
  const threshold = device === 'LED' ? 1.8 : 0.65
  const curve = useMemo(() => Array.from({ length: 101 }, (_, index) => {
    const x = -5 + index / 10
    return { x, y: solveCurrent(x, device) * 1000 }
  }), [device])
  const maxCurrent = Math.max(20, ...curve.map((point) => point.y))
  const curvePath = curve.map((point, index) => `${index === 0 ? 'M' : 'L'} ${45 + ((point.x + 5) / 10) * 570} ${220 - (point.y / maxCurrent) * 185}`).join(' ')
  const markerX = 45 + ((voltage + 5) / 10) * 570
  const markerY = 220 - (currentMilliAmps / maxCurrent) * 185
  const conducting = currentMilliAmps >= 0.05
  const challengeCorrect = currentMilliAmps >= target
  const reset = () => { setVoltage(0); setTarget(randomTarget()); setFeedback('idle'); setFeedbackVersion((value) => value + 1) }
  const checkActivity = () => { setFeedback(challengeCorrect ? 'correct' : 'incorrect'); setFeedbackVersion((value) => value + 1) }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}>
    <Box><Chip label="Semiconductor Lab" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Semiconductor Lab</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how semiconductor devices control current.</Typography></Box>
    <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Advanced" variant="outlined" size="small" /></Stack>
    <Paper elevation={0} sx={{ p: { xs: 1, md: 2 }, backgroundColor: '#edf6fb', border: 1, borderColor: 'divider' }}><Box component="svg" viewBox="0 0 680 210" role="img" aria-label="Battery diode resistor circuit" sx={{ width: '100%', height: { xs: 200, md: 240 }, backgroundColor: 'common.white', borderRadius: 2, border: 1, borderColor: 'divider' }}>
      <defs><marker id="currentArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#16a34a" /></marker></defs><line x1="80" x2="590" y1="85" y2="85" stroke="#334155" strokeWidth="4" /><line x1="590" x2="590" y1="85" y2="165" stroke="#334155" strokeWidth="4" /><line x1="590" x2="80" y1="165" y2="165" stroke="#334155" strokeWidth="4" /><line x1="80" x2="80" y1="165" y2="85" stroke="#334155" strokeWidth="4" />
      <line x1="65" x2="95" y1="105" y2="105" stroke="#dc2626" strokeWidth="5" /><line x1="72" x2="88" y1="145" y2="145" stroke="#dc2626" strokeWidth="3" /><text x="80" y="190" textAnchor="middle" fontSize="12" fontWeight="bold">BATTERY</text><text x="80" y="76" textAnchor="middle" fontSize="12">{voltage.toFixed(2)} V</text>
      <path d="M205 85 L225 65 L245 105 L265 65 L285 105 L305 85" fill="none" stroke="#475569" strokeWidth="4" /><text x="255" y="48" textAnchor="middle" fontSize="12" fontWeight="bold">RESISTOR · 55 Ω</text>
      <line x1="365" x2="410" y1="85" y2="85" stroke="#334155" strokeWidth="4" /><polygon points="410,60 410,110 455,85" fill={conducting ? '#facc15' : '#e2e8f0'} stroke="#475569" strokeWidth="3" /><line x1="465" x2="465" y1="58" y2="112" stroke="#475569" strokeWidth="5" /><line x1="465" x2="510" y1="85" y2="85" stroke="#334155" strokeWidth="4" /><text x="438" y="46" textAnchor="middle" fontSize="12" fontWeight="bold">{device.toUpperCase()}</text>{conducting && showCurrent && <line x1="110" x2="570" y1="72" y2="72" stroke="#16a34a" strokeWidth="3" strokeDasharray="5 8" markerEnd="url(#currentArrow)" />}
      <text x="340" y="195" textAnchor="middle" fontSize="12" fill="#475569">{conducting ? 'Forward current is flowing' : 'Reverse-biased or below threshold: current is near zero'}</text>
    </Box></Paper>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center"><Box sx={{ flex: 1, width: '100%' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Supply Voltage: {voltage.toFixed(2)} V</Typography><Slider min={-5} max={5} step={0.01} value={voltage} onChange={(_, value) => { setVoltage(value as number); setFeedback('idle') }} aria-label="Supply Voltage" /></Box><FormControl size="small" sx={{ minWidth: 160 }}><InputLabel>Device</InputLabel><Select value={device} label="Device" onChange={(event) => { setDevice(event.target.value as Device); setFeedback('idle') }}><MenuItem value="Diode">Diode</MenuItem><MenuItem value="LED">LED</MenuItem></Select></FormControl><FormControlLabel control={<Checkbox checked={showCurrent} onChange={(event) => setShowCurrent(event.target.checked)} />} label="Show current flow" /></Stack>
    <Stack direction="row" spacing={1}><Chip color={conducting ? 'success' : 'default'} label={`Current: ${currentMilliAmps.toFixed(2)} mA`} /><Chip label={`Threshold: ${threshold.toFixed(2)} V`} /><Chip label={`Drag coefficient: modeled I–V`} /></Stack>
    <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="body2" sx={{ fontWeight: 700, mb: .5 }}>Diode I–V characteristic</Typography><Box component="svg" viewBox="0 0 640 255" role="img" aria-label="Current versus voltage curve"><line x1="45" x2="615" y1="220" y2="220" stroke="#64748b" /><line x1="45" x2="45" y1="35" y2="220" stroke="#64748b" /><line x1="330" x2="330" y1="35" y2="220" stroke="#cbd5e1" strokeDasharray="4 4" /><path d={curvePath} fill="none" stroke="#2563eb" strokeWidth="3" /><circle cx={markerX} cy={clamp(markerY, 35, 220)} r="6" fill="#dc2626" /><text x="330" y="245" textAnchor="middle" fontSize="12">Voltage (V)</text><text x="14" y="125" textAnchor="middle" fontSize="12" transform="rotate(-90 14 125)">Current (mA)</text><text x="45" y="232" fontSize="10">−5</text><text x="610" y="232" fontSize="10">+5</text></Box></Paper>
    <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'diodeGlow .7s ease-in-out infinite alternate' : 'none', '@keyframes diodeGlow': { from: { boxShadow: 'none' }, to: { boxShadow: '0 0 22px #facc15' } } }}><Typography sx={{ fontWeight: 800 }}>Challenge: Increase the voltage until the device conducts at least {target} mA.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! Once the supply crossed the device’s forward region, current rose sharply.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Try moving the supply voltage farther in the forward-bias direction.</Typography>}</Paper>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!challengeCorrect || feedback !== 'correct'} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
  </Stack></Paper>
}

export default SemiconductorActivity
