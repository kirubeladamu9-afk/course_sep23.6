import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

const decimalTargets = [0.3, 0.45, 0.6, 0.75]
const gcd = (left: number, right: number): number => right === 0 ? left : gcd(right, left % right)
const simplifiedFraction = (count: number) => { const divisor = gcd(count, 100); return `${count / divisor}/${100 / divisor}` }

const DecimalPainterActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [roundNumber, setRoundNumber] = useState(0)
  const [target, setTarget] = useState(() => decimalTargets[Math.floor(Math.random() * decimalTargets.length)])
  const [painted, setPainted] = useState<Set<number>>(() => new Set())
  const [painting, setPainting] = useState(false)
  const [paintValue, setPaintValue] = useState(true)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)
  const paintedCount = painted.size
  const targetCount = Math.round(target * 100)
  const paintCell = (index: number, value = paintValue) => { setPainted((current) => { const next = new Set(current); if (value) next.add(index); else next.delete(index); return next }); setChecked(false); setCorrect(false) }
  const startPainting = (index: number) => { const nextValue = !painted.has(index); setPaintValue(nextValue); setPainting(true); paintCell(index, nextValue) }
  const reset = () => { setPainted(new Set()); setPainting(false); setChecked(false); setCorrect(false); setCompleted(false) }
  const nextRound = () => { const next = roundNumber + 1; let nextTarget = decimalTargets[Math.floor(Math.random() * decimalTargets.length)]; if (decimalTargets.length > 1 && nextTarget === target) nextTarget = decimalTargets[next % decimalTargets.length]; setRoundNumber(next); setTarget(nextTarget); setPainted(new Set()); setPainting(false); setChecked(false); setCorrect(false); setCompleted(false) }
  const checkActivity = () => { const isCorrect = paintedCount === targetCount; setChecked(true); setCorrect(isCorrect) }
  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box><Chip label="Foundation" color="primary" sx={{ alignSelf: 'flex-start' }} /><Typography variant="h6">Round {roundNumber + 1}: Shade {target.toFixed(2)} of the grid.</Typography><Typography variant="body2" color="text.secondary">Click a square to color it. Click and drag across squares to paint or erase a group.</Typography><Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch"><Paper elevation={0} sx={{ flex: 1, p: 1.5, backgroundColor: '#fff', border: 1, borderColor: 'divider', borderRadius: 2, animation: checked && !correct ? 'decimalShake .35s ease' : correct ? 'decimalCelebrate .8s ease' : 'none', '@keyframes decimalShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } }, '@keyframes decimalCelebrate': { '0%, 100%': { boxShadow: '0 0 0 rgba(246,183,60,0)' }, '50%': { boxShadow: '0 0 26px rgba(246,183,60,.8)' } } }}><Box onPointerUp={() => setPainting(false)} onPointerLeave={() => setPainting(false)} sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', width: '100%', aspectRatio: '1 / 1', border: '2px solid #bfd2d0', backgroundColor: '#fff' }}>{Array.from({ length: 100 }, (_, index) => { const isPainted = painted.has(index); return <Box key={index} component="button" type="button" aria-label={`${isPainted ? 'Erase' : 'Shade'} grid square ${index + 1}`} onPointerDown={(event) => { event.preventDefault(); startPainting(index) }} onPointerEnter={() => { if (painting) paintCell(index) }} sx={{ minWidth: 0, minHeight: 0, aspectRatio: '1 / 1', p: 0, border: '1px solid #d9e5e3', background: isPainted ? 'linear-gradient(135deg, #ffcf5c, #ff8a5b)' : '#fff', boxShadow: isPainted ? 'inset 0 0 0 2px rgba(255,255,255,.28)' : 'none', cursor: 'crosshair', transition: 'background .12s ease, transform .12s ease', '&:hover': { backgroundColor: isPainted ? undefined : '#fff8d6', transform: 'scale(.94)' } }}>{isPainted ? '✦' : ''}</Box> })}</Box></Paper><Paper elevation={0} sx={{ minWidth: { md: 175 }, p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1.25, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}><Typography variant="overline" color="text.secondary">Live readout</Typography><Typography variant="h4" color="primary.main" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>{(paintedCount / 100).toFixed(2)}</Typography><Chip label={`Fraction: ${paintedCount}/100`} /><Chip label={`Simplified: ${simplifiedFraction(paintedCount)}`} /><Typography variant="body2" color="text.secondary">{paintedCount} of 100 squares colored</Typography></Paper></Stack><Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={checkActivity}>Check Activity</Button></Stack>{checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'background.default' }}><Typography sx={{ fontWeight: 800, color: correct ? 'success.main' : 'error.main' }}>{correct ? `Nice coloring! ${paintedCount}/100 = ${(paintedCount / 100).toFixed(2)}.` : paintedCount < targetCount ? 'Keep coloring — you have shaded too few squares.' : 'Try erasing a few squares — you have shaded too many.'}</Typography></Paper>}{correct && !completed && <Button variant="contained" onClick={() => { setCompleted(true); onComplete?.() }}>Complete Activity</Button>}{completed && <Stack direction="row" spacing={1} alignItems="center"><Typography color="success.main" sx={{ fontWeight: 700 }}>Painting complete!</Typography><Button variant="outlined" onClick={nextRound}>Next round</Button></Stack>}</Stack></Paper>
}

export default DecimalPainterActivity
