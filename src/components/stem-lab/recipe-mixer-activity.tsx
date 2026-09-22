import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FC, useState } from 'react'
import { type MathTopic } from '@/components/admin/stem-curriculum'

type RecipeIngredient = { name: string; icon: string; amount: number; unit: string }
type RecipeData = { name: string; baseServings: number; ingredients: RecipeIngredient[] }
type RecipeRoundType = 'scale up' | 'scale down' | 'find the servings' | 'compare recipes'
type RecipeRound = { type: RecipeRoundType; recipe: RecipeData; targetServings: number; compareRecipe?: RecipeData; stronger: 'A' | 'B'; givenIngredient?: RecipeIngredient }

const recipes: RecipeData[] = [
  { name: 'Berry Breakfast', baseServings: 2, ingredients: [{ name: 'flour', icon: '🛍️', amount: 2, unit: 'cups' }, { name: 'eggs', icon: '🥚', amount: 1, unit: 'egg' }, { name: 'milk', icon: '🥛', amount: 1, unit: 'cup' }] },
  { name: 'Garden Muffins', baseServings: 3, ingredients: [{ name: 'flour', icon: '🛍️', amount: 3, unit: 'cups' }, { name: 'eggs', icon: '🥚', amount: 2, unit: 'eggs' }, { name: 'milk', icon: '🥛', amount: 1.5, unit: 'cups' }] },
  { name: 'Apple Pancakes', baseServings: 4, ingredients: [{ name: 'flour', icon: '🛍️', amount: 4, unit: 'cups' }, { name: 'eggs', icon: '🥚', amount: 2, unit: 'eggs' }, { name: 'milk', icon: '🥛', amount: 2, unit: 'cups' }] },
]

const numberLabel = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
const amountFor = (ingredient: RecipeIngredient, servings: number, baseServings: number) => ingredient.amount * servings / baseServings
const createRound = (roundNumber: number): RecipeRound => {
  const recipe = recipes[Math.floor(Math.random() * recipes.length)]
  const type = (['scale up', 'scale down', 'find the servings', 'compare recipes'] as RecipeRoundType[])[roundNumber % 4]
  if (type === 'scale up') return { type, recipe, targetServings: recipe.baseServings * (2 + Math.floor(Math.random() * 2)), stronger: 'A' }
  if (type === 'scale down') return { type, recipe, targetServings: Math.max(1, recipe.baseServings - 1), stronger: 'A' }
  if (type === 'find the servings') {
    const targetServings = recipe.baseServings * (1.5 + Math.floor(Math.random() * 2) * .5)
    const givenIngredient = recipe.ingredients[Math.floor(Math.random() * recipe.ingredients.length)]
    return { type, recipe, targetServings, givenIngredient, stronger: 'A' }
  }
  const compareRecipe = recipes[(recipes.indexOf(recipe) + 1) % recipes.length]
  const ratioA = recipe.ingredients[0].amount / recipe.ingredients[1].amount
  const ratioB = compareRecipe.ingredients[0].amount / compareRecipe.ingredients[1].amount
  return { type, recipe, targetServings: recipe.baseServings, compareRecipe, stronger: ratioA >= ratioB ? 'A' : 'B' }
}

const IngredientRows: FC<{ recipe: RecipeData; servings: number; success: boolean }> = ({ recipe, servings, success }) => <Stack spacing={1}>{recipe.ingredients.map((ingredient) => {
  const amount = amountFor(ingredient, servings, recipe.baseServings)
  const iconCount = Math.max(1, Math.ceil(amount))
  return <Paper key={ingredient.name} elevation={0} sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1.5, border: 1, borderColor: 'divider', animation: success ? 'recipeGlow .8s ease-in-out' : 'none', '@keyframes recipeGlow': { '0%, 100%': { boxShadow: 'none' }, '50%': { boxShadow: '0 0 18px rgba(16,125,111,.45)' } } }}><Typography sx={{ minWidth: 84, fontWeight: 700 }}>{ingredient.name}</Typography><Stack direction="row" spacing={.25} sx={{ flex: 1, flexWrap: 'wrap' }}>{Array.from({ length: iconCount }, (_, index) => <Box key={index} component="span" sx={{ opacity: index + 1 > amount ? .28 : 1, fontSize: 24, animation: success ? `recipeIconPop .45s ease ${index * .08}s both` : 'none', '@keyframes recipeIconPop': { from: { transform: 'scale(.7)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } } }}>{ingredient.icon}</Box>)}</Stack><Typography sx={{ minWidth: 110, textAlign: 'right', fontWeight: 800 }}>{numberLabel(amount)} {ingredient.unit}</Typography></Paper>
})}</Stack>

const RecipeMixerActivity: FC<{ topic: MathTopic; onComplete?: () => void }> = ({ topic, onComplete }) => {
  const [roundNumber, setRoundNumber] = useState(0)
  const [round, setRound] = useState(() => createRound(0))
  const [servings, setServings] = useState(round.recipe.baseServings)
  const [typedServings, setTypedServings] = useState('')
  const [choice, setChoice] = useState<'A' | 'B' | null>(null)
  const [checked, setChecked] = useState(false)
  const [correct, setCorrect] = useState(false)
  const [completed, setCompleted] = useState(false)
  const reset = () => { setServings(round.recipe.baseServings); setTypedServings(''); setChoice(null); setChecked(false); setCorrect(false); setCompleted(false) }
  const nextRound = () => { const next = roundNumber + 1; const nextData = createRound(next); setRoundNumber(next); setRound(nextData); setServings(nextData.recipe.baseServings); setTypedServings(''); setChoice(null); setChecked(false); setCorrect(false); setCompleted(false) }
  const checkActivity = () => { const isCorrect = round.type === 'find the servings' ? Number.isFinite(Number(typedServings)) && Math.abs(Number(typedServings) - round.targetServings) < .01 : round.type === 'compare recipes' ? choice === round.stronger : Math.abs(servings - round.targetServings) < .01; setChecked(true); setCorrect(isCorrect) }
  const scaleFactor = round.targetServings / round.recipe.baseServings
  const instruction = round.type === 'scale up' ? `Scale this recipe to make ${round.targetServings} servings. How much of each ingredient do you need?` : round.type === 'scale down' ? `Scale this recipe down to ${round.targetServings} servings, including fractional ingredients.` : round.type === 'find the servings' ? `This batch uses ${numberLabel(amountFor(round.givenIngredient!, round.targetServings, round.recipe.baseServings))} ${round.givenIngredient!.unit} of ${round.givenIngredient!.name}. How many servings does it make?` : 'Which recipe has the stronger flour-to-egg ratio?'
  const updateChoice = (value: 'A' | 'B') => { setChoice(value); setChecked(false); setCorrect(false) }
  const updateServings = (value: number) => { setServings(value); setChecked(false); setCorrect(false) }
  const compareOptions = <Stack spacing={1.5}><Paper elevation={0} onClick={() => updateChoice('A')} sx={{ p: 1.5, border: 1, borderColor: choice === 'A' ? 'primary.main' : 'divider', cursor: 'pointer' }}><Typography sx={{ fontWeight: 700 }}>Recipe A: {round.recipe.name}</Typography><Typography variant="body2">{round.recipe.ingredients[0].amount} {round.recipe.ingredients[0].unit} flour : {round.recipe.ingredients[1].amount} {round.recipe.ingredients[1].unit} eggs</Typography></Paper><Paper elevation={0} onClick={() => updateChoice('B')} sx={{ p: 1.5, border: 1, borderColor: choice === 'B' ? 'primary.main' : 'divider', cursor: 'pointer' }}><Typography sx={{ fontWeight: 700 }}>Recipe B: {round.compareRecipe?.name ?? ''}</Typography><Typography variant="body2">{round.compareRecipe?.ingredients[0]?.amount ?? ''} {round.compareRecipe?.ingredients[0]?.unit ?? ''} flour : {round.compareRecipe?.ingredients[1]?.amount ?? ''} {round.compareRecipe?.ingredients[1]?.unit ?? ''} eggs</Typography></Paper></Stack>
  const recipeControls = <Paper elevation={0} sx={{ p: 1.5, border: 1, borderColor: 'divider' }}><Typography variant="subtitle2">{round.type === 'find the servings' ? 'Enter the batch size' : `Servings: ${numberLabel(servings)} (base: ${round.recipe.baseServings})`}</Typography>{round.type !== 'find the servings' && <Slider min={1} max={round.recipe.baseServings * 3} step={.5} marks value={servings} onChange={(_, next) => updateServings(Array.isArray(next) ? next[0] : next)} aria-label="Recipe servings" />}{round.type === 'find the servings' && <TextField size="small" type="number" label="Number of servings" value={typedServings} onChange={(event) => { setTypedServings(event.target.value); setChecked(false); setCorrect(false) }} inputProps={{ min: 0, step: .5 }} />}<IngredientRows recipe={round.recipe} servings={round.type === 'find the servings' ? round.targetServings : servings} success={correct} /><Typography variant="body2" color="text.secondary">Live scale factor: {numberLabel(round.type === 'find the servings' ? scaleFactor : servings / round.recipe.baseServings)}×{round.type !== 'find the servings' && ` — ${numberLabel(servings)} ÷ ${round.recipe.baseServings} = ${numberLabel(servings / round.recipe.baseServings)}×`}</Typography></Paper>
  return <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, border: 1, borderColor: 'divider' }}><Stack spacing={2}><Box><Chip label="Platform engine" color="primary" variant="outlined" sx={{ mb: 1 }} /><Typography variant="h5">{topic.activity}</Typography><Typography color="text.secondary" sx={{ mt: .75 }}>{topic.activityDescription}</Typography></Box><Chip label="Foundation" color="primary" sx={{ alignSelf: 'flex-start' }} /><Typography variant="h6">Round {roundNumber + 1}: {round.type}</Typography><Typography variant="body2" color="text.secondary">{instruction}</Typography><Paper elevation={0} sx={{ p: 1.5, backgroundColor: 'background.default', border: 1, borderColor: 'divider' }}><Typography variant="subtitle2">{round.recipe.name} base recipe</Typography><Typography variant="body2" color="text.secondary">For {round.recipe.baseServings} servings: {round.recipe.ingredients.map((ingredient) => `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`).join(', ')}.</Typography></Paper>{round.type === 'compare recipes' ? compareOptions : recipeControls}<Stack direction="row" spacing={1} flexWrap="wrap"><Button variant="outlined" onClick={reset}>Reset</Button><Button variant="contained" onClick={checkActivity}>Check Activity</Button></Stack>{checked && <Paper role="status" elevation={0} sx={{ p: 1.5, border: 1, borderColor: correct ? 'success.main' : 'error.main', backgroundColor: correct ? 'success.light' : 'background.default', animation: correct ? 'recipeChef .7s ease' : 'recipeShake .35s ease', '@keyframes recipeChef': { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-5px)' } }, '@keyframes recipeShake': { '0%, 100%': { transform: 'translateX(0)' }, '25%': { transform: 'translateX(-4px)' }, '75%': { transform: 'translateX(4px)' } } }}><Typography sx={{ fontWeight: 700, color: correct ? 'success.main' : 'error.main' }}>{correct ? `Correct! ${numberLabel(scaleFactor)}× the recipe means ${round.recipe.ingredients[0].amount} × ${numberLabel(scaleFactor)} = ${numberLabel(amountFor(round.recipe.ingredients[0], round.targetServings, round.recipe.baseServings))} ${round.recipe.ingredients[0].unit}.` : 'Find the scale factor first — how many times bigger or smaller is the new batch?'}</Typography></Paper>}{correct && !completed && <Button variant="contained" onClick={() => { setCompleted(true); onComplete?.() }}>Complete Activity</Button>}{completed && <Stack direction="row" spacing={1} alignItems="center"><Typography color="success.main" sx={{ fontWeight: 700 }}>Activity complete — chef approved!</Typography><Button variant="outlined" onClick={nextRound}>Next round</Button></Stack>}</Stack></Paper>
}

export default RecipeMixerActivity
