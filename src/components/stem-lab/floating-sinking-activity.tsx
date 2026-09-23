import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useState } from 'react'

export type FloatingSinkingProps = { onComplete?: () => void }
type Item = { id: string; name: string; icon: string; floats: boolean }
type Feedback = 'idle' | 'correct' | 'incorrect'

const items: Item[] = [{ id: 'leaf', name: 'Leaf', icon: 'LEAF', floats: true }, { id: 'stone', name: 'Stone', icon: 'STONE', floats: false }, { id: 'boat', name: 'Boat', icon: 'BOAT', floats: true }, { id: 'coin', name: 'Coin', icon: 'COIN', floats: false }]

const FloatingSinkingActivity: FC<FloatingSinkingProps> = ({ onComplete }) => {
  const [placed, setPlaced] = useState<Record<string, boolean | null>>(() => Object.fromEntries(items.map((item) => [item.id, null])))
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)
  const completePlacement = Object.values(placed).every((value) => value !== null)
  const correct = completePlacement && items.every((item) => placed[item.id] === item.floats)
  const place = (item: Item, floats: boolean) => { setPlaced((current) => ({ ...current, [item.id]: floats })); setFeedback('idle') }
  const checkActivity = () => { setFeedback(correct ? 'correct' : 'incorrect'); setFeedbackVersion((version) => version + 1) }
  const reset = () => { setPlaced(Object.fromEntries(items.map((item) => [item.id, null]))); setFeedback('idle'); setFeedbackVersion((version) => version + 1) }
  const completed = feedback === 'correct' && correct

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Float or Sink</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore what happens when objects meet water.</Typography></Box><Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack><Typography variant="body2" color="text.secondary">Choose where each object belongs, then check your predictions.</Typography><Box sx={{ minHeight: 220, p: 2, borderRadius: 2, border: 1, borderColor: 'divider', background: 'linear-gradient(#dff3ff 0 64%, #a9d9ef 64% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>{items.map((item) => <Box key={item.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: .5 }}><Box sx={{ width: 66, height: 48, display: 'grid', placeItems: 'center', borderRadius: 2, backgroundColor: placed[item.id] === true ? '#f6d36c' : placed[item.id] === false ? '#8095a5' : '#fff', color: 'text.primary', fontWeight: 800, border: 2, borderColor: 'divider', transform: placed[item.id] === false ? 'translateY(40px)' : 'translateY(0)', transition: 'transform .3s ease' }}>{item.icon}</Box><Typography variant="caption" sx={{ fontWeight: 800 }}>{item.name}</Typography><Stack direction="row" spacing={.5}><Button size="small" variant={placed[item.id] === true ? 'contained' : 'outlined'} onClick={() => place(item, true)}>Float</Button><Button size="small" variant={placed[item.id] === false ? 'contained' : 'outlined'} onClick={() => place(item, false)}>Sink</Button></Stack></Box>)}</Box><Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider' }}><Typography sx={{ fontWeight: 800 }}>Challenge: Predict which objects float and which sink.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Great work! You compared how objects behave in water.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Look closely at which objects are supported by the water.</Typography>}</Paper><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={!completePlacement}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack></Stack></Paper>
}

export default FloatingSinkingActivity
