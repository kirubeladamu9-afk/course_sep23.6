import { type SimulationConfig } from '@/components/admin/admin-data'
import { getStemTool } from './stem-tool-library'

export type StemSubject = 'Math' | 'Physics' | 'Chemistry' | 'Biology'
export type StemGradeBand = 'Grade 1–2' | 'Grade 3–5' | 'Grade 6–8' | 'Grade 9–10' | 'Grade 11–12'
export type StemTool = 'Interactive Diagram' | 'Calculator' | 'Graph' | 'Periodic Table' | 'Chemical Equation' | 'Number Line' | 'Counting Visualizer' | 'Shape Matcher' | 'Drag & Drop' | 'Matching' | 'Fraction Visualizer' | 'Geometry Builder' | 'Pendulum Lab' | 'Neutralization Lab' | 'Osmosis Lab' | 'Projectile Motion Lab'

export interface StemTopic {
  id: string
  subject: StemSubject
  gradeBand: StemGradeBand
  title: string
  overview: string
  tools: StemTool[]
  activitySteps: string[]
  status: 'available' | 'coming-soon'
  simulation?: SimulationConfig
}

export const STEM_GRADE_BANDS: StemGradeBand[] = ['Grade 1–2', 'Grade 3–5', 'Grade 6–8', 'Grade 9–10', 'Grade 11–12']
export const STEM_SUBJECTS: StemSubject[] = ['Math', 'Physics', 'Chemistry', 'Biology']

const slugify = (value: string) => value.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const topic = (subject: StemSubject, gradeBand: StemGradeBand, id: string, title: string, overview: string, tools: StemTool[], activitySteps: string[], status: StemTopic['status'] = 'available', simulation?: SimulationConfig): StemTopic => ({ id, subject, gradeBand, title, overview, tools, activitySteps, status, simulation })
const gradeForIndex = (index: number, length: number) => STEM_GRADE_BANDS[Math.min(STEM_GRADE_BANDS.length - 1, Math.floor((index * STEM_GRADE_BANDS.length) / length))]
const activityFor = (title: string) => [`Explore the animated ${title} model`, 'Adjust the variables and interact with the model', 'Explain and check what changed']

const physicsTitles = [
  'Push & Pull', 'Movement', 'Fast & Slow', 'Light & Shadows', 'Sound & Vibrations', 'Heat & Cold', 'Magnets', 'Floating & Sinking',
  'Forces & Motion', 'Friction', 'Gravity', 'Reflection', 'Simple Machines', 'Measuring Motion', 'Force', 'Energy', 'Electricity', 'Measurement',
  'Motion', 'Work', 'Heat Transfer', 'Pressure', 'Speed & Velocity', 'Refraction', 'Vectors & Scalars', 'Linear Motion', 'Newton’s Laws', 'Momentum',
  'Gravitation', 'Properties of Matter', 'Waves', 'Kinematics', 'Dynamics', 'Circular Motion', 'Fluid Mechanics', 'Thermal Physics', 'Oscillations',
  'Electrostatics', 'Current Electricity', 'Magnetism', 'Electromagnetic Induction', 'Modern Physics', 'Nuclear Physics', 'Semiconductor Electronics',
]

const chemistryTitles = [
  'Materials Around Us', 'Solids/Liquids/Gases', 'Properties of Materials', 'Mixing Materials', 'Dissolving', 'Changes in Materials', 'Matter', 'States of Matter',
  'Solutions', 'Separation Methods', 'Acids & Bases', 'Water Chemistry', 'Chemical Safety', 'Atomic Structure', 'Elements & Compounds', 'Chemical Reactions',
  'Indicators', 'Metals & Non-Metals', 'Periodic Table', 'Chemical Bonding', 'Chemical Formulae', 'Salts', 'Laboratory Techniques & Safety', 'Mole Concept',
  'Stoichiometry', 'Oxidation & Reduction', 'Organic Chemistry', 'Chemical Kinetics', 'Chemical Equilibrium', 'Solubility Equilibrium', 'Thermochemistry',
  'Electrochemistry', 'Redox Chemistry', 'Hydrocarbons', 'Alcohols & Ethers', 'Aldehydes & Ketones', 'Carboxylic Acids', 'Polymers', 'Biochemistry', 'Environmental Chemistry',
]

const biologyTitles = [
  'Living & Non-Living Things', 'Parts of Plants', 'Seeds & Germination', 'Animals Around Us', 'Human Body Parts', 'Five Senses', 'Food & Nutrition', 'Healthy Habits', 'Habitats',
  'Plant Structure', 'Photosynthesis', 'Animal Classification', 'Life Cycles', 'Cells', 'Human Body Systems', 'Ecosystems', 'Food Chains', 'Cell Structure',
  'Microscopes', 'Plant Reproduction', 'Respiration', 'Circulation', 'Biodiversity', 'Cell Biology', 'Biological Molecules', 'Enzymes', 'Cell Division', 'Genetics',
  'Molecular Biology', 'Plant Physiology', 'Animal Physiology', 'Reproduction', 'Microbiology', 'Ecology', 'Evolution', 'Molecular Genetics', 'DNA & RNA', 'Biotechnology',
  'Human Reproduction', 'Immunology', 'Population Biology', 'Conservation Biology',
]

const subjectTools: Record<StemSubject, StemTool[]> = {
  Math: ['Calculator', 'Graph', 'Geometry Builder'],
  Physics: ['Interactive Diagram', 'Graph', 'Calculator'],
  Chemistry: ['Interactive Diagram', 'Chemical Equation', 'Calculator'],
  Biology: ['Interactive Diagram', 'Graph', 'Drag & Drop'],
}

const makeScienceTopics = (subject: Exclude<StemSubject, 'Math'>, titles: string[]) => titles.map((title, index) => {
  const normalized = title.toLowerCase()
  const tool: StemTool | undefined = subject === 'Physics' && normalized === 'pendulum experiment' ? 'Pendulum Lab' : subject === 'Physics' && normalized === 'projectile motion' ? 'Projectile Motion Lab' : subject === 'Chemistry' && title === 'Acids & Bases' ? 'Neutralization Lab' : subject === 'Biology' && normalized === 'osmosis' ? 'Osmosis Lab' : undefined
  const simulation = tool === 'Pendulum Lab' ? getStemTool('pendulum-lab')?.config : tool === 'Projectile Motion Lab' ? getStemTool('projectile-motion-lab')?.config : tool === 'Neutralization Lab' ? getStemTool('neutralization-lab')?.config : tool === 'Osmosis Lab' ? getStemTool('osmosis-lab')?.config : undefined
  const tools = tool ? [tool, ...subjectTools[subject].slice(0, 2)] : subjectTools[subject]
  const overview = subject === 'Physics' && title === 'Forces & Motion' ? 'See how forces cause objects to move.' : subject === 'Physics' && title === 'Friction' ? 'Compare how friction differs across surfaces.' : `Build an animated, interactive understanding of ${title.toLowerCase()} through guided exploration and observable results.`
  return topic(subject, gradeForIndex(index, titles.length), `${subject.toLowerCase()}-${slugify(title)}-${index + 1}`, title, overview, tools, activityFor(title), 'available', simulation)
})

const mathTopics: StemTopic[] = [
  topic('Math', 'Grade 1–2', 'math-counting', 'Counting and number sense', 'Build quantity recognition, one-to-one counting, and simple number comparisons.', ['Counting Visualizer', 'Number Line'], ['Count a set of objects', 'Place the number on a line', 'Compare two quantities']),
  topic('Math', 'Grade 1–2', 'math-shapes', 'Shapes around us', 'Identify, sort, and describe two-dimensional shapes by their features.', ['Shape Matcher', 'Geometry Builder'], ['Match each shape', 'Build a shape', 'Name its features']),
  topic('Math', 'Grade 3–5', 'math-fractions', 'Fractions and number lines', 'See fractions as equal parts and locate them on a number line.', ['Fraction Visualizer', 'Number Line', 'Calculator'], ['Build the fraction', 'Place it on a number line', 'Check an equivalent fraction']),
  topic('Math', 'Grade 3–5', 'math-multiplication', 'Multiplication patterns', 'Use arrays and repeated groups to connect multiplication with visual models.', ['Counting Visualizer', 'Calculator', 'Graph'], ['Make equal groups', 'Calculate the product', 'Plot the pattern']),
  topic('Math', 'Grade 6–8', 'math-ratios', 'Ratios and proportions', 'Explore equivalent ratios and solve everyday proportional relationships.', ['Calculator', 'Graph', 'Fraction Visualizer'], ['Set the ratio', 'Calculate an equivalent value', 'Plot the relationship']),
  topic('Math', 'Grade 6–8', 'math-geometry', 'Area and volume', 'Construct shapes and calculate area, surface area, and volume from dimensions.', ['Geometry Builder', 'Calculator'], ['Build the shape', 'Change a dimension', 'Calculate the measure']),
  topic('Math', 'Grade 9–10', 'math-linear', 'Linear equations and graphs', 'Connect slope, intercepts, equations, and straight-line graphs.', ['Graph', 'Calculator', 'Number Line'], ['Set the equation', 'Plot two points', 'Interpret the slope']),
  topic('Math', 'Grade 9–10', 'math-transformations', 'Transformations', 'Investigate translations, reflections, rotations, and scale changes on a coordinate plane.', ['Geometry Builder', 'Graph'], ['Choose a transformation', 'Move the shape', 'Describe the rule']),
  topic('Math', 'Grade 11–12', 'math-functions', 'Functions and modeling', 'Represent changing quantities with functions and interpret their key features.', ['Graph', 'Calculator'], ['Define the function', 'Plot the model', 'Interpret the output']),
  topic('Math', 'Grade 11–12', 'math-calculus', 'Limits and rates of change', 'Build intuition for limits and instantaneous change from numerical and graphical patterns.', ['Graph', 'Calculator'], ['Explore a table', 'Zoom toward a point', 'Compare rates']),
]

export const STEM_TOPICS: StemTopic[] = [
  ...mathTopics,
  topic('Biology', 'Grade 1–2', 'biology-living-and-non-living', 'Living and non-living things', 'Sort familiar examples and explain what makes something living.', ['Drag & Drop', 'Interactive Diagram'], ['Sort the examples', 'Explore the differences']),
  ...makeScienceTopics('Physics', [...physicsTitles, 'Pendulum Experiment', 'Projectile Motion']),
  ...makeScienceTopics('Chemistry', chemistryTitles),
  ...makeScienceTopics('Biology', [...biologyTitles, 'Osmosis']),
]
