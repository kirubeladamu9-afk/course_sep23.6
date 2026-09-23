import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ReplayIcon from '@mui/icons-material/Replay'
import { type FC, useEffect, useState } from 'react'

export type SurfaceTestProps = { onComplete?: () => void }
type SurfaceId = 'ice' | 'wood' | 'sandpaper'
type ChallengeType = 'least' | 'most' | 'rank'
type Feedback = 'idle' | 'correct' | 'incorrect'
type Surface = { id: SurfaceId; name: string; coefficient: number; texture: string; color: string }
type Result = { position: number; speed: number; time: number; running: boolean; pushed: boolean }
type Challenge = { type: ChallengeType; pushStrength: number }

const MASS = 2
const GRAVITY = 9.81
const PUSH_DURATION = .45
const surfaces: Surface[] = [
  { id: 'ice', name: 'Ice', coefficient: .05, texture: 'repeating-linear-gradient(135deg, rgba(255,255,255,.85) 0 7px, rgba(139,207,235,.5) 7px 14px)', color: '#c9edf8' },
  { id: 'wood', name: 'Wood', coefficient: .3, texture: 'repeating-linear-gradient(0deg, rgba(145,91,48,.18) 0 3px, transparent 3px 13px)', color: '#d9b17b' },
  { id: 'sandpaper', name: 'Sandpaper', coefficient: .65, texture: 'radial-gradient(rgba(86,56,38,.42) .8px, transparent .9px)', color: '#c99f7b' },
]

const createResults = (): Record<SurfaceId, Result> => Object.fromEntries(surfaces.map((surface) => [surface.id, { position: 0, speed: 0, time: 0, running: false, pushed: false }])) as Record<SurfaceId, Result>
const createChallenge = (): Challenge => ({ type: (['least', 'most', 'rank'] as ChallengeType[])[Math.floor(Math.random() * 3)], pushStrength: 8 + Math.floor(Math.random() * 11) })
const frictionForce = (surface: Surface) => surface.coefficient * MASS * GRAVITY
const labelForChallenge = (challenge: Challenge) => challenge.type === 'least' ? 'Which surface lets the block slide the farthest?' : challenge.type === 'most' ? 'Which surface needs the most force to keep the block moving?' : 'Rank the surfaces from least to most friction.'

const particleXs = [22, 50, 78, 106, 134, 162, 190, 218]
const particleCaptions: Record<SurfaceId, string> = {
  ice: "Ice's smooth particles slide past each other easily.",
  wood: 'Wood has moderate texture, creating some contact and resistance.',
  sandpaper: "Sandpaper's rough surface particles interlock with the object, resisting motion.",
}

const ParticleSurfaceDiagram: FC<{ surface: Surface }> = ({ surface }) => {
  const materialYs = surface.id === 'ice' ? particleXs.map(() => 54) : surface.id === 'wood' ? [56, 51, 57, 49, 55, 52, 58, 53] : [55, 43, 57, 46, 51, 40, 56, 44]
  const materialXs = surface.id === 'sandpaper' ? particleXs.map((x, index) => x + (index % 2 ? 6 : -4)) : particleXs
  const boundaryPoints = surface.id === 'ice' ? '14,44 226,44' : surface.id === 'wood' ? '14,47 44,45 74,48 104,44 134,47 164,45 194,49 226,46' : '14,48 42,37 70,50 100,40 130,46 160,34 190,49 226,38'
  return <Box sx={{ width: { xs: '100%', sm: 250 }, flexShrink: 0, p: 1, border: 1, borderColor: 'rgba(61,48,40,.22)', borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,.42)' }}>
    <Typography variant="caption" sx={{ display: 'block', fontWeight: 900, color: '#3d3028' }}>Microscopic contact</Typography>
    <Box component="svg" viewBox="0 0 240 112" role="img" aria-label={`${surface.name} microscopic particle contact diagram`} sx={{ display: 'block', width: '100%', height: 112, mt: .25 }}>
      <text x="14" y="12" fontSize="8" fontWeight="700" fill="#5f5148">object particles</text>
      {particleXs.map((x) => <circle key={`object-${x}`} cx={x} cy="34" r="9" fill="#e79a65" stroke="#a85d34" strokeWidth="1.5" />)}
      <polyline points={boundaryPoints} fill="none" stroke="#715d50" strokeWidth="1.5" strokeDasharray={surface.id === 'ice' ? undefined : '2 1'} />
      {materialYs.map((y, index) => <circle key={`material-${index}`} cx={materialXs[index]} cy={y} r="9" fill={surface.id === 'ice' ? '#9bd9ed' : surface.id === 'wood' ? '#b77d4b' : '#9b6e55'} stroke={surface.id === 'ice' ? '#4d9bb3' : '#6e4733'} strokeWidth="1.5" />)}
      <text x="14" y="103" fontSize="8" fontWeight="700" fill="#5f5148">{surface.name.toLowerCase()} surface particles</text>
    </Box>
    <Typography variant="caption" sx={{ display: 'block', color: '#4e3c30', lineHeight: 1.25 }}>{particleCaptions[surface.id]}</Typography>
  </Box>
}

const SurfaceTestActivity: FC<SurfaceTestProps> = ({ onComplete }) => {
  const [challenge, setChallenge] = useState(createChallenge)
  const [pushStrength, setPushStrength] = useState(challenge.pushStrength)
  const [results, setResults] = useState<Record<SurfaceId, Result>>(createResults)
  const [feedback, setFeedback] = useState<Feedback>('idle')
  const [feedbackVersion, setFeedbackVersion] = useState(0)

  useEffect(() => {
    let frame = 0
    let previous = performance.now()
    const tick = (now: number) => {
      const delta = Math.min(.032, Math.max(.001, (now - previous) / 1000))
      previous = now
      setResults((current) => {
        const next = { ...current }
        surfaces.forEach((surface) => {
          const result = current[surface.id]
          if (!result.running) return
          const deceleration = surface.coefficient * GRAVITY
          const nextSpeed = Math.max(0, result.speed - deceleration * delta)
          const nextPosition = result.position + ((result.speed + nextSpeed) / 2) * delta
          const nextResult = { position: nextPosition, speed: nextSpeed, time: result.time + delta, running: nextSpeed > .005, pushed: true }
          next[surface.id] = nextResult
        })
        return next
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const runSurface = (surface: Surface) => {
    const netForce = Math.max(0, pushStrength * 1 - frictionForce(surface))
    const initialSpeed = netForce / MASS * PUSH_DURATION
    setResults((current) => ({ ...current, [surface.id]: { position: 0, speed: initialSpeed, time: 0, running: initialSpeed > 0, pushed: true } }))
    setFeedback('idle')
  }

  const resetResultsForPush = (value: number) => {
    setPushStrength(value)
    setResults(createResults())
    setFeedback('idle')
  }

  const allMeasured = surfaces.every((surface) => results[surface.id].pushed && !results[surface.id].running)
  const orderedIds = [...surfaces].sort((a, b) => results[b.id].position - results[a.id].position).map((surface) => surface.id)
  const mostDistant = orderedIds[0]
  const leastDistant = orderedIds[orderedIds.length - 1]
  const expectedRank: SurfaceId[] = ['ice', 'wood', 'sandpaper']
  const challengeCorrect = allMeasured && (challenge.type === 'least' ? mostDistant === 'ice' : challenge.type === 'most' ? leastDistant === 'sandpaper' : orderedIds.every((id, index) => id === expectedRank[index]))
  const completed = feedback === 'correct' && challengeCorrect

  const checkActivity = () => {
    setFeedback(challengeCorrect ? 'correct' : 'incorrect')
    setFeedbackVersion((version) => version + 1)
  }

  const reset = () => {
    const nextChallenge = createChallenge()
    setChallenge(nextChallenge)
    setPushStrength(nextChallenge.pushStrength)
    setResults(createResults())
    setFeedback('idle')
    setFeedbackVersion((version) => version + 1)
  }

  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}>
    <Stack spacing={2}>
      <Box>
        <Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} />
        <Typography variant="h5">Surface Test</Typography>
        <Typography color="text.secondary" sx={{ mt: .75 }}>Compare how friction differs across surfaces.</Typography>
      </Box>
      <Stack direction="row" spacing={1}><Chip label="Physics" color="primary" size="small" /><Chip label="Foundation" variant="outlined" size="small" /></Stack>
      <Typography variant="body2" color="text.secondary">Push the same wooden block across each lane with the same strength. The block slows according to each surface&apos;s measured friction coefficient.</Typography>
      <Paper elevation={0} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="body2" sx={{ fontWeight: 800 }}>Push strength: {pushStrength.toFixed(1)} N</Typography>
        <Slider min={5} max={18} step={.5} value={pushStrength} onChange={(_, value) => resetResultsForPush(Array.isArray(value) ? value[0] : value)} aria-label="Push strength" valueLabelDisplay="auto" valueLabelFormat={(value) => `${Number(value).toFixed(1)} N`} />
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap><Chip label={`Block mass: ${MASS.toFixed(1)} kg`} variant="outlined" /><Chip label={`Push duration: ${PUSH_DURATION.toFixed(2)} s`} variant="outlined" /><Chip label="Same push on every lane" color="primary" /></Stack>
      </Paper>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.25}>
        {surfaces.map((surface) => {
          const result = results[surface.id]
          const distance = result.position
          const forceToKeepMoving = frictionForce(surface)
          const objectLeft = `${Math.min(92, 8 + distance * 7)}%`
          return <Paper key={surface.id} elevation={0} sx={{ flex: 1, p: 1.5, border: 1, borderColor: result.pushed && !result.running ? 'success.main' : 'divider', backgroundColor: surface.color, backgroundImage: surface.texture, backgroundSize: surface.id === 'sandpaper' ? '7px 7px' : 'auto' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography sx={{ fontWeight: 900, color: '#3d3028' }}>{surface.name}</Typography><Chip size="small" label={`μ = ${surface.coefficient.toFixed(2)}`} /></Stack>
                <Box sx={{ position: 'relative', mt: 1, height: 54, borderBottom: '4px solid rgba(61,48,40,.45)', overflow: 'hidden' }}>
                  <Box sx={{ position: 'absolute', left: objectLeft, bottom: 6, transform: 'translateX(-50%)', width: 56, height: 34, display: 'grid', placeItems: 'center', borderRadius: 1, backgroundColor: '#b87542', border: '3px solid #70401f', color: 'common.white', fontSize: 9, fontWeight: 900, transition: result.running ? 'none' : 'left .25s ease', animation: feedback === 'correct' ? 'surfaceBounce .65s ease-in-out infinite alternate' : 'none', '@keyframes surfaceBounce': { from: { transform: 'translateX(-50%) translateY(0)' }, to: { transform: 'translateX(-50%) translateY(-7px)' } } }}>BLOCK</Box>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: .8 }}><Typography variant="caption" sx={{ fontWeight: 800 }}>Distance traveled: {distance.toFixed(2)} m</Typography><Typography variant="caption" sx={{ fontWeight: 800 }}>Speed: {result.speed.toFixed(2)} m/s</Typography></Stack>
                <Typography variant="caption" sx={{ color: '#4e3c30' }}>Force needed to keep it moving: {forceToKeepMoving.toFixed(2)} N</Typography>
              </Box>
              <ParticleSurfaceDiagram surface={surface} />
              <Button variant="contained" size="small" onClick={() => runSurface(surface)} disabled={result.running} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, backgroundColor: '#4e3c30', '&:hover': { backgroundColor: '#35271f' } }}>Push block</Button>
            </Stack>
          </Paper>
        })}
      </Stack>
      <Paper role="status" elevation={0} sx={{ p: 1.5, backgroundColor: 'action.hover' }}><Typography sx={{ fontWeight: 800 }}>{allMeasured ? 'All surfaces measured — compare the distances and forces.' : 'Push the block once on each lane to compare its real motion.'}</Typography><Typography variant="caption" color="text.secondary">Lower friction produces less deceleration, so the same push carries the block farther.</Typography></Paper>
      <Paper key={feedbackVersion} elevation={0} sx={{ p: 2, border: 1, borderColor: feedback === 'correct' ? 'success.main' : feedback === 'incorrect' ? 'warning.main' : 'divider', animation: feedback === 'correct' ? 'surfaceCelebrate .65s ease' : feedback === 'incorrect' ? 'surfaceShake .45s ease-in-out' : 'none', '@keyframes surfaceCelebrate': { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.025)' }, '100%': { transform: 'scale(1)' } }, '@keyframes surfaceShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-5px)' }, '75%': { transform: 'translateX(5px)' } } }}>
        <Typography sx={{ fontWeight: 800 }}>Challenge: {labelForChallenge(challenge)}</Typography>
        {feedback === 'correct' && <Typography role="status" color="success.main" sx={{ mt: 1, fontWeight: 800 }}>Right! Sandpaper has the most friction, so it takes the most force to slide something across it.</Typography>}
        {feedback === 'incorrect' && <Typography role="status" color="warning.main" sx={{ mt: 1, fontWeight: 700 }}>Hint: Compare the measured distances and the force-needed readouts again. The surfaces do not slow the block equally.</Typography>}
      </Paper>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Button variant="outlined" onClick={checkActivity} disabled={!allMeasured}>Check Activity</Button><Button variant="contained" disabled={!completed} onClick={onComplete} startIcon={<CheckCircleOutlineIcon />}>Complete Activity</Button><Button variant="text" onClick={reset} startIcon={<ReplayIcon />}>Reset</Button></Stack>
    </Stack>
  </Paper>
}

export default SurfaceTestActivity
