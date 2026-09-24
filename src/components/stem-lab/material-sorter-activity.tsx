import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ChairOutlinedIcon from '@mui/icons-material/ChairOutlined'
import CoffeeOutlinedIcon from '@mui/icons-material/CoffeeOutlined'
import CropSquareOutlinedIcon from '@mui/icons-material/CropSquareOutlined'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined'
import LocalDrinkOutlinedIcon from '@mui/icons-material/LocalDrinkOutlined'
import ParkOutlinedIcon from '@mui/icons-material/ParkOutlined'
import RestaurantOutlinedIcon from '@mui/icons-material/RestaurantOutlined'
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined'
import { type DragEvent, type FC, type ReactNode, useState } from 'react'

export type Material = 'Wood' | 'Metal' | 'Plastic' | 'Glass'

type MaterialObject = {
  id: string
  label: string
  material: Material
  icon: ReactNode
}

type ObjectDefinition = Omit<MaterialObject, 'id' | 'material'> & {
  id: string
  material: Material | 'variant'
}

type Feedback = {
  kind: 'success' | 'warning' | 'error'
  message: string
}

const MATERIALS: Material[] = ['Wood', 'Metal', 'Plastic', 'Glass']
const MATERIAL_ICON: Record<Material, ReactNode> = {
  Wood: <ParkOutlinedIcon />,
  Metal: <BuildOutlinedIcon />,
  Plastic: <LocalDrinkOutlinedIcon />,
  Glass: <CropSquareOutlinedIcon />,
}
const MATERIAL_COLOR: Record<Material, string> = {
  Wood: '#9a6732',
  Metal: '#607d8b',
  Plastic: '#1976d2',
  Glass: '#00897b',
}

const OBJECT_POOL: ObjectDefinition[] = [
  { id: 'spoon', label: 'Spoon', material: 'Metal', icon: <RestaurantOutlinedIcon /> },
  { id: 'window', label: 'Window', material: 'Glass', icon: <CropSquareOutlinedIcon /> },
  { id: 'chair', label: 'Chair', material: 'Wood', icon: <ChairOutlinedIcon /> },
  { id: 'water-bottle', label: 'Water bottle', material: 'Plastic', icon: <LocalDrinkOutlinedIcon /> },
  { id: 'nail', label: 'Nail', material: 'Metal', icon: <BuildOutlinedIcon /> },
  { id: 'pencil', label: 'Pencil', material: 'Wood', icon: <EditOutlinedIcon /> },
  { id: 'cup', label: 'Cup', material: 'variant', icon: <CoffeeOutlinedIcon /> },
  { id: 'toy-brick', label: 'Toy brick', material: 'Plastic', icon: <GridViewOutlinedIcon /> },
  { id: 'bowl', label: 'Wooden bowl', material: 'Wood', icon: <ParkOutlinedIcon /> },
  { id: 'jar', label: 'Jar', material: 'Glass', icon: <CropSquareOutlinedIcon /> },
  { id: 'ruler', label: 'Ruler', material: 'Plastic', icon: <StraightenOutlinedIcon /> },
  { id: 'key', label: 'Key', material: 'Metal', icon: <BuildOutlinedIcon /> },
]

const shuffle = <T,>(items: T[]) => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

const chooseVariantMaterial = (): Material => Math.random() < 0.5 ? 'Glass' : 'Plastic'

const createRound = (): MaterialObject[] => {
  const resolved = shuffle(OBJECT_POOL).map((definition) => {
    const material = definition.material === 'variant' ? chooseVariantMaterial() : definition.material
    return {
      ...definition,
      id: definition.material === 'variant' ? `${definition.id}-${material.toLowerCase()}` : definition.id,
      label: definition.material === 'variant' ? `${definition.label} (${material.toLowerCase()})` : definition.label,
      material,
    }
  })
  const required = MATERIALS.map((material) => resolved.find((item) => item.material === material)).filter((item): item is MaterialObject => Boolean(item))
  const requiredIds = new Set(required.map((item) => item.id))
  return shuffle([...required, ...resolved.filter((item) => !requiredIds.has(item.id))]).slice(0, 10)
}

const playChime = () => {
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(660, context.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(880, context.currentTime + 0.12)
  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.2)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.2)
  void oscillator.addEventListener('ended', () => { void context.close() })
}

const MaterialSorterActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [objects, setObjects] = useState<MaterialObject[]>(createRound)
  const [binOrder, setBinOrder] = useState<Material[]>(() => shuffle(MATERIALS))
  const [placements, setPlacements] = useState<Record<string, Material>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [incorrectIds, setIncorrectIds] = useState<Set<string>>(new Set())
  const [recentlyPlacedId, setRecentlyPlacedId] = useState<string | null>(null)
  const [validated, setValidated] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [round, setRound] = useState(1)

  const placedCount = Object.keys(placements).length
  const allPlaced = placedCount === objects.length

  const clearAnimation = (id: string) => {
    window.setTimeout(() => {
      setIncorrectIds((current) => {
        const next = new Set(current)
        next.delete(id)
        return next
      })
      setRecentlyPlacedId((current) => current === id ? null : current)
    }, 650)
  }

  const removeFromPlacement = (id: string) => {
    setPlacements((current) => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }

  const placeObject = (id: string, material: Material) => {
    const object = objects.find((item) => item.id === id)
    if (!object) return
    setSelectedId(null)
    setDraggedId(null)
    setValidated(false)
    setCelebrating(false)
    if (object.material === material) {
      setPlacements((current) => ({ ...current, [id]: material }))
      setRecentlyPlacedId(id)
      setFeedback({ kind: 'success', message: `${object.label} belongs in the ${material} bin.` })
      playChime()
      clearAnimation(id)
      return
    }
    removeFromPlacement(id)
    setIncorrectIds(new Set([id]))
    setFeedback({ kind: 'warning', message: 'Not quite. The object bounced back to the tray.' })
    clearAnimation(id)
  }

  const getDraggedId = (event: DragEvent<HTMLElement>) => event.dataTransfer.getData('text/material-sorter-item') || draggedId

  const handleDrop = (event: DragEvent<HTMLElement>, material?: Material) => {
    event.preventDefault()
    const id = getDraggedId(event)
    if (!id) return
    if (material) placeObject(id, material)
    else {
      removeFromPlacement(id)
      setSelectedId(null)
      setDraggedId(null)
      setValidated(false)
      setCelebrating(false)
    }
  }

  const checkActivity = () => {
    if (!allPlaced) return
    const wrongIds = objects.filter((object) => placements[object.id] !== object.material).map((object) => object.id)
    if (wrongIds.length > 0) {
      setIncorrectIds(new Set(wrongIds))
      setPlacements((current) => Object.fromEntries(Object.entries(current).filter(([id]) => !wrongIds.includes(id))))
      setFeedback({ kind: 'error', message: `${wrongIds.length} object${wrongIds.length === 1 ? '' : 's'} were misplaced and returned to the tray.` })
      setValidated(false)
      setCelebrating(false)
      wrongIds.forEach(clearAnimation)
      return
    }
    setValidated(true)
    setCelebrating(true)
    setFeedback({ kind: 'success', message: `Great sorting! You correctly identified all ${objects.length} materials.` })
  }

  const reset = () => {
    setObjects(createRound())
    setBinOrder(shuffle(MATERIALS))
    setPlacements({})
    setSelectedId(null)
    setDraggedId(null)
    setIncorrectIds(new Set())
    setRecentlyPlacedId(null)
    setValidated(false)
    setCelebrating(false)
    setFeedback(null)
    setRound((current) => current + 1)
  }

  const renderObject = (object: MaterialObject) => {
    const placedIn = placements[object.id]
    const isSelected = selectedId === object.id
    const isIncorrect = incorrectIds.has(object.id)
    const isRecent = recentlyPlacedId === object.id
    return <Box
      key={object.id}
      component="button"
      type="button"
      draggable
      onDragStart={(event) => {
        setDraggedId(object.id)
        setSelectedId(object.id)
        event.dataTransfer.setData('text/material-sorter-item', object.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      onDragEnd={() => setDraggedId(null)}
      onClick={(event) => {
        event.stopPropagation()
        setSelectedId((current) => current === object.id ? null : object.id)
      }}
      aria-label={`${placedIn ? 'Move' : 'Select'} ${object.label}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: '100%',
        minWidth: 0,
        p: 1.25,
        textAlign: 'left',
        border: 2,
        borderColor: isIncorrect ? 'error.main' : isSelected ? 'primary.main' : 'divider',
        borderRadius: 2,
        backgroundColor: isIncorrect ? 'error.light' : isSelected ? 'action.selected' : 'background.paper',
        color: 'text.primary',
        cursor: 'grab',
        userSelect: 'none',
        transition: 'border-color .2s ease, background-color .2s ease, transform .2s ease',
        animation: isIncorrect ? 'sorterShake .55s ease' : isRecent ? 'sorterPop .45s ease-out' : undefined,
        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Box sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, flexShrink: 0, borderRadius: 1.5, color: placedIn ? MATERIAL_COLOR[placedIn] : 'primary.main', backgroundColor: 'action.hover' }}>{object.icon}</Box>
      <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{object.label}</Typography><Typography variant="caption" color="text.secondary">{placedIn ? `In ${placedIn}` : isSelected ? 'Now choose a bin' : 'Tap or drag'}</Typography></Box>
    </Box>
  }

  return <Box sx={{
    '@keyframes sorterPop': { '0%': { transform: 'scale(.88)' }, '65%': { transform: 'scale(1.06)' }, '100%': { transform: 'scale(1)' } },
    '@keyframes sorterShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-7px)' }, '75%': { transform: 'translateX(7px)' } },
    '@keyframes sorterCelebrate': { '0%, 100%': { transform: 'translateY(0) rotate(0)' }, '25%': { transform: 'translateY(-8px) rotate(-2deg)' }, '75%': { transform: 'translateY(-4px) rotate(2deg)' } },
  }}>
    <Stack spacing={2.5}>
      <Box><Chip label="Material Sorter" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Sort everyday materials</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Explore the everyday materials that make up our world.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Choose an object, then choose its material bin.</Typography><Chip label={`${placedCount} of ${objects.length} sorted`} color={allPlaced ? 'success' : 'default'} aria-label={`${placedCount} of ${objects.length} sorted`} /></Stack>
      <Paper elevation={0} onDragOver={(event) => event.preventDefault()} onDrop={(event) => handleDrop(event)} sx={{ p: 1.5, minHeight: 142, border: 1, borderStyle: 'dashed', borderColor: selectedId ? 'primary.main' : 'divider', backgroundColor: 'background.default' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Object tray</Typography><Typography variant="caption" color="text.secondary">Round {round} · {objects.length} objects</Typography></Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(3, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' }, gap: 1 }}>
          {objects.filter((object) => !placements[object.id]).map(renderObject)}
          {!objects.some((object) => !placements[object.id]) && <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1', p: 2, textAlign: 'center' }}>All objects are in bins. Check your sorting when you are ready.</Typography>}
        </Box>
      </Paper>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 1.25 }}>
        {binOrder.map((material) => {
          const binObjects = objects.filter((object) => placements[object.id] === material)
          const isTarget = Boolean(selectedId)
          return <Paper
            key={material}
            elevation={0}
            role="button"
            tabIndex={0}
            aria-label={`${material} bin${isTarget ? ', place selected object here' : ''}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => handleDrop(event, material)}
            onClick={() => selectedId && placeObject(selectedId, material)}
            onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && selectedId) { event.preventDefault(); placeObject(selectedId, material) } }}
            sx={{ p: 1.5, minHeight: 178, border: 2, borderColor: isTarget ? MATERIAL_COLOR[material] : 'divider', backgroundColor: isTarget ? `${MATERIAL_COLOR[material]}12` : 'background.paper', cursor: isTarget ? 'copy' : 'default', transition: 'border-color .2s ease, background-color .2s ease' }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}><Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, borderRadius: '50%', color: MATERIAL_COLOR[material], backgroundColor: `${MATERIAL_COLOR[material]}22` }}>{MATERIAL_ICON[material]}</Box><Box sx={{ minWidth: 0 }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{material}</Typography><Typography variant="caption" color="text.secondary">{binObjects.length} item{binObjects.length === 1 ? '' : 's'}</Typography></Box></Stack>
            <Stack spacing={.75}>{binObjects.map(renderObject)}{binObjects.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ p: 1, textAlign: 'center' }}>Drop here</Typography>}</Stack>
          </Paper>
        })}
      </Box>
      {feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : feedback.kind === 'error' ? 'error.main' : 'warning.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : feedback.kind === 'error' ? 'error.light' : 'warning.light', animation: celebrating ? 'sorterCelebrate .9s ease-in-out infinite' : undefined }}><Typography sx={{ fontWeight: 700 }}>{feedback.message}</Typography></Paper>}
      {!allPlaced && <Typography variant="caption" color="text.secondary">Sort all {objects.length} objects to unlock Check Activity.</Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="outlined" onClick={checkActivity} disabled={!allPlaced || validated} startIcon={<CheckCircleOutlineIcon />}>Check Activity</Button>
        <Button variant="contained" onClick={onComplete} disabled={!validated}>Complete Activity</Button>
        <Button variant="text" onClick={reset} startIcon={<ParkOutlinedIcon />}>Reset</Button>
      </Stack>
    </Stack>
  </Box>
}

export default MaterialSorterActivity
