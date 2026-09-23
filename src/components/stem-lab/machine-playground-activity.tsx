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
type Feedback = 'idle' | 'correct' | 'incorrect'

type Round = {
  mass: number
  target: number
}

const GRAVITY = 9.81
const LIFT_HEIGHT = 1
const FRICTION_COEFFICIENT = .12
const round = (value: number) => Math.round(value * 10) / 10
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
const createRound = (): Round => {
  const mass = randomInt(35, 85)
  const weight = mass * GRAVITY
  return {
    mass,
    target: randomInt(Math.max(8, Math.round(weight * 0.16)), Math.max(12, Math.round(weight * 0.32))),
  }
}

const MachineVisual: FC<{ mass: number; fulcrum: number; motionProgress: number }> = ({ mass, fulcrum, motionProgress }) => {
  const weight = mass * GRAVITY
  const loadArm = Math.max(.05, fulcrum - .2)
  const effortArm = Math.max(.05, .8 - fulcrum)
  const leverForce = weight * loadArm / effortArm
  const leverTilt = Math.max(-12, Math.min(12, (weight - leverForce) * 0.18))
  const leverLift = motionProgress * 38

  return <Box component="svg" viewBox="0 0 640 260" sx={{ width: '100%', minHeight: 230, borderRadius: 2, background: 'linear-gradient(180deg, #e7f4f5, #f6f0df)' }} role="img" aria-label="Seesaw lever with adjustable fulcrum">
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
}

const MachinePlaygroundActivity: FC<MachinePlaygroundProps> = ({ onComplete }) => {
  const [roundState, setRoundState] = useState<Round>(createRound)
  const [fulcrum, setFulcrum] = useState(0.42)
  const [frictionEnabled, setFrictionEnabled] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [motionProgress, setMotionProgress] = useState(0)
  const [motionRun, setMotionRun] = useState(0)

  const weight = roundState.mass * GRAVITY
  const loadArm = Math.max(.05, fulcrum - 0.2)
  const effortArm = Math.max(.05, 0.8 - fulcrum)
  const idealForce = weight * loadArm / effortArm
  const frictionForce = idealForce * FRICTION_COEFFICIENT
  const actualForce = frictionEnabled ? idealForce + frictionForce : idealForce
  const distanceNeeded = LIFT_HEIGHT * (effortArm / loadArm)
  const challengeTarget = roundState.target
  const completed = feedback === 'correct'
  const speedLabel = `${round(distanceNeeded)} m effort travel for 1 m lift`

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
    setFulcrum(0.42)
    setFrictionEnabled(false)
    setMotionProgress(0)
    setFeedback('idle')
  }
  const checkActivity = () => setFeedback(actualForce <= challengeTarget ? 'correct' : 'incorrect')
  const hint = 'Move the fulcrum toward the load to lengthen the effort arm advantage.'
  const successMessage = 'Right! The fulcrum position sets both torque arms.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Machine Playground</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how simple machines make work easier.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <MachineVisual mass={roundState.mass} fulcrum={fulcrum} motionProgress={motionProgress} />
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
          <Box><Typography variant="body2" color="text.secondary">Ideal force</Typography><Typography variant="h4" color="primary.main">{round(idealForce)} N</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Actual force with friction</Typography><Typography variant="h4" color={frictionEnabled ? 'warning.main' : 'primary.main'}>{round(actualForce)} N</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Distance of effort</Typography><Typography variant="h5">{round(distanceNeeded)} m</Typography></Box>
          <Box><Typography variant="body2" color="text.secondary">Load weight</Typography><Typography variant="h5">{round(weight)} N</Typography></Box>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{frictionEnabled ? `Friction coefficient μ = ${FRICTION_COEFFICIENT}` : 'Frictionless ideal model'} · {speedLabel}</Typography>
      </Paper>
      <Box><Typography variant="body2" sx={{ fontWeight: 700 }}>Fulcrum position: {round(fulcrum * 100)}% along the bar</Typography><Slider min={0.31} max={0.66} step={0.01} value={fulcrum} onChange={(_, value) => changeSetting(() => setFulcrum(Array.isArray(value) ? value[0] : value))} valueLabelDisplay="auto" aria-label="Lever fulcrum position" /><Typography variant="caption" color="text.secondary">Torque check: {round(actualForce)} N × {round(effortArm)} m balances {round(weight)} N × {round(loadArm)} m before friction loss.</Typography></Box>
      <Paper elevation={0} sx={{ p: 1.5, backgroundColor: frictionEnabled ? 'warning.light' : 'action.hover', color: frictionEnabled ? 'warning.contrastText' : 'text.secondary' }}><FormControlLabel control={<Switch checked={frictionEnabled} onChange={(event) => changeSetting(() => setFrictionEnabled(event.target.checked))} />} label={<Typography sx={{ fontWeight: 800 }}>Friction</Typography>} /><Typography variant="caption" sx={{ display: 'block' }}>{frictionEnabled ? `Realistic mode: lever friction increases required force by ${round(frictionForce)} N.` : 'Ideal mode: friction is off and actual force equals ideal force.'}</Typography></Paper>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: completed ? 'success.light' : 'action.hover', color: completed ? 'success.contrastText' : 'text.secondary' }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{motionProgress > 0 && motionProgress < 1 ? 'Applying force — the load is moving.' : `Challenge target: ≤ ${challengeTarget} N actual effort`}</Typography><Typography variant="caption" sx={{ display: 'block', mt: .5 }}>{feedback === 'correct' ? successMessage : `Apply force to watch the lever move. Current effort: ${round(actualForce)} N.`}</Typography></Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={applyForce} startIcon={<PlayArrowIcon />}>Apply force</Button><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
      {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ fontWeight: 700 }}>{hint}</Typography>}
    </Stack>
  </Paper>
}

export default MachinePlaygroundActivity
