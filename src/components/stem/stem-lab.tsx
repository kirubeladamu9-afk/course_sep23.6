import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { type FC, useEffect, useRef, useState } from 'react'
import type { AdminLesson } from '@/components/admin/admin-data'
import { getActivityGrades, getActivityTopics, getActivityTopic, type ActivityTopic } from './stem-activity-curriculum'
import { defaultStemLabConfig, getStemToolBySubtype, STEM_LAB_REGISTRY } from './stem-lab-registry'
import { STEM_SUBJECT_LABELS, STEM_SUBJECTS, type StemActivityAttempt, type StemActivityResult, type StemGradeBand, type StemLabConfig, type StemSubject, type StemTool } from './stem-types'

export const getStemConfig = (lesson: Pick<AdminLesson, 'subtype' | 'config'>): StemLabConfig => {
  const definition = getStemToolBySubtype(lesson.subtype)
  return structuredClone(lesson.config ?? definition?.defaultConfig ?? STEM_LAB_REGISTRY[0].defaultConfig)
}

type AuthoringStage = 'subject' | 'tool' | 'configure' | 'preview' | 'publish'

const STEM_GRADES = Array.from({ length: 12 }, (_, index) => index + 1)

const gradeBandToGrade = (band?: StemGradeBand) => band === 'grade_1_3' ? 1 : band === 'grade_4_6' ? 4 : band === 'grade_10_12' ? 10 : 7
const gradeToBand = (grade: number): StemGradeBand => grade <= 3 ? 'grade_1_3' : grade <= 6 ? 'grade_4_6' : grade <= 9 ? 'grade_7_9' : 'grade_10_12'

export const StemLabEditor: FC<{ lesson: AdminLesson; updateLessonDraft: (lesson: AdminLesson) => void }> = ({ lesson, updateLessonDraft }) => {
  const definition = getStemToolBySubtype(lesson.subtype)
  const savedConfig = getStemConfig(lesson)
  const [selectedSubject, setSelectedSubject] = useState<StemSubject | undefined>(definition?.subject)
  const [selectedGrade, setSelectedGrade] = useState(() => savedConfig.grade ?? gradeBandToGrade(savedConfig.gradeBand ?? definition?.defaultConfig.gradeBand))
  const subject = definition?.subject ?? selectedSubject
  const gradeBand = gradeToBand(selectedGrade)
  const config = { ...savedConfig, gradeBand } as StemLabConfig
  const [stage, setStage] = useState<AuthoringStage>(definition ? 'configure' : 'subject')
  const [previewed, setPreviewed] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<ActivityTopic | undefined>()
  const topics = subject ? getActivityTopics(subject, selectedGrade) : []
  const ready = definition ? definition.isConfigured(config) : false

  useEffect(() => {
    setSelectedSubject(definition?.subject)
    setSelectedGrade(savedConfig.grade ?? gradeBandToGrade(savedConfig.gradeBand ?? definition?.defaultConfig.gradeBand))
    setSelectedTopic(undefined)
    setStage(definition ? 'configure' : 'subject')
    setPreviewed(false)
  }, [lesson.id])

  const chooseSubject = (nextSubject: StemSubject) => {
    setSelectedSubject(nextSubject)
    setSelectedTopic(undefined)
    updateLessonDraft({ ...lesson, subtype: undefined, config: undefined, stemLabPublished: false })
    setPreviewed(false)
    setStage('tool')
  }
  const chooseGrade = (nextGrade: number) => {
    setSelectedGrade(nextGrade)
    setSelectedTopic(undefined)
    updateLessonDraft({ ...lesson, subtype: undefined, config: undefined, stemLabPublished: false })
    setPreviewed(false)
    setStage('tool')
  }
  const chooseTopic = (topic: string) => setSelectedTopic((current) => current?.topic === topic ? undefined : getActivityTopic(subject ?? 'math', selectedGrade, topic))
  const chooseTool = (nextSubject: StemSubject, nextTool: StemTool, label: string) => {
    const nextConfig = { ...defaultStemLabConfig(nextSubject, nextTool), gradeBand, grade: selectedGrade }
    if (selectedTopic) nextConfig.topic = selectedTopic.topic
    const nextTitle = selectedTopic ? `${STEM_SUBJECT_LABELS[nextSubject]} · ${selectedTopic.topic} · ${label}` : lesson.title
    const nextDefinition = getStemToolBySubtype(`${nextSubject}.${nextTool}`)
    updateLessonDraft({ ...lesson, title: nextTitle, subtype: nextDefinition?.subtype, config: nextConfig, stemLabPublished: false })
    setPreviewed(false)
    setStage('configure')
  }
  const updateConfig = (nextConfig: StemLabConfig) => {
    updateLessonDraft({ ...lesson, config: { ...nextConfig, gradeBand, grade: selectedGrade }, stemLabPublished: false })
    setPreviewed(false)
    setStage('configure')
  }

  return <Stack spacing={2.5}>
    <Box><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Activity tool authoring</Typography><Typography variant="body2" color="text.secondary">Choose a subject, grade, topic, and named activity tool, then configure and publish it for learners.</Typography></Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap" aria-label="Activity authoring steps"><Button variant={stage === 'subject' ? 'contained' : 'outlined'} onClick={() => setStage('subject')}>1. Subject</Button><Button variant={stage === 'tool' ? 'contained' : 'outlined'} disabled={!subject} onClick={() => setStage('tool')}>2. Grade & topic</Button><Button variant={stage === 'configure' ? 'contained' : 'outlined'} disabled={!definition} onClick={() => setStage('configure')}>3. Configure</Button><Button variant={stage === 'preview' ? 'contained' : 'outlined'} disabled={!ready} onClick={() => { setPreviewed(true); setStage('preview') }}>4. Preview</Button><Button variant={stage === 'publish' ? 'contained' : 'outlined'} disabled={!previewed} onClick={() => setStage('publish')}>5. Publish</Button></Stack>
    {stage === 'subject' && <Stack spacing={1.5}><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Choose a subject</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1 }}>{STEM_SUBJECTS.map((item) => <Paper key={item} component="button" type="button" variant="outlined" onClick={() => chooseSubject(item)} sx={{ minHeight: 92, p: 2, textAlign: 'left', color: 'text.primary', backgroundColor: 'background.default', cursor: 'pointer', borderColor: subject === item ? 'primary.main' : 'divider', '&:hover': { borderColor: 'primary.main' } }}><Typography sx={{ fontWeight: 800 }}>{STEM_SUBJECT_LABELS[item]}</Typography><Typography variant="body2" color="text.secondary">12 grades · {getActivityGrades(item).reduce((total, grade) => total + grade.topics.length, 0)} topics with named activity tools</Typography></Paper>)}</Box></Stack>}
    {stage === 'tool' && <Stack spacing={1.5}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><FormControl fullWidth size="small"><InputLabel>Subject</InputLabel><Select label="Subject" value={subject ?? ''} onChange={(event) => chooseSubject(event.target.value as StemSubject)}>{STEM_SUBJECTS.map((item) => <MenuItem key={item} value={item}>{STEM_SUBJECT_LABELS[item]}</MenuItem>)}</Select></FormControl><FormControl fullWidth size="small" disabled={!subject}><InputLabel>Grade</InputLabel><Select label="Grade" value={selectedGrade} onChange={(event) => chooseGrade(Number(event.target.value))}>{STEM_GRADES.map((grade) => <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>)}</Select></FormControl></Stack>{subject && <><Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Topics for {STEM_SUBJECT_LABELS[subject]} · Grade {selectedGrade}</Typography><Typography variant="caption" color="text.secondary">Each topic has its own practical activity tools. Select a topic to see its tools.</Typography></Box><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>{topics.map((item) => <Paper key={item.topic} component="button" type="button" variant="outlined" onClick={() => chooseTopic(item.topic)} sx={{ minHeight: 64, p: 1.25, textAlign: 'left', color: 'text.primary', backgroundColor: 'background.default', cursor: 'pointer', borderColor: selectedTopic?.topic === item.topic ? 'primary.main' : 'divider', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{item.topic}</Typography><Typography variant="caption" color="text.secondary">{item.tools.length} named tool{item.tools.length === 1 ? '' : 's'}</Typography></Paper>)}</Box>{selectedTopic && <><Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Activity tools for {selectedTopic.topic}</Typography><Typography variant="caption" color="text.secondary">Choose the named tool learners will use for this topic.</Typography></Box><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1 }}>{selectedTopic.tools.map((tool) => <Paper key={tool.label} component="button" type="button" variant="outlined" onClick={() => chooseTool(subject, tool.implementation, tool.label)} sx={{ minHeight: 58, p: 1.25, textAlign: 'left', color: 'text.primary', backgroundColor: 'background.default', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}><Typography variant="body2" sx={{ fontWeight: 700 }}>{tool.label}</Typography><Typography variant="caption" color="text.secondary">Interactive activity</Typography></Paper>)}</Box></>}</>}</Stack>}
    {stage === 'configure' && (definition ? <Stack spacing={2}><Stack direction="row" alignItems="center" justifyContent="space-between"><Box><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Configure {lesson.title.split(' · ').pop() || definition.label}</Typography><Typography variant="caption" color="text.secondary">Changes return this activity to draft until you preview and publish it again.</Typography></Box><Chip label="Interactive activity" size="small" /></Stack><definition.Builder lesson={lesson} config={config} onConfigChange={updateConfig} />{!ready && <Typography variant="caption" color="warning.main">Complete the required configuration before previewing this activity.</Typography>}</Stack> : <Paper variant="outlined" sx={{ p: 2 }}><Typography color="text.secondary">Choose a subject, grade, topic, and activity tool before configuring it.</Typography></Paper>)}
    {stage === 'preview' && definition && ready && <Stack spacing={1.25}><Box><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Learner preview</Typography><Typography variant="caption" color="text.secondary">This preview does not record completion or progress.</Typography></Box><StemActivityPlayer lesson={lesson} preview onResult={() => undefined} /></Stack>}
    {stage === 'publish' && <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1.25}><Box><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Ready to publish</Typography><Typography variant="body2" color="text.secondary">Publishing makes this {lesson.title.split(' · ').pop() || 'activity'} available to learners when the lesson is saved.</Typography></Box><Button variant="contained" disabled={!previewed || lesson.stemLabPublished} onClick={() => updateLessonDraft({ ...lesson, config: { ...config, gradeBand, grade: selectedGrade }, stemLabPublished: true })} sx={{ alignSelf: 'flex-start' }}>{lesson.stemLabPublished ? 'Activity published' : 'Publish activity'}</Button></Stack></Paper>}
  </Stack>
}

export const StemActivityPlayer: FC<{ lesson: Pick<AdminLesson, 'title' | 'subtype' | 'config'>; preview?: boolean; onResult: (result: StemActivityResult) => void; onAttempt?: (attempt: StemActivityAttempt) => void }> = ({ lesson, preview = false, onResult, onAttempt }) => {
  const definition = getStemToolBySubtype(lesson.subtype)
  const config = getStemConfig(lesson)
  const completed = useRef(false)
  const [isComplete, setIsComplete] = useState(false)
  const gradeBand = config.gradeBand ?? definition?.defaultConfig.gradeBand ?? 'grade_7_9'
  useEffect(() => { completed.current = false; setIsComplete(false) }, [lesson.subtype, lesson.title])
  const reportAttempt = (values: Record<string, unknown>, correct: boolean) => {
    if (!preview && definition) onAttempt?.({ subtype: definition.subtype, subject: definition.subject, gradeBand, values, correct })
  }
  const finish = (values: Record<string, unknown> = {}) => {
    if (preview || completed.current || !definition) return
    completed.current = true
    setIsComplete(true)
    onResult({ subtype: definition.subtype, subject: definition.subject, gradeBand, values })
  }
  if (!definition) return <Paper variant="outlined" sx={{ p: 3 }}><Typography color="text.secondary">This activity tool is not recognized.</Typography></Paper>
  const Player = definition.Player
  const activityLabel = lesson.title.split(' · ').pop() || definition.label
  return <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}><Stack spacing={2.25}><Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'flex-start' }} justifyContent="space-between" spacing={1}><Box><Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>{STEM_SUBJECT_LABELS[definition.subject]} · {activityLabel}</Typography><Typography variant="h6">{lesson.title}</Typography>{config.topic && <Typography variant="body2" color="text.secondary">{config.topic}</Typography>}</Box>{preview && <Chip label="Preview" color="info" />}</Stack><Typography color="text.secondary">{config.instructions}</Typography><Player config={config} onComplete={finish} onAttempt={reportAttempt} />{isComplete && <Paper variant="outlined" sx={{ p: 1.25, borderColor: 'success.main', backgroundColor: 'success.light' }}><Stack direction="row" spacing={1} alignItems="center"><CheckCircleOutlineIcon color="success" /><Typography variant="body2" sx={{ fontWeight: 700 }}>Activity complete. Your lesson progress and XP have been updated.</Typography></Stack></Paper>}</Stack></Paper>
}
