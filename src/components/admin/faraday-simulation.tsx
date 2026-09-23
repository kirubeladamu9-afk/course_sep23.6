import { useEffect, useMemo, useRef, useState, type FC, type PointerEvent as ReactPointerEvent } from 'react'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import { alpha, useTheme } from '@mui/material/styles'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const FaradaySimulation: FC = () => {
  const theme = useTheme()
  const [magnetPosition, setMagnetPosition] = useState(0.18)
  const [magnetPolarity, setMagnetPolarity] = useState<'NS' | 'SN'>('NS')
  const [coilCount, setCoilCount] = useState<1 | 2>(2)
  const [showFieldLines, setShowFieldLines] = useState(true)
  const [showVoltmeter, setShowVoltmeter] = useState(true)
  const [velocity, setVelocity] = useState(0)
  const dragStart = useRef<{ x: number; position: number } | null>(null)
  const previousPosition = useRef(magnetPosition)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowLeft', 'ArrowRight', 'a', 'd', 'A', 'D'].includes(event.key)) return
      event.preventDefault()
      const direction = event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a' ? -1 : 1
      const distance = event.shiftKey ? 0.018 : 0.045
      setMagnetPosition((current) => clamp(current + direction * distance, -1, 1))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const delta = magnetPosition - previousPosition.current
    setVelocity(delta * 22)
    previousPosition.current = magnetPosition
    const timer = window.setTimeout(() => setVelocity(0), 180)
    return () => window.clearTimeout(timer)
  }, [magnetPosition])

  const fieldStrength = useMemo(() => {
    const firstCoilDistance = Math.abs(magnetPosition - 0.06)
    const secondCoilDistance = Math.abs(magnetPosition - 0.68)
    const firstField = 1 / (0.2 + firstCoilDistance * firstCoilDistance * 2.5)
    const secondField = coilCount === 2 ? 1 / (0.2 + secondCoilDistance * secondCoilDistance * 2.5) : 0
    return firstField + secondField
  }, [coilCount, magnetPosition])

  const voltage = clamp(velocity * fieldStrength * (magnetPolarity === 'NS' ? -1 : 1) * 1.7, -5, 5)
  const brightness = clamp(Math.abs(voltage) / 5, 0, 1)
  const magnetLeft = 10 + ((magnetPosition + 1) / 2) * 80
  const coilOneLeft = 42
  const coilTwoLeft = 72

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStart.current = { x: event.clientX, position: magnetPosition }
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return
    const delta = ((event.clientX - dragStart.current.x) / event.currentTarget.getBoundingClientRect().width) * 2
    setMagnetPosition(clamp(dragStart.current.position + delta, -1, 1))
  }

  const reset = () => {
    setMagnetPosition(0.18)
    setMagnetPolarity('NS')
    setVelocity(0)
  }

  return (
    <Paper elevation={0} sx={{ mb: 3, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 3, background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.06)}, ${theme.palette.background.paper} 42%)` }}>
      <Box sx={{ p: { xs: 2.5, md: 3 }, pb: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <BoltOutlinedIcon color="primary" />
              <Typography component="h2" variant="h5" sx={{ fontWeight: 800, letterSpacing: '-.025em' }}>Electromagnetic induction lab</Typography>
            </Stack>
            <Typography color="text.secondary" variant="body2">Move the magnet through the coils and observe Faraday&apos;s law in action.</Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="caption" color="text.secondary">Interactive model</Typography>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', boxShadow: '0 0 0 4px rgba(46, 125, 50, .12)' }} />
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
        <Box
          role="application"
          aria-label="Faraday's law electromagnetic induction simulation"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => { dragStart.current = null }}
          onPointerCancel={() => { dragStart.current = null }}
          sx={{ position: 'relative', height: { xs: 300, sm: 330 }, overflow: 'hidden', borderRadius: 2.5, border: 1, borderColor: 'divider', background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, #162b3c 0%, #0f1e2c 100%)' : 'linear-gradient(180deg, #edf7f7 0%, #f8fbfc 100%)', touchAction: 'none', cursor: dragStart.current ? 'grabbing' : 'grab', userSelect: 'none' }}>
          <Typography sx={{ position: 'absolute', top: 14, left: 16, color: 'text.secondary', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>Drag magnet or use ← →</Typography>
          <Box sx={{ position: 'absolute', left: '7%', right: '7%', bottom: 42, height: 2, bgcolor: alpha(theme.palette.text.primary, 0.15) }} />
          {[...Array(showFieldLines ? 4 : 0)].map((_, index) => <Box key={index} sx={{ position: 'absolute', left: `${18 - index * 2}%`, top: `${34 + index * 5}%`, width: '20%', height: `${34 + index * 5}%`, border: `1px solid ${alpha(theme.palette.info.main, 0.28 - index * 0.04)}`, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderRadius: '50%', transform: 'rotate(-8deg)' }} />)}
          <Typography sx={{ position: 'absolute', left: '8%', bottom: 16, color: 'text.secondary', fontSize: 11 }}>low field</Typography>
          <Typography sx={{ position: 'absolute', right: '8%', bottom: 16, color: 'text.secondary', fontSize: 11 }}>high field</Typography>

          <Box sx={{ position: 'absolute', left: `${magnetLeft}%`, top: '43%', width: { xs: 106, sm: 132 }, height: 42, transform: 'translateX(-50%)', display: 'flex', borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 8px 18px rgba(0,0,0,.2)', zIndex: 3 }}>
            <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', bgcolor: magnetPolarity === 'NS' ? '#cf4b55' : '#4773bd', color: 'white', fontWeight: 900, fontSize: 14 }}>{magnetPolarity === 'NS' ? 'N' : 'S'}</Box>
            <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', bgcolor: magnetPolarity === 'NS' ? '#4773bd' : '#cf4b55', color: 'white', fontWeight: 900, fontSize: 14 }}>{magnetPolarity === 'NS' ? 'S' : 'N'}</Box>
          </Box>

          {[{ left: coilOneLeft, label: '4 loops' }, ...(coilCount === 2 ? [{ left: coilTwoLeft, label: '2 loops' }] : [])].map((coil) => <Box key={coil.left} sx={{ position: 'absolute', left: `${coil.left}%`, top: '24%', width: 50, height: 145, transform: 'translateX(-50%)', zIndex: 2 }}>
            {[0, 1, 2, 3, 4].map((loop) => <Box key={loop} sx={{ position: 'absolute', inset: `${loop * 3}px ${loop * 2}px`, border: `3px solid ${alpha(theme.palette.warning.main, 0.88)}`, borderRadius: '50%', transform: 'rotate(12deg)' }} />)}
            <Typography sx={{ position: 'absolute', top: -25, left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', color: 'text.secondary', fontSize: 11, fontWeight: 700 }}>{coil.label}</Typography>
          </Box>)}

          <Box sx={{ position: 'absolute', left: '11%', top: '15%', display: { xs: 'none', sm: 'block' }, textAlign: 'center' }}>
            <Box sx={{ width: 74, height: 74, borderRadius: '50%', bgcolor: `rgba(255, 207, 64, ${0.18 + brightness * 0.55})`, boxShadow: `0 0 ${12 + brightness * 24}px rgba(255, 193, 7, ${0.18 + brightness * 0.5})`, border: 3, borderColor: 'warning.main', display: 'grid', placeItems: 'center' }}><Box sx={{ width: 24, height: 30, borderRadius: '50%', bgcolor: 'warning.light', opacity: 0.45 + brightness * 0.55 }} /></Box>
            <Typography variant="caption" color="text.secondary">Induction lamp</Typography>
          </Box>

          {showVoltmeter && <Box sx={{ position: 'absolute', right: '7%', top: 14, width: { xs: 116, sm: 138 }, p: 1.25, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.88), backdropFilter: 'blur(8px)' }}>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>VOLTMETER</Typography>
            <Box sx={{ position: 'relative', mt: 1, height: 34, overflow: 'hidden', borderBottom: 2, borderColor: 'text.secondary', borderRadius: '50% 50% 0 0', background: `conic-gradient(from 270deg at 50% 100%, ${theme.palette.error.main} 0deg, ${theme.palette.warning.main} 42deg, ${theme.palette.success.main} 90deg, ${theme.palette.warning.main} 138deg, ${theme.palette.error.main} 180deg, transparent 180deg)` }}>
              <Box sx={{ position: 'absolute', bottom: -2, left: '50%', width: 2, height: 31, bgcolor: 'text.primary', transformOrigin: 'bottom center', transform: `translateX(-50%) rotate(${voltage * 14}deg)`, transition: 'transform .18s ease' }} />
            </Box>
            <Typography variant="body2" sx={{ mt: .5, textAlign: 'center', fontWeight: 800, color: voltage === 0 ? 'text.secondary' : voltage > 0 ? 'success.main' : 'error.main' }}>{voltage > 0 ? '+' : ''}{voltage.toFixed(2)} V</Typography>
          </Box>}
        </Box>
      </Box>

      <Box sx={{ px: { xs: 2, md: 3 }, pb: 2.5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Box component="button" type="button" onClick={() => setCoilCount(1)} aria-pressed={coilCount === 1} sx={{ border: 1, borderColor: coilCount === 1 ? 'primary.main' : 'divider', borderRadius: 2, px: 1.5, py: .75, bgcolor: coilCount === 1 ? 'primary.main' : 'transparent', color: coilCount === 1 ? 'primary.contrastText' : 'text.secondary', font: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>1 coil</Box>
            <Box component="button" type="button" onClick={() => setCoilCount(2)} aria-pressed={coilCount === 2} sx={{ border: 1, borderColor: coilCount === 2 ? 'primary.main' : 'divider', borderRadius: 2, px: 1.5, py: .75, bgcolor: coilCount === 2 ? 'primary.main' : 'transparent', color: coilCount === 2 ? 'primary.contrastText' : 'text.secondary', font: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>2 coils</Box>
            <Box component="button" type="button" onClick={() => setMagnetPolarity((current) => current === 'NS' ? 'SN' : 'NS')} sx={{ display: 'flex', alignItems: 'center', gap: .5, border: 1, borderColor: 'divider', borderRadius: 2, px: 1.25, py: .75, bgcolor: 'transparent', color: 'text.secondary', font: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}><SwapHorizIcon fontSize="small" /> Flip magnet</Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <FormControlLabel control={<Checkbox size="small" checked={showFieldLines} onChange={(event) => setShowFieldLines(event.target.checked)} />} label={<Typography variant="body2">Field lines</Typography>} />
            <FormControlLabel control={<Switch size="small" checked={showVoltmeter} onChange={(event) => setShowVoltmeter(event.target.checked)} />} label={<Typography variant="body2">Voltmeter</Typography>} />
            <Box component="button" type="button" onClick={reset} aria-label="Reset simulation" sx={{ display: 'flex', alignItems: 'center', gap: .5, border: 0, bgcolor: 'transparent', color: 'text.secondary', font: 'inherit', fontSize: 13, cursor: 'pointer' }}><RestartAltIcon fontSize="small" /> Reset</Box>
          </Stack>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 2, pt: 1.75, borderTop: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={1} alignItems="center"><VisibilityOutlinedIcon fontSize="small" color="action" /><Typography variant="caption" color="text.secondary">Magnetic flux changes as the magnet moves past each coil.</Typography></Stack>
          <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 'auto' } }}><strong>ε = −N · ΔΦ / Δt</strong> · Lenz&apos;s law</Typography>
        </Stack>
      </Box>
    </Paper>
  )
}

export default FaradaySimulation
