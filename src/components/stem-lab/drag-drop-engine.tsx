import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useState } from 'react'

export interface DragDropItem {
  id: string
  label: string
  correctCategory: string
}

export interface DragDropConfig {
  title: string
  prompt: string
  categories: string[]
  items: DragDropItem[]
}

type DragDropEngineProps = {
  config: DragDropConfig
  onComplete: () => void
}

const DragDropEngine: FC<DragDropEngineProps> = ({ config, onComplete }) => {
  const [placements, setPlacements] = useState<Record<string, string>>({})
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const isCorrect = config.items.every((item) => placements[item.id] === item.correctCategory)
  const unplacedItems = config.items.filter((item) => !placements[item.id])

  const placeItem = (itemId: string, category: string) => {
    setPlacements((current) => ({ ...current, [itemId]: category }))
    setChecked(false)
    setDraggedItem(null)
  }

  const checkAnswer = () => {
    setChecked(true)
    if (isCorrect) onComplete()
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2.5}>
      <Box>
        <Chip label="Drag & Drop Engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">{config.title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>{config.prompt}</Typography>
      </Box>
      <Paper elevation={0} sx={{ p: 1.5, minHeight: 78, border: 1, borderStyle: 'dashed', borderColor: 'divider', backgroundColor: 'background.default' }} onDragOver={(event) => event.preventDefault()} onDrop={() => draggedItem && setPlacements((current) => { const next = { ...current }; delete next[draggedItem]; return next })}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>Items to place</Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {unplacedItems.map((item) => <Box key={item.id} draggable onDragStart={() => setDraggedItem(item.id)} onClick={() => setDraggedItem(item.id)} sx={{ px: 1.5, py: 0.9, borderRadius: 2, border: 1, borderColor: draggedItem === item.id ? 'primary.main' : 'divider', backgroundColor: 'background.paper', cursor: 'grab', userSelect: 'none' }} aria-label={`Drag ${item.label}`}><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography></Box>)}
          {unplacedItems.length === 0 && <Typography variant="body2" color="text.secondary">All items are placed. Move an item again if you want to revise it.</Typography>}
        </Stack>
      </Paper>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: `repeat(${config.categories.length}, minmax(0, 1fr))` }, gap: 1.5 }}>
        {config.categories.map((category) => {
          const categoryItems = config.items.filter((item) => placements[item.id] === category)
          return <Paper key={category} elevation={0} onDragOver={(event) => event.preventDefault()} onDrop={() => draggedItem && placeItem(draggedItem, category)} onClick={() => draggedItem && placeItem(draggedItem, category)} sx={{ p: 1.5, minHeight: 150, border: 2, borderColor: draggedItem ? 'primary.main' : 'divider', borderStyle: 'dashed', cursor: draggedItem ? 'copy' : 'default', backgroundColor: draggedItem ? 'action.hover' : 'background.paper' }} aria-label={`Drop zone ${category}`}>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>{category}</Typography>
            <Stack spacing={0.75}>{categoryItems.map((item) => <Box key={item.id} sx={{ p: 1, borderRadius: 1.5, backgroundColor: 'primary.main', color: 'primary.contrastText' }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography></Box>)}{categoryItems.length === 0 && <Typography variant="body2" color="text.secondary">Drop items here</Typography>}</Stack>
          </Paper>
        })}
      </Box>
      <Button variant="contained" onClick={checkAnswer} disabled={Object.keys(placements).length !== config.items.length} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>Check sorting</Button>
      {checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: isCorrect ? 'success.main' : 'warning.main', backgroundColor: isCorrect ? 'success.light' : 'warning.light' }}><Typography sx={{ fontWeight: 700 }}>{isCorrect ? 'Correct sorting' : 'Try again'}</Typography><Typography variant="body2">{isCorrect ? 'Every item is in its correct category.' : 'Review the categories and move the items that do not belong.'}</Typography></Paper>}
    </Stack>
  </Paper>
}

export default DragDropEngine
