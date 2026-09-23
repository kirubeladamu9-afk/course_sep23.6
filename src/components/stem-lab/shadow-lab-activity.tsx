import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useRef, useState } from 'react'

export type ShadowLabProps = { onComplete?: () => void }
type ElementId = 'light' | 'object' | 'screen'
type Challenge = 'double' | 'left'
type Feedback = 'idle' | 'correct' | 'incorrect'

const elementLabels: Record<ElementId, string> = { light: 'Lamp', object: 'Tree', screen: 'Screen' }
const randomChallenge = (): Challenge => Math.random() > .5 ? 'double' : 'left'
const randomPosition = (min: number, max: number) => min + Math.random() * (max - min)

const ShadowLabActivity: FC<ShadowLabProps> = ({ onComplete }) => {
  const [positions, setPositions] = useState<Record<ElementId, number>>({ light: randomPosition(16, 34), object: randomPosition(42, 55), screen: randomPosition(75, 88) })
  const [challenge, setChallenge] = useState<Challenge>(randomChallenge)
  const [activeId, setActiveId] = useState<ElementId | null>(null)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const objectHeight = 52
  const lightDistance = Math.max(8, positions.object - positions.light)
  const screenDistance = Math.max(10, positions.screen - positions.object)
  const shadowHeight = Math.min(156, Math.max(24, objectHeight * (screenDistance / lightDistance)))
  const shadowOffset = Math.max(-24, Math.min(24, (positions.object - positions.light) * 1.15))
  const shadowX = Math.max(6, Math.min(94, positions.screen + shadowOffset))
  const shadowPointsLeft = shadowOffset < 0
  const challengeCorrect = challenge === 'double' ? shadowHeight / objectHeight >= 1.9 && shadowHeight / objectHeight <= 2.1 : shadowPointsLeft
  const completed = feedback === 'correct' && challengeCorrect

  const moveElement = (id: ElementId, event: PointerEvent<HTMLButtonElement>) => {
    const stage = stageRef.current
    if (!stage) return
    const bounds = stage.getBoundingClientRect()
    const next = Math.max(8, Math.min(92, ((event.clientX - bounds.left) / bounds.width) * 100))
    setPositions((current) => ({ ...current, [id]: next }))
    setFeedback('idle')
  }

  const startDrag = (id: ElementId, event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setActiveId(id)
    setFeedback('idle')
  }

  const stopDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setActiveId(null)
  }

  const reset = () => {
    setPositions({ light: randomPosition(16, 34), object: randomPosition(42, 55), screen: randomPosition(75, 88) })
    setChallenge(randomChallenge())
    setActiveId(null)
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  const checkActivity = () => {
    setFeedback(challengeCorrect ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const liveLabel = activeId === 'light' && lightDistance < 18
    ? 'The light is close, so the shadow is big!'
    : shadowPointsLeft
      ? 'The light moved to the side, so the shadow moved too.'
      : 'Move the lamp, tree, or screen and watch the shadow change.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Shadow Lab</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>See how light creates shadows.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Drag the lamp, tree, and screen across the stage. The shadow uses their actual positions and changes size and direction live.</Typography>
      <Box ref={stageRef} sx={{ position: 'relative', minHeight: 300, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #eaf4ff 0 68%, #d9c39d 68% 100%)', touchAction: 'none' }}>
        <Typography variant="caption" sx={{ position: 'absolute', left: 12, top: 10, fontWeight: 800, color: '#556b7d' }}>LIGHT STAGE</Typography>
        <Box sx={{ position: 'absolute', left: `${shadowX}%`, bottom: 35, width: 18, height: shadowHeight, transform: `translateX(-50%) skewY(${shadowPointsLeft ? -8 : 8}deg)`, transformOrigin: 'bottom center', borderRadius: '50% 50% 12% 12%', backgroundColor: 'rgba(44, 56, 77, .42)', transition: 'left .2s ease, height .2s ease, transform .2s ease', animation: feedback === 'correct' ? 'shadowCelebrate .7s ease-in-out infinite alternate' : feedback === 'incorrect' ? 'shadowShake .45s ease-in-out' : 'none', '@keyframes shadowCelebrate': { from: { opacity: .45 }, to: { opacity: .8, transform: `translateX(-50%) skewY(${shadowPointsLeft ? -8 : 8}deg) scale(1.08)` } }, '@keyframes shadowShake': { '0%, 100%': { transform: `translateX(-50%) skewY(${shadowPointsLeft ? -8 : 8}deg)` }, '50%': { transform: `translateX(calc(-50% + 6px)) skewY(${shadowPointsLeft ? -8 : 8}deg)` } } }} />
        {(['light', 'object', 'screen'] as ElementId[]).map((id) => { const left = positions[id]; const isActive = activeId === id; return <Box key={id} sx={{ position: 'absolute', left: `${left}%`, bottom: id === 'screen' ? 32 : 35, transform: 'translateX(-50%)', zIndex: 2, transition: isActive ? 'none' : 'left .2s ease' }}><Box component="button" type="button" onPointerDown={(event) => startDrag(id, event)} onPointerMove={(event) => activeId === id && moveElement(id, event)} onPointerUp={stopDrag} aria-label={`Drag the ${elementLabels[id]}`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: .5, border: 0, background: 'none', cursor: isActive ? 'grabbing' : 'grab', p: .25, color: 'text.primary', font: 'inherit', userSelect: 'none', touchAction: 'none', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' } }}>
          {id === 'light' && <Box sx={{ position: 'relative', width: 48, height: 48, borderRadius: '50%', backgroundColor: '#f6b73c', border: '3px solid #ad7410', boxShadow: '0 0 28px rgba(246,183,60,.65)', display: 'grid', placeItems: 'center', fontWeight: 900 }}>L<Box sx={{ position: 'absolute', left: 19, top: 42, width: 10, height: 20, backgroundColor: '#65738f' }} /></Box>}
          {id === 'object' && <Box sx={{ position: 'relative', width: 44, height: 70 }}><Box sx={{ position: 'absolute', left: 17, top: 0, width: 12, height: 48, backgroundColor: '#8c5f3d', borderRadius: 2 }} /><Box sx={{ position: 'absolute', left: 0, top: 8, width: 44, height: 42, borderRadius: '50% 45% 48% 52%', backgroundColor: '#4c9b65', border: '3px solid #2f6b43' }} /></Box>}
          {id === 'screen' && <Box sx={{ width: 28, height: 126, backgroundColor: '#f8f7f2', border: '4px solid #6e7f8f', boxShadow: '4px 4px 0 rgba(62,74,91,.25)' }} />}
          <Typography variant="caption" sx={{ fontWeight: 800 }}>{elementLabels[id]}</Typography>
        </Box></Box> })}
        <Typography variant="caption" sx={{ position: 'absolute', left: `${shadowX}%`, bottom: 10, transform: 'translateX(-50%)', color: '#4d5665', fontWeight: 700 }}>shadow</Typography>
      </Box>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: activeId ? 'primary.light' : 'action.hover', color: activeId ? 'primary.contrastText' : 'text.secondary' }}><Typography variant="body2" sx={{ fontWeight: activeId ? 800 : 500 }}>{liveLabel}</Typography><Typography variant="caption" sx={{ display: 'block', mt: .5 }}>Shadow height: {shadowHeight.toFixed(0)} px · Direction: {shadowPointsLeft ? 'left' : 'right'}</Typography></Paper>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider' }}><Typography sx={{ fontWeight: 800 }}>{challenge === 'double' ? 'Challenge: Make the shadow twice as tall as the tree.' : 'Challenge: Move the light so the shadow points left.'}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Use the live shadow geometry, then press Check Activity.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! The light position changed the shadow geometry.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Try moving the light or tree in another direction.</Typography>}</Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default ShadowLabActivity
