import AirIcon from '@mui/icons-material/Air'
import HearingIcon from '@mui/icons-material/Hearing'
import PanToolIcon from '@mui/icons-material/PanTool'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import VisibilityIcon from '@mui/icons-material/Visibility'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC, useMemo, useState } from 'react'

type Sense = 'sight' | 'hearing' | 'smell' | 'touch' | 'taste'
type Scene = { id: string; sense: Sense; emoji: string; caption: string; detail: string }

const scenes: Scene[] = [
  { id: 'rainbow', sense: 'sight', emoji: '🌈', caption: 'Looking at a bright rainbow', detail: 'Your eyes notice the rainbow’s colors and shape.' },
  { id: 'thunder', sense: 'hearing', emoji: '⛈️', caption: 'Hearing thunder in the sky', detail: 'Your ears hear the loud rumble of thunder.' },
  { id: 'flowers', sense: 'smell', emoji: '🌸', caption: 'Smelling fresh flowers', detail: 'Your nose notices the flowers’ sweet smell.' },
  { id: 'blanket', sense: 'touch', emoji: '🧣', caption: 'Feeling a soft blanket', detail: 'Your skin feels how soft and warm the blanket is.' },
  { id: 'apple', sense: 'taste', emoji: '🍎', caption: 'Tasting a crunchy apple', detail: 'Your tongue notices the apple’s sweet taste.' },
  { id: 'book', sense: 'sight', emoji: '📖', caption: 'Reading a storybook', detail: 'Your eyes see the letters and pictures.' },
  { id: 'bell', sense: 'hearing', emoji: '🔔', caption: 'Listening to a ringing bell', detail: 'Your ears hear the bell ring.' },
  { id: 'cookies', sense: 'smell', emoji: '🍪', caption: 'Smelling cookies baking', detail: 'Your nose notices the warm cookie smell.' },
  { id: 'ice', sense: 'touch', emoji: '🧊', caption: 'Holding a cold ice cube', detail: 'Your skin feels that the ice is cold.' },
  { id: 'lemon', sense: 'taste', emoji: '🍋', caption: 'Tasting a sour lemon', detail: 'Your tongue notices the lemon’s sour taste.' },
  { id: 'sunset', sense: 'sight', emoji: '🌅', caption: 'Watching the sun set', detail: 'Your eyes see the changing colors in the sky.' },
  { id: 'music', sense: 'hearing', emoji: '🎵', caption: 'Listening to a song', detail: 'Your ears hear the music and its rhythm.' },
]

const senseOptions: Array<{ id: Sense; label: string; Icon: typeof VisibilityIcon }> = [
  { id: 'sight', label: 'Sight', Icon: VisibilityIcon },
  { id: 'hearing', label: 'Hearing', Icon: HearingIcon },
  { id: 'smell', label: 'Smell', Icon: AirIcon },
  { id: 'touch', label: 'Touch', Icon: PanToolIcon },
  { id: 'taste', label: 'Taste', Icon: RestaurantIcon },
]

const shuffle = <T,>(items: T[]) => {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

const SenseChallengeActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const roundScenes = useMemo(() => shuffle(scenes).slice(0, 8), [])
  const [activeScenes, setActiveScenes] = useState(roundScenes)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [matched, setMatched] = useState(0)
  const [wrongSense, setWrongSense] = useState<Sense | null>(null)
  const [correctSense, setCorrectSense] = useState<Sense | null>(null)
  const [checked, setChecked] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const scene = activeScenes[sceneIndex]
  const completeRound = matched === activeScenes.length

  const reset = () => {
    setActiveScenes(shuffle(scenes).slice(0, 8))
    setSceneIndex(0)
    setMatched(0)
    setWrongSense(null)
    setCorrectSense(null)
    setChecked(false)
    setFeedback(null)
  }

  const chooseSense = (sense: Sense) => {
    if (!scene || correctSense || checked) return
    if (sense !== scene.sense) {
      setWrongSense(sense)
      setFeedback('Not quite. Try another sense.')
      window.setTimeout(() => setWrongSense(null), 500)
      return
    }
    setCorrectSense(sense)
    setMatched((current) => current + 1)
    setFeedback('Correct! Great observing.')
    window.setTimeout(() => {
      setCorrectSense(null)
      if (sceneIndex < activeScenes.length - 1) setSceneIndex((current) => current + 1)
    }, 700)
  }

  const checkActivity = () => {
    if (!completeRound) {
      setFeedback(`${activeScenes.length - matched} situation${activeScenes.length - matched === 1 ? '' : 's'} left to match.`)
      return
    }
    setChecked(true)
    setFeedback('Amazing! You matched every situation to the right sense.')
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Foundation" color="secondary" sx={{ mb: 1 }} /><Typography variant="h5">Sense Challenge</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Match situations to the sense used to experience them.</Typography></Box><Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}><Chip label={`${matched} of ${activeScenes.length} matched`} color={completeRound ? 'success' : 'default'} /><Typography variant="body2" color="text.secondary">Scene {Math.min(sceneIndex + 1, activeScenes.length)} of {activeScenes.length}</Typography></Stack><Typography variant="h6" sx={{ textAlign: 'center' }}>Which sense helps you experience this?</Typography>{scene && <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, minHeight: 190, display: 'grid', placeItems: 'center', textAlign: 'center', border: 1, borderColor: correctSense ? 'success.main' : 'divider', background: correctSense ? 'linear-gradient(135deg, rgba(102,187,106,.2), rgba(255,255,255,.9))' : 'linear-gradient(135deg, rgba(79,140,255,.1), rgba(255,255,255,.9))', animation: correctSense ? 'sensePop .65s ease' : 'none', '@keyframes sensePop': { '0%': { transform: 'scale(.96)' }, '55%': { transform: 'scale(1.03)' }, '100%': { transform: 'scale(1)' } } }}><Stack spacing={1} alignItems="center"><Typography sx={{ fontSize: { xs: 56, md: 76 }, lineHeight: 1 }}>{scene.emoji}</Typography><Typography variant="h6">{scene.caption}</Typography><Typography variant="body2" color="text.secondary">Choose the sense you use in this scene.</Typography></Stack></Paper>}<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">{senseOptions.map(({ id, label, Icon }) => <Button key={id} onClick={() => chooseSense(id)} variant={correctSense === id ? 'contained' : 'outlined'} color={wrongSense === id ? 'error' : correctSense === id ? 'success' : 'primary'} startIcon={<Icon />} sx={{ minWidth: 112, animation: wrongSense === id ? 'senseShake .5s ease' : 'none', '@keyframes senseShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>{label}</Button>)}</Stack>{feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, textAlign: 'center', border: 1, borderColor: completeRound ? 'success.main' : wrongSense ? 'error.main' : 'divider', backgroundColor: completeRound ? 'success.light' : wrongSense ? 'error.light' : 'background.default' }}><Typography sx={{ fontWeight: 700 }}>{feedback}</Typography>{correctSense && <Typography variant="body2" sx={{ mt: .5 }}>{scene.detail}</Typography>}</Paper>}<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={checkActivity} disabled={!completeRound || checked}>Check Activity</Button><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" color="success" disabled={!checked} onClick={onComplete}>Complete Activity</Button></Stack></Stack></Paper>
}

export default SenseChallengeActivity
