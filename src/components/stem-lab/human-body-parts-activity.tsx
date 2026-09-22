import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { type DragEvent, type FC, useMemo, useState } from 'react'

type BodyPart = {
  id: string
  label: string
  explanation: string
  side: 'left' | 'right'
  top: string
}

type Feedback = { kind: 'success' | 'warning' | 'info'; text: string } | null

const bodyImage = 'https://cdn.builder.io/api/v1/image/assets%2F5beacf45d90f44a699a13c862f627209%2F0793f1e85f2f480490a6b5da6f4e1926?format=webp&width=800&height=1200'

const bodyParts: BodyPart[] = [
  { id: '1', label: 'Forehead muscle', explanation: 'This muscle helps lift the eyebrows and wrinkle the forehead.', side: 'left', top: '10.2%' },
  { id: '2', label: 'Eye muscle', explanation: 'This ring-shaped muscle helps close and blink the eye.', side: 'left', top: '13.5%' },
  { id: '3', label: 'Mouth muscle', explanation: 'This muscle helps move the lips for smiling, speaking, and eating.', side: 'left', top: '16.8%' },
  { id: '4', label: 'Neck muscle', explanation: 'This long muscle helps turn and bend the head and neck.', side: 'left', top: '20.1%' },
  { id: '5', label: 'Upper back muscle', explanation: 'This broad muscle helps support and move the neck and shoulders.', side: 'left', top: '23.4%' },
  { id: '6', label: 'Shoulder muscle', explanation: 'This muscle helps lift the arm away from the body.', side: 'left', top: '26.7%' },
  { id: '7', label: 'Chest muscle', explanation: 'This muscle helps bring the arm across the front of the body.', side: 'left', top: '30%' },
  { id: '8', label: 'Upper arm muscle', explanation: 'This front-of-arm muscle helps bend the elbow.', side: 'right', top: '37.5%' },
  { id: '9', label: 'Side body muscle', explanation: 'These side muscles help support the trunk and bend the body.', side: 'left', top: '35.8%' },
  { id: '10', label: 'Abdominal muscle', explanation: 'These front muscles help hold the trunk steady and bend the body.', side: 'right', top: '43.2%' },
  { id: '11', label: 'Hip muscle', explanation: 'This muscle helps lift and move the leg at the hip.', side: 'left', top: '47%' },
  { id: '12', label: 'Diagonal thigh muscle', explanation: 'This long muscle crosses the thigh and helps bend the hip and knee.', side: 'left', top: '60.5%' },
  { id: '13', label: 'Inner thigh muscle', explanation: 'This muscle pulls the leg inward toward the body.', side: 'right', top: '55.5%' },
  { id: '14', label: 'Inner knee muscle', explanation: 'This thigh muscle helps straighten the knee.', side: 'right', top: '63%' },
  { id: '15', label: 'Kneecap', explanation: 'This small bone protects the front of the knee joint.', side: 'left', top: '69%' },
  { id: '16', label: 'Front lower-leg muscle', explanation: 'This muscle helps lift the foot and toes upward.', side: 'left', top: '74.5%' },
  { id: '17', label: 'Outer calf muscle', explanation: 'This muscle on the outside of the lower leg helps move the foot.', side: 'left', top: '78.5%' },
  { id: '18', label: 'Calf muscle', explanation: 'This strong muscle helps push the foot down when walking or jumping.', side: 'right', top: '74.7%' },
  { id: '19', label: 'Side calf muscle', explanation: 'This muscle helps turn and steady the foot and ankle.', side: 'right', top: '78%' },
  { id: '20', label: 'Big-toe lifting muscle', explanation: 'This muscle helps lift the big toe upward.', side: 'left', top: '83%' },
  { id: '21', label: 'Toe-lifting muscles', explanation: 'These muscles help lift and straighten the toes.', side: 'right', top: '81%' },
]

const easierParts = new Set(['1', '7', '8', '10', '12', '15', '16', '18'])

const shuffle = <T,>(items: T[]) => {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

const HumanBodyPartsActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [showFewer, setShowFewer] = useState(false)
  const activeParts = useMemo(() => bodyParts.filter((part) => !showFewer || easierParts.has(part.id)), [showFewer])
  const [tray, setTray] = useState<string[]>(() => shuffle(bodyParts.map((part) => part.id)))
  const [placements, setPlacements] = useState<Record<string, string | null>>(() => Object.fromEntries(bodyParts.map((part) => [part.id, null])))
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [hoverSlot, setHoverSlot] = useState<string | null>(null)
  const [motion, setMotion] = useState<{ id: string; kind: 'pop' | 'wrong' } | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)

  const labeledCount = activeParts.filter((part) => placements[part.id]).length
  const allFilled = labeledCount === activeParts.length
  const getPart = (id: string) => bodyParts.find((part) => part.id === id)!

  const reset = (nextShowFewer = showFewer) => {
    const nextParts = bodyParts.filter((part) => !nextShowFewer || easierParts.has(part.id))
    setTray(shuffle(nextParts.map((part) => part.id)))
    setPlacements(Object.fromEntries(bodyParts.map((part) => [part.id, null])))
    setSelectedLabel(null)
    setHoverSlot(null)
    setMotion(null)
    setFeedback(null)
    setChecked(false)
    setCorrect(false)
  }

  const toggleFewer = () => {
    const next = !showFewer
    setShowFewer(next)
    reset(next)
  }

  const placeLabel = (slotId: string, labelId: string) => {
    const part = getPart(labelId)
    setSelectedLabel(null)
    setHoverSlot(null)
    setChecked(false)
    setCorrect(false)
    if (slotId !== labelId) {
      setMotion({ id: labelId, kind: 'wrong' })
      setFeedback({ kind: 'warning', text: `${part.label} bounced back to the tray. Try another pointer.` })
      window.setTimeout(() => setMotion(null), 520)
      return
    }
    setPlacements((current) => ({ ...current, [slotId]: labelId }))
    setTray((current) => current.filter((id) => id !== labelId))
    setMotion({ id: labelId, kind: 'pop' })
    setFeedback({ kind: 'success', text: `${part.label} is in the right place.` })
    window.setTimeout(() => setMotion(null), 520)
  }

  const handleDragStart = (event: DragEvent<HTMLElement>, labelId: string) => {
    event.dataTransfer.setData('application/x-body-label', labelId)
    event.dataTransfer.effectAllowed = 'move'
    setSelectedLabel(null)
  }

  const handleDrop = (event: DragEvent<HTMLElement>, slotId: string) => {
    event.preventDefault()
    const labelId = event.dataTransfer.getData('application/x-body-label') || selectedLabel
    if (labelId) placeLabel(slotId, labelId)
  }

  const checkActivity = () => {
    if (!allFilled) {
      setChecked(true)
      setFeedback({ kind: 'info', text: `${activeParts.length - labeledCount} label${activeParts.length - labeledCount === 1 ? '' : 's'} left. Fill every box before checking.` })
      return
    }
    const wrongCount = activeParts.filter((part) => placements[part.id] !== part.id).length
    setChecked(true)
    if (wrongCount) {
      const wrongSlots = activeParts.filter((part) => placements[part.id] !== part.id).map((part) => part.id)
      setPlacements((current) => wrongSlots.reduce((next, slotId) => ({ ...next, [slotId]: null }), current))
      setTray((current) => shuffle([...current, ...wrongSlots]))
      setCorrect(false)
      setFeedback({ kind: 'warning', text: `${wrongCount} label${wrongCount === 1 ? '' : 's'} still need another look. They returned to the tray.` })
      return
    }
    setCorrect(true)
    setFeedback({ kind: 'success', text: `You labeled all ${activeParts.length} parts of the body!` })
  }

  const renderSlot = (part: BodyPart) => {
    const labelId = placements[part.id]
    const isFilled = Boolean(labelId)
    const isHovered = hoverSlot === part.id
    const isEmptyAfterCheck = checked && !isFilled
    return <Box key={part.id} component="button" type="button" onClick={() => selectedLabel && placeLabel(part.id, selectedLabel)} onDragOver={(event) => { event.preventDefault(); setHoverSlot(part.id) }} onDragLeave={() => setHoverSlot(null)} onDrop={(event) => handleDrop(event, part.id)} aria-label={`${part.label} pointer${isFilled ? ` labeled ${part.label}` : ', empty'}`} sx={{ position: 'absolute', top: part.top, [part.side]: { xs: '3%', sm: '3%', md: '3%' }, width: { xs: '40%', sm: '28%', md: '24%' }, minHeight: { xs: 24, md: 32 }, p: { xs: .35, md: .6 }, textAlign: 'left', boxSizing: 'border-box', border: 2, borderStyle: 'dashed', borderColor: isHovered ? 'primary.main' : isEmptyAfterCheck ? 'error.main' : isFilled ? 'success.main' : 'rgba(56, 72, 64, .5)', borderRadius: 2, backgroundColor: isHovered ? 'rgba(23, 126, 115, .14)' : isFilled ? 'success.main' : isEmptyAfterCheck ? 'error.light' : 'rgba(255,255,255,.94)', boxShadow: isHovered ? 3 : 1, transform: isHovered ? 'translateY(-50%) scale(1.03)' : 'translateY(-50%)', transition: 'transform .18s ease, border-color .18s ease, background-color .18s ease', color: isFilled ? 'common.white' : 'text.primary', cursor: selectedLabel ? 'pointer' : 'default', zIndex: 3 }}>{isFilled ? <><Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{part.label}</Typography><Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' }, color: 'common.white', lineHeight: 1.1 }}>{part.explanation}</Typography></> : <Typography variant="caption" sx={{ fontWeight: 800 }}>Drop label here</Typography>}</Box>
  }

  return <Paper elevation={0} sx={{ p: { xs: 1.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Foundation" color="secondary" sx={{ mb: 1 }} /><Typography variant="h5">Label the Body</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Identify major parts of the human body.</Typography></Box><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1}><Chip label={`${labeledCount} of ${activeParts.length} labeled`} color={allFilled ? 'success' : 'default'} /><Stack direction="row" alignItems="center"><Switch checked={showFewer} onChange={toggleFewer} inputProps={{ 'aria-label': 'Show fewer body parts' }} /><Typography variant="body2">Show fewer (8 easiest)</Typography></Stack></Stack><Typography variant="h6" sx={{ textAlign: 'center' }}>Drag each label to the matching numbered pointer.</Typography><Box sx={{ position: 'relative', width: '100%', maxWidth: 800, mx: 'auto', aspectRatio: '2 / 3', overflow: 'hidden', borderRadius: 3, border: 1, borderColor: 'divider', backgroundColor: '#fff' }}><Box component="img" src={bodyImage} alt="Numbered full-body anatomical muscle diagram" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />{activeParts.map(renderSlot)}{correct && <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, transparent 35%, rgba(102, 187, 106, .32) 100%)', animation: 'bodyCelebrate 1.1s ease-out infinite', '@keyframes bodyCelebrate': { '0%': { opacity: 0, transform: 'scale(.9)' }, '55%': { opacity: 1 }, '100%': { opacity: 0, transform: 'scale(1.08)' } } }} />}</Box><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'rgba(23, 126, 115, .06)' }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Label tray</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{tray.map((id) => { const part = getPart(id); const isMoving = motion?.id === id; return <Button key={id} draggable onDragStart={(event) => handleDragStart(event, id)} onClick={() => setSelectedLabel(selectedLabel === id ? null : id)} variant={selectedLabel === id ? 'contained' : 'outlined'} color={motion?.kind === 'wrong' && isMoving ? 'warning' : 'primary'} sx={{ animation: motion?.kind === 'wrong' && isMoving ? 'bodyWobble .52s ease' : motion?.kind === 'pop' && isMoving ? 'bodyPop .52s ease' : 'none', '@keyframes bodyWobble': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } }, '@keyframes bodyPop': { '0%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } } }}>{part.label}</Button> })}</Stack></Paper>{feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : feedback.kind === 'warning' ? 'warning.main' : 'info.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : feedback.kind === 'warning' ? 'warning.light' : 'info.light' }}><Typography sx={{ fontWeight: 700 }}>{feedback.text}</Typography></Paper>}<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={checkActivity} disabled={correct} startIcon={<CheckCircleOutlineIcon />}>Check Activity</Button><Button variant="outlined" onClick={() => reset()} startIcon={<RestartAltIcon />}>Reset</Button><Button variant="contained" color="success" disabled={!correct} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button></Stack></Stack></Paper>
}

export default HumanBodyPartsActivity
