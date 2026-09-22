import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import { type FC, useMemo, useState } from 'react'

type FoodGroup = 'Fruits' | 'Vegetables' | 'Grains' | 'Protein' | 'Dairy'
type Stage = 1 | 2 | 3 | 4
type Food = { id: string; name: string; icon: string; group: FoodGroup }
type MealOption = { label: string; foods: Food[] }
type QuickRound = { options: MealOption[] }
type Feedback = { kind: 'success' | 'warning' | 'info'; text: string } | null

const groups: FoodGroup[] = ['Fruits', 'Vegetables', 'Grains', 'Protein', 'Dairy']
const foodPool: Food[] = [
  { id: 'apple', name: 'Apple', icon: '🍎', group: 'Fruits' },
  { id: 'orange', name: 'Orange', icon: '🍊', group: 'Fruits' },
  { id: 'carrot', name: 'Carrot', icon: '🥕', group: 'Vegetables' },
  { id: 'broccoli', name: 'Broccoli', icon: '🥦', group: 'Vegetables' },
  { id: 'bread', name: 'Bread', icon: '🍞', group: 'Grains' },
  { id: 'rice', name: 'Rice', icon: '🍚', group: 'Grains' },
  { id: 'chicken', name: 'Chicken', icon: '🍗', group: 'Protein' },
  { id: 'fish', name: 'Fish', icon: '🐟', group: 'Protein' },
  { id: 'milk', name: 'Milk', icon: '🥛', group: 'Dairy' },
  { id: 'cheese', name: 'Cheese', icon: '🧀', group: 'Dairy' },
  { id: 'beans', name: 'Beans', icon: '🫘', group: 'Protein' },
  { id: 'yogurt', name: 'Yogurt', icon: '🥣', group: 'Dairy' },
]

const shuffle = <T,>(items: T[]) => {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }
  return next
}

const countsFor = (foods: Food[]) => groups.reduce((counts, group) => ({ ...counts, [group]: foods.filter((food) => food.group === group).length }), {} as Record<FoodGroup, number>)
const missingGroupsFor = (foods: Food[]) => groups.filter((group) => !foods.some((food) => food.group === group))
const isBalanced = (foods: Food[]) => {
  const counts = countsFor(foods)
  return foods.length >= 4 && groups.every((group) => counts[group] > 0) && Math.max(...groups.map((group) => counts[group])) <= 2
}
const labelForGroups = (foods: Food[]) => groups.filter((group) => foods.some((food) => food.group === group)).join(', ')

const makeQuickRounds = (): QuickRound[] => {
  const shuffledFoods = shuffle(foodPool)
  const balanced = groups.map((group) => shuffledFoods.find((food) => food.group === group) ?? foodPool.find((food) => food.group === group)!).filter(Boolean)
  const options = [
    { label: 'A', foods: balanced },
    { label: 'B', foods: shuffle(foodPool.filter((food) => ['Fruits', 'Grains', 'Dairy'].includes(food.group))).slice(0, 4) },
    { label: 'C', foods: shuffle(foodPool.filter((food) => ['Vegetables', 'Protein', 'Grains', 'Protein'].includes(food.group))).slice(0, 4) },
  ]
  const roundOptions = [options, [options[1], options[2], options[0]], [options[2], options[0], options[1]]]
  return shuffle(roundOptions).slice(0, 2).map((round) => ({ options: shuffle(round) }))
}

const HealthyPlateActivity: FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const [foods, setFoods] = useState<Food[]>(() => shuffle(foodPool).slice(0, 8))
  const [addedIds, setAddedIds] = useState<string[]>([])
  const [stage, setStage] = useState<Stage>(1)
  const [selectedFoodId, setSelectedFoodId] = useState<string | null>(null)
  const [sorted, setSorted] = useState<Record<string, FoodGroup | null>>({})
  const [wrongFoodId, setWrongFoodId] = useState<string | null>(null)
  const [balanceAnswer, setBalanceAnswer] = useState<'yes' | 'no' | null>(null)
  const [missingSelection, setMissingSelection] = useState<FoodGroup[]>([])
  const [missingConfirmed, setMissingConfirmed] = useState(false)
  const [quickRounds, setQuickRounds] = useState<QuickRound[]>(() => makeQuickRounds())
  const [quickIndex, setQuickIndex] = useState(0)
  const [quickAnswers, setQuickAnswers] = useState<string[]>([])
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [checked, setChecked] = useState(false)
  const [complete, setComplete] = useState(false)
  const [completed, setCompleted] = useState(false)

  const addedFoods = useMemo(() => addedIds.map((id) => foods.find((food) => food.id === id)).filter(Boolean) as Food[], [addedIds, foods])
  const tally = countsFor(addedFoods)
  const missingGroups = missingGroupsFor(addedFoods)
  const plateIsBalanced = isBalanced(addedFoods)
  const allSorted = addedFoods.length > 0 && addedFoods.every((food) => sorted[food.id] === food.group)
  const currentQuickRound = quickRounds[quickIndex]
  const quickComplete = quickAnswers.length === quickRounds.length

  const reset = () => {
    setFoods(shuffle(foodPool).slice(0, 8))
    setAddedIds([])
    setStage(1)
    setSelectedFoodId(null)
    setSorted({})
    setWrongFoodId(null)
    setBalanceAnswer(null)
    setMissingSelection([])
    setMissingConfirmed(false)
    setQuickRounds(makeQuickRounds())
    setQuickIndex(0)
    setQuickAnswers([])
    setFeedback(null)
    setChecked(false)
    setComplete(false)
    setCompleted(false)
  }

  const toggleFood = (foodId: string) => {
    setAddedIds((current) => current.includes(foodId) ? current.filter((id) => id !== foodId) : [...current, foodId])
    setSorted((current) => { const next = { ...current }; delete next[foodId]; return next })
    setSelectedFoodId(null)
    setChecked(false)
    setBalanceAnswer(null)
  }

  const chooseGroup = (group: FoodGroup) => {
    if (!selectedFoodId) return
    const food = foods.find((item) => item.id === selectedFoodId)
    if (!food || sorted[food.id]) return
    if (food.group !== group) {
      setWrongFoodId(food.id)
      setFeedback({ kind: 'warning', text: `${group} is not the right group for ${food.name}. Try again.` })
      window.setTimeout(() => setWrongFoodId(null), 520)
      return
    }
    setSorted((current) => ({ ...current, [food.id]: group }))
    setSelectedFoodId(null)
    setFeedback({ kind: 'success', text: `${food.name} is in the ${group} group.` })
  }

  const balanceCorrect = plateIsBalanced ? balanceAnswer === 'yes' : balanceAnswer === 'no' && (missingGroups.length === 0 || missingConfirmed)
  const quickAnswerIsCorrect = currentQuickRound && quickAnswers[quickIndex] === currentQuickRound.options.find((option) => isBalanced(option.foods))?.label

  const chooseBalance = (answer: 'yes' | 'no') => {
    setBalanceAnswer(answer)
    setMissingSelection([])
    setMissingConfirmed(false)
    setFeedback(null)
  }

  const toggleMissing = (group: FoodGroup) => setMissingSelection((current) => current.includes(group) ? current.filter((item) => item !== group) : [...current, group])

  const advanceFromBalance = () => {
    if (!balanceCorrect) {
      setFeedback({ kind: 'warning', text: plateIsBalanced ? 'This plate has all five food groups, so it is balanced.' : 'Choose No and identify every missing food group.' })
      return
    }
    setStage(4)
    setFeedback(null)
  }

  const answerQuick = (label: string) => {
    if (quickAnswers[quickIndex]) return
    setQuickAnswers((current) => [...current, label])
    if (quickIndex < quickRounds.length - 1) setQuickIndex((current) => current + 1)
    setFeedback({ kind: label === currentQuickRound.options.find((option) => isBalanced(option.foods))?.label ? 'success' : 'warning', text: label === currentQuickRound.options.find((option) => isBalanced(option.foods))?.label ? 'Great choice — that meal includes all five food groups.' : 'Keep going. Look for a meal with a wider variety of groups.' })
  }

  const checkActivity = () => {
    const foodsSortedCorrectly = allSorted
    const balanceStageCorrect = balanceCorrect
    const quickStageCorrect = quickAnswers.every((answer, index) => answer === quickRounds[index].options.find((option) => isBalanced(option.foods))?.label)
    setChecked(true)
    if (!foodsSortedCorrectly || !balanceStageCorrect || !quickStageCorrect) {
      setComplete(false)
      if (!quickStageCorrect) {
        setQuickAnswers([])
        setQuickIndex(0)
        setChecked(false)
      }
      setFeedback({ kind: 'warning', text: !foodsSortedCorrectly ? 'Some foods still need to be sorted correctly.' : !balanceStageCorrect ? 'Your balance judgment needs another look.' : 'Review the quick-check answers and try again.' })
      return
    }
    setComplete(true)
    setFeedback({ kind: 'success', text: `Great job! Your final plate had ${groups.filter((group) => tally[group] > 0).length} of 5 food groups. Nutrition Champion!` })
  }

  const foodCard = (food: Food, inPlate = false) => {
    const selected = selectedFoodId === food.id
    const isSorted = sorted[food.id] === food.group
    return <Box key={food.id} component="button" type="button" onClick={() => stage === 1 ? toggleFood(food.id) : setSelectedFoodId(selected ? null : food.id)} aria-pressed={selected} sx={{ minWidth: 92, p: 1, border: 2, borderColor: isSorted ? 'success.main' : selected ? 'primary.main' : 'divider', borderRadius: 2, backgroundColor: isSorted ? 'success.main' : selected ? 'action.selected' : 'background.paper', color: isSorted ? 'common.white' : 'text.primary', cursor: 'pointer', font: 'inherit', textAlign: 'center', transition: 'transform .18s ease, border-color .18s ease', transform: wrongFoodId === food.id ? 'translateX(6px)' : selected ? 'translateY(-3px)' : 'none', animation: wrongFoodId === food.id ? 'foodShake .5s ease' : 'none', '@keyframes foodShake': { '0%, 100%': { transform: 'translateX(0)' }, '35%': { transform: 'translateX(-7px)' }, '70%': { transform: 'translateX(7px)' } } }}><Typography sx={{ fontSize: 30, lineHeight: 1.1 }} aria-hidden="true">{food.icon}</Typography><Typography variant="caption" sx={{ display: 'block', fontWeight: 800 }}>{food.name}</Typography>{inPlate && isSorted && <Typography variant="caption">✓ {food.group}</Typography>}</Box>
  }

  return <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">Build a Healthy Plate</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>Build a balanced, healthy meal.</Typography></Box><Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}><Chip label="Biology" color="primary" /><Chip label="Foundation" color="secondary" /><Chip label={`Stage ${stage} of 4`} variant="outlined" /></Stack>{stage === 1 && <><Typography variant="h6">Build your plate</Typography><Typography variant="body2" color="text.secondary">Tap food cards to add them to your plate. Tap a food on the plate to remove it.</Typography><Stack direction={{ xs: 'column', md: 'row' }} spacing={2}><Paper elevation={0} sx={{ flex: 1, minHeight: 220, p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'rgba(23, 126, 115, .06)' }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Food tray</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{foods.filter((food) => !addedIds.includes(food.id)).map((food) => foodCard(food))}</Stack></Paper><Paper elevation={0} sx={{ flex: 1, minHeight: 220, p: 1.5, border: 2, borderColor: addedFoods.length >= 4 ? 'primary.main' : 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Your plate · {addedFoods.length} foods</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{addedFoods.map((food) => foodCard(food, true))}{!addedFoods.length && <Typography color="text.secondary">Tap foods to start your plate.</Typography>}</Stack></Paper></Stack><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Food-group tally</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{groups.map((group) => <Chip key={group} label={`${group}: ${tally[group]}`} color={tally[group] ? 'primary' : 'default'} />)}</Stack></Paper><Button variant="contained" onClick={() => setStage(2)} disabled={addedFoods.length < 4}>Continue to sorting</Button></>}{stage === 2 && <><Typography variant="h6">Sort your foods</Typography><Typography variant="body2" color="text.secondary">Tap a food, then tap the food group where it belongs.</Typography><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Stack direction="row" flexWrap="wrap" gap={1}>{addedFoods.map((food) => foodCard(food, true))}</Stack></Paper><Stack direction="row" flexWrap="wrap" gap={1}>{groups.map((group) => <Button key={group} variant={selectedFoodId && foods.find((food) => food.id === selectedFoodId)?.group === group ? 'contained' : 'outlined'} onClick={() => chooseGroup(group)}>{group}</Button>)}</Stack><Button variant="contained" onClick={() => setStage(3)} disabled={!allSorted}>Continue to judge</Button></>}{stage === 3 && <><Typography variant="h6">Is it balanced?</Typography><Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider', backgroundColor: 'background.default' }}><Typography variant="subtitle2" sx={{ mb: 1 }}>Your finished plate</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{addedFoods.map((food) => foodCard(food, true))}</Stack></Paper><Typography sx={{ fontWeight: 800 }}>Is this meal balanced?</Typography><Stack direction="row" spacing={1}><Button variant={balanceAnswer === 'yes' ? 'contained' : 'outlined'} onClick={() => chooseBalance('yes')}>Yes</Button><Button variant={balanceAnswer === 'no' ? 'contained' : 'outlined'} onClick={() => chooseBalance('no')}>No</Button></Stack>{balanceAnswer === 'no' && missingGroups.length > 0 && <><Typography variant="body2">Which food group is missing? Select all that apply.</Typography><Stack direction="row" flexWrap="wrap" gap={1}>{groups.map((group) => <Button key={group} variant={missingSelection.includes(group) ? 'contained' : 'outlined'} onClick={() => toggleMissing(group)}>{group}</Button>)}</Stack><Button variant="outlined" onClick={() => { setMissingConfirmed(true); setFeedback(null) }} disabled={!missingSelection.length}>Confirm missing groups</Button></>}{balanceAnswer === 'no' && missingGroups.length === 0 && <Typography variant="body2" color="text.secondary">No group is missing, but one group may be overrepresented.</Typography>}<Button variant="contained" onClick={advanceFromBalance} disabled={!balanceAnswer || (balanceAnswer === 'no' && missingGroups.length > 0 && !missingConfirmed)}>Continue to quick check</Button></>}{stage === 4 && <><Typography variant="h6">Quick check</Typography><Typography variant="body2" color="text.secondary">Which of these makes the most balanced meal?</Typography><Stack spacing={1}>{currentQuickRound.options.map((option) => <Box key={option.label} component="button" type="button" onClick={() => answerQuick(option.label)} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', p: 1.25, border: 2, borderColor: quickAnswers[quickIndex] === option.label ? 'primary.main' : 'divider', borderRadius: 2, backgroundColor: quickAnswers[quickIndex] === option.label ? 'action.selected' : 'background.paper', color: 'text.primary', textAlign: 'left', font: 'inherit', cursor: quickAnswers[quickIndex] ? 'default' : 'pointer' }}><Chip label={option.label} /><Stack direction="row" flexWrap="wrap" gap={.5}>{option.foods.map((food) => <Typography key={food.id} variant="body2">{food.icon} {food.name}</Typography>)}</Stack></Box>)}</Stack>{quickAnswers[quickIndex] && <Typography role="status" color={quickAnswerIsCorrect ? 'success.main' : 'warning.main'}>{quickAnswerIsCorrect ? 'Correct — this meal has the strongest variety.' : 'That one is not the most balanced choice, but keep going.'}</Typography>}<Button variant="outlined" onClick={() => setStage(4)} disabled={!quickComplete}>Finish quick check</Button>{!checked && <Button variant="outlined" onClick={checkActivity} disabled={!quickComplete}>Check Activity</Button>}{complete && <Button variant="contained" onClick={() => { setCompleted(true); onComplete?.() }} disabled={completed} startIcon={<CheckCircleOutlineIcon />}>{completed ? 'Activity Complete' : 'Complete Activity'}</Button>}</>}{feedback && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: feedback.kind === 'success' ? 'success.main' : feedback.kind === 'warning' ? 'warning.main' : 'info.main', backgroundColor: feedback.kind === 'success' ? 'success.light' : feedback.kind === 'warning' ? 'warning.light' : 'info.light' }}><Typography sx={{ fontWeight: 700 }}>{feedback.text}</Typography></Paper>}{stage !== 4 && <Button variant="outlined" onClick={reset}>Reset</Button>}{stage === 4 && <Button variant="outlined" onClick={reset}>Reset</Button>}{checked && !complete && <Typography color="warning.main">One or more stages needs another look. You can restart with Reset.</Typography>}</Stack></Paper>
}

export default HealthyPlateActivity
