import { type SimulationConfig } from '@/components/admin/admin-data'

export type StemSubject = 'Math' | 'Physics' | 'Chemistry' | 'Biology'
export type StemGradeBand = 'Grade 1–2' | 'Grade 3–5' | 'Grade 6–8' | 'Grade 9–10' | 'Grade 11–12'
export type StemTool = 'Interactive Diagram' | 'Calculator' | 'Graph' | 'Periodic Table' | 'Chemical Equation' | 'Number Line' | 'Counting Visualizer' | 'Shape Matcher' | 'Fraction Visualizer' | 'Geometry Builder' | 'Simulation / Virtual Lab'

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

const pendulumSimulation: SimulationConfig = {
  scenarioName: 'Pendulum experiment',
  overview: 'Investigate how the length of a pendulum changes the time for one complete swing. Keep the release angle small and compare the calculated period with your observation.',
  variables: [
    { id: 1, label: 'Length', min: 0.25, max: 2, step: 0.25, defaultValue: 1, unit: 'm' },
    { id: 2, label: 'Mass', min: 0.1, max: 2, step: 0.1, defaultValue: 0.5, unit: 'kg' },
    { id: 3, label: 'Release angle', min: 5, max: 30, step: 5, defaultValue: 10, unit: '°' },
  ],
  rule: 'pendulum-period',
  calculation: 'T = 2π√(length ÷ 9.81)',
  outputLabel: 'Calculated period for one swing',
  outputUnit: 's',
  observationPrompt: 'Describe the relationship you observe when the length increases.',
  expectedObservation: 'A longer pendulum has a longer period',
  acceptedObservations: ['longer length means slower swing', 'period increases with length', 'longer pendulum swings more slowly'],
}

const osmosisSimulation: SimulationConfig = {
  scenarioName: 'Osmosis lab',
  overview: 'Model water movement across a selectively permeable membrane. Compare the solution concentration with the cell concentration to predict the direction of net water movement.',
  variables: [
    { id: 1, label: 'Solution concentration', min: 0, max: 20, step: 1, defaultValue: 12, unit: '%' },
    { id: 2, label: 'Cell concentration', min: 0, max: 20, step: 1, defaultValue: 8, unit: '%' },
  ],
  rule: 'osmosis-movement',
  calculation: 'concentration difference = solution − cell',
  outputLabel: 'Concentration difference',
  outputUnit: '%',
  observationPrompt: 'Record the predicted direction of net water movement across the membrane.',
  expectedObservation: 'Water moves out of the cell',
  acceptedObservations: ['water leaves the cell', 'outward water movement', 'cell loses water'],
}

const topic = (subject: StemSubject, gradeBand: StemGradeBand, id: string, title: string, overview: string, tools: StemTool[], activitySteps: string[], status: StemTopic['status'] = 'available', simulation?: SimulationConfig): StemTopic => ({ id, subject, gradeBand, title, overview, tools, activitySteps, status, simulation })

export const STEM_GRADE_BANDS: StemGradeBand[] = ['Grade 1–2', 'Grade 3–5', 'Grade 6–8', 'Grade 9–10', 'Grade 11–12']
export const STEM_SUBJECTS: StemSubject[] = ['Math', 'Physics', 'Chemistry', 'Biology']

export const STEM_TOPICS: StemTopic[] = [
  topic('Math', 'Grade 1–2', 'math-counting', 'Counting and number sense', 'Build quantity recognition, one-to-one counting, and simple number comparisons.', ['Counting Visualizer', 'Number Line'], ['Count a set of objects', 'Place the number on a line', 'Compare two quantities']),
  topic('Math', 'Grade 1–2', 'math-shapes', 'Shapes around us', 'Identify, sort, and describe two-dimensional shapes by their features.', ['Shape Matcher', 'Geometry Builder'], ['Match each shape', 'Build a shape', 'Name its features']),
  topic('Math', 'Grade 3–5', 'math-fractions', 'Fractions and number lines', 'See fractions as equal parts and locate them on a number line.', ['Fraction Visualizer', 'Number Line', 'Calculator'], ['Build the fraction', 'Place it on a number line', 'Check an equivalent fraction']),
  topic('Math', 'Grade 3–5', 'math-multiplication', 'Multiplication patterns', 'Use arrays and repeated groups to connect multiplication with visual models.', ['Counting Visualizer', 'Calculator', 'Graph'], ['Make equal groups', 'Calculate the product', 'Plot the pattern']),
  topic('Math', 'Grade 6–8', 'math-ratios', 'Ratios and proportions', 'Explore equivalent ratios and solve everyday proportional relationships.', ['Calculator', 'Graph', 'Fraction Visualizer'], ['Set the ratio', 'Calculate an equivalent value', 'Plot the relationship']),
  topic('Math', 'Grade 6–8', 'math-geometry', 'Area and volume', 'Construct shapes and calculate area, surface area, and volume from dimensions.', ['Geometry Builder', 'Calculator'], ['Build the shape', 'Change a dimension', 'Calculate the measure']),
  topic('Math', 'Grade 9–10', 'math-linear', 'Linear equations and graphs', 'Connect slope, intercepts, equations, and straight-line graphs.', ['Graph', 'Calculator', 'Number Line'], ['Set the equation', 'Plot two points', 'Interpret the slope']),
  topic('Math', 'Grade 9–10', 'math-transformations', 'Transformations', 'Investigate translations, reflections, rotations, and scale changes on a coordinate plane.', ['Geometry Builder', 'Graph'], ['Choose a transformation', 'Move the shape', 'Describe the rule'], 'coming-soon'),
  topic('Math', 'Grade 11–12', 'math-functions', 'Functions and modeling', 'Represent changing quantities with functions and interpret their key features.', ['Graph', 'Calculator'], ['Define the function', 'Plot the model', 'Interpret the output']),
  topic('Math', 'Grade 11–12', 'math-calculus', 'Limits and rates of change', 'Build intuition for limits and instantaneous change from numerical and graphical patterns.', ['Graph', 'Calculator'], ['Explore a table', 'Zoom toward a point', 'Compare rates'], 'coming-soon'),
  topic('Physics', 'Grade 1–2', 'physics-forces-early', 'Pushes and pulls', 'Notice how pushes and pulls change the motion or shape of familiar objects.', ['Interactive Diagram'], ['Explore the diagram', 'Sort the examples', 'Explain the change'], 'coming-soon'),
  topic('Physics', 'Grade 3–5', 'physics-forces', 'Forces and motion', 'Compare balanced and unbalanced forces and predict how objects move.', ['Interactive Diagram', 'Graph', 'Calculator'], ['Identify the forces', 'Predict the motion', 'Plot the change']),
  topic('Physics', 'Grade 3–5', 'physics-light', 'Light and shadows', 'Explore how light travels and how objects create shadows.', ['Interactive Diagram', 'Geometry Builder'], ['Aim the light', 'Change the object', 'Explain the shadow'], 'coming-soon'),
  topic('Physics', 'Grade 6–8', 'physics-energy', 'Energy transfer', 'Trace energy changes between moving, stored, thermal, and light forms.', ['Interactive Diagram', 'Graph'], ['Identify the energy form', 'Trace a transfer', 'Compare the graph']),
  topic('Physics', 'Grade 6–8', 'physics-waves', 'Waves and sound', 'Relate amplitude, wavelength, and frequency to observable wave behavior.', ['Graph', 'Calculator'], ['Change the frequency', 'Graph a wave', 'Describe the pattern']),
  topic('Physics', 'Grade 9–10', 'physics-motion', 'Motion graphs', 'Read and build position-time and velocity-time graphs for moving objects.', ['Graph', 'Calculator', 'Number Line'], ['Set the motion', 'Plot the graph', 'Calculate the rate']),
  topic('Physics', 'Grade 9–10', 'physics-pendulum', 'Pendulum experiment', 'Run a controlled pendulum experiment and connect length with period through a validated observation.', ['Simulation / Virtual Lab', 'Graph', 'Calculator'], ['Adjust length, mass, and angle', 'Run the pendulum model', 'Record and validate the observation'], 'available', pendulumSimulation),
  topic('Physics', 'Grade 11–12', 'physics-electricity', 'Electric fields and circuits', 'Model potential difference, current, resistance, and energy in circuits.', ['Interactive Diagram', 'Calculator', 'Graph'], ['Build the circuit', 'Calculate current', 'Interpret the graph'], 'coming-soon'),
  topic('Physics', 'Grade 11–12', 'physics-momentum', 'Momentum and collisions', 'Use conservation of momentum to predict outcomes in one-dimensional collisions.', ['Calculator', 'Graph'], ['Set the masses', 'Calculate momentum', 'Compare before and after'], 'coming-soon'),
  topic('Chemistry', 'Grade 1–2', 'chemistry-materials', 'Materials around us', 'Sort everyday materials by visible properties and changes.', ['Interactive Diagram'], ['Explore materials', 'Sort by property', 'Describe a change'], 'coming-soon'),
  topic('Chemistry', 'Grade 3–5', 'chemistry-solids', 'Solids, liquids, and gases', 'Use particle models to compare the three common states of matter.', ['Interactive Diagram', 'Counting Visualizer'], ['Choose a state', 'Arrange the particles', 'Explain the spacing']),
  topic('Chemistry', 'Grade 6–8', 'chemistry-particles', 'Particles and temperature', 'Connect particle motion, temperature, and changes of state.', ['Interactive Diagram', 'Graph', 'Calculator'], ['Change the temperature', 'Observe particles', 'Plot the pattern']),
  topic('Chemistry', 'Grade 6–8', 'chemistry-mixtures', 'Mixtures and solutions', 'Distinguish mixtures and solutions using particle-level models.', ['Interactive Diagram', 'Calculator'], ['Mix the substances', 'Inspect the particles', 'Classify the result']),
  topic('Chemistry', 'Grade 9–10', 'chemistry-periodic', 'Periodic table patterns', 'Use groups and periods to predict element properties and patterns.', ['Periodic Table', 'Calculator'], ['Select an element', 'Compare its group', 'Predict a property']),
  topic('Chemistry', 'Grade 9–10', 'chemistry-equations', 'Chemical equations', 'Balance atoms and interpret coefficients in chemical reactions.', ['Chemical Equation', 'Periodic Table'], ['Inspect the reactants', 'Balance the equation', 'Explain conservation']),
  topic('Chemistry', 'Grade 9–10', 'chemistry-acids', 'Acids and bases', 'Compare pH, indicators, and neutralization in a guided chemical model.', ['Simulation / Virtual Lab', 'Chemical Equation', 'Calculator'], ['Choose acid and base inputs', 'Run the neutralization model', 'Validate the observed pH change']),
  topic('Chemistry', 'Grade 11–12', 'chemistry-equilibrium', 'Chemical equilibrium', 'Explore reversible reactions and how concentration changes shift equilibrium.', ['Graph', 'Calculator', 'Chemical Equation'], ['Set initial concentrations', 'Run the model', 'Interpret the graph'], 'coming-soon'),
  topic('Chemistry', 'Grade 11–12', 'chemistry-organic', 'Organic structures', 'Recognize functional groups and connect structure with molecular properties.', ['Interactive Diagram', 'Chemical Equation'], ['Build the structure', 'Identify the group', 'Predict a property'], 'coming-soon'),
  topic('Biology', 'Grade 1–2', 'biology-living', 'Living and non-living things', 'Identify common characteristics shared by living things.', ['Interactive Diagram'], ['Sort the examples', 'Find the shared feature', 'Explain your choice'], 'coming-soon'),
  topic('Biology', 'Grade 3–5', 'biology-ecosystems', 'Ecosystems and food chains', 'Trace how energy and matter move through a simple ecosystem.', ['Interactive Diagram', 'Graph'], ['Build the food chain', 'Trace energy flow', 'Read the population graph']),
  topic('Biology', 'Grade 3–5', 'biology-plants', 'Plant structures', 'Connect roots, stems, leaves, and flowers with their functions.', ['Interactive Diagram', 'Shape Matcher'], ['Label the plant', 'Match structure to function', 'Explain the connection']),
  topic('Biology', 'Grade 6–8', 'biology-cells', 'Cells and organelles', 'Explore cell structures and connect each organelle to its role.', ['Interactive Diagram', 'Shape Matcher'], ['Explore the cell', 'Match the organelle', 'Explain its function']),
  topic('Biology', 'Grade 6–8', 'biology-photosynthesis', 'Photosynthesis', 'Follow matter and energy through photosynthesis and identify the limiting inputs.', ['Interactive Diagram', 'Chemical Equation', 'Graph'], ['Explore the chloroplast', 'Balance the equation', 'Compare the rate']),
  topic('Biology', 'Grade 9–10', 'biology-genetics', 'Inheritance and traits', 'Use simple models to connect alleles, probability, and inherited traits.', ['Calculator', 'Counting Visualizer', 'Graph'], ['Set the alleles', 'Count the outcomes', 'Interpret the probability'], 'coming-soon'),
  topic('Biology', 'Grade 9–10', 'biology-osmosis', 'Osmosis lab', 'Run a virtual osmosis lab and validate the direction of water movement across a membrane.', ['Simulation / Virtual Lab', 'Graph', 'Calculator'], ['Adjust solution and cell concentrations', 'Run the membrane model', 'Record and validate the observation'], 'available', osmosisSimulation),
  topic('Biology', 'Grade 11–12', 'biology-cellular-respiration', 'Cellular respiration', 'Model how cells transfer energy from glucose through cellular respiration.', ['Chemical Equation', 'Graph', 'Calculator'], ['Set the inputs', 'Trace the pathway', 'Interpret the energy graph'], 'coming-soon'),
  topic('Biology', 'Grade 11–12', 'biology-evolution', 'Evolution and selection', 'Explore how variation and selection change populations over generations.', ['Graph', 'Calculator'], ['Set the variation', 'Run generations', 'Compare populations'], 'coming-soon'),
]
