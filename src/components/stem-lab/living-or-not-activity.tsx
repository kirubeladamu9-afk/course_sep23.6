import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type DragEvent, type FC, useState } from 'react'

type Bin = 'living' | 'nonLiving'
type Feedback = { kind: 'success' | 'warning' | 'info'; text: string } | null
type MotionKind = 'happy' | 'wrong'
type Motion = { id: string; kind: MotionKind; nonce: number } | null
type LivingObject = { id: string; label: string; icon: string; correct: Bin; tricky?: boolean }
type ActivityRound = { objects: LivingObject[]; bins: Bin[] }

const objectPool: LivingObject[] = [
  { id: 'tree', label: 'Tree', icon: '🌳', correct: 'living' },
  { id: 'rock', label: 'Rock', icon: '🪨', correct: 'nonLiving' },
  { id: 'dog', label: 'Dog', icon: '🐕', correct: 'living' },
  { id: 'cloud', label: 'Cloud', icon: '☁️', correct: 'nonLiving' },
  { id: 'flower', label: 'Flower', icon: '🌼', correct: 'living' },
  { id: 'car', label: 'Car', icon: '🚗', correct: 'nonLiving' },
  { id: 'butterfly', label: 'Butterfly', icon: '🦋', correct: 'living' },
  { id: 'chair', label: 'Chair', icon: '🪑', correct: 'nonLiving' },
  { id: 'mushroom', label: 'Mushroom', icon: '🍄', correct: 'living' },
  { id: 'water', label: 'Water', icon: '💧', correct: 'nonLiving' },
  { id: 'cut-flower', label: 'Cut flower', icon: '💐', correct: 'living', tricky: true },
  { id: 'seed', label: 'Seed', icon: '🌱', correct: 'living', tricky: true },
  { id: 'battery', label: 'Battery', icon: '🔋', correct: 'nonLiving', tricky: true },
  { id: 'shell', label: 'Shell', icon: '🐚', correct: 'nonLiving' },
]

const shuffle = <T,>(items: T[]) => {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

const createRound = (): ActivityRound => {
  const tricky = shuffle(objectPool.filter((item) => item.tricky)).slice(0, 3)
  const remaining = shuffle(objectPool.filter((item) => !item.tricky)).slice(0, 10 - tricky.length)
  return { objects: shuffle([...tricky, ...remaining]), bins: shuffle(['living', 'nonLiving'] as Bin[]) }
}

const makePlacements = (objects: LivingObject[]) => Object.fromEntries(objects.map((item) => [item.id, null])) as Record<string, Bin | null>
const binLabel = (bin: Bin) => bin === 'living' ? 'Living' : 'Non-Living'

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
  if (typeof window === 'undefined' || !window.AudioContext) return
  const audio = new window.AudioContext()
  const oscillator = audio.createOscillator()
  const gain = audio.createGain()
  oscillator.type = type
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(.0001, audio.currentTime)
  gain.gain.exponentialRampToValueAtTime(.08, audio.currentTime + .01)
  gain.gain.exponentialRampToValueAtTime(.0001, audio.currentTime + duration)
  oscillator.connect(gain)
  gain.connect(audio.destination)
  oscillator.start()
  oscillator.stop(audio.currentTime + duration)
  oscillator.onended = () => void audio.close()
}

const LivingOrNotActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [round, setRound] = useState<ActivityRound>(() => createRound())
  const [placements, setPlacements] = useState<Record<string, Bin | null>>(() => makePlacements(round.objects))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoverBin, setHoverBin] = useState<Bin | null>(null)
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [motion, setMotion] = useState<Motion>(null)
  const [wrongIds, setWrongIds] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [celebrating, setCelebrating] = useState(false)

  const sortedCount = round.objects.filter((item) => placements[item.id] !== null).length
  const allSorted = sortedCount === round.objects.length
  const binOrder = round.bins

  const clearMotion = () => window.setTimeout(() => setMotion(null), 560)
  const animate = (id: string, kind: MotionKind) => {
    setMotion({ id, kind, nonce: Date.now() })
    clearMotion()
  }

  const resetActivity = (nextRound = createRound()) => {
    setRound(nextRound)
    setPlacements(makePlacements(nextRound.objects))
    setSelectedId(null)
    setHoverBin(null)
    setFeedback(null)
    setMotion(null)
    setWrongIds([])
    setChecked(false)
    setCorrect(false)
    setCompleted(false)
    setCelebrating(false)
  }

  const placeObject = (id: string, bin: Bin) => {
    const item = round.objects.find((candidate) => candidate.id === id)
    if (!item) return
    setSelectedId(null)
    setChecked(false)
    setCorrect(false)
    setCelebrating(false)
    setWrongIds([])
    if (item.correct === bin) {
      setPlacements((current) => ({ ...current, [id]: bin }))
      setFeedback({ kind: 'success', text: `${item.label} is in the ${binLabel(bin)} group.` })
      playTone(660, .12)
      animate(id, 'happy')
      return
    }
    setPlacements((current) => ({ ...current, [id]: null }))
    setFeedback({ kind: 'warning', text: `${item.label} bounced back. Try a different group.` })
    playTone(180, .16, 'triangle')
    animate(id, 'wrong')
  }

  const handleDragStart = (event: DragEvent<HTMLElement>, id: string) => {
    event.dataTransfer.setData('application/x-living-object', id)
    event.dataTransfer.effectAllowed = 'move'
    setSelectedId(null)
  }

  const handleDrop = (event: DragEvent<HTMLElement>, bin: Bin) => {
    event.preventDefault()
    setHoverBin(null)
    const id = event.dataTransfer.getData('application/x-living-object') || selectedId
    if (id) placeObject(id, bin)
  }

  const checkActivity = () => {
    if (!allSorted) {
      setFeedback({ kind: 'info', text: `Sort all ${round.objects.length} objects before checking.` })
      return
    }
    const misplaced = round.objects.filter((item) => placements[item.id] !== item.correct).map((item) => item.id)
    setChecked(true)
    setWrongIds(misplaced)
    if (misplaced.length) {
      setPlacements((current) => misplaced.reduce((next, id) => ({ ...next, [id]: null }), current))
      setCorrect(false)
      setCelebrating(false)
      setFeedback({ kind: 'warning', text: `${misplaced.length} object${misplaced.length === 1 ? '' : 's'} need another look. They returned to the tray.` })
      misplaced.forEach((id) => animate(id, 'wrong'))
      playTone(180, .16, 'triangle')
      return
    }
    setCorrect(true)
    setCelebrating(true)
    setFeedback({ kind: 'success', text: `Great sorting! You correctly identified all ${round.objects.length} living and non-living things.` })
    playTone(660, .12)
    window.setTimeout(() => playTone(880, .16), 110)
  }

  const renderObject = (item: LivingObject, location: 'tray' | Bin) => {
    const isSelected = selectedId === item.id
    const isWrong = wrongIds.includes(item.id)
    const isMoving = motion?.id === item.id
    return <Box key={`${location}-${item.id}`} draggable onDragStart={(event) => handleDragStart(event, item.id)} onClick={() => setSelectedId(isSelected ? null : item.id)} role="button" tabIndex={0} aria-label={`${item.label}, ${location === 'tray' ? 'in tray' : `in ${binLabel(location)}`}`} aria-pressed={isSelected} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedId(isSelected ? null : item.id) }} sx={{ position: 'relative', minWidth: 104, p: 1.25, border: 2, borderColor: isWrong ? 'error.main' : isSelected ? 'primary.main' : 'divider', borderRadius: 2, backgroundColor: isWrong ? 'error.light' : 'background.paper', textAlign: 'center', cursor: 'grab', userSelect: 'none', transition: 'transform .18s ease, border-color .18s ease, box-shadow .18s ease', boxShadow: isSelected ? 3 : 0, animation: isMoving ? `${motion?.kind === 'happy' ? 'livingHappy' : 'livingWrong'} .55s ease` : celebrating ? 'livingCelebrate .8s ease-in-out infinite alternate' : 'none', '@keyframes livingHappy': { '0%, 100%': { transform: 'rotate(0) scale(1)' }, '35%': { transform: 'rotate(-6deg) scale(1.08)' }, '70%': { transform: 'rotate(6deg) scale(1.08)' } }, '@keyframes livingWrong': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-7px)' }, '75%': { transform: 'translateX(7px)' } }, '@keyframes livingCelebrate': { from: { transform: 'translateY(0)' }, to: { transform: 'translateY(-5px)' } }, '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' } }}><Typography sx={{ fontSize: 34, lineHeight: 1 }}>{item.icon}</Typography><Typography variant="body2" sx={{ mt: .75, fontWeight: 700 }}>{item.label}</Typography>{location !== 'tray' && <Typography variant="caption" color="success.main">✓ sorted</Typography>}</Box>
  }

  const renderBin = (bin: Bin) => <Paper component="section" elevation={0} onDragOver={(event) => { event.preventDefault(); setHoverBin(bin) }} onDragLeave={() => setHoverBin(null)} onDrop={(event) => handleDrop(event, bin)} sx={{ flex: 1, minHeight: 190, p: 1.5, border: 2, borderColor: hoverBin === bin ? 'primary.main' : bin === 'living' ? '#75b798' : '#8b9299', borderStyle: hoverBin === bin ? 'solid' : 'dashed', backgroundColor: hoverBin === bin ? 'rgba(23, 126, 115, .1)' : 'background.default', transform: hoverBin === bin ? 'scale(1.01)' : 'none', transition: 'transform .18s ease, border-color .18s ease, background-color .18s ease' }}><Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><Typography sx={{ fontSize: 28 }}>{bin === 'living' ? '🍃' : '🪨'}</Typography><Box><Typography variant="h6" sx={{ lineHeight: 1.1 }}>{binLabel(bin)}</Typography><Typography variant="caption" color="text.secondary">{bin === 'living' ? 'Grows and needs food or water' : 'Does not grow or reproduce'}</Typography></Box></Stack><Stack direction="row" flexWrap="wrap" gap={1}>{round.objects.filter((item) => placements[item.id] === bin).map((item) => renderObject(item, bin))}{!round.objects.some((item) => placements[item.id] === bin) && <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>Drop objects here</Typography>}</Stack></Paper>

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Living or Not?</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Sort everyday objects into living and non-living groups.</Typography></Box><Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}><Chip label="Foundation" color="secondary" /><Chip label={`${sortedCount} of ${round.objects.length} sorted`} color={allSorted ? 'success' : 'default'} /></Stack><Typography variant="h6" sx={{ textAlign: 'center' }}>Drag each object to a bin, or tap an object and then tap a bin.</Typography><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'rgba(23, 126, 115, .06)' }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Object tray</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{round.objects.filter((item) => placements[item.id] === null).map((item) => renderObject(item, 'tray'))}{allSorted && <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>Every object is sorted. Check your activity.</Typography>}</Stack></Paper><Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>{binOrder.map((bin) => renderBin(bin))}</Stack>{feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : feedback.kind === 'warning' ? 'warning.main' : 'info.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : feedback.kind === 'warning' ? 'warning.light' : 'info.light' }}><Typography sx={{ fontWeight: 700 }}>{feedback.text}</Typography></Paper>}<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={() => resetActivity()}>Reset</Button><Button variant="outlined" onClick={checkActivity} disabled={!allSorted}>Check Activity</Button><Button variant="contained" disabled={!correct || !checked || completed} onClick={() => { setCompleted(true); onComplete?.() }}>{completed ? 'Activity Complete' : 'Complete Activity'}</Button>{completed && <Button variant="text" onClick={() => resetActivity()}>Next Round</Button>}</Stack>{checked && !correct && !allSorted && <Typography variant="body2" color="warning.main">Place every object before checking.</Typography>}{correct && <Typography variant="body2" color="success.main">All classifications are correct. You may complete the activity.</Typography>}</Stack></Paper>
}

export default LivingOrNotActivity
