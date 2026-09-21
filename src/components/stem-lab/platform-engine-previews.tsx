import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { type FC, type PointerEvent, type ReactNode, useState } from 'react'
import DragDropEngine from './drag-drop-engine'
import MatchingEngine from './matching-engine'
import { type PlatformEngineId } from './platform-engine-library'
import { type MathTopic } from '@/components/admin/stem-curriculum'

export type EnginePreviewProps = { onComplete?: () => void }

type FrameProps = { name: string; description: string; children: ReactNode }
const EngineFrame: FC<FrameProps> = ({ name, description, children }) => <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">{name}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{description}</Typography></Box>{children}</Stack></Paper>

const CompleteButton: FC<{ disabled?: boolean; onComplete?: () => void; label?: string }> = ({ disabled, onComplete, label = 'Complete activity' }) => <Button variant="contained" disabled={disabled} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{label}</Button>

export const NumberLineEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [value, setValue] = useState(7)
  const target = 7
  const x = 24 + (value / 10) * 352
  return <EngineFrame name="Interactive Number Line" description="Drag the marker to the target value and see the number move along the line."><Box component="svg" viewBox="0 0 400 110" sx={{ width: '100%', height: 150, overflow: 'visible' }} role="img" aria-label={`Number line marker at ${value}`}><line x1="24" x2="376" y1="55" y2="55" stroke="currentColor" strokeWidth="3" />{Array.from({ length: 11 }, (_, index) => { const tickX = 24 + (index / 10) * 352; return <g key={index}><line x1={tickX} x2={tickX} y1="45" y2="65" stroke="currentColor" strokeWidth="2" /><text x={tickX} y="86" textAnchor="middle" fontSize="12">{index}</text></g> })}<circle cx={x} cy="55" r="13" fill="var(--mui-palette-primary-main)" /></Box><Slider min={0} max={10} step={1} value={value} onChange={(_, next) => setValue(Array.isArray(next) ? next[0] : next)} valueLabelDisplay="auto" aria-label="Number line value" /><Typography variant="body2" color={value === target ? 'success.main' : 'text.secondary'}>{value === target ? 'Target reached.' : `Place the marker on ${target}.`}</Typography><CompleteButton disabled={value !== target} onComplete={onComplete} /></EngineFrame>
}

export const GraphEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [slope, setSlope] = useState(2)
  const [intercept, setIntercept] = useState(1)
  const points = Array.from({ length: 9 }, (_, index) => { const x = index - 4; const y = slope * x + intercept; return `${40 + index * 40},${100 - y * 8}` }).join(' ')
  return <EngineFrame name="Graph Builder" description="Change slope and intercept, then inspect how the line changes in real time."><Box component="svg" viewBox="0 0 400 170" sx={{ width: '100%', height: 190, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label="Interactive linear graph"><line x1="20" x2="380" y1="100" y2="100" stroke="currentColor" opacity=".35" /><line x1="200" x2="200" y1="15" y2="155" stroke="currentColor" opacity=".35" /><polyline points={points} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Box sx={{ flex: 1 }}><Typography variant="body2">Slope: {slope}</Typography><Slider min={-3} max={3} step={1} value={slope} onChange={(_, next) => setSlope(Array.isArray(next) ? next[0] : next)} aria-label="Slope" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2">Intercept: {intercept}</Typography><Slider min={-4} max={4} step={1} value={intercept} onChange={(_, next) => setIntercept(Array.isArray(next) ? next[0] : next)} aria-label="Intercept" /></Box></Stack><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>y = {slope}x {intercept >= 0 ? '+' : '−'} {Math.abs(intercept)}</Typography><CompleteButton onComplete={onComplete} /></EngineFrame>
}

export const GeometryEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [width, setWidth] = useState(6)
  const [height, setHeight] = useState(4)
  return <EngineFrame name="Geometry Manipulator" description="Change the rectangle dimensions and read the live perimeter and area calculations."><Box component="svg" viewBox="0 0 400 180" sx={{ width: '100%', height: 190, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label="Interactive rectangle"><rect x="100" y="30" width={width * 28} height={height * 24} rx="5" fill="var(--mui-palette-primary-main)" opacity=".28" stroke="var(--mui-palette-primary-main)" strokeWidth="3" /><text x="200" y="165" textAnchor="middle" fontSize="14">{width} × {height}</text></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Box sx={{ flex: 1 }}><Typography variant="body2">Width: {width}</Typography><Slider min={2} max={8} step={1} value={width} onChange={(_, next) => setWidth(Array.isArray(next) ? next[0] : next)} aria-label="Width" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2">Height: {height}</Typography><Slider min={2} max={6} step={1} value={height} onChange={(_, next) => setHeight(Array.isArray(next) ? next[0] : next)} aria-label="Height" /></Box></Stack><Stack direction="row" spacing={2}><Chip label={`Area: ${width * height} units²`} color="primary" /><Chip label={`Perimeter: ${2 * (width + height)} units`} /></Stack><CompleteButton onComplete={onComplete} /></EngineFrame>
}

export const EquationBalanceEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [left, setLeft] = useState(4)
  const [right, setRight] = useState(7)
  const [adjustment, setAdjustment] = useState(3)
  const balanced = left + adjustment === right
  return <EngineFrame name="Equation / Balance" description="Apply the same operation to both sides until the equation is balanced."><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center"><Paper elevation={0} sx={{ p: 2, flex: 1, textAlign: 'center', border: 1, borderColor: balanced ? 'success.main' : 'divider' }}><Typography variant="h4">x + {adjustment}</Typography></Paper><Typography variant="h4">=</Typography><Paper elevation={0} sx={{ p: 2, flex: 1, textAlign: 'center', border: 1, borderColor: balanced ? 'success.main' : 'divider' }}><Typography variant="h4">{right}</Typography></Paper></Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><TextField type="number" label="x value" value={left} onChange={(event) => setLeft(Number(event.target.value))} inputProps={{ min: 0 }} /><TextField type="number" label="Add to x" value={adjustment} onChange={(event) => setAdjustment(Number(event.target.value))} inputProps={{ min: 0 }} /><TextField type="number" label="Right side" value={right} onChange={(event) => setRight(Number(event.target.value))} inputProps={{ min: 0 }} /></Stack><Typography color={balanced ? 'success.main' : 'text.secondary'}>{balanced ? 'Both sides have equal value.' : 'Adjust the values until both sides balance.'}</Typography><CompleteButton disabled={!balanced} onComplete={onComplete} /></EngineFrame>
}

export const MoleculeAtomEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [atoms, setAtoms] = useState<string[]>([])
  const addAtom = (atom: string) => setAtoms((current) => current.length < 3 ? [...current, atom] : current)
  const correct = atoms.join('') === 'HHO'
  return <EngineFrame name="Molecule / Atom Builder" description="Place atoms on the canvas to build the configured water molecule target."><Box sx={{ minHeight: 130, p: 2, border: 1, borderStyle: 'dashed', borderColor: 'divider', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>{atoms.length ? atoms.map((atom, index) => <Box key={`${atom}-${index}`} sx={{ width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: '50%', backgroundColor: atom === 'O' ? 'error.main' : 'primary.main', color: 'common.white', fontWeight: 800 }}>{atom}</Box>) : <Typography color="text.secondary">Place 2 hydrogen atoms and 1 oxygen atom</Typography>}</Box><Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => addAtom('H')}>Add H</Button><Button variant="outlined" onClick={() => addAtom('O')}>Add O</Button><Button variant="text" onClick={() => setAtoms([])}>Reset</Button></Stack><Typography color={correct ? 'success.main' : 'text.secondary'}>{correct ? 'Target structure built: H₂O.' : 'Target: H₂O'}</Typography><CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
}

export const BiologyExplorerEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null)
  const parts = [{ name: 'Root', explanation: 'Absorbs water and anchors the plant.' }, { name: 'Stem', explanation: 'Supports the plant and transports materials.' }, { name: 'Leaf', explanation: 'Uses light to make food.' }]
  return <EngineFrame name="Biology Explorer" description="Select a plant structure to reveal its role in the connected system."><Stack direction="row" spacing={1} justifyContent="center">{parts.map((part) => <Button key={part.name} variant={selected === part.name ? 'contained' : 'outlined'} onClick={() => setSelected(part.name)}>{part.name}</Button>)}</Stack>{selected && <Paper role="status" elevation={0} sx={{ p: 2, backgroundColor: 'success.light' }}><Typography sx={{ fontWeight: 700 }}>{selected}</Typography><Typography variant="body2">{parts.find((part) => part.name === selected)?.explanation}</Typography></Paper>}<CompleteButton disabled={!selected} onComplete={onComplete} /></EngineFrame>
}

export const MicroscopeEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [zoom, setZoom] = useState(1)
  const identified = zoom >= 3
  return <EngineFrame name="Virtual Microscope" description="Increase magnification to inspect the specimen and identify its structure."><Box sx={{ minHeight: 150, display: 'grid', placeItems: 'center', overflow: 'hidden', borderRadius: 2, backgroundColor: '#102a43' }}><Box sx={{ width: 90, height: 90, borderRadius: '50%', transform: `scale(${zoom})`, transition: 'transform .35s ease', background: 'radial-gradient(circle at 35% 30%, #f8c4d8 0 12%, transparent 13%), radial-gradient(circle at 68% 62%, #8ed1c5 0 20%, transparent 21%), #d5f3ec' }} /></Box><Typography variant="body2">Magnification: {zoom}×</Typography><Slider min={1} max={4} step={1} value={zoom} onChange={(_, next) => setZoom(Array.isArray(next) ? next[0] : next)} aria-label="Microscope magnification" /><Typography color={identified ? 'success.main' : 'text.secondary'}>{identified ? 'Structure identified: cell nucleus.' : 'Increase magnification to inspect the nucleus.'}</Typography><CompleteButton disabled={!identified} onComplete={onComplete} /></EngineFrame>
}

export const TimelineEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [stages, setStages] = useState(['Egg', 'Larva', 'Pupa', 'Adult'])
  const [checked, setChecked] = useState(false)
  const move = (index: number, direction: -1 | 1) => setStages((current) => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return next; [next[index], next[target]] = [next[target], next[index]]; return next })
  const correct = stages.join('|') === 'Egg|Larva|Pupa|Adult'
  return <EngineFrame name="Timeline / Lifecycle" description="Arrange the lifecycle stages, then validate the sequence."><Stack spacing={1}>{stages.map((stage, index) => <Paper key={stage} elevation={0} sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1, border: 1, borderColor: 'divider' }}><Typography sx={{ flex: 1, fontWeight: 700 }}>{index + 1}. {stage}</Typography><Button size="small" onClick={() => move(index, -1)} disabled={index === 0}>Up</Button><Button size="small" onClick={() => move(index, 1)} disabled={index === stages.length - 1}>Down</Button></Paper>)}</Stack><Button variant="outlined" onClick={() => setChecked(true)}>Check order</Button>{checked && <Typography color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct lifecycle order.' : 'Try another order.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
}

export const DataChartEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [values, setValues] = useState([5, 8, 4, 9, 7])
  const sorted = [...values].sort((a, b) => a - b)
  const mean = values.reduce((total, value) => total + value, 0) / values.length
  const median = sorted[Math.floor(sorted.length / 2)]
  return <EngineFrame name="Data / Chart Builder" description="Adjust the bars and calculate statistics from the same dataset."><Stack direction="row" spacing={1} alignItems="flex-end" sx={{ height: 150, px: 2, borderBottom: 1, borderColor: 'divider' }}>{values.map((value, index) => <Box key={index} sx={{ flex: 1, height: `${value * 10}%`, minHeight: 8, backgroundColor: 'primary.main', borderRadius: '6px 6px 0 0', transition: 'height .25s ease' }} />)}</Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>{values.map((value, index) => <TextField key={index} type="number" size="small" label={`Value ${index + 1}`} value={value} onChange={(event) => setValues((current) => current.map((item, itemIndex) => itemIndex === index ? Number(event.target.value) : item))} inputProps={{ min: 0, max: 10 }} />)}</Stack><Stack direction="row" spacing={1} flexWrap="wrap"><Chip label={`Mean: ${mean.toFixed(1)}`} /><Chip label={`Median: ${median}`} /><Chip label={`Range: ${Math.max(...values) - Math.min(...values)}`} /></Stack><CompleteButton onComplete={onComplete} /></EngineFrame>
}

const SimulationEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [temperature, setTemperature] = useState(50)
  const [ran, setRan] = useState(false)
  const output = Math.round(temperature * 1.6)
  return <EngineFrame name="Simulation Engine" description="Change an input, run the model, and inspect the calculated output."><Typography variant="body2">Temperature: {temperature}°C</Typography><Slider min={0} max={100} value={temperature} onChange={(_, next) => { setTemperature(Array.isArray(next) ? next[0] : next); setRan(false) }} aria-label="Temperature" /><Button variant="contained" onClick={() => setRan(true)} startIcon={<PlayArrowIcon />} sx={{ alignSelf: 'flex-start' }}>Run simulation</Button>{ran && <Paper role="status" elevation={0} sx={{ p: 2, backgroundColor: 'background.default' }}><Typography variant="h4" color="primary.main">{output}</Typography><Typography variant="caption" color="text.secondary">Model output units</Typography></Paper>}<CompleteButton disabled={!ran} onComplete={onComplete} /></EngineFrame>
}

const PhysicsEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [velocity, setVelocity] = useState(50)
  const [run, setRun] = useState(0)
  return <EngineFrame name="Physics Playground" description="Change the launch velocity and observe motion across the track."><Box sx={{ position: 'relative', height: 100, overflow: 'hidden', borderRadius: 2, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}><Box key={run} sx={{ position: 'absolute', left: 10, top: 38, width: 24, height: 24, borderRadius: '50%', backgroundColor: 'secondary.main', animation: run ? 'physicsTravel 1.8s linear forwards' : 'none', '@keyframes physicsTravel': { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(calc(100% + 320px))' } } }} /></Box><Typography variant="body2">Launch velocity: {velocity} m/s</Typography><Slider min={10} max={100} value={velocity} onChange={(_, next) => setVelocity(Array.isArray(next) ? next[0] : next)} aria-label="Launch velocity" /><Button variant="contained" onClick={() => setRun((current) => current + 1)} startIcon={<PlayArrowIcon />} sx={{ alignSelf: 'flex-start' }}>Run physics model</Button><CompleteButton disabled={!run} onComplete={onComplete} /></EngineFrame>
}

const VirtualLabEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [mixed, setMixed] = useState(false)
  return <EngineFrame name="Virtual Lab Engine" description="Combine safe virtual materials, run the procedure, and observe the configured result."><Stack direction="row" spacing={1} justifyContent="center"><Chip label="Acid sample" color="warning" /><Typography sx={{ alignSelf: 'center' }}>+</Typography><Chip label="Base sample" color="info" /></Stack><Button variant="contained" onClick={() => setMixed(true)} startIcon={<PlayArrowIcon />} sx={{ alignSelf: 'flex-start' }}>Mix and observe</Button>{mixed && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: 'success.main', backgroundColor: 'success.light' }}><Typography sx={{ fontWeight: 700 }}>Neutralization observed</Typography><Typography variant="body2">The combined sample moves toward neutral pH.</Typography></Paper>}<CompleteButton disabled={!mixed} onComplete={onComplete} /></EngineFrame>
}

const PredictionExperimentEngine: FC<EnginePreviewProps> = ({ onComplete }) => {
  const [prediction, setPrediction] = useState<'increase' | 'decrease' | null>(null)
  const [input, setInput] = useState(70)
  const [result, setResult] = useState<'increase' | 'decrease' | null>(null)
  const actual = input >= 50 ? 'increase' : 'decrease'
  return <EngineFrame name="Prediction → Experiment → Result" description="Make a prediction, run the experiment, and compare it with the observed result."><Typography sx={{ fontWeight: 700 }}>What will happen when the input increases?</Typography><Stack direction="row" spacing={1}><Button variant={prediction === 'increase' ? 'contained' : 'outlined'} onClick={() => setPrediction('increase')}>Increase</Button><Button variant={prediction === 'decrease' ? 'contained' : 'outlined'} onClick={() => setPrediction('decrease')}>Decrease</Button></Stack><Typography variant="body2">Experiment input: {input}</Typography><Slider min={0} max={100} value={input} onChange={(_, next) => { setInput(Array.isArray(next) ? next[0] : next); setResult(null) }} aria-label="Experiment input" /><Button variant="contained" disabled={!prediction} onClick={() => setResult(actual)} startIcon={<PlayArrowIcon />} sx={{ alignSelf: 'flex-start' }}>Run experiment</Button>{result && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: result === prediction ? 'success.main' : 'warning.main', backgroundColor: result === prediction ? 'success.light' : 'warning.light' }}><Typography sx={{ fontWeight: 700 }}>{result === prediction ? 'Prediction correct' : 'Prediction needs revision'}</Typography><Typography variant="body2">Observed result: {result}. The result follows the experiment input.</Typography></Paper>}<CompleteButton disabled={!result} onComplete={onComplete} /></EngineFrame>
}

const getMathActivityPrompt = (topic: MathTopic) => {
  const prompts: Record<string, string> = {
    'Counting & Number Recognition': `Tap bugs and fruits until the garden has ${topic.target} counted objects.`,
    'Comparing Numbers': 'Enter the larger number to tip the seesaw toward the greater quantity.',
    'Addition & Subtraction': `Move the robot along the number path until it lands on ${topic.target}.`,
    'Place Value': 'Build the requested hundreds, tens, and ones number with blocks.',
    'Multiplication/Division Concepts': 'Arrange equal critter groups, then enter the number of groups.',
    Fractions: `Tap pizza slices to show ${topic.target}/8 of the whole.`,
    Decimals: `Shade ${topic.target} squares on the 100-grid.`,
    Ratios: `Adjust the recipe to ${topic.target} servings and multiply the ingredients.`,
    Percentages: `Charge the 100-grid battery to ${topic.target}%.`,
    'Factors & Multiples': `Feed ${topic.target} into the machine to reveal its factor pairs.`,
    Measurement: `Drag the virtual ruler until the measured object reads ${topic.target} units.`,
    Geometry: `Place ${topic.target} vertices to complete the target shape.`,
    Angles: `Rotate the ray until the angle reads ${topic.target}°.`,
    'Perimeter & Area': `Place tiles until the room area is ${topic.target} square units.`,
    Symmetry: 'Complete the missing mirror half and check the reflection.',
    'Coordinate Grids': `Guide the robot to coordinate (${topic.target}, ${topic.target}).`,
    'Data & Statistics': `Build the chart and enter the target value ${topic.target}.`,
    Probability: 'Draw balls from the bag and compare the live probability graph.',
    Patterns: `Complete the pattern train with the next value ${topic.target}.`,
    Money: `Buy the item and enter the correct change: ${topic.target}.`,
    Time: `Set the clock hands to ${topic.target} minutes elapsed.`,
    Integers: `Move the elevator until it reaches floor ${topic.target}.`,
    Algebra: `Balance both sides and isolate x = ${topic.target}.`,
    'Linear Equations': `Adjust m until the graph matches slope ${topic.target}.`,
    Functions: `Feed the input into the machine and produce output ${topic.target}.`,
    'Simultaneous Equations': 'Drag the two lines until their intersection is highlighted.',
    'Pythagorean Theorem': `Resize the triangle until the target side is ${topic.target}.`,
    Sets: 'Sort each item into the correct Venn diagram region.',
    Similarity: `Scale the twin shape to factor ${topic.target}.`,
    'Quadratic Equations': `Reshape the parabola until its target parameter is ${topic.target}.`,
    'Sequences & Series': `Place the next sequence term: ${topic.target}.`,
    Trigonometry: `Spin the unit-circle point to ${topic.target}° and read sin/cos/tan.`,
    'Coordinate Geometry': `Click two points and measure distance ${topic.target}.`,
    'Mathematical Modelling': `Adjust the scenario until the outcome reaches ${topic.target}.`,
    'Polynomial Functions': `Sculpt the curve until the target coefficient is ${topic.target}.`,
    'Exponential & Logarithmic Functions': `Grow the population to input level ${topic.target}.`,
    'Analytical Geometry': `Manipulate the equation until the target coefficient is ${topic.target}.`,
    Vectors: `Combine arrows until the resultant magnitude is ${topic.target}.`,
    Limits: 'Move the marker toward x = 2 and observe the approaching value.',
    Differentiation: `Drag the point until the tangent slope is ${topic.target}.`,
    Integration: `Increase rectangles until the area estimate uses ${topic.target} rectangles.`,
    'Advanced Algebra': `Solve the equation challenge: x = ${topic.target}.`,
  }
  return prompts[topic.title] ?? topic.activityDescription
}

const TopicCheck: FC<{ correct: boolean; checked: boolean; onCheck: () => void; onComplete?: () => void }> = ({ correct, checked, onCheck, onComplete }) => <><Button variant="outlined" onClick={onCheck}>Check activity</Button>{checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct — target matched.' : 'Keep exploring and adjust the visual.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></>

const GridActivity: FC<{ topic: MathTopic; value: number; setValue: (value: number) => void; suffix?: string }> = ({ topic, value, setValue, suffix = '' }) => <><Paper elevation={0} sx={{ p: 2, display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: .5, backgroundColor: 'background.default' }}>{Array.from({ length: 100 }, (_, index) => <Button key={index} aria-label={`Grid square ${index + 1}`} onClick={() => setValue(index + 1)} sx={{ minWidth: 0, p: .4, aspectRatio: 1, backgroundColor: index < value ? 'primary.main' : 'action.hover', color: index < value ? 'primary.contrastText' : 'text.secondary' }}>{index < value ? '■' : '·'}</Button>)}</Paper><Typography variant="body2" color="text.secondary">Shade the visual grid to {topic.target}{suffix}.</Typography></>

const GraphVisual: FC<{ kind: 'linear' | 'intersection' | 'parabola' | 'polynomial'; value: number; target: number; setValue: (value: number) => void }> = ({ kind, value, target, setValue }) => { const points = Array.from({ length: 9 }, (_, index) => { const x = index - 4; const y = kind === 'parabola' ? value * x * x - 1 : kind === 'polynomial' ? value * x * x * x / 5 : value * x + 1; return `${40 + index * 40},${105 - y * 8}` }).join(' '); return <><Box component="svg" viewBox="0 0 400 130" sx={{ width: '100%', height: 155, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`${kind} graph`}><line x1="20" x2="380" y1="105" y2="105" stroke="currentColor" opacity=".3" /><line x1="200" x2="200" y1="15" y2="120" stroke="currentColor" opacity=".3" />{kind === 'intersection' ? <><polyline points={points} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" /><polyline points={Array.from({ length: 9 }, (_, index) => `${40 + index * 40},${105 - ((-value * (index - 4)) + 2) * 8}`).join(' ')} fill="none" stroke="var(--mui-palette-secondary-main)" strokeWidth="4" /><circle cx="200" cy="89" r={value === target ? 8 : 4} fill="var(--mui-palette-success-main)" /></> : <polyline points={points} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" />}</Box><Typography variant="body2">{kind === 'linear' ? `y = ${value}x + 1` : kind === 'intersection' ? `Intersection control: ${value}` : `${kind} coefficient: ${value}`}</Typography><Slider min={1} max={5} step={1} value={value} onChange={(_, next) => setValue(Array.isArray(next) ? next[0] : next)} aria-label={`${kind} graph control`} /></> }

const LinearEquationActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [slope, setSlope] = useState(0)
  const [intercept, setIntercept] = useState(0)
  const [touchedSlope, setTouchedSlope] = useState(false)
  const [touchedIntercept, setTouchedIntercept] = useState(false)
  const [checked, setChecked] = useState(false)
  const targetSlope = topic.target
  const targetIntercept = 1
  const correct = touchedSlope && touchedIntercept && slope === targetSlope && intercept === targetIntercept
  const points = Array.from({ length: 41 }, (_, index) => {
    const x = index / 2 - 10
    const y = slope * x + intercept
    const screenY = Math.max(8, Math.min(122, 65 - y * 8))
    return `${20 + index * 9},${screenY}`
  }).join(' ')
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Box component="svg" viewBox="0 0 400 130" sx={{ width: '100%', height: 180, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`Graph of y equals ${slope}x plus ${intercept}`}><line x1="20" x2="380" y1="105" y2="105" stroke="currentColor" opacity=".35" /><line x1="200" x2="200" y1="10" y2="120" stroke="currentColor" opacity=".35" />{Array.from({ length: 41 }, (_, index) => <line key={index} x1={20 + index * 9} x2={20 + index * 9} y1="101" y2="109" stroke="currentColor" opacity=".25" />)}<polyline points={points} fill="none" stroke="#107d6f" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" /></Box><Typography variant="h6" sx={{ fontFamily: 'monospace', textAlign: 'center' }}>y = {slope}x {intercept >= 0 ? '+' : '−'} {Math.abs(intercept)}</Typography><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}><Box sx={{ flex: 1 }}><Typography variant="body2">m (slope): {slope}</Typography><Slider min={-3} max={3} step={1} value={slope} onChange={(_, next) => { setSlope(Array.isArray(next) ? next[0] : next); setTouchedSlope(true); setChecked(false) }} valueLabelDisplay="auto" aria-label="Slope m" /></Box><Box sx={{ flex: 1 }}><Typography variant="body2">b (y-intercept): {intercept}</Typography><Slider min={-4} max={4} step={1} value={intercept} onChange={(_, next) => { setIntercept(Array.isArray(next) ? next[0] : next); setTouchedIntercept(true); setChecked(false) }} valueLabelDisplay="auto" aria-label="Intercept b" /></Box></Stack><Typography variant="body2" color={correct ? 'success.main' : 'text.secondary'}>{correct ? 'Target equation reached: y = 2x + 1.' : 'Move both sliders to build y = 2x + 1.'}</Typography><Button variant="outlined" onClick={() => setChecked(true)}>Check Activity</Button>{checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct equation and graph.' : 'Not yet. Set both m and b to the target values.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
}

const MathActivityEngine: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const initial = topic.title === 'Fractions' ? topic.target : Math.min(Math.max(topic.target - 2, 0), 10)
  const [value, setValue] = useState(initial)
  const [checked, setChecked] = useState(false)
  const [chartValues, setChartValues] = useState([4, 5, 6, 7, 8])
  const [selected, setSelected] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [rulerX, setRulerX] = useState(28)
  const correct = value === topic.target
  const update = (next: number) => { setValue(next); setChecked(false) }
  const finish = <TopicCheck correct={correct} checked={checked} onCheck={() => setChecked(true)} onComplete={onComplete} />
  const frame = (children: ReactNode) => <EngineFrame name={topic.activity} description={topic.activityDescription}>{children}{finish}</EngineFrame>

  if (topic.title === 'Linear Equations') return <LinearEquationActivity topic={topic} onComplete={onComplete} />
  if (topic.title === 'Data & Statistics') {
    const mean = chartValues.reduce((sum, item) => sum + item, 0) / chartValues.length
    const chartCorrect = Math.round(mean) === topic.target
    return <EngineFrame name={topic.activity} description={topic.activityDescription}><Paper elevation={0} sx={{ p: 2, minHeight: 190, display: 'flex', alignItems: 'flex-end', gap: 1.5, backgroundColor: chartCorrect ? 'success.light' : 'background.default' }}>{chartValues.map((item, index) => <Box key={index} sx={{ flex: 1, height: `${item * 16}px`, backgroundColor: 'primary.main', borderRadius: '6px 6px 0 0', position: 'relative' }}><Typography variant="caption" sx={{ position: 'absolute', top: -22 }}>{item}</Typography></Box>)}</Paper><Typography variant="body2">Drag bars until the rounded mean is {topic.target}.</Typography><Stack direction="row" spacing={1}>{chartValues.map((item, index) => <Slider key={index} min={1} max={10} value={item} onChange={(_, next) => { const n = Array.isArray(next) ? next[0] : next; setChartValues(current => current.map((entry, i) => i === index ? n : entry)) }} aria-label={`Chart bar ${index + 1}`} sx={{ flex: 1 }} />)}</Stack><Chip label={`Mean: ${mean.toFixed(1)}`} /><CompleteButton disabled={!chartCorrect} onComplete={onComplete} /></EngineFrame>
  }
  if (topic.title === 'Fractions') return frame(<><Paper elevation={0} sx={{ p: 2, display: 'grid', placeItems: 'center' }}><Box sx={{ width: 150, height: 150, borderRadius: '50%', background: `conic-gradient(#f6b73c ${value / 8 * 360}deg, #fff3c4 0)`, border: 8, borderColor: '#a85d32' }} /></Paper><Typography variant="body2">Tap pizza slices to show {topic.target}/8.</Typography><Stack direction="row" spacing={1} flexWrap="wrap">{Array.from({ length: 8 }, (_, index) => <Button key={index} variant={index < value ? 'contained' : 'outlined'} onClick={() => update(index + 1)}>Slice {index + 1}</Button>)}</Stack></>)
  if (topic.title === 'Counting & Number Recognition') return frame(<><Paper elevation={0} sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>{Array.from({ length: topic.target }, (_, index) => <Button key={index} variant={index < value ? 'contained' : 'outlined'} onClick={() => update(index + 1)} sx={{ borderRadius: '50%', minWidth: 48, height: 48 }}>{index < value ? '●' : '○'}</Button>)}</Paper><Typography>Count the garden objects: {value} of {topic.target}.</Typography></>)
  if (['Decimals', 'Percentages'].includes(topic.title)) return frame(<GridActivity topic={topic} value={value} setValue={update} suffix={topic.title === 'Percentages' ? '%' : ''} />)
  if (topic.title === 'Perimeter & Area') return frame(<><Typography variant="body2">Place tiles to build a room with area {topic.target}.</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: .5, maxWidth: 330 }}>{Array.from({ length: 24 }, (_, index) => <Button key={index} onClick={() => update(index + 1)} sx={{ minWidth: 0, aspectRatio: 1, backgroundColor: index < value ? 'primary.main' : 'action.hover' }}>{index < value ? '■' : '+'}</Button>)}</Box><Chip label={`Area: ${value} square units`} /></>)
  if (topic.title === 'Probability') return frame(<><Stack direction="row" spacing={1} justifyContent="center">{['red', 'blue', 'blue', 'green', 'green'].map((color, index) => <Button key={index} variant={selected[index] ? 'contained' : 'outlined'} color={color === 'red' ? 'error' : color === 'blue' ? 'primary' : 'success'} onClick={() => { setSelected(current => [...current, color]); update(Math.min(value + 1, topic.target)) }}>●</Button>)}</Stack><Paper sx={{ p: 2, display: 'flex', alignItems: 'flex-end', gap: 1, height: 120 }}>{['red', 'blue', 'green'].map(color => <Box key={color} sx={{ flex: 1, height: `${Math.max(15, selected.filter(item => item === color).length * 30)}px`, backgroundColor: color }} />)}</Paper><Typography>Draw balls from the bag and watch the live outcome chart.</Typography></>)
  if (['Sets'].includes(topic.title)) return frame(<><Typography>Sort each item into the Venn diagram regions.</Typography><Box sx={{ position: 'relative', height: 170, display: 'flex', justifyContent: 'center' }}><Box sx={{ width: 150, height: 120, borderRadius: '50%', border: 3, borderColor: 'primary.main', position: 'absolute', left: '25%' }} /><Box sx={{ width: 150, height: 120, borderRadius: '50%', border: 3, borderColor: 'secondary.main', position: 'absolute', right: '25%' }} />{['A', 'B', 'A∩B', 'C'].map((item, index) => <Button key={item} onClick={() => update(index + 1)} sx={{ position: 'absolute', left: `${20 + index * 20}%`, top: `${20 + (index % 2) * 60}px` }}>{item}</Button>)}</Box></>)
  if (['Linear Equations', 'Simultaneous Equations', 'Quadratic Equations', 'Polynomial Functions'].includes(topic.title)) return frame(<GraphVisual kind={topic.title === 'Linear Equations' ? 'linear' : topic.title === 'Simultaneous Equations' ? 'intersection' : topic.title === 'Quadratic Equations' ? 'parabola' : 'polynomial'} value={value || 1} target={topic.target} setValue={update} />)
  if (topic.title === 'Algebra') return frame(<><EquationBalanceEngine onComplete={onComplete} /></>)
  if (topic.title === 'Functions') return frame(<><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4">{value} → ×2 + 2 → {value * 2 + 2}</Typography></Paper><Slider min={0} max={10} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label="Function machine input" /><Typography>Feed an input into the function machine; target output is {topic.target}.</Typography></>)
  if (['Time', 'Integers', 'Trigonometry', 'Vectors'].includes(topic.title)) return frame(<><Box component="svg" viewBox="0 0 400 150" sx={{ width: '100%', height: 150, backgroundColor: 'background.default' }}><circle cx="200" cy="75" r="55" fill="none" stroke="currentColor" strokeWidth="3" />{topic.title === 'Time' ? <><line x1="200" y1="75" x2="200" y2="35" stroke="var(--mui-palette-primary-main)" strokeWidth="5" /><line x1="200" y1="75" x2="245" y2="75" stroke="var(--mui-palette-secondary-main)" strokeWidth="4" /></> : <line x1="200" y1="75" x2={200 + Math.cos(value * Math.PI / 180) * 55} y2={75 - Math.sin(value * Math.PI / 180) * 55} stroke="var(--mui-palette-primary-main)" strokeWidth="5" />}</Box><Slider min={topic.title === 'Integers' ? -10 : 0} max={topic.title === 'Time' ? 60 : 360} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label={`${topic.title} visual control`} /><Typography>{topic.title === 'Integers' ? `Elevator floor: ${value}` : topic.title === 'Vectors' ? `Resultant magnitude: ${value}` : `Live value: ${value}`}</Typography></>)
  if (topic.title === 'Measurement') {
    const updateRuler = (event: PointerEvent<HTMLElement>) => {
      if (!dragging) return
      const bounds = event.currentTarget.getBoundingClientRect()
      const nextRulerX = Math.max(0, Math.min(bounds.width - 330, event.clientX - bounds.left - 20))
      const objectStart = 28
      const objectEnd = objectStart + topic.target * 26
      const liveMeasurement = Math.max(0, Math.min(12, Math.round((objectEnd - nextRulerX) / 26)))
      setRulerX(nextRulerX)
      update(liveMeasurement)
    }
    return frame(<><Typography variant="body2">Drag the ruler alongside the pencil until its zero mark aligns with the pencil tip and the endpoint reads {topic.target} units.</Typography><Box onPointerMove={updateRuler} onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)} sx={{ position: 'relative', height: 210, overflow: 'hidden', borderRadius: 2, backgroundColor: 'background.default', border: 1, borderColor: 'divider', touchAction: 'none' }}><Box sx={{ position: 'absolute', left: 28, top: 32, width: `${topic.target * 26}px`, height: 28, borderRadius: 3, backgroundColor: '#e5b46a', border: 2, borderColor: '#9a6732', transform: 'rotate(-2deg)' }}><Box sx={{ position: 'absolute', right: -10, top: 7, width: 0, height: 0, borderTop: '7px solid transparent', borderBottom: '7px solid transparent', borderLeft: '12px solid #9a6732' }} /></Box><Typography sx={{ position: 'absolute', left: 30, top: 65, fontSize: 12, fontWeight: 700 }}>Pencil: {topic.target} units</Typography><Box onPointerDown={() => setDragging(true)} sx={{ position: 'absolute', left: rulerX, top: 108, width: 330, height: 48, borderRadius: 1, backgroundColor: '#f6b73c', border: 2, borderColor: '#a86b00', cursor: dragging ? 'grabbing' : 'grab', userSelect: 'none', transition: dragging ? 'none' : 'left .2s ease' }}><Box component="svg" viewBox="0 0 330 48" sx={{ width: '100%', height: '100%' }} aria-label={`Ruler currently reads ${value} units`}>{Array.from({ length: 13 }, (_, index) => <g key={index}><line x1={index * 26} x2={index * 26} y1={index % 5 === 0 ? 5 : 17} y2="40" stroke="#5d4200" strokeWidth="2" /><text x={index * 26 + 2} y="14" fontSize="10" fill="#5d4200">{index}</text></g>)}</Box></Box></Box><Typography role="status" color={correct ? 'success.main' : 'text.secondary'}>Live measurement: <strong>{value} units</strong>{correct ? ' — aligned!' : ' — drag the ruler to the pencil endpoint.'}</Typography></>)
  }
  if (['Patterns', 'Sequences & Series', 'Money'].includes(topic.title)) return frame(<><Stack direction="row" spacing={1} justifyContent="center">{Array.from({ length: 5 }, (_, index) => <Button key={index} variant={index < value % 5 ? 'contained' : 'outlined'} onClick={() => update(Math.min(topic.target, value + 1))}>{topic.title === 'Money' ? `$${index + 1}` : index % 2 ? '▲' : '●'}</Button>)}</Stack><Typography>{topic.title === 'Money' ? 'Count coins and bills to make the change.' : `Build the next term: ${value}`}</Typography><Slider min={0} max={topic.target} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label={`${topic.title} builder`} /></>)
  if (['Place Value', 'Multiplication/Division Concepts', 'Factors & Multiples'].includes(topic.title)) return frame(<><Typography>Build with manipulatives: hundreds, tens, ones, equal groups, or factor pairs.</Typography><Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">{Array.from({ length: Math.min(topic.target, 12) }, (_, index) => <Button key={index} onClick={() => update(index === Math.min(topic.target, 12) - 1 ? topic.target : index + 1)} variant={index < value ? 'contained' : 'outlined'}>{topic.title === 'Place Value' ? (index < 3 ? '100' : index < 6 ? '10' : '1') : topic.title === 'Factors & Multiples' ? `${index + 1} × ${Math.max(1, Math.floor(topic.target / (index + 1)))}` : '● ●'}</Button>)}</Stack><Chip label={`Built value: ${value}`} /></>)
  if (['Geometry', 'Angles', 'Similarity', 'Pythagorean Theorem'].includes(topic.title)) return frame(<><Box component="svg" viewBox="0 0 400 170" sx={{ width: '100%', height: 170, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`${topic.title} shape visual`}><polygon points={`200,20 ${100 + value * 8},140 ${300 - value * 5},140`} fill="var(--mui-palette-primary-main)" opacity=".3" stroke="var(--mui-palette-primary-main)" strokeWidth="4" /><text x="200" y="160" textAnchor="middle">{topic.title === 'Angles' ? `${value}° angle` : `${value} units`}</text></Box><Slider min={1} max={Math.max(topic.target, 10)} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label={`${topic.title} shape control`} /><Typography>Drag vertices or the ray to explore this {topic.title.toLowerCase()} visual.</Typography></>)
  if (['Comparing Numbers', 'Addition & Subtraction', 'Coordinate Grids', 'Coordinate Geometry'].includes(topic.title)) return frame(<><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: .5, p: 1, border: 1, borderColor: 'divider' }}>{Array.from({ length: 49 }, (_, index) => <Button key={index} onClick={() => update(index % 7 + 1)} sx={{ minWidth: 0, aspectRatio: 1, backgroundColor: index % 7 + 1 === value ? 'primary.main' : 'action.hover' }}>{index % 7}</Button>)}</Box><Typography>{topic.title === 'Comparing Numbers' ? 'Choose the larger quantity on the number balance.' : 'Move the marker across the number path/grid to the target.'}</Typography></>)
  if (['Symmetry', 'Mathematical Modelling', 'Exponential & Logarithmic Functions', 'Analytical Geometry', 'Limits', 'Differentiation', 'Integration', 'Advanced Algebra'].includes(topic.title)) return frame(<><Box sx={{ minHeight: 150, p: 2, display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg, transparent 48%, var(--mui-palette-primary-main) 49% 51%, transparent 52%), repeating-linear-gradient(90deg, transparent 0 38px, rgba(0,0,0,.1) 39px 40px)', border: 1, borderColor: 'divider' }}><Typography variant="h4" color="primary.main">{topic.title === 'Limits' ? `f(x) → ${value}` : topic.title === 'Integration' ? `${value} rectangles` : topic.title === 'Differentiation' ? `tangent slope ${value}` : `model parameter ${value}`}</Typography></Box><Slider min={0} max={Math.max(topic.target, 10)} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label={`${topic.title} visual control`} /><Typography>Manipulate the visual model and observe the live {topic.title.toLowerCase()} result.</Typography></>)
  if (topic.title === 'Ratios') return frame(<><Typography>Recipe mixer: scale ingredients for {topic.target} servings.</Typography><Stack direction="row" spacing={1} justifyContent="center">{['flour', 'eggs', 'milk'].map((item, index) => <Chip key={item} label={`${item}: ${Math.max(1, value + index)}×`} color={index < 2 ? 'primary' : 'secondary'} />)}</Stack><Slider min={1} max={10} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label="Recipe servings" /></>)
  return frame(<><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h4">{topic.title}</Typography><Typography>Interactive model value: {value}</Typography></Paper><Slider min={0} max={Math.max(topic.target, 10)} value={value} onChange={(_, next) => update(Array.isArray(next) ? next[0] : next)} aria-label={`${topic.title} visual control`} /><Typography>{getMathActivityPrompt(topic)}</Typography></>)
}

export const PlatformEnginePreview: FC<{ engineId: PlatformEngineId; onComplete?: () => void; mathTopic?: MathTopic }> = ({ engineId, onComplete, mathTopic }) => {
  if (mathTopic) return <MathActivityEngine topic={mathTopic} onComplete={onComplete} />
  if (engineId === 'drag-drop') return <DragDropEngine config={{ title: 'Sort living and non-living things', prompt: 'Place each example into the correct category.', categories: ['Living', 'Non-living'], items: [{ id: 'tree', label: 'Tree', correctCategory: 'Living' }, { id: 'rock', label: 'Rock', correctCategory: 'Non-living' }, { id: 'dog', label: 'Dog', correctCategory: 'Living' }, { id: 'water', label: 'Water', correctCategory: 'Non-living' }] }} onComplete={onComplete ?? (() => undefined)} />
  if (engineId === 'matching') return <MatchingEngine config={{ title: 'Match shapes and features', prompt: 'Connect each shape to its defining feature.', leftLabel: 'Shape', rightLabel: 'Feature', pairs: [{ id: 'triangle', left: 'Triangle', right: '3 sides' }, { id: 'square', left: 'Square', right: '4 equal sides' }, { id: 'circle', left: 'Circle', right: 'No straight sides' }] }} onComplete={onComplete ?? (() => undefined)} />
  if (engineId === 'number-line') return <NumberLineEngine onComplete={onComplete} />
  if (engineId === 'graph') return <GraphEngine onComplete={onComplete} />
  if (engineId === 'geometry') return <GeometryEngine onComplete={onComplete} />
  if (engineId === 'equation-balance') return <EquationBalanceEngine onComplete={onComplete} />
  if (engineId === 'molecule-atom') return <MoleculeAtomEngine onComplete={onComplete} />
  if (engineId === 'biology-explorer') return <BiologyExplorerEngine onComplete={onComplete} />
  if (engineId === 'microscope') return <MicroscopeEngine onComplete={onComplete} />
  if (engineId === 'timeline') return <TimelineEngine onComplete={onComplete} />
  if (engineId === 'data-chart') return <DataChartEngine onComplete={onComplete} />
  if (engineId === 'simulation') return <SimulationEngine onComplete={onComplete} />
  if (engineId === 'physics') return <PhysicsEngine onComplete={onComplete} />
  if (engineId === 'virtual-lab') return <VirtualLabEngine onComplete={onComplete} />
  return <PredictionExperimentEngine onComplete={onComplete} />
}
