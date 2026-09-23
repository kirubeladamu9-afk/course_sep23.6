import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useEffect, useMemo, useRef, useState } from 'react'

export type MagneticPlaygroundProps = { onComplete?: () => void }
type Pole = 'N' | 'S'
type MagnetId = 'a' | 'b'
type Interaction = 'attract' | 'repel'
type Feedback = 'idle' | 'correct' | 'incorrect'
type Magnet = { x: number; y: number; vx: number; vy: number; flipped: boolean }
type Round = { magnets: Record<MagnetId, Magnet>; target: Interaction }
type DragState = { id: MagnetId; offsetX: number; offsetY: number }

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const oppositePole = (pole: Pole): Pole => pole === 'N' ? 'S' : 'N'
const poleForEnd = (magnet: Magnet, end: 'left' | 'right'): Pole => {
  const base: Pole = end === 'left' ? 'N' : 'S'
  return magnet.flipped ? oppositePole(base) : base
}
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)
const createRound = (): Round => ({
  magnets: {
    a: { x: randomBetween(22, 38), y: randomBetween(37, 63), vx: 0, vy: 0, flipped: Math.random() > .5 },
    b: { x: randomBetween(62, 78), y: randomBetween(37, 63), vx: 0, vy: 0, flipped: Math.random() > .5 },
  },
  target: Math.random() > .5 ? 'repel' : 'attract',
})
const facingPoles = (a: Magnet, b: Magnet): { a: Pole; b: Pole } => {
  if (a.x <= b.x) return { a: poleForEnd(a, 'right'), b: poleForEnd(b, 'left') }
  return { a: poleForEnd(a, 'left'), b: poleForEnd(b, 'right') }
}
const poleName = (pole: Pole) => pole === 'N' ? 'North' : 'South'

const MagneticPlaygroundActivity: FC<MagneticPlaygroundProps> = ({ onComplete }) => {
  const round = useMemo(createRound, [])
  const [magnets, setMagnets] = useState(round.magnets)
  const [target, setTarget] = useState<Interaction>(round.target)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const [observed, setObserved] = useState<Record<Interaction, boolean>>({ attract: false, repel: false })
  const [stageSize, setStageSize] = useState({ width: 800, height: 420 })
  const stageRef = useRef<HTMLDivElement>(null)
  const magnetsRef = useRef(magnets)
  const stageSizeRef = useRef(stageSize)
  const dragRef = useRef<DragState | null>(null)
  const observedRef = useRef<Record<Interaction, boolean>>({ attract: false, repel: false })

  magnetsRef.current = magnets
  stageSizeRef.current = stageSize

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined
    const measure = () => {
      const bounds = stage.getBoundingClientRect()
      setStageSize({ width: bounds.width, height: bounds.height })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let animationFrame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const delta = Math.min(.032, Math.max(.001, (now - previous) / 1000))
      previous = now
      const current = magnetsRef.current
      const size = stageSizeRef.current
      const bodyWidth = Math.min(170, Math.max(128, size.width * .22))
      const bodyHeight = 64
      const aPx = { x: current.a.x / 100 * size.width, y: current.a.y / 100 * size.height }
      const bPx = { x: current.b.x / 100 * size.width, y: current.b.y / 100 * size.height }
      const vector = { x: bPx.x - aPx.x, y: bPx.y - aPx.y }
      const distance = Math.max(1, Math.hypot(vector.x, vector.y))
      const facing = facingPoles(current.a, current.b)
      const interaction: Interaction = facing.a === facing.b ? 'repel' : 'attract'
      const horizontalGap = Math.max(0, Math.abs(vector.x) - bodyWidth)
      const verticalGap = Math.max(0, Math.abs(vector.y) - bodyHeight)
      const closeEnough = horizontalGap < 26 && verticalGap < bodyHeight * .9
      const activeId = dragRef.current?.id ?? null

      if (closeEnough && activeId === null && !observedRef.current[interaction]) {
        observedRef.current = { ...observedRef.current, [interaction]: true }
        setObserved((currentObserved) => ({ ...currentObserved, [interaction]: true }))
      }

      setMagnets((currentMagnets) => {
        const next = { a: { ...currentMagnets.a }, b: { ...currentMagnets.b } }
        const active = dragRef.current?.id ?? null
        const currentFacing = facingPoles(currentMagnets.a, currentMagnets.b)
        const currentInteraction: Interaction = currentFacing.a === currentFacing.b ? 'repel' : 'attract'
        const currentAPx = { x: currentMagnets.a.x / 100 * size.width, y: currentMagnets.a.y / 100 * size.height }
        const currentBPx = { x: currentMagnets.b.x / 100 * size.width, y: currentMagnets.b.y / 100 * size.height }
        const currentVector = { x: currentBPx.x - currentAPx.x, y: currentBPx.y - currentAPx.y }
        const currentDistance = Math.max(1, Math.hypot(currentVector.x, currentVector.y))
        const currentHorizontalGap = Math.max(0, Math.abs(currentVector.x) - bodyWidth)
        const currentVerticalGap = Math.max(0, Math.abs(currentVector.y) - bodyHeight)
        const direction = { x: currentVector.x / currentDistance, y: currentVector.y / currentDistance }
        const strength = currentDistance < 520 ? Math.min(100, 2_000_000 / (currentDistance * currentDistance)) : 0
        const sign = currentInteraction === 'attract' ? 1 : -1
        const acceleration = { x: direction.x * strength * sign, y: direction.y * strength * sign }
        const applyMotion = (magnet: Magnet, id: MagnetId, accelerationX: number, accelerationY: number) => {
          if (active === id) return magnet
          const nextMagnet = { ...magnet }
          nextMagnet.vx = clamp((nextMagnet.vx + accelerationX * delta) * Math.pow(.9, delta * 60), -55, 55)
          nextMagnet.vy = clamp((nextMagnet.vy + accelerationY * delta) * Math.pow(.9, delta * 60), -55, 55)
          nextMagnet.x += nextMagnet.vx * delta
          nextMagnet.y += nextMagnet.vy * delta
          const halfWidth = bodyWidth / size.width * 50
          const halfHeight = bodyHeight / size.height * 50
          if (nextMagnet.x <= halfWidth || nextMagnet.x >= 100 - halfWidth) {
            nextMagnet.x = clamp(nextMagnet.x, halfWidth, 100 - halfWidth)
            nextMagnet.vx *= -.25
          }
          if (nextMagnet.y <= halfHeight || nextMagnet.y >= 100 - halfHeight) {
            nextMagnet.y = clamp(nextMagnet.y, halfHeight, 100 - halfHeight)
            nextMagnet.vy *= -.25
          }
          return nextMagnet
        }

        next.a = applyMotion(next.a, 'a', acceleration.x, acceleration.y)
        next.b = applyMotion(next.b, 'b', -acceleration.x, -acceleration.y)

        if (currentInteraction === 'attract' && currentHorizontalGap < 54 && currentVerticalGap < bodyHeight * .9) {
          const halfWidth = bodyWidth / size.width * 50
          const leftId: MagnetId = currentMagnets.a.x <= currentMagnets.b.x ? 'a' : 'b'
          const rightId: MagnetId = leftId === 'a' ? 'b' : 'a'
          const left = next[leftId]
          const right = next[rightId]
          const contactX = left.x + halfWidth * 2 + .6
          const correction = clamp((contactX - right.x) * delta * 7, -3, 3)
          if (active !== rightId) {
            right.x += correction
            right.vx = correction / Math.max(delta, .001)
          }
          if (Math.abs(contactX - right.x) < 1.1 && active !== rightId) {
            right.x = contactX
            right.vx = 0
            right.vy = 0
          }
        }

        magnetsRef.current = next
        return next
      })
      animationFrame = requestAnimationFrame(tick)
    }
    animationFrame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  const bodyWidth = Math.min(170, Math.max(128, stageSize.width * .22))
  const halfWidthPercent = bodyWidth / stageSize.width * 50
  const facing = facingPoles(magnets.a, magnets.b)
  const interaction: Interaction = facing.a === facing.b ? 'repel' : 'attract'
  const aPx = { x: magnets.a.x / 100 * stageSize.width, y: magnets.a.y / 100 * stageSize.height }
  const bPx = { x: magnets.b.x / 100 * stageSize.width, y: magnets.b.y / 100 * stageSize.height }
  const distancePx = Math.hypot(bPx.x - aPx.x, bPx.y - aPx.y)
  const horizontalGap = Math.max(0, Math.abs(bPx.x - aPx.x) - bodyWidth)
  const verticalGap = Math.max(0, Math.abs(bPx.y - aPx.y) - 64)
  const closeEnough = horizontalGap < 26 && verticalGap < 58
  const forceStrength = Math.round(Math.min(100, Math.pow(160 / Math.max(distancePx, 160), 2) * 100))
  const statusText = `${poleName(facing.a)} and ${poleName(facing.b)} ${interaction === 'attract' ? 'attract — opposites pull together!' : 'repel — they push apart!'}`
  const challengeCorrect = interaction === target && closeEnough && observed[interaction]
  const canComplete = feedback === 'correct' && challengeCorrect
  const challengePrompt = target === 'repel' ? 'Flip a magnet so they repel instead of attract.' : 'Flip a magnet so they attract instead of repel.'

  const fieldPaths = useMemo(() => {
    const point = (magnet: Magnet, other: Magnet, pole: Pole) => {
      const facingEnd = magnet.x <= other.x ? 'right' : 'left'
      const facingPole = poleForEnd(magnet, facingEnd)
      const end = facingPole === pole ? facingEnd : facingEnd === 'right' ? 'left' : 'right'
      return { x: magnet.x + (end === 'right' ? halfWidthPercent : -halfWidthPercent), y: magnet.y }
    }
    const aFacing = point(magnets.a, magnets.b, facing.a)
    const bFacing = point(magnets.b, magnets.a, facing.b)
    if (interaction === 'attract') {
      const north = facing.a === 'N' ? aFacing : bFacing
      const south = facing.a === 'S' ? aFacing : bFacing
      const midX = (north.x + south.x) / 2
      return [-1, 0, 1].map((offset) => `M ${north.x} ${north.y} C ${midX - 10} ${north.y + offset * 20}, ${midX + 10} ${south.y + offset * 20}, ${south.x} ${south.y}`)
    }
    const midX = (aFacing.x + bFacing.x) / 2
    return [-1, 0, 1].map((offset) => `M ${aFacing.x} ${aFacing.y} Q ${midX} ${aFacing.y + (offset === 0 ? 18 : offset * 28)} ${bFacing.x} ${bFacing.y}`)
  }, [facing, halfWidthPercent, interaction, magnets.a, magnets.b])

  const startDrag = (id: MagnetId, event: PointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current
    if (!stage) return
    const bounds = stage.getBoundingClientRect()
    const magnet = magnetsRef.current[id]
    dragRef.current = { id, offsetX: event.clientX - (bounds.left + magnet.x / 100 * bounds.width), offsetY: event.clientY - (bounds.top + magnet.y / 100 * bounds.height) }
    event.currentTarget.setPointerCapture(event.pointerId)
    setFeedback('idle')
  }

  const moveDrag = (id: MagnetId, event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current
    const stage = stageRef.current
    if (!drag || drag.id !== id || !stage) return
    const bounds = stage.getBoundingClientRect()
    const halfWidth = bodyWidth / bounds.width * 50
    const halfHeight = 64 / bounds.height * 50
    const x = clamp((event.clientX - bounds.left - drag.offsetX) / bounds.width * 100, halfWidth, 100 - halfWidth)
    const y = clamp((event.clientY - bounds.top - drag.offsetY) / bounds.height * 100, halfHeight, 100 - halfHeight)
    setMagnets((current) => {
      const next = { ...current, [id]: { ...current[id], x, y, vx: 0, vy: 0 } }
      magnetsRef.current = next
      return next
    })
  }

  const stopDrag = (id: MagnetId, event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (dragRef.current?.id === id) dragRef.current = null
  }

  const flipMagnet = (id: MagnetId) => {
    setMagnets((current) => {
      const next = { ...current, [id]: { ...current[id], flipped: !current[id].flipped, vx: 0, vy: 0 } }
      magnetsRef.current = next
      return next
    })
    setFeedback('idle')
  }

  const checkActivity = () => {
    setFeedback(challengeCorrect ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const reset = () => {
    const nextRound = createRound()
    setMagnets(nextRound.magnets)
    magnetsRef.current = nextRound.magnets
    setTarget(nextRound.target)
    observedRef.current = { attract: false, repel: false }
    setObserved({ attract: false, repel: false })
    dragRef.current = null
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Magnetic Playground</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Explore how magnets attract and repel.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Drag either bar magnet around the flat surface. Each magnet has a live force field and its own Flip control.</Typography>
      <Box ref={stageRef} sx={{ position: 'relative', minHeight: 420, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: '#eef3f7', touchAction: 'none' }}>
        <Typography variant="caption" sx={{ position: 'absolute', top: 10, left: 12, zIndex: 3, fontWeight: 800, color: 'text.secondary', letterSpacing: '.08em' }}>MAGNETIC FIELD SURFACE</Typography>
        <Box component="svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Live curved magnetic field lines" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: .72 }}>
          <defs><marker id="magnetic-field-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M 0 0 L 5 2.5 L 0 5 z" fill={interaction === 'attract' ? '#147d78' : '#c77716'} /></marker></defs>
          {fieldPaths.map((path, index) => <path key={index} d={path} fill="none" stroke={interaction === 'attract' ? '#147d78' : '#c77716'} strokeWidth={index === 1 ? 1.15 : .7} strokeDasharray={index === 1 ? 'none' : '2 2'} markerEnd="url(#magnetic-field-arrow)" />)}
        </Box>
        {(['a', 'b'] as MagnetId[]).map((id) => {
          const magnet = magnets[id]
          const leftPole = poleForEnd(magnet, 'left')
          const rightPole = poleForEnd(magnet, 'right')
          const isDragging = dragRef.current?.id === id
          return <Box key={id} sx={{ position: 'absolute', left: `${magnet.x}%`, top: `${magnet.y}%`, transform: 'translate(-50%, -50%)', zIndex: 2, width: bodyWidth + 22, textAlign: 'center' }}>
            <Box data-magnet-body component="div" role="button" tabIndex={0} aria-label={`Drag Magnet ${id === 'a' ? 'A' : 'B'}`} onPointerDown={(event) => startDrag(id, event)} onPointerMove={(event) => moveDrag(id, event)} onPointerUp={(event) => stopDrag(id, event)} onPointerCancel={(event) => stopDrag(id, event)} sx={{ width: bodyWidth, height: 64, display: 'flex', overflow: 'hidden', border: '3px solid #263746', borderRadius: 2, boxShadow: isDragging ? '0 9px 18px rgba(25, 45, 61, .3)' : '0 5px 12px rgba(25, 45, 61, .2)', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', outline: 'none', '&:focus-visible': { boxShadow: '0 0 0 3px #1976d2' } }}>
              <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', backgroundColor: leftPole === 'N' ? '#d94848' : '#3478c8', color: 'common.white', fontWeight: 900, lineHeight: 1.1 }}><span>{leftPole}</span><Typography component="span" variant="caption" sx={{ display: 'block', color: 'inherit', fontWeight: 800 }}>{leftPole === 'N' ? 'North' : 'South'}</Typography></Box>
              <Box sx={{ flex: 1, display: 'grid', placeItems: 'center', backgroundColor: rightPole === 'N' ? '#d94848' : '#3478c8', color: 'common.white', fontWeight: 900, lineHeight: 1.1 }}><span>{rightPole}</span><Typography component="span" variant="caption" sx={{ display: 'block', color: 'inherit', fontWeight: 800 }}>{rightPole === 'N' ? 'North' : 'South'}</Typography></Box>
            </Box>
            <Typography variant="caption" sx={{ display: 'block', mt: .5, fontWeight: 800 }}>Magnet {id === 'a' ? 'A' : 'B'}</Typography>
            <Button size="small" variant="outlined" onPointerDown={(event) => event.stopPropagation()} onClick={() => flipMagnet(id)} sx={{ mt: .35, minWidth: 72 }}>Flip</Button>
          </Box>
        })}
      </Box>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: interaction === 'attract' ? 'rgba(20, 125, 120, .1)' : 'rgba(199, 119, 22, .1)', border: 1, borderColor: interaction === 'attract' ? '#147d78' : '#c77716' }}>
        <Typography sx={{ fontWeight: 800 }}>{statusText}</Typography>
        <Typography variant="caption" color="text.secondary">Magnetic force: {forceStrength}% · Gap: {Math.round(horizontalGap)} px · Field lines update as the poles move.</Typography>
      </Paper>
      <Paper key={feedbackVersion} elevation={0} sx={{ position: 'relative', p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'magneticCelebrate .65s ease' : feedback === 'incorrect' ? 'magnetShake .45s ease-in-out' : 'none', '@keyframes magneticCelebrate': { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.025)' }, '100%': { transform: 'scale(1)' } }, '@keyframes magnetShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge: {challengePrompt}</Typography>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! {target === 'repel' ? 'Matching poles always push apart.' : 'Opposite poles pull together.'}</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Hint: {poleName(facing.a)} is facing {poleName(facing.b)}. Notice whether the facing poles match, and bring them close enough to observe the force.</Typography>}
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="outlined" onClick={checkActivity}>Check Activity</Button>
        <Button variant="contained" disabled={!canComplete} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button>
        <Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button>
      </Stack>
    </Stack>
  </Paper>
}

export default MagneticPlaygroundActivity
