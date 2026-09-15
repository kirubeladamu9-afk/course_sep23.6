import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC } from 'react'
import { STEM_CURRICULUM_CATEGORY_SUBJECTS, type StemCategorySubject, type StemCurriculumCategory } from './stem-curriculum-categories'
import { getStemToolBySubtype } from './stem-lab-registry'
import { STEM_GRADE_BAND_LABELS, type StemGradeBand, type StemSubtype } from './stem-types'

const toolLabel = (subtype: string) => getStemToolBySubtype(subtype)?.label ?? subtype.split('.').slice(-1)[0].replace(/_/g, ' ')

type Props = {
  subject: StemCategorySubject
  gradeBand: StemGradeBand
  selectedCategory?: StemCurriculumCategory
  onCategorySelect: (category: StemCurriculumCategory) => void
  onToolSelect: (subtype: StemSubtype) => void
}

export const StemCurriculumCategoryBrowser: FC<Props> = ({ subject, gradeBand, selectedCategory, onCategorySelect, onToolSelect }) => {
  const subjectEntry = STEM_CURRICULUM_CATEGORY_SUBJECTS.find((entry) => entry.subject === subject)
  return <Stack spacing={1}>
    <BoxHeading subjectLabel={subjectEntry?.label ?? subject} />
    {subjectEntry?.categories.map((category) => {
      const isSelected = selectedCategory?.id === category.id
      const activityConfig = category.activity_config[gradeBand]
      return <Paper key={category.id} variant="outlined" sx={{ p: 1.25, borderColor: isSelected ? 'primary.main' : 'divider' }}><Stack spacing={0.75}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{category.label}</Typography><Typography variant="body2" color="text.secondary"><strong>Topics:</strong> {category.coveredTopics.join(' · ')}</Typography><Typography variant="body2" color="text.secondary"><strong>Pattern:</strong> {category.activityPattern.join(' → ')}</Typography><Typography variant="caption" color="text.secondary"><strong>Reusable tools:</strong> {category.toolSubtypes.map(toolLabel).join(' · ')}</Typography><Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">{category.toolSubtypes.map((subtype) => <Button key={subtype} size="small" variant="outlined" onClick={() => onToolSelect(subtype)}>Use {toolLabel(subtype)}</Button>)}</Stack>{isSelected && <Paper variant="outlined" sx={{ p: 1, backgroundColor: 'action.hover' }}><Typography variant="caption" sx={{ fontWeight: 700 }}>{STEM_GRADE_BAND_LABELS[gradeBand]} activity config</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{activityConfig.complexity}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Variables: {activityConfig.variables.join(' · ')}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Output: {activityConfig.expectedOutput}</Typography></Paper>}<Button size="small" variant={isSelected ? 'contained' : 'outlined'} onClick={() => onCategorySelect(category)} sx={{ alignSelf: 'flex-start' }}>{isSelected ? 'Filtering tools by category' : 'Use category pattern'}</Button></Stack></Paper>
    })}
  </Stack>
}

const BoxHeading: FC<{ subjectLabel: string }> = ({ subjectLabel }) => <Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Curriculum patterns · {subjectLabel}</Typography><Typography variant="body2" color="text.secondary">Choose a category to filter the reusable tools below. Topics are covered by the selected activity pattern instead of separate activities.</Typography></Box>
