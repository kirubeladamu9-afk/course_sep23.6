import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import DownloadIcon from '@mui/icons-material/Download'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { type FC, useEffect, useMemo, useRef, useState } from 'react'

type BondMode = 'Covalent' | 'Ionic' | 'Metallic'
type BondElement = { symbol: string; name: string; number: number; color: string; radius: number; shells: number[]; valence: number; electronegativity: number; metal: boolean }

const ELEMENTS: BondElement[] = [
  { symbol: 'H', name: 'Hydrogen', number: 1, color: '#f0f4f7', radius: 25, shells: [1], valence: 1, electronegativity: 2.20, metal: false },
  { symbol: 'C', name: 'Carbon', number: 6, color: '#414141', radius: 40, shells: [2, 4], valence: 4, electronegativity: 2.55, metal: false },
  { symbol: 'N', name: 'Nitrogen', number: 7, color: '#4c85d3', radius: 38, shells: [2, 5], valence: 5, electronegativity: 3.04, metal: false },
  { symbol: 'O', name: 'Oxygen', number: 8, color: '#e55252', radius: 36, shells: [2, 6], valence: 6, electronegativity: 3.44, metal: false },
  { symbol: 'F', name: 'Fluorine', number: 9, color: '#a8e08a', radius: 34, shells: [2, 7], valence: 7, electronegativity: 3.98, metal: false },
  { symbol: 'Na', name: 'Sodium', number: 11, color: '#8b8bd8', radius: 52, shells: [2, 8, 1], valence: 1, electronegativity: .93, metal: true },
  { symbol: 'Cl', name: 'Chlorine', number: 17, color: '#68d2a0', radius: 48, shells: [2, 8, 7], valence: 7, electronegativity: 3.16, metal: false },
  { symbol: 'Mg', name: 'Magnesium', number: 12, color: '#b5a4dd', radius: 48, shells: [2, 8, 2], valence: 2, electronegativity: 1.31, metal: true },
]

const bySymbol = (symbol: string) => ELEMENTS.find((element) => element.symbol === symbol) ?? ELEMENTS[0]
const bondData = (a: BondElement, b: BondElement) => {
  const key = [a.symbol, b.symbol].sort().join('-')
  const known: Record<string, { length: number; energy: number; order: number; angle?: number; formula: string }> = {
    'C-H': { length: 109, energy: 413, order: 1, formula: 'CH₄', angle: 109.5 },
    'H-H': { length: 74, energy: 436, order: 1, formula: 'H₂', angle: 180 },
    'H-O': { length: 96, energy: 463, order: 1, formula: 'H₂O', angle: 104.5 },
    'C-O': { length: 116, energy: 799, order: 2, formula: 'CO₂', angle: 180 },
    'N-N': { length: 110, energy: 945, order: 3, formula: 'N₂', angle: 180 },
    'Cl-H': { length: 127, energy: 431, order: 1, formula: 'HCl', angle: 180 },
    'Cl-Na': { length: 236, energy: 787, order: 1, formula: 'NaCl' },
  }
  return known[key] ?? { length: Math.round(95 + Math.abs(a.radius - b.radius) * 1.2), energy: 350, order: 1, formula: `${a.symbol}${b.symbol}` }
}

const shellAngles = (count: number) => Array.from({ length: count }, (_, index) => (index / count) * Math.PI * 2 - Math.PI / 2)

const BohrAtom: FC<{ element: BondElement; x: number; y: number; phase: number; shared?: boolean }> = ({ element, x, y, phase, shared }) => {
  const scale = element.radius / 40
  return <g transform={`translate(${x} ${y}) scale(${scale})`}>
    {element.shells.map((count, shellIndex) => {
      const radius = 30 + shellIndex * 22
      return <g key={shellIndex}><circle r={radius} fill="none" stroke="#43627b" strokeWidth="1" strokeDasharray="2 4" opacity=".85" />{shellAngles(count).map((angle, index) => { const electronAngle = angle + phase * (1.3 - shellIndex * .18); return <circle key={index} cx={Math.cos(electronAngle) * radius} cy={Math.sin(electronAngle) * radius} r="3.5" fill={shared && shellIndex === element.shells.length - 1 ? '#70f3d0' : '#75b9ff'} stroke="#e7fbff" strokeWidth=".7" /> })}</g>
    })}
    <circle r="15" fill={element.color} stroke="#ffffff" strokeWidth="1.5" opacity=".96" />
    <circle r="8" fill="#f6c6a8" opacity=".34" />
    <text y="5" textAnchor="middle" fontSize="12" fontWeight="800" fill={element.symbol === 'C' ? '#fff' : '#122033'}>{element.symbol}</text>
  </g>
}

const Curve: FC<{ distance: number; equilibrium: number; energy: number }> = ({ distance, equilibrium, energy }) => {
  const points = Array.from({ length: 45 }, (_, index) => { const x = 20 + index * 6.2; const r = 50 + index * 3.1; const y = Math.min(86, 50 - (energy / 1000) * 24 * Math.exp(-Math.pow((r - equilibrium) / 40, 2)) + 25 / Math.max(1, (r - equilibrium + 55) / 55) ** 2); return `${x},${y}` }).join(' ')
  const markerX = 20 + Math.max(0, Math.min(44, (distance - 50) / 3.1)) * 6.2
  return <Box component="svg" viewBox="0 0 310 110" sx={{ width: '100%', height: 105, background: '#081321', borderRadius: 1.5, border: '1px solid #1c3851' }} aria-label="Potential energy curve"><path d="M20 12V92H295" fill="none" stroke="#55718c" strokeWidth="1" /><polyline points={points} fill="none" stroke="#63e9c2" strokeWidth="2.5" /><line x1={markerX} x2={markerX} y1="10" y2="92" stroke="#ffc76b" strokeDasharray="3 3" /><circle cx={markerX} cy={50} r="4" fill="#ffc76b" /><text x="23" y="105" fill="#7190a9" fontSize="9">repulsion</text><text x="252" y="105" fill="#7190a9" fontSize="9">distance →</text><text x="6" y="15" fill="#7190a9" fontSize="9">energy</text></Box>
}

const ChemicalBondingActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [mode, setMode] = useState<BondMode>('Covalent')
  const [slots, setSlots] = useState<string[]>(['C', 'H'])
  const [tested, setTested] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [frozen, setFrozen] = useState(false)
  const [slowMotion, setSlowMotion] = useState(1)
  const [showValence, setShowValence] = useState(false)
  const [showPairs, setShowPairs] = useState(true)
  const [muted, setMuted] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [phase, setPhase] = useState(0)
  const [step, setStep] = useState(0)
  const timeRef = useRef(0)
  useEffect(() => { let frame = 0; let last = performance.now(); const tick = (now: number) => { const delta = Math.min(40, now - last); last = now; if (playing && !frozen) { timeRef.current += delta * .001 * slowMotion; setPhase(timeRef.current); setStep((current) => current + delta * .001 * slowMotion) } frame = requestAnimationFrame(tick) }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame) }, [playing, frozen, slowMotion])
  const atoms = slots.map(bySymbol)
  const first = atoms[0]
  const second = atoms[1]
  const bond = bondData(first, second)
  const distance = bond.length + Math.sin(step * 3.2) * 3 * (playing && !frozen ? 1 : 0)
  const validPair = mode === 'Metallic' || (first.symbol !== second.symbol && !(!first.metal && !second.metal && first.valence === 8))
  const explanation = first.valence === 8 || second.valence === 8 ? `${first.symbol === 'He' || second.symbol === 'He' ? 'Noble gas shell already full, no bond.' : 'The selected atom has a shell already full.'}` : validPair ? `${first.name} and ${second.name} can form a ${mode.toLowerCase()} bond.` : 'This pair does not satisfy a stable valence pattern.'
  const formula = mode === 'Metallic' ? `${first.symbol} metal lattice` : bond.formula
  const valenceText = atoms.map((atom) => `${atom.symbol}: ${Math.min(8, atom.valence + (bond.order * (atom.symbol === 'H' ? 1 : 2)))}/8`).join('  ')
  const selectElement = (symbol: string) => setSlots((current) => current.length >= 2 ? [current[1], symbol] : [...current, symbol])
  const testBond = () => { setTested(true); if (validPair) onComplete?.() }
  const reset = () => { setSlots([]); setTested(false); setStep(0) }
  const exportModel = () => { const blob = new Blob([JSON.stringify({ mode, formula, atoms: slots, bondLengthPm: bond.length, bondEnergyKjMol: bond.energy }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'chemical-bonding-model.json'; anchor.click(); URL.revokeObjectURL(url) }
  const shellLegend = useMemo(() => first.shells.map((count, index) => `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} shell: ${count}`).join('  ·  '), [first])
  const x1 = mode === 'Metallic' ? 135 : 175
  const x2 = mode === 'Metallic' ? 465 : 430
  return <Box sx={{ width: '100%', minHeight: 720, color: '#d9eef7', background: 'linear-gradient(145deg,#050b16,#0b1625 55%,#09111d)', border: '1px solid #1e4257', borderRadius: 2, p: { xs: 1, md: 1.5 }, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} sx={{ minHeight: 690 }}>
      <Paper elevation={0} sx={{ width: { xs: '100%', lg: 250 }, flexShrink: 0, p: 1.25, background: '#0b1524', border: '1px solid #1c3851', color: 'inherit' }}>
        <Typography variant="subtitle2" sx={{ color: '#64e7c1', fontWeight: 800 }}>Build a Compound</Typography><Typography variant="caption" sx={{ display: 'block', color: '#8da7b9', mb: 1 }}>Select atoms, test a bond, then inspect what makes it stable.</Typography>
        <Typography variant="overline" sx={{ color: '#7795aa' }}>Bond type</Typography><Stack direction="row" spacing={.4} sx={{ mb: 1 }}>{(['Covalent', 'Ionic', 'Metallic'] as BondMode[]).map((item) => <Button key={item} size="small" onClick={() => { setMode(item); setTested(false) }} sx={{ minWidth: 0, px: .8, color: mode === item ? '#06131b' : '#9fb6c6', background: mode === item ? '#59e5ba' : '#15283a', fontSize: 10, '&:hover': { background: '#59e5ba', color: '#06131b' } }}>{item}</Button>)}</Stack>
        <Typography variant="overline" sx={{ color: '#7795aa' }}>Element grid</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: .45, mb: 1 }}>{ELEMENTS.map((element) => <Button key={element.symbol} onClick={() => selectElement(element.symbol)} sx={{ minWidth: 0, p: .35, display: 'flex', flexDirection: 'column', border: '1px solid #26455c', color: '#e8f4f7', background: `${element.color}33`, '&:hover': { background: `${element.color}88` } }}><Typography sx={{ fontWeight: 800, fontSize: 12 }}>{element.symbol}</Typography><Typography sx={{ fontSize: 8, color: '#94acbc' }}>{element.number}</Typography></Button>)}</Box>
        <Divider sx={{ borderColor: '#1e3a50', mb: 1 }} /><Typography variant="overline" sx={{ color: '#7795aa' }}>Selected atoms</Typography><Stack direction="row" spacing={.5} sx={{ mb: 1 }}>{[0, 1].map((index) => <Box key={index} sx={{ flex: 1, p: .8, minHeight: 38, border: '1px dashed #41617a', borderRadius: 1, textAlign: 'center', color: slots[index] ? '#64e7c1' : '#678296' }}>{slots[index] ?? 'empty'}</Box>)}</Stack>
        <Button fullWidth variant="contained" onClick={testBond} disabled={slots.length < 2} sx={{ background: '#59e5ba', color: '#06131b', fontWeight: 800, '&:hover': { background: '#83f3d0' } }}>Test Bond</Button>
        {tested && <Paper elevation={0} sx={{ mt: 1, p: 1, background: validPair ? '#113a36' : '#3a2530', border: 1, borderColor: validPair ? '#59e5ba' : '#de8295', color: '#dcecf2' }}><Typography variant="caption" sx={{ fontWeight: 800 }}>{validPair ? 'Stable pairing' : 'No stable bond'}</Typography><Typography variant="caption" sx={{ display: 'block', mt: .3 }}>{explanation}</Typography></Paper>}
        <Stack direction="row" spacing={.5} sx={{ mt: 1 }}><Button size="small" onClick={reset} startIcon={<ReplayIcon />} sx={{ color: '#a8c1cf', flex: 1 }}>Reset</Button><Tooltip title={muted ? 'Unmute sound' : 'Mute sound'}><IconButton size="small" onClick={() => setMuted(!muted)} sx={{ color: '#9fb6c6' }}>{muted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}</IconButton></Tooltip></Stack>
        <Box sx={{ mt: 2, p: .8, borderRadius: 1, background: '#101f30', color: '#86a4b7', fontSize: 10 }}>Bohr model is a teaching simplification. Shells are shown as 2, 8, 18 where appropriate.</Box>
      </Paper>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1 }}><Box><Typography variant="h6" sx={{ color: '#eaf8fb', fontWeight: 800 }}>Chemical Bonding Simulator</Typography><Typography variant="caption" sx={{ color: '#7e9caf' }}>Explore electrons, energy, geometry, and polarity in every frame.</Typography></Box><Chip label={tested && validPair ? 'Stable bond' : 'Select two atoms'} size="small" sx={{ color: '#06201b', background: tested && validPair ? '#59e5ba' : '#263d50' }} /></Stack>
        <Paper elevation={0} sx={{ p: 1, background: '#07101d', border: '1px solid #1e4257', color: 'inherit' }}>
          <Stack direction="row" spacing={.5} sx={{ mb: 1 }}>{(['Covalent', 'Ionic', 'Metallic'] as BondMode[]).map((item) => <Button key={item} size="small" onClick={() => setMode(item)} sx={{ color: mode === item ? '#06131b' : '#8ca8ba', background: mode === item ? '#59e5ba' : '#132638', borderRadius: 1 }}>{item}</Button>)}</Stack>
          <Box sx={{ height: { xs: 280, md: 365 }, position: 'relative', overflow: 'hidden', borderRadius: 1, backgroundImage: 'linear-gradient(#153047 1px, transparent 1px), linear-gradient(90deg,#153047 1px,transparent 1px)', backgroundSize: '32px 32px', backgroundColor: '#07101d' }}>
            <Box component="svg" viewBox="0 0 600 365" sx={{ width: '100%', height: '100%', transform: `perspective(800px) rotateY(${rotation}deg)`, transition: 'transform .25s ease' }}>
              {mode === 'Metallic' ? <g>{Array.from({ length: 12 }, (_, index) => { const x = 90 + (index % 4) * 140; const y = 95 + Math.floor(index / 4) * 85; return <g key={index}><circle cx={x} cy={y} r="27" fill="#a9b4bf" stroke="#e3f4ff" strokeWidth="2" opacity=".9" /><text x={x} y={y + 4} textAnchor="middle" fill="#1b2a37" fontSize="12">core</text></g> })}<path d="M32 50 Q180 10 300 58 T570 42 M20 250 Q180 190 315 252 T580 218 M35 325 Q200 270 580 310" fill="none" stroke="#67d9ff" strokeWidth="3" opacity=".7" strokeDasharray="5 9" /><text x="300" y="28" textAnchor="middle" fill="#8cecff" fontSize="14">delocalized electron sea · conduction under voltage</text></g> : <g>{tested && validPair && <line x1={x1} y1="182" x2={x2} y2="182" stroke="#5de6c0" strokeWidth={bond.order * 5} opacity=".45" />}{tested && validPair && Array.from({ length: bond.order }, (_, index) => <circle key={index} cx={(x1 + x2) / 2 + (index - (bond.order - 1) / 2) * 12} cy="182" r="7" fill="#6ff5d4" stroke="#d1fff4" strokeWidth="1" />)}<BohrAtom element={first} x={x1} y={182} phase={phase} shared={tested && validPair} /><BohrAtom element={second} x={x2 + (distance - bond.length) * .5} y={182} phase={phase} shared={tested && validPair} /><text x={x1} y="315" textAnchor="middle" fill="#9eb7c5" fontSize="12">{first.name}</text><text x={x2} y="315" textAnchor="middle" fill="#9eb7c5" fontSize="12">{second.name}</text>{mode === 'Ionic' && tested && validPair && <path d={`M${x1 + 42} 145 Q300 48 ${x2 - 45} 145`} fill="none" stroke="#ffc76b" strokeWidth="3" strokeDasharray="7 6"><animate attributeName="stroke-dashoffset" values="0;-26" dur="1s" repeatCount="indefinite" /></path>}</g>}
              <text x="300" y="348" textAnchor="middle" fill="#6f8ea5" fontSize="11">{mode === 'Metallic' ? 'positive cores + mobile electrons' : `${formula} · ${bond.angle ? `${bond.angle}° geometry` : 'charge-balanced pair'}`}</text>
            </Box>
          </Box>
          <Stack direction="row" spacing={.5} flexWrap="wrap" sx={{ mt: 1 }}>{[<Button key="simulate" size="small" variant="contained" onClick={() => { setPlaying(true); setFrozen(false) }} startIcon={<PlayArrowIcon />}>Simulate</Button>, <Button key="reset" size="small" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button>, <Button key="freeze" size="small" onClick={() => setFrozen(!frozen)}>{frozen ? 'Unfreeze' : 'Freeze'}</Button>, <Button key="valence" size="small" variant={showValence ? 'contained' : 'outlined'} onClick={() => setShowValence(!showValence)}>Valence only</Button>, <Button key="pairs" size="small" variant={showPairs ? 'contained' : 'outlined'} onClick={() => setShowPairs(!showPairs)}>Bond pairs</Button>, <Button key="export" size="small" onClick={exportModel} startIcon={<DownloadIcon />}>Export</Button>]}<IconButton size="small" onClick={() => setPlaying(!playing)} sx={{ color: '#a7c1cf' }}>{playing ? <PauseIcon /> : <PlayArrowIcon />}</IconButton><IconButton size="small" onClick={() => { setStep((current) => current + .2); setPhase((current) => current + .2) }} sx={{ color: '#a7c1cf' }}><SkipNextIcon fontSize="small" /></IconButton></Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mt: 1 }}><Typography variant="caption" sx={{ minWidth: 75, color: '#82a0b2' }}>Slow motion</Typography><Slider size="small" min={.15} max={1.5} step={.05} value={slowMotion} onChange={(_, value) => setSlowMotion(value as number)} sx={{ maxWidth: 180, color: '#59e5ba' }} aria-label="Slow motion" /><Typography variant="caption" sx={{ color: '#91aabc' }}>{slowMotion.toFixed(2)}×</Typography><Typography variant="caption" sx={{ color: '#91aabc' }}>Rotate</Typography><Slider size="small" min={-18} max={18} value={rotation} onChange={(_, value) => setRotation(value as number)} sx={{ maxWidth: 150, color: '#59e5ba' }} aria-label="Rotate molecule" /></Stack>
        </Paper>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1 }}><Paper elevation={0} sx={{ flex: 1, p: 1, background: '#0b1524', border: '1px solid #1c3851', color: 'inherit' }}><Typography variant="subtitle2" sx={{ color: '#64e7c1' }}>{formula} — {mode} model</Typography><Typography variant="caption" sx={{ display: 'block', color: '#a6bac6' }}>Bond length: <b>{Math.round(distance)} pm</b> · Bond energy: <b>{bond.energy} kJ/mol</b></Typography><Typography variant="caption" sx={{ display: 'block', color: '#8da7b9' }}>Electrons: {shellLegend}</Typography>{showValence && <Typography variant="caption" sx={{ display: 'block', color: '#6ff5d4', mt: .4 }}>{valenceText}</Typography>}<Typography variant="caption" sx={{ display: 'block', color: '#9fb6c6', mt: .5 }}>{first.symbol === second.symbol ? 'Nonpolar bond' : `${first.symbol}–${second.symbol} polarity: ${Math.abs(first.electronegativity - second.electronegativity) > .4 ? `${first.electronegativity > second.electronegativity ? first.symbol : second.symbol} δ− · dipole → electronegative atom` : 'symmetric electron sharing'}`}</Typography></Paper><Paper elevation={0} sx={{ flex: 1, p: 1, background: '#0b1524', border: '1px solid #1c3851', color: 'inherit' }}><Typography variant="subtitle2" sx={{ color: '#64e7c1' }}>Potential energy / distance</Typography><Curve distance={distance} equilibrium={bond.length} energy={bond.energy} /><Typography variant="caption" sx={{ color: '#8da7b9' }}>Moving marker · repulsion wall at short distance · minimum at equilibrium.</Typography></Paper></Stack>
      </Box>
    </Stack>
  </Box>
}

export default ChemicalBondingActivity
