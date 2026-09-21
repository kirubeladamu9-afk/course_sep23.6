import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type DragEvent, type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Round = { item: string; emoji: string; price: number; payment: number }
type Props = { topic: MathTopic; onComplete?: () => void }
const rounds: Round[] = [
  { item: 'apple snack', emoji: '🍎', price: 200, payment: 500 },
  { item: 'toy car', emoji: '🚗', price: 365, payment: 500 },
  { item: 'notebook', emoji: '📓', price: 475, payment: 1000 },
  { item: 'fruit smoothie', emoji: '🥤', price: 625, payment: 1000 },
]
const denominations = [500, 100, 25, 10, 5, 1]
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`
const coinLabel = (cents: number) => cents >= 100 ? `$${cents / 100}` : `${cents}¢`
const denominationEmoji = (cents: number) => cents >= 100 ? '▣' : '●'

const ShopSimulatorActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const correctChange = config.payment - config.price
  const [tray, setTray] = useState<number[]>([])
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [countUp, setCountUp] = useState(false)
  const total = tray.reduce((sum, value) => sum + value, 0)
  const difference = correctChange - total
  const correct = checked && total === correctChange
  const steps = useMemo(() => { const values: number[] = []; let current = config.price; for (const denomination of [100, 25, 10, 5, 1]) { while (current + denomination <= config.payment && values.length < 12) { current += denomination; values.push(current) } } return values }, [config])
  const addTile = (value: number) => { setTray((current) => [...current, value]); setChecked(false); setCompleted(false) }
  const removeTile = (index: number) => { setTray((current) => current.filter((_, tileIndex) => tileIndex !== index)); setChecked(false); setCompleted(false) }
  const dropTile = (event: DragEvent<HTMLDivElement>) => { event.preventDefault(); const value = Number(event.dataTransfer.getData('text/currency')); if (value) addTile(value) }
  const reset = () => { setTray([]); setChecked(false); setCompleted(false); setCountUp(false) }
  const nextRound = () => { setRound((current) => current + 1); reset() }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>You buy a {config.item} for {money(config.price)} and pay with {money(config.payment)}. Give the correct change.</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="center">
        <Box sx={{ position: 'relative', width: 260, height: 170, p: 2, border: 3, borderColor: '#9a6732', borderRadius: 2, backgroundColor: '#e5b46a', textAlign: 'center' }}><Typography sx={{ fontSize: 44 }}>{config.emoji}</Typography><Typography sx={{ fontWeight: 800 }}>{config.item}</Typography><Typography sx={{ display: 'inline-block', mt: 1, px: 1.5, py: .5, backgroundColor: 'common.white', border: 1, borderColor: 'divider', transform: 'rotate(-3deg)', fontWeight: 800 }}>{money(config.price)}</Typography><Box sx={{ position: 'absolute', left: 12, right: 12, bottom: -22, height: 25, backgroundColor: '#8c552c', borderRadius: 1 }} /></Box>
        <Stack spacing={1} alignItems="center"><Typography sx={{ fontWeight: 700 }}>Shopkeeper</Typography><Box sx={{ width: 90, height: 90, display: 'grid', placeItems: 'center', borderRadius: '50%', backgroundColor: correct ? 'success.light' : 'warning.light', fontSize: 48, animation: correct ? 'shopSmile .6s ease infinite alternate' : 'none', '@keyframes shopSmile': { from: { transform: 'rotate(-4deg)' }, to: { transform: 'rotate(4deg)' } } }}>🧑‍🍳</Box><Typography variant="body2">Payment received: <strong>{money(config.payment)}</strong></Typography></Stack>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Choose currency tiles from the till and place them in the change tray. Tap a tray tile again to remove it.</Typography>
      <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Till</Typography><Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">{denominations.map((value) => <Box key={value} draggable onDragStart={(event) => event.dataTransfer.setData('text/currency', String(value))} onClick={() => addTile(value)} role="button" tabIndex={0} aria-label={`Add ${coinLabel(value)}`} sx={{ width: 66, height: 56, display: 'grid', placeItems: 'center', border: 2, borderColor: value >= 100 ? 'primary.main' : 'warning.main', borderRadius: value >= 100 ? 1 : '50%', backgroundColor: value >= 100 ? 'primary.light' : 'warning.light', cursor: 'grab', fontWeight: 800, animation: 'currencyBounce .35s ease', '@keyframes currencyBounce': { from: { transform: 'translateY(-3px)' }, to: { transform: 'translateY(0)' } } }}><Typography sx={{ fontSize: 20 }}>{denominationEmoji(value)}</Typography><Typography variant="caption">{coinLabel(value)}</Typography></Box>)}</Stack></Paper>
      <Paper elevation={0} onDragOver={(event) => event.preventDefault()} onDrop={dropTile} sx={{ minHeight: 112, p: 1.5, border: 3, borderStyle: 'dashed', borderColor: correct ? 'success.main' : 'divider', backgroundColor: correct ? 'success.light' : 'background.default', animation: checked && !correct ? 'changeShake .45s ease' : 'none', '@keyframes changeShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Change tray</Typography><Typography role="status" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>Change so far: {money(total)}</Typography><Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>{tray.map((value, index) => <Button key={`${value}-${index}`} size="small" variant="contained" onClick={() => removeTile(index)}>{coinLabel(value)} ×</Button>)}</Stack></Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center" alignItems="center"><Button variant="outlined" onClick={() => setCountUp((current) => !current)}>{countUp ? 'Hide count up' : 'Count up hint'}</Button><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)}>Check Activity</Button></Stack>
      {countUp && <Paper role="note" elevation={0} sx={{ p: 1.5, backgroundColor: 'info.light' }}><Typography sx={{ fontWeight: 700 }}>Count up from {money(config.price)} to {money(config.payment)}:</Typography><Typography variant="body2">{steps.length ? steps.map(money).join(' → ') : money(config.price)}</Typography></Paper>}
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light', animation: correct ? 'changeCelebrate .7s ease' : 'none', '@keyframes changeCelebrate': { '0%': { transform: 'scale(.98)' }, '60%': { transform: 'scale(1.02)' }, '100%': { transform: 'scale(1)' } } }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `Correct! ${money(config.payment)} − ${money(config.price)} = ${money(correctChange)}` : difference > 0 ? `You're ${money(difference)} short.` : `You're ${money(Math.abs(difference))} over.`}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default ShopSimulatorActivity
