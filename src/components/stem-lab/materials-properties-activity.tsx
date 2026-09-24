import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import GrainOutlinedIcon from '@mui/icons-material/GrainOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import OpacityOutlinedIcon from '@mui/icons-material/OpacityOutlined'
import ReplayIcon from '@mui/icons-material/Replay'
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined'
import StraightenOutlinedIcon from '@mui/icons-material/StraightenOutlined'
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined'
import { type DragEvent, type FC, type ReactNode, useState } from 'react'

type MaterialSample = {
  id: string
  label: string
  flexibility: 'Flexible' | 'Rigid'
  flexibilityScore: number
  hardness: 'Soft' | 'Hard'
  shininess: 'Shiny' | 'Not shiny'
  color: string
  icon: ReactNode
}

type TestKind = 'bend' | 'scratch' | 'shine'
type MixOutcome = 'dissolves' | 'mixture' | 'layers'

type MixSubstance = {
  id: string
  label: string
  kind: 'tested' | 'lab'
  color: string
  icon: ReactNode
}

type Feedback = {
  kind: 'success' | 'warning'
  message: string
}

const SAMPLE_POOL: MaterialSample[] = [
  { id: 'rubber', label: 'Rubber', flexibility: 'Flexible', flexibilityScore: 96, hardness: 'Soft', shininess: 'Not shiny', color: '#d9596c', icon: <GrainOutlinedIcon /> },
  { id: 'wood', label: 'Wood', flexibility: 'Rigid', flexibilityScore: 22, hardness: 'Hard', shininess: 'Not shiny', color: '#a86b3d', icon: <GrainOutlinedIcon /> },
  { id: 'metal', label: 'Metal', flexibility: 'Rigid', flexibilityScore: 8, hardness: 'Hard', shininess: 'Shiny', color: '#718096', icon: <StraightenOutlinedIcon /> },
  { id: 'glass', label: 'Glass', flexibility: 'Rigid', flexibilityScore: 4, hardness: 'Hard', shininess: 'Shiny', color: '#48a9b8', icon: <AutoAwesomeOutlinedIcon /> },
  { id: 'fabric', label: 'Fabric', flexibility: 'Flexible', flexibilityScore: 88, hardness: 'Soft', shininess: 'Not shiny', color: '#9c6ade', icon: <GrainOutlinedIcon /> },
  { id: 'plastic', label: 'Plastic', flexibility: 'Flexible', flexibilityScore: 58, hardness: 'Hard', shininess: 'Shiny', color: '#3f83c6', icon: <ScienceOutlinedIcon /> },
  { id: 'paper', label: 'Paper', flexibility: 'Flexible', flexibilityScore: 72, hardness: 'Soft', shininess: 'Not shiny', color: '#d8a746', icon: <StraightenOutlinedIcon /> },
  { id: 'ceramic', label: 'Ceramic', flexibility: 'Rigid', flexibilityScore: 3, hardness: 'Hard', shininess: 'Shiny', color: '#e38b62', icon: <ScienceOutlinedIcon /> },
]

const LAB_SUBSTANCES: Record<string, MixSubstance> = {
  sugar: { id: 'sugar', label: 'Sugar', kind: 'lab', color: '#f1c75b', icon: <GrainOutlinedIcon /> },
  salt: { id: 'salt', label: 'Salt', kind: 'lab', color: '#dce8ef', icon: <GrainOutlinedIcon /> },
  sand: { id: 'sand', label: 'Sand', kind: 'lab', color: '#c9a86a', icon: <GrainOutlinedIcon /> },
  water: { id: 'water', label: 'Water', kind: 'lab', color: '#3c9edb', icon: <WaterDropOutlinedIcon /> },
  oil: { id: 'oil', label: 'Oil', kind: 'lab', color: '#dfaa38', icon: <OpacityOutlinedIcon /> },
}

const MIX_PAIR_POOL: Array<{ ids: [string, string]; outcome: MixOutcome }> = [
  { ids: ['sugar', 'water'], outcome: 'dissolves' },
  { ids: ['salt', 'water'], outcome: 'dissolves' },
  { ids: ['sand', 'water'], outcome: 'mixture' },
  { ids: ['oil', 'water'], outcome: 'layers' },
]

const OUTCOME_COPY: Record<MixOutcome, { label: string; detail: string }> = {
  dissolves: { label: 'Dissolves completely', detail: 'The solute particles spread through the liquid, so the mixture looks uniform.' },
  mixture: { label: 'Forms a visible mixture', detail: 'The particles stay separate, so you can still see the mixed substances.' },
  layers: { label: 'Separates into layers', detail: 'The liquids do not combine and settle into distinct layers.' },
}

const shuffle = <T,>(items: T[]) => {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

const makeRound = () => {
  const samples = shuffle(SAMPLE_POOL).slice(0, 6)
  const pair = shuffle(MIX_PAIR_POOL)[0]
  const labSubstances = pair.ids.map((id) => LAB_SUBSTANCES[id])
  return { samples, pair, labSubstances }
}

const testLabel: Record<TestKind, string> = { bend: 'Bend it', scratch: 'Scratch it', shine: 'Shine test' }
const testIcon: Record<TestKind, ReactNode> = { bend: <StraightenOutlinedIcon />, scratch: <ScienceOutlinedIcon />, shine: <LightModeOutlinedIcon /> }

const PropertyTestAnimation: FC<{ test: TestKind; sample: MaterialSample }> = ({ test, sample }) => {
  if (test === 'bend') return <Box sx={{ width: 88, height: 52, display: 'grid', placeItems: 'center', animation: 'materialBend .75s ease-in-out', '@keyframes materialBend': { '0%, 100%': { transform: 'rotate(0)' }, '50%': { transform: `rotate(${sample.flexibility === 'Flexible' ? 20 : 3}deg) skewX(${sample.flexibility === 'Flexible' ? -12 : 0}deg)` } } }}><Box sx={{ width: 58, height: 16, borderRadius: 2, backgroundColor: sample.color, border: 2, borderColor: 'rgba(0,0,0,.14)' }} /></Box>
  if (test === 'scratch') return <Box sx={{ position: 'relative', width: 88, height: 52, display: 'grid', placeItems: 'center', animation: 'materialScratch .75s ease-in-out', '@keyframes materialScratch': { '0%': { transform: 'translateX(-8px)' }, '50%': { transform: 'translateX(8px)' }, '100%': { transform: 'translateX(0)' } } }}><Box sx={{ width: 58, height: 28, borderRadius: 1.5, backgroundColor: sample.color }} /><Box sx={{ position: 'absolute', width: 36, height: 4, borderRadius: 2, backgroundColor: '#5d4037', transform: 'rotate(-18deg)', opacity: sample.hardness === 'Soft' ? 1 : .25 }} /></Box>
  return <Box sx={{ position: 'relative', width: 88, height: 52, display: 'grid', placeItems: 'center', overflow: 'hidden', animation: 'materialShine .85s ease-in-out', '@keyframes materialShine': { '0%': { backgroundPosition: '-80px 0' }, '100%': { backgroundPosition: '80px 0' } }, background: `linear-gradient(110deg, transparent 35%, ${sample.shininess === 'Shiny' ? '#fff' : `${sample.color}66`} 50%, transparent 65%)`, backgroundSize: '160px 100%' }}><Box sx={{ width: 58, height: 28, borderRadius: 1.5, backgroundColor: sample.color, opacity: .9 }} /></Box>
}

const MaterialsPropertiesActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [round, setRound] = useState(() => makeRound())
  const [stage, setStage] = useState<1 | 2>(1)
  const [selectedSampleId, setSelectedSampleId] = useState(round.samples[0]?.id ?? '')
  const [testedProperties, setTestedProperties] = useState<Record<string, Record<TestKind, boolean>>>({})
  const [activeTest, setActiveTest] = useState<TestKind | null>(null)
  const [stageOneAnswer, setStageOneAnswer] = useState<string | null>(null)
  const [stageOneComplete, setStageOneComplete] = useState(false)
  const [mixPlacements, setMixPlacements] = useState<string[]>([])
  const [selectedMixId, setSelectedMixId] = useState<string | null>(null)
  const [prediction, setPrediction] = useState<MixOutcome | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [completed, setCompleted] = useState(false)
  const [celebrating, setCelebrating] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const selectedSample = round.samples.find((sample) => sample.id === selectedSampleId) ?? round.samples[0]
  const allPropertiesRecorded = round.samples.every((sample) => Boolean(testedProperties[sample.id]?.bend && testedProperties[sample.id]?.scratch && testedProperties[sample.id]?.shine))
  const mostFlexible = round.samples.reduce((best, sample) => sample.flexibilityScore > best.flexibilityScore ? sample : best, round.samples[0])
  const mixSubstances = round.labSubstances
  const mixOutcome = mixPlacements.length === 2 && mixPlacements.includes(round.pair.ids[0]) && mixPlacements.includes(round.pair.ids[1]) ? round.pair.outcome : resolveOutcome(mixPlacements)
  const mixCards = mixSubstances
  const placedMixCards = mixCards.filter((substance) => mixPlacements.includes(substance.id))

  function resolveOutcome(ids: string[]): MixOutcome | null {
    if (ids.length !== 2) return null
    const key = new Set(ids)
    if (key.has('water') && (key.has('sugar') || key.has('salt'))) return 'dissolves'
    if (key.has('water') && key.has('oil')) return 'layers'
    return 'mixture'
  }

  const runTest = (test: TestKind) => {
    if (!selectedSample) return
    setActiveTest(test)
    setFeedback(null)
    setTestedProperties((current) => ({ ...current, [selectedSample.id]: { bend: current[selectedSample.id]?.bend ?? false, scratch: current[selectedSample.id]?.scratch ?? false, shine: current[selectedSample.id]?.shine ?? false, [test]: true } }))
    window.setTimeout(() => setActiveTest(null), 850)
  }

  const checkStageOne = () => {
    if (!allPropertiesRecorded || !stageOneAnswer) return
    if (stageOneAnswer !== mostFlexible.id) {
      setFeedback({ kind: 'warning', message: 'Look again at the bend test. Compare how far each sample flexed before choosing.' })
      setStageOneComplete(false)
      return
    }
    setStageOneComplete(true)
    setStage(2)
    setFeedback({ kind: 'success', message: `Great testing! ${mostFlexible.label} showed the greatest flexibility. Now investigate a real mixture.` })
  }

  const reset = () => {
    const next = makeRound()
    setRound(next)
    setStage(1)
    setSelectedSampleId(next.samples[0]?.id ?? '')
    setTestedProperties({})
    setActiveTest(null)
    setStageOneAnswer(null)
    setStageOneComplete(false)
    setMixPlacements([])
    setSelectedMixId(null)
    setPrediction(null)
    setFeedback(null)
    setCompleted(false)
    setCelebrating(false)
    setDraggedId(null)
  }

  const getDraggedId = (event: DragEvent<HTMLElement>) => event.dataTransfer.getData('text/materials-properties-item') || draggedId
  const placeMixSubstance = (id: string) => {
    if (mixPlacements.includes(id) || mixPlacements.length >= 2) return
    setMixPlacements((current) => [...current, id])
    setSelectedMixId(null)
    setPrediction(null)
    setFeedback(null)
    setCompleted(false)
  }
  const handleMixDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault()
    const id = getDraggedId(event)
    if (id) placeMixSubstance(id)
    setDraggedId(null)
  }
  const checkActivity = () => {
    if (mixPlacements.length !== 2 || !prediction || !mixOutcome) return
    if (prediction !== mixOutcome) {
      setFeedback({ kind: 'warning', message: 'Watch what happens at the boundary between the two substances, then revise your prediction.' })
      setCompleted(false)
      setCelebrating(false)
      return
    }
    setCompleted(true)
    setCelebrating(true)
    const message = mixOutcome === 'dissolves' ? 'Right! Sugar or salt dissolves completely in water because its particles separate and spread through the liquid.' : mixOutcome === 'layers' ? 'Right! Oil and water form layers because their particles do not combine.' : 'Right! The particles stay separate, so the substances form a visible mixture.'
    setFeedback({ kind: 'success', message })
  }

  const renderSample = (sample: MaterialSample) => {
    const isSelected = selectedSampleId === sample.id
    const results = testedProperties[sample.id]
    const isComplete = Boolean(results?.bend && results?.scratch && results?.shine)
    return <Box key={sample.id} component="button" type="button" onClick={() => { setSelectedSampleId(sample.id); setActiveTest(null); setFeedback(null) }} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', p: 1.1, textAlign: 'left', border: 2, borderColor: isSelected ? 'primary.main' : isComplete ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: isSelected ? 'action.selected' : 'background.paper', color: 'text.primary', cursor: 'pointer', transition: 'transform .2s ease, border-color .2s ease', '&:hover': { transform: 'translateY(-2px)', borderColor: 'primary.main' } }}><Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, flexShrink: 0, borderRadius: 1.5, color: sample.color, backgroundColor: `${sample.color}22` }}>{sample.icon}</Box><Box sx={{ minWidth: 0, flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{sample.label}</Typography><Typography variant="caption" color="text.secondary">{isComplete ? 'Properties recorded' : `${[results?.bend, results?.scratch, results?.shine].filter(Boolean).length}/3 tests`}</Typography></Box>{isComplete && <CheckCircleOutlineIcon color="success" fontSize="small" />}</Box>
  }

  const renderMixCard = (substance: MixSubstance) => {
    const placed = mixPlacements.includes(substance.id)
    const isSelected = selectedMixId === substance.id
    return <Box key={substance.id} component="button" type="button" draggable={!placed} onDragStart={(event) => { setDraggedId(substance.id); setSelectedMixId(substance.id); event.dataTransfer.setData('text/materials-properties-item', substance.id) }} onClick={() => setSelectedMixId((current) => current === substance.id ? null : substance.id)} aria-label={`${placed ? 'Placed' : 'Select'} ${substance.label}`} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', p: 1.1, textAlign: 'left', border: 2, borderColor: isSelected ? 'primary.main' : placed ? 'success.main' : 'divider', borderRadius: 2, backgroundColor: placed ? 'action.selected' : 'background.paper', color: 'text.primary', cursor: placed ? 'default' : 'grab', transition: 'border-color .2s ease, transform .2s ease', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' } }}><Box sx={{ display: 'grid', placeItems: 'center', width: 34, height: 34, flexShrink: 0, borderRadius: 1.5, color: substance.color, backgroundColor: `${substance.color}22` }}>{substance.icon}</Box><Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 800 }}>{substance.label}</Typography><Typography variant="caption" color="text.secondary">{placed ? 'In the vessel' : 'Drag or tap'}</Typography></Box></Box>
  }

  return <Box sx={{ '@keyframes materialsCelebrate': { '0%, 100%': { transform: 'translateY(0)' }, '40%': { transform: 'translateY(-7px) rotate(-1deg)' }, '70%': { transform: 'translateY(-3px) rotate(1deg)' } }, '@keyframes vesselDissolve': { '0%': { opacity: 1, transform: 'scale(1)' }, '100%': { opacity: .35, transform: 'scale(.55)' } }, '@keyframes vesselSwirl': { '0%, 100%': { transform: 'translate(0, 0)' }, '50%': { transform: 'translate(10px, -5px)' } }, '@keyframes vesselLayer': { '0%, 100%': { transform: 'translateX(0)' }, '50%': { transform: 'translateX(4px)' } }, '@keyframes testPulse': { '0%, 100%': { boxShadow: '0 0 0 rgba(16,125,111,0)' }, '50%': { boxShadow: '0 0 18px rgba(16,125,111,.3)' } } }}>
    <Stack spacing={2.5}>
      <Box><Chip label="Property Tester + Mixing Lab" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Materials Investigation</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Compare materials by their physical properties, and explore what happens when they&apos;re mixed.</Typography></Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1} alignItems={{ sm: 'center' }}><Stack direction="row" spacing={1}><Chip label="Stage {stage} of 2" color="primary" /><Chip label={stage === 1 ? `${Object.values(testedProperties).filter((tests) => tests.bend && tests.scratch && tests.shine).length} of ${round.samples.length} tested` : `${mixPlacements.length} of 2 in vessel`} variant="outlined" /></Stack>{stageOneComplete && <Chip label="Property Tester complete" color="success" size="small" />}</Stack>
      {stage === 1 ? <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Typography variant="h6">Stage 1: Property Tester</Typography><Typography variant="body2" color="text.secondary">Choose a sample and run all three tests. Each result is based on the sample&apos;s recorded physical properties.</Typography></Box><Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>{round.samples.map(renderSample)}</Box>{selectedSample && <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'primary.main', backgroundColor: 'action.selected', animation: activeTest ? 'testPulse .85s ease' : undefined }}><Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}><Box sx={{ flex: 1 }}><Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{selectedSample.label} sample</Typography><Typography variant="body2" color="text.secondary">Run a test to record this material&apos;s property.</Typography>{activeTest && <PropertyTestAnimation test={activeTest} sample={selectedSample} />}{testedProperties[selectedSample.id] && <Stack direction="row" spacing={.5} flexWrap="wrap" sx={{ mt: 1 }}><Chip size="small" label={testedProperties[selectedSample.id]?.bend ? selectedSample.flexibility : 'Bend not tested'} /><Chip size="small" label={testedProperties[selectedSample.id]?.scratch ? selectedSample.hardness : 'Scratch not tested'} /><Chip size="small" label={testedProperties[selectedSample.id]?.shine ? selectedSample.shininess : 'Shine not tested'} /></Stack>}</Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>{(['bend', 'scratch', 'shine'] as TestKind[]).map((test) => <Button key={test} variant={testedProperties[selectedSample.id]?.[test] ? 'contained' : 'outlined'} onClick={() => runTest(test)} startIcon={testIcon[test]}>{testLabel[test]}</Button>)}</Stack></Stack></Paper>}{allPropertiesRecorded && <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>Recorded properties</Typography><Stack spacing={.5}>{round.samples.map((sample) => <Typography key={sample.id} variant="body2"><strong>{sample.label}:</strong> {sample.flexibility}, {sample.hardness}, {sample.shininess}</Typography>)}</Stack></Paper>}<Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: allPropertiesRecorded ? 'primary.main' : 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Challenge: Which material was the most flexible?</Typography><Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>{round.samples.map((sample) => <Button key={sample.id} size="small" variant={stageOneAnswer === sample.id ? 'contained' : 'outlined'} disabled={!allPropertiesRecorded} onClick={() => { setStageOneAnswer(sample.id); setFeedback(null) }}>{sample.label}</Button>)}</Stack></Paper><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={checkStageOne} disabled={!allPropertiesRecorded || !stageOneAnswer}>Check Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack></Stack></Paper> : <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Typography variant="h6">Stage 2: Mixing Lab</Typography><Typography variant="body2" color="text.secondary">Drag two substances into the vessel, observe the result, and predict whether they dissolve, stay mixed, or separate into layers.</Typography></Box><Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}><Paper elevation={0} onDragOver={(event) => event.preventDefault()} onDrop={handleMixDrop} sx={{ flex: 1, p: 1.5, minHeight: 132, border: 1, borderStyle: 'dashed', borderColor: selectedMixId ? 'primary.main' : 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>Substance tray</Typography><Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>{mixCards.map(renderMixCard)}</Box></Paper><Paper elevation={0} role="button" tabIndex={0} onDragOver={(event) => event.preventDefault()} onDrop={handleMixDrop} onClick={() => selectedMixId && placeMixSubstance(selectedMixId)} onKeyDown={(event) => { if ((event.key === 'Enter' || event.key === ' ') && selectedMixId) { event.preventDefault(); placeMixSubstance(selectedMixId) } }} sx={{ flex: 1, p: 1.5, minHeight: 132, border: 2, borderStyle: 'dashed', borderColor: selectedMixId ? 'primary.main' : 'divider', backgroundColor: 'background.paper', cursor: selectedMixId ? 'copy' : 'default' }}><Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 800 }}>Mixing vessel</Typography><Box sx={{ display: 'flex', minHeight: 78, alignItems: 'center', justifyContent: 'center', gap: 1, borderRadius: 2, overflow: 'hidden', background: mixOutcome === 'layers' ? 'linear-gradient(to bottom, #e4b844 0 48%, #4ba7d8 49% 100%)' : mixOutcome === 'dissolves' ? 'radial-gradient(circle, #b9e8f4, #4ba7d8)' : 'linear-gradient(135deg, #e8d7a3, #8dc5dd)', animation: mixOutcome ? mixOutcome === 'dissolves' ? 'vesselDissolve 1.25s ease-in-out infinite alternate' : mixOutcome === 'layers' ? 'vesselLayer 1.4s ease-in-out infinite' : 'vesselSwirl 1.4s ease-in-out infinite' : undefined }}>{placedMixCards.map((substance) => <Box key={substance.id} sx={{ display: 'grid', placeItems: 'center', width: 40, height: 40, borderRadius: '50%', color: substance.color, backgroundColor: '#ffffffaa' }}>{substance.icon}</Box>)}{mixPlacements.length === 0 && <Typography variant="caption" color="text.secondary">Drop two substances here</Typography>}</Box>{mixOutcome && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>{OUTCOME_COPY[mixOutcome].label}: {OUTCOME_COPY[mixOutcome].detail}</Typography>}</Paper></Stack><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: mixPlacements.length === 2 ? 'primary.main' : 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Challenge: Predict whether this pair will dissolve or just mix.</Typography><Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>{(Object.keys(OUTCOME_COPY) as MixOutcome[]).map((outcome) => <Button key={outcome} size="small" variant={prediction === outcome ? 'contained' : 'outlined'} disabled={mixPlacements.length !== 2} onClick={() => { setPrediction(outcome); setFeedback(null) }}>{OUTCOME_COPY[outcome].label}</Button>)}</Stack></Paper><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="contained" onClick={checkActivity} disabled={mixPlacements.length !== 2 || !prediction || !mixOutcome || completed} startIcon={<CheckCircleOutlineIcon />}>Check Activity</Button><Button variant="contained" color="success" onClick={onComplete} disabled={!completed}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack></Stack></Paper>}
      {feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : 'warning.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : 'warning.light', animation: celebrating ? 'materialsCelebrate .9s ease-in-out infinite' : undefined }}><Typography sx={{ fontWeight: 700 }}>{feedback.message}</Typography></Paper>}
    </Stack>
  </Box>
}

export default MaterialsPropertiesActivity
