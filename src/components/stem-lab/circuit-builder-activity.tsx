import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type PointerEvent, type FC, useMemo, useRef, useState } from 'react'

type ComponentId = 'battery' | 'bulb' | 'switch'
type TerminalName = 'positive' | 'negative' | 'left' | 'right'
type Terminal = `${ComponentId}:${TerminalName}`
type WireEndpoint = 'a' | 'b'
type Feedback = 'idle' | 'correct' | 'incorrect'
type ChallengeMode = 'closed' | 'toggle'

type Wire = { id: number; a: Terminal | null; b: Terminal | null }
type Position = { x: number; y: number }
type CircuitRound = { positions: Record<ComponentId, Position>; challengeMode: ChallengeMode }

export type CircuitBuilderProps = { onComplete?: () => void }

const componentNames: Record<ComponentId, string> = { battery: 'Battery', bulb: 'Light bulb', switch: 'Switch' }
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const terminal = (component: ComponentId, name: TerminalName) => `${component}:${name}` as Terminal
const initialWires = (): Wire[] => [1, 2, 3, 4].map((id) => ({ id, a: null, b: null }))

const createRound = (): CircuitRound => ({
  positions: {
    battery: { x: randomInt(8, 22), y: randomInt(12, 30) },
    bulb: { x: randomInt(56, 70), y: randomInt(12, 28) },
    switch: { x: randomInt(34, 50), y: randomInt(55, 68) },
  },
  challengeMode: Math.random() > 0.5 ? 'toggle' : 'closed',
})

const getComponentTerminal = (component: ComponentId, name: TerminalName) => terminal(component, name)
const parseTerminal = (value: Terminal): { component: ComponentId; name: TerminalName } => {
  const [component, name] = value.split(':') as [ComponentId, TerminalName]
  return { component, name }
}

const CircuitBuilderActivity: FC<CircuitBuilderProps> = ({ onComplete }) => {
  const workspaceRef = useRef<HTMLDivElement>(null)
  const [roundState, setRoundState] = useState<CircuitRound>(createRound)
  const [positions, setPositions] = useState(roundState.positions)
  const [wires, setWires] = useState<Wire[]>(initialWires)
  const [switchClosed, setSwitchClosed] = useState(false)
  const [hasToggledOpen, setHasToggledOpen] = useState(false)
  const [selectedEndpoint, setSelectedEndpoint] = useState<{ wireId: number; endpoint: WireEndpoint } | null>(null)
  const [draggingComponent, setDraggingComponent] = useState<ComponentId | null>(null)
  const [feedback, setFeedback] = useState<Feedback>('idle')

  const terminalPositions = useMemo(() => ({
    [terminal('battery', 'positive')]: { x: positions.battery.x + 13, y: positions.battery.y + 7 },
    [terminal('battery', 'negative')]: { x: positions.battery.x - 1, y: positions.battery.y + 7 },
    [terminal('bulb', 'left')]: { x: positions.bulb.x - 1, y: positions.bulb.y + 7 },
    [terminal('bulb', 'right')]: { x: positions.bulb.x + 13, y: positions.bulb.y + 7 },
    [terminal('switch', 'left')]: { x: positions.switch.x - 1, y: positions.switch.y + 7 },
    [terminal('switch', 'right')]: { x: positions.switch.x + 13, y: positions.switch.y + 7 },
  } as Record<Terminal, Position>), [positions])

  const connectedWireCount = wires.filter((wire) => wire.a && wire.b).length
  const requiredWiresConnected = wires.slice(0, 3).every((wire) => wire.a && wire.b)
  const graph = useMemo(() => {
    const adjacency = new Map<Terminal, Array<{ node: Terminal; component: ComponentId | 'wire' }>>()
    const addEdge = (from: Terminal, to: Terminal, component: ComponentId | 'wire') => {
      adjacency.set(from, [...(adjacency.get(from) ?? []), { node: to, component }])
      adjacency.set(to, [...(adjacency.get(to) ?? []), { node: from, component }])
    }
    wires.forEach((wire) => { if (wire.a && wire.b) addEdge(wire.a, wire.b, 'wire') })
    addEdge(terminal('bulb', 'left'), terminal('bulb', 'right'), 'bulb')
    if (switchClosed) addEdge(terminal('switch', 'left'), terminal('switch', 'right'), 'switch')
    const queue: Array<{ node: Terminal; seen: Set<ComponentId> }> = [{ node: terminal('battery', 'positive'), seen: new Set() }]
    const visited = new Set<string>()
    while (queue.length) {
      const current = queue.shift()!
      const key = `${current.node}|${[...current.seen].sort().join(',')}`
      if (visited.has(key)) continue
      visited.add(key)
      if (current.node === terminal('battery', 'negative') && current.seen.has('bulb') && current.seen.has('switch')) return true
      ;(adjacency.get(current.node) ?? []).forEach(({ node, component }) => {
        const seen = new Set(current.seen)
        if (component === 'bulb' || component === 'switch') seen.add(component)
        queue.push({ node, seen })
      })
    }
    return false
  }, [switchClosed, wires])

  const completeCircuit = requiredWiresConnected && graph
  const challengeCorrect = completeCircuit && (roundState.challengeMode === 'closed' || hasToggledOpen)
  const bulbLit = completeCircuit
  const challengeText = roundState.challengeMode === 'toggle' ? 'Build a circuit with a switch that lets you turn the bulb on and off.' : 'Build a complete closed circuit with the switch included.'

  const updateComponentPosition = (component: ComponentId, event: PointerEvent) => {
    const workspace = workspaceRef.current
    if (!workspace) return
    const bounds = workspace.getBoundingClientRect()
    setPositions((current) => ({ ...current, [component]: { x: clamp(((event.clientX - bounds.left) / bounds.width) * 100, 7, 82), y: clamp(((event.clientY - bounds.top) / bounds.height) * 100, 8, 68) } }))
  }
  const startDragging = (component: ComponentId, event: PointerEvent) => { event.currentTarget.setPointerCapture(event.pointerId); setDraggingComponent(component); setFeedback('idle') }
  const stopDragging = (event: PointerEvent) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); setDraggingComponent(null) }
  const selectEndpoint = (wireId: number, endpoint: WireEndpoint) => { setSelectedEndpoint({ wireId, endpoint }); setFeedback('idle') }
  const connectTerminal = (target: Terminal) => {
    if (!selectedEndpoint) return
    const occupied = wires.some((wire) => wire.id !== selectedEndpoint.wireId && (wire.a === target || wire.b === target))
    if (occupied) return
    setWires((current) => current.map((wire) => wire.id === selectedEndpoint.wireId ? { ...wire, [selectedEndpoint.endpoint]: target } : wire))
    setSelectedEndpoint(null)
    setFeedback('idle')
  }
  const disconnectEndpoint = (wireId: number, endpoint: WireEndpoint) => { setWires((current) => current.map((wire) => wire.id === wireId ? { ...wire, [endpoint]: null } : wire)); setSelectedEndpoint(null); setFeedback('idle') }
  const toggleSwitch = () => { setSwitchClosed((current) => { if (current) setHasToggledOpen(true); return !current }); setFeedback('idle') }
  const checkActivity = () => setFeedback(challengeCorrect ? 'correct' : 'incorrect')
  const reset = () => { const nextRound = createRound(); setRoundState(nextRound); setPositions(nextRound.positions); setWires(initialWires()); setSwitchClosed(false); setHasToggledOpen(false); setSelectedEndpoint(null); setDraggingComponent(null); setFeedback('idle') }

  const status = !requiredWiresConnected ? `Circuit incomplete — connect the wire endpoints to the component terminals (${connectedWireCount}/3 main wires connected).` : !switchClosed ? 'Switch is open — flip it to complete the circuit.' : bulbLit ? 'Closed loop detected — current can flow through the bulb.' : 'Circuit incomplete — check that the path reaches both battery terminals.'
  const hint = !requiredWiresConnected ? 'Connect each main wire to a component terminal. A complete loop needs no gaps.' : !switchClosed ? 'Tap the switch to close the path and test the current.' : 'Trace the path from the positive battery terminal through the bulb and back to the negative terminal.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Circuit Builder</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Build a working circuit.</Typography></Box><Typography variant="body2" color="text.secondary">Drag the battery, bulb, and switch around the workspace. Select a wire endpoint, then drag or tap a colored terminal to connect it. Double-click a wire endpoint to disconnect it.</Typography><Box ref={workspaceRef} onPointerMove={(event) => draggingComponent && updateComponentPosition(draggingComponent, event)} onPointerUp={stopDragging} sx={{ position: 'relative', minHeight: 390, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #eef7f7, #fff9ea)', touchAction: 'none' }}><Box component="svg" viewBox="0 0 100 100" preserveAspectRatio="none" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>{wires.map((wire, index) => { const a = wire.a ? terminalPositions[wire.a] : { x: 8 + (index % 2) * 7, y: 84 + Math.floor(index / 2) * 5 }; const b = wire.b ? terminalPositions[wire.b] : { x: 22 + (index % 2) * 7, y: 84 + Math.floor(index / 2) * 5 }; return <g key={wire.id}><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={wire.a && wire.b ? '#c65b42' : '#aebbbb'} strokeWidth="1.4" strokeDasharray={wire.a && wire.b ? undefined : '2 1'} /><circle cx={a.x} cy={a.y} r="2.2" fill={selectedEndpoint?.wireId === wire.id && selectedEndpoint.endpoint === 'a' ? '#f0ad32' : '#fff'} stroke="#c65b42" strokeWidth=".8" onPointerDown={() => selectEndpoint(wire.id, 'a')} onDoubleClick={() => disconnectEndpoint(wire.id, 'a')} /><circle cx={b.x} cy={b.y} r="2.2" fill={selectedEndpoint?.wireId === wire.id && selectedEndpoint.endpoint === 'b' ? '#f0ad32' : '#fff'} stroke="#c65b42" strokeWidth=".8" onPointerDown={() => selectEndpoint(wire.id, 'b')} onDoubleClick={() => disconnectEndpoint(wire.id, 'b')} /></g>})}</Box>{(['battery', 'bulb', 'switch'] as ComponentId[]).map((component) => { const position = positions[component]; const selected = selectedEndpoint !== null; return <Box key={component} onClick={() => component === 'switch' && toggleSwitch()} onPointerDown={(event) => startDragging(component, event)} onPointerMove={(event) => draggingComponent === component && updateComponentPosition(component, event)} onPointerUp={stopDragging} sx={{ position: 'absolute', left: `${position.x}%`, top: `${position.y}%`, width: 98, height: 68, transform: 'translate(-50%, -50%)', display: 'grid', placeItems: 'center', border: 2, borderColor: component === 'bulb' && bulbLit ? 'warning.main' : 'divider', borderRadius: 2, backgroundColor: 'background.paper', boxShadow: component === 'bulb' && bulbLit ? '0 0 24px rgba(241, 178, 55, .8)' : 2, cursor: draggingComponent === component ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none', zIndex: 2, '&:hover': { borderColor: 'primary.main' } }}><Typography sx={{ fontWeight: 800, color: component === 'bulb' && bulbLit ? 'warning.dark' : 'text.primary' }}>{component === 'battery' ? '▣ Battery' : component === 'bulb' ? (bulbLit ? '● Bulb ON' : '○ Bulb OFF') : switchClosed ? '━ Switch ON' : '╱ Switch OFF'}</Typography><Typography variant="caption" color="text.secondary">{component === 'battery' ? '+  − terminals' : component === 'bulb' ? 'two terminals' : 'tap to toggle'}</Typography>{(['battery', 'bulb', 'switch'] as ComponentId[]).includes(component) && <><Box component="button" type="button" onPointerDown={(event) => event.stopPropagation()} onPointerUp={(event) => { event.stopPropagation(); connectTerminal(getComponentTerminal(component, component === 'battery' ? 'positive' : 'left')) }} onClick={(event) => { event.stopPropagation(); connectTerminal(getComponentTerminal(component, component === 'battery' ? 'positive' : 'left')) }} aria-label={`${componentNames[component]} left terminal`} sx={{ position: 'absolute', left: -9, top: 24, width: 18, height: 18, borderRadius: '50%', border: 2, borderColor: selected ? 'warning.main' : 'primary.main', backgroundColor: 'background.paper', cursor: 'crosshair' }} /> <Box component="button" type="button" onPointerDown={(event) => event.stopPropagation()} onPointerUp={(event) => { event.stopPropagation(); connectTerminal(getComponentTerminal(component, component === 'battery' ? 'negative' : 'right')) }} onClick={(event) => { event.stopPropagation(); connectTerminal(getComponentTerminal(component, component === 'battery' ? 'negative' : 'right')) }} aria-label={`${componentNames[component]} right terminal`} sx={{ position: 'absolute', right: -9, top: 24, width: 18, height: 18, borderRadius: '50%', border: 2, borderColor: selected ? 'warning.main' : 'primary.main', backgroundColor: 'background.paper', cursor: 'crosshair' }} /></>}</Box>})}<Typography variant="caption" sx={{ position: 'absolute', left: 12, bottom: 10, color: 'text.secondary' }}>Wire endpoints: click a circle, then tap the terminal where it should connect.</Typography></Box><Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: bulbLit ? 'success.main' : 'divider', backgroundColor: bulbLit ? 'success.light' : 'action.hover' }}><Typography sx={{ fontWeight: 700 }}>{status}</Typography>{bulbLit && <Typography color="success.dark" variant="body2">The bulb is glowing because the circuit has a complete path.</Typography>}</Paper><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="body2" sx={{ fontWeight: 700, mb: .75 }}>Challenge: {challengeText}</Typography><Typography variant="caption" color="text.secondary">The round requirement changes after Reset.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: .75, fontWeight: 800 }}>Right! A closed loop with no gaps lets current flow and lights the bulb.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: .75 }}>{hint}</Typography>}</Paper><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!feedback || feedback !== 'correct'} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack></Stack></Paper>
}

export default CircuitBuilderActivity
