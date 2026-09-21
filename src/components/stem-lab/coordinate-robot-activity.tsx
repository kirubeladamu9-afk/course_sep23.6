import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Point = { x: number; y: number }
type Round = { start: Point; target: Point; walls: Point[]; name: string }
type Props = { topic: MathTopic; onComplete?: () => void }

const rounds: Round[] = [
  { start: { x: 1, y: 1 }, target: { x: 4, y: 3 }, walls: [{ x: 2, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 2 }], name: 'garden maze' },
  { start: { x: 6, y: 6 }, target: { x: 2, y: 4 }, walls: [{ x: 5, y: 6 }, { x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }], name: 'city blocks' },
  { start: { x: 1, y: 6 }, target: { x: 6, y: 2 }, walls: [{ x: 2, y: 6 }, { x: 2, y: 5 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 4 }, { x: 5, y: 4 }], name: 'space station' },
]
const size = 8
const same = (a: Point, b: Point) => a.x === b.x && a.y === b.y
const wallKey = (point: Point) => `${point.x}-${point.y}`
const direction = (dx: number, dy: number) => dx > 0 ? 'right' : dx < 0 ? 'left' : dy > 0 ? 'up' : 'down'

const CoordinateRobotActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const config = rounds[round % rounds.length]
  const [position, setPosition] = useState<Point>(config.start)
  const [coordinateInput, setCoordinateInput] = useState('')
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const wallSet = useMemo(() => new Set(config.walls.map(wallKey)), [config])
  const correct = checked && same(position, config.target)
  const dx = config.target.x - position.x
  const dy = config.target.y - position.y
  const hint = dx !== 0 ? `Move ${Math.abs(dx)} more ${direction(dx, 0)} along x.` : `Move ${Math.abs(dy)} more ${direction(0, dy)} along y.`

  const move = (next: Point) => {
    if (next.x < 0 || next.x >= size || next.y < 0 || next.y >= size || wallSet.has(wallKey(next))) return
    setPosition(next)
    setChecked(false)
    setCompleted(false)
  }
  const step = (dx: number, dy: number) => move({ x: position.x + dx, y: position.y + dy })
  const sendToCoordinate = () => {
    const match = coordinateInput.match(/(-?\d+)\s*,\s*(-?\d+)/)
    if (match) move({ x: Number(match[1]), y: Number(match[2]) })
  }
  const reset = () => { setPosition(config.start); setCoordinateInput(''); setChecked(false); setCompleted(false) }
  const nextRound = () => { setRound((current) => current + 1); setPosition(rounds[(round + 1) % rounds.length].start); setCoordinateInput(''); setChecked(false); setCompleted(false) }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>Guide the robot to the target coordinates: ({config.target.x}, {config.target.y}).</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Navigate the {config.name}. Click an adjacent square or use the arrow buttons. Walls block the way.</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'stretch', gap: .5 }}>
        <Stack justifyContent="space-around" sx={{ pt: 2.5, pb: 3 }}>{Array.from({ length: size }, (_, index) => <Typography key={index} variant="caption" sx={{ height: 31, display: 'grid', placeItems: 'center', fontWeight: 700 }}>{size - 1 - index}</Typography>)}</Stack>
        <Box>
          <Box sx={{ position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, width: 'min(78vw, 440px)', aspectRatio: '1', gap: .35, p: .75, border: 2, borderColor: correct ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: 'background.default', boxShadow: correct ? '0 0 24px rgba(46, 125, 50, .5)' : 'none', animation: checked && !correct ? 'robotShake .45s ease' : 'none', '@keyframes robotShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
            {Array.from({ length: size * size }, (_, index) => { const x = index % size; const y = size - 1 - Math.floor(index / size); const point = { x, y }; const isWall = wallSet.has(wallKey(point)); const isTarget = same(point, config.target); const isCurrent = same(point, position); return <Box key={`${x}-${y}`} role="gridcell" aria-label={`Coordinate (${x}, ${y})${isWall ? ', wall' : ''}`} onClick={() => !isWall && (Math.abs(position.x - x) + Math.abs(position.y - y) === 1) && move(point)} sx={{ position: 'relative', minWidth: 0, aspectRatio: '1', display: 'grid', placeItems: 'center', border: 1, borderColor: isTarget ? 'warning.main' : 'divider', borderRadius: .75, backgroundColor: isWall ? '#34454b' : isTarget ? 'warning.light' : 'background.paper', cursor: isWall ? 'not-allowed' : 'pointer' }}>{isWall ? <Typography aria-hidden sx={{ color: 'rgba(255,255,255,.5)', fontSize: 16 }}>▦</Typography> : isTarget ? <Typography aria-label="Target flag" sx={{ fontSize: 20 }}>⚑</Typography> : null}{isCurrent && <Box aria-label={`Robot at (${position.x}, ${position.y})`} sx={{ position: 'absolute', zIndex: 2, fontSize: { xs: 18, sm: 25 }, lineHeight: 1, transition: 'transform .25s ease', animation: correct ? 'robotCheer .7s ease infinite alternate' : 'none', '@keyframes robotCheer': { from: { transform: 'translateY(0) rotate(-5deg)' }, to: { transform: 'translateY(-5px) rotate(5deg)' } } }}>🤖</Box>}</Box> })}
          </Box>
          <Stack direction="row" justifyContent="space-around" sx={{ pt: .5 }}>{Array.from({ length: size }, (_, index) => <Typography key={index} variant="caption" sx={{ width: `${100 / size}%`, textAlign: 'center', fontWeight: 700 }}>{index}</Typography>)}</Stack>
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: .5, fontWeight: 700 }}>x-axis</Typography>
        </Box>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Origin: <strong>(0, 0)</strong> · Robot at <strong>({position.x}, {position.y})</strong> · Target: <strong>({config.target.x}, {config.target.y})</strong></Typography>
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center"><Button aria-label="Move up" onClick={() => step(0, 1)} variant="outlined">↑</Button><Button aria-label="Move left" onClick={() => step(-1, 0)} variant="outlined">←</Button><Button aria-label="Move down" onClick={() => step(0, -1)} variant="outlined">↓</Button><Button aria-label="Move right" onClick={() => step(1, 0)} variant="outlined">→</Button></Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center" justifyContent="center"><TextField label="Send coordinate (x, y)" value={coordinateInput} onChange={(event) => setCoordinateInput(event.target.value)} placeholder="4, 3" inputProps={{ 'aria-label': 'Coordinate pair' }} /><Button variant="outlined" onClick={sendToCoordinate}>Send robot</Button></Stack>
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={() => setChecked(true)}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? `You reached (${config.target.x}, ${config.target.y})!` : hint}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default CoordinateRobotActivity
