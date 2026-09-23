import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useRef, useState } from 'react'

export type ForcePlaygroundProps = { onComplete?: () => void }

type ForceObject = {
  id: string
  name: string
  weight: number
  illustration: 'feather' | 'ball' | 'box' | 'boulder' | 'leaf' | 'book' | 'backpack' | 'crate' | 'suitcase' | 'toy-car'
  effort: 'small' | 'medium' | 'big'
}

type ObjectTemplate = Omit<ForceObject, 'weight'> & { minWeight: number; maxWeight: number; group: 'light' | 'medium-light' | 'medium-heavy' | 'heavy' }

type Feedback = 'idle' | 'correct' | 'incorrect'

const objectPool: ObjectTemplate[] = [
  { id: 'feather', name: 'Feather', minWeight: 1, maxWeight: 4, illustration: 'feather', effort: 'small', group: 'light' },
  { id: 'leaf', name: 'Leaf', minWeight: 3, maxWeight: 8, illustration: 'leaf', effort: 'small', group: 'light' },
  { id: 'paper-plane', name: 'Paper plane', minWeight: 4, maxWeight: 10, illustration: 'feather', effort: 'small', group: 'light' },
  { id: 'ball', name: 'Ball', minWeight: 12, maxWeight: 24, illustration: 'ball', effort: 'medium', group: 'medium-light' },
  { id: 'toy-car', name: 'Toy car', minWeight: 16, maxWeight: 28, illustration: 'toy-car', effort: 'medium', group: 'medium-light' },
  { id: 'apple', name: 'Apple', minWeight: 18, maxWeight: 30, illustration: 'ball', effort: 'medium', group: 'medium-light' },
  { id: 'box', name: 'Box', minWeight: 34, maxWeight: 48, illustration: 'box', effort: 'medium', group: 'medium-heavy' },
  { id: 'book', name: 'Book', minWeight: 38, maxWeight: 54, illustration: 'book', effort: 'medium', group: 'medium-heavy' },
  { id: 'backpack', name: 'Backpack', minWeight: 42, maxWeight: 60, illustration: 'backpack', effort: 'medium', group: 'medium-heavy' },
  { id: 'boulder', name: 'Boulder', minWeight: 74, maxWeight: 96, illustration: 'boulder', effort: 'big', group: 'heavy' },
  { id: 'crate', name: 'Crate', minWeight: 62, maxWeight: 86, illustration: 'crate', effort: 'big', group: 'heavy' },
  { id: 'suitcase', name: 'Suitcase', minWeight: 56, maxWeight: 78, illustration: 'suitcase', effort: 'big', group: 'heavy' },
]

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5)

const createRound = (): ForceObject[] => shuffle(['light', 'medium-light', 'medium-heavy', 'heavy'].map((group) => {
  const template = shuffle(objectPool.filter((item) => item.group === group))[0]
  return { id: template.id, name: template.name, illustration: template.illustration, effort: template.effort, weight: randomInt(template.minWeight, template.maxWeight) }
}))

const effortCopy: Record<ForceObject['effort'], { label: string; message: string; duration: number }> = {
  small: { label: 'Small push', message: 'this takes a small push', duration: .35 },
  medium: { label: 'Steady push', message: 'this takes a steady push', duration: .55 },
  big: { label: 'Big push', message: 'this takes a big push', duration: .8 },
}

const ObjectIllustration: FC<{ object: ForceObject }> = ({ object }) => {
  const baseSx = { display: 'grid', placeItems: 'center', width: 58, height: 48, color: 'common.white', fontWeight: 800, fontSize: object.illustration === 'feather' || object.illustration === 'leaf' ? 30 : 16, animation: `${object.illustration}-float .9s ease-in-out infinite alternate`, '@keyframes feather-float': { from: { transform: 'rotate(-12deg) translateY(2px)' }, to: { transform: 'rotate(12deg) translateY(-2px)' } }, '@keyframes leaf-float': { from: { transform: 'rotate(-12deg) translateY(2px)' }, to: { transform: 'rotate(12deg) translateY(-2px)' } }, '@keyframes ball-float': { from: { transform: 'translateY(1px)' }, to: { transform: 'translateY(-3px)' } }, '@keyframes toy-car-float': { from: { transform: 'translateY(1px)' }, to: { transform: 'translateY(-2px)' } }, '@keyframes apple-float': { from: { transform: 'translateY(1px)' }, to: { transform: 'translateY(-2px)' } }, '@keyframes box-float': { from: { transform: 'translateY(1px)' }, to: { transform: 'translateY(-2px)' } }, '@keyframes book-float': { from: { transform: 'translateY(1px)' }, to: { transform: 'translateY(-2px)' } }, '@keyframes backpack-float': { from: { transform: 'translateY(1px)' }, to: { transform: 'translateY(-2px)' } }, '@keyframes boulder-float': { from: { transform: 'translateY(1px)' }, to: { transform: 'translateY(-2px)' } }, '@keyframes crate-float': { from: { transform: 'translateY(1px)' }, to: { transform: 'translateY(-2px)' } }, '@keyframes suitcase-float': { from: { transform: 'translateY(1px)' }, to: { transform: 'translateY(-2px)' } } }
  if (object.illustration === 'feather') return <Typography aria-hidden sx={{ ...baseSx, color: '#8a6f4d', fontStyle: 'italic', fontFamily: 'serif' }}>✦</Typography>
  if (object.illustration === 'leaf') return <Typography aria-hidden sx={{ ...baseSx, color: '#2f8f65', fontStyle: 'italic', fontFamily: 'serif' }}>◢</Typography>
  if (object.illustration === 'ball') return <BoxIllustration sx={{ ...baseSx, borderRadius: '50%', width: 44, height: 44, backgroundColor: '#ee7c46', border: '3px solid #b84e25' }}>●</BoxIllustration>
  if (object.illustration === 'toy-car') return <BoxIllustration sx={{ ...baseSx, width: 58, height: 28, borderRadius: 1.5, backgroundColor: '#5c83d6', border: '3px solid #2f4f9e' }}>CAR</BoxIllustration>
  if (object.illustration === 'box') return <BoxIllustration sx={{ ...baseSx, backgroundColor: '#c48b52', border: '3px solid #805327', borderRadius: 1 }}>BOX</BoxIllustration>
  if (object.illustration === 'book') return <BoxIllustration sx={{ ...baseSx, backgroundColor: '#7b68c6', border: '3px solid #493b8e', borderRadius: 1 }}>BOOK</BoxIllustration>
  if (object.illustration === 'backpack') return <BoxIllustration sx={{ ...baseSx, backgroundColor: '#4e9a87', border: '3px solid #286454', borderRadius: '16px 16px 8px 8px' }}>PACK</BoxIllustration>
  if (object.illustration === 'crate') return <BoxIllustration sx={{ ...baseSx, backgroundColor: '#a96a3b', border: '3px solid #68401f', borderRadius: 1 }}>CRATE</BoxIllustration>
  if (object.illustration === 'suitcase') return <BoxIllustration sx={{ ...baseSx, backgroundColor: '#65738f', border: '3px solid #39445d', borderRadius: 1 }}>CASE</BoxIllustration>
  return <BoxIllustration sx={{ ...baseSx, width: 52, height: 42, borderRadius: '45% 55% 42% 58%', backgroundColor: '#667078', border: '3px solid #3b4449' }}>ROCK</BoxIllustration>
}

const BoxIllustration: FC<{ sx: Record<string, unknown>; children: string }> = ({ sx, children }) => <Typography aria-hidden sx={sx}>{children}</Typography>

const ForcePlaygroundActivity: FC<ForcePlaygroundProps> = ({ onComplete }) => {
  const [objects, setObjects] = useState<ForceObject[]>(createRound)
  const [positions, setPositions] = useState<Record<string, number>>(() => Object.fromEntries(objects.map((object) => [object.id, 8])))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const workspaceRef = useRef<HTMLDivElement>(null)
  const movedCount = objects.filter((object) => (positions[object.id] ?? 0) >= 80).length
  const allMoved = movedCount === objects.length
  const heaviest = objects.reduce((current, object) => object.weight > current.weight ? object : current, objects[0])
  const answerCorrect = selectedId === heaviest.id

  const updatePosition = (object: ForceObject, event: PointerEvent<HTMLButtonElement>) => {
    const workspace = workspaceRef.current
    if (!workspace) return
    const bounds = workspace.getBoundingClientRect()
    const next = Math.max(8, Math.min(92, ((event.clientX - bounds.left) / bounds.width) * 100))
    setPositions((current) => ({ ...current, [object.id]: next }))
    setFeedback('idle')
  }

  const startDragging = (object: ForceObject, event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setActiveId(object.id)
    setFeedback('idle')
  }

  const stopDragging = (object: ForceObject, event: PointerEvent<HTMLButtonElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setActiveId(null)
    setPositions((current) => ({ ...current, [object.id]: (current[object.id] ?? 0) >= 80 ? 86 : current[object.id] ?? 8 }))
  }

  const reset = () => {
    const nextObjects = createRound()
    setObjects(nextObjects)
    setPositions(Object.fromEntries(nextObjects.map((object) => [object.id, 8])))
    setActiveId(null)
    setSelectedId(null)
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  const checkActivity = () => {
    const nextFeedback = allMoved && answerCorrect ? 'correct' : 'incorrect'
    setFeedback(nextFeedback)
    setFeedbackVersion((version) => version + 1)
  }

  const completed = feedback === 'correct' && allMoved && answerCorrect

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Force Playground</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how pushing and pulling move objects.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>{movedCount} of {objects.length} objects moved</Typography>
        <Typography variant="body2" color="text.secondary">Drag every object across the surface.</Typography>
      </Stack>
      <Box ref={workspaceRef} sx={{ position: 'relative', minHeight: 242, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: '#f5f0e8', backgroundImage: 'linear-gradient(145deg, rgba(255,255,255,.52), transparent 42%)', touchAction: 'none' }}>
        <Typography variant="caption" sx={{ position: 'absolute', top: 10, left: 14, color: '#695d50', fontWeight: 800, letterSpacing: .4 }}>FLAT SURFACE</Typography>
        <Box sx={{ position: 'absolute', left: '7%', right: '7%', bottom: 29, borderBottom: '4px solid #b49b7b' }} />
        <Box sx={{ position: 'absolute', left: '86%', top: 43, bottom: 28, borderLeft: '2px dashed #b49b7b' }} />
        {objects.map((object) => {
          const isActive = activeId === object.id
          const isMoved = (positions[object.id] ?? 0) >= 80
          const effort = effortCopy[object.effort]
          return <Box key={`${object.id}-${feedbackVersion}`} sx={{ position: 'absolute', left: `${positions[object.id] ?? 8}%`, bottom: 35, transform: 'translateX(-50%)', transition: `left ${isActive ? .12 : effort.duration}s ease-out`, zIndex: isActive ? 2 : 1, animation: feedback === 'correct' ? 'forceBounce .7s ease-in-out infinite alternate' : 'none', '@keyframes forceBounce': { from: { transform: 'translateX(-50%) translateY(0)' }, to: { transform: 'translateX(-50%) translateY(-10px)' } } }}>
            <Box component="button" type="button" onPointerDown={(event) => startDragging(object, event)} onPointerMove={(event) => activeId === object.id && updatePosition(object, event)} onPointerUp={(event) => stopDragging(object, event)} onKeyDown={(event) => { if (event.key === 'ArrowRight') { event.preventDefault(); setPositions((current) => ({ ...current, [object.id]: Math.min(86, (current[object.id] ?? 8) + 8) })) } if (event.key === 'ArrowLeft') { event.preventDefault(); setPositions((current) => ({ ...current, [object.id]: Math.max(8, (current[object.id] ?? 8) - 8) })) } }} aria-label={`Drag the ${object.name}, weighing ${object.weight} grams`} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: 0, background: 'none', cursor: isActive ? 'grabbing' : 'grab', color: 'inherit', font: 'inherit', p: .25, userSelect: 'none', touchAction: 'none', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main', borderRadius: 1 } }}>
              <Box sx={{ animation: isActive ? `forcePush ${effort.duration}s ease-in-out infinite` : 'none', '@keyframes forcePush': { '0%, 100%': { transform: 'translateX(0) scale(1)' }, '50%': { transform: `translateX(${object.effort === 'big' ? -7 : -3}px) scale(${object.effort === 'big' ? 1.12 : 1.05})` } } }}><ObjectIllustration object={object} /></Box>
              <Typography variant="caption" sx={{ mt: .25, color: '#53483e', fontWeight: 800 }}>{object.name}</Typography>
              <Typography variant="caption" sx={{ color: '#695d50' }}>{object.weight} g</Typography>
              {isMoved && <Typography variant="caption" sx={{ color: 'success.dark', fontWeight: 800 }}>moved</Typography>}
            </Box>
          </Box>
        })}
      </Box>
      <Paper role="status" elevation={0} sx={{ p: 1.5, minHeight: 54, display: 'flex', alignItems: 'center', backgroundColor: activeId ? 'primary.light' : 'action.hover', color: activeId ? 'primary.contrastText' : 'text.secondary' }}>
        <Typography variant="body2" sx={{ fontWeight: activeId ? 800 : 500 }}>{activeId ? `Pushing the ${objects.find((object) => object.id === activeId)?.name} — ${effortCopy[objects.find((object) => object.id === activeId)!.effort].message}!` : allMoved ? 'All objects moved. Now find the one that needed the biggest push.' : movedCount ? `${movedCount} moved — keep pushing and pulling!` : 'Pick an object and drag it to the finish line.'}</Typography>
      </Paper>
      {allMoved && <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'incorrect' ? 'warning.main' : feedback === 'correct' ? 'success.main' : 'divider', animation: feedback === 'incorrect' ? 'forceShake .45s ease-in-out' : 'none', '@keyframes forceShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-6px)' }, '75%': { transform: 'translateX(6px)' } } }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>Which needs the biggest push?</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>Tap the heaviest object from this round.</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>{objects.map((object) => <Button key={object.id} size="small" variant={selectedId === object.id ? 'contained' : 'outlined'} onClick={() => { setSelectedId(object.id); setFeedback('idle') }}>{object.name} · {object.weight} g</Button>)}</Stack>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1.25, fontWeight: 800 }}>Great job! You figured out heavy things need a bigger push.</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1.25, fontWeight: 700 }}>Which one looked hardest to move?</Typography>}
      </Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="outlined" onClick={checkActivity} disabled={!allMoved || selectedId === null}>Check Activity</Button>
        <Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button>
        <Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button>
      </Stack>
    </Stack>
  </Paper>
}

export default ForcePlaygroundActivity
