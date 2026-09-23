import { useEffect, useMemo, useState, type FC } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

const PendulumSimulation: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [length, setLength] = useState(0.7)
  const [mass, setMass] = useState(1)
  const [gravity, setGravity] = useState(9.81)
  const [friction, setFriction] = useState(0.08)
  const [angle, setAngle] = useState(-28)
  const [isRunning, setIsRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isRunning) return undefined
    let frame = 0
    let lastTime = performance.now()
    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      setElapsed((current) => current + delta)
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [isRunning])

  const period = 2 * Math.PI * Math.sqrt(length / gravity)
  const liveAngle = isRunning ? Math.sin((elapsed * Math.PI * 2) / period) * 28 * Math.exp(-friction * elapsed) : angle
  const bob = useMemo(() => {
    const radians = (liveAngle * Math.PI) / 180
    const armLength = 132 + length * 68
    return { x: 310 + Math.sin(radians) * armLength, y: 42 + Math.cos(radians) * armLength, armLength }
  }, [length, liveAngle])

  const reset = () => {
    setElapsed(0)
    setAngle(-28)
    setIsRunning(false)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box component="svg" viewBox="0 0 620 310" role="img" aria-label="Interactive pendulum with adjustable length and mass" sx={{ width: '100%', height: { xs: 250, md: 310 }, borderRadius: 2, background: 'linear-gradient(180deg, #f8fbff 0%, #eef4f7 100%)', border: 1, borderColor: 'divider' }}>
          <path d="M270 42 Q310 116 350 42" fill="none" stroke="#a8afb5" strokeWidth="2" />
          {Array.from({ length: 9 }, (_, index) => { const tickX = 270 + index * 10; return <line key={index} x1={tickX} y1={42 + Math.abs(4 - index) * 5} x2={tickX} y2={52 + Math.abs(4 - index) * 5} stroke="#858d94" strokeWidth="1" /> })}
          <line x1="310" y1="42" x2="310" y2="285" stroke="#9aa6b2" strokeDasharray="4 5" />
          <circle cx="310" cy="42" r="7" fill="#fff" stroke="#182b49" strokeWidth="3" />
          <line x1="310" y1="42" x2={bob.x} y2={bob.y} stroke="#252b34" strokeWidth="2" />
          <circle cx={bob.x} cy={bob.y} r={14 + mass * 5} fill="#2f43e8" stroke="#17228e" strokeWidth="2" />
          <text x={bob.x} y={bob.y + 5} textAnchor="middle" fill="white" fontSize="13" fontWeight="700">1</text>
          <text x="310" y="25" textAnchor="middle" fill="#586575" fontSize="12" fontWeight="700">PIVOT</text>
          <text x="20" y="285" fill="#65717b" fontSize="12">Angle: {Math.round(liveAngle)}°</text>
          <text x="470" y="285" fill="#65717b" fontSize="12">Mass: {mass.toFixed(2)} kg</text>
        </Box>
        <Stack direction="row" justifyContent="center" spacing={1} sx={{ mt: 1.5 }}>
          <Button size="small" variant="contained" startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />} onClick={() => setIsRunning((current) => !current)}>{isRunning ? 'Pause' : 'Start'}</Button>
          <Button size="small" variant="outlined" startIcon={<RestartAltIcon />} onClick={reset}>Reset</Button>
        </Stack>
      </Box>
      <Stack spacing={1.75} sx={{ width: { xs: '100%', md: 245 }, flexShrink: 0 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Pendulum controls</Typography>
        <Box><Stack direction="row" justifyContent="space-between"><Typography variant="body2">Length 1</Typography><Typography variant="body2" color="primary.main">{length.toFixed(2)} m</Typography></Stack><Slider size="small" min={0.1} max={1.5} step={0.05} value={length} onChange={(_, value) => setLength(value as number)} aria-label="Pendulum length" /></Box>
        <Box><Stack direction="row" justifyContent="space-between"><Typography variant="body2">Mass 1</Typography><Typography variant="body2" color="primary.main">{mass.toFixed(2)} kg</Typography></Stack><Slider size="small" min={0.1} max={1.5} step={0.05} value={mass} onChange={(_, value) => setMass(value as number)} aria-label="Pendulum mass" /></Box>
        <Box><Stack direction="row" justifyContent="space-between"><Typography variant="body2">Gravity</Typography><Typography variant="body2" color="primary.main">{gravity.toFixed(2)} m/s²</Typography></Stack><Slider size="small" min={1} max={20} step={0.01} value={gravity} onChange={(_, value) => setGravity(value as number)} aria-label="Gravity" /></Box>
        <Box><Stack direction="row" justifyContent="space-between"><Typography variant="body2">Friction</Typography><Typography variant="body2" color="primary.main">{friction.toFixed(2)}</Typography></Stack><Slider size="small" min={0} max={0.3} step={0.01} value={friction} onChange={(_, value) => setFriction(value as number)} aria-label="Friction" /></Box>
        <Box><Typography variant="body2" sx={{ mb: .5 }}>Release angle</Typography><Slider size="small" min={-45} max={45} step={1} value={angle} onChange={(_, value) => { setAngle(value as number); setElapsed(0); setIsRunning(false) }} aria-label="Release angle" /></Box>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}><Typography variant="body2">Period</Typography><Typography sx={{ fontWeight: 800 }}>{period.toFixed(2)} s</Typography></Stack>
        {onComplete && <Button variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />} onClick={onComplete}>Finish activity</Button>}
        <Typography variant="caption" color="text.secondary">A longer pendulum has a longer period: T = 2π√(L ÷ g).</Typography>
      </Stack>
    </Stack>
  </Paper>
}

export default PendulumSimulation
