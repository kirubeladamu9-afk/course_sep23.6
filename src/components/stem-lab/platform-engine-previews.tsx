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
import { type FC, type ReactNode, useState } from 'react'
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

const MathActivityEngine: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [value, setValue] = useState(topic.mode === 'graph' ? 0 : topic.mode === 'input' ? topic.target - 2 : topic.mode === 'slider' ? Math.max(topic.target - 5, -10) : 0)
  const [checked, setChecked] = useState(false)
  const [chartValues, setChartValues] = useState([4, 5, 6, 7, 8])
  const correct = value === topic.target
  const min = topic.mode === 'slider' && topic.target < 0 ? topic.target - 7 : topic.mode === 'slider' ? Math.max(0, topic.target - 10) : 0
  const max = topic.mode === 'slider' ? topic.target + 10 : 10
  const prompt = getMathActivityPrompt(topic)
  if (topic.title === 'Data & Statistics') {
    const mean = chartValues.reduce((sum, item) => sum + item, 0) / chartValues.length
    const sorted = [...chartValues].sort((a, b) => a - b)
    const median = sorted[2]
    const mode = chartValues.find((item, index) => chartValues.indexOf(item) !== index) ?? 'none'
    const chartCorrect = Math.round(mean) === topic.target
    return <EngineFrame name={topic.activity} description={topic.activityDescription}><Paper elevation={0} sx={{ p: 2, minHeight: 190, display: 'flex', alignItems: 'flex-end', gap: 1.5, backgroundColor: chartCorrect ? 'success.light' : 'background.default' }}>{chartValues.map((item, index) => <Box key={index} sx={{ flex: 1, height: `${item * 16}px`, minHeight: 12, backgroundColor: 'primary.main', borderRadius: '6px 6px 0 0', transition: 'height .25s ease', position: 'relative' }}><Typography variant="caption" sx={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)' }}>{item}</Typography></Box>)}</Paper><Typography variant="body2" color="text.secondary">Drag the bars to build a dataset whose rounded mean is {topic.target}.</Typography><Stack direction="row" spacing={1}>{chartValues.map((item, index) => <Slider key={index} min={1} max={10} step={1} value={item} onChange={(_, next) => { const nextValue = Array.isArray(next) ? next[0] : next; setChartValues((current) => current.map((entry, entryIndex) => entryIndex === index ? nextValue : entry)); setChecked(false) }} aria-label={`Chart bar ${index + 1}`} sx={{ flex: 1 }} />)}</Stack><Stack direction="row" spacing={1} flexWrap="wrap"><Chip label={`Mean: ${mean.toFixed(1)}`} /><Chip label={`Median: ${median}`} /><Chip label={`Mode: ${mode}`} /></Stack><Button variant="outlined" onClick={() => setChecked(true)}>Check chart</Button>{checked && <Typography role="status" color={chartCorrect ? 'success.main' : 'warning.main'}>{chartCorrect ? 'Correct chart — the target mean is reached.' : 'Adjust the bars and try again.'}</Typography>}<CompleteButton disabled={!chartCorrect} onComplete={onComplete} /></EngineFrame>
  }
  if (topic.title === 'Fractions') {
    const slices = Array.from({ length: 8 }, (_, index) => index < value)
    return <EngineFrame name={topic.activity} description={topic.activityDescription}><Paper elevation={0} sx={{ p: 2, minHeight: 170, display: 'grid', placeItems: 'center', backgroundColor: correct ? 'success.light' : 'background.default' }}><Box sx={{ width: 150, height: 150, borderRadius: '50%', background: 'repeating-conic-gradient(#f6b73c 0deg 43deg, #fff3c4 43deg 45deg)', border: 8, borderColor: '#a85d32', transform: correct ? 'scale(1.08) rotate(8deg)' : 'scale(1)', transition: 'transform .3s ease' }} /></Paper><Typography variant="body2" color="text.secondary">Tap pizza slices to show {topic.target}/8.</Typography><Stack direction="row" spacing={1} flexWrap="wrap">{slices.map((selected, index) => <Button key={index} variant={selected ? 'contained' : 'outlined'} onClick={() => { setValue((current) => current === index + 1 ? index : index + 1); setChecked(false) }} sx={{ minWidth: 44, transition: 'transform .2s ease', transform: selected ? 'translateY(-4px)' : 'none' }}>Slice {index + 1}</Button>)}</Stack><Button variant="outlined" onClick={() => setChecked(true)}>Check pizza</Button>{checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Chef says: perfect fraction!' : 'That fraction needs another slice adjustment.'}</Typography>}<CompleteButton disabled={!correct} onComplete={onComplete} /></EngineFrame>
  }
  return <EngineFrame name={topic.activity} description={topic.activityDescription}><Paper elevation={0} sx={{ p: 2, minHeight: 90, display: 'grid', placeItems: 'center', backgroundColor: correct ? 'success.light' : 'background.default', transition: 'background-color .25s ease' }}>
    {topic.mode === 'count' ? <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">{Array.from({ length: Math.max(topic.target, 7) }, (_, index) => <Button key={index} size="small" variant={index < value ? 'contained' : 'outlined'} onClick={() => setValue((current) => current === index + 1 ? index : index + 1)} sx={{ minWidth: 42, transition: 'transform .2s ease', transform: index < value ? 'translateY(-4px)' : 'none' }}>{index < value ? '●' : '○'}</Button>)}</Stack> : <Typography variant="h3" color={correct ? 'success.main' : 'primary.main'} sx={{ transition: 'transform .25s ease', transform: correct ? 'scale(1.12)' : 'scale(1)' }}>{value}</Typography>}
  </Paper>
  <Typography variant="body2" color="text.secondary">{prompt}</Typography>
  {topic.mode === 'input' && <TextField type="number" label="Your answer" value={value} onChange={(event) => { setValue(Number(event.target.value)); setChecked(false) }} inputProps={{ step: 1 }} />}
  {topic.mode === 'slider' && <Slider min={min} max={max} step={1} value={value} onChange={(_, next) => { setValue(Array.isArray(next) ? next[0] : next); setChecked(false) }} valueLabelDisplay="auto" aria-label={`${topic.activity} target`} />}
  {topic.mode === 'graph' && <><Box component="svg" viewBox="0 0 400 130" sx={{ width: '100%', height: 150, backgroundColor: 'background.default', borderRadius: 2 }} role="img" aria-label={`${topic.activity} live graph`}><line x1="20" x2="380" y1="105" y2="105" stroke="currentColor" opacity=".3" /><line x1="200" x2="200" y1="15" y2="120" stroke="currentColor" opacity=".3" /><polyline points={Array.from({ length: 9 }, (_, index) => { const x = index - 4; return `${40 + index * 40},${105 - (value * x + 1) * 8}` }).join(' ')} fill="none" stroke="var(--mui-palette-primary-main)" strokeWidth="4" style={{ transition: 'all .25s ease' }} /></Box><Slider min={-5} max={5} step={1} value={value} onChange={(_, next) => { setValue(Array.isArray(next) ? next[0] : next); setChecked(false) }} valueLabelDisplay="auto" aria-label={`${topic.activity} parameter`} /></>}
  <Button variant="outlined" onClick={() => setChecked(true)}>Check answer</Button>
  {checked && <Typography role="status" color={correct ? 'success.main' : 'warning.main'}>{correct ? 'Correct — the activity target is matched.' : 'Not quite yet. Adjust the control and try again.'}</Typography>}
  <CompleteButton disabled={!correct} onComplete={onComplete} />
  </EngineFrame>
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
