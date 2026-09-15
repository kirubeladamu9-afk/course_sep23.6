import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC } from 'react'
import { STEM_CURRICULUM_CATEGORY_SUBJECTS, type StemCategorySubject, type StemCurriculumCategory } from './stem-curriculum-categories'
import { getStemToolBySubtype } from './stem-lab-registry'
import { STEM_GRADE_BAND_LABELS, type StemGradeBand } from './stem-types'

const toolLabel = (subtype: string) => getStemToolBySubtype(subtype)?.label ?? subtype.split('.').slice(-1)[0].replace(/_/g, ' ')

type Props = {
  selectedSubject?: StemCategorySubject
  selectedCategory?: StemCurriculumCategory
  onSubjectChange: (subject: StemCategorySubject) => void
  onCategorySelect: (category: StemCurriculumCategory) => void
  onUseCategory: () => void
  onBack: () => void
}

export const StemCurriculumCategoryBrowser: FC<Props> = ({ selectedSubject, selectedCategory, onSubjectChange, onCategorySelect, onUseCategory, onBack }) => {
  const subjectEntry = STEM_CURRICULUM_CATEGORY_SUBJECTS.find((entry) => entry.subject === selectedSubject)
  return <Stack spacing={1.5}>
    <BoxHeading />
    <FormControl fullWidth size="small"><InputLabel>Subject</InputLabel><Select label="Subject" value={selectedSubject ?? ''} onChange={(event) => onSubjectChange(event.target.value as StemCategorySubject)}>{STEM_CURRICULUM_CATEGORY_SUBJECTS.map((entry) => <MenuItem key={entry.subject} value={entry.subject}>{entry.label}</MenuItem>)}</Select></FormControl>
    {subjectEntry ? <Stack spacing={1}>{subjectEntry.categories.map((category) => <Paper key={category.id} variant="outlined" sx={{ p: 1.5, borderColor: selectedCategory?.id === category.id ? 'primary.main' : 'divider' }}><Stack spacing={0.75}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{category.label}</Typography><Typography variant="body2" color="text.secondary"><strong>Topics:</strong> {category.coveredTopics.join(' · ')}</Typography><Typography variant="body2" color="text.secondary"><strong>Pattern:</strong> {category.activityPattern.join(' → ')}</Typography><Typography variant="caption" color="text.secondary"><strong>Tool types:</strong> {category.toolSubtypes.map(toolLabel).join(' · ')}</Typography><Button size="small" variant={selectedCategory?.id === category.id ? 'contained' : 'outlined'} onClick={() => onCategorySelect(category)} sx={{ alignSelf: 'flex-start' }}>{selectedCategory?.id === category.id ? 'Category selected' : 'Review category'}</Button>{selectedCategory?.id === category.id && <Paper variant="outlined" sx={{ p: 1, backgroundColor: 'action.hover' }}><Typography variant="caption" sx={{ fontWeight: 700 }}>Grade-scaled activity configuration</Typography>{(Object.entries(category.activity_config) as Array<[StemGradeBand, (typeof category.activity_config)[StemGradeBand]]>).map(([band, activityConfig]) => <Typography key={band} variant="caption" color="text.secondary" sx={{ display: 'block' }}>{STEM_GRADE_BAND_LABELS[band]}: {activityConfig.complexity}</Typography>)}<Button size="small" variant="text" onClick={onUseCategory} sx={{ px: 0, mt: 0.5 }}>Use this category as starting point</Button></Paper>}</Stack></Paper>)}</Stack> : <Typography variant="body2" color="text.secondary">Select a subject to browse its merged curriculum categories.</Typography>}
    <Button variant="text" onClick={onBack} sx={{ alignSelf: 'flex-start' }}>Back to Subject / Tool picker</Button>
  </Stack>
}

const BoxHeading: FC = () => <Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Browse by Curriculum Category</Typography><Typography variant="body2" color="text.secondary">Categories merge related chapters into reusable activity patterns. Choose a category to review its covered topics, pattern, grade scaling, and available tool types.</Typography></Box>
