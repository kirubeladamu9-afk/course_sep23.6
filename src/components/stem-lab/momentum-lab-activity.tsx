import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import { type FC, type PointerEvent, useEffect, useRef, useState } from 'react'

type BallState = { position: number; velocity: number; mass: number }
type BallId = 'one' | 'two'
type Feedback = 'idle' | 'correct' | 'incorrect'
type Readouts = { velocity: boolean; momentum: boolean; deltaMomentum: boolean; centerOfMass: boolean; kineticEnergy: boolean; values: boolean }
type Challenge = { targetMomentum: number }
export type MomentumLabProps = { onComplete?: () => void }

const TRACK_MIN = 6
const TRACK_MAX = 94
const BALL_RADIUS = 3.8
const BALL_COLORS = { one: '#4c83c3', two: '#e26b56' }
const VELOCITY_COLORS = { one: '#2f6fb2', two: '#bb463b' }
const MOMENTUM_COLORS = { one: '#8e5eb5', two: '#d28b2f' }
const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const createChallenge = (): Challenge => ({ targetMomentum: randomItem([2, 3, 4, 5]) })
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const format = (value: number) => value.toFixed(2)
const momentum = (ball: BallState) => ball.mass * ball.velocity
const kineticEnergy = (ball: BallState) => .5 * ball.mass * ball.velocity * ball.velocity

const Arrow: FC<{ x: number; y: number; length: number; color: string; label: string; dashed?: boolean }> = ({ x, y, length, color, label, dashed }) => <>
  <Box sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${Math.abs(length)}%`, height: 3, backgroundColor: color, transform: `translateY(-50%) scaleX(${length < 0 ? -1 : 1})`, transformOrigin: length < 0 ? 'right' : 'left', borderRadius: 2, borderTop: dashed ? '2px dashed' : 'none', borderColor: color }} />
  <Typography variant="caption" sx={{ position: 'absolute', left: `${x + (length < 0 ? length : length) / 2}%`, top: `${y - 7}%`, transform: 'translateX(-50%)', color, fontWeight: 800, fontSize: 10 }}>{label}</Typography>
</>

const MomentumLabActivity: FC<MomentumLabProps> = ({ onComplete }) => {
  const [challenge, setChallenge] = useState<Challenge>(createChallenge)
  const [ballOne, setBallOne] = useState<BallState>({ position: 27, velocity: 2.5, mass: .5 })
  const [ballTwo, setBallTwo] = useState<BallState>({ position: 73, velocity: -1, mass: 1.5 })
  const [elasticity, setElasticity] = useState(100)
  const [playing, setPlaying] = useState(false)
  const [slow, setSlow] = useState(false)
  const [time, setTime] = useState(0)
  const [collided, setCollided] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [moreData, setMoreData] = useState(false)
  const [readouts, setReadouts] = useState<Readouts>({ velocity: true, momentum: true, deltaMomentum: false, centerOfMass: false, kineticEnergy: false, values: true })
  const lastFrame = useRef<number | null>(null)
  const ballOneRef = useRef(ballOne)
  const ballTwoRef = useRef(ballTwo)
  const playingRef = useRef(playing)
  const collidedRef = useRef(collided)
  const trackRef = useRef<HTMLDivElement>(null)

  ballOneRef.current = ballOne
  ballTwoRef.current = ballTwo
  playingRef.current = playing
  collidedRef.current = collided

  const updateBallVelocity = (id: BallId, event: PointerEvent<HTMLDivElement>) => {
    const bounds = trackRef.current?.getBoundingClientRect()
    if (!bounds) return
    const pointerX = ((event.clientX - bounds.left) / bounds.width) * 100
    const current = id === 'one' ? ballOneRef.current : ballTwoRef.current
    const nextVelocity = clamp((pointerX - current.position) * .14, -8, 8)
    if (id === 'one') setBallOne((value) => ({ ...value, velocity: nextVelocity }))
    else setBallTwo((value) => ({ ...value, velocity: nextVelocity }))
    setFeedback('idle')
  }

  const collide = (first: BallState, second: BallState) => {
    const relativeVelocity = second.velocity - first.velocity
    const impulse = (1 + elasticity / 100) * relativeVelocity / (1 / first.mass + 1 / second.mass)
    const firstVelocity = first.velocity + impulse / first.mass
    const secondVelocity = second.velocity - impulse / second.mass
    const midpoint = (first.position + second.position) / 2
    const separation = BALL_RADIUS * 2 + .5
    return { first: { ...first, position: midpoint - separation / 2, velocity: firstVelocity }, second: { ...second, position: midpoint + separation / 2, velocity: secondVelocity } }
  }

  const advance = (first: BallState, second: BallState, delta: number) => {
    let nextFirst = { ...first, position: first.position + first.velocity * delta }
    let nextSecond = { ...second, position: second.position + second.velocity * delta }
    const touching = nextFirst.position + BALL_RADIUS >= nextSecond.position - BALL_RADIUS
    const shouldCollide = touching && !collidedRef.current && nextFirst.velocity > nextSecond.velocity
    if (shouldCollide) {
      const result = collide(nextFirst, nextSecond)
      nextFirst = result.first
      nextSecond = result.second
    }
    nextFirst.position = clamp(nextFirst.position, TRACK_MIN, TRACK_MAX)
    nextSecond.position = clamp(nextSecond.position, TRACK_MIN, TRACK_MAX)
    return { first: nextFirst, second: nextSecond, touching, didCollide: shouldCollide }
  }

  useEffect(() => {
    let frame = 0
    const tick = (now: number) => {
      const previous = lastFrame.current ?? now
      const delta = Math.min(.032, Math.max(.001, (now - previous) / 1000)) * (slow ? .35 : 1)
      lastFrame.current = now
      if (playingRef.current) {
        const next = advance(ballOneRef.current, ballTwoRef.current, delta)
        if (next.didCollide) setCollided(true)
        if (!next.touching && collidedRef.current) setCollided(false)
        setBallOne(next.first)
        setBallTwo(next.second)
        setTime((current) => current + delta)
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [elasticity, slow])

  const totalMomentumBefore = momentum(ballOne) + momentum(ballTwo)
  const totalMomentumAfter = totalMomentumBefore
  const centerOfMass = (ballOne.mass * ballOne.position + ballTwo.mass * ballTwo.position) / (ballOne.mass + ballTwo.mass)
  const totalKineticEnergy = kineticEnergy(ballOne) + kineticEnergy(ballTwo)
  const targetReached = Math.abs(totalMomentumBefore - challenge.targetMomentum) <= .08
  const completed = feedback === 'correct' && targetReached
  const toggleReadout = (key: keyof Readouts) => setReadouts((current) => ({ ...current, [key]: !current[key] }))
  const setMass = (id: BallId, value: number) => {
    if (id === 'one') setBallOne((current) => ({ ...current, mass: value }))
    else setBallTwo((current) => ({ ...current, mass: value }))
    setFeedback('idle')
  }
  const togglePlay = () => setPlaying((current) => !current)
  const step = () => {
    setPlaying(false)
    const next = advance(ballOneRef.current, ballTwoRef.current, .05)
    if (next.didCollide) setCollided(true)
    if (!next.touching && collidedRef.current) setCollided(false)
    setTime((current) => current + .05)
    setBallOne(next.first)
    setBallTwo(next.second)
  }
  const reset = () => {
    setChallenge(createChallenge())
    setBallOne({ position: 27, velocity: 2.5, mass: .5 })
    setBallTwo({ position: 73, velocity: -1, mass: 1.5 })
    setElasticity(100)
    setPlaying(false)
    setSlow(false)
    setTime(0)
    setCollided(false)
    setFeedback('idle')
    lastFrame.current = null
  }
  const checkActivity = () => setFeedback(targetReached ? 'correct' : 'incorrect')

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Momentum Lab</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how momentum transfers in collisions.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Core" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Set each ball&apos;s mass and initial velocity, then play the collision. Momentum is mass × velocity, and the collision response uses conservation of momentum plus the selected elasticity.</Typography>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>Challenge</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Set the masses and velocities so the total momentum before the collision equals {challenge.targetMomentum.toFixed(0)} kg·m/s.</Typography></Paper>
      <Box ref={trackRef} sx={{ position: 'relative', height: { xs: 250, md: 310 }, border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #f8fbfd, #e9f0f4)', overflow: 'hidden' }}>
        <Typography variant="caption" sx={{ position: 'absolute', top: 14, left: 16, fontWeight: 900, color: '#536776' }}>HORIZONTAL COLLISION TRACK</Typography>
        <Box sx={{ position: 'absolute', left: '6%', right: '6%', top: '58%', borderBottom: '5px solid #7b8d99' }} />
        <Box sx={{ position: 'absolute', left: `${ballOne.position}%`, top: '58%', width: 42, height: 42, transform: 'translate(-50%, -50%)', borderRadius: '50%', backgroundColor: BALL_COLORS.one, border: '4px solid #285781', boxShadow: collided ? '0 0 18px #f0b23e' : '0 6px 0 rgba(40,50,60,.14)', transition: playing ? 'none' : 'left .2s ease' }}><Typography sx={{ display: 'grid', placeItems: 'center', height: '100%', color: 'white', fontWeight: 900 }}>1</Typography></Box>
        <Box sx={{ position: 'absolute', left: `${ballTwo.position}%`, top: '58%', width: 42, height: 42, transform: 'translate(-50%, -50%)', borderRadius: '50%', backgroundColor: BALL_COLORS.two, border: '4px solid #963f38', boxShadow: collided ? '0 0 18px #f0b23e' : '0 6px 0 rgba(40,50,60,.14)', transition: playing ? 'none' : 'left .2s ease' }}><Typography sx={{ display: 'grid', placeItems: 'center', height: '100%', color: 'white', fontWeight: 900 }}>2</Typography></Box>
        {readouts.velocity && <><Arrow x={ballOne.position} y={42} length={ballOne.velocity * 2.5} color={VELOCITY_COLORS.one} label={`v₁ ${format(ballOne.velocity)} m/s`} /><Arrow x={ballTwo.position} y={74} length={ballTwo.velocity * 2.5} color={VELOCITY_COLORS.two} label={`v₂ ${format(ballTwo.velocity)} m/s`} /></>}
        {readouts.momentum && <><Arrow x={ballOne.position} y={49} length={momentum(ballOne) * 2.5} color={MOMENTUM_COLORS.one} label={`p₁ ${format(momentum(ballOne))}`} dashed /><Arrow x={ballTwo.position} y={67} length={momentum(ballTwo) * 2.5} color={MOMENTUM_COLORS.two} label={`p₂ ${format(momentum(ballTwo))}`} dashed /></>}
        {readouts.centerOfMass && <><Box sx={{ position: 'absolute', left: `${centerOfMass}%`, top: '18%', bottom: '27%', borderLeft: '2px dashed #6e5ba6' }} /><Typography variant="caption" sx={{ position: 'absolute', left: `${centerOfMass}%`, top: '12%', transform: 'translateX(-50%)', color: '#6e5ba6', fontWeight: 800 }}>center of mass</Typography></>}
        <Box component="div" role="slider" tabIndex={0} aria-label="Ball 1 initial velocity tip" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); updateBallVelocity('one', event) }} onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && updateBallVelocity('one', event)} onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)} sx={{ position: 'absolute', left: `${ballOne.position + ballOne.velocity * 2.5}%`, top: '36%', width: 18, height: 18, borderRadius: '50%', backgroundColor: VELOCITY_COLORS.one, cursor: 'grab', transform: 'translate(-50%, -50%)', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' } }} />
        <Box component="div" role="slider" tabIndex={0} aria-label="Ball 2 initial velocity tip" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); updateBallVelocity('two', event) }} onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && updateBallVelocity('two', event)} onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)} sx={{ position: 'absolute', left: `${ballTwo.position + ballTwo.velocity * 2.5}%`, top: '79%', width: 18, height: 18, borderRadius: '50%', backgroundColor: VELOCITY_COLORS.two, cursor: 'grab', transform: 'translate(-50%, -50%)', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' } }} />
        {readouts.values && <Stack direction="row" spacing={1} sx={{ position: 'absolute', bottom: 10, left: 16 }}><Typography variant="caption" sx={{ fontWeight: 800 }}>t = {time.toFixed(2)} s</Typography><Typography variant="caption" color="text.secondary">Elasticity: {elasticity}%</Typography></Stack>}
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {([{ id: 'one' as BallId, ball: ballOne, color: BALL_COLORS.one, label: 'Ball 1' }, { id: 'two' as BallId, ball: ballTwo, color: BALL_COLORS.two, label: 'Ball 2' }]).map(({ id, ball, color, label }) => <Paper key={id} elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: color }}><Typography sx={{ fontWeight: 800, color }}>{label} · Mass (kg)</Typography><TextField fullWidth size="small" type="number" value={ball.mass} onChange={(event) => setMass(id, clamp(Number(event.target.value), .1, 5))} inputProps={{ min: .1, max: 5, step: .1, 'aria-label': `${label} mass in kilograms` }} sx={{ mt: 1 }} /><Slider min={.1} max={5} step={.1} value={ball.mass} onChange={(_, value) => setMass(id, Array.isArray(value) ? value[0] : value)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(2)} kg`} aria-label={`${label} mass`} /><Typography variant="caption" color="text.secondary">Drag the colored velocity tip on the track to set {label.toLowerCase()} velocity.</Typography></Paper>)}
      </Stack>
      <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography sx={{ fontWeight: 800 }}>Elasticity: {elasticity}%</Typography><Slider min={0} max={100} step={1} value={elasticity} onChange={(_, value) => setElasticity(Array.isArray(value) ? value[0] : value)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${value}%`} aria-label="Elasticity" /><Stack direction="row" justifyContent="space-between"><Typography variant="caption">0% · balls stick</Typography><Typography variant="caption">100% · elastic bounce</Typography></Stack></Paper>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch"><Paper elevation={0} sx={{ p: 1.5, flex: 1, backgroundColor: 'action.hover' }}><Typography sx={{ fontWeight: 800, mb: .75 }}>More Data</Typography><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Chip label={`p before: ${format(totalMomentumBefore)} kg·m/s`} /><Chip label={`p after: ${format(totalMomentumAfter)} kg·m/s`} variant="outlined" />{readouts.kineticEnergy && <Chip label={`Kinetic energy: ${format(totalKineticEnergy)} J`} />}{readouts.deltaMomentum && <Chip label={`Δp total: ${format(totalMomentumAfter - totalMomentumBefore)} kg·m/s`} />} </Stack>{moreData && <Stack spacing={.25} sx={{ mt: 1 }}><Typography variant="caption">Ball 1 · position {format(ballOne.position)}% · velocity {format(ballOne.velocity)} m/s · momentum {format(momentum(ballOne))} kg·m/s</Typography><Typography variant="caption">Ball 2 · position {format(ballTwo.position)}% · velocity {format(ballTwo.velocity)} m/s · momentum {format(momentum(ballTwo))} kg·m/s</Typography><Typography variant="caption">Center of mass: {format(centerOfMass)}%</Typography></Stack>}</Paper><Button variant="outlined" onClick={() => setMoreData((current) => !current)}>{moreData ? 'Hide More Data' : 'More Data'}</Button></Stack>
      <Paper elevation={0} sx={{ p: 1.5, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}><Typography variant="subtitle2" sx={{ fontWeight: 800, mb: .5 }}>Show on the lab</Typography><Stack direction="row" flexWrap="wrap" useFlexGap><FormControlLabel control={<Checkbox checked={readouts.velocity} onChange={() => toggleReadout('velocity')} size="small" />} label="Velocity" /><FormControlLabel control={<Checkbox checked={readouts.momentum} onChange={() => toggleReadout('momentum')} size="small" />} label="Momentum" /><FormControlLabel control={<Checkbox checked={readouts.deltaMomentum} onChange={() => toggleReadout('deltaMomentum')} size="small" />} label="Change in Momentum" /><FormControlLabel control={<Checkbox checked={readouts.centerOfMass} onChange={() => toggleReadout('centerOfMass')} size="small" />} label="Center of Mass" /><FormControlLabel control={<Checkbox checked={readouts.kineticEnergy} onChange={() => toggleReadout('kineticEnergy')} size="small" />} label="Kinetic Energy" /><FormControlLabel control={<Checkbox checked={readouts.values} onChange={() => toggleReadout('values')} size="small" />} label="Values" /></Stack></Paper>
      {feedback === 'correct' && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: 'success.main', animation: 'momentumCelebrate .7s ease', '@keyframes momentumCelebrate': { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.025)' }, '100%': { transform: 'scale(1)' } } }}><Typography color="success.main" sx={{ fontWeight: 800 }}>Right! Momentum is conserved — the total before and after the collision stays the same.</Typography><Typography variant="body2" color="text.secondary">The selected masses and velocities produce {challenge.targetMomentum.toFixed(0)} kg·m/s of total momentum before the collision.</Typography></Paper>}
      {feedback === 'incorrect' && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'warning.main' }}><Typography color="warning.dark" sx={{ fontWeight: 700 }}>{totalMomentumBefore < challenge.targetMomentum ? 'Hint: Increase one ball’s mass or give a ball more velocity in its current direction.' : 'Hint: Reduce a mass or adjust one velocity to bring the total momentum closer.'}</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={togglePlay} startIcon={<PlayArrowIcon />}>{playing ? 'Pause' : 'Play'}</Button><Button variant="outlined" onClick={step} startIcon={<SkipNextIcon />}>Step</Button><ToggleButtonGroup exclusive value={slow ? 'slow' : 'normal'} onChange={(_, value: 'normal' | 'slow' | null) => value && setSlow(value === 'slow')} size="small" aria-label="Simulation speed"><ToggleButton value="normal">Normal</ToggleButton><ToggleButton value="slow">Slow</ToggleButton></ToggleButtonGroup><Button variant="outlined" onClick={checkActivity} disabled={playing}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default MomentumLabActivity
