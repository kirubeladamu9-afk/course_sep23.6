import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useState } from 'react'

export interface MatchingPair {
  id: string
  left: string
  right: string
}

export interface MatchingConfig {
  title: string
  prompt: string
  leftLabel: string
  rightLabel: string
  pairs: MatchingPair[]
}

type MatchingEngineProps = {
  config: MatchingConfig
  onComplete: () => void
}

const MatchingEngine: FC<MatchingEngineProps> = ({ config, onComplete }) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)

  const selectLeft = (pairId: string) => {
    if (matched.includes(pairId)) return
    setFeedback(null)
    if (selectedRight) {
      const pair = config.pairs.find((item) => item.id === pairId)
      const isCorrect = pair?.id === selectedRight
      if (isCorrect) {
        const nextMatched = [...matched, pairId]
        setMatched(nextMatched)
        setFeedback('correct')
        if (nextMatched.length === config.pairs.length) onComplete()
      } else setFeedback('incorrect')
      setSelectedLeft(null)
      setSelectedRight(null)
      return
    }
    setSelectedLeft(pairId)
  }

  const selectRight = (pairId: string) => {
    if (matched.includes(pairId)) return
    setFeedback(null)
    if (selectedLeft) {
      const isCorrect = selectedLeft === pairId
      if (isCorrect) {
        const nextMatched = [...matched, pairId]
        setMatched(nextMatched)
        setFeedback('correct')
        if (nextMatched.length === config.pairs.length) onComplete()
      } else setFeedback('incorrect')
      setSelectedLeft(null)
      setSelectedRight(null)
      return
    }
    setSelectedRight(pairId)
  }

  const reset = () => {
    setSelectedLeft(null)
    setSelectedRight(null)
    setMatched([])
    setFeedback(null)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2.5}>
      <Box>
        <Chip label="Matching Engine" color="secondary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">{config.title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>{config.prompt}</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        {[{ label: config.leftLabel, side: 'left' as const }, { label: config.rightLabel, side: 'right' as const }].map(({ label, side }) => <Stack key={side} spacing={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{label}</Typography>
          {config.pairs.map((pair) => {
            const isMatched = matched.includes(pair.id)
            const selected = side === 'left' ? selectedLeft === pair.id : selectedRight === pair.id
            return <Button key={`${side}-${pair.id}`} variant={isMatched ? 'contained' : selected ? 'outlined' : 'text'} color={isMatched ? 'success' : selected ? 'primary' : 'inherit'} disabled={isMatched} onClick={() => side === 'left' ? selectLeft(pair.id) : selectRight(pair.id)} sx={{ justifyContent: 'flex-start', px: 1.5, py: 1.25, border: 1, borderColor: isMatched ? 'success.main' : selected ? 'primary.main' : 'divider', textTransform: 'none', textAlign: 'left' }} aria-label={`${side === 'left' ? 'Select' : 'Match'} ${side === 'left' ? pair.left : pair.right}`}>
              {side === 'left' ? pair.left : pair.right}
            </Button>
          })}
        </Stack>)}
      </Box>
      {feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback === 'correct' ? 'success.main' : 'warning.main', backgroundColor: feedback === 'correct' ? 'success.light' : 'warning.light' }}><Typography sx={{ fontWeight: 700 }}>{feedback === 'correct' ? 'Correct pair' : 'Not a match yet'}</Typography><Typography variant="body2">{feedback === 'correct' ? 'Keep going to connect the remaining pairs.' : 'Try a different item from the other column.'}</Typography></Paper>}
      <Stack direction="row" spacing={1} alignItems="center"><Chip label={`${matched.length} of ${config.pairs.length} matched`} color={matched.length === config.pairs.length ? 'success' : 'default'} /><Button variant="text" onClick={reset}>Reset</Button>{matched.length === config.pairs.length && <Typography variant="body2" color="success.main" sx={{ fontWeight: 700 }}>All pairs matched.</Typography>}</Stack>
      {matched.length === config.pairs.length && <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} disabled>Complete step</Button>}
    </Stack>
  </Paper>
}

export default MatchingEngine
