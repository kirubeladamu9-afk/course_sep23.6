import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useEffect, useRef, useState } from 'react'

export type SurfaceTestProps = { onComplete?: () => void }
type Feedback = 'idle' | 'correct' | 'incorrect'

const BASE_TEMPERATURE = 22
const TARGET_TEMPERATURE = 50
const MAX_TEMPERATURE = 70
const PARTICLE_POINTS = [20, 48, 76, 104, 132, 160, 188, 216, 244, 272]
const TOP_PARTICLE_OFFSETS = [0, 1, -1, 1, 0, -1, 1, 0, -1, 0]
const BOTTOM_PARTICLE_OFFSETS = [0, -11, 4, -9, 2, -13, 3, -10, 4, -8]

const FrictionParticleDiagram: FC<{ intensity: number }> = ({ intensity }) => <Box sx={{ flex: 1, minWidth: { md: 310 }, p: { xs: 1.5, md: 2 }, border: 1, borderColor: 'rgba(61,48,40,.24)', borderRadius: 2, backgroundColor: '#f8f1e9', '@keyframes particleJostle': { '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' }, '25%': { transform: 'translate(1px, -1px) rotate(-2deg)' }, '50%': { transform: 'translate(-1px, 1px) rotate(2deg)' }, '75%': { transform: 'translate(1px, 1px) rotate(-1deg)' } } }}>
  <Typography sx={{ fontWeight: 800, color: '#3d3028' }}>Zoomed-in contact boundary</Typography>
  <Typography variant="caption" color="text.secondary">Object particles meet the surface particles below.</Typography>
  <Box sx={{ position: 'relative', height: 178, mt: 1.5, borderRadius: 1.5, backgroundColor: '#fffaf4', overflow: 'hidden' }}>
    <Typography variant="caption" sx={{ position: 'absolute', top: 8, left: 12, fontWeight: 800, color: '#8d5633' }}>TOP OBJECT</Typography>
    <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, left: 12, fontWeight: 800, color: '#4a7082' }}>BOTTOM SURFACE</Typography>
    {PARTICLE_POINTS.map((left, index) => <Box key={`top-${left}`} sx={{ position: 'absolute', left, top: 51 + TOP_PARTICLE_OFFSETS[index], width: 25, height: 25, borderRadius: '50%', backgroundColor: '#e79a65', border: '2px solid #a85d34', animation: intensity > .04 ? `particleJostle ${Math.max(.18, .55 - intensity * .3)}s ease-in-out infinite` : 'none', animationDelay: `${index * -35}ms` }} />)}
    {PARTICLE_POINTS.map((left, index) => <Box key={`bottom-${left}`} sx={{ position: 'absolute', left: left + (index % 2 ? 4 : -2), top: 82 + BOTTOM_PARTICLE_OFFSETS[index] - intensity * 6, width: 25, height: 25, borderRadius: '50%', backgroundColor: '#8ec9df', border: '2px solid #4d91aa', animation: intensity > .04 ? `particleJostle ${Math.max(.16, .48 - intensity * .28)}s ease-in-out infinite reverse` : 'none', animationDelay: `${index * -45}ms` }} />)}
    <Box sx={{ position: 'absolute', top: 91, left: 12, right: 12, borderTop: '2px dashed rgba(91,72,58,.45)' }} />
  </Box>
  <Typography variant="body2" sx={{ mt: 1, color: '#4e3c30' }}>The jagged particle edges interlock. Rubbing makes them bump and vibrate faster, converting motion into heat.</Typography>
</Box>

const Thermometer: FC<{ temperature: number; glowing: boolean }> = ({ temperature, glowing }) => {
  const fill = Math.max(0, Math.min(100, ((temperature - BASE_TEMPERATURE) / (MAX_TEMPERATURE - BASE_TEMPERATURE)) * 100))
  return <Stack alignItems="center" spacing={1} sx={{ width: 86, flexShrink: 0 }}>
    <Typography variant="caption" sx={{ fontWeight: 900, color: '#6b3f35' }}>HEAT</Typography>
    <Box sx={{ position: 'relative', width: 34, height: 178, display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ position: 'absolute', top: 6, width: 18, height: 142, border: '3px solid #8b6b60', borderRadius: 10, backgroundColor: '#f7e8df', overflow: 'hidden', boxShadow: glowing ? '0 0 18px rgba(225,72,52,.7)' : 'none', transition: 'box-shadow .3s ease' }}>
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${fill}%`, backgroundColor: temperature >= TARGET_TEMPERATURE ? '#e64e3c' : '#ed8055', transition: 'height .2s ease' }} />
      </Box>
      <Box sx={{ position: 'absolute', bottom: 0, width: 42, height: 42, borderRadius: '50%', backgroundColor: temperature >= TARGET_TEMPERATURE ? '#e64e3c' : '#ed8055', border: '3px solid #8b4b40', boxShadow: glowing ? '0 0 18px rgba(225,72,52,.7)' : 'none', transition: 'background-color .3s ease, box-shadow .3s ease' }} />
      {[0, 25, 50, 75, 100].map((tick) => <Typography key={tick} variant="caption" sx={{ position: 'absolute', right: -34, bottom: `${8 + tick * 1.38}%`, color: '#765b52', fontSize: 10 }}>{Math.round(BASE_TEMPERATURE + (MAX_TEMPERATURE - BASE_TEMPERATURE) * tick / 100)}°</Typography>)}
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 900, color: temperature >= TARGET_TEMPERATURE ? 'error.main' : '#6b3f35', textAlign: 'center' }}>Temperature: {temperature.toFixed(0)}°C</Typography>
  </Stack>
}

const SurfaceTestActivity: FC<SurfaceTestProps> = ({ onComplete }) => {
  const [temperature, setTemperature] = useState(BASE_TEMPERATURE)
  const [objectPosition, setObjectPosition] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [dragIntensity, setDragIntensity] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const lastPointerX = useRef<number | null>(null)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTemperature((current) => Math.max(BASE_TEMPERATURE, current - .16))
      setDragIntensity((current) => Math.max(0, current - .08))
    }, 100)
    return () => window.clearInterval(timer)
  }, [])

  const startDragging = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    lastPointerX.current = event.clientX
    setDragging(true)
    setFeedback('idle')
  }

  const dragObject = (event: PointerEvent<HTMLButtonElement>) => {
    if (!dragging || lastPointerX.current === null) return
    const distance = event.clientX - lastPointerX.current
    lastPointerX.current = event.clientX
    if (Math.abs(distance) < .1) return
    setObjectPosition((current) => Math.max(-38, Math.min(38, current + distance * .08)))
    setTemperature((current) => Math.min(MAX_TEMPERATURE, current + Math.abs(distance) * .12))
    setDragIntensity((current) => Math.min(1, Math.max(current, Math.min(1, Math.abs(distance) / 12))))
  }

  const stopDragging = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    lastPointerX.current = null
    setDragging(false)
  }

  const checkActivity = () => setFeedback(temperature >= TARGET_TEMPERATURE ? 'correct' : 'incorrect')
  const reset = () => {
    setTemperature(BASE_TEMPERATURE)
    setObjectPosition(0)
    setDragging(false)
    setDragIntensity(0)
    setFeedback('idle')
    lastPointerX.current = null
  }
  const completed = feedback === 'correct'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Surface Test</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Explore how friction converts motion into heat.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Drag the top object back and forth across the bottom surface. The microscopic particles interlock, bump, and vibrate as rubbing creates heat.</Typography>
      <Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, border: 1, borderColor: 'divider', backgroundColor: '#f5eee7' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 2, md: 3 }} alignItems="center">
          <Box sx={{ position: 'relative', flex: 1, width: '100%', minHeight: 300, borderRadius: 2, background: 'linear-gradient(180deg, #fffaf5 0%, #f0e1d4 100%)', overflow: 'hidden', border: 1, borderColor: 'rgba(61,48,40,.18)' }}>
            <Typography variant="caption" sx={{ position: 'absolute', top: 14, left: 16, color: '#5f5148', fontWeight: 900, letterSpacing: .4 }}>FRICTION CONTACT MODEL</Typography>
            <Box sx={{ position: 'absolute', left: '8%', right: '8%', bottom: 38, height: 92, borderRadius: 1.5, backgroundColor: '#8e6c50', border: '4px solid #5d402e', boxShadow: 'inset 0 15px 0 rgba(255,255,255,.12)' }}>
              <Typography sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#fff8ef', fontWeight: 900, letterSpacing: 1 }}>BOTTOM SURFACE</Typography>
            </Box>
            <Box sx={{ position: 'absolute', left: `calc(50% + ${objectPosition}px)`, bottom: 130, transform: 'translateX(-50%)', width: { xs: 190, sm: 240 }, height: 88, borderRadius: 1.5, backgroundColor: '#d3915e', border: '4px solid #754827', boxShadow: dragging ? '0 10px 0 rgba(88,52,33,.16)' : '0 7px 0 rgba(88,52,33,.16)', transition: dragging ? 'none' : 'left .25s ease, box-shadow .2s ease' }}>
              <Typography component="span" sx={{ display: 'grid', placeItems: 'center', height: '100%', color: '#fff8ef', fontWeight: 900, letterSpacing: 1 }}>DRAG ME</Typography>
            </Box>
            <Box sx={{ position: 'absolute', left: '50%', bottom: 118, transform: 'translateX(-50%)', width: '82%', borderTop: '2px dashed rgba(91,72,58,.45)' }} />
            <Typography variant="caption" sx={{ position: 'absolute', bottom: 14, left: 16, color: '#5f5148' }}>Two solids in contact · drag in either direction</Typography>
            <Box component="button" type="button" aria-label="Drag the top object back and forth" onPointerDown={startDragging} onPointerMove={dragObject} onPointerUp={stopDragging} onPointerCancel={stopDragging} sx={{ position: 'absolute', left: `calc(50% + ${objectPosition}px)`, bottom: 130, transform: 'translateX(-50%)', width: { xs: 190, sm: 240 }, height: 88, opacity: 0, cursor: dragging ? 'grabbing' : 'grab', border: 0, background: 'none', touchAction: 'none' }} />
          </Box>
          <Thermometer temperature={temperature} glowing={feedback === 'correct'} />
        </Stack>
      </Paper>
      <FrictionParticleDiagram intensity={dragIntensity} />
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontStyle: 'italic' }}>Rubbing surfaces together makes their particles bump into each other faster, which creates heat.</Typography>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'action.hover' }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Rub the object until the temperature reaches {TARGET_TEMPERATURE}°C.</Typography>
      </Paper>
      {feedback === 'correct' && <Paper role="status" elevation={0} sx={{ position: 'relative', p: 2, overflow: 'hidden', border: 1, borderColor: 'success.main', '@keyframes steam': { '0%': { opacity: 0, transform: 'translateY(10px) scale(.8)' }, '50%': { opacity: 1 }, '100%': { opacity: 0, transform: 'translateY(-18px) scale(1.2)' } } }}><Box sx={{ position: 'absolute', right: 30, top: 8, fontSize: 28, color: '#d8d8d8', animation: 'steam 1.2s ease-out infinite' }}>∿</Box><Typography color="success.main" sx={{ fontWeight: 800 }}>Right! Friction between surfaces converts motion into heat.</Typography><Typography variant="body2" color="text.secondary">The thermometer reached {TARGET_TEMPERATURE}°C because rubbing increased particle motion.</Typography></Paper>}
      {feedback === 'incorrect' && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'warning.main' }}><Typography color="warning.dark" sx={{ fontWeight: 700 }}>Keep rubbing the object back and forth. More contact motion is needed to reach the target temperature.</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default SurfaceTestActivity
