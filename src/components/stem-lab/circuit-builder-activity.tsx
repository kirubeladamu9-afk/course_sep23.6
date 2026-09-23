import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull'
import CableIcon from '@mui/icons-material/Cable'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt'
import LightbulbIcon from '@mui/icons-material/Lightbulb'
import ReplayIcon from '@mui/icons-material/Replay'
import SettingsIcon from '@mui/icons-material/Settings'
import SpeedIcon from '@mui/icons-material/Speed'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import { type DragEvent, type FC, type PointerEvent, type ReactNode, useMemo, useRef, useState } from 'react'

type ComponentType = 'battery' | 'bulb' | 'resistor' | 'switch'
type MeterType = 'voltmeter' | 'ammeter'
type PaletteType = ComponentType | MeterType | 'wire'
type Terminal = string
type Feedback = 'idle' | 'correct' | 'incorrect'
type CurrentMode = 'electrons' | 'conventional'

type Position = { x: number; y: number }
type CircuitComponent = { id: string; type: ComponentType; x: number; y: number; value: number; closed: boolean }
type Wire = { id: number; from: Terminal; to: Terminal; midpoint?: Position }
type Meter = { id: string; type: MeterType; x: number; y: number; targetId: string | null }
type Challenge = { requiredResistors: number; targetResistance: number }
type GraphEdge = { node: Terminal; wireId?: number; componentId?: string }
type CircuitAnalysis = { complete: boolean; traversedIds: Set<string>; activeWireIds: Set<number>; wireDirections: Map<number, { from: Terminal; to: Terminal }> }

type CircuitBuilderProps = { onComplete?: () => void }

const paletteLabels: Record<PaletteType, string> = {
  wire: 'Wire',
  battery: 'Battery',
  bulb: 'Light Bulb',
  resistor: 'Resistor',
  switch: 'Switch',
  voltmeter: 'Voltmeter',
  ammeter: 'Ammeter',
}
const batteryVoltages = [6, 9, 12]
const resistorValues = [50, 100, 150, 200]
const bulbResistance = 30
const workspaceHeight = 460
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))
const terminal = (componentId: string, name: 'positive' | 'negative' | 'left' | 'right') => `${componentId}:${name}`
const terminalName = (component: CircuitComponent, side: 'left' | 'right') => component.type === 'battery' ? (side === 'left' ? 'negative' : 'positive') : side
const defaultValue = (type: ComponentType) => type === 'battery' ? 9 : type === 'resistor' ? 100 : type === 'bulb' ? bulbResistance : 0
const createChallenge = (): Challenge => {
  const requiredResistors = randomInt(1, 2)
  const targets = requiredResistors === 1 ? [50, 100, 150, 200] : [100, 150, 200, 250, 300, 350, 400]
  return { requiredResistors, targetResistance: targets[randomInt(0, targets.length - 1)] }
}
const createComponent = (type: ComponentType, id: string, x: number, y: number): CircuitComponent => ({ id, type, x, y, value: defaultValue(type), closed: false })
const componentTerminals = (component: CircuitComponent): Terminal[] => [terminal(component.id, terminalName(component, 'left')), terminal(component.id, terminalName(component, 'right'))]
const parseTerminal = (value: Terminal) => value.slice(value.indexOf(':') + 1)

const CircuitBuilderActivity: FC<CircuitBuilderProps> = ({ onComplete }) => {
  const workspaceRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)
  const wireIdRef = useRef(1)
  const [challenge, setChallenge] = useState<Challenge>(createChallenge)
  const [components, setComponents] = useState<CircuitComponent[]>([])
  const [wires, setWires] = useState<Wire[]>([])
  const [meters, setMeters] = useState<Meter[]>([])
  const [wireStart, setWireStart] = useState<Terminal | null>(null)
  const [wirePointer, setWirePointer] = useState<Position | null>(null)
  const [wireMode, setWireMode] = useState(false)
  const [draggingComponent, setDraggingComponent] = useState<string | null>(null)
  const [draggingMeter, setDraggingMeter] = useState<string | null>(null)
  const [draggingMidpoint, setDraggingMidpoint] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [hasOpenedSwitch, setHasOpenedSwitch] = useState(false)
  const [showCurrent, setShowCurrent] = useState(true)
  const [currentMode, setCurrentMode] = useState<CurrentMode>('electrons')
  const [showLabels, setShowLabels] = useState(true)
  const [showValues, setShowValues] = useState(true)

  const nextId = (prefix: string) => `${prefix}-${idRef.current++}`
  const workspacePosition = (event: PointerEvent | DragEvent): Position | null => {
    const workspace = workspaceRef.current
    if (!workspace) return null
    const bounds = workspace.getBoundingClientRect()
    return {
      x: clamp(((event.clientX - bounds.left) / bounds.width) * 100, 5, 95),
      y: clamp(((event.clientY - bounds.top) / bounds.height) * 100, 8, 88),
    }
  }

  const addComponent = (type: ComponentType, position: Position) => {
    setComponents((current) => [...current, createComponent(type, nextId(type), position.x, position.y)])
    setFeedback('idle')
  }
  const nearestComponent = (position: Position, list = components) => list.reduce<CircuitComponent | null>((nearest, component) => {
    if (!nearest) return component
    const distance = (item: CircuitComponent) => Math.hypot(item.x - position.x, item.y - position.y)
    return distance(component) < distance(nearest) ? component : nearest
  }, null)
  const addMeter = (type: MeterType, position: Position) => {
    const target = nearestComponent(position)
    setMeters((current) => [...current, { id: nextId(type), type, x: position.x, y: position.y, targetId: target?.id ?? null }])
    setFeedback('idle')
  }

  const paletteItems: Array<{ type: PaletteType; icon: ReactNode }> = [
    { type: 'wire', icon: <CableIcon /> },
    { type: 'battery', icon: <BatteryChargingFullIcon /> },
    { type: 'bulb', icon: <LightbulbIcon /> },
    { type: 'resistor', icon: <ElectricBoltIcon /> },
    { type: 'switch', icon: <ToggleOnIcon /> },
  ]
  const meterItems: Array<{ type: MeterType; icon: ReactNode }> = [
    { type: 'voltmeter', icon: <SpeedIcon /> },
    { type: 'ammeter', icon: <ElectricBoltIcon /> },
  ]
  const addPaletteItem = (type: PaletteType) => {
    if (type === 'wire') {
      setWireMode(true)
      setWireStart(null)
      setFeedback('idle')
      return
    }
    const position = { x: type === 'battery' ? 16 : type === 'bulb' ? 76 : 50, y: type === 'voltmeter' || type === 'ammeter' ? 82 : 30 }
    if (type === 'voltmeter' || type === 'ammeter') addMeter(type, position)
    else addComponent(type, position)
  }
  const handlePaletteDragStart = (type: PaletteType, event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData('application/x-circuit-item', type)
    event.dataTransfer.effectAllowed = 'copy'
  }
  const handleWorkspaceDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const type = event.dataTransfer.getData('application/x-circuit-item') as PaletteType
    const position = workspacePosition(event)
    if (!position || !type) return
    if (type === 'wire') setWireMode(true)
    else if (type === 'voltmeter' || type === 'ammeter') addMeter(type, position)
    else addComponent(type, position)
  }

  const terminalPositions = useMemo(() => components.reduce<Record<Terminal, Position>>((positions, component) => {
    const offset = component.type === 'battery' ? 7 : 6
    positions[componentTerminals(component)[0]] = { x: component.x - offset, y: component.y }
    positions[componentTerminals(component)[1]] = { x: component.x + offset, y: component.y }
    return positions
  }, {}), [components])

  const circuit = useMemo<CircuitAnalysis>(() => {
    const battery = components.find((component) => component.type === 'battery')
    if (!battery) return { complete: false, traversedIds: new Set(), activeWireIds: new Set(), wireDirections: new Map() }
    const adjacency = new Map<Terminal, GraphEdge[]>()
    const addEdge = (from: Terminal, to: Terminal, edge: Omit<GraphEdge, 'node'>) => {
      adjacency.set(from, [...(adjacency.get(from) ?? []), { node: to, ...edge }])
      adjacency.set(to, [...(adjacency.get(to) ?? []), { node: from, ...edge }])
    }
    wires.forEach((wire) => addEdge(wire.from, wire.to, { wireId: wire.id }))
    components.forEach((component) => {
      if (component.type === 'battery' || (component.type === 'switch' && !component.closed)) return
      const [left, right] = componentTerminals(component)
      addEdge(left, right, { componentId: component.id })
    })
    const queue: Array<{ node: Terminal; traversedIds: Set<string>; activeWireIds: Set<number>; wireDirections: Map<number, { from: Terminal; to: Terminal }> }> = [{ node: terminal(battery.id, 'positive'), traversedIds: new Set(), activeWireIds: new Set(), wireDirections: new Map() }]
    const visited = new Set<string>()
    while (queue.length) {
      const current = queue.shift()!
      const key = `${current.node}|${[...current.traversedIds].sort().join(',')}`
      if (visited.has(key)) continue
      visited.add(key)
      if (current.node === terminal(battery.id, 'negative')) {
        const traversedTypes = new Set([...current.traversedIds].map((id) => components.find((component) => component.id === id)?.type))
        if (traversedTypes.has('bulb')) return { complete: true, traversedIds: current.traversedIds, activeWireIds: current.activeWireIds, wireDirections: current.wireDirections }
      }
      ;(adjacency.get(current.node) ?? []).forEach((edge) => {
        const traversedIds = new Set(current.traversedIds)
        const activeWireIds = new Set(current.activeWireIds)
        const wireDirections = new Map(current.wireDirections)
        if (edge.componentId) traversedIds.add(edge.componentId)
        if (edge.wireId !== undefined) {
          activeWireIds.add(edge.wireId)
          wireDirections.set(edge.wireId, { from: current.node, to: edge.node })
        }
        queue.push({ node: edge.node, traversedIds, activeWireIds, wireDirections })
      })
    }
    return { complete: false, traversedIds: new Set(), activeWireIds: new Set(), wireDirections: new Map() }
  }, [components, wires])

  const battery = components.find((component) => component.type === 'battery')
  const resistors = components.filter((component) => component.type === 'resistor')
  const connectedResistors = resistors.filter((resistor) => circuit.traversedIds.has(resistor.id))
  const resistorTotal = connectedResistors.reduce((total, resistor) => total + resistor.value, 0)
  const totalResistance = resistorTotal + (circuit.complete && components.some((component) => component.type === 'bulb') ? bulbResistance : 0)
  const current = circuit.complete && totalResistance > 0 ? (battery?.value ?? 0) / totalResistance : 0
  const requiredResistorsConnected = connectedResistors.length === challenge.requiredResistors
  const targetResistanceMet = resistorTotal === challenge.targetResistance
  const switchInPath = [...circuit.traversedIds].some((id) => components.find((component) => component.id === id)?.type === 'switch')
  const challengeCorrect = circuit.complete && switchInPath && requiredResistorsConnected && targetResistanceMet && hasOpenedSwitch && current > 0
  const bulbLit = circuit.complete && current > 0
  const completeActivity = feedback === 'correct' && challengeCorrect

  const removeComponent = (id: string) => {
    setComponents((currentComponents) => currentComponents.filter((component) => component.id !== id))
    setWires((currentWires) => currentWires.filter((wire) => !wire.from.startsWith(`${id}:`) && !wire.to.startsWith(`${id}:`)))
    setMeters((currentMeters) => currentMeters.map((meter) => meter.targetId === id ? { ...meter, targetId: null } : meter))
    setFeedback('idle')
  }
  const updateComponentPosition = (id: string, event: PointerEvent) => {
    const position = workspacePosition(event)
    if (!position) return
    setComponents((current) => current.map((component) => component.id === id ? { ...component, ...position } : component))
    setFeedback('idle')
  }
  const startComponentDrag = (id: string, event: PointerEvent<HTMLDivElement>) => {
    setDraggingComponent(id)
    setFeedback('idle')
  }
  const startMeterDrag = (id: string, event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingMeter(id)
    setFeedback('idle')
  }
  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setDraggingComponent(null)
    setDraggingMeter(null)
    setDraggingMidpoint(null)
  }
  const updateMeterPosition = (id: string, event: PointerEvent) => {
    const position = workspacePosition(event)
    if (!position) return
    const target = nearestComponent(position)
    setMeters((current) => current.map((meter) => meter.id === id ? { ...meter, ...position, targetId: target?.id ?? null } : meter))
  }
  const updatePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (draggingComponent) updateComponentPosition(draggingComponent, event)
    if (draggingMeter) updateMeterPosition(draggingMeter, event)
    if (draggingMidpoint !== null) {
      const position = workspacePosition(event)
      if (position) setWires((current) => current.map((wire) => wire.id === draggingMidpoint ? { ...wire, midpoint: position } : wire))
    }
    if (wireStart) setWirePointer(workspacePosition(event))
  }
  const defaultWireMidpoint = (from: Position, to: Position): Position => ({
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2 + clamp(Math.abs(to.x - from.x) * .16, 4, 12),
  })
  const wirePath = (from: Position, to: Position, midpoint?: Position) => {
    const bend = midpoint ?? defaultWireMidpoint(from, to)
    return { bend, forward: `M ${from.x} ${from.y} Q ${bend.x} ${bend.y} ${to.x} ${to.y}`, reverse: `M ${to.x} ${to.y} Q ${bend.x} ${bend.y} ${from.x} ${from.y}` }
  }
  const startMidpointDrag = (id: number, event: PointerEvent<SVGCircleElement>) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDraggingMidpoint(id)
    setFeedback('idle')
  }
  const connectTerminals = (target: Terminal) => {
    if (!wireStart || wireStart === target) return
    const occupied = wires.some((wire) => wire.from === target || wire.to === target || wire.from === wireStart || wire.to === wireStart)
    if (!occupied) setWires((current) => [...current, { id: wireIdRef.current++, from: wireStart, to: target }])
    setWireStart(null)
    setWirePointer(null)
    setWireMode(false)
    setFeedback('idle')
  }
  const selectTerminal = (target: Terminal, event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    if (!wireStart) {
      setWireStart(target)
      setWireMode(true)
      return
    }
    connectTerminals(target)
  }
  const removeWire = (id: number) => {
    setWires((current) => current.filter((wire) => wire.id !== id))
    setFeedback('idle')
  }
  const toggleSwitch = (id: string, event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    setHasOpenedSwitch(true)
    setComponents((current) => current.map((component) => component.id === id ? { ...component, closed: !component.closed } : component))
    setFeedback('idle')
  }
  const cycleValue = (id: string, type: ComponentType, event: PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const values = type === 'battery' ? batteryVoltages : resistorValues
    setComponents((current) => current.map((component) => {
      if (component.id !== id) return component
      const nextValue = values[(values.indexOf(component.value) + 1) % values.length]
      return { ...component, value: nextValue }
    }))
    setFeedback('idle')
  }
  const checkActivity = () => setFeedback(challengeCorrect ? 'correct' : 'incorrect')
  const reset = () => {
    setChallenge(createChallenge())
    setComponents([])
    setWires([])
    setMeters([])
    setWireStart(null)
    setWirePointer(null)
    setWireMode(false)
    setHasOpenedSwitch(false)
    setDraggingMidpoint(null)
    setFeedback('idle')
  }

  const meterReading = (meter: Meter) => {
    const target = components.find((component) => component.id === meter.targetId)
    if (meter.type === 'ammeter') return `${current.toFixed(3)} A`
    if (!target) return '— V'
    if (target.type === 'battery') return `${target.value.toFixed(1)} V`
    if (target.type === 'resistor') return `${(current * target.value).toFixed(2)} V`
    if (target.type === 'bulb') return `${(current * bulbResistance).toFixed(2)} V`
    return `${(target.closed ? 0 : current * 0).toFixed(2)} V`
  }
  const status = !battery ? 'Place a battery to set the circuit voltage.' : !components.some((component) => component.type === 'bulb') ? 'Place a light bulb, then connect its terminals into the circuit.' : !circuit.complete ? 'Circuit incomplete — connect a closed path from the positive terminal through the load to the negative terminal.' : !switchInPath ? 'Circuit is closed, but the switch is not part of the conductive path.' : 'Closed loop detected — current can flow through the bulb.'
  const hint = !battery ? 'Start with a source, then add the components named in the challenge.' : !circuit.complete ? 'Check for an open terminal, an open switch, or a wire that stops short of the battery.' : !targetResistanceMet ? `The resistor total must match the challenge target of ${challenge.targetResistance} Ω.` : !hasOpenedSwitch ? 'Open the switch once, then close it again to test the current change.' : 'Trace the connected path and compare the live readings with the challenge.'
  const challengeText = `Challenge: Build a circuit with ${challenge.requiredResistors} resistor${challenge.requiredResistors === 1 ? '' : 's'} totaling ${challenge.targetResistance} Ω, then flip the switch to change current from 0 A to a nonzero value.`

  const renderComponentIcon = (component: CircuitComponent) => {
    if (component.type === 'battery') return <BatteryChargingFullIcon sx={{ color: 'success.main' }} />
    if (component.type === 'bulb') return <LightbulbIcon sx={{ fontSize: 36, color: bulbLit ? '#ffd43b' : 'text.secondary', filter: bulbLit ? 'drop-shadow(0 0 14px rgba(255,196,37,1))' : 'none' }} />
    if (component.type === 'resistor') return <ElectricBoltIcon sx={{ color: 'warning.main' }} />
    return component.closed ? <ToggleOnIcon sx={{ color: 'success.main' }} /> : <ToggleOffIcon sx={{ color: 'text.secondary' }} />
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Circuit Builder</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Build a working circuit.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Core" variant="outlined" size="small" /></Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '180px minmax(0, 1fr) 205px' }, gap: 1.5, alignItems: 'stretch' }}>
        <Paper elevation={0} sx={{ p: 1.25, border: 1, borderColor: 'divider', backgroundColor: 'background.default' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1 }}>Component palette</Typography>
          <Stack spacing={.75}>
            {paletteItems.map((item) => <Box key={item.type} component="button" type="button" draggable onDragStart={(event) => handlePaletteDragStart(item.type, event)} onClick={() => addPaletteItem(item.type)} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', p: 1, border: 1, borderColor: wireMode && item.type === 'wire' ? 'primary.main' : 'divider', borderRadius: 1.5, backgroundColor: 'background.paper', color: 'text.primary', cursor: 'grab', textAlign: 'left', font: 'inherit', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}><Box sx={{ display: 'grid', placeItems: 'center', color: 'primary.main' }}>{item.icon}</Box><Typography variant="body2" sx={{ fontWeight: 700 }}>{paletteLabels[item.type]}</Typography></Box>)}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Drag items onto the workspace. Click Wire, then connect terminals; drag a wire midpoint to reroute it.</Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 900, mt: 2, mb: 1 }}>Meters</Typography>
          <Stack spacing={.75}>
            {meterItems.map((item) => <Box key={item.type} component="button" type="button" draggable onDragStart={(event) => handlePaletteDragStart(item.type, event)} onClick={() => addPaletteItem(item.type)} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', p: 1, border: 1, borderColor: 'divider', borderRadius: 1.5, backgroundColor: 'background.paper', color: 'text.primary', cursor: 'grab', textAlign: 'left', font: 'inherit', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}><Box sx={{ display: 'grid', placeItems: 'center', color: 'primary.main' }}>{item.icon}</Box><Typography variant="body2" sx={{ fontWeight: 700 }}>{paletteLabels[item.type]}</Typography></Box>)}
          </Stack>
        </Paper>
        <Box ref={workspaceRef} onDragOver={(event) => event.preventDefault()} onDrop={handleWorkspaceDrop} onPointerMove={updatePointer} onPointerUp={stopDragging} onPointerLeave={() => !wireStart && setWirePointer(null)} sx={{ position: 'relative', minHeight: workspaceHeight, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #eef7f7, #fff9ea)', touchAction: 'none' }}>
          <Typography variant="caption" sx={{ position: 'absolute', left: 12, top: 10, color: 'text.secondary', fontWeight: 800, zIndex: 1 }}>CIRCUIT WORKSPACE</Typography>
          <Box component="svg" viewBox="0 0 100 100" preserveAspectRatio="none" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
            {wires.map((wire) => {
              const from = terminalPositions[wire.from]
              const to = terminalPositions[wire.to]
              if (!from || !to) return null
              const active = circuit.activeWireIds.has(wire.id)
              const direction = circuit.wireDirections.get(wire.id)
              const animationFrom = direction ? terminalPositions[currentMode === 'electrons' ? direction.to : direction.from] : from
              const animationTo = direction ? terminalPositions[currentMode === 'electrons' ? direction.from : direction.to] : to
              const route = wirePath(from, to, wire.midpoint)
              const animationRoute = animationFrom && animationTo ? wirePath(animationFrom, animationTo, route.bend) : null
              return <g key={wire.id} onDoubleClick={() => removeWire(wire.id)} style={{ cursor: 'pointer' }}>
                <path d={route.forward} fill="none" stroke={active ? '#168c78' : '#91a5a7'} strokeWidth="1.2" strokeLinecap="round" />
                <path d={route.forward} fill="none" stroke="transparent" strokeWidth="4" pointerEvents="stroke" />
                {showCurrent && active && animationRoute && <>{[0, 1].map((marker) => <circle key={marker} r=".8" fill={currentMode === 'electrons' ? '#2f65c8' : '#d87324'}><animateMotion dur={feedback === 'correct' ? '.55s' : '1.15s'} begin={`${marker * .35}s`} repeatCount="indefinite" path={animationRoute.forward} /></circle>)}</>}
                <circle cx={route.bend.x} cy={route.bend.y} r="1.8" fill="#ffffff" stroke={active ? '#168c78' : '#91a5a7'} strokeWidth=".7" role="button" tabIndex={0} aria-label="Drag to reroute wire" onPointerDown={(event) => startMidpointDrag(wire.id, event)} onPointerUp={() => setDraggingMidpoint(null)} />
              </g>
            })}
            {wireStart && wirePointer && terminalPositions[wireStart] && <path d={wirePath(terminalPositions[wireStart], wirePointer).forward} fill="none" stroke="#e3a52f" strokeWidth="1" strokeDasharray="2 1.5" />}
          </Box>
          {components.map((component) => {
            const terminals = componentTerminals(component)
            const isDragging = draggingComponent === component.id
            return <Box key={component.id} onPointerDown={(event) => startComponentDrag(component.id, event)} onPointerMove={(event) => isDragging && updateComponentPosition(component.id, event)} onPointerUp={stopDragging} sx={{ position: 'absolute', left: `${component.x}%`, top: `${component.y}%`, width: 112, height: 76, transform: 'translate(-50%, -50%)', zIndex: 3, cursor: isDragging ? 'grabbing' : 'grab', transition: isDragging ? 'none' : 'left .15s ease, top .15s ease' }}>
              <Box component="button" type="button" aria-pressed={component.type === 'switch' ? component.closed : undefined} onClick={(event) => component.type === 'switch' ? toggleSwitch(component.id, event as unknown as PointerEvent<HTMLButtonElement>) : (component.type === 'battery' || component.type === 'resistor') ? cycleValue(component.id, component.type, event as unknown as PointerEvent<HTMLButtonElement>) : event.stopPropagation()} sx={{ width: '100%', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: .75, border: 1, borderColor: component.type === 'bulb' && bulbLit ? '#f7b733' : 'divider', borderRadius: 2, background: component.type === 'bulb' && bulbLit ? 'radial-gradient(circle, rgba(255,226,102,.98) 0%, rgba(255,244,184,.9) 42%, #fff 78%)' : undefined, backgroundColor: 'background.paper', color: 'text.primary', font: 'inherit', boxShadow: component.type === 'bulb' && bulbLit ? '0 0 34px 10px rgba(247,183,51,.88)' : 2, animation: component.type === 'bulb' && bulbLit && feedback === 'correct' ? 'bulbGlow .6s ease-in-out infinite alternate' : 'none', '@keyframes bulbGlow': { from: { boxShadow: '0 0 24px 6px rgba(247,183,51,.6)' }, to: { boxShadow: '0 0 42px 14px rgba(247,183,51,1)' } } }}>{renderComponentIcon(component)}{showLabels && <Typography variant="caption" sx={{ fontWeight: 800 }}>{paletteLabels[component.type]}</Typography>}{component.type === 'switch' && <Typography variant="caption" color={component.closed ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 900 }}>{component.closed ? 'ON' : 'OFF'}</Typography>}{showValues && component.type !== 'switch' && <Typography variant="caption" color="text.secondary">{component.value}{component.type === 'battery' ? ' V' : ' Ω'}</Typography>}</Box>
              <Box component="button" type="button" aria-label={`Remove ${paletteLabels[component.type]}`} onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); removeComponent(component.id) }} sx={{ position: 'absolute', right: -5, top: -7, width: 22, height: 22, p: 0, display: 'grid', placeItems: 'center', border: 1, borderColor: 'divider', borderRadius: '50%', backgroundColor: 'background.paper', color: 'text.secondary', cursor: 'pointer' }}><DeleteOutlineIcon sx={{ fontSize: 14 }} /></Box>
              {terminals.map((item) => <Box key={item} component="button" type="button" aria-label={`Connect ${item}`} onPointerDown={(event) => selectTerminal(item, event)} sx={{ position: 'absolute', left: item === terminals[0] ? -7 : undefined, right: item === terminals[1] ? -7 : undefined, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, p: 0, border: 2, borderColor: wireStart === item ? 'warning.main' : 'primary.main', borderRadius: '50%', backgroundColor: 'background.paper', cursor: 'crosshair' }} />)}
            </Box>
          })}
          {meters.map((meter) => <Box key={meter.id} onPointerDown={(event) => startMeterDrag(meter.id, event)} onPointerMove={(event) => draggingMeter === meter.id && updateMeterPosition(meter.id, event)} onPointerUp={stopDragging} sx={{ position: 'absolute', left: `${meter.x}%`, top: `${meter.y}%`, transform: 'translate(-50%, -50%)', zIndex: 4, cursor: draggingMeter === meter.id ? 'grabbing' : 'grab' }}><Paper elevation={2} sx={{ minWidth: 82, p: .75, textAlign: 'center', border: 1, borderColor: meter.type === 'voltmeter' ? 'primary.main' : 'warning.main', backgroundColor: 'background.paper' }}><Typography variant="caption" sx={{ display: 'block', fontWeight: 900 }}>{meter.type === 'voltmeter' ? 'V' : 'A'} {showLabels && paletteLabels[meter.type]}</Typography>{showValues && <Typography variant="body2" sx={{ fontWeight: 900 }}>{meterReading(meter)}</Typography>}</Paper></Box>)}
          {!components.length && <Typography color="text.secondary" sx={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '80%' }}>Drag a battery, bulb, resistor, and switch here to begin.</Typography>}
        </Box>
        <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'background.default' }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}><SettingsIcon fontSize="small" color="primary" /><Typography variant="subtitle2" sx={{ fontWeight: 900 }}>Settings</Typography></Stack>
          <FormControlLabel control={<Switch size="small" checked={showCurrent} onChange={(event) => setShowCurrent(event.target.checked)} />} label={<Typography variant="body2">Show Current</Typography>} />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .75 }}>Current visualization</Typography>
          <RadioGroup value={currentMode} onChange={(event) => setCurrentMode(event.target.value as CurrentMode)}>
            <FormControlLabel value="electrons" control={<Radio size="small" />} label={<Typography variant="body2">Electrons</Typography>} />
            <FormControlLabel value="conventional" control={<Radio size="small" />} label={<Typography variant="body2">Conventional</Typography>} />
          </RadioGroup>
          <FormControlLabel control={<Switch size="small" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} />} label={<Typography variant="body2">Labels</Typography>} />
          <FormControlLabel control={<Switch size="small" checked={showValues} onChange={(event) => setShowValues(event.target.checked)} />} label={<Typography variant="body2">Values</Typography>} />
          <Box sx={{ mt: 1.5, p: 1, borderRadius: 1.5, backgroundColor: 'action.hover' }}><Typography variant="caption" color="text.secondary">Battery</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{battery ? `${battery.value} V` : '—'}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .75 }}>Total resistance</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{totalResistance} Ω</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: .75 }}>Circuit current</Typography><Typography variant="body2" sx={{ fontWeight: 800 }}>{current.toFixed(3)} A</Typography></Box>
        </Paper>
      </Box>
      <Typography variant="body2" color="text.secondary">Drag components from the palette, then connect terminal points to build an actual circuit graph. Switches, resistance, voltage, current, and measurements update from the connected circuit.</Typography>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: bulbLit ? 'success.light' : 'action.hover', color: bulbLit ? 'success.contrastText' : 'text.secondary' }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{status}</Typography><Typography variant="caption" sx={{ display: 'block', mt: .5 }}>I = {battery?.value ?? 0} V ÷ {totalResistance} Ω = {current.toFixed(3)} A</Typography></Paper>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider' }}><Typography sx={{ fontWeight: 800 }}>{challengeText}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Build and test the graph, then press Check Activity.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! A complete loop with no breaks lets current flow.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Not quite yet. {hint}</Typography>}</Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completeActivity} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default CircuitBuilderActivity
