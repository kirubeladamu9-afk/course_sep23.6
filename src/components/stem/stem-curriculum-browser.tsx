import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC } from 'react'
import { STEM_CURRICULUM_CATEGORY_SUBJECTS, type StemCategorySubject, type StemCurriculumCategory } from './stem-curriculum-categories'
import { getStemToolBySubtype } from './stem-lab-registry'
import type { StemGradeBand } from './stem-types'

const toolLabel = (subtype: string) => getStemToolBySubtype(subtype)?.label ?? subtype.split('.').slice(-1)[0].replace(/_/g, ' ')

type Props = {
  subject: StemCategorySubject
  gradeBand: StemGradeBand
  selectedCategory?: StemCurriculumCategory
  onCategorySelect: (category: StemCurriculumCategory) => void
}

export const StemCurriculumCategoryBrowser: FC<Props> = ({ subject, gradeBand, selectedCategory, onCategorySelect }) => {
  const subjectEntry = STEM_CURRICULUM_CATEGORY_SUBJECTS.find((entry) => entry.subject === subject)
  return <Stack spacing={1}>
    <BoxHeading subjectLabel={subjectEntry?.label ?? subject} />
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>
      {subjectEntry?.categories.map((category) => {
        const isSelected = selectedCategory?.id === category.id
        return <Paper key={category.id} component="button" type="button" variant="outlined" onClick={() => onCategorySelect(category)} sx={{ minHeight: 84, display: 'flex', alignItems: 'center', gap: 1, p: 1.25, textAlign: 'left', color: 'text.primary', backgroundColor: 'background.default', cursor: 'pointer', borderColor: isSelected ? 'primary.main' : 'divider', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}><CategoryOutlinedIcon color={isSelected ? 'primary' : 'disabled'} fontSize="small" /><Box sx={{ minWidth: 0, flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{category.label}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{category.coveredTopics.length} topics · {category.toolSubtypes.length} tools</Typography><Typography variant="caption" color="text.secondary" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{category.toolSubtypes.map(toolLabel).join(' · ')}</Typography></Box>{isSelected && <Chip label={`Grade ${gradeBand.replace('grade_', '').replace('_', '–')}`} color="primary" size="small" />}</Paper>
      })}
    </Box>
  </Stack>
}

const BoxHeading: FC<{ subjectLabel: string }> = ({ subjectLabel }) => <Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Curriculum categories · {subjectLabel}</Typography><Typography variant="caption" color="text.secondary">Select a category to filter the tools below.</Typography></Box>
