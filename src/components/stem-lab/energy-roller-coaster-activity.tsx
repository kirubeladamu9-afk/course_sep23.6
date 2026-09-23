import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useEffect, useMemo, useState } from 'react'

export type EnergyRollerCoasterProps = { onComplete?: () => void }
type Outcome = 'idle' | 'running' | 'rolling-back' | 'cleared' | 'failed'
type Feedback = 'idle' | 'correct' | 'incorrect'

type Round = {
  mass: number
  hills: [number, number]
  challengeTarget: number
}

const GRAVITY = 9.81
const TRACK_LENGTH = 24
const round = (value: number) => Math.round(value * 10) / 10
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const createRound = (): Round => {
  const secondHill = randomInt(11, 17)
  return { mass: randomInt(45, 75), hills: [randomInt(5, 8), secondHill], challengeTarget: round(secondHill + 0.5 + Math.random()) }
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const EnergyRollerCoasterActivity: FC<EnergyRollerCoasterProps> = ({ onComplete }) => {
  const [roundState, setRoundState] = useState<Round>(createRound)
  const [startingHeight, setStartingHeight] = useState(15)
  const [progress, setProgress] = useState(0)
  const [outcome, setOutcome] = useState<Outcome>('idle')
  const [feedback, setFeedback] = useState<Feedback>('idle')

  const trackPoints = useMemo(() => [
    { x: 42, height: startingHeight },
    { x: 112, height: 4 },
    { x: 190, height: 2 },
    { x: 285, height: roundState.hills[0] },
    { x: 365, height: 3 },
    { x: 475, height: roundState.hills[1] },
    { x: 570, height: 3 },
  ], [roundState.hills, startingHeight])

  const heightAt = (value: number) => {
    const scaled = clamp(value, 0, 1) * (trackPoints.length - 1)
    const index = Math.min(trackPoints.length - 2, Math.floor(scaled))
    const fraction = scaled - index
    const from = trackPoints[index]
    const to = trackPoints[index + 1]
    return from.height + (to.height - from.height) * fraction
  }
  const xAt = (value: number) => {
    const scaled = clamp(value, 0, 1) * (trackPoints.length - 1)
    const index = Math.min(trackPoints.length - 2, Math.floor(scaled))
    const fraction = scaled - index
    return trackPoints[index].x + (trackPoints[index + 1].x - trackPoints[index].x) * fraction
  }

  useEffect(() => {
    if (outcome !== 'running' && outcome !== 'rolling-back') return undefined
    let frame = 0
    let active = true
    let last = performance.now()
    const tick = (now: number) => {
      if (!active) return
      const elapsed = Math.min(0.05, (now - last) / 1000)
      last = now
      setProgress((current) => {
        if (outcome === 'rolling-back') {
          const next = Math.max(0.12, current - elapsed * 0.28)
          if (next <= 0.12) {
            active = false
            setOutcome('failed')
          }
          return next
        }
        const height = heightAt(current)
        const speed = Math.sqrt(Math.max(0, 2 * GRAVITY * (startingHeight - height)))
        const next = Math.min(1, current + Math.max(0.35, speed) * elapsed / TRACK_LENGTH)
        const nextHeight = heightAt(next)
        if (nextHeight > startingHeight + 0.02) {
          setOutcome('rolling-back')
          return current
        }
        if (next >= 1) {
          active = false
          setOutcome('cleared')
          return 1
        }
        return next
      })
      if (active) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => { active = false; cancelAnimationFrame(frame) }
  }, [outcome, startingHeight, trackPoints])

  const totalEnergy = roundState.mass * GRAVITY * startingHeight
  const currentHeight = heightAt(progress)
  const potentialEnergy = round(roundState.mass * GRAVITY * currentHeight)
  const kineticEnergy = round(Math.max(0, totalEnergy - potentialEnergy))
  const speed = round(Math.sqrt(Math.max(0, 2 * GRAVITY * (startingHeight - currentHeight))))
  const hillCleared = outcome === 'cleared'
  const challengeCorrect = hillCleared && startingHeight >= roundState.hills[1] && startingHeight <= roundState.challengeTarget
  const completed = feedback === 'correct'
  const maxEnergy = Math.max(totalEnergy, 1)
  const trackPath = trackPoints.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${230 - point.height * 8}`).join(' ')
  const cartX = xAt(progress)
  const cartY = 230 - currentHeight * 8

  const updateHeight = (value: number) => { setStartingHeight(value); setProgress(0); setOutcome('idle'); setFeedback('idle') }
  const release = () => { setProgress(0); setFeedback('idle'); setOutcome('running') }
  const checkActivity = () => setFeedback(challengeCorrect ? 'correct' : 'incorrect')
  const reset = () => { setRoundState(createRound()); setStartingHeight(15); setProgress(0); setOutcome('idle'); setFeedback('idle') }
  const hint = startingHeight < roundState.hills[1] ? 'Raise the starting height a little so the cart has enough potential energy for the second hill.' : 'The cart cleared the hill, but try lowering the starting height so it only just makes it over.'

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Energy Roller Coaster</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore how energy transforms between forms.</Typography></Box><Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}><Box sx={{ flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Starting height: {round(startingHeight)} m</Typography><Slider min={8} max={20} step={0.5} value={startingHeight} onChange={(_, value) => updateHeight(Array.isArray(value) ? value[0] : value)} valueLabelDisplay="auto" valueLabelFormat={(value) => `${value} m`} aria-label="Starting height" /></Box><Button variant="contained" onClick={release} disabled={outcome === 'running' || outcome === 'rolling-back'} startIcon={<PlayArrowIcon />}>Release</Button></Stack><Box component="svg" viewBox="0 0 640 270" sx={{ width: '100%', minHeight: 250, borderRadius: 2, background: 'linear-gradient(180deg, #dff2f5, #fff8e6)' }} role="img" aria-label={`Roller coaster cart at ${round(currentHeight)} metres with speed ${speed} metres per second`}><line x1="30" x2="600" y1="232" y2="232" stroke="#a4b9ae" strokeWidth="5" /><path d={trackPath} fill="none" stroke="#496f70" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" /><path d={trackPath} fill="none" stroke="#dce7d9" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />{trackPoints.slice(3, 6).map((point, index) => <text key={`${point.x}-${point.height}`} x={point.x} y={230 - point.height * 8 - 15} textAnchor="middle" fill="#526568" fontSize="13" fontWeight="700">{index === 0 ? 'Hill 1' : index === 1 ? 'Valley' : 'Hill 2'} · {point.height} m</text>)}<g style={{ transform: `translate(${cartX}px, ${cartY - 5}px)`, transition: outcome === 'running' ? 'transform .05s linear' : 'transform .35s ease' }}><rect x="-19" y="-28" width="38" height="25" rx="7" fill="#d96b3d" stroke="#7c3d2a" strokeWidth="3" /><circle cx="-11" cy="0" r="6" fill="#364c59" /><circle cx="11" cy="0" r="6" fill="#364c59" /><text x="0" y="-12" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">CART</text></g><text x="42" y="258" textAnchor="middle" fill="#526568" fontSize="13">start</text></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><Paper elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: 'divider' }}><Stack direction="row" justifyContent="space-between"><Typography variant="body2" sx={{ fontWeight: 700 }}>Potential Energy</Typography><Typography variant="body2" color="primary.main">{potentialEnergy} J</Typography></Stack><Box sx={{ mt: 1, height: 12, borderRadius: 6, backgroundColor: 'action.hover', overflow: 'hidden' }}><Box sx={{ width: `${(potentialEnergy / maxEnergy) * 100}%`, height: '100%', backgroundColor: '#317f86', transition: 'width .08s linear' }} /></Box></Paper><Paper elevation={0} sx={{ p: 1.5, flex: 1, border: 1, borderColor: 'divider' }}><Stack direction="row" justifyContent="space-between"><Typography variant="body2" sx={{ fontWeight: 700 }}>Kinetic Energy</Typography><Typography variant="body2" color="secondary.main">{kineticEnergy} J</Typography></Stack><Box sx={{ mt: 1, height: 12, borderRadius: 6, backgroundColor: 'action.hover', overflow: 'hidden' }}><Box sx={{ width: `${(kineticEnergy / maxEnergy) * 100}%`, height: '100%', backgroundColor: '#e19a35', transition: 'width .08s linear' }} /></Box></Paper></Stack><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap"><Chip label={`Speed: ${speed} m/s`} /><Chip label={`Total mechanical energy: ${round(totalEnergy)} J`} color="success" variant="outlined" /><Chip label={`Cart mass: ${roundState.mass} kg`} /></Stack><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', backgroundColor: feedback === 'correct' ? 'success.light' : feedback === 'incorrect' ? 'warning.light' : 'action.hover' }}><Typography sx={{ fontWeight: 700 }}>Challenge: set a starting height that lets the cart just barely clear the second hill, then release it.</Typography>{feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: .5, fontWeight: 800 }}>Right! Enough starting height meant enough potential energy to convert into the kinetic energy needed to clear that hill.</Typography>}{feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: .5 }}>{outcome === 'failed' ? hint : 'Release the cart first, then adjust the starting height until it just clears the second hill.'}</Typography>}</Paper><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={outcome === 'running' || outcome === 'rolling-back'}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack></Stack></Paper>
}

export default EnergyRollerCoasterActivity
