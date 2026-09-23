import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useState } from 'react'

export type MachinePlaygroundProps = { onComplete?: () => void }
type Machine = 'lever' | 'pulley' | 'ramp'
type Feedback = 'idle' | 'correct' | 'incorrect'

type Round = {
  mass: number
  targets: Record<Machine, number>
}

const GRAVITY = 9.81
const LIFT_HEIGHT = 1
const round = (value: number) => Math.round(value * 10) / 10
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const createRound = (): Round => {
  const mass = randomInt(35, 85)
  const weight = mass * GRAVITY
  return {
    mass,
    targets: {
      lever: randomInt(Math.max(8, Math.round(weight * 0.16)), Math.max(12, Math.round(weight * 0.32))),
      pulley: randomInt(Math.max(10, Math.round(weight * 0.18)), Math.max(14, Math.round(weight * 0.52))),
      ramp: randomInt(Math.max(10, Math.round(weight * 0.18)), Math.max(14, Math.round(weight * 0.48))),
    },
  }
}

const machineNames: Record<Machine, string> = { lever: 'Lever', pulley: 'Pulley', ramp: 'Ramp' }

const MachineVisual: FC<{
  machine: Machine
  mass: number
  fulcrum: number
  pulleys: number
  angle: number
  completed: boolean
}> = ({ machine, mass, fulcrum, pulleys, angle, completed }) => {
  const weight = mass * GRAVITY
  const loadArm = fulcrum - 0.2
  const effortArm = 0.8 - fulcrum
  const leverForce = weight * loadArm / effortArm
  const leverLift = completed ? Math.min(38, Math.max(8, (weight - leverForce) * 0.5)) : 0
  const leverTilt = Math.max(-12, Math.min(12, (weight - leverForce) * 0.18))
  const rampForce = weight * Math.sin((angle * Math.PI) / 180)
  const rampDistance = LIFT_HEIGHT / Math.sin((angle * Math.PI) / 180)

  if (machine === 'lever') return <Box component="svg" viewBox="0 0 640 260" sx={{ width: '100%', minHeight: 230, borderRadius: 2, background: 'linear-gradient(180deg, #e7f4f5, #f6f0df)' }} role="img" aria-label="Seesaw lever with draggable fulcrum"><line x1="55" x2="585" y1="210" y2="210" stroke="#a3b8b8" strokeWidth="5" /><g style={{ transform: `rotate(${leverTilt}deg)`, transformOrigin: '320px 150px', transition: 'transform .45s ease' }}><rect x="90" y="137" width="460" height="25" rx="12" fill="#1b7f83" /><rect x="90" y="130" width="72" height="66" rx="8" fill="#c98b4c" stroke="#7d542b" strokeWidth="4" style={{ transform: `translateY(${-leverLift}px)`, transition: 'transform .45s ease' }} /><text x="126" y="171" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700">BOX</text><text x="126" y="218" textAnchor="middle" fill="#526568" fontSize="14">{mass} kg load</text><line x1="495" x2="495" y1="93" y2="137" stroke="#527274" strokeWidth="4" strokeDasharray="7 6" /><text x="495" y="82" textAnchor="middle" fill="#526568" fontSize="14">effort</text></g><polygon points={`${fulcrum * 640 - 32},210 ${fulcrum * 640 + 32},210 ${fulcrum * 640},153`} fill="#e0a43b" stroke="#8c641d" strokeWidth="4" /><circle cx={fulcrum * 640} cy="150" r="9" fill="#fff" stroke="#8c641d" strokeWidth="4" /><text x="320" y="244" textAnchor="middle" fill="#526568" fontSize="14">Drag the fulcrum slider to change the load and effort arms</text></Box>

  if (machine === 'pulley') return <Box component="svg" viewBox="0 0 640 260" sx={{ width: '100%', minHeight: 230, borderRadius: 2, background: 'linear-gradient(180deg, #edf2fb, #f7f0df)' }} role="img" aria-label={`${pulleys} pulley wheel lifting a box`}><line x1="80" x2="560" y1="35" y2="35" stroke="#536b83" strokeWidth="12" /><text x="320" y="22" textAnchor="middle" fill="#526568" fontSize="14">ceiling support</text>{Array.from({ length: pulleys }, (_, index) => { const x = 220 + index * 58; return <g key={x}><circle cx={x} cy="84" r="27" fill="#d9a441" stroke="#805f1b" strokeWidth="5" /><circle cx={x} cy="84" r="7" fill="#fff" stroke="#805f1b" strokeWidth="3" /></g> })}<path d={`M ${220 - 27} 84 ${Array.from({ length: pulleys }, (_, index) => `Q ${220 + index * 58} 138 ${220 + index * 58 + 27} 84`).join(' ')} L 535 84 L 535 190`} fill="none" stroke="#bd6b42" strokeWidth="5" /><rect x="505" y={completed ? 150 : 178} width="60" height="42" rx="7" fill="#c98b4c" stroke="#7d542b" strokeWidth="4" style={{ transition: 'y .6s ease' }} /><text x="535" y={completed ? 176 : 204} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">BOX</text><text x="535" y="232" textAnchor="middle" fill="#526568" fontSize="14">{mass} kg load</text><text x="410" y="112" fill="#526568" fontSize="14">pull rope ↓</text></Box>

  return <Box component="svg" viewBox="0 0 640 260" sx={{ width: '100%', minHeight: 230, borderRadius: 2, background: 'linear-gradient(180deg, #edf6ee, #f8f0df)' }} role="img" aria-label={`Ramp set to ${angle} degrees`}><line x1="75" x2="575" y1="210" y2="210" stroke="#8b9c84" strokeWidth="6" /><polygon points="115,210 515,210 515,78" fill="#d8e7d3" stroke="#587457" strokeWidth="5" /><line x1="180" x2="500" y1="188" y2="92" stroke="#587457" strokeWidth="5" strokeDasharray="8 7" /><g style={{ transform: completed ? 'translate(290px, 64px)' : 'translate(150px, 174px)', transition: 'transform .7s ease' }}><rect x="0" y="0" width="72" height="48" rx="8" fill="#c98b4c" stroke="#7d542b" strokeWidth="4" /><text x="36" y="30" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">BOX</text></g><text x="320" y="244" textAnchor="middle" fill="#526568" fontSize="14">{angle}° incline · {mass} kg load</text><text x="493" y="74" textAnchor="middle" fill="#526568" fontSize="14">1 m rise</text><line x1="522" x2="522" y1="210" y2="78" stroke="#526568" strokeWidth="2" strokeDasharray="5 5" /></Box>
}

const MachinePlaygroundActivity: FC<MachinePlaygroundProps> = ({ onComplete }) => {
  const [roundState, setRoundState] = useState<Round>(createRound)
  const [machine, setMachine] = useState<Machine>('lever')
  const [fulcrum, setFulcrum] = useState(0.42)
  const [pulleys, setPulleys] = useState(1)
  const [angle, setAngle] = useState(20)
  const [feedback, setFeedback] = useState<Feedback>('idle')

  const weight = roundState.mass * GRAVITY
  const loadArm = fulcrum - 0.2
  const effortArm = 0.8 - fulcrum
  const leverForce = weight * loadArm / effortArm
  const pulleyForce = weight / pulleys
  const ropeDistance = LIFT_HEIGHT * pulleys
  const rampForce = weight * Math.sin((angle * Math.PI) / 180)
  const forceNeeded = machine === 'lever' ? leverForce : machine === 'pulley' ? pulleyForce : rampForce
  const distanceNeeded = machine === 'lever' ? LIFT_HEIGHT * (effortArm / loadArm) : machine === 'pulley' ? ropeDistance : LIFT_HEIGHT / Math.sin((angle * Math.PI) / 180)
  const challengeTarget = roundState.targets[machine]
  const completed = feedback === 'correct'

  const changeSetting = (change: () => void) => { change(); setFeedback('idle') }
  const reset = () => { setRoundState(createRound()); setMachine('lever'); setFulcrum(0.42); setPulleys(1); setAngle(20); setFeedback('idle') }
  const checkActivity = () => setFeedback(forceNeeded <= challengeTarget ? 'correct' : 'incorrect')
  const hint = machine === 'lever' ? 'Try moving the fulcrum toward the load for more mechanical advantage.' : machine === 'pulley' ? 'Try adding another pulley wheel to share the load.' : 'Try making the ramp shallower so the push is spread over more distance.'
  const successMessage = machine === 'lever' ? 'Right! Moving the fulcrum toward the load reduced the effort force.' : machine === 'pulley' ? `Right! ${pulleys > 1 ? `Using ${pulleys} pulleys shares the load across the rope.` : 'The pulley changes the direction of your pull.'}` : 'Right! A shallower ramp trades a smaller force for a longer push.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Machine Playground</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how simple machines make work easier.</Typography></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>{(['lever', 'pulley', 'ramp'] as Machine[]).map((option) => <Button key={option} variant={machine === option ? 'contained' : 'outlined'} onClick={() => changeSetting(() => setMachine(option))}>{machineNames[option]}</Button>)}</Stack><MachineVisual machine={machine} mass={roundState.mass} fulcrum={fulcrum} pulleys={pulleys} angle={angle} completed={completed} /><Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between"><Box><Typography variant="body2" color="text.secondary">Force needed</Typography><Typography variant="h4" color="primary.main">{round(forceNeeded)} N</Typography></Box><Box><Typography variant="body2" color="text.secondary">Distance of effort</Typography><Typography variant="h5">{round(distanceNeeded)} m</Typography></Box><Box><Typography variant="body2" color="text.secondary">Load weight</Typography><Typography variant="h5">{round(weight)} N</Typography></Box></Stack></Paper>{machine === 'lever' && <Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Fulcrum position: {round(fulcrum * 100)}% along the bar</Typography><Slider min={0.31} max={0.66} step={0.01} value={fulcrum} onChange={(_, value) => changeSetting(() => setFulcrum(Array.isArray(value) ? value[0] : value))} valueLabelDisplay="auto" valueLabelFormat={(value) => `${Math.round(Number(value) * 100)}%`} aria-label="Lever fulcrum position" /><Typography variant="caption" color="text.secondary">Move it closer to the box to shorten the load arm and reduce the force needed.</Typography></Box>}{machine === 'pulley' && <Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Pulley wheels: {pulleys}</Typography><Stack direction="row" alignItems="center" spacing={1}><Button variant="outlined" startIcon={<AddIcon />} onClick={() => changeSetting(() => setPulleys((value) => Math.min(4, value + 1)))} disabled={pulleys === 4}>Add pulley</Button><Typography variant="body2" color="text.secondary">Each added wheel doubles the rope sections supporting the load in this model.</Typography></Stack></Box>}{machine === 'ramp' && <Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Ramp angle: {angle}°</Typography><Slider min={8} max={40} step={1} value={angle} onChange={(_, value) => changeSetting(() => setAngle(Array.isArray(value) ? value[0] : value))} valueLabelDisplay="auto" aria-label="Ramp angle" /><Typography variant="caption" color="text.secondary">A steeper ramp needs more force, while a shallower ramp needs a longer push.</Typography></Box>}<Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', backgroundColor: feedback === 'correct' ? 'success.light' : feedback === 'incorrect' ? 'warning.light' : 'action.hover' }}><Typography sx={{ fontWeight: 700 }}>Challenge: reduce the force needed to under {challengeTarget} N.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: .5, fontWeight: 800 }}>{successMessage} The calculated force is {round(forceNeeded)} N.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: .5 }}>{hint}</Typography>}</Paper><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack></Stack></Paper>
}

export default MachinePlaygroundActivity
