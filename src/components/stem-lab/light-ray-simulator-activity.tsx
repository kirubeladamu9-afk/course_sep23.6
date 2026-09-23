import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, type PointerEvent, useMemo, useState } from 'react'

export type LightRaySimulatorProps = { onComplete?: () => void }
type Point = { x: number; y: number }
type Round = { source: Point; target: Point; targetMirrorAngle: number }
type Feedback = 'idle' | 'correct' | 'incorrect'

const mirrorCenter: Point = { x: 50, y: 55 }
const normalizeAngle = (angle: number) => ((angle % 180) + 180) % 180
const vectorFromAngle = (angle: number): Point => ({ x: Math.cos(angle * Math.PI / 180), y: Math.sin(angle * Math.PI / 180) })
const dot = (a: Point, b: Point) => a.x * b.x + a.y * b.y
const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x
const subtract = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y })
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y })
const scale = (point: Point, factor: number): Point => ({ x: point.x * factor, y: point.y * factor })
const unit = (point: Point) => {
  const length = Math.hypot(point.x, point.y) || 1
  return scale(point, 1 / length)
}
const createRound = (): Round => {
  const source = { x: 12, y: 28 + Math.random() * 48 }
  const outgoingAngle = -58 + Math.random() * 116
  const outgoing = vectorFromAngle(outgoingAngle)
  const target = add(mirrorCenter, scale(outgoing, 31 + Math.random() * 12))
  const incomingAngle = Math.atan2(mirrorCenter.y - source.y, mirrorCenter.x - source.x) * 180 / Math.PI
  return { source, target, targetMirrorAngle: normalizeAngle((incomingAngle + outgoingAngle) / 2) }
}

const LightRaySimulatorActivity: FC<LightRaySimulatorProps> = ({ onComplete }) => {
  const initialRound = useMemo(createRound, [])
  const [round, setRound] = useState(initialRound)
  const [mirrorAngle, setMirrorAngle] = useState(normalizeAngle(initialRound.targetMirrorAngle + 22))
  const [dragging, setDragging] = useState(false)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)

  const surfaceTangent = vectorFromAngle(mirrorAngle)
  const normal = { x: -surfaceTangent.y, y: surfaceTangent.x }
  const incoming = unit(subtract(mirrorCenter, round.source))
  const reflected = unit(subtract(incoming, scale(normal, 2 * dot(incoming, normal))))
  const incidenceAngle = Math.acos(Math.min(1, Math.abs(dot(incoming, normal)))) * 180 / Math.PI
  const reflectionAngle = Math.acos(Math.min(1, Math.abs(dot(reflected, normal)))) * 180 / Math.PI
  const targetVector = subtract(round.target, mirrorCenter)
  const targetDistanceFromRay = Math.abs(cross(targetVector, reflected))
  const targetAlongRay = dot(targetVector, reflected)
  const targetHit = targetAlongRay > 0 && targetDistanceFromRay < 2.4
  const challengeCorrect = targetHit
  const completed = feedback === 'correct' && challengeCorrect
  const mirrorStart = add(mirrorCenter, scale(surfaceTangent, -23))
  const mirrorEnd = add(mirrorCenter, scale(surfaceTangent, 23))
  const normalStart = add(mirrorCenter, scale(normal, -20))
  const normalEnd = add(mirrorCenter, scale(normal, 20))
  const incomingStart = add(mirrorCenter, scale(incoming, -68))
  const reflectedEnd = add(mirrorCenter, scale(reflected, 68))

  const setAngle = (value: number) => {
    setMirrorAngle(normalizeAngle(value))
    setFeedback('idle')
  }

  const angleFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width * 100
    const y = (event.clientY - bounds.top) / bounds.height * 100
    setAngle(Math.atan2(y - mirrorCenter.y, x - mirrorCenter.x) * 180 / Math.PI)
  }

  const checkActivity = () => {
    setFeedback(challengeCorrect ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const reset = () => {
    const nextRound = createRound()
    setRound(nextRound)
    setMirrorAngle(normalizeAngle(nextRound.targetMirrorAngle + (Math.random() > .5 ? 22 : -22)))
    setDragging(false)
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Light Ray Simulator</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>See how light reflects off mirrors.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Rotate the mirror with its handle or slider. The reflected ray is calculated from the law of reflection: the angle from the normal stays equal on both sides.</Typography>
      <Box component="svg" viewBox="0 0 100 100" role="img" aria-label="Light ray reflecting from a rotatable mirror" onPointerMove={(event) => dragging && angleFromPointer(event)} onPointerUp={() => setDragging(false)} onPointerLeave={() => setDragging(false)} sx={{ width: '100%', height: { xs: 330, md: 430 }, overflow: 'hidden', border: 1, borderColor: 'divider', borderRadius: 2, background: 'linear-gradient(180deg, #f8fbff, #eef4f8)', touchAction: 'none' }}>
        <defs><marker id="ray-arrow" markerWidth="4" markerHeight="4" refX="3.5" refY="2" orient="auto"><path d="M 0 0 L 4 2 L 0 4 z" fill="#f4a51c" /></marker></defs>
        <text x="5" y="8" fontSize="3.1" fontWeight="700" fill="#526675">LIGHT RAY PATH</text>
        <line x1={normalStart.x} y1={normalStart.y} x2={normalEnd.x} y2={normalEnd.y} stroke="#78909c" strokeWidth=".55" strokeDasharray="2 2" />
        <text x={normalEnd.x + 1} y={normalEnd.y} fontSize="2.8" fill="#607d8b">normal</text>
        <line x1={incomingStart.x} y1={incomingStart.y} x2={mirrorCenter.x} y2={mirrorCenter.y} stroke="#f4a51c" strokeWidth="1.2" markerEnd="url(#ray-arrow)" />
        <line x1={mirrorCenter.x} y1={mirrorCenter.y} x2={reflectedEnd.x} y2={reflectedEnd.y} stroke={targetHit ? '#2e9b72' : '#f4a51c'} strokeWidth="1.2" markerEnd="url(#ray-arrow)" />
        <line x1={mirrorStart.x} y1={mirrorStart.y} x2={mirrorEnd.x} y2={mirrorEnd.y} stroke="#4d6473" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx={round.source.x} cy={round.source.y} r="4.5" fill="#fff2b8" stroke="#e08b00" strokeWidth="1" />
        <circle cx={round.source.x} cy={round.source.y} r="2" fill="#ffb300" />
        <text x={round.source.x - 4} y={round.source.y - 7} fontSize="3.1" fontWeight="700" fill="#825500">LIGHT SOURCE</text>
        <circle cx={round.target.x} cy={round.target.y} r="4" fill={targetHit ? '#a8e6c9' : '#ffe6e6'} stroke={targetHit ? '#2e9b72' : '#d65b5b'} strokeWidth="1" />
        <text x={round.target.x - 4} y={round.target.y + 8} fontSize="3.1" fontWeight="700" fill="#7b4d4d">TARGET</text>
        <circle cx={mirrorEnd.x} cy={mirrorEnd.y} r="3.2" fill="#1976d2" stroke="white" strokeWidth="1" onPointerDown={(event) => { event.stopPropagation(); event.currentTarget.setPointerCapture(event.pointerId); setDragging(true) }} />
        <text x={mirrorEnd.x + 2} y={mirrorEnd.y - 2} fontSize="2.8" fill="#185a9d">drag handle</text>
        {targetHit && <circle cx={round.target.x} cy={round.target.y} r="7" fill="none" stroke="#f4c542" strokeWidth="1.4" opacity=".9"><animate attributeName="r" values="4;9;4" dur=".65s" repeatCount="indefinite" /></circle>}
      </Box>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>Mirror angle: {mirrorAngle.toFixed(0)}°</Typography>
        <Slider min={0} max={180} step={1} value={mirrorAngle} onChange={(_, value) => setAngle(Array.isArray(value) ? value[0] : value)} aria-label="Mirror angle" valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(0)}°`} />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Chip label={`Angle of incidence: ${incidenceAngle.toFixed(0)}°`} color="primary" /><Chip label={`Angle of reflection: ${reflectionAngle.toFixed(0)}°`} color="primary" /><Chip label="Measured from normal" variant="outlined" /></Stack>
      </Paper>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: targetHit ? 'rgba(46,155,114,.12)' : 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>{targetHit ? 'The reflected ray hits the target.' : 'Aim the reflected ray at the target marker.'}</Typography><Typography variant="caption" color="text.secondary">The incoming and reflected angles are {incidenceAngle.toFixed(0)}° and {reflectionAngle.toFixed(0)}° from the dashed normal.</Typography></Paper>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'rayCelebrate .65s ease' : feedback === 'incorrect' ? 'rayShake .45s ease-in-out' : 'none', '@keyframes rayCelebrate': { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.025)' }, '100%': { transform: 'scale(1)' } }, '@keyframes rayShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge: Rotate the mirror so the reflected ray hits the target.</Typography>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! The angle of incidence always equals the angle of reflection.</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Hint: The ray is missing the target. Try rotating the mirror toward the side where the target sits.</Typography>}
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default LightRaySimulatorActivity
