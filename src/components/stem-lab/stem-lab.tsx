import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import { type FC, useMemo, useState } from 'react'
import SimulationLesson from '@/components/course/simulation-lesson'
import { getStemTool, type StemToolId } from './stem-tool-library'
import { type StemGradeBand, type StemSubject, type StemTool, type StemTopic, STEM_GRADE_BANDS, STEM_SUBJECTS, STEM_TOPICS } from './stem-lab-data'

const subjectColors: Record<StemSubject, 'primary' | 'secondary' | 'success' | 'warning'> = { Math: 'primary', Physics: 'secondary', Chemistry: 'warning', Biology: 'success' }
const toolDescription: Record<StemTool, string> = {
  'Interactive Diagram': 'Explore labeled parts and relationships.',
  Calculator: 'Calculate the value and explain the result.',
  Graph: 'Plot values and interpret the pattern.',
  'Periodic Table': 'Compare an element and its properties.',
  'Chemical Equation': 'Inspect and balance the equation.',
  'Number Line': 'Place values and compare their position.',
  'Counting Visualizer': 'Build groups and count what you see.',
  'Shape Matcher': 'Match a shape to its defining features.',
  'Fraction Visualizer': 'Build equal parts and compare fractions.',
  'Geometry Builder': 'Construct a shape and change its dimensions.',
  'Pendulum Lab': 'Adjust pendulum inputs and validate the period observation.',
  'Neutralization Lab': 'Mix acid and base inputs and validate the pH observation.',
  'Osmosis Lab': 'Adjust concentrations and validate water movement.',
  'Projectile Motion Lab': 'Adjust launch conditions and validate the range observation.',
}

const ToolStep: FC<{ tool: StemTool; onComplete: () => void }> = ({ tool, onComplete }) => <Paper elevation={0} sx={{ p: 3, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Chip label={tool} color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} /><Typography variant="h6">{tool}</Typography><Typography color="text.secondary">{toolDescription[tool]}</Typography><Button variant="contained" onClick={onComplete} startIcon={<CheckCircleOutlineIcon />} sx={{ alignSelf: 'flex-start' }}>Complete step</Button></Stack></Paper>

const readyToolIds: Partial<Record<StemTool, StemToolId>> = { 'Pendulum Lab': 'pendulum-lab', 'Neutralization Lab': 'neutralization-lab', 'Osmosis Lab': 'osmosis-lab', 'Projectile Motion Lab': 'projectile-motion-lab' }

const ActivityDialog: FC<{ topic: StemTopic; open: boolean; onClose: () => void; onComplete: () => void }> = ({ topic, open, onClose, onComplete }) => {
  const [step, setStep] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])
  const currentTool = topic.tools[Math.min(step, topic.tools.length - 1)]
  const simulationConfig = topic.simulation ?? getStemTool(readyToolIds[currentTool])?.config
  const isLastStep = step === topic.activitySteps.length - 1
  const markStepComplete = () => {
    setCompleted((current) => current.includes(step) ? current : [...current, step])
    if (!isLastStep) setStep((current) => current + 1)
    else onComplete()
  }
  const close = () => { setStep(0); setCompleted([]); onClose() }
  return <Dialog open={open} onClose={close} fullWidth maxWidth="md" scroll="paper"><DialogTitle sx={{ pb: 1 }}>{topic.title}</DialogTitle><DialogContent dividers><Stack spacing={2.5}><Typography color="text.secondary">{topic.overview}</Typography><Stepper activeStep={step} alternativeLabel>{topic.activitySteps.map((label, index) => <Step key={label} completed={completed.includes(index)}><StepButton color="inherit" onClick={() => completed.includes(index) && setStep(index)}>{label}</StepButton></Step>)}</Stepper>{simulationConfig ? <SimulationLesson config={simulationConfig} onValidated={markStepComplete} /> : <ToolStep tool={currentTool} onComplete={markStepComplete} />}{completed.includes(step) && !isLastStep && <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>Step complete. Continue to the next activity.</Typography>}</Stack></DialogContent><DialogActions><Button onClick={close}>Exit activity</Button></DialogActions></Dialog>
}

export interface StemLabProps {
  completedTopicIds?: string[]
  onActivityComplete?: (topic: StemTopic) => void
}

const StemLab: FC<StemLabProps> = ({ completedTopicIds = [], onActivityComplete }) => {
  const [subject, setSubject] = useState<StemSubject | 'All'>('All')
  const [gradeBand, setGradeBand] = useState<StemGradeBand | 'All'>('All')
  const [activeTopic, setActiveTopic] = useState<StemTopic | null>(null)
  const completed = useMemo(() => new Set(completedTopicIds), [completedTopicIds])
  const topics = STEM_TOPICS.filter((topic) => (subject === 'All' || topic.subject === subject) && (gradeBand === 'All' || topic.gradeBand === gradeBand))
  const availableCount = topics.filter((topic) => topic.status === 'available').length
  const completeTopic = () => { if (activeTopic) onActivityComplete?.(activeTopic) }

  return <Box sx={{ maxWidth: 1320, mx: 'auto' }}><Stack spacing={3}><Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, border: 1, borderColor: 'divider', background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 140%)`, color: 'primary.contrastText' }}><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3} alignItems={{ md: 'center' }}><Box><Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800, letterSpacing: 1.2 }}>Explore, test, explain</Typography><Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: '-.04em', mb: 1 }}>STEM Lab</Typography><Typography sx={{ maxWidth: 680, opacity: 0.9, lineHeight: 1.7 }}>Browse hands-on activities by subject and grade band. Every available topic is a short 2–5 step sequence with a clear result to observe.</Typography></Box><ScienceOutlinedIcon sx={{ fontSize: { xs: 64, md: 104 }, opacity: 0.8 }} /></Stack></Paper><Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}><FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Subject</InputLabel><Select label="Subject" value={subject} onChange={(event) => setSubject(event.target.value as StemSubject | 'All')}><MenuItem value="All">All subjects</MenuItem>{STEM_SUBJECTS.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl><FormControl size="small" sx={{ minWidth: 180 }}><InputLabel>Grade band</InputLabel><Select label="Grade band" value={gradeBand} onChange={(event) => setGradeBand(event.target.value as StemGradeBand | 'All')}><MenuItem value="All">All grades</MenuItem>{STEM_GRADE_BANDS.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</Select></FormControl><Typography variant="body2" color="text.secondary" sx={{ ml: { md: 'auto' } }}>{availableCount} available · {topics.length - availableCount} coming soon</Typography></Stack><Grid container spacing={2}>{topics.map((topic) => { const isCompleted = completed.has(topic.id); return <Grid item xs={12} md={6} lg={4} key={topic.id}><Card elevation={0} sx={{ height: '100%', border: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', transition: 'transform .18s ease, box-shadow .18s ease', '&:hover': { transform: 'translateY(-3px)', boxShadow: 4 } }}><CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 1.5 }}><Stack direction="row" justifyContent="space-between" alignItems="center"><Chip size="small" label={topic.subject} color={subjectColors[topic.subject]} /><Chip size="small" variant="outlined" label={topic.gradeBand} /></Stack><Typography variant="h6" sx={{ fontWeight: 800 }}>{topic.title}</Typography><Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, flex: 1 }}>{topic.overview}</Typography><Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>{topic.tools.map((tool) => <Chip key={tool} label={tool} size="small" variant="outlined" />)}</Stack><Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}><Typography variant="caption" color="text.secondary">{topic.activitySteps.length} steps</Typography>{topic.status === 'coming-soon' ? <Chip label="Coming Soon" size="small" color="default" /> : <Button size="small" variant={isCompleted ? 'outlined' : 'contained'} startIcon={isCompleted ? <CheckCircleOutlineIcon /> : <PlayArrowIcon />} onClick={() => setActiveTopic(topic)}>{isCompleted ? 'Completed' : 'Launch'}</Button>}</Stack></CardContent></Card></Grid>})}</Grid>{topics.length === 0 && <Paper elevation={0} sx={{ p: 5, textAlign: 'center', border: 1, borderColor: 'divider' }}><AutoGraphOutlinedIcon color="disabled" sx={{ fontSize: 48 }} /><Typography variant="h6" sx={{ mt: 1 }}>No topics in this view</Typography><Typography color="text.secondary">Try another subject or grade band.</Typography></Paper>}</Stack><ActivityDialog topic={activeTopic ?? topics[0]} open={Boolean(activeTopic)} onClose={() => setActiveTopic(null)} onComplete={() => { completeTopic(); setActiveTopic(null) }} /></Box>
}

export default StemLab
