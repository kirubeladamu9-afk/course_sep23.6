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
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import { type FC, type PointerEvent, useEffect, useRef, useState } from 'react'

export type CollisionPlaygroundProps = { onComplete?: () => void }
type LawMode = 'first' | 'second' | 'third'
type BallId = 'one' | 'two'
type Feedback = 'idle' | 'correct' | 'incorrect'
type MassOption = { id: string; name: string; mass: number; color: string }
type BallState = { position: number; velocity: number; mass: number }
type Challenge = { target: number }
type Readouts = { velocity: boolean; momentum: boolean; deltaMomentum: boolean; centerOfMass: boolean; kineticEnergy: boolean; values: boolean }

type AdvanceResult = { first: BallState; second: BallState; touching: boolean; didCollide: boolean; impulse: number }
const MASS_OPTIONS: MassOption[] = [
  { id: 'box', name: 'Light box', mass: 2, color: '#e3a15e' },
  { id: 'crate', name: 'Medium crate', mass: 5, color: '#b97845' },
  { id: 'fridge', name: 'Heavy fridge', mass: 12, color: '#8ca1aa' },
]
const TRACK_START = 2
const TRACK_END = 22
const BALL_RADIUS = .75
const COLLISION_TIME = .08
const randomItem = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)]
const createChallenge = (mode: LawMode): Challenge => ({ target: mode === 'first' ? randomItem([2, 3, 4]) : mode === 'second' ? randomItem([3, 5, 7]) : randomItem([2, 3, 4, 5]) })
const initialBalls = (mode: LawMode): { one: BallState; two: BallState } => mode === 'first'
  ? { one: { position: 7, velocity: 3, mass: 2 }, two: { position: 18, velocity: 0, mass: 2 } }
  : mode === 'second'
    ? { one: { position: 7, velocity: 0, mass: 2 }, two: { position: 18, velocity: 0, mass: 2 } }
    : { one: { position: 7, velocity: 2.5, mass: .5 }, two: { position: 18, velocity: -1, mass: 1.5 } }
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const format = (value: number) => value.toFixed(2)
const momentum = (ball: BallState) => ball.mass * ball.velocity
const kineticEnergy = (ball: BallState) => .5 * ball.mass * ball.velocity * ball.velocity
const modeLabel: Record<LawMode, string> = { first: 'First Law (Inertia)', second: 'Second Law (F = ma)', third: 'Third Law (Action-Reaction)' }
const modePrompt: Record<LawMode, string> = {
  first: 'No force is acting — the ball keeps moving at a constant speed.',
  second: 'Apply a force to Ball 1 and compare how its mass changes acceleration.',
  third: 'Play the collision and watch equal-and-opposite forces appear at impact.',
}

const Arrow: FC<{ x: number; y: number; length: number; color: string; label: string; dashed?: boolean }> = ({ x, y, length, color, label, dashed }) => <>
  <Box sx={{ position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${Math.abs(length)}%`, height: dashed ? 0 : 3, borderTop: dashed ? `2px dashed ${color}` : 'none', backgroundColor: dashed ? 'transparent' : color, transform: `translateY(-50%) scaleX(${length < 0 ? -1 : 1})`, transformOrigin: length < 0 ? 'right' : 'left', borderRadius: 2 }} />
  <Typography variant="caption" sx={{ position: 'absolute', left: `${x + length / 2}%`, top: `${y - 7}%`, transform: 'translateX(-50%)', color, fontWeight: 800, fontSize: 10 }}>{label}</Typography>
</>

const Team = ({ side }: { side: 'left' | 'right' }) => <Stack alignItems={side === 'left' ? 'flex-end' : 'flex-start'} spacing={.5} sx={{ width: { xs: 90, sm: 118 } }}><Typography variant="caption" sx={{ fontWeight: 900, color: side === 'left' ? '#336d82' : '#a34d43' }}>{side === 'left' ? 'LAW 1' : 'LAW 2/3'}</Typography><Stack direction={side === 'left' ? 'row-reverse' : 'row'} spacing={.5}>{[0, 1, 2].map((member) => <Box key={member} sx={{ position: 'relative', width: 24, height: 42 }}><Box sx={{ position: 'absolute', left: 6, top: 0, width: 12, height: 12, borderRadius: '50%', backgroundColor: side === 'left' ? '#62a9bf' : '#de755f', border: '2px solid #fff' }} /><Box sx={{ position: 'absolute', left: 2, top: 13, width: 20, height: 27, borderRadius: '10px 10px 4px 4px', backgroundColor: side === 'left' ? '#397f98' : '#b95248' }} /></Box>)}</Stack></Stack>

const CollisionPlaygroundActivity: FC<CollisionPlaygroundProps> = ({ onComplete }) => {
  const [mode, setMode] = useState<LawMode>('third')
  const initial = initialBalls('third')
  const [challenge, setChallenge] = useState<Challenge>(() => createChallenge('third'))
  const [ballOne, setBallOne] = useState<BallState>(initial.one)
  const [ballTwo, setBallTwo] = useState<BallState>(initial.two)
  const [elasticity, setElasticity] = useState(100)
  const [appliedForce, setAppliedForce] = useState(20)
  const [playing, setPlaying] = useState(false)
  const [slow, setSlow] = useState(false)
  const [time, setTime] = useState(0)
  const [collisionHappened, setCollisionHappened] = useState(false)
  const [impactImpulse, setImpactImpulse] = useState(0)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [moreData, setMoreData] = useState(false)
  const [readouts, setReadouts] = useState<Readouts>({ velocity: true, momentum: true, deltaMomentum: false, centerOfMass: false, kineticEnergy: false, values: true })
  const lastFrame = useRef<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const ballOneRef = useRef(ballOne)
  const ballTwoRef = useRef(ballTwo)
  const playingRef = useRef(playing)
  const collisionRef = useRef(collisionHappened)

  ballOneRef.current = ballOne
  ballTwoRef.current = ballTwo
  playingRef.current = playing
  collisionRef.current = collisionHappened

  const resetForMode = (nextMode: LawMode) => {
    const next = initialBalls(nextMode)
    setMode(nextMode)
    setChallenge(createChallenge(nextMode))
    setBallOne(next.one)
    setBallTwo(next.two)
    setPlaying(false)
    setTime(0)
    setCollisionHappened(false)
    setImpactImpulse(0)
    setFeedback('idle')
    lastFrame.current = null
  }

  const resolveCollision = (first: BallState, second: BallState) => {
    const relativeVelocity = second.velocity - first.velocity
    const impulse = (1 + elasticity / 100) * relativeVelocity / (1 / first.mass + 1 / second.mass)
    const midpoint = (first.position + second.position) / 2
    const separation = BALL_RADIUS * 2 + .12
    return { first: { ...first, position: midpoint - separation / 2, velocity: first.velocity + impulse / first.mass }, second: { ...second, position: midpoint + separation / 2, velocity: second.velocity - impulse / second.mass }, impulse }
  }

  const advance = (first: BallState, second: BallState, delta: number): AdvanceResult => {
    const acceleration = mode === 'second' ? appliedForce / first.mass : 0
    let nextFirst = { ...first, position: first.position + first.velocity * delta + .5 * acceleration * delta * delta, velocity: first.velocity + acceleration * delta }
    let nextSecond = { ...second, position: second.position + second.velocity * delta }
    const touching = nextFirst.position + BALL_RADIUS >= nextSecond.position - BALL_RADIUS
    const shouldCollide = mode === 'third' && touching && !collisionRef.current && nextFirst.velocity > nextSecond.velocity
    let impulse = 0
    if (shouldCollide) {
      const result = resolveCollision(nextFirst, nextSecond)
      nextFirst = result.first
      nextSecond = result.second
      impulse = result.impulse
    }
    nextFirst.position = clamp(nextFirst.position, TRACK_START, TRACK_END)
    nextSecond.position = clamp(nextSecond.position, TRACK_START, TRACK_END)
    return { first: nextFirst, second: nextSecond, touching, didCollide: shouldCollide, impulse }
  }

  useEffect(() => {
    let frame = 0
    const tick = (now: number) => {
      const previous = lastFrame.current ?? now
      const delta = Math.min(.032, Math.max(.001, (now - previous) / 1000)) * (slow ? .35 : 1)
      lastFrame.current = now
      if (playingRef.current) {
        const next = advance(ballOneRef.current, ballTwoRef.current, delta)
        if (next.didCollide) {
          setCollisionHappened(true)
          setImpactImpulse(next.impulse)
        }
        if (!next.touching && collisionRef.current) setCollisionHappened(false)
        setBallOne(next.first)
        setBallTwo(next.second)
        setTime((current) => current + delta)
      }
      frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [mode, appliedForce, elasticity, slow])

  const trackPosition = (position: number) => 8 + ((position - TRACK_START) / (TRACK_END - TRACK_START)) * 84
  const pointerPosition = (event: PointerEvent<HTMLDivElement>) => {
    const bounds = trackRef.current?.getBoundingClientRect()
    return bounds ? 8 + ((event.clientX - bounds.left) / bounds.width) * 84 : 50
  }
  const setVelocityFromPointer = (id: BallId, event: PointerEvent<HTMLDivElement>) => {
    const current = id === 'one' ? ballOneRef.current : ballTwoRef.current
    const pointerWorld = TRACK_START + ((pointerPosition(event) - 8) / 84) * (TRACK_END - TRACK_START)
    const nextVelocity = clamp((pointerWorld - current.position) * .55, -8, 8)
    if (id === 'one') setBallOne((value) => ({ ...value, velocity: nextVelocity }))
    else setBallTwo((value) => ({ ...value, velocity: nextVelocity }))
    setFeedback('idle')
  }
  const toggleReadout = (key: keyof Readouts) => setReadouts((current) => ({ ...current, [key]: !current[key] }))
  const changeMass = (id: BallId, mass: number) => {
    if (id === 'one') setBallOne((value) => ({ ...value, mass }))
    else setBallTwo((value) => ({ ...value, mass }))
    setFeedback('idle')
  }
  const step = () => {
    setPlaying(false)
    const next = advance(ballOneRef.current, ballTwoRef.current, .05)
    if (next.didCollide) { setCollisionHappened(true); setImpactImpulse(next.impulse) }
    if (!next.touching && collisionRef.current) setCollisionHappened(false)
    setBallOne(next.first)
    setBallTwo(next.second)
    setTime((current) => current + .05)
  }
  const reset = () => resetForMode(mode)

  const totalMomentum = momentum(ballOne) + momentum(ballTwo)
  const totalKineticEnergy = kineticEnergy(ballOne) + kineticEnergy(ballTwo)
  const centerOfMass = (ballOne.mass * ballOne.position + ballTwo.mass * ballTwo.position) / (ballOne.mass + ballTwo.mass)
  const acceleration = appliedForce / ballOne.mass
  const speed = Math.abs(ballOne.velocity)
  const targetReached = mode === 'first'
    ? time >= 1 && Math.abs(speed - challenge.target) <= .1
    : mode === 'second'
      ? time >= 1 && Math.abs(acceleration - challenge.target) <= .1
      : collisionHappened && Math.abs(totalMomentum - challenge.target) <= .08
  const completed = feedback === 'correct' && targetReached
  const checkDisabled = mode === 'first' ? time < 1 : mode === 'second' ? time < 1 : !collisionHappened
  const modeDescription = mode === 'first' ? 'Friction is removed. A moving ball continues at constant velocity because no net force acts on it.' : mode === 'second' ? 'A force acts on Ball 1. Its acceleration is calculated live as force ÷ mass.' : 'The balls collide and exchange momentum according to their masses, velocities, and elasticity.'

  const checkActivity = () => setFeedback(targetReached ? 'correct' : 'incorrect')
  const hint = mode === 'first' ? 'Hint: Drag Ball 1’s velocity arrow and let it run with no force acting.' : mode === 'second' ? 'Hint: Increase the applied force or choose a lighter Ball 1 to raise acceleration.' : collisionHappened ? 'Hint: Adjust a ball’s mass or velocity so the total momentum before impact moves toward the target.' : 'Hint: Start the collision and let both balls meet before checking the result.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Collision Playground</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how force, mass, and motion relate.</Typography></Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Core" variant="outlined" size="small" /></Stack>
      <ToggleButtonGroup exclusive value={mode} onChange={(_, next: LawMode | null) => next && resetForMode(next)} fullWidth aria-label="Newton law mode"><ToggleButton value="first">First Law (Inertia)</ToggleButton><ToggleButton value="second">Second Law (F = ma)</ToggleButton><ToggleButton value="third">Third Law (Action-Reaction)</ToggleButton></ToggleButtonGroup>
      <Paper elevation={0} sx={{ p: 1.5, backgroundColor: 'primary.light' }}><Typography sx={{ fontWeight: 800 }}>{modeLabel[mode]}</Typography><Typography variant="body2" sx={{ mt: .5 }}>{modeDescription}</Typography><Typography variant="body2" sx={{ mt: .75, fontWeight: 700 }}>{modePrompt[mode]}</Typography></Paper>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>Challenge</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{mode === 'first' ? `Set Ball 1’s speed to ${challenge.target} m/s and observe constant motion for at least one second.` : mode === 'second' ? `Set the force and mass so Ball 1 accelerates at ${challenge.target} m/s².` : `Set the masses and velocities so total momentum before collision equals ${challenge.target} kg·m/s, then collide the balls.`}</Typography></Paper>
      <Box ref={trackRef} sx={{ position: 'relative', height: { xs: 285, md: 330 }, border: 1, borderColor: feedback === 'correct' ? 'success.main' : 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #f8fbfd, #e9f0f4)', overflow: 'hidden' }}>
        <Typography variant="caption" sx={{ position: 'absolute', top: 14, left: 16, fontWeight: 900, color: '#536776' }}>TWO-BALL COLLISION TRACK</Typography>
        <Box sx={{ position: 'absolute', left: '6%', right: '6%', top: '62%', borderBottom: '5px solid #7b8d99' }} />
        <Box sx={{ position: 'absolute', left: '50%', top: '55%', height: 48, borderLeft: '2px dashed #c49438' }}><Typography variant="caption" sx={{ position: 'absolute', top: 48, left: '50%', transform: 'translateX(-50%)', color: '#896d2d', fontWeight: 800 }}>center</Typography></Box>
        <Typography variant="caption" sx={{ position: 'absolute', top: 40, right: 16, fontWeight: 800, color: '#536776' }}>Time: {time.toFixed(2)} s</Typography>
        <Box sx={{ position: 'absolute', left: `${trackPosition(ballOne.position)}%`, top: '62%', width: 42, height: 42, transform: 'translate(-50%, -50%)', borderRadius: '50%', backgroundColor: '#4c83c3', border: '4px solid #285781', boxShadow: collisionHappened ? '0 0 18px #f0b23e' : '0 6px 0 rgba(40,50,60,.14)', transition: playing ? 'none' : 'left .2s ease' }}><Typography sx={{ display: 'grid', placeItems: 'center', height: '100%', color: 'white', fontWeight: 900 }}>1</Typography></Box>
        <Box sx={{ position: 'absolute', left: `${trackPosition(ballTwo.position)}%`, top: '62%', width: 42, height: 42, transform: 'translate(-50%, -50%)', borderRadius: '50%', backgroundColor: '#e26b56', border: '4px solid #963f38', boxShadow: collisionHappened ? '0 0 18px #f0b23e' : '0 6px 0 rgba(40,50,60,.14)', transition: playing ? 'none' : 'left .2s ease' }}><Typography sx={{ display: 'grid', placeItems: 'center', height: '100%', color: 'white', fontWeight: 900 }}>2</Typography></Box>
        {readouts.velocity && <><Arrow x={trackPosition(ballOne.position)} y={43} length={ballOne.velocity * 3} color="#2f6fb2" label={`v₁ ${format(ballOne.velocity)} m/s`} /><Arrow x={trackPosition(ballTwo.position)} y={80} length={ballTwo.velocity * 3} color="#bb463b" label={`v₂ ${format(ballTwo.velocity)} m/s`} /></>}
        {readouts.momentum && <><Arrow x={trackPosition(ballOne.position)} y={51} length={momentum(ballOne) * 3} color="#8e5eb5" label={`p₁ ${format(momentum(ballOne))}`} dashed /><Arrow x={trackPosition(ballTwo.position)} y={72} length={momentum(ballTwo) * 3} color="#d28b2f" label={`p₂ ${format(momentum(ballTwo))}`} dashed /></>}
        {mode === 'second' && <><Arrow x={trackPosition(ballOne.position)} y={32} length={appliedForce / 35} color="#d04b42" label={`F ${appliedForce.toFixed(0)} N`} /><Typography variant="caption" sx={{ position: 'absolute', left: 16, top: 64, color: '#7d423d', fontWeight: 800 }}>{appliedForce.toFixed(0)} N ÷ {ballOne.mass.toFixed(1)} kg = {acceleration.toFixed(2)} m/s² acceleration</Typography></>}
        {mode === 'third' && collisionHappened && <><Arrow x={trackPosition(ballOne.position)} y={31} length={impactImpulse / 10} color="#d04b42" label={`Force on Ball 1: ${(impactImpulse / COLLISION_TIME).toFixed(1)} N`} /><Arrow x={trackPosition(ballTwo.position)} y={91} length={-impactImpulse / 10} color="#d04b42" label={`Force on Ball 2: ${(-impactImpulse / COLLISION_TIME).toFixed(1)} N`} /></>}
        {readouts.centerOfMass && <><Box sx={{ position: 'absolute', left: `${trackPosition(centerOfMass)}%`, top: '20%', bottom: '29%', borderLeft: '2px dashed #6e5ba6' }} /><Typography variant="caption" sx={{ position: 'absolute', left: `${trackPosition(centerOfMass)}%`, top: '14%', transform: 'translateX(-50%)', color: '#6e5ba6', fontWeight: 800 }}>center of mass</Typography></>}
        <Box component="div" role="slider" tabIndex={0} aria-label="Ball 1 velocity arrow tip" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setVelocityFromPointer('one', event) }} onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && setVelocityFromPointer('one', event)} onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)} sx={{ position: 'absolute', left: `${trackPosition(ballOne.position) + ballOne.velocity * 3}%`, top: '43%', width: 18, height: 18, borderRadius: '50%', backgroundColor: '#2f6fb2', cursor: 'grab', transform: 'translate(-50%, -50%)', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' } }} />
        <Box component="div" role="slider" tabIndex={0} aria-label="Ball 2 velocity arrow tip" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setVelocityFromPointer('two', event) }} onPointerMove={(event) => event.currentTarget.hasPointerCapture(event.pointerId) && setVelocityFromPointer('two', event)} onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)} sx={{ position: 'absolute', left: `${trackPosition(ballTwo.position) + ballTwo.velocity * 3}%`, top: '80%', width: 18, height: 18, borderRadius: '50%', backgroundColor: '#bb463b', cursor: 'grab', transform: 'translate(-50%, -50%)', '&:focus-visible': { outline: '3px solid', outlineColor: 'primary.main' } }} />
        {readouts.values && <Typography variant="caption" sx={{ position: 'absolute', left: 16, bottom: 12, fontWeight: 800 }}>Values · Ball 1: {format(ballOne.velocity)} m/s · Ball 2: {format(ballTwo.velocity)} m/s</Typography>}
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>{([{ id: 'one' as BallId, ball: ballOne, color: '#4c83c3', label: 'Ball 1' }, { id: 'two' as BallId, ball: ballTwo, color: '#e26b56', label: 'Ball 2' }]).map(({ id, ball, color, label }) => <Paper key={id} elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: color }}><Typography sx={{ color, fontWeight: 800 }}>{label} · Mass (kg)</Typography><TextField fullWidth size="small" type="number" value={ball.mass} onChange={(event) => changeMass(id, clamp(Number(event.target.value), .1, 12))} inputProps={{ min: .1, max: 12, step: .1, 'aria-label': `${label} mass in kilograms` }} sx={{ mt: 1 }} /><Slider min={.1} max={12} step={.1} value={ball.mass} onChange={(_, value) => changeMass(id, Array.isArray(value) ? value[0] : value)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(2)} kg`} aria-label={`${label} mass`} /><Typography variant="caption" color="text.secondary">Drag the colored velocity tip to set the initial velocity.</Typography></Paper>)}</Stack>
      {mode === 'second' && <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography sx={{ fontWeight: 800 }}>Applied Force: {appliedForce.toFixed(0)} N</Typography><Slider min={0} max={100} step={1} value={appliedForce} onChange={(_, value) => { setAppliedForce(Array.isArray(value) ? value[0] : value); setFeedback('idle') }} valueLabelDisplay="auto" valueLabelFormat={(value) => `${value} N`} aria-label="Applied Force" /></Paper>}
      <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography sx={{ fontWeight: 800 }}>Elasticity: {elasticity}%</Typography><Slider min={0} max={100} step={1} value={elasticity} onChange={(_, value) => setElasticity(Array.isArray(value) ? value[0] : value)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${value}%`} aria-label="Elasticity" /><Stack direction="row" justifyContent="space-between"><Typography variant="caption">0% · inelastic / stick</Typography><Typography variant="caption">100% · elastic / bounce</Typography></Stack></Paper>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch"><Paper elevation={0} sx={{ p: 1.5, flex: 1, backgroundColor: 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>More Data</Typography><Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: .75 }}><Chip label={`Total momentum: ${format(totalMomentum)} kg·m/s`} color="primary" /><Chip label={`Kinetic energy: ${format(totalKineticEnergy)} J`} variant="outlined" />{readouts.deltaMomentum && <Chip label={`Change in momentum: ${format(impactImpulse)} kg·m/s`} />}</Stack>{moreData && <Stack spacing={.25} sx={{ mt: 1 }}><Typography variant="caption">Ball 1 · position {format(ballOne.position)} m · velocity {format(ballOne.velocity)} m/s · momentum {format(momentum(ballOne))} kg·m/s</Typography><Typography variant="caption">Ball 2 · position {format(ballTwo.position)} m · velocity {format(ballTwo.velocity)} m/s · momentum {format(momentum(ballTwo))} kg·m/s</Typography><Typography variant="caption">Center of mass: {format(centerOfMass)} m · time: {time.toFixed(2)} s</Typography></Stack>}</Paper><Button variant="outlined" onClick={() => setMoreData((current) => !current)}>{moreData ? 'Hide More Data' : 'More Data'}</Button></Stack>
      <Paper elevation={0} sx={{ p: 1.5, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Settings</Typography><Stack direction="row" flexWrap="wrap" useFlexGap><FormControlLabel control={<Checkbox checked={readouts.velocity} onChange={() => toggleReadout('velocity')} size="small" />} label="Velocity" /><FormControlLabel control={<Checkbox checked={readouts.momentum} onChange={() => toggleReadout('momentum')} size="small" />} label="Momentum" /><FormControlLabel control={<Checkbox checked={readouts.deltaMomentum} onChange={() => toggleReadout('deltaMomentum')} size="small" />} label="Change in Momentum" /><FormControlLabel control={<Checkbox checked={readouts.centerOfMass} onChange={() => toggleReadout('centerOfMass')} size="small" />} label="Center of Mass" /><FormControlLabel control={<Checkbox checked={readouts.kineticEnergy} onChange={() => toggleReadout('kineticEnergy')} size="small" />} label="Kinetic Energy" /><FormControlLabel control={<Checkbox checked={readouts.values} onChange={() => toggleReadout('values')} size="small" />} label="Values" /></Stack></Paper>
      {feedback === 'correct' && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: 'success.main', animation: 'lawCelebrate .7s ease', '@keyframes lawCelebrate': { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.025)' }, '100%': { transform: 'scale(1)' } } }}><Typography color="success.main" sx={{ fontWeight: 800 }}>{mode === 'first' ? 'Right! With no net force, an object in motion keeps a constant velocity.' : mode === 'second' ? 'Right! Acceleration equals force divided by mass.' : 'Right! The action and reaction forces are equal and opposite.'}</Typography></Paper>}
      {feedback === 'incorrect' && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'warning.main' }}><Typography color="warning.dark" sx={{ fontWeight: 700 }}>{hint}</Typography></Paper>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={() => { setPlaying((current) => !current); setFeedback('idle') }} startIcon={playing ? <PauseIcon /> : <PlayArrowIcon />}>{playing ? 'Pause' : 'Play'}</Button><Button variant="outlined" onClick={step} startIcon={<SkipNextIcon />}>Step</Button><ToggleButtonGroup exclusive value={slow ? 'slow' : 'normal'} onChange={(_, value: 'normal' | 'slow' | null) => value && setSlow(value === 'slow')} size="small" aria-label="Simulation speed"><ToggleButton value="normal">Normal</ToggleButton><ToggleButton value="slow">Slow</ToggleButton></ToggleButtonGroup><Button variant="outlined" onClick={checkActivity} disabled={checkDisabled}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default CollisionPlaygroundActivity
