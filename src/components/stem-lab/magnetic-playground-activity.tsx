import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useRef, useState } from 'react'

export type MagneticPlaygroundProps = { onComplete?: () => void }
type Pole = 'N' | 'S'
type Feedback = 'idle' | 'correct' | 'incorrect'

const MagneticPlaygroundActivity: FC<MagneticPlaygroundProps> = ({ onComplete }) => {
  const [positions, setPositions] = useState({ left: 30, right: 70 })
  const [flipped, setFlipped] = useState(false)
  const [target, setTarget] = useState<'attract' | 'repel'>('attract')
  const [active, setActive] = useState<'left' | 'right' | null>(null)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const leftPole: Pole = flipped ? 'S' : 'N'
  const rightPole: Pole = flipped ? 'N' : 'S'
  const distance = Math.abs(positions.right - positions.left)
  const interaction = leftPole === rightPole ? 'repel' : 'attract'
  const challengeCorrect = interaction === target && distance < 22
  const completed = feedback === 'correct' && challengeCorrect
  const interactionLabel = interaction === 'attract' ? 'Opposite poles attract!' : 'Like poles repel!'

  const updatePosition = (id: 'left' | 'right', event: PointerEvent<HTMLButtonElement>) => {
    const stage = stageRef.current
    if (!stage) return
    const bounds = stage.getBoundingClientRect()
    const next = Math.max(12, Math.min(88, ((event.clientX - bounds.left) / bounds.width) * 100))
    setPositions((current) => ({ ...current, [id]: next }))
    setFeedback('idle')
  }
  const startDrag = (id: 'left' | 'right', event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setActive(id)
  }
  const stopDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setActive(null)
  }
  const checkActivity = () => {
    setFeedback(challengeCorrect ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }
  const reset = () => {
    setPositions({ left: 30, right: 70 })
    setFlipped(false)
    setTarget(Math.random() > .5 ? 'attract' : 'repel')
    setActive(null)
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }
  const gap = Math.max(8, distance * 1.5)

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Magnetic Playground</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how magnets attract and repel.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Drag the magnets near each other. Flip the right magnet to compare opposite and like poles.</Typography>
      <Box ref={stageRef} sx={{ position: 'relative', minHeight: 250, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #eef7ff 0 70%, #d5c19e 70% 100%)', touchAction: 'none' }}>
        <Typography variant="caption" sx={{ position: 'absolute', top: 10, left: 12, fontWeight: 800, color: 'text.secondary' }}>MAGNET STAGE</Typography>
        <Box sx={{ position: 'absolute', left: `${(positions.left + positions.right) / 2}%`, top: '43%', width: gap, height: 4, transform: 'translate(-50%, -50%)', backgroundColor: interaction === 'attract' ? 'success.main' : 'warning.main', opacity: .45, transition: 'left .2s ease, width .2s ease' }} />
        {(['left', 'right'] as const).map((id) => { const pole = id === 'left' ? leftPole : rightPole; const isActive = active === id; return <Box key={id} sx={{ position: 'absolute', left: `${positions[id]}%`, top: '42%', transform: 'translate(-50%, -50%)', transition: isActive ? 'none' : 'left .2s ease', zIndex: 2 }}><Box component="button" type="button" onPointerDown={(event) => startDrag(id, event)} onPointerMove={(event) => active === id && updatePosition(id, event)} onPointerUp={stopDrag} aria-label={`Drag ${id} magnet with ${pole} pole`} sx={{ width: 76, height: 76, borderRadius: '50%', border: '5px solid', borderColor: pole === 'N' ? '#dc5b57' : '#477acb', background: pole === 'N' ? 'linear-gradient(135deg, #f28172, #c94045)' : 'linear-gradient(135deg, #75a4ee, #3766b4)', color: 'common.white', fontSize: 28, fontWeight: 900, cursor: isActive ? 'grabbing' : 'grab', boxShadow: feedback === 'correct' ? '0 0 0 8px rgba(46, 125, 50, .22)' : '0 5px 12px rgba(48,67,91,.24)', animation: feedback === 'correct' ? 'magnetBounce .6s ease-in-out infinite alternate' : 'none', '@keyframes magnetBounce': { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(-8px)' } } }}>{pole}</Box><Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: .5, fontWeight: 800 }}>{id === 'left' ? 'Magnet A' : 'Magnet B'}</Typography></Box> })}
      </Box>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: 'action.hover', textAlign: 'center' }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{interactionLabel}</Typography><Typography variant="caption" color="text.secondary">Distance between magnets: {distance.toFixed(0)}%</Typography></Paper>
      <Button variant="outlined" onClick={() => { setFlipped((value) => !value); setFeedback('idle') }} sx={{ alignSelf: 'center' }}>Flip Magnet B</Button>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'incorrect' ? 'magnetShake .45s ease-in-out' : 'none', '@keyframes magnetShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } } }}><Typography sx={{ fontWeight: 800 }}>Challenge: Make the magnets {target === 'attract' ? 'attract' : 'repel'} when they are close.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Correct! The poles explain the magnetic force.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Try changing the pole or moving the magnets closer.</Typography>}</Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default MagneticPlaygroundActivity
