import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type DragEvent, type FC, useState } from 'react'

type PlantPart = {
  id: string
  label: string
  explanation: string
  left: string
  top: string
}

type Feedback = { kind: 'success' | 'warning' | 'info'; text: string } | null

const plantImage = 'https://cdn.builder.io/api/v1/image/assets%2F2030fde0364c4f30a369df2c467b746e%2F99cc102e631f4130bd1cdb596ce35381?format=webp&width=800&height=1200'

const plantParts: PlantPart[] = [
  { id: 'leaflet', label: 'Leaflet (young leaf)', explanation: 'A young leaf unfolds and begins making food for the plant.', left: '3%', top: '12%' },
  { id: 'flower', label: 'Flower', explanation: 'A flower helps the plant reproduce and can develop into fruit.', left: '72%', top: '12%' },
  { id: 'leaf', label: 'Leaf', explanation: 'Leaves use sunlight, air, and water to make food.', left: '78%', top: '34%' },
  { id: 'fruit', label: 'Fruit', explanation: 'Fruit develops from the flower and holds the plant’s seeds.', left: '76%', top: '53%' },
  { id: 'stem', label: 'Stem', explanation: 'The stem supports the plant and carries water to its leaves.', left: '3%', top: '63%' },
  { id: 'roots', label: 'Roots', explanation: 'Roots anchor the plant and take in water and minerals from the soil.', left: '69%', top: '84%' },
]

const shuffle = <T,>(items: T[]) => {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

const PlantLabelingActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [tray, setTray] = useState<string[]>(() => shuffle(plantParts.map((part) => part.id)))
  const [placements, setPlacements] = useState<Record<string, string | null>>(() => Object.fromEntries(plantParts.map((part) => [part.id, null])))
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null)
  const [hoverSlot, setHoverSlot] = useState<string | null>(null)
  const [motion, setMotion] = useState<{ id: string; kind: 'pop' | 'wrong' } | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)

  const labeledCount = Object.values(placements).filter(Boolean).length
  const allFilled = labeledCount === plantParts.length
  const getPart = (id: string) => plantParts.find((part) => part.id === id)!

  const reset = () => {
    setTray(shuffle(plantParts.map((part) => part.id)))
    setPlacements(Object.fromEntries(plantParts.map((part) => [part.id, null])))
    setSelectedLabel(null)
    setHoverSlot(null)
    setMotion(null)
    setFeedback(null)
    setChecked(false)
    setCorrect(false)
    setCompleted(false)
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
    event.dataTransfer.setData('application/x-plant-label', labelId)
    event.dataTransfer.effectAllowed = 'move'
    setSelectedLabel(null)
  }

  const handleDrop = (event: DragEvent<HTMLElement>, slotId: string) => {
    event.preventDefault()
    const labelId = event.dataTransfer.getData('application/x-plant-label') || selectedLabel
    if (labelId) placeLabel(slotId, labelId)
  }

  const checkActivity = () => {
    if (!allFilled) {
      setFeedback({ kind: 'info', text: 'Label every pointer before checking the activity.' })
      return
    }
    const wrongCount = plantParts.filter((part) => placements[part.id] !== part.id).length
    setChecked(true)
    if (wrongCount) {
      const wrongSlots = plantParts.filter((part) => placements[part.id] !== part.id).map((part) => part.id)
      setPlacements((current) => wrongSlots.reduce((next, slotId) => ({ ...next, [slotId]: null }), current))
      setTray((current) => shuffle([...current, ...wrongSlots]))
      setCorrect(false)
      setFeedback({ kind: 'warning', text: `${wrongCount} label${wrongCount === 1 ? '' : 's'} still need another look. They returned to the tray.` })
      return
    }
    setCorrect(true)
    setFeedback({ kind: 'success', text: 'You labeled the whole plant! Every part has a job to do.' })
  }

  const renderSlot = (part: PlantPart) => {
    const labelId = placements[part.id]
    const isFilled = Boolean(labelId)
    const isHovered = hoverSlot === part.id
    return <Box key={part.id} component="button" type="button" onClick={() => selectedLabel && placeLabel(part.id, selectedLabel)} onDragOver={(event) => { event.preventDefault(); setHoverSlot(part.id) }} onDragLeave={() => setHoverSlot(null)} onDrop={(event) => handleDrop(event, part.id)} aria-label={`${part.label} pointer${isFilled ? ` labeled ${part.label}` : ', empty'}`} sx={{ position: 'absolute', left: part.left, top: part.top, width: { xs: 150, md: 190 }, minHeight: 52, p: 1, textAlign: 'left', border: 2, borderStyle: 'dashed', borderColor: isHovered ? 'primary.main' : isFilled ? 'success.main' : 'rgba(56, 72, 64, .5)', borderRadius: 2, backgroundColor: isHovered ? 'rgba(23, 126, 115, .14)' : isFilled ? 'success.light' : 'rgba(255,255,255,.92)', boxShadow: isHovered ? 3 : 1, transform: isHovered ? 'scale(1.03)' : 'none', transition: 'transform .18s ease, border-color .18s ease, background-color .18s ease', color: 'text.primary', cursor: selectedLabel ? 'pointer' : 'default' }}>{isFilled ? <><Stack direction="row" spacing={.5} alignItems="center"><CheckCircleOutlineIcon color="success" fontSize="small" /><Typography variant="body2" sx={{ fontWeight: 800 }}>{part.label}</Typography></Stack><Typography variant="caption" color="text.secondary">{part.explanation}</Typography></> : <Typography variant="body2" sx={{ fontWeight: 700 }}>Drop label here</Typography>}</Box>
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Label the Plant</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how a plant's structure supports its function.</Typography></Box><Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}><Chip label="Foundation" color="secondary" /><Chip label={`${labeledCount} of ${plantParts.length} labeled`} color={allFilled ? 'success' : 'default'} /></Stack><Typography variant="h6" sx={{ textAlign: 'center' }}>Drag each label to the correct part of the plant.</Typography><Box sx={{ position: 'relative', width: '100%', maxWidth: 900, mx: 'auto', aspectRatio: '4 / 3', minHeight: { xs: 420, md: 560 }, overflow: 'hidden', borderRadius: 3, border: 1, borderColor: 'divider', backgroundColor: '#eef7ee' }}><Box component="img" src={plantImage} alt="Plant with leaves, flowers, fruit, stem, and roots in soil" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center', p: { xs: 4, md: 6 } }} />{plantParts.map(renderSlot)}</Box><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'rgba(23, 126, 115, .06)' }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Label tray</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{tray.map((id) => { const label = getPart(id); const isSelected = selectedLabel === id; const isMoving = motion?.id === id; return <Box key={id} component="button" type="button" draggable onDragStart={(event) => handleDragStart(event, id)} onClick={() => setSelectedLabel(isSelected ? null : id)} aria-pressed={isSelected} sx={{ px: 1.25, py: .9, border: 2, borderColor: isSelected ? 'primary.main' : 'divider', borderRadius: 2, backgroundColor: isSelected ? 'action.selected' : 'background.paper', color: 'text.primary', font: 'inherit', fontWeight: 700, cursor: 'grab', boxShadow: isSelected ? 2 : 0, animation: isMoving ? `${motion?.kind === 'pop' ? 'plantPop' : 'plantWobble'} .52s ease` : 'none', '@keyframes plantPop': { '0%': { transform: 'scale(.8)' }, '70%': { transform: 'scale(1.08)' }, '100%': { transform: 'scale(1)' } }, '@keyframes plantWobble': { '0%, 100%': { transform: 'translateX(0)' }, '30%': { transform: 'translateX(-7px)' }, '70%': { transform: 'translateX(7px)' } } }}>{label.label}</Box> })}</Stack></Paper>{feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : feedback.kind === 'warning' ? 'warning.main' : 'info.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : feedback.kind === 'warning' ? 'warning.light' : 'info.light' }}><Typography sx={{ fontWeight: 700 }}>{feedback.text}</Typography></Paper>}<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="outlined" onClick={checkActivity} disabled={!allFilled}>Check Activity</Button><Button variant="contained" onClick={() => { setCompleted(true); onComplete?.() }} disabled={!correct || !checked || completed} startIcon={<CheckCircleOutlineIcon />}>{completed ? 'Activity Complete' : 'Complete Activity'}</Button></Stack>{checked && correct && <Typography color="success.main">Every plant part is labeled correctly. You may complete the activity.</Typography>}</Stack></Paper>
}

export default PlantLabelingActivity
