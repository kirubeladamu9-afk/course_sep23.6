import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type DragEvent, type FC, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Region = 'a' | 'overlap' | 'b' | 'outside'
type Rule = { a: string; b: string; aTest: (value: number) => boolean; bTest: (value: number) => boolean; range: number }
type Props = { topic: MathTopic; onComplete?: () => void }
const rules: Rule[] = [
  { a: 'even numbers', b: 'multiples of 3', aTest: (value) => value % 2 === 0, bTest: (value) => value % 3 === 0, range: 12 },
  { a: 'multiples of 2', b: 'multiples of 5', aTest: (value) => value % 2 === 0, bTest: (value) => value % 5 === 0, range: 20 },
  { a: 'prime numbers', b: 'odd numbers', aTest: (value) => value > 1 && Array.from({ length: value - 2 }, (_, index) => index + 2).every((factor) => value % factor !== 0), bTest: (value) => value % 2 !== 0, range: 12 },
  { a: 'numbers less than 10', b: 'even numbers', aTest: (value) => value < 10, bTest: (value) => value % 2 === 0, range: 12 },
]
const expectedRegion = (rule: Rule, value: number): Region => { const inA = rule.aTest(value); const inB = rule.bTest(value); return inA && inB ? 'overlap' : inA ? 'a' : inB ? 'b' : 'outside' }
const regionColor: Record<Region, string> = { a: '#107d6f', overlap: '#7357b8', b: '#4f8cff', outside: '#d99018' }

const SetSorterActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const [rule, setRule] = useState(rules[0])
  const [placements, setPlacements] = useState<Record<number, Region | null>>(() => Object.fromEntries(Array.from({ length: 12 }, (_, index) => [index + 1, null])))
  const [selected, setSelected] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<Region | null>(null)
  const [checked, setChecked] = useState(false)
  const [message, setMessage] = useState('')
  const [completed, setCompleted] = useState(false)
  const values = Array.from({ length: rule.range }, (_, index) => index + 1)
  const allPlaced = values.every((value) => placements[value])
  const correct = checked && allPlaced && values.every((value) => placements[value] === expectedRegion(rule, value))
  const place = (region: Region, value = selected) => { if (value === null) return; setPlacements((current) => ({ ...current, [value]: region })); setSelected(null); setChecked(false); setMessage(''); setCompleted(false) }
  const startDrag = (event: DragEvent<HTMLButtonElement>, value: number) => event.dataTransfer.setData('text/set-value', String(value))
  const dropInto = (event: DragEvent<HTMLElement>, region: Region) => { event.preventDefault(); const value = Number(event.dataTransfer.getData('text/set-value')); if (value) place(region, value); setDragOver(null) }
  const check = () => {
    if (!allPlaced) { setChecked(true); setMessage(`Place all ${values.length} numbers before checking.`); return }
    const wrong = values.filter((value) => placements[value] !== expectedRegion(rule, value))
    if (wrong.length) { setPlacements((current) => Object.fromEntries(values.map((value) => [value, wrong.includes(value) ? null : current[value]]))); setChecked(true); setMessage(`${wrong.length} number${wrong.length === 1 ? '' : 's'} were misplaced. Some belong in both circles — check the rules.`); return }
    setChecked(true); setMessage(`Correct! A ∩ B = {${values.filter((value) => expectedRegion(rule, value) === 'overlap').join(', ')}}.`)
  }
  const startOver = () => { const next = (round + 1) % rules.length; setRound(next); setRule(rules[next]); setPlacements(Object.fromEntries(Array.from({ length: rules[next].range }, (_, index) => [index + 1, null]))); setSelected(null); setChecked(false); setMessage(''); setCompleted(false) }
  const nextActivity = () => startOver()
  const placedIn = (region: Region) => values.filter((value) => placements[value] === region)
  const notation = (region: Region) => placedIn(region).join(', ')
  const regionBox = (region: Region, label: string, sx: Record<string, unknown>) => <Box component="button" type="button" onClick={() => place(region)} onDragOver={(event) => { event.preventDefault(); setDragOver(region) }} onDragLeave={() => setDragOver(null)} onDrop={(event) => dropInto(event, region)} sx={{ position: 'absolute', border: 2, borderColor: dragOver === region ? regionColor[region] : 'transparent', borderRadius: 2, backgroundColor: dragOver === region ? `${regionColor[region]}22` : 'transparent', color: 'text.primary', cursor: 'pointer', p: .75, textAlign: 'left', transition: 'background-color .2s ease, border-color .2s ease', ...sx }}><Typography variant="subtitle2" sx={{ color: regionColor[region], fontWeight: 800 }}>{label} ({placedIn(region).length})</Typography><Stack direction="row" spacing={.5} flexWrap="wrap" sx={{ mt: .5 }}>{placedIn(region).map((value) => <Button key={value} draggable size="small" onDragStart={(event) => startDrag(event, value)} onClick={(event) => { event.stopPropagation(); setPlacements((current) => ({ ...current, [value]: null })); setChecked(false) }} sx={{ minWidth: 32, width: 32, height: 30, p: 0, backgroundColor: regionColor[region], color: 'common.white', fontWeight: 800, animation: checked ? 'tilePop .25s ease' : 'none', '@keyframes tilePop': { from: { transform: 'scale(.8)' }, to: { transform: 'scale(1)' } } }}>{value}</Button>)}</Stack></Box>

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>Sort numbers into the sets.</Typography><Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>A: {rule.a} · B: {rule.b}. Tap a number, then tap a region, or drag it into place.</Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center" sx={{ p: 1.5, minHeight: 64, borderRadius: 2, backgroundColor: 'rgba(16,125,111,.1)' }}>{values.filter((value) => !placements[value]).map((value) => <Button key={value} draggable onDragStart={(event) => startDrag(event, value)} onClick={() => setSelected(value)} variant={selected === value ? 'contained' : 'outlined'} aria-label={`Number ${value}`}>{value}</Button>)}</Stack>
      <Box sx={{ position: 'relative', width: '100%', maxWidth: 720, height: 390, mx: 'auto', border: 3, borderColor: 'divider', borderRadius: 2, overflow: 'hidden', backgroundColor: 'rgba(246,183,60,.06)', animation: checked && !correct ? 'vennShake .45s ease' : 'none', '@keyframes vennShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
        <Box component="svg" viewBox="0 0 720 390" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-label="Universal set with two overlapping circles"><defs><clipPath id="set-circle-a"><circle cx="285" cy="205" r="135" /></clipPath></defs><rect x="0" y="0" width="720" height="390" fill="rgba(246,183,60,.05)" /><circle cx="285" cy="205" r="135" fill="rgba(16,125,111,.12)" stroke="#107d6f" strokeWidth="4" /><circle cx="435" cy="205" r="135" fill="rgba(79,140,255,.12)" stroke="#4f8cff" strokeWidth="4" /><circle cx="435" cy="205" r="135" fill="rgba(115,87,184,.18)" clipPath="url(#set-circle-a)" /><text x="285" y="48" textAnchor="middle" fontSize="17" fontWeight="700" fill="#107d6f">A: {rule.a}</text><text x="435" y="48" textAnchor="middle" fontSize="17" fontWeight="700" fill="#4f8cff">B: {rule.b}</text></Box>
        {regionBox('a', 'A only', { left: '4%', top: '28%', width: '32%', height: '38%' })}{regionBox('overlap', 'A ∩ B', { left: '38%', top: '34%', width: '24%', height: '32%', textAlign: 'center' })}{regionBox('b', 'B only', { right: '4%', top: '28%', width: '32%', height: '38%' })}{regionBox('outside', 'Outside', { left: '4%', bottom: '4%', width: '92%', height: '22%' })}
      </Box>
      <Typography variant="body2" sx={{ textAlign: 'center', fontFamily: 'monospace' }}>A ∩ B = {'{'}{notation('overlap')}{'}'} · n(A) = {placedIn('a').length + placedIn('overlap').length} · n(B) = {placedIn('b').length + placedIn('overlap').length}</Typography>
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Button variant="outlined" onClick={startOver}>Start Over</Button><Button variant="contained" onClick={check}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? message : message || 'Some numbers are in the wrong region.'}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextActivity} sx={{ alignSelf: 'flex-start' }}>Next Activity</Button>}
    </Stack>
  </Paper>
}

export default SetSorterActivity
