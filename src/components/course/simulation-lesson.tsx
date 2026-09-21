import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { type FC, useMemo, useState } from 'react'
import { type SimulationConfig, type SimulationRule, type SimulationVariable } from '@/components/admin/admin-data'

export type SimulationResult = {
  output: number
  observation: string
  isValid: boolean
}

type SimulationLessonProps = {
  config: SimulationConfig
  onValidated: (result: SimulationResult) => void
}

const round = (value: number) => Math.round(value * 100) / 100

export const calculateSimulationOutput = (rule: SimulationRule, variables: Record<number, number>) => {
  if (rule === 'pendulum-period') {
    const length = Math.max(0.01, variables[1] ?? 1)
    return round(2 * Math.PI * Math.sqrt(length / 9.81))
  }
  if (rule === 'osmosis-movement') {
    const solution = variables[1] ?? 0
    const cell = variables[2] ?? 0
    return round(solution - cell)
  }
  const values = Object.values(variables)
  return round(values.reduce((total, value) => total + value, 0))
}

const normalizeObservation = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ')
const getObservationMatch = (config: SimulationConfig, observation: string) => {
  const normalized = normalizeObservation(observation)
  return [config.expectedObservation, ...config.acceptedObservations].some((accepted) => {
    const target = normalizeObservation(accepted)
    return target.length > 0 && (normalized === target || normalized.includes(target) || target.includes(normalized))
  })
}

const formatVariableValue = (variable: SimulationVariable, value: number) => `${round(value)}${variable.unit ? ` ${variable.unit}` : ''}`

const SimulationLesson: FC<SimulationLessonProps> = ({ config, onValidated }) => {
  const initialValues = useMemo(() => Object.fromEntries(config.variables.map((variable) => [variable.id, variable.defaultValue])), [config.variables])
  const [values, setValues] = useState<Record<number, number>>(initialValues)
  const [observation, setObservation] = useState('')
  const [result, setResult] = useState<SimulationResult | null>(null)
  const output = calculateSimulationOutput(config.rule, values)

  const runSimulation = () => {
    const nextResult = { output, observation, isValid: getObservationMatch(config, observation) }
    setResult(nextResult)
    if (nextResult.isValid) onValidated(nextResult)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2.5}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box><Typography variant="overline" color="primary.main" sx={{ fontWeight: 800 }}>Simulation / Experiment / Virtual Lab</Typography><Typography variant="h5">{config.scenarioName}</Typography></Box>
          <Chip label="Validated observation" size="small" color="success" variant="outlined" />
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>{config.overview}</Typography>
      </Box>
      <Divider />
      <Stack spacing={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>1. Adjust the inputs</Typography>
        {config.variables.map((variable) => <Box key={variable.id} sx={{ px: 1 }}>
          <Stack direction="row" justifyContent="space-between" spacing={2}><Typography variant="body2" sx={{ fontWeight: 600 }}>{variable.label}</Typography><Typography variant="body2" color="primary.main" sx={{ fontWeight: 700 }}>{formatVariableValue(variable, values[variable.id])}</Typography></Stack>
          <Slider value={values[variable.id]} min={variable.min} max={variable.max} step={variable.step} onChange={(_, value) => setValues((current) => ({ ...current, [variable.id]: Array.isArray(value) ? value[0] : value }))} valueLabelDisplay="auto" aria-label={variable.label} />
          <Stack direction="row" justifyContent="space-between"><Typography variant="caption" color="text.secondary">{formatVariableValue(variable, variable.min)}</Typography><Typography variant="caption" color="text.secondary">{formatVariableValue(variable, variable.max)}</Typography></Stack>
        </Box>)}
      </Stack>
      <Paper elevation={0} sx={{ p: 2, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary">Calculation rule</Typography>
        <Typography sx={{ fontFamily: 'monospace', mt: 0.5 }}>{config.calculation}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{config.outputLabel}</Typography>
        <Typography variant="h4" color="primary.main">{output} {config.outputUnit}</Typography>
      </Paper>
      <Stack spacing={1}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>2. Record what you observe</Typography>
        <Typography variant="body2" color="text.secondary">{config.observationPrompt}</Typography>
        <TextField fullWidth value={observation} onChange={(event) => setObservation(event.target.value)} placeholder="Describe the result" aria-label="Recorded observation" />
        <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={runSimulation} disabled={!observation.trim()} sx={{ alignSelf: 'flex-start' }}>Run and validate</Button>
      </Stack>
      {result && <Paper role="status" elevation={0} sx={{ p: 2, border: 1, borderColor: result.isValid ? 'success.main' : 'warning.main', backgroundColor: result.isValid ? 'success.light' : 'warning.light' }}>
        <Stack direction="row" spacing={1} alignItems="flex-start"><CheckCircleOutlineIcon color={result.isValid ? 'success' : 'warning'} /><Box><Typography sx={{ fontWeight: 700 }}>{result.isValid ? 'Observation validated' : 'Run recorded — refine your observation'}</Typography><Typography variant="body2">{result.isValid ? `Correct: ${config.expectedObservation}. This activity is ready to complete.` : `Look for this pattern: ${config.expectedObservation}. Try again with a more specific observation.`}</Typography></Box></Stack>
      </Paper>}
    </Stack>
  </Paper>
}

export default SimulationLesson
