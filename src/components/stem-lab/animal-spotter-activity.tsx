import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC, useMemo, useState } from 'react'

type Animal = { id: string; name: string; emoji: string; sound: string; color: string }
type Spot = { left: string; top: string }

const animals: Animal[] = [
  { id: 'cat', name: 'Cat', emoji: '🐈', sound: 'meow', color: '#f6bd60' },
  { id: 'bird', name: 'Bird', emoji: '🐦', sound: 'tweet', color: '#5dade2' },
  { id: 'dog', name: 'Dog', emoji: '🐕', sound: 'bark', color: '#c08457' },
  { id: 'cow', name: 'Cow', emoji: '🐄', sound: 'moo', color: '#f5f5f5' },
  { id: 'duck', name: 'Duck', emoji: '🦆', sound: 'quack', color: '#f4d35e' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐇', sound: 'squeak', color: '#ead7d7' },
  { id: 'horse', name: 'Horse', emoji: '🐎', sound: 'neigh', color: '#8d6e63' },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', sound: 'baa', color: '#fafafa' },
  { id: 'chicken', name: 'Chicken', emoji: '🐔', sound: 'cluck', color: '#fff1b6' },
  { id: 'frog', name: 'Frog', emoji: '🐸', sound: 'ribbit', color: '#81c784' },
]

const scenes = [
  { name: 'Meadow', subtitle: 'Look closely among the grass and flowers.', background: 'linear-gradient(180deg, #bde0fe 0 48%, #91c788 49% 100%)' },
  { name: 'Farmyard', subtitle: 'Animals are hiding around the barn and fence.', background: 'linear-gradient(180deg, #cdeffd 0 48%, #d8bd8a 49% 100%)' },
  { name: 'Backyard', subtitle: 'Search behind the tree, fence, and garden plants.', background: 'linear-gradient(180deg, #b8e0d2 0 48%, #9ac48a 49% 100%)' },
]

const spots: Spot[] = [
  { left: '14%', top: '35%' }, { left: '34%', top: '23%' }, { left: '57%', top: '42%' },
  { left: '78%', top: '29%' }, { left: '25%', top: '66%' }, { left: '68%', top: '70%' },
]

const shuffle = <T,>(items: T[]) => {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

const playSound = (animal: Animal) => {
  const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const frequencies: Record<string, number[]> = { bark: [220, 165], moo: [150, 110], quack: [360, 240], meow: [440, 330], tweet: [880, 1100], squeak: [700, 900], neigh: [330, 440, 280], baa: [240, 190], cluck: [480, 360], ribbit: [180, 120] }
  const notes = frequencies[animal.sound] ?? [330]
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = 'triangle'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(.0001, context.currentTime + index * .12)
    gain.gain.exponentialRampToValueAtTime(.14, context.currentTime + index * .12 + .02)
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + index * .12 + .1)
    oscillator.connect(gain).connect(context.destination)
    oscillator.start(context.currentTime + index * .12)
    oscillator.stop(context.currentTime + index * .12 + .12)
  })
  window.setTimeout(() => context.close(), 600)
}

const AnimalSpotterActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const initialRound = useMemo(() => shuffle(animals).slice(0, 6), [])
  const [roundAnimals, setRoundAnimals] = useState(initialRound)
  const [scene, setScene] = useState(() => scenes[Math.floor(Math.random() * scenes.length)])
  const [found, setFound] = useState<string[]>([])
  const [activeAnimal, setActiveAnimal] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const reset = () => {
    setRoundAnimals(shuffle(animals).slice(0, 6))
    setScene(scenes[Math.floor(Math.random() * scenes.length)])
    setFound([])
    setActiveAnimal(null)
    setChecked(false)
    setFeedback(null)
  }

  const findAnimal = (animal: Animal) => {
    if (found.includes(animal.id) || checked) return
    setFound((current) => [...current, animal.id])
    setActiveAnimal(animal.id)
    setFeedback(`${animal.name} says “${animal.sound}!”`)
    playSound(animal)
    window.setTimeout(() => setActiveAnimal(null), 650)
  }

  const allFound = found.length === roundAnimals.length
  const checkActivity = () => {
    if (!allFound) {
      setFeedback(`${roundAnimals.length - found.length} animal${roundAnimals.length - found.length === 1 ? '' : 's'} still hiding.`)
      return
    }
    setChecked(true)
    setFeedback('You found every animal! Great spotting.')
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Foundation" color="secondary" sx={{ mb: 1 }} /><Typography variant="h5">Animal Spotter</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Recognize and group common animals.</Typography></Box><Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}><Chip label={`${found.length} of ${roundAnimals.length} animals found`} color={allFound ? 'success' : 'default'} /><Typography variant="body2" color="text.secondary">{scene.name}</Typography></Stack><Typography variant="h6" sx={{ textAlign: 'center' }}>Tap the hidden animals in the scene.</Typography><Box sx={{ position: 'relative', minHeight: { xs: 330, md: 420 }, overflow: 'hidden', borderRadius: 3, border: 1, borderColor: 'divider', background: scene.background }}><Box sx={{ position: 'absolute', left: '8%', bottom: '12%', width: '84%', height: 30, borderRadius: '50%', backgroundColor: 'rgba(56,118,74,.45)' }} /><Box sx={{ position: 'absolute', left: '7%', bottom: '27%', width: 24, height: '50%', borderRadius: 2, backgroundColor: '#795548', '&::before': { content: '""', position: 'absolute', left: -55, top: 24, width: 135, height: 20, borderRadius: '50%', backgroundColor: '#5f9f61', transform: 'rotate(-12deg)' } }} /><Box sx={{ position: 'absolute', right: '10%', bottom: '18%', width: 100, height: 65, borderRadius: '12px 12px 4px 4px', backgroundColor: '#b5654b', border: '5px solid #824c3c' }} /><Typography sx={{ position: 'absolute', top: 12, left: 16, color: 'rgba(30,70,70,.75)', fontWeight: 700 }}>{scene.subtitle}</Typography>{roundAnimals.map((animal, index) => { const spot = spots[index]; const isFound = found.includes(animal.id); return <Button key={animal.id} onClick={() => findAnimal(animal)} aria-label={`Find ${animal.name}`} sx={{ position: 'absolute', left: spot.left, top: spot.top, minWidth: 58, p: .5, borderRadius: 2, color: isFound ? '#263238' : 'rgba(38,50,56,.72)', backgroundColor: isFound ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.18)', border: 2, borderColor: isFound ? animal.color : 'rgba(255,255,255,.25)', opacity: isFound ? 1 : .78, transform: activeAnimal === animal.id ? 'scale(1.25)' : 'scale(1)', animation: activeAnimal === animal.id ? 'animalBounce .65s ease' : 'none', '&:hover': { backgroundColor: 'rgba(255,255,255,.7)', transform: 'scale(1.08)' }, '@keyframes animalBounce': { '0%': { transform: 'scale(.8) translateY(8px)' }, '55%': { transform: 'scale(1.3) translateY(-8px)' }, '100%': { transform: 'scale(1)' } } }}><Stack spacing={0} alignItems="center"><Typography sx={{ fontSize: 38, lineHeight: 1 }}>{animal.emoji}</Typography>{isFound && <Typography variant="caption" sx={{ fontWeight: 800 }}>{animal.name}</Typography>}</Stack></Button> })}{allFound && <Box aria-hidden="true" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, transparent 30%, rgba(255,235,59,.3) 100%)', animation: 'spotterCelebrate 1s ease-in-out infinite', '@keyframes spotterCelebrate': { '0%, 100%': { opacity: .2 }, '50%': { opacity: 1 } } }} />}</Box>{feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, textAlign: 'center', border: 1, borderColor: allFound ? 'success.main' : 'divider', backgroundColor: allFound ? 'success.light' : 'background.default' }}><Typography sx={{ fontWeight: 700 }}>{feedback}</Typography></Paper>}<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={checkActivity} disabled={!allFound || checked}>Check Activity</Button><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" color="success" disabled={!checked} onClick={onComplete}>Complete Activity</Button></Stack></Stack></Paper>
}

export default AnimalSpotterActivity
