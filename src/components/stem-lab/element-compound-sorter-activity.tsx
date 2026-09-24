import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useMemo, useState } from 'react'

type Zone = 'Element' | 'Compound'
type Atom = { symbol: string; color: string; size: number }
type Substance = { id: string; name: string; formula: string; zone: Zone; atoms: Atom[] }
const atom = (symbol: string, color: string, size = 30): Atom => ({ symbol, color, size })
const SUBSTANCE_POOL: Substance[] = [
  { id: 'o2', name: 'Oxygen', formula: 'O₂', zone: 'Element', atoms: [atom('O', '#ef785d', 32), atom('O', '#ef785d', 32)] },
  { id: 'fe', name: 'Iron', formula: 'Fe', zone: 'Element', atoms: [atom('Fe', '#8795a5', 38)] },
  { id: 'au', name: 'Gold', formula: 'Au', zone: 'Element', atoms: [atom('Au', '#e8b744', 38)] },
  { id: 'he', name: 'Helium', formula: 'He', zone: 'Element', atoms: [atom('He', '#bd83dc', 38)] },
  { id: 'h2o', name: 'Water', formula: 'H₂O', zone: 'Compound', atoms: [atom('O', '#ef785d', 34), atom('H', '#f4f6f8', 22), atom('H', '#f4f6f8', 22)] },
  { id: 'co2', name: 'Carbon dioxide', formula: 'CO₂', zone: 'Compound', atoms: [atom('O', '#ef785d', 28), atom('C', '#4e5968', 34), atom('O', '#ef785d', 28)] },
  { id: 'nacl', name: 'Sodium chloride', formula: 'NaCl', zone: 'Compound', atoms: [atom('Na', '#a9b9cb', 32), atom('Cl', '#82c878', 34)] },
  { id: 'ch4', name: 'Methane', formula: 'CH₄', zone: 'Compound', atoms: [atom('C', '#4e5968', 34), atom('H', '#f4f6f8', 20), atom('H', '#f4f6f8', 20), atom('H', '#f4f6f8', 20), atom('H', '#f4f6f8', 20)] },
  { id: 'nh3', name: 'Ammonia', formula: 'NH₃', zone: 'Compound', atoms: [atom('N', '#5088d9', 34), atom('H', '#f4f6f8', 20), atom('H', '#f4f6f8', 20), atom('H', '#f4f6f8', 20)] },
  { id: 'cl2', name: 'Chlorine', formula: 'Cl₂', zone: 'Element', atoms: [atom('Cl', '#82c878', 32), atom('Cl', '#82c878', 32)] },
]
const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - .5)

const geometryFor = (sample: Substance) => {
  if (sample.id === 'ch4') return [[50, 50], [50, 12], [20, 58], [80, 58], [50, 88]]
  if (sample.id === 'nh3') return [[50, 50], [50, 14], [27, 68], [73, 68]]
  if (sample.id === 'h2o') return [[50, 50], [24, 28], [76, 28]]
  if (sample.id === 'co2') return [[18, 50], [50, 50], [82, 50]]
  if (sample.id === 'nacl') return [[30, 50], [70, 50]]
  return sample.atoms.map((_, index) => [50 + (index - (sample.atoms.length - 1) / 2) * 22, 50])
}

const MoleculeDiagram: FC<{ sample: Substance }> = ({ sample }) => {
  const positions = geometryFor(sample)
  const bonds = sample.id === 'ch4' ? [1, 2, 3, 4] : sample.id === 'nh3' ? [1, 2, 3] : sample.id === 'h2o' ? [1, 2] : sample.atoms.length > 1 ? sample.atoms.slice(1).map((_, index) => index + 1) : []
  return <Box sx={{ position: 'relative', height: 90, minWidth: 125 }}>{bonds.map((index) => <Box key={`bond-${index}`} sx={{ position: 'absolute', left: `${(positions[0][0] + positions[index][0]) / 2}%`, top: `${(positions[0][1] + positions[index][1]) / 2}%`, width: `${Math.hypot(positions[index][0] - positions[0][0], positions[index][1] - positions[0][1]) * .72}%`, height: 5, transform: `translate(-50%, -50%) rotate(${Math.atan2(positions[index][1] - positions[0][1], positions[index][0] - positions[0][0]) * 180 / Math.PI}deg)`, transformOrigin: 'center', backgroundColor: '#aab9c8', borderRadius: 4 }} />)}{sample.atoms.map((item, index) => <Box key={`${item.symbol}-${index}`} sx={{ position: 'absolute', left: `${positions[index][0]}%`, top: `${positions[index][1]}%`, zIndex: 1, width: item.size, height: item.size, transform: 'translate(-50%, -50%)', display: 'grid', placeItems: 'center', borderRadius: '50%', color: item.symbol === 'H' ? '#354052' : '#fff', fontSize: item.size < 25 ? 9 : 11, fontWeight: 800, background: `radial-gradient(circle at 30% 25%, #fff, ${item.color} 46%, #38445a)`, boxShadow: `0 0 8px ${item.color}99` }} />)}</Box>
}

const ElementCompoundSorterActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [samples, setSamples] = useState<Substance[]>(() => shuffle(SUBSTANCE_POOL))
  const [placements, setPlacements] = useState<Record<string, Zone>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [challengeChoice, setChallengeChoice] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'warning'; message: string } | null>(null)
  const [validated, setValidated] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const challengeCompounds = useMemo(() => samples.filter((sample) => sample.zone === 'Compound'), [samples])
  const carbonAnswer = challengeCompounds.find((sample) => sample.atoms.some((item) => item.symbol === 'C'))
  const sortedCount = Object.keys(placements).length
  const place = (zone: Zone, id: string) => { const sample = samples.find((item) => item.id === id); if (!sample) return; setSelectedId(null); if (sample.zone === zone) { setPlacements((current) => ({ ...current, [id]: zone })); setFeedback({ kind: 'success', message: `Correct! ${sample.formula} is ${zone === 'Element' ? 'an element because it contains only one type of atom.' : 'a compound because it contains different types of atoms bonded together.'}` }) } else { setFeedback({ kind: 'warning', message: `${sample.formula} bounced back. Check whether its bonded atoms are all the same type.` }) } }
  const check = () => { const correct = sortedCount === samples.length && challengeChoice === carbonAnswer?.id; if (correct) { setFeedback({ kind: 'success', message: `Great work! You correctly identified all ${samples.length} elements and compounds, then found the carbon-containing compound.` }); setValidated(true); setCelebrating(true) } else { setFeedback({ kind: 'warning', message: sortedCount < samples.length ? 'Sort every sample into a zone before checking the challenge.' : 'Use the formula and colored atom composition to find the compound that contains carbon.' }); setValidated(false); setCelebrating(false) } }
  const reset = () => { setSamples(shuffle(SUBSTANCE_POOL)); setPlacements({}); setSelectedId(null); setChallengeChoice(null); setFeedback(null); setValidated(false); setCelebrating(false) }
  return <Box sx={{ '@keyframes sorterPop': { '0%': { transform: 'scale(.96)' }, '60%': { transform: 'scale(1.03)' }, '100%': { transform: 'scale(1)' } }, '@keyframes sorterCelebrate': { '0%, 100%': { boxShadow: '0 0 0 rgba(86,198,135,0)' }, '50%': { boxShadow: '0 0 30px rgba(86,198,135,.65)' } } }}><Stack spacing={2.5}><Box><Chip label="Element / Compound Sorter" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Sort atoms and compounds</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore the difference between elements and compounds.</Typography></Box><Chip label="Core" variant="outlined" sx={{ alignSelf: 'flex-start' }} /><Paper elevation={0} sx={{ p: { xs: 1.5, md: 2.5 }, border: 1, borderColor: validated ? 'success.main' : 'divider', animation: celebrating ? 'sorterCelebrate 1.2s ease-in-out infinite' : undefined }}><Stack spacing={2}><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{sortedCount} of {samples.length} sorted</Typography><Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 1 }}>{samples.filter((sample) => !placements[sample.id]).map((sample) => <Paper key={sample.id} draggable elevation={0} onDragStart={(event) => event.dataTransfer.setData('sample', sample.id)} onClick={() => setSelectedId(sample.id)} sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, border: 2, borderColor: selectedId === sample.id ? 'primary.main' : 'divider', cursor: 'grab', borderRadius: 2 }}><MoleculeDiagram sample={sample} /><Box><Typography variant="body2" sx={{ fontWeight: 800 }}>{sample.name}</Typography><Typography variant="caption" color="text.secondary">{sample.formula}</Typography></Box></Paper>)}</Box><Stack direction={{ xs: 'row', md: 'column' }} spacing={1} sx={{ minWidth: { md: 190 } }}>{(['Element', 'Compound'] as Zone[]).map((zone) => <Paper key={zone} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); place(zone, event.dataTransfer.getData('sample')) }} onClick={() => selectedId && place(zone, selectedId)} elevation={0} sx={{ p: 1.5, minHeight: 115, flex: 1, border: 2, borderStyle: 'dashed', borderColor: zone === 'Element' ? '#de7b6d' : '#5a92d9', backgroundColor: zone === 'Element' ? 'rgba(222,123,109,.08)' : 'rgba(90,146,217,.08)' }}><Typography sx={{ fontWeight: 800 }}>{zone}</Typography><Typography variant="caption" color="text.secondary">{zone === 'Element' ? 'One type of atom' : 'Different atom types bonded'}</Typography><Stack direction="row" flexWrap="wrap" sx={{ mt: 1 }}>{samples.filter((sample) => placements[sample.id] === zone).map((sample) => <Chip key={sample.id} label={sample.formula} size="small" sx={{ m: .25, animation: 'sorterPop .35s ease-out' }} />)}</Stack></Paper>)}</Stack></Stack></Stack></Paper><Paper elevation={0} sx={{ p: 1.75, border: 1, borderColor: 'primary.main', background: 'linear-gradient(110deg, rgba(40,120,200,.1), rgba(140,90,210,.08))' }}><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Challenge</Typography><Typography variant="body2" sx={{ mt: .35 }}>Which compound contains carbon?</Typography><Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>{challengeCompounds.map((sample) => <Button key={sample.id} size="small" variant={challengeChoice === sample.id ? 'contained' : 'outlined'} onClick={() => { setChallengeChoice(sample.id); setFeedback(null); setValidated(false) }} startIcon={<MoleculeDiagram sample={sample} />}>{sample.formula}</Button>)}</Stack></Paper>{feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : 'warning.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : 'warning.light' }}><Typography sx={{ fontWeight: 700 }}>{feedback.message}</Typography></Paper>}<Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" disabled={!challengeChoice} onClick={check} startIcon={<CheckCircleOutlineIcon />}>Check Activity</Button><Button variant="contained" color="success" disabled={!validated} onClick={onComplete}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack></Stack></Box>
}
export default ElementCompoundSorterActivity
