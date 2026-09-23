import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useEffect, useRef, useState } from 'react'

export type ShadowLabProps = { onComplete?: () => void }
type ElementId = 'light' | 'object' | 'screen'
type Challenge = 'double' | 'left'
type Feedback = 'idle' | 'correct' | 'incorrect'
type RayPoint = { x: number; y: number }

const stageHeight = 300
const treeTop = 168
const treeHeight = 52
const treeBottom = treeTop + treeHeight
const treeCanopyHeight = 36
const treeTrunkTop = 24
const treeTrunkHeight = treeHeight - treeTrunkTop
const treeWidth = 44
const screenTop = 100
const screenHeight = 140
const screenBottom = screenTop + screenHeight
const screenWidth = 120
const elementLabels: Record<ElementId, string> = { light: 'Lamp', object: 'Tree', screen: 'Screen' }
const randomChallenge = (): Challenge => Math.random() > .5 ? 'double' : 'left'
const randomPosition = (min: number, max: number) => min + Math.random() * (max - min)
const createInitialPositions = () => ({ light: randomPosition(16, 34), object: randomPosition(42, 55), screen: randomPosition(75, 88) })

const ShadowLabActivity: FC<ShadowLabProps> = ({ onComplete }) => {
  const [positions, setPositions] = useState<Record<ElementId, number>>(createInitialPositions)
  const [lightY, setLightY] = useState(220)
  const [challenge, setChallenge] = useState<Challenge>(randomChallenge)
  const [activeId, setActiveId] = useState<ElementId | null>(null)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const [stageWidth, setStageWidth] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const treeHalfWidthPercent = stageWidth > 0 ? (treeWidth / 2 / stageWidth) * 100 : 2.2

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const updateSize = () => setStageWidth(stage.clientWidth)
    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [])

  const sourceToObject = positions.object - positions.light
  const sourceToScreen = positions.screen - positions.light
  const safeSourceToObject = Math.abs(sourceToObject) < 0.5 ? (sourceToObject < 0 ? -0.5 : 0.5) : sourceToObject
  const projectionScale = sourceToScreen / safeSourceToObject
  const absoluteScale = Math.max(0, Math.abs(projectionScale))
  const projectPoint = (point: RayPoint): RayPoint => ({
    x: positions.light + projectionScale * (point.x - positions.light),
    y: lightY + projectionScale * (point.y - lightY),
  })
  const projectedTreeTop = projectPoint({ x: positions.object, y: treeTop }).y
  const projectedTreeBottom = projectPoint({ x: positions.object, y: treeBottom }).y
  const rawShadowTop = Math.min(projectedTreeTop, projectedTreeBottom)
  const rawShadowBottom = Math.max(projectedTreeTop, projectedTreeBottom)
  const projectedTreeLeft = projectPoint({ x: positions.object - treeHalfWidthPercent, y: treeTop + treeCanopyHeight / 2 }).x
  const projectedTreeRight = projectPoint({ x: positions.object + treeHalfWidthPercent, y: treeTop + treeCanopyHeight / 2 }).x
  const rawShadowLeft = Math.min(projectedTreeLeft, projectedTreeRight)
  const rawShadowRight = Math.max(projectedTreeLeft, projectedTreeRight)
  const visibleShadowTop = Math.max(screenTop, rawShadowTop)
  const visibleShadowBottom = Math.min(screenBottom, rawShadowBottom)
  const shadowHeight = Math.max(0, visibleShadowBottom - visibleShadowTop)
  const shadowWidth = stageWidth > 0 ? Math.max(0, ((rawShadowRight - rawShadowLeft) / 100) * stageWidth) : treeWidth * absoluteScale
  const shadowLeft = stageWidth > 0 ? screenWidth / 2 + ((rawShadowLeft - positions.screen) / 100) * stageWidth : screenWidth / 2 - shadowWidth / 2
  const shadowTop = rawShadowTop - screenTop
  const shadowPointsLeft = positions.light > positions.object
  const challengeCorrect = challenge === 'double'
    ? shadowHeight / treeHeight >= 1.9 && shadowHeight / treeHeight <= 2.1
    : shadowPointsLeft
  const completed = feedback === 'correct' && challengeCorrect
  const rayPoints: RayPoint[] = [
    { x: positions.object, y: treeTop },
    { x: positions.object - treeHalfWidthPercent, y: treeTop + 16 },
    { x: positions.object + treeHalfWidthPercent, y: treeTop + 16 },
    { x: positions.object - treeHalfWidthPercent * .3, y: treeBottom },
    { x: positions.object + treeHalfWidthPercent * .3, y: treeBottom },
  ]
  const rayTargets = rayPoints.map(projectPoint)

  const moveElement = (id: ElementId, event: PointerEvent<HTMLButtonElement>) => {
    const stage = stageRef.current
    if (!stage) return
    const bounds = stage.getBoundingClientRect()
    const next = Math.max(8, Math.min(92, ((event.clientX - bounds.left) / bounds.width) * 100))
    setPositions((current) => ({ ...current, [id]: next }))
    if (id === 'light') setLightY(Math.max(52, Math.min(stageHeight - 48, event.clientY - bounds.top)))
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
    setPositions(createInitialPositions())
    setLightY(220)
    setChallenge(randomChallenge())
    setActiveId(null)
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  const checkActivity = () => {
    setFeedback(challengeCorrect ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const liveLabel = activeId === 'light' && absoluteScale > 2
    ? 'The light is close, so the shadow is big!'
    : activeId === 'light' && lightY < 150
      ? 'Raise or lower the lamp to change the shadow direction.'
      : shadowPointsLeft
        ? 'The light moved to the side, so the shadow moved too.'
        : 'Move the lamp, tree, or screen and watch the shadow change.'
  const lampPointY = lightY
  const shadowIsVisible = shadowHeight > 0 && shadowWidth > 0
  const shadowShape = shadowIsVisible ? (
    <Box sx={{
      position: 'absolute',
      left: shadowLeft,
      top: shadowTop,
      width: shadowWidth,
      height: Math.max(treeHeight * absoluteScale, 0),
      overflow: 'hidden',
      opacity: .72,
      mixBlendMode: 'multiply',
      pointerEvents: 'none',
    }}>
      <Box sx={{ position: 'absolute', left: 0, top: 0, width: '100%', height: treeCanopyHeight * absoluteScale, borderRadius: '50% 45% 48% 52%', backgroundColor: 'rgba(44, 56, 77, .84)' }} />
      <Box sx={{ position: 'absolute', left: '36%', top: treeTrunkTop * absoluteScale, width: '28%', height: treeTrunkHeight * absoluteScale, borderRadius: '2px 2px 0 0', backgroundColor: 'rgba(44, 56, 77, .84)' }} />
    </Box>
  ) : null

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Shadow Lab</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>See how light creates shadows.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Drag the lamp, tree, and screen across the stage. The shadow uses their actual positions and changes size and direction live.</Typography>
      <Box ref={stageRef} sx={{ position: 'relative', height: stageHeight, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #eaf4ff 0 68%, #d9c39d 68% 100%)', touchAction: 'none' }}>
        <Typography variant="caption" sx={{ position: 'absolute', left: 12, top: 10, fontWeight: 800, color: '#556b7d', zIndex: 1 }}>LIGHT STAGE</Typography>
        <Box component="svg" viewBox={`0 0 100 ${stageHeight}`} preserveAspectRatio="none" aria-hidden="true" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
          {rayTargets.map((target, index) => <line key={index} x1={positions.light} y1={lampPointY} x2={target.x} y2={target.y} stroke="rgba(79, 105, 132, .5)" strokeWidth=".35" strokeDasharray="1.6 1.5" />)}
        </Box>
        <Box sx={{ position: 'absolute', left: `${positions.screen}%`, top: screenTop, transform: 'translateX(-50%)', zIndex: 2, transition: activeId === 'screen' ? 'none' : 'left .2s ease' }}>
          <Box component="button" type="button" onPointerDown={(event) => startDrag('screen', event)} onPointerMove={(event) => activeId === 'screen' && moveElement('screen', event)} onPointerUp={stopDrag} aria-label="Drag the Screen" sx={{ position: 'relative', display: 'block', width: screenWidth + 16, height: screenHeight + 30, border: 0, background: 'none', cursor: activeId === 'screen' ? 'grabbing' : 'grab', p: 0, color: 'text.primary', font: 'inherit', userSelect: 'none', touchAction: 'none', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' } }}>
            <Box sx={{ position: 'absolute', left: 8, top: -4, width: screenWidth + 8, height: screenHeight + 8, backgroundColor: '#f8f7f2', border: '4px solid #6e7f8f', boxShadow: '4px 4px 0 rgba(62,74,91,.25)' }}>
              <Box sx={{ position: 'absolute', left: 4, top: 4, width: screenWidth, height: screenHeight, overflow: 'hidden' }}>
                {shadowShape}
                <Typography variant="caption" sx={{ position: 'absolute', left: '50%', bottom: 4, transform: 'translateX(-50%)', color: '#4d5665', fontWeight: 700, whiteSpace: 'nowrap', zIndex: 1 }}>shadow</Typography>
              </Box>
            </Box>
            <Typography variant="caption" sx={{ position: 'absolute', top: screenHeight + 5, left: '50%', transform: 'translateX(-50%)', fontWeight: 800 }}>Screen</Typography>
          </Box>
        </Box>
        {(['light', 'object'] as ElementId[]).map((id) => {
          const isActive = activeId === id
          const top = id === 'light' ? lightY - 24 : treeTop
          return <Box key={id} sx={{ position: 'absolute', left: `${positions[id]}%`, top, transform: 'translateX(-50%)', zIndex: 3, transition: isActive ? 'none' : 'left .2s ease, top .2s ease' }}>
            <Box component="button" type="button" onPointerDown={(event) => startDrag(id, event)} onPointerMove={(event) => activeId === id && moveElement(id, event)} onPointerUp={stopDrag} aria-label={`Drag the ${elementLabels[id]}`} sx={{ position: 'relative', display: 'block', width: id === 'light' ? 64 : 60, height: id === 'light' ? 80 : 80, border: 0, background: 'none', cursor: isActive ? 'grabbing' : 'grab', p: 0, color: 'text.primary', font: 'inherit', userSelect: 'none', touchAction: 'none', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' } }}>
              {id === 'light' && <Box sx={{ position: 'absolute', left: 8, top: 0, width: 48, height: 48, borderRadius: '50%', backgroundColor: '#f6b73c', border: '3px solid #ad7410', boxShadow: '0 0 28px rgba(246,183,60,.65)', display: 'grid', placeItems: 'center', fontWeight: 900 }}>L<Box sx={{ position: 'absolute', left: 19, top: 42, width: 10, height: 20, backgroundColor: '#65738f' }} /></Box>}
              {id === 'object' && <Box sx={{ position: 'absolute', left: 8, top: 0, width: treeWidth, height: treeHeight }}><Box sx={{ position: 'absolute', left: 16, top: treeTrunkTop, width: 12, height: treeTrunkHeight, backgroundColor: '#8c5f3d', borderRadius: 2 }} /><Box sx={{ position: 'absolute', left: 0, top: 0, width: treeWidth, height: treeCanopyHeight, borderRadius: '50% 45% 48% 52%', backgroundColor: '#4c9b65', border: '3px solid #2f6b43' }} /></Box>}
              <Typography variant="caption" sx={{ position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)', fontWeight: 800, whiteSpace: 'nowrap' }}>{elementLabels[id]}</Typography>
            </Box>
          </Box>
        })}
      </Box>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: activeId ? 'primary.light' : 'action.hover', color: activeId ? 'primary.contrastText' : 'text.secondary' }}><Typography variant="body2" sx={{ fontWeight: activeId ? 800 : 500 }}>{liveLabel}</Typography><Typography variant="caption" sx={{ display: 'block', mt: .5 }}>Shadow height: {shadowHeight.toFixed(0)} px · Direction: {shadowPointsLeft ? 'left' : 'right'}</Typography></Paper>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider' }}><Typography sx={{ fontWeight: 800 }}>{challenge === 'double' ? 'Challenge: Make the shadow twice as tall as the tree.' : 'Challenge: Move the light so the shadow points left.'}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Use the live shadow geometry, then press Check Activity.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! The light position changed the shadow geometry.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Try moving the light or tree in another direction.</Typography>}</Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default ShadowLabActivity
