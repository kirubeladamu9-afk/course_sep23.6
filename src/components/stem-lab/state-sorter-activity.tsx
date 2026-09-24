import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AcUnitOutlinedIcon from '@mui/icons-material/AcUnitOutlined'
import AirOutlinedIcon from '@mui/icons-material/AirOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined'
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined'
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined'
import ReplayIcon from '@mui/icons-material/Replay'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined'
import { type DragEvent, type FC, type ReactNode, useEffect, useRef, useState } from 'react'

type Phase = 'Solid' | 'Liquid' | 'Gas'

type Substance = {
  id: string
  label: string
  phase: Phase
  icon: ReactNode
  color: string
}

type SimParticle = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  anchorX: number
  anchorY: number
  radius: number
}

type Feedback = {
  kind: 'success' | 'warning'
  message: string
}

const PHASES: Phase[] = ['Solid', 'Liquid', 'Gas']
const PHASE_COLORS: Record<Phase, string> = { Solid: '#4f8cff', Liquid: '#00897b', Gas: '#9c62d0' }
const PHASE_ICONS: Record<Phase, ReactNode> = { Solid: <AcUnitOutlinedIcon />, Liquid: <WaterDropOutlinedIcon />, Gas: <AirOutlinedIcon /> }
const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  Solid: 'Packed closely; neighbors hold each particle in place while it vibrates.',
  Liquid: 'Close together, but free to slide and flow around nearby particles.',
  Gas: 'Fast-moving particles spread out and bounce from the container walls.',
}
const SUBSTANCE_POOL: Substance[] = [
  { id: 'ice', label: 'Ice', phase: 'Solid', icon: <AcUnitOutlinedIcon />, color: '#73b7ff' },
  { id: 'rock', label: 'Rock', phase: 'Solid', icon: <EmojiObjectsOutlinedIcon />, color: '#78909c' },
  { id: 'chocolate', label: 'Chocolate', phase: 'Solid', icon: <ScienceOutlinedIcon />, color: '#9a6732' },
  { id: 'wood', label: 'Wood', phase: 'Solid', icon: <EmojiObjectsOutlinedIcon />, color: '#b5793c' },
  { id: 'water', label: 'Water', phase: 'Liquid', icon: <WaterDropOutlinedIcon />, color: '#2495e8' },
  { id: 'milk', label: 'Milk', phase: 'Liquid', icon: <OpacityOutlinedIcon />, color: '#d8e7ef' },
  { id: 'cooking-oil', label: 'Cooking oil', phase: 'Liquid', icon: <OpacityOutlinedIcon />, color: '#e7af2d' },
  { id: 'honey', label: 'Honey', phase: 'Liquid', icon: <WaterDropOutlinedIcon />, color: '#e69b19' },
  { id: 'steam', label: 'Steam', phase: 'Gas', icon: <CloudOutlinedIcon />, color: '#9caec8' },
  { id: 'air', label: 'Air', phase: 'Gas', icon: <AirOutlinedIcon />, color: '#8b75cf' },
  { id: 'oxygen', label: 'Oxygen', phase: 'Gas', icon: <AirOutlinedIcon />, color: '#4f8cff' },
  { id: 'carbon-dioxide', label: 'Carbon dioxide', phase: 'Gas', icon: <CloudOutlinedIcon />, color: '#8d74bd' },
]

const shuffle = <T,>(items: T[]) => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

const createRound = () => {
  const required = PHASES.map((phase) => shuffle(SUBSTANCE_POOL.filter((substance) => substance.phase === phase))[0])
  const requiredIds = new Set(required.map((substance) => substance.id))
  return shuffle([...required, ...shuffle(SUBSTANCE_POOL.filter((substance) => !requiredIds.has(substance.id)))].slice(0, 8))
}

const randomValue = (seed: number) => {
  const value = Math.sin(seed * 91.37) * 43758.5453
  return value - Math.floor(value)
}

const createParticleGroup = (phase: Phase, seed: number): SimParticle[] => {
  const count = phase === 'Solid' ? 12 : 10
  return Array.from({ length: count }, (_, index) => {
    const column = index % 4
    const row = Math.floor(index / 4)
    const randomX = randomValue(seed * 13 + index * 3)
    const randomY = randomValue(seed * 17 + index * 5)
    const anchorX = phase === 'Solid' ? 30 + column * 13 : phase === 'Liquid' ? 28 + column * 13 + (row % 2) * 4 : 12 + randomX * 76
    const anchorY = phase === 'Solid' ? 26 + row * 13 : phase === 'Liquid' ? 48 + row * 11 + randomY * 9 : 12 + randomY * 76
    const speed = phase === 'Gas' ? 18 + randomX * 16 : phase === 'Liquid' ? 3 + randomX * 4 : 1 + randomX * 1.5
    const angle = randomY * Math.PI * 2
    return {
      id: index,
      x: anchorX,
      y: anchorY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      anchorX,
      anchorY,
      radius: phase === 'Gas' ? 3.1 : 4.2,
    }
  })
}

const advanceParticleGroup = (particles: SimParticle[], phase: Phase, delta: number) => {
  const next = particles.map((particle) => ({ ...particle }))
  for (let index = 0; index < next.length; index += 1) {
    const particle = next[index]
    if (phase === 'Solid') {
      const springX = (particle.anchorX - particle.x) * 8
      const springY = (particle.anchorY - particle.y) * 8
      particle.vx = (particle.vx + springX * delta) * 0.86
      particle.vy = (particle.vy + springY * delta) * 0.86
      particle.x += particle.vx * delta
      particle.y += particle.vy * delta
    } else {
      if (phase === 'Liquid') {
        const centerPullX = (50 - particle.x) * 0.035
        const centerPullY = (58 - particle.y) * 0.035
        particle.vx = (particle.vx + centerPullX) * 0.996
        particle.vy = (particle.vy + centerPullY) * 0.996
      }
      for (let otherIndex = index + 1; otherIndex < next.length; otherIndex += 1) {
        const other = next[otherIndex]
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.01
        const minimumDistance = particle.radius + other.radius + 1
        if (distance < minimumDistance) {
          const push = (minimumDistance - distance) * 0.12
          const pushX = (dx / distance) * push
          const pushY = (dy / distance) * push
          particle.vx += pushX
          particle.vy += pushY
          other.vx -= pushX
          other.vy -= pushY
        }
      }
      particle.x += particle.vx * delta
      particle.y += particle.vy * delta
    }
    if (phase === 'Gas') {
      if (particle.x < particle.radius || particle.x > 100 - particle.radius) {
        particle.x = Math.max(particle.radius, Math.min(100 - particle.radius, particle.x))
        particle.vx *= -1
      }
      if (particle.y < particle.radius || particle.y > 100 - particle.radius) {
        particle.y = Math.max(particle.radius, Math.min(100 - particle.radius, particle.y))
        particle.vy *= -1
      }
    } else {
      particle.x = Math.max(10, Math.min(90, particle.x))
      particle.y = Math.max(12, Math.min(88, particle.y))
    }
  }
  return next
}

const TrayParticlePreview: FC<{ phase: Phase; color: string }> = ({ phase, color }) => {
  const positions = phase === 'Solid' ? [[4, 4], [12, 4], [4, 12], [12, 12]] : phase === 'Liquid' ? [[3, 8], [10, 5], [17, 10], [9, 15]] : [[2, 3], [17, 3], [4, 16], [18, 17]]
  const animationName = phase === 'Solid' ? 'stateTraySolid' : phase === 'Liquid' ? 'stateTrayLiquid' : 'stateTrayGas'
  return <Box aria-hidden="true" sx={{ position: 'relative', width: 24, height: 24, flexShrink: 0, '@keyframes stateTraySolid': { '0%, 100%': { transform: 'translate(0, 0)' }, '50%': { transform: 'translate(1px, -1px)' } }, '@keyframes stateTrayLiquid': { '0%, 100%': { transform: 'translate(0, 0)' }, '50%': { transform: 'translate(2px, -1px)' } }, '@keyframes stateTrayGas': { '0%, 100%': { transform: 'translate(0, 0)' }, '50%': { transform: 'translate(-2px, 2px)' } } }}>{positions.map(([left, top], index) => <Box key={index} sx={{ position: 'absolute', left, top, width: 5, height: 5, borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 4px ${color}`, animation: `${animationName} ${phase === 'Gas' ? 1.1 : phase === 'Liquid' ? 1.5 : 1.9}s ease-in-out ${index * -0.18}s infinite` }} />)}</Box>
}

const StateSorterActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [objects, setObjects] = useState<Substance[]>(createRound)
  const [placements, setPlacements] = useState<Record<string, Phase>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set())
  const [validated, setValidated] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [round, setRound] = useState(1)
  const [, setRenderTick] = useState(0)
  const simulationRef = useRef<Record<string, SimParticle[]>>({})

  const placedCount = Object.keys(placements).length
  const allPlaced = placedCount === objects.length

  useEffect(() => {
    let frame = 0
    let previousTime = performance.now()
    const animate = (time: number) => {
      const delta = Math.min((time - previousTime) / 1000, 0.032)
      previousTime = time
      Object.entries(placements).forEach(([id, phase]) => {
        const current = simulationRef.current[id]
        if (current) simulationRef.current[id] = advanceParticleGroup(current, phase, delta)
      })
      setRenderTick((current) => current + 1)
      frame = window.requestAnimationFrame(animate)
    }
    frame = window.requestAnimationFrame(animate)
    return () => window.cancelAnimationFrame(frame)
  }, [placements])

  const reset = () => {
    simulationRef.current = {}
    setObjects(createRound())
    setPlacements({})
    setSelectedId(null)
    setDraggedId(null)
    setWrongIds(new Set())
    setValidated(false)
    setCelebrating(false)
    setFeedback(null)
    setRound((current) => current + 1)
  }

  const placeObject = (id: string, phase: Phase) => {
    const object = objects.find((item) => item.id === id)
    if (!object) return
    setPlacements((current) => ({ ...current, [id]: phase }))
    simulationRef.current[id] = createParticleGroup(phase, object.id.length + round * 19)
    setSelectedId(null)
    setDraggedId(null)
    setWrongIds((current) => { const next = new Set(current); next.delete(id); return next })
    setValidated(false)
    setCelebrating(false)
    setFeedback(null)
  }

  const moveToTray = (id: string) => {
    setPlacements((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    delete simulationRef.current[id]
    setSelectedId(null)
    setDraggedId(null)
    setValidated(false)
    setCelebrating(false)
  }

  const getDraggedId = (event: DragEvent<HTMLElement>) => event.dataTransfer.getData('text/state-sorter-item') || draggedId
  const handleDrop = (event: DragEvent<HTMLElement>, phase?: Phase) => {
    event.preventDefault()
    const id = getDraggedId(event)
    if (!id) return
    if (phase) placeObject(id, phase)
    else moveToTray(id)
  }

  const checkActivity = () => {
    if (!allPlaced) return
    const incorrect = objects.filter((object) => placements[object.id] !== object.phase).map((object) => object.id)
    if (incorrect.length > 0) {
      setWrongIds(new Set(incorrect))
      setFeedback({ kind: 'warning', message: `${incorrect.length} substance${incorrect.length === 1 ? '' : 's'} need another look. Watch how close or spread out their particles should be, then try again.` })
      setValidated(false)
      setCelebrating(false)
      window.setTimeout(() => {
        setPlacements((current) => {
          const next = { ...current }
          incorrect.forEach((id) => { delete next[id]; delete simulationRef.current[id] })
          return next
        })
        setWrongIds(new Set())
      }, 650)
      return
    }
    setValidated(true)
    setCelebrating(true)
    setFeedback({ kind: 'success', message: 'Right! In a solid, particles are packed tightly and can only vibrate in place.' })
  }

  const renderObject = (object: Substance) => {
    const placedIn = placements[object.id]
    const selected = selectedId === object.id
    const incorrect = wrongIds.has(object.id)
    return <Box
      key={object.id}
      component="button"
      type="button"
      draggable
      onDragStart={(event) => {
        setDraggedId(object.id)
        setSelectedId(object.id)
        event.dataTransfer.setData('text/state-sorter-item', object.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      onDragEnd={() => setDraggedId(null)}
      onClick={(event) => {
        event.stopPropagation()
        setSelectedId((current) => current === object.id ? null : object.id)
      }}
      aria-label={`${placedIn ? 'Move' : 'Select'} ${object.label}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        minWidth: 0,
        p: 1.1,
        textAlign: 'left',
        border: 2,
        borderColor: incorrect ? 'error.main' : selected ? 'primary.main' : 'divider',
        borderRadius: 2,
        backgroundColor: incorrect ? 'error.light' : selected ? 'action.selected' : 'background.paper',
        color: 'text.primary',
        cursor: 'grab',
        userSelect: 'none',
        animation: incorrect ? 'stateSorterShake .55s ease' : undefined,
        transition: 'border-color .2s ease, transform .2s ease',
        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
        '&:active': { cursor: 'grabbing' },
      }}
    ><Box sx={{ display: 'grid', placeItems: 'center', width: 36, height: 36, flexShrink: 0, borderRadius: 1.5, color: object.color, backgroundColor: `${object.color}22` }}>{object.icon}</Box><TrayParticlePreview phase={object.phase} color={object.color} /><Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{object.label}</Typography><Typography variant="caption" color="text.secondary">{placedIn ? `In ${placedIn}` : selected ? 'Now choose a state' : 'Tap or drag'}</Typography></Box></Box>
  }

  return <Box sx={{
    '@keyframes stateSorterShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-7px)' }, '75%': { transform: 'translateX(7px)' } },
    '@keyframes stateSorterCelebrate': { '0%, 100%': { transform: 'translateY(0)' }, '35%': { transform: 'translateY(-7px) rotate(-1deg)' }, '70%': { transform: 'translateY(-3px) rotate(1deg)' } },
  }}>
    <Stack spacing={2.5}>
      <Box><Chip label="State Sorter" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Sort the states of matter</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore the three states of matter.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}><Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Sort these substances into their correct state at room temperature.</Typography><Typography variant="caption" color="text.secondary">Drop a substance into a container, or tap it and then tap a container.</Typography></Box><Chip label={`${placedCount} of ${objects.length} sorted`} color={allPlaced ? 'success' : 'default'} aria-label={`${placedCount} of ${objects.length} sorted`} /></Stack>
      <Paper elevation={0} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event)} sx={{ p: 1.5, minHeight: 128, border: 1, borderStyle: 'dashed', borderColor: selectedId ? 'primary.main' : 'divider', backgroundColor: 'background.default' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Substance tray</Typography><Typography variant="caption" color="text.secondary">Round {round} · generated examples</Typography></Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 1 }}>{objects.filter((object) => !placements[object.id]).map(renderObject)}{!objects.some((object) => !placements[object.id]) && <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1', p: 2, textAlign: 'center' }}>All substances are placed. Check the particle behavior when you are ready.</Typography>}</Box>
      </Paper>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.5 }}>
        {PHASES.map((phase) => {
          const binObjects = objects.filter((object) => placements[object.id] === phase)
          const particles = binObjects.flatMap((object) => (simulationRef.current[object.id] ?? []).map((particle) => ({ ...particle, color: object.color })))
          const hasTarget = Boolean(selectedId)
          return <Paper key={phase} role="button" tabIndex={0} aria-label={`${phase} container${hasTarget ? ', place selected substance here' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event, phase)} onClick={() => selectedId && placeObject(selectedId, phase)} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && selectedId) { event.preventDefault(); placeObject(selectedId, phase) } }} elevation={0} sx={{ position: 'relative', minHeight: 296, p: 1.5, pt: 1, border: 3, borderTop: 10, borderColor: hasTarget ? PHASE_COLORS[phase] : 'divider', borderRadius: '14px 14px 24px 24px', backgroundColor: hasTarget ? `${PHASE_COLORS[phase]}10` : 'background.paper', cursor: hasTarget ? 'copy' : 'default', transition: 'border-color .2s ease, background-color .2s ease' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', color: PHASE_COLORS[phase], backgroundColor: `${PHASE_COLORS[phase]}22` }}>{PHASE_ICONS[phase]}</Box><Box><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{phase}</Typography><Typography variant="caption" color="text.secondary">{binObjects.length} substance{binObjects.length === 1 ? '' : 's'}</Typography></Box></Stack>
            <Box role="img" aria-label={`${phase} particle container`} sx={{ position: 'relative', height: 136, overflow: 'hidden', borderRadius: 2, border: 1, borderColor: `${PHASE_COLORS[phase]}55`, background: `radial-gradient(circle at 50% 45%, ${PHASE_COLORS[phase]}18, transparent 70%)` }}>{particles.map((particle, index) => <Box key={`${particle.id}-${index}`} sx={{ position: 'absolute', left: `${particle.x}%`, top: `${particle.y}%`, width: particle.radius * 2, height: particle.radius * 2, borderRadius: '50%', backgroundColor: particle.color, border: '1px solid rgba(255,255,255,.85)', boxShadow: `0 1px 4px ${particle.color}88`, transform: 'translate(-50%, -50%)' }} />)}{particles.length === 0 && <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', p: 2 }}>Empty container<br />Drop particles here</Typography>}</Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, lineHeight: 1.45 }}>{PHASE_DESCRIPTIONS[phase]}</Typography><Stack spacing={.5} sx={{ mt: 1 }}>{binObjects.map(renderObject)}</Stack>
          </Paper>
        })}
      </Box>
      {feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : 'warning.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : 'warning.light', animation: celebrating ? 'stateSorterCelebrate .9s ease-in-out infinite' : undefined }}><Typography sx={{ fontWeight: 700 }}>{feedback.message}</Typography></Paper>}
      {!allPlaced && <Typography variant="caption" color="text.secondary">Sort all {objects.length} substances to unlock Check Activity.</Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={!allPlaced || validated} startIcon={<CheckCircleOutlineIcon />}>Check Activity</Button><Button variant="contained" onClick={onComplete} disabled={!validated}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Box>
}

export default StateSorterActivity
