import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useEffect, useState } from 'react'

export type MachinePlaygroundProps = { onComplete?: () => void }
type Machine = 'lever' | 'pulley' | 'ramp'
type Feedback = 'idle' | 'correct' | 'incorrect'

type Round = {
  mass: number
  targets: Record<Machine, number>
}

const GRAVITY = 9.81
const LIFT_HEIGHT = 1
const frictionCoefficients: Record<Machine, number> = { lever: .12, pulley: .15, ramp: .2 }
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
  fixedPulleys: number
  movablePulleys: number
  angle: number
  motionProgress: number
  frictionEnabled: boolean
}> = ({ machine, mass, fulcrum, fixedPulleys, movablePulleys, angle, motionProgress, frictionEnabled }) => {
  const weight = mass * GRAVITY
  const loadArm = Math.max(.05, fulcrum - .2)
  const effortArm = Math.max(.05, .8 - fulcrum)
  const leverForce = weight * loadArm / effortArm
  const supportingSegments = 1 + movablePulleys
  const pulleyForce = weight / supportingSegments
  const rampForce = weight * Math.sin((angle * Math.PI) / 180)
  const idealForce = machine === 'lever' ? leverForce : machine === 'pulley' ? pulleyForce : rampForce
  const frictionForce = machine === 'ramp' ? frictionCoefficients.ramp * weight * Math.cos((angle * Math.PI) / 180) : idealForce * frictionCoefficients[machine]
  const actualForce = frictionEnabled ? idealForce + frictionForce : idealForce
  const leverTilt = Math.max(-12, Math.min(12, (weight - actualForce) * 0.18))
  const leverLift = motionProgress * 38
  const movableY = 136 - motionProgress * 38
  const loadY = 178 - motionProgress * 38
  const rampProgress = motionProgress
  const rampBoxX = 150 + rampProgress * 270
  const rampBoxY = 166 - rampProgress * 82

  if (machine === 'lever') return <Box component="svg" viewBox="0 0 640 260" sx={{ width: '100%', minHeight: 230, borderRadius: 2, background: 'linear-gradient(180deg, #e7f4f5, #f6f0df)' }} role="img" aria-label="Seesaw lever with adjustable fulcrum">
    <line x1="55" x2="585" y1="210" y2="210" stroke="#a3b8b8" strokeWidth="5" />
    <g style={{ transform: `rotate(${leverTilt}deg)`, transformOrigin: '320px 150px', transition: 'transform .15s linear' }}>
      <rect x="90" y="137" width="460" height="25" rx="12" fill="#1b7f83" />
      <rect x="90" y="130" width="72" height="66" rx="8" fill="#c98b4c" stroke="#7d542b" strokeWidth="4" style={{ transform: `translateY(${-leverLift}px)`, transition: 'transform .1s linear' }} />
      <text x="126" y="171" textAnchor="middle" fill="#fff" fontSize="15" fontWeight="700">BOX</text>
      <text x="126" y="218" textAnchor="middle" fill="#526568" fontSize="14">{mass} kg load</text>
      <line x1="495" x2="495" y1="93" y2="137" stroke="#527274" strokeWidth="4" strokeDasharray="7 6" />
      <text x="495" y="82" textAnchor="middle" fill="#526568" fontSize="14">effort</text>
    </g>
    <polygon points={`${fulcrum * 640 - 32},210 ${fulcrum * 640 + 32},210 ${fulcrum * 640},153`} fill="#e0a43b" stroke="#8c641d" strokeWidth="4" />
    <circle cx={fulcrum * 640} cy="150" r="9" fill="#fff" stroke="#8c641d" strokeWidth="4" />
    <text x="320" y="244" textAnchor="middle" fill="#526568" fontSize="14">Drag the fulcrum slider to change both lever arms</text>
  </Box>

  if (machine === 'pulley') return <Box component="svg" viewBox="0 0 640 260" sx={{ width: '100%', minHeight: 230, borderRadius: 2, background: 'linear-gradient(180deg, #edf2fb, #f7f0df)' }} role="img" aria-label={`${fixedPulleys} fixed and ${movablePulleys} movable pulleys`}>
    <line x1="80" x2="560" y1="35" y2="35" stroke="#536b83" strokeWidth="12" />
    <text x="320" y="22" textAnchor="middle" fill="#526568" fontSize="14">ceiling support</text>
    {Array.from({ length: fixedPulleys }, (_, index) => { const x = 180 + index * 62; return <g key={`fixed-${x}`}><circle cx={x} cy="84" r="27" fill="#94a9c4" stroke="#536b83" strokeWidth="5" /><circle cx={x} cy="84" r="7" fill="#fff" stroke="#536b83" strokeWidth="3" /><text x={x} y="125" textAnchor="middle" fill="#526568" fontSize="11">fixed</text></g> })}
    {Array.from({ length: movablePulleys }, (_, index) => { const x = 300 + index * 62; return <g key={`movable-${x}`}><circle cx={x} cy={movableY} r="27" fill="#d9a441" stroke="#805f1b" strokeWidth="5" /><circle cx={x} cy={movableY} r="7" fill="#fff" stroke="#805f1b" strokeWidth="3" /><text x={x} y={movableY + 42} textAnchor="middle" fill="#526568" fontSize="11">movable</text></g> })}
    <path d={`M 120 84 ${fixedPulleys ? `L ${180 + (fixedPulleys - 1) * 62} 84 ` : ''}Q ${300} ${movableY + 35} ${300 + movablePulleys * 62} ${movableY} L 535 84 L 535 ${loadY}`} fill="none" stroke="#bd6b42" strokeWidth="5" />
    <rect x="505" y={loadY} width="60" height="42" rx="7" fill="#c98b4c" stroke="#7d542b" strokeWidth="4" style={{ transition: 'y .1s linear' }} />
    <text x="535" y={loadY + 26} textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">BOX</text>
    <text x="535" y="232" textAnchor="middle" fill="#526568" fontSize="14">{mass} kg load</text>
    <text x="410" y="112" fill="#526568" fontSize="14">pull rope ↓</text>
    <text x="320" y="248" textAnchor="middle" fill="#526568" fontSize="13">{supportingSegments} supporting rope segment{supportingSegments === 1 ? '' : 's'} · fixed pulleys redirect force only</text>
  </Box>

  return <Box component="svg" viewBox="0 0 640 260" sx={{ width: '100%', minHeight: 230, borderRadius: 2, background: 'linear-gradient(180deg, #edf6ee, #f8f0df)' }} role="img" aria-label={`Ramp set to ${angle} degrees`}>
    <line x1="75" x2="575" y1="210" y2="210" stroke="#8b9c84" strokeWidth="6" />
    <polygon points="115,210 515,210 515,78" fill="#d8e7d3" stroke="#587457" strokeWidth="5" />
    <line x1="180" x2="500" y1="188" y2="92" stroke="#587457" strokeWidth="5" strokeDasharray="8 7" />
    <g style={{ transform: `translate(${rampBoxX}px, ${rampBoxY}px)`, transition: 'transform .1s linear' }}><rect x="0" y="0" width="72" height="48" rx="8" fill="#c98b4c" stroke="#7d542b" strokeWidth="4" /><text x="36" y="30" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">BOX</text></g>
    <text x="320" y="244" textAnchor="middle" fill="#526568" fontSize="14">{angle}° incline · {mass} kg load</text>
    <text x="493" y="74" textAnchor="middle" fill="#526568" fontSize="14">1 m rise</text>
    <line x1="522" x2="522" y1="210" y2="78" stroke="#526568" strokeWidth="2" strokeDasharray="5 5" />
  </Box>
}

const MachinePlaygroundActivity: FC<MachinePlaygroundProps> = ({ onComplete }) => {
  const [roundState, setRoundState] = useState<Round>(createRound)
  const [machine, setMachine] = useState<Machine>('lever')
  const [fulcrum, setFulcrum] = useState(0.42)
  const [fixedPulleys, setFixedPulleys] = useState(1)
  const [movablePulleys, setMovablePulleys] = useState(1)
  const [angle, setAngle] = useState(20)
  const [frictionEnabled, setFrictionEnabled] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [motionProgress, setMotionProgress] = useState(0)
  const [motionRun, setMotionRun] = useState(0)

  const weight = roundState.mass * GRAVITY
  const loadArm = Math.max(.05, fulcrum - 0.2)
  const effortArm = Math.max(.05, 0.8 - fulcrum)
  const supportingSegments = 1 + movablePulleys
  const idealLeverForce = weight * loadArm / effortArm
  const idealPulleyForce = weight / supportingSegments
  const idealRampForce = weight * Math.sin((angle * Math.PI) / 180)
  const idealForce = machine === 'lever' ? idealLeverForce : machine === 'pulley' ? idealPulleyForce : idealRampForce
  const frictionForce = machine === 'ramp' ? frictionCoefficients.ramp * weight * Math.cos((angle * Math.PI) / 180) : idealForce * frictionCoefficients[machine]
  const actualForce = frictionEnabled ? idealForce + frictionForce : idealForce
  const distanceNeeded = machine === 'lever'
    ? LIFT_HEIGHT * (effortArm / loadArm)
    : machine === 'pulley'
      ? LIFT_HEIGHT * supportingSegments
      : LIFT_HEIGHT / Math.sin((angle * Math.PI) / 180)
  const challengeTarget = roundState.targets[machine]
  const completed = feedback === 'correct'
  const speedLabel = machine === 'ramp'
    ? `${round(distanceNeeded)} m of travel for 1 m rise`
    : machine === 'pulley'
      ? `${supportingSegments} rope segments · ${round(distanceNeeded)} m pull`
      : `${round(distanceNeeded)} m effort travel for 1 m lift`

  useEffect(() => {
    if (!motionRun) return
    const duration = Math.max(550, Math.min(2400, 650 + distanceNeeded * 180 + (actualForce / Math.max(weight, 1)) * 250))
    const started = performance.now()
    let frame = 0
    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / duration)
      setMotionProgress(progress)
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [motionRun])

  const changeSetting = (change: () => void) => {
    change()
    setMotionProgress(0)
    setFeedback('idle')
  }
  const applyForce = () => {
    setMotionProgress(0)
    setMotionRun((current) => current + 1)
    setFeedback('idle')
  }
  const reset = () => {
    setRoundState(createRound())
    setMachine('lever')
    setFulcrum(0.42)
    setFixedPulleys(1)
    setMovablePulleys(1)
    setAngle(20)
    setFrictionEnabled(false)
    setMotionProgress(0)
    setFeedback('idle')
  }
  const checkActivity = () => setFeedback(actualForce <= challengeTarget ? 'correct' : 'incorrect')
  const hint = machine === 'lever' ? 'Move the fulcrum toward the load to lengthen the effort arm advantage.' : machine === 'pulley' ? 'Add movable support segments or reduce friction to lower the required effort.' : 'Try making the ramp shallower so the push is spread over more distance.'
  const successMessage = machine === 'lever' ? 'Right! The fulcrum position sets both torque arms.' : machine === 'pulley' ? `Right! ${supportingSegments} rope segments support the moving load.` : 'Right! The ramp trades a smaller force for a longer push.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Machine Playground</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how simple machines make work easier.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>{(['lever', 'pulley', 'ramp'] as Machine[]).map((option) => <Button key={option} variant={machine === option ? 'contained' : 'outlined'} onClick={() => changeSetting(() => setMachine(option))}>{machineNames[option]}</Button>)}</Stack>
      <MachineVisual machine={machine} mass={roundState.mass} fulcrum={fulcrum} fixedPulleys={fixedPulleys} movablePulleys={movablePulleys} angle={angle} motionProgress={motionProgress} frictionEnabled={frictionEnabled} />
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
          <Box><Typography variant="body2" color="text.secondary">Ideal force</Typography><Typography variant="h4" color="primary.main">{round(idealForce)} N</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Actual force with friction</Typography><Typography variant="h4" color={frictionEnabled ? 'warning.main' : 'primary.main'}>{round(actualForce)} N</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Distance of effort</Typography><Typography variant="h5">{round(distanceNeeded)} m</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Load weight</Typography><Typography variant="h5">{round(weight)} N</Typography></Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{frictionEnabled ? `Friction coefficient μ = ${frictionCoefficients[machine]}` : 'Frictionless ideal model'} · {speedLabel}</Typography>
      </Paper>
      {machine === 'lever' && <Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Fulcrum position: {round(fulcrum * 100)}% along the bar</Typography><Slider min={0.31} max={0.66} step={0.01} value={fulcrum} onChange={(_, value) => changeSetting(() => setFulcrum(Array.isArray(value) ? value[0] : value))} valueLabelDisplay="auto" aria-label="Lever fulcrum position" /><Typography variant="caption" color="text.secondary">Torque check: {round(actualForce)} N × {round(effortArm)} m balances {round(weight)} N × {round(loadArm)} m before friction loss.</Typography></Box>}
      {machine === 'pulley' && <Stack spacing={1}><Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Fixed pulleys: {fixedPulleys}</Typography><Slider min={0} max={3} step={1} value={fixedPulleys} onChange={(_, value) => changeSetting(() => setFixedPulleys(Array.isArray(value) ? value[0] : value))} valueLabelDisplay="auto" aria-label="Fixed pulley count" /><Typography variant="caption" color="text.secondary">Fixed pulleys redirect the rope and add no mechanical advantage.</Typography></Box><Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Movable pulleys: {movablePulleys} · Supporting segments: {supportingSegments}</Typography><Slider min={0} max={3} step={1} value={movablePulleys} onChange={(_, value) => changeSetting(() => setMovablePulleys(Array.isArray(value) ? value[0] : value))} valueLabelDisplay="auto" aria-label="Movable pulley count" /><Typography variant="caption" color="text.secondary">Each movable pulley adds one supporting rope segment in this teaching model.</Typography></Box></Stack>}
      {machine === 'ramp' && <Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Ramp angle: {angle}°</Typography><Slider min={10} max={45} step={1} value={angle} onChange={(_, value) => changeSetting(() => setAngle(Array.isArray(value) ? value[0] : value))} valueLabelDisplay="auto" aria-label="Ramp angle" /><Typography variant="caption" color="text.secondary">Ideal force uses F = W sin θ; friction adds μW cos θ along the ramp.</Typography></Box>}
      <Paper elevation={0} sx={{ p: 1.5, backgroundColor: frictionEnabled ? 'warning.light' : 'action.hover', color: frictionEnabled ? 'warning.contrastText' : 'text.secondary' }}><FormControlLabel control={<Switch checked={frictionEnabled} onChange={(event) => changeSetting(() => setFrictionEnabled(event.target.checked))} />} label={<Typography sx={{ fontWeight: 800 }}>Friction</Typography>} /><Typography variant="caption" sx={{ display: 'block' }}>{frictionEnabled ? `Realistic mode: ${machineNames[machine].toLowerCase()} friction increases required force by ${round(frictionForce)} N.` : 'Ideal mode: friction is off and actual force equals ideal force.'}</Typography></Paper>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: completed ? 'success.light' : 'action.hover', color: completed ? 'success.contrastText' : 'text.secondary' }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{motionProgress > 0 && motionProgress < 1 ? 'Applying force — the load is moving.' : `Challenge target: ≤ ${challengeTarget} N actual effort`}</Typography><Typography variant="caption" sx={{ display: 'block', mt: .5 }}>{feedback === 'correct' ? successMessage : `Apply force to watch the ${machine} move. Current effort: ${round(actualForce)} N.`}</Typography></Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={applyForce} startIcon={<PlayArrowIcon />}>Apply force</Button><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
      {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ fontWeight: 700 }}>{hint}</Typography>}
    </Stack>
  </Paper>
}

export default MachinePlaygroundActivity
