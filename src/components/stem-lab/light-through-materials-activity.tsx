import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useState } from 'react'

export type LightThroughMaterialsProps = { onComplete?: () => void }
type Material = 'water' | 'glass'
type Feedback = 'idle' | 'correct' | 'incorrect'
type Challenge = { material: Material; targetAngle: number }

type MaterialInfo = { label: string; index: number; color: string; description: string }
const materials: Record<Material, MaterialInfo> = {
  water: { label: 'Water', index: 1.333, color: '#a9dcf2', description: 'Liquid water' },
  glass: { label: 'Glass', index: 1.5, color: '#c9c2e9', description: 'Transparent glass' },
}
const airIndex = 1
const boundaryY = 52
const centerX = 50
const rayLength = 38
const minimumAngle = 5
const maximumAngle = 80
const challengeAngles = [20, 25, 30, 35]

const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const createChallenge = (): Challenge => ({ material: randomItem(['water', 'glass'] as Material[]), targetAngle: randomItem(challengeAngles) })
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const toRadians = (degrees: number) => degrees * Math.PI / 180
const toDegrees = (radians: number) => radians * 180 / Math.PI
const formatAngle = (angle: number) => `${angle.toFixed(1)}°`

const LightThroughMaterialsActivity: FC<LightThroughMaterialsProps> = ({ onComplete }) => {
  const [challenge, setChallenge] = useState<Challenge>(createChallenge)
  const [material, setMaterial] = useState<Material>('water')
  const [incidentAngle, setIncidentAngle] = useState(40)
  const [dragging, setDragging] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [animationKey, setAnimationKey] = useState('initial')

  const materialInfo = materials[material]
  const refractedAngle = toDegrees(Math.asin(clamp((airIndex / materialInfo.index) * Math.sin(toRadians(incidentAngle)), -1, 1)))
  const incidentStart = { x: centerX - Math.sin(toRadians(incidentAngle)) * rayLength, y: boundaryY - Math.cos(toRadians(incidentAngle)) * rayLength }
  const refractedEnd = { x: centerX + Math.sin(toRadians(refractedAngle)) * rayLength, y: boundaryY + Math.cos(toRadians(refractedAngle)) * rayLength }
  const completed = feedback === 'correct'
  const targetReached = Math.abs(refractedAngle - challenge.targetAngle) <= .5 && material === challenge.material

  const setAngleFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width * 100
    const y = (event.clientY - bounds.top) / bounds.height * 100
    const nextAngle = toDegrees(Math.atan2(Math.abs(x - centerX), Math.max(1, boundaryY - y)))
    setIncidentAngle(clamp(nextAngle, minimumAngle, maximumAngle))
    setFeedback('idle')
  }

  const updateAngle = (nextAngle: number) => {
    setIncidentAngle(nextAngle)
    setFeedback('idle')
    setAnimationKey(`${nextAngle}-${material}`)
  }

  const updateMaterial = (nextMaterial: Material) => {
    setMaterial(nextMaterial)
    setFeedback('idle')
    setAnimationKey(`${incidentAngle}-${nextMaterial}`)
  }

  const checkActivity = () => setFeedback(targetReached ? 'correct' : 'incorrect')

  const reset = () => {
    setChallenge(createChallenge())
    setMaterial('water')
    setIncidentAngle(40)
    setDragging(false)
    setFeedback('idle')
    setAnimationKey(`reset-${Date.now()}`)
  }

  const hint = material !== challenge.material
    ? 'Hint: Try the other material and compare how much the ray bends.'
    : refractedAngle > challenge.targetAngle
      ? 'Hint: Make the incident ray shallower to reduce the refracted angle.'
      : 'Hint: Make the incident ray steeper to increase the refracted angle.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Light Through Materials</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>See how light bends through different materials.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Core" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Drag the source or use the angle control to send light from air across the boundary. The ray bends according to Snell&apos;s law, not a fixed visual angle.</Typography>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'action.hover' }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Use {materials[challenge.material].label} and adjust the ray so its refracted angle is exactly {challenge.targetAngle}°.</Typography>
      </Paper>
      <Box component="svg" key={animationKey} viewBox="0 0 100 100" role="img" aria-label={`Light refracting from air into ${materialInfo.label}`} onPointerMove={(event) => dragging && setAngleFromPointer(event)} onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)} sx={{ width: '100%', height: { xs: 340, md: 430 }, border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden', touchAction: 'none' }}>
        <defs><marker id="refraction-arrow" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto"><path d="M 0 0 L 4 2 L 0 4 z" fill="#f0a31a" /></marker><filter id="ray-glow"><feGaussianBlur stdDeviation="1.2" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
        <rect x="0" y="0" width="100" height={boundaryY} fill="#f7fbff" />
        <rect x="0" y={boundaryY} width="100" height={100 - boundaryY} fill={materialInfo.color} opacity=".72" />
        <line x1="0" y1={boundaryY} x2="100" y2={boundaryY} stroke="#526675" strokeWidth="1" />
        <text x="5" y="8" fontSize="3.2" fontWeight="700" fill="#526675">AIR · n = 1.000</text>
        <text x="5" y="59" fontSize="3.2" fontWeight="700" fill="#526675">{materialInfo.label.toUpperCase()} · n = {materialInfo.index.toFixed(3)}</text>
        <text x="86" y="49" fontSize="2.8" fill="#607d8b">boundary</text>
        <line x1={centerX} y1="13" x2={centerX} y2="91" stroke="#718494" strokeWidth=".45" strokeDasharray="2 2" />
        <text x={centerX + 2} y="17" fontSize="2.8" fill="#607d8b">normal</text>
        <line x1={incidentStart.x} y1={incidentStart.y} x2={centerX} y2={boundaryY} stroke="#f0a31a" strokeWidth={feedback === 'correct' ? '2.2' : '1.3'} markerEnd="url(#refraction-arrow)" filter={feedback === 'correct' ? 'url(#ray-glow)' : undefined} />
        <line x1={centerX} y1={boundaryY} x2={refractedEnd.x} y2={refractedEnd.y} stroke="#e27728" strokeWidth={feedback === 'correct' ? '2.2' : '1.3'} markerEnd="url(#refraction-arrow)" filter={feedback === 'correct' ? 'url(#ray-glow)' : undefined} />
        {feedback === 'correct' && <circle cx={centerX} cy={boundaryY} r="5" fill="none" stroke="#f6c445" strokeWidth="1.2"><animate attributeName="r" values="3;9;3" dur=".75s" repeatCount="indefinite" /></circle>}
        <circle cx={incidentStart.x} cy={incidentStart.y} r="3.8" fill="#fff3bd" stroke="#d58b08" strokeWidth="1" onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setDragging(true) }} />
        <text x={incidentStart.x - 5} y={incidentStart.y - 5} fontSize="2.8" fontWeight="700" fill="#825500">drag source</text>
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700 }}>Incident angle in air: {formatAngle(incidentAngle)}</Typography>
          <Slider min={minimumAngle} max={maximumAngle} step={1} value={incidentAngle} onChange={(_, next) => updateAngle(Array.isArray(next) ? next[0] : next)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${value}°`} aria-label="Incident angle" />
        </Paper>
        <Paper elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, mb: .75 }}>Second material</Typography>
          <Select fullWidth size="small" value={material} onChange={(event) => updateMaterial(event.target.value as Material)} aria-label="Refraction material"><MenuItem value="water">Water · n = 1.333</MenuItem><MenuItem value="glass">Glass · n = 1.500</MenuItem></Select>
        </Paper>
      </Stack>
      <Paper elevation={0} sx={{ p: 1.5, backgroundColor: 'primary.light' }}>
        <Typography sx={{ fontWeight: 800 }}>Snell&apos;s law</Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', mt: .5 }}>n₁ × sin(θ₁) = n₂ × sin(θ₂)</Typography>
        <Typography variant="body2" sx={{ mt: .75 }}>1.000 × sin({incidentAngle.toFixed(1)}°) = {materialInfo.index.toFixed(3)} × sin({refractedAngle.toFixed(1)}°)</Typography>
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" useFlexGap>
        <Chip color="primary" label={`Angle in air: ${formatAngle(incidentAngle)}`} />
        <Chip color="secondary" label={`Angle in ${materialInfo.label.toLowerCase()}: ${formatAngle(refractedAngle)}`} />
        <Chip variant="outlined" label={`n air = ${airIndex.toFixed(3)} · n ${materialInfo.label.toLowerCase()} = ${materialInfo.index.toFixed(3)}`} />
      </Stack>
      {feedback === 'correct' && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: 'success.main', animation: 'rayCelebrate .7s ease', '@keyframes rayCelebrate': { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } } }}><Typography color="success.main" sx={{ fontWeight: 800 }}>Right! The ray bends to {formatAngle(refractedAngle)} when it enters denser {materialInfo.label.toLowerCase()}.</Typography><Typography variant="body2" color="text.secondary">Snell&apos;s law predicts the bend from the two refractive indices.</Typography></Paper>}
      {feedback === 'incorrect' && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'warning.main' }}><Typography color="warning.dark" sx={{ fontWeight: 700 }}>{hint}</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default LightThroughMaterialsActivity
