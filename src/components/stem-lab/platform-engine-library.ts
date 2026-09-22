export type PlatformEngineId =
  | 'drag-drop'
  | 'living-or-not'
  | 'plant-labeling'
  | 'human-body-parts'
  | 'healthy-plate'
  | 'matching'
  | 'number-line'
  | 'graph'
  | 'geometry'
  | 'equation-balance'
  | 'simulation'
  | 'physics'
  | 'virtual-lab'
  | 'molecule-atom'
  | 'biology-explorer'
  | 'microscope'
  | 'timeline'
  | 'data-chart'
  | 'prediction-experiment'

export type PlatformEngineDefinition = {
  id: PlatformEngineId
  name: string
  description: string
  subjects: string[]
  examples: string[]
  interaction: string
}

export const PLATFORM_ENGINES: PlatformEngineDefinition[] = [
  { id: 'drag-drop', name: 'Drag & Drop', description: 'Sort, classify, and place objects into meaningful categories.', subjects: ['Math', 'Chemistry', 'Biology'], examples: ['Living vs non-living', 'Habitats', 'Base-10 blocks'], interaction: 'Drag objects into validated drop zones.' },
  { id: 'living-or-not', name: 'Living or Not?', description: 'Sort everyday objects into living and non-living groups.', subjects: ['Biology'], examples: ['Trees and rocks', 'Seeds and batteries', 'Everyday objects'], interaction: 'Drag or tap objects into validated living and non-living bins.' },
  { id: 'plant-labeling', name: 'Label the Plant', description: "Explore how a plant's structure supports its function.", subjects: ['Biology'], examples: ['Plant structures', 'Functions of roots and leaves', 'Flowering plants'], interaction: 'Drag or tap labels onto the correct plant structures.' },
  { id: 'human-body-parts', name: 'Label the Body', description: 'Identify major parts of the human body.', subjects: ['Biology'], examples: ['Body regions', 'Muscles and movement', 'Human anatomy'], interaction: 'Drag or tap labels onto the numbered body pointers.' },
  { id: 'healthy-plate', name: 'Build a Healthy Plate', description: 'Build a balanced, healthy meal.', subjects: ['Biology'], examples: ['Food groups', 'Balanced meals', 'Healthy choices'], interaction: 'Tap foods, sort their groups, judge balance, and apply the idea.' },
  { id: 'matching', name: 'Matching', description: 'Connect related terms, symbols, structures, and definitions.', subjects: ['Math', 'Chemistry', 'Biology'], examples: ['Shapes and features', 'DNA base pairs', 'Element and symbol'], interaction: 'Select one item from each column to form a pair.' },
  { id: 'number-line', name: 'Interactive Number Line', description: 'Place values and visualize movement for arithmetic and integers.', subjects: ['Math'], examples: ['Addition and subtraction', 'Fractions', 'Comparing numbers'], interaction: 'Drag a marker to a target value on a scaled line.' },
  { id: 'graph', name: 'Graph Builder', description: 'Manipulate parameters and see equations, data, and motion update live.', subjects: ['Math', 'Physics'], examples: ['Linear equations', 'Quadratics', 'Motion graphs'], interaction: 'Change controls and inspect the rendered curve.' },
  { id: 'geometry', name: 'Geometry Manipulator', description: 'Construct shapes while measurements update from draggable vertices.', subjects: ['Math'], examples: ['Area and perimeter', 'Angles', 'Pythagorean theorem'], interaction: 'Drag vertices and observe geometric calculations.' },
  { id: 'equation-balance', name: 'Equation / Balance', description: 'Solve algebraic and chemical equations by keeping both sides equivalent.', subjects: ['Math', 'Chemistry'], examples: ['x + 3 = 7', 'Chemical equations', 'Stoichiometry'], interaction: 'Adjust both sides until the configured equality is satisfied.' },
  { id: 'simulation', name: 'Simulation', description: 'Change inputs, run a rule, and explain the resulting value.', subjects: ['Math', 'Physics', 'Chemistry', 'Biology'], examples: ['Population growth', 'Dissolving', 'Photosynthesis'], interaction: 'Manipulate variables and run a calculated model.' },
  { id: 'physics', name: 'Physics Playground', description: 'Animate motion and forces from controllable physical parameters.', subjects: ['Physics'], examples: ['Projectile motion', 'Collisions', 'Waves'], interaction: 'Change physical inputs and run the animated model.' },
  { id: 'virtual-lab', name: 'Virtual Lab', description: 'Follow a safe, observable procedure with materials, measurements, and results.', subjects: ['Chemistry', 'Biology'], examples: ['Acids and bases', 'Mixing materials', 'Osmosis'], interaction: 'Set up, run, observe, and validate an experiment.' },
  { id: 'molecule-atom', name: 'Molecule / Atom Builder', description: 'Construct atoms and molecule structures from connected parts.', subjects: ['Chemistry'], examples: ['Atomic structure', 'Chemical bonding', 'Organic molecules'], interaction: 'Place particles or atoms and validate the target structure.' },
  { id: 'biology-explorer', name: 'Biology Explorer', description: 'Explore labeled structures and reveal connected biological processes.', subjects: ['Biology'], examples: ['Plant parts', 'Cell organelles', 'Human body systems'], interaction: 'Select hotspots to reveal explanations and relationships.' },
  { id: 'microscope', name: 'Virtual Microscope', description: 'Zoom into specimens and identify structures at increasing magnification.', subjects: ['Biology'], examples: ['Plant cells', 'Animal cells', 'Specimens'], interaction: 'Adjust magnification and inspect labeled structures.' },
  { id: 'timeline', name: 'Timeline / Lifecycle', description: 'Arrange stages and reason about sequence, change, and cause.', subjects: ['Biology', 'Physics'], examples: ['Life cycles', 'Mitosis', 'Historical processes'], interaction: 'Reorder stages and validate the sequence.' },
  { id: 'data-chart', name: 'Data / Chart Builder', description: 'Build charts from values and calculate statistics from the same data.', subjects: ['Math', 'Physics', 'Biology'], examples: ['Mean and median', 'Experimental probability', 'Population data'], interaction: 'Adjust values and read the live visualization.' },
  { id: 'prediction-experiment', name: 'Prediction → Experiment → Result', description: 'Wrap any engine in a prediction, test, observation, and explanation flow.', subjects: ['Math', 'Physics', 'Chemistry', 'Biology'], examples: ['Predict projectile range', 'Predict pH', 'Predict population change'], interaction: 'Choose a prediction, run the embedded engine, and compare outcomes.' },
]

export const getPlatformEngine = (id: PlatformEngineId) => PLATFORM_ENGINES.find((engine) => engine.id === id)

export const engineForStemTool: Record<string, PlatformEngineId> = {
  'Drag & Drop': 'drag-drop',
  Matching: 'matching',
  'Shape Matcher': 'matching',
  'Counting Visualizer': 'drag-drop',
  'Fraction Visualizer': 'number-line',
  'Number Line': 'number-line',
  Graph: 'graph',
  'Geometry Builder': 'geometry',
  'Chemical Equation': 'equation-balance',
  Calculator: 'simulation',
  'Interactive Diagram': 'biology-explorer',
  'Periodic Table': 'molecule-atom',
  'Pendulum Lab': 'physics',
  'Projectile Motion Lab': 'physics',
  'Neutralization Lab': 'virtual-lab',
  'Osmosis Lab': 'virtual-lab',
}
