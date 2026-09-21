import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import { type FC, useMemo, useState } from 'react'
import { type AdminLesson } from './admin-data'
import { STEM_TOOL_LIBRARY, type StemToolDefinition } from '@/components/stem-lab/stem-tool-library'
import { PLATFORM_ENGINES, type PlatformEngineDefinition, type PlatformEngineId } from '@/components/stem-lab/platform-engine-library'
import { PlatformEnginePreview } from '@/components/stem-lab/platform-engine-previews'

const subjects = ['All', 'Math', 'Physics', 'Chemistry', 'Biology'] as const
type SubjectFilter = typeof subjects[number]
type EngineOption = { key: string; name: string; description: string; subject: string; category: string; platform?: PlatformEngineDefinition; simulation?: StemToolDefinition }

type PlatformEngineLessonPickerProps = {
  lesson: AdminLesson
  updateLessonDraft: (lesson: AdminLesson) => void
  onSave: () => void
}

const PlatformEngineLessonPicker: FC<PlatformEngineLessonPickerProps> = ({ lesson, updateLessonDraft, onSave }) => {
  const [subject, setSubject] = useState<SubjectFilter>('All')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const selectedKey = lesson.platformEngineId ?? lesson.simulationToolId ?? null
  const options = useMemo<EngineOption[]>(() => [
    ...PLATFORM_ENGINES.map((engine) => ({ key: engine.id, name: engine.name, description: engine.description, subject: engine.subjects[0], category: 'Core engine', platform: engine })),
    ...STEM_TOOL_LIBRARY.map((tool) => ({ key: tool.id, name: tool.name, description: tool.description, subject: tool.subject, category: 'Configured lab', simulation: tool })),
  ], [])
  const filteredOptions = options.filter((option) => (subject === 'All' || option.subject === subject) && (category === 'All' || option.category === category) && `${option.name} ${option.description}`.toLowerCase().includes(search.trim().toLowerCase()))
  const selectedOption = options.find((option) => option.key === selectedKey)
  const selectOption = (option: EngineOption) => {
    if (option.platform) updateLessonDraft({ ...lesson, platformEngineId: option.platform.id, simulationToolId: option.platform.id, simulation: undefined })
    if (option.simulation) updateLessonDraft({ ...lesson, platformEngineId: undefined, simulationToolId: option.simulation.id, simulation: option.simulation.config })
  }
  const selectedPlatformId = selectedOption?.platform?.id as PlatformEngineId | undefined

  if (selectedOption) return <Stack spacing={2}>
    <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => updateLessonDraft({ ...lesson, platformEngineId: undefined, simulationToolId: '' })} sx={{ alignSelf: 'flex-start' }}>Back to engine library</Button>
    <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'primary.main', backgroundColor: 'action.selected' }}><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}><Box><Typography variant="h6">{selectedOption.name}</Typography><Typography variant="body2" color="text.secondary">{selectedOption.description}</Typography></Box><Chip label={selectedOption.category} color="primary" /></Stack></Paper>
    {selectedPlatformId && <PlatformEnginePreview engineId={selectedPlatformId} />}
    {selectedOption.simulation && <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Configured lab ready</Typography><Typography variant="body2" color="text.secondary">{selectedOption.simulation.config.overview}</Typography><Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace' }}>{selectedOption.simulation.config.calculation}</Typography></Paper>}
    <Button variant="contained" startIcon={<SaveOutlinedIcon />} onClick={onSave} disabled={!lesson.title.trim()}>Save engine as lesson</Button>
  </Stack>

  return <Stack spacing={1.5}>
    <Box><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Choose a platform-owned engine</Typography><Typography variant="body2" color="text.secondary">Select a fixed engine for this module. The platform owns the interaction; you only choose which curriculum engine this lesson uses.</Typography></Box>
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}><TextField fullWidth size="small" label="Search engines" value={search} onChange={(event) => setSearch(event.target.value)} /><FormControl size="small" sx={{ minWidth: 150 }}><InputLabel>Subject</InputLabel><Select label="Subject" value={subject} onChange={(event) => setSubject(event.target.value as SubjectFilter)}>{subjects.map((value) => <MenuItem key={value} value={value}>{value === 'All' ? 'All subjects' : value}</MenuItem>)}</Select></FormControl><FormControl size="small" sx={{ minWidth: 170 }}><InputLabel>Type</InputLabel><Select label="Type" value={category} onChange={(event) => setCategory(event.target.value)}><MenuItem value="All">All types</MenuItem><MenuItem value="Core engine">Core engines</MenuItem><MenuItem value="Configured lab">Configured labs</MenuItem></Select></FormControl></Stack>
    <Grid container spacing={1.25}>{filteredOptions.map((option) => <Grid item xs={12} sm={6} key={option.key}><Box component="button" type="button" onClick={() => selectOption(option)} sx={{ width: '100%', minHeight: 132, p: 1.5, textAlign: 'left', border: 1, borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper', color: 'text.primary', cursor: 'pointer', font: 'inherit', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}><Stack spacing={.75}><Stack direction="row" justifyContent="space-between" spacing={1}><Typography sx={{ fontWeight: 700 }}>{option.name}</Typography><Chip size="small" label={option.subject} /></Stack><Typography variant="body2" color="text.secondary">{option.description}</Typography><Typography variant="caption" color="primary.main">{option.category}</Typography></Stack></Box></Grid>)}</Grid>
    {!filteredOptions.length && <Typography color="text.secondary" sx={{ py: 2 }}>No platform engines match these filters.</Typography>}
  </Stack>
}

export default PlatformEngineLessonPicker
