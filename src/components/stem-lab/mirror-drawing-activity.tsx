import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useMemo, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type Orientation = 'vertical' | 'horizontal' | 'diagonal'
type Cell = { row: number; column: number }
type Shape = { name: string; cells: Cell[] }
type Props = { topic: MathTopic; onComplete?: () => void }

const shapes: Shape[] = [
  { name: 'butterfly wing', cells: [{ row: 2, column: 2 }, { row: 3, column: 1 }, { row: 3, column: 2 }, { row: 4, column: 0 }, { row: 4, column: 1 }, { row: 4, column: 2 }, { row: 5, column: 1 }, { row: 5, column: 2 }, { row: 6, column: 2 }, { row: 7, column: 1 }] },
  { name: 'heart', cells: [{ row: 2, column: 1 }, { row: 2, column: 2 }, { row: 3, column: 0 }, { row: 3, column: 1 }, { row: 3, column: 2 }, { row: 4, column: 1 }, { row: 4, column: 2 }, { row: 5, column: 1 }, { row: 6, column: 1 }] },
  { name: 'house', cells: [{ row: 3, column: 2 }, { row: 4, column: 1 }, { row: 4, column: 2 }, { row: 5, column: 0 }, { row: 5, column: 1 }, { row: 5, column: 2 }, { row: 6, column: 0 }, { row: 6, column: 1 }, { row: 6, column: 2 }, { row: 7, column: 0 }, { row: 7, column: 1 }, { row: 7, column: 2 }] },
  { name: 'letter L', cells: [{ row: 2, column: 1 }, { row: 3, column: 1 }, { row: 4, column: 1 }, { row: 5, column: 1 }, { row: 6, column: 1 }, { row: 7, column: 1 }, { row: 7, column: 2 }, { row: 7, column: 3 }] },
]

const key = (cell: Cell) => `${cell.row}-${cell.column}`
const toCell = (value: string): Cell => { const [row, column] = value.split('-').map(Number); return { row, column } }
const mirror = (cell: Cell, orientation: Orientation): Cell => orientation === 'vertical' ? { row: cell.row, column: 11 - cell.column } : orientation === 'horizontal' ? { row: 11 - cell.row, column: cell.column } : { row: cell.column, column: cell.row }
const sideMatches = (cell: Cell, orientation: Orientation) => orientation === 'vertical' ? cell.column < 6 : orientation === 'horizontal' ? cell.row < 6 : cell.row > cell.column
const orientationLabel = (orientation: Orientation) => orientation === 'vertical' ? 'vertical' : orientation === 'horizontal' ? 'horizontal' : 'diagonal'

const MirrorDrawingActivity: FC<Props> = ({ topic, onComplete }) => {
  const [round, setRound] = useState(0)
  const [userCells, setUserCells] = useState<Set<string>>(new Set())
  const [history, setHistory] = useState<Set<string>[]>([])
  const [painting, setPainting] = useState<boolean | null>(null)
  const [checked, setChecked] = useState(false)
  const [completed, setCompleted] = useState(false)
  const config = useMemo(() => {
    const orientation: Orientation = (['vertical', 'horizontal', 'diagonal'] as Orientation[])[round % 3]
    const shape = shapes[round % shapes.length]
    const fixed = new Set(shape.cells.filter((cell) => sideMatches(cell, orientation)).map(key))
    const target = new Set([...fixed].map((value) => key(mirror(toCell(value), orientation))))
    return { shape, orientation, fixed, target: new Set([...fixed, ...target]) }
  }, [round])
  const ghost = new Set([...userCells].map((value) => key(mirror(toCell(value), config.orientation))))
  const filled = new Set([...config.fixed, ...userCells])
  const wrong = checked ? new Set([...filled].filter((value) => !config.target.has(value))) : new Set<string>()
  const missing = checked ? new Set([...config.target].filter((value) => !filled.has(value))) : new Set<string>()
  const correct = checked && wrong.size === 0 && missing.size === 0
  const mismatchCount = wrong.size + missing.size

  const setCell = (index: number, value: boolean) => {
    const cellKey = key({ row: Math.floor(index / 12), column: index % 12 })
    if (config.fixed.has(cellKey)) return
    setHistory((current) => [...current, new Set(userCells)])
    setUserCells((current) => { const next = new Set(current); value ? next.add(cellKey) : next.delete(cellKey); return next })
    setChecked(false)
    setCompleted(false)
  }
  const startPainting = (index: number) => {
    const cellKey = key({ row: Math.floor(index / 12), column: index % 12 })
    if (config.fixed.has(cellKey)) return
    setPainting(!userCells.has(cellKey))
    setCell(index, !userCells.has(cellKey))
  }
  const reset = () => { setUserCells(new Set()); setHistory([]); setPainting(null); setChecked(false); setCompleted(false) }
  const undo = () => { const previous = history[history.length - 1]; if (!previous) return; setUserCells(previous); setHistory((current) => current.slice(0, -1)); setChecked(false); setCompleted(false) }
  const nextRound = () => { setRound((current) => current + 1); reset() }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box>
      <Typography variant="h6" sx={{ textAlign: 'center' }}>Draw the missing half so the shape is perfectly symmetrical.</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>Complete the {config.shape.name} across the {orientationLabel(config.orientation)} dashed mirror line.</Typography>
      <Box role="grid" aria-label={`${config.shape.name} symmetry drawing grid`} onPointerUp={() => setPainting(null)} onPointerLeave={() => setPainting(null)} sx={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(12, minmax(0, 1fr))', width: 'min(100%, 540px)', aspectRatio: '1', mx: 'auto', gap: .5, p: 1, border: 2, borderColor: correct ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: 'background.default', animation: checked && !correct ? 'drawingShake .45s ease' : 'none', boxShadow: correct ? '0 0 24px rgba(46, 125, 50, .45)' : 'none', '@keyframes drawingShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
        {Array.from({ length: 144 }, (_, index) => { const cell = { row: Math.floor(index / 12), column: index % 12 }; const cellKey = key(cell); const isFixed = config.fixed.has(cellKey); const isFilled = filled.has(cellKey); const isGhost = ghost.has(cellKey) && !isFilled; const isWrong = wrong.has(cellKey); const isMissing = missing.has(cellKey); return <Box key={cellKey} role="gridcell" aria-label={`${cellKey}${isFilled ? ', filled' : ''}`} onPointerDown={(event) => { event.preventDefault(); startPainting(index) }} onPointerEnter={() => painting !== null && !isFixed && setCell(index, painting)} sx={{ position: 'relative', minWidth: 0, aspectRatio: '1', border: isMissing ? 2 : 1, borderStyle: isMissing ? 'dashed' : 'solid', borderColor: isWrong ? 'error.main' : isMissing ? 'warning.main' : 'divider', borderRadius: .5, backgroundColor: isWrong ? 'error.light' : isFilled ? 'primary.main' : isGhost ? 'rgba(16, 125, 111, .2)' : 'action.hover', opacity: isGhost ? .72 : 1, cursor: isFixed ? 'default' : 'crosshair', animation: isGhost ? 'mirrorSparkle .55s ease' : 'none', '@keyframes mirrorSparkle': { '0%': { transform: 'scale(.7)', opacity: 0 }, '60%': { transform: 'scale(1.08)', opacity: .85 }, '100%': { transform: 'scale(1)', opacity: .72 } }, '&:hover': { filter: isFixed ? 'none' : 'brightness(1.1)' } }} /> })}
        <Box aria-hidden sx={{ position: 'absolute', pointerEvents: 'none', ...(config.orientation === 'vertical' ? { top: 4, bottom: 4, left: '50%' } : config.orientation === 'horizontal' ? { left: 4, right: 4, top: '50%' } : { width: '141%', left: '-20.5%', top: '50%', transform: 'rotate(45deg)' }), borderLeft: config.orientation === 'vertical' ? 2 : 0, borderTop: config.orientation === 'horizontal' ? 2 : 0, borderBottom: config.orientation === 'diagonal' ? 2 : 0, borderColor: 'secondary.main', borderStyle: 'dashed' }} />
      </Box>
      <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="outlined" onClick={undo} disabled={!history.length}>Undo</Button><Button variant="contained" onClick={() => setChecked(true)}>Check Activity</Button></Stack>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'error.light' }}><Typography color={correct ? 'success.dark' : 'error.dark'} sx={{ fontWeight: 800 }}>{correct ? 'Perfect symmetry!' : `${mismatchCount} cells are missing or misplaced.`}</Typography></Paper>}
      <Button variant="contained" disabled={!correct || completed} onClick={() => { setCompleted(true); onComplete?.() }} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>{completed ? 'Completed' : 'Complete activity'}</Button>
      {completed && <Button variant="text" onClick={nextRound} sx={{ alignSelf: 'flex-start' }}>Next round</Button>}
    </Stack>
  </Paper>
}

export default MirrorDrawingActivity
