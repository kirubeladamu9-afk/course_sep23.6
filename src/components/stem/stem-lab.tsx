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
import { STEM_CURRICULUM, STEM_CURRICULUM_VALIDATION, type StemCurriculumSubject } from './stem-curriculum'
import { defaultStemLabConfig, getStemToolBySubtype, getStemToolsForSubject, STEM_LAB_REGISTRY } from './stem-lab-registry'
import { STEM_GRADE_BAND_LABELS, STEM_SUBJECT_LABELS, STEM_SUBJECTS, type StemActivityAttempt, type StemActivityResult, type StemGradeBand, type StemLabConfig, type StemSubject, type StemTool } from './stem-types'

export const getStemConfig = (lesson: Pick<AdminLesson, 'subtype' | 'config'>): StemLabConfig => {
  const definition = getStemToolBySubtype(lesson.subtype)
  return structuredClone(lesson.config ?? definition?.defaultConfig ?? STEM_LAB_REGISTRY[0].defaultConfig)
}

type AuthoringStage = 'subject' | 'curriculum' | 'tool' | 'configure' | 'preview' | 'publish'

const curriculumSubjectToStemSubject: Record<StemCurriculumSubject, StemSubject> = {
  mathematics: 'math',
  physics: 'physics',
  chemistry: 'chemistry',
  biology: 'biology',
}

const gradeToBand = (grade: number): StemGradeBand => grade <= 3 ? 'grade_1_3' : grade <= 6 ? 'grade_4_6' : grade <= 9 ? 'grade_7_9' : 'grade_10_12'

export const StemLabEditor: FC<{ lesson: AdminLesson; updateLessonDraft: (lesson: AdminLesson) => void }> = ({ lesson, updateLessonDraft }) => {
  const definition = getStemToolBySubtype(lesson.subtype)
  const savedConfig = getStemConfig(lesson)
  const [selectedSubject, setSelectedSubject] = useState<StemSubject | undefined>(definition?.subject)
  const [selectedGradeBand, setSelectedGradeBand] = useState<StemGradeBand | undefined>(() => savedConfig.gradeBand ?? definition?.defaultConfig.gradeBand ?? 'grade_7_9')
  const subject = definition?.subject ?? selectedSubject
  const gradeBand = selectedGradeBand ?? savedConfig.gradeBand ?? definition?.defaultConfig.gradeBand ?? 'grade_7_9'
  const config = { ...savedConfig, gradeBand } as StemLabConfig
  const [stage, setStage] = useState<AuthoringStage>(definition ? 'configure' : 'subject')
  const [previewed, setPreviewed] = useState(false)
  const [curriculumGrade, setCurriculumGrade] = useState<number | undefined>()
  const [curriculumSubject, setCurriculumSubject] = useState<StemCurriculumSubject | undefined>()
  const [curriculumTopic, setCurriculumTopic] = useState<string | undefined>()
  const ready = definition ? definition.isConfigured(config) : false
  const curriculumGradeEntry = STEM_CURRICULUM.find((entry) => entry.grade === curriculumGrade)
  const curriculumSubjectEntry = curriculumGradeEntry?.subjects.find((entry) => entry.subject === curriculumSubject)

  useEffect(() => {
    setSelectedSubject(definition?.subject)
    setSelectedGradeBand(savedConfig.gradeBand ?? definition?.defaultConfig.gradeBand ?? 'grade_7_9')
    setCurriculumGrade(undefined)
    setCurriculumSubject(undefined)
    setCurriculumTopic(undefined)
    setStage(definition ? 'configure' : 'subject')
    setPreviewed(false)
  }, [lesson.id])

  const chooseSubject = (nextSubject: StemSubject) => {
    setSelectedSubject(nextSubject)
    setSelectedGradeBand(undefined)
    setCurriculumTopic(undefined)
    updateLessonDraft({ ...lesson, subtype: undefined, config: undefined, stemLabPublished: false })
    setPreviewed(false)
    setStage('tool')
  }
  const chooseGradeBand = (nextGradeBand: StemGradeBand) => {
    setSelectedGradeBand(nextGradeBand)
    setCurriculumTopic(undefined)
    updateLessonDraft({ ...lesson, subtype: undefined, config: undefined, stemLabPublished: false })
    setPreviewed(false)
    setStage('tool')
  }
  const chooseCurriculumTopic = (topic: string) => {
    if (!curriculumGrade || !curriculumSubject) return
    const nextSubject = curriculumSubjectToStemSubject[curriculumSubject]
    const nextGradeBand = gradeToBand(curriculumGrade)
    setSelectedSubject(nextSubject)
    setSelectedGradeBand(nextGradeBand)
    setCurriculumTopic(topic)
    updateLessonDraft({ ...lesson, title: `Grade ${curriculumGrade} · ${curriculumSubjectEntry?.label ?? curriculumSubject} · ${topic}`, subtype: undefined, config: undefined, stemLabPublished: false })
    setPreviewed(false)
    setStage('tool')
  }
  const chooseTool = (nextSubject: StemSubject, nextTool: StemTool) => {
    const nextConfig = { ...defaultStemLabConfig(nextSubject, nextTool), gradeBand }
    if (curriculumTopic) nextConfig.topic = curriculumTopic
    const nextDefinition = getStemToolBySubtype(`${nextSubject}.${nextTool}`)
    updateLessonDraft({ ...lesson, subtype: nextDefinition?.subtype, config: nextConfig, stemLabPublished: false })
    setPreviewed(false)
    setStage('configure')
  }
  const updateConfig = (nextConfig: StemLabConfig) => {
    updateLessonDraft({ ...lesson, config: { ...nextConfig, gradeBand }, stemLabPublished: false })
    setPreviewed(false)
    setStage('configure')
  }

  return <Stack spacing={2.5}>
    <Box><Typography variant="subtitle1" sx={{ fontWeight: 700 }}>STEM Lab authoring</Typography><Typography variant="body2" color="text.secondary">Choose a subject, select one learning tool, configure it, preview it, and publish it with this lesson.</Typography></Box>
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} useFlexGap flexWrap="wrap" aria-label="STEM Lab authoring steps"><Button variant={stage === 'subject' ? 'contained' : 'outlined'} onClick={() => setStage('subject')}>1. Subject</Button><Button variant={stage === 'tool' ? 'contained' : 'outlined'} disabled={!subject} onClick={() => setStage('tool')}>2. Tool</Button><Button variant={stage === 'configure' ? 'contained' : 'outlined'} disabled={!definition} onClick={() => setStage('configure')}>3. Configure</Button><Button variant={stage === 'preview' ? 'contained' : 'outlined'} disabled={!ready} onClick={() => { setPreviewed(true); setStage('preview') }}>4. Preview</Button><Button variant={stage === 'publish' ? 'contained' : 'outlined'} disabled={!previewed} onClick={() => setStage('publish')}>5. Publish</Button></Stack>
    {stage === 'subject' && <Stack spacing={1.5}><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Choose how to start</Typography><Paper component="button" type="button" variant="outlined" onClick={() => setStage('curriculum')} sx={{ p: 2, textAlign: 'left', color: 'text.primary', backgroundColor: 'background.default', cursor: 'pointer', borderColor: 'primary.main', '&:hover': { backgroundColor: 'action.hover' } }}><Typography sx={{ fontWeight: 800 }}>Browse by Curriculum Chapter</Typography><Typography variant="body2" color="text.secondary">Start with a read-only Grade → Subject → Topic chapter browser, then continue to the existing tool picker.</Typography><Typography variant="caption" color="primary.main">{STEM_CURRICULUM_VALIDATION.gradeCount} grades · {STEM_CURRICULUM_VALIDATION.subjectCount} subjects · {STEM_CURRICULUM_VALIDATION.topicCount} topics</Typography></Paper><Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 1 }}>Browse by Subject / Tool</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1 }}>{STEM_SUBJECTS.map((item) => <Paper key={item} component="button" type="button" variant="outlined" onClick={() => chooseSubject(item)} sx={{ minHeight: 92, p: 2, textAlign: 'left', color: 'text.primary', backgroundColor: 'background.default', cursor: 'pointer', borderColor: subject === item ? 'primary.main' : 'divider', '&:hover': { borderColor: 'primary.main' } }}><Typography sx={{ fontWeight: 800 }}>{STEM_SUBJECT_LABELS[item]}</Typography><Typography variant="body2" color="text.secondary">{getStemToolsForSubject(item).length} available tools</Typography></Paper>)}</Box></Stack>}
    {stage === 'curriculum' && <Stack spacing={1.5}><Box><Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Browse by Curriculum Chapter</Typography><Typography variant="body2" color="text.secondary">Select a chapter to use as a labeled starting point. Tool and configuration mapping remains unchanged.</Typography></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><FormControl fullWidth size="small"><InputLabel>Grade</InputLabel><Select label="Grade" value={curriculumGrade ?? ''} onChange={(event) => { setCurriculumGrade(Number(event.target.value)); setCurriculumSubject(undefined); setCurriculumTopic(undefined) }}>{STEM_CURRICULUM.map((entry) => <MenuItem key={entry.grade} value={entry.grade}>Grade {entry.grade}</MenuItem>)}</Select></FormControl><FormControl fullWidth size="small" disabled={!curriculumGradeEntry}><InputLabel>Subject</InputLabel><Select label="Subject" value={curriculumSubject ?? ''} onChange={(event) => { setCurriculumSubject(event.target.value as StemCurriculumSubject); setCurriculumTopic(undefined) }}>{curriculumGradeEntry?.subjects.map((entry) => <MenuItem key={entry.subject} value={entry.subject}>{entry.label}</MenuItem>)}</Select></FormControl></Stack>{curriculumSubjectEntry && <Stack spacing={1}><Typography variant="body2" sx={{ fontWeight: 700 }}>Topics in Grade {curriculumGrade} · {curriculumSubjectEntry.label}</Typography><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1 }}>{curriculumSubjectEntry.topics.map((topic, index) => <Paper key={`${topic}-${index}`} component="button" type="button" variant="outlined" onClick={() => chooseCurriculumTopic(topic)} sx={{ p: 1.25, textAlign: 'left', color: 'text.primary', backgroundColor: 'background.default', cursor: 'pointer', '&:hover': { borderColor: 'primary.main', backgroundColor: 'action.hover' } }}><Typography variant="body2" sx={{ fontWeight: 600 }}>{index + 1}. {topic}</Typography></Paper>)}</Box></Stack>}<Button variant="text" onClick={() => setStage('subject')} sx={{ alignSelf: 'flex-start' }}>Back to Subject / Tool picker</Button></Stack>}
    {stage === 'tool' && <Stack spacing={1.5}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}><FormControl fullWidth size="small"><InputLabel>Subject</InputLabel><Select label="Subject" value={subject ?? ''} onChange={(event) => chooseSubject(event.target.value as StemSubject)}>{STEM_SUBJECTS.map((item) => <MenuItem key={item} value={item}>{STEM_SUBJECT_LABELS[item]}</MenuItem>)}</Select></FormControl><FormControl fullWidth size="small" disabled={!subject}><InputLabel>Grade band</InputLabel><Select label="Grade band" value={selectedGradeBand ?? ''} onChange={(event) => chooseGradeBand(event.target.value as StemGradeBand)}>{(Object.keys(STEM_GRADE_BAND_LABELS) as StemGradeBand[]).map((item) => <MenuItem key={item} value={item}>{STEM_GRADE_BAND_LABELS[item]}</MenuItem>)}</Select></FormControl></Stack>{subject && selectedGradeBand ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1 }}>{getStemToolsForSubject(subject).filter((item) => item.gradeBands.includes(selectedGradeBand)).map((item) => <Paper key={item.subtype} component="button" type="button" variant="outlined" onClick={() => chooseTool(item.subject, item.tool)} sx={{ minHeight: 92, display: 'flex', alignItems: 'center', gap: 1.25, p: 1.5, textAlign: 'left', color: 'text.primary', backgroundColor: 'background.default', cursor: 'pointer', borderColor: definition?.subtype === item.subtype ? 'primary.main' : 'divider', '&:hover': { borderColor: 'primary.main' } }}><Box sx={{ color: 'primary.main', display: 'flex' }}>{item.icon}</Box><Box sx={{ minWidth: 0 }}><Typography sx={{ fontWeight: 800 }}>{item.label}</Typography><Chip size="small" label={item.mode === 'build' ? 'Interactive build' : 'Embedded tool'} variant="outlined" /></Box></Paper>)}</Box> : <Typography color="text.secondary">Choose a subject and grade band first.</Typography>}</Stack>}
    {stage === 'configure' && (definition ? <Stack spacing={2}><Stack direction="row" alignItems="center" justifyContent="space-between"><Box><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Configure {definition.label}</Typography><Typography variant="caption" color="text.secondary">Changes return this lab to draft until you preview and publish it again.</Typography></Box><Chip label={definition.mode === 'build' ? 'Interactive build' : 'Embedded tool'} size="small" /></Stack><definition.Builder lesson={lesson} config={config} onConfigChange={updateConfig} />{!ready && <Typography variant="caption" color="warning.main">Complete the required configuration before previewing this lab.</Typography>}</Stack> : <Paper variant="outlined" sx={{ p: 2 }}><Typography color="text.secondary">Choose a subject and tool before configuring this lab.</Typography></Paper>)}
    {stage === 'preview' && definition && ready && <Stack spacing={1.25}><Box><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Learner preview</Typography><Typography variant="caption" color="text.secondary">This preview does not record completion or progress.</Typography></Box><StemActivityPlayer lesson={lesson} preview onResult={() => undefined} /></Stack>}
    {stage === 'publish' && <Paper variant="outlined" sx={{ p: 2 }}><Stack spacing={1.25}><Box><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Ready to publish</Typography><Typography variant="body2" color="text.secondary">Publishing makes this {definition?.label ?? 'STEM'} activity available to learners when the lesson is saved.</Typography></Box><Button variant="contained" disabled={!previewed || lesson.stemLabPublished} onClick={() => updateLessonDraft({ ...lesson, config: { ...config, gradeBand }, stemLabPublished: true })} sx={{ alignSelf: 'flex-start' }}>{lesson.stemLabPublished ? 'STEM Lab published' : 'Publish STEM Lab'}</Button></Stack></Paper>}
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
  if (!definition) return <Paper variant="outlined" sx={{ p: 3 }}><Typography color="text.secondary">This STEM Lab tool is not recognized.</Typography></Paper>
  const Player = definition.Player
  return <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}><Stack spacing={2.25}><Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'flex-start' }} justifyContent="space-between" spacing={1}><Box><Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>{STEM_SUBJECT_LABELS[definition.subject]} · {definition.label}</Typography><Typography variant="h6">{lesson.title}</Typography>{config.topic && <Typography variant="body2" color="text.secondary">{config.topic}</Typography>}</Box>{preview && <Chip label="Preview" color="info" />}</Stack><Typography color="text.secondary">{config.instructions}</Typography><Player config={config} onComplete={finish} onAttempt={reportAttempt} />{isComplete && <Paper variant="outlined" sx={{ p: 1.25, borderColor: 'success.main', backgroundColor: 'success.light' }}><Stack direction="row" spacing={1} alignItems="center"><CheckCircleOutlineIcon color="success" /><Typography variant="body2" sx={{ fontWeight: 700 }}>Activity complete. Your lesson progress and XP have been updated.</Typography></Stack></Paper>}</Stack></Paper>
}
