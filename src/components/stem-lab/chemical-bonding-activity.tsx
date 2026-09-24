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
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import VolumeOffIcon from '@mui/icons-material/VolumeOff'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import { type FC, type PointerEvent, useEffect, useMemo, useRef, useState } from 'react'
import { BOND_REFERENCES, CHEMICAL_ELEMENTS, classifyBond, distance, elementBySymbol, estimateBondOrder, formulaFor, morsePotential, type BondMode, type ElementData, type EngineSnapshot } from './chemical-bonding-engine'
import type { ChemicalWorkerCommand, ChemicalWorkerEvent } from './chemical-bonding-worker'

const bySymbol = (symbol: string) => elementBySymbol(symbol)
const symbolsFor = (slots: string[]) => slots.length >= 2 ? slots : ['C', 'H']
const formulaText = (symbols: string[]) => Object.entries(formulaFor(symbols)).sort((a, b) => symbols.indexOf(a[0]) - symbols.indexOf(b[0])).map(([symbol, count]) => `${symbol}${count > 1 ? count : ''}`).join('')
const shellAngles = (count: number) => Array.from({ length: count }, (_, index) => (index / count) * Math.PI * 2 - Math.PI / 2)

const BohrAtom: FC<{ element: ElementData; x: number; y: number; phase: number; shared?: boolean; scale?: number }> = ({ element, x, y, phase, shared, scale = 1 }) => <g transform={`translate(${x} ${y}) scale(${scale})`}>
  {element.shells.map((count, shellIndex) => {
    const radius = 28 + shellIndex * 20
    return <g key={shellIndex}><circle r={radius} fill="none" stroke="#43627b" strokeWidth="1" strokeDasharray="2 4" opacity=".85" />{shellAngles(count).map((angle, index) => { const electronAngle = angle + phase * (1.3 - shellIndex * .18); return <circle key={index} cx={Math.cos(electronAngle) * radius} cy={Math.sin(electronAngle) * radius} r="3.2" fill={shared && shellIndex === element.shells.length - 1 ? '#70f3d0' : '#75b9ff'} stroke="#e7fbff" strokeWidth=".7" /> })}</g>
  })}
  <circle r="15" fill={element.color} stroke="#ffffff" strokeWidth="1.5" opacity=".96" />
  <circle r="8" fill="#f6c6a8" opacity=".34" />
  <text y="5" textAnchor="middle" fontSize="12" fontWeight="800" fill={element.symbol === 'C' ? '#fff' : '#122033'}>{element.symbol}</text>
</g>

const EnergyChart: FC<{ history: EngineSnapshot[] }> = ({ history }) => {
  const values = history.length ? history : []
  const max = Math.max(1, ...values.flatMap((item) => [item.energy.kinetic, item.energy.potential, item.energy.total]))
  const path = (key: 'kinetic' | 'potential' | 'total') => values.map((item, index) => `${20 + index * 4.6},${88 - (item.energy[key] / max) * 68}`).join(' ')
  return <Box component="svg" viewBox="0 0 310 110" sx={{ width: '100%', height: 105, background: '#081321', borderRadius: 1.5, border: '1px solid #1c3851' }} aria-label="Live kinetic potential and total energy chart"><path d="M20 12V92H295" fill="none" stroke="#55718c" strokeWidth="1" />{values.length > 1 && <><polyline points={path('kinetic')} fill="none" stroke="#ffc76b" strokeWidth="1.8" /><polyline points={path('potential')} fill="none" stroke="#63e9c2" strokeWidth="1.8" /><polyline points={path('total')} fill="none" stroke="#a9a5ff" strokeWidth="2" /></>}<text x="23" y="105" fill="#7190a9" fontSize="9">time (fs)</text><text x="7" y="15" fill="#7190a9" fontSize="9">kJ/mol</text><text x="198" y="18" fill="#ffc76b" fontSize="9">K</text><text x="218" y="18" fill="#63e9c2" fontSize="9">V</text><text x="238" y="18" fill="#a9a5ff" fontSize="9">E</text></Box>
}

const PotentialCurve: FC<{ distancePm: number; equilibriumPm: number; energyKjMol: number }> = ({ distancePm, equilibriumPm, energyKjMol }) => {
  const points = Array.from({ length: 56 }, (_, index) => {
    const r = Math.max(35, equilibriumPm * .55 + index * equilibriumPm * .025)
    const value = morsePotential(r, equilibriumPm, energyKjMol)
    return `${20 + index * 4.9},${16 + Math.min(72, (value / Math.max(energyKjMol, 1)) * 70)}`
  }).join(' ')
  const markerX = 20 + Math.max(0, Math.min(55, (distancePm - equilibriumPm * .55) / (equilibriumPm * .025))) * 4.9
  return <Box component="svg" viewBox="0 0 310 110" sx={{ width: '100%', height: 105, background: '#081321', borderRadius: 1.5, border: '1px solid #1c3851' }} aria-label="Morse potential energy versus distance"><path d="M20 12V92H295" fill="none" stroke="#55718c" strokeWidth="1" /><polyline points={points} fill="none" stroke="#63e9c2" strokeWidth="2.5" /><line x1={markerX} x2={markerX} y1="10" y2="92" stroke="#ffc76b" strokeDasharray="3 3" /><circle cx={markerX} cy={50} r="4" fill="#ffc76b" /><text x="23" y="105" fill="#7190a9" fontSize="9">short range</text><text x="240" y="105" fill="#7190a9" fontSize="9">distance →</text><text x="6" y="15" fill="#7190a9" fontSize="9">V(r)</text></Box>
}

const project = (position: { x: number; y: number; z: number }, rotation: number) => {
  const angle = rotation * Math.PI / 180
  const x = position.x * Math.cos(angle) - position.z * Math.sin(angle)
  const depth = position.x * Math.sin(angle) + position.z * Math.cos(angle)
  return { x: 300 + x * 1.05, y: 184 + position.y * 1.05, depth }
}

const ChemicalBondingActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [bondMode, setBondMode] = useState<BondMode>('Covalent')
  const [slots, setSlots] = useState<string[]>(['C', 'H'])
  const [tested, setTested] = useState(false)
  const [playing, setPlaying] = useState(true)
  const [slowMotion, setSlowMotion] = useState(1)
  const [temperature, setTemperature] = useState(298)
  const [thermostat, setThermostat] = useState(true)
  const [showValence, setShowValence] = useState(false)
  const [showPairs, setShowPairs] = useState(true)
  const [muted, setMuted] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null)
  const [history, setHistory] = useState<EngineSnapshot[]>([])
  const [workerError, setWorkerError] = useState('')
  const [dragging, setDragging] = useState(false)
  const workerRef = useRef<Worker | null>(null)
  const dragStartRef = useRef(0)
  const symbols = symbolsFor(slots)
  const symbolKey = slots.join('-')

  useEffect(() => {
    const worker = new Worker(new URL('./chemical-bonding-worker.ts', import.meta.url), { type: 'module' })
    workerRef.current = worker
    const onMessage = (message: MessageEvent<ChemicalWorkerEvent>) => {
      const event = message.data
      if (event.type === 'error') {
        setWorkerError(event.message)
        return
      }
      setSnapshot(event.snapshot)
      setHistory((current) => [...current.slice(-59), event.snapshot])
    }
    worker.onmessage = onMessage
    worker.postMessage({ type: 'init', symbols, mode: bondMode } satisfies ChemicalWorkerCommand)
    worker.postMessage({ type: 'set-temperature', temperatureK: temperature } satisfies ChemicalWorkerCommand)
    worker.postMessage({ type: 'set-rate', rate: slowMotion } satisfies ChemicalWorkerCommand)
    worker.postMessage({ type: 'set-thermostat', enabled: thermostat } satisfies ChemicalWorkerCommand)
    worker.postMessage({ type: playing ? 'play' : 'pause' } satisfies ChemicalWorkerCommand)
    worker.postMessage({ type: 'minimize' } satisfies ChemicalWorkerCommand)
    return () => { worker.terminate(); workerRef.current = null }
  }, [symbolKey, bondMode])

  useEffect(() => { workerRef.current?.postMessage({ type: 'set-temperature', temperatureK: temperature } satisfies ChemicalWorkerCommand) }, [temperature])
  useEffect(() => { workerRef.current?.postMessage({ type: 'set-rate', rate: slowMotion } satisfies ChemicalWorkerCommand) }, [slowMotion])
  useEffect(() => { workerRef.current?.postMessage({ type: 'set-thermostat', enabled: thermostat } satisfies ChemicalWorkerCommand) }, [thermostat])
  useEffect(() => { workerRef.current?.postMessage({ type: playing ? 'play' : 'pause' } satisfies ChemicalWorkerCommand) }, [playing])

  const atoms = symbols.map(bySymbol)
  const first = atoms[0]
  const second = atoms[1]
  const kind = classifyBond(first.symbol, second.symbol, bondMode)
  const bond = snapshot?.bonds[0]
  const reference = BOND_REFERENCES[[first.symbol, second.symbol].sort().join('-')] ?? { lengthPm: snapshot?.equilibriumDistancePm ?? first.covalentRadiusPm + second.covalentRadiusPm, energyKjMol: 350, order: 1 }
  const distancePm = snapshot?.bondDistancePm ?? reference.lengthPm
  const order = bond?.order ?? estimateBondOrder(first.symbol, second.symbol, distancePm)
  const stable = Boolean(snapshot?.bonds.length && !snapshot.brokenBond)
  const validPair = bondMode === 'Metallic' || (first.valence < 8 && second.valence < 8)
  const formula = bondMode === 'Metallic' ? `${first.symbol} metal lattice` : formulaText(symbols)
  const valenceText = atoms.map((atom) => `${atom.symbol}: ${Math.min(8, atom.valence + order)}/8`).join('  ')
  const shellLegend = useMemo(() => first.shells.map((count, index) => `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'} shell: ${count}`).join('  ·  '), [first])
  const selectedProjected = snapshot?.atoms.map((atom) => ({ ...atom, projected: project(atom.position, rotation) })).sort((a, b) => a.projected.depth - b.projected.depth) ?? []
  const polarity = Math.abs(first.electronegativity - second.electronegativity)
  const explanation = kind === 'ionic' ? `${first.symbol} transfers electron density to ${second.symbol === first.symbol ? first.symbol : (first.electronegativity > second.electronegativity ? first.symbol : second.symbol)}.` : kind === 'metallic' ? 'Positive cores share a delocalized electron sea.' : `${first.name} and ${second.name} share ${order > 1 ? `${order} electron pairs` : 'an electron pair'}; the Morse well lets the bond vibrate and dissociate.`

  const selectElement = (symbol: string) => setSlots((current) => current.length >= 5 ? [...current.slice(1), symbol] : [...current, symbol])
  const setPreset = (preset: string[]) => { setSlots(preset); setTested(true) }
  const testBond = () => { setTested(true); workerRef.current?.postMessage({ type: 'minimize' } satisfies ChemicalWorkerCommand); if (validPair) onComplete?.() }
  const reset = () => { setSlots([]); setTested(false); setPlaying(true); setHistory([]) }
  const pullDistance = (event: PointerEvent<HTMLElement>) => {
    if (!dragging || !snapshot) return
    const nextDistance = distancePm + (event.clientX - dragStartRef.current) * .8
    workerRef.current?.postMessage({ type: 'drag-distance', distancePm: nextDistance } satisfies ChemicalWorkerCommand)
  }

  return <Box sx={{ width: '100%', minHeight: 760, color: '#d9eef7', background: 'linear-gradient(145deg,#050b16,#0b1625 55%,#09111d)', border: '1px solid #1e4257', borderRadius: 2, p: { xs: 1, md: 1.5 }, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1} sx={{ minHeight: 730 }}>
      <Paper elevation={0} sx={{ width: { xs: '100%', lg: 250 }, flexShrink: 0, p: 1.25, background: '#0b1524', border: '1px solid #1c3851', color: 'inherit' }}>
        <Typography variant="subtitle2" sx={{ color: '#64e7c1', fontWeight: 800 }}>Build a Compound</Typography><Typography variant="caption" sx={{ display: 'block', color: '#8da7b9', mb: 1 }}>Select atoms, test a bond, then inspect live forces and electron sharing.</Typography>
        <Typography variant="overline" sx={{ color: '#7795aa' }}>Bond type</Typography><Stack direction="row" spacing={.4} sx={{ mb: 1 }}>{(['Covalent', 'Ionic', 'Metallic'] as BondMode[]).map((item) => <Button key={item} size="small" onClick={() => { setBondMode(item); setTested(false) }} sx={{ minWidth: 0, px: .7, color: bondMode === item ? '#06131b' : '#9fb6c6', background: bondMode === item ? '#59e5ba' : '#15283a', fontSize: 10 }}>{item}</Button>)}</Stack>
        <Typography variant="overline" sx={{ color: '#7795aa' }}>Element grid</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: .45, mb: 1 }}>{CHEMICAL_ELEMENTS.map((element) => <Button key={element.symbol} onClick={() => selectElement(element.symbol)} sx={{ minWidth: 0, p: .35, display: 'flex', flexDirection: 'column', border: '1px solid #26455c', color: '#e8f4f7', background: `${element.color}33`, '&:hover': { background: `${element.color}88` } }}><Typography sx={{ fontWeight: 800, fontSize: 12 }}>{element.symbol}</Typography><Typography sx={{ fontSize: 8, color: '#94acbc' }}>{element.atomicNumber}</Typography></Button>)}</Box>
        <Typography variant="overline" sx={{ color: '#7795aa' }}>Molecule row</Typography><Stack direction="row" spacing={.35} sx={{ mb: 1, flexWrap: 'wrap' }}>{[['H₂', ['H', 'H']], ['HCl', ['H', 'Cl']], ['H₂O', ['O', 'H', 'H']], ['NH₃', ['N', 'H', 'H', 'H']], ['CH₄', ['C', 'H', 'H', 'H', 'H']], ['CO₂', ['C', 'O', 'O']]].map(([label, preset]) => <Button key={String(label)} size="small" onClick={() => setPreset(preset as string[])} sx={{ minWidth: 0, color: '#9fb6c6', background: '#132638', fontSize: 10 }}>{label}</Button>)}</Stack>
        <Divider sx={{ borderColor: '#1e3a50', mb: 1 }} /><Typography variant="overline" sx={{ color: '#7795aa' }}>Selected atoms</Typography><Stack direction="row" spacing={.5} sx={{ mb: 1, flexWrap: 'wrap' }}>{[0, 1, 2, 3, 4].map((index) => <Box key={index} sx={{ flex: '1 0 28px', p: .65, minHeight: 34, border: '1px dashed #41617a', borderRadius: 1, textAlign: 'center', color: slots[index] ? '#64e7c1' : '#678296' }}>{slots[index] ?? 'empty'}</Box>)}</Stack>
        <Button fullWidth variant="contained" onClick={testBond} disabled={slots.length < 2} sx={{ background: '#59e5ba', color: '#06131b', fontWeight: 800, '&:hover': { background: '#83f3d0' } }}>Test Bond</Button>
        {tested && <Paper elevation={0} sx={{ mt: 1, p: 1, background: stable ? '#113a36' : '#3a2530', border: 1, borderColor: stable ? '#59e5ba' : '#de8295', color: '#dcecf2' }}><Typography variant="caption" sx={{ fontWeight: 800 }}>{stable ? 'Stable pairing' : 'Stretch or adjust the pair'}</Typography><Typography variant="caption" sx={{ display: 'block', mt: .3 }}>{explanation}</Typography></Paper>}
        <Stack direction="row" spacing={.5} sx={{ mt: 1 }}><Button size="small" onClick={reset} startIcon={<ReplayIcon />} sx={{ color: '#a8c1cf', flex: 1 }}>Reset</Button><Tooltip title={muted ? 'Unmute sound' : 'Mute sound'}><IconButton size="small" onClick={() => setMuted(!muted)} sx={{ color: '#9fb6c6' }}>{muted ? <VolumeOffIcon fontSize="small" /> : <VolumeUpIcon fontSize="small" />}</IconButton></Tooltip></Stack>
        <Box sx={{ mt: 2, p: .8, borderRadius: 1, background: '#101f30', color: '#86a4b7', fontSize: 10 }}>Bohr shells are a teaching model. Forces and coordinates come from the TypeScript worker, not scripted animation.</Box>
      </Paper>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1} sx={{ mb: 1 }}><Box><Typography variant="h6" sx={{ color: '#eaf8fb', fontWeight: 800 }}>Chemical Bonding Simulator</Typography><Typography variant="caption" sx={{ color: '#7e9caf' }}>Orbit the real molecule, stretch a bond, and inspect energy in every frame.</Typography></Box><Chip label={stable ? 'Live physics' : 'Bond dissociated'} size="small" sx={{ color: '#06201b', background: stable ? '#59e5ba' : '#ffc76b' }} /></Stack>
        <Paper elevation={0} sx={{ p: 1, background: '#07101d', border: '1px solid #1e4257', color: 'inherit' }}>
          <Stack direction="row" spacing={.5} sx={{ mb: 1 }}>{(['Covalent', 'Ionic', 'Metallic'] as BondMode[]).map((item) => <Button key={item} size="small" onClick={() => setBondMode(item)} sx={{ color: bondMode === item ? '#06131b' : '#8ca8ba', background: bondMode === item ? '#59e5ba' : '#132638', borderRadius: 1 }}>{item}</Button>)}</Stack>
          <Box onPointerDown={(event) => { if (tested && snapshot?.atoms.length === 2) { setDragging(true); dragStartRef.current = event.clientX } }} onPointerMove={pullDistance} onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)} sx={{ height: { xs: 300, md: 380 }, position: 'relative', overflow: 'hidden', borderRadius: 1, cursor: dragging ? 'ew-resize' : 'grab', backgroundImage: 'linear-gradient(#153047 1px, transparent 1px), linear-gradient(90deg,#153047 1px,transparent 1px)', backgroundSize: '32px 32px', backgroundColor: '#07101d' }}>
            <Box component="svg" viewBox="0 0 600 365" sx={{ width: '100%', height: '100%', touchAction: 'none' }}>
              {bondMode === 'Metallic' ? <g>{Array.from({ length: 12 }, (_, index) => { const x = 90 + (index % 4) * 140; const y = 95 + Math.floor(index / 4) * 85; return <g key={index}><circle cx={x} cy={y} r="27" fill="#a9b4bf" stroke="#e3f4ff" strokeWidth="2" opacity=".9" /><text x={x} y={y + 4} textAnchor="middle" fill="#1b2a37" fontSize="12">core</text></g> })}<path d="M32 50 Q180 10 300 58 T570 42 M20 250 Q180 190 315 252 T580 218 M35 325 Q200 270 580 310" fill="none" stroke="#67d9ff" strokeWidth="3" opacity=".7" strokeDasharray="5 9" /><text x="300" y="28" textAnchor="middle" fill="#8cecff" fontSize="14">delocalized electron sea · conduction under voltage</text></g> : <g>{snapshot?.bonds.map((currentBond) => { const a = selectedProjected.find((atom) => atom.id === currentBond.a)?.projected; const b = selectedProjected.find((atom) => atom.id === currentBond.b)?.projected; if (!a || !b) return null; return <g key={`${currentBond.a}-${currentBond.b}`}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={kind === 'ionic' ? '#ffc76b' : '#5de6c0'} strokeWidth={Math.max(4, currentBond.order * 4)} opacity=".45" />{showPairs && Array.from({ length: currentBond.order }, (_, index) => { const pairPhase = (snapshot?.timeFs ?? 0) * .02 + index * Math.PI / 2; return <circle key={index} cx={(a.x + b.x) / 2 + (index - (currentBond.order - 1) / 2) * 13 + Math.cos(pairPhase) * 9} cy={(a.y + b.y) / 2 + Math.sin(pairPhase) * 9} r="7" fill="#6ff5d4" stroke="#d1fff4" strokeWidth="1" /> })}</g> })}{kind === 'ionic' && tested && <path d="M230 130 Q300 45 370 130" fill="none" stroke="#ffc76b" strokeWidth="2" strokeDasharray="4 5" />}{selectedProjected.map((atom) => <g key={atom.id}><BohrAtom element={bySymbol(atom.symbol)} x={atom.projected.x} y={atom.projected.y} phase={(snapshot?.timeFs ?? 0) * .015} shared={stable} scale={1} /><text x={atom.projected.x} y={atom.projected.y + 86} textAnchor="middle" fill="#9eb7c5" fontSize="12">{bySymbol(atom.symbol).name}</text></g>)}<text x="300" y="348" textAnchor="middle" fill="#6f8ea5" fontSize="11">{formula} · {snapshot?.targetAngleDeg ? `${snapshot.targetAngleDeg}° equilibrium geometry` : 'distance-driven bond detection'}</text></g>}
            </Box>
          </Box>
          <Stack direction="row" spacing={.5} flexWrap="wrap" sx={{ mt: 1 }}>{[<Button key="simulate" size="small" variant="contained" onClick={() => setPlaying(true)} startIcon={<PlayArrowIcon />}>Play</Button>, <Button key="pause" size="small" onClick={() => setPlaying(false)} startIcon={<PauseIcon />}>Pause</Button>, <Button key="reset" size="small" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button>, <Button key="minimize" size="small" onClick={() => workerRef.current?.postMessage({ type: 'minimize' } satisfies ChemicalWorkerCommand)}>Minimize</Button>, <Button key="thermostat" size="small" variant={thermostat ? 'contained' : 'outlined'} onClick={() => setThermostat(!thermostat)}>Thermostat</Button>, <Button key="valence" size="small" variant={showValence ? 'contained' : 'outlined'} onClick={() => setShowValence(!showValence)}>Octet / duet</Button>, <Button key="pairs" size="small" variant={showPairs ? 'contained' : 'outlined'} onClick={() => setShowPairs(!showPairs)}>Shared pairs</Button>]}<IconButton size="small" onClick={() => setPlaying(!playing)} sx={{ color: '#a7c1cf' }} aria-label="Play or pause">{playing ? <PauseIcon /> : <PlayArrowIcon />}</IconButton><IconButton size="small" onClick={() => workerRef.current?.postMessage({ type: 'step' } satisfies ChemicalWorkerCommand)} sx={{ color: '#a7c1cf' }} aria-label="Step simulation"><SkipNextIcon fontSize="small" /></IconButton></Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mt: 1 }}><Typography variant="caption" sx={{ minWidth: 75, color: '#82a0b2' }}>Slow motion</Typography><Slider size="small" min={.15} max={1.5} step={.05} value={slowMotion} onChange={(_, value) => setSlowMotion(value as number)} sx={{ maxWidth: 150, color: '#59e5ba' }} aria-label="Slow motion" /><Typography variant="caption" sx={{ color: '#91aabc' }}>{slowMotion.toFixed(2)}×</Typography><Typography variant="caption" sx={{ minWidth: 60, color: '#82a0b2' }}>Temperature</Typography><Slider size="small" min={0} max={1200} step={10} value={temperature} onChange={(_, value) => setTemperature(value as number)} sx={{ maxWidth: 150, color: '#59e5ba' }} aria-label="Temperature in kelvin" /><Typography variant="caption" sx={{ color: '#91aabc' }}>{temperature} K</Typography><Typography variant="caption" sx={{ color: '#91aabc' }}>Orbit</Typography><Slider size="small" min={-180} max={180} value={rotation} onChange={(_, value) => setRotation(value as number)} sx={{ maxWidth: 130, color: '#59e5ba' }} aria-label="Rotate molecule" /></Stack>
        </Paper>
        {workerError && <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#ffadbd' }}>{workerError}</Typography>}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ mt: 1 }}><Paper elevation={0} sx={{ flex: 1, p: 1, background: '#0b1524', border: '1px solid #1c3851', color: 'inherit' }}><Typography variant="subtitle2" sx={{ color: '#64e7c1' }}>{formula} — {kind} model</Typography><Typography variant="caption" sx={{ display: 'block', color: '#a6bac6' }}>Bond length: <b>{Math.round(distancePm)} pm</b> · Bond energy: <b>{reference.energyKjMol} kJ/mol</b> · order <b>{order === 3 ? 'triple' : order === 2 ? 'double' : 'single'}</b></Typography><Typography variant="caption" sx={{ display: 'block', color: '#8da7b9' }}>Electrons: {shellLegend}</Typography>{showValence && <Typography variant="caption" sx={{ display: 'block', color: '#6ff5d4', mt: .4 }}>{valenceText}</Typography>}<Typography variant="caption" sx={{ display: 'block', color: '#9fb6c6', mt: .5 }}>{first.symbol === second.symbol ? 'Nonpolar bond' : `${first.symbol}–${second.symbol}: ΔEN ${polarity.toFixed(2)} · ${polarity > 0.4 ? `${first.electronegativity > second.electronegativity ? first.symbol : second.symbol} δ−` : 'symmetric sharing'}`}</Typography>{snapshot && <Typography variant="caption" sx={{ display: 'block', color: '#91aabc', mt: .5 }}>K {snapshot.energy.kinetic.toFixed(2)} · V {snapshot.energy.potential.toFixed(2)} · E {snapshot.energy.total.toFixed(2)} kJ/mol · {snapshot.energy.temperatureK.toFixed(0)} K</Typography>}</Paper><Paper elevation={0} sx={{ flex: 1, p: 1, background: '#0b1524', border: '1px solid #1c3851', color: 'inherit' }}><Typography variant="subtitle2" sx={{ color: '#64e7c1' }}>Energy / distance</Typography><PotentialCurve distancePm={distancePm} equilibriumPm={reference.lengthPm} energyKjMol={reference.energyKjMol} /><Typography variant="caption" sx={{ color: '#8da7b9' }}>Drag the molecule horizontally to pull a two-atom bond until its Morse well rises.</Typography></Paper></Stack>
        <Paper elevation={0} sx={{ mt: 1, p: 1, background: '#0b1524', border: '1px solid #1c3851', color: 'inherit' }}><Typography variant="subtitle2" sx={{ color: '#64e7c1' }}>Live energy chart</Typography><EnergyChart history={history} /><Typography variant="caption" sx={{ color: '#8da7b9' }}>Velocity Verlet · 0.5 fs timestep · {thermostat ? 'Berendsen thermostat enabled' : 'thermostat off: energy should remain nearly conserved'}</Typography></Paper>
      </Box>
    </Stack>
  </Box>
}

export default ChemicalBondingActivity
