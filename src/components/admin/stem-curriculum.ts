import { type AdminModule } from './admin-data'
import { type PlatformEngineId } from '@/components/stem-lab/platform-engine-library'

export const STEM_CURRICULUM: Record<string, string[]> = {
  Mathematics: ['Counting & Number Recognition', 'Comparing Numbers', 'Addition & Subtraction', 'Place Value', 'Multiplication/Division Concepts', 'Fractions', 'Decimals', 'Ratios', 'Percentages', 'Factors & Multiples', 'Measurement', 'Geometry', 'Angles', 'Perimeter & Area', 'Symmetry', 'Coordinate Grids', 'Data & Statistics', 'Probability', 'Patterns', 'Money', 'Time', 'Integers', 'Algebra', 'Linear Equations', 'Functions', 'Simultaneous Equations', 'Pythagorean Theorem', 'Sets', 'Similarity', 'Quadratic Equations', 'Sequences & Series', 'Trigonometry', 'Coordinate Geometry', 'Mathematical Modelling', 'Polynomial Functions', 'Exponential & Logarithmic Functions', 'Analytical Geometry', 'Vectors', 'Limits', 'Differentiation', 'Integration', 'Advanced Algebra'],
  Physics: ['Push & Pull', 'Movement', 'Fast & Slow', 'Light & Shadows', 'Sound & Vibrations', 'Heat & Cold', 'Magnets', 'Floating & Sinking', 'Forces & Motion', 'Friction', 'Gravity', 'Reflection', 'Simple Machines', 'Measuring Motion', 'Force', 'Energy', 'Electricity', 'Measurement', 'Motion', 'Work', 'Heat Transfer', 'Pressure', 'Speed & Velocity', 'Refraction', 'Vectors & Scalars', 'Linear Motion', "Newton's Laws", 'Momentum', 'Gravitation', 'Properties of Matter', 'Waves', 'Kinematics', 'Dynamics', 'Circular Motion', 'Fluid Mechanics', 'Thermal Physics', 'Oscillations', 'Electrostatics', 'Current Electricity', 'Magnetism', 'Electromagnetic Induction', 'Modern Physics', 'Nuclear Physics', 'Semiconductor Electronics'],
  Chemistry: ['Materials Around Us', 'Solids/Liquids/Gases', 'Properties of Materials', 'Mixing Materials', 'Dissolving', 'Changes in Materials', 'Matter', 'States of Matter', 'Solutions', 'Separation Methods', 'Acids & Bases', 'Water Chemistry', 'Chemical Safety', 'Atomic Structure', 'Elements & Compounds', 'Chemical Reactions', 'Indicators', 'Metals & Non-Metals', 'Periodic Table', 'Chemical Bonding', 'Chemical Formulae', 'Salts', 'Laboratory Techniques & Safety', 'Mole Concept', 'Stoichiometry', 'Oxidation & Reduction', 'Organic Chemistry', 'Chemical Kinetics', 'Chemical Equilibrium', 'Solubility Equilibrium', 'Thermochemistry', 'Electrochemistry', 'Redox Chemistry', 'Hydrocarbons', 'Alcohols & Ethers', 'Aldehydes & Ketones', 'Carboxylic Acids', 'Polymers', 'Biochemistry', 'Environmental Chemistry'],
  Biology: ['Living & Non-Living Things', 'Parts of Plants', 'Seeds & Germination', 'Animals Around Us', 'Human Body Parts', 'Five Senses', 'Food & Nutrition', 'Healthy Habits', 'Habitats', 'Plant Structure', 'Photosynthesis', 'Animal Classification', 'Life Cycles', 'Cells', 'Human Body Systems', 'Ecosystems', 'Food Chains', 'Cell Structure', 'Microscopes', 'Plant Reproduction', 'Respiration', 'Circulation', 'Biodiversity', 'Cell Biology', 'Biological Molecules', 'Enzymes', 'Cell Division', 'Genetics', 'Molecular Biology', 'Plant Physiology', 'Animal Physiology', 'Reproduction', 'Microbiology', 'Ecology', 'Evolution', 'Molecular Genetics', 'DNA & RNA', 'Biotechnology', 'Human Reproduction', 'Immunology', 'Population Biology', 'Conservation Biology'],
}

export const engineForTopic = (subject: string, topic: string): PlatformEngineId => {
  const value = topic.toLowerCase()
  if (subject === 'Mathematics') {
    if (/number|addition|subtraction|fraction|integer|counting/.test(value)) return 'number-line'
    if (/geometry|angle|perimeter|area|symmetry|pythagorean|similarity|vector/.test(value)) return 'geometry'
    if (/equation|algebra|polynomial|set/.test(value)) return 'equation-balance'
    if (/data|probability|statistics/.test(value)) return 'data-chart'
    if (/function|graph|coordinate|sequence|trigonometry|limit|differentiation|integration/.test(value)) return 'graph'
    return 'simulation'
  }
  if (subject === 'Physics') return 'physics'
  if (subject === 'Chemistry') {
    if (/atom|molecule|periodic|bond|organic|hydrocarbon|alcohol|aldehyde|polymer/.test(value)) return 'molecule-atom'
    if (/equation|formula|stoichiometry|redox|oxidation/.test(value)) return 'equation-balance'
    if (/lab|acid|base|solution|mix|dissolv|separation|indicator|electrochemistry/.test(value)) return 'virtual-lab'
    return 'simulation'
  }
  if (/microscope|cell/.test(value)) return 'microscope'
  if (/life cycle|reproduction|timeline|division/.test(value)) return 'timeline'
  if (/plant|body|animal|habitat|ecosystem|food|dna|molecular|structure/.test(value)) return 'biology-explorer'
  return 'simulation'
}

export const createStemCurriculumModules = (moduleIdStart: number, lessonIdStart: number): AdminModule[] => {
  let nextLessonId = lessonIdStart
  return Object.entries(STEM_CURRICULUM).map(([subject, topics], moduleIndex) => ({
    id: moduleIdStart + moduleIndex,
    title: subject,
    lessons: topics.map((title) => {
      const platformEngineId = engineForTopic(subject, title)
      return { id: nextLessonId++, title, type: 'simulation' as const, duration: 20, resources: [], simulationToolId: platformEngineId, platformEngineId }
    }),
  }))
}
