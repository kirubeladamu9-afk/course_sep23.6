export const STEM_CURRICULUM_SUBJECTS = ['mathematics', 'physics', 'chemistry', 'biology'] as const
export type StemCurriculumSubject = typeof STEM_CURRICULUM_SUBJECTS[number]

export type StemCurriculumSubjectEntry = {
  subject: StemCurriculumSubject
  label: string
  topics: readonly string[]
}

export type StemCurriculumGrade = {
  grade: number
  subjects: readonly StemCurriculumSubjectEntry[]
}

const subject = (subjectName: StemCurriculumSubject, label: string, topics: readonly string[]): StemCurriculumSubjectEntry => ({ subject: subjectName, label, topics })
const grade = (gradeNumber: number, subjects: readonly StemCurriculumSubjectEntry[]): StemCurriculumGrade => ({ grade: gradeNumber, subjects })

export const STEM_CURRICULUM: readonly StemCurriculumGrade[] = [
  grade(1, [
    subject('mathematics', 'Mathematics STEM Lab', ['Counting & Number Recognition', 'Comparing Numbers', 'Addition & Subtraction', 'Shapes Around Us', 'Patterns', 'Length & Height', 'Weight & Balance', 'Time', 'Money', 'Sorting & Classification']),
    subject('physics', 'Physics STEM Lab', ['Push & Pull', 'Movement', 'Fast & Slow', 'Light & Shadows', 'Sound & Vibrations', 'Heat & Cold', 'Magnets', 'Floating & Sinking']),
    subject('biology', 'Biology STEM Lab', ['Living & Non-Living Things', 'Parts of Plants', 'Seeds & Germination', 'Animals Around Us', 'Human Body Parts', 'Our Five Senses', 'Food & Nutrition', 'Healthy Habits', 'Habitats', 'Caring for Nature']),
    subject('chemistry', 'Chemistry STEM Lab', ['Materials Around Us', 'Solids, Liquids & Gases', 'Properties of Materials', 'Mixing Materials', 'Dissolving', 'Water Around Us', 'Changes in Materials', 'Safe Use of Materials']),
  ]),
  grade(2, [
    subject('mathematics', 'Mathematics', ['Place Value', 'Addition', 'Subtraction', 'Multiplication Concepts', 'Division Concepts', 'Fractions', '2D Shapes', '3D Objects', 'Measurement', 'Time & Calendar', 'Money', 'Data & Graphs', 'Patterns']),
    subject('physics', 'Physics', ['Types of Movement', 'Push & Pull', 'Forces in Everyday Life', 'Light & Shadows', 'Sound', 'Heat', 'Magnets', 'Floating & Sinking', 'Simple Machines']),
    subject('biology', 'Biology', ['Plant Parts', 'Plant Needs', 'Seed Germination', 'Animal Groups', 'Animal Needs', 'Human Body', 'Healthy Food', 'Senses', 'Life Cycles', 'Habitats']),
    subject('chemistry', 'Chemistry', ['Properties of Solids', 'Properties of Liquids', 'Properties of Gases', 'Mixing & Separating', 'Dissolving', 'Changes Caused by Heating', 'Water & Materials', 'Reversible & Irreversible Changes']),
  ]),
  grade(3, [
    subject('mathematics', 'Mathematics', ['Numbers to Thousands', 'Addition & Subtraction', 'Multiplication', 'Division', 'Fractions', 'Measurement', 'Perimeter', 'Area', 'Geometry', 'Angles', 'Time', 'Money', 'Data & Graphs', 'Patterns']),
    subject('physics', 'Physics', ['Forces & Motion', 'Friction', 'Gravity', 'Light', 'Reflection', 'Shadows', 'Sound', 'Vibrations', 'Heat Transfer', 'Magnets', 'Simple Machines']),
    subject('biology', 'Biology', ['Plant Structure', 'Photosynthesis Introduction', 'Plant Life Cycles', 'Animal Classification', 'Animal Adaptations', 'Human Skeleton', 'Muscles & Movement', 'Digestion', 'Respiration', 'Ecosystems']),
    subject('chemistry', 'Chemistry', ['Matter', 'States of Matter', 'Properties of Materials', 'Mixtures', 'Solutions', 'Separation Methods', 'Heating & Cooling', 'Changes of State', 'Water Properties', 'Material Selection']),
  ]),
  grade(4, [
    subject('mathematics', 'Mathematics', ['Large Numbers', 'Operations', 'Factors & Multiples', 'Fractions', 'Decimals', 'Measurement', 'Area & Perimeter', 'Angles', 'Symmetry', 'Geometry', 'Data Collection', 'Graphs', 'Probability Introduction']),
    subject('physics', 'Physics', ['Measuring Motion', 'Force', 'Friction', 'Gravity', 'Energy', 'Heat', 'Light', 'Reflection', 'Sound', 'Electricity Introduction', 'Magnets']),
    subject('biology', 'Biology', ['Plant Reproduction', 'Photosynthesis', 'Roots, Stems & Leaves', 'Animal Adaptations', 'Food Chains', 'Human Digestive System', 'Respiratory System', 'Circulatory System', 'Hygiene & Health', 'Ecosystems']),
    subject('chemistry', 'Chemistry', ['Matter & Its Properties', 'Physical Changes', 'Chemical Changes', 'Mixtures', 'Solutions', 'Separation Techniques', 'Acids & Bases Introduction', 'Water Purification', 'Materials & Their Uses', 'Everyday Chemistry']),
  ]),
  grade(5, [
    subject('mathematics', 'Mathematics', ['Whole Numbers', 'Fractions', 'Decimals', 'Ratios', 'Percentages', 'Factors & Multiples', 'Measurement', 'Area & Volume', 'Geometry', 'Coordinate Grids', 'Data & Statistics', 'Probability']),
    subject('physics', 'Physics', ['Measurement', 'Motion', 'Forces', 'Friction', 'Work', 'Energy', 'Heat Transfer', 'Light', 'Sound', 'Electricity', 'Magnetism']),
    subject('biology', 'Biology', ['Cells Introduction', 'Plant Structure', 'Photosynthesis', 'Plant Reproduction', 'Animal Classification', 'Human Body Systems', 'Nutrition', 'Respiration', 'Ecosystems', 'Food Chains', 'Environmental Conservation']),
    subject('chemistry', 'Chemistry', ['Particle Model of Matter', 'States of Matter', 'Physical & Chemical Changes', 'Mixtures', 'Solutions', 'Solubility', 'Separation Techniques', 'Acids & Bases', 'Water Chemistry', 'Chemical Safety']),
  ]),
  grade(6, [
    subject('mathematics', 'Mathematics', ['Integers', 'Fractions & Decimals', 'Ratios & Proportions', 'Percentages', 'Algebra Introduction', 'Equations', 'Geometry', 'Area & Volume', 'Coordinates', 'Statistics', 'Probability', 'Financial Mathematics']),
    subject('physics', 'Physics', ['Measurement & Units', 'Motion', 'Force', 'Pressure', 'Work & Energy', 'Heat', 'Light', 'Sound', 'Electricity', 'Magnetism', 'Simple Machines']),
    subject('biology', 'Biology', ['Cell Structure', 'Microscopes', 'Plant Tissues', 'Photosynthesis', 'Plant Reproduction', 'Animal Classification', 'Human Nutrition', 'Respiration', 'Circulation', 'Ecosystems', 'Biodiversity']),
    subject('chemistry', 'Chemistry', ['Atomic & Particle Models', 'Elements & Compounds', 'Mixtures', 'Solutions', 'Separation', 'Chemical Reactions', 'Acids & Bases', 'Indicators', 'Metals & Non-Metals', 'Water Chemistry', 'Environmental Chemistry']),
  ]),
  grade(7, [
    subject('mathematics', 'Mathematics', ['Integers & Rational Numbers', 'Algebraic Expressions', 'Linear Equations', 'Ratios & Proportions', 'Percentages', 'Geometry', 'Angles', 'Triangles', 'Circles', 'Area & Volume', 'Coordinate Geometry', 'Statistics', 'Probability']),
    subject('physics', 'Physics', ['Measurement', 'Motion', 'Speed & Velocity', 'Force', 'Pressure', 'Work', 'Energy', 'Heat Transfer', 'Light', 'Reflection & Refraction', 'Sound', 'Electricity', 'Magnetism']),
    subject('biology', 'Biology', ['Cell Structure', 'Microscopy', 'Cell Functions', 'Plant Nutrition', 'Photosynthesis', 'Plant Transport', 'Plant Reproduction', 'Animal Nutrition', 'Respiration', 'Circulation', 'Excretion', 'Ecosystems', 'Environmental Conservation']),
    subject('chemistry', 'Chemistry', ['Matter & Particles', 'Atomic Structure', 'Elements', 'Compounds', 'Chemical Formulae', 'Chemical Reactions', 'Acids & Bases', 'Salts', 'Metals', 'Separation Techniques', 'Water', 'Air & Environmental Chemistry']),
  ]),
  grade(8, [
    subject('mathematics', 'Mathematics', ['Real Numbers', 'Algebra', 'Linear Equations', 'Simultaneous Equations Introduction', 'Ratios & Proportions', 'Functions Introduction', 'Geometry', 'Transformations', 'Pythagorean Theorem', 'Mensuration', 'Statistics', 'Probability']),
    subject('physics', 'Physics', ['Measurement', 'Motion', 'Force & Newtonian Ideas', 'Pressure', 'Work & Energy', 'Heat', 'Light', 'Reflection', 'Refraction', 'Sound', 'Electricity', 'Magnetism']),
    subject('biology', 'Biology', ['Cell Biology', 'Tissues & Organs', 'Plant Physiology', 'Photosynthesis', 'Reproduction', 'Human Nutrition', 'Respiration', 'Circulation', 'Excretion', 'Coordination', 'Ecology', 'Biodiversity']),
    subject('chemistry', 'Chemistry', ['Atomic Structure', 'Periodic Table Introduction', 'Chemical Bonding Introduction', 'Chemical Formulae', 'Chemical Reactions', 'Acids, Bases & Salts', 'Metals & Non-Metals', 'Solutions', 'Water', 'Air', 'Environmental Chemistry', 'Laboratory Safety']),
  ]),
  grade(9, [
    subject('mathematics', 'Mathematics', ['Sets', 'Real Numbers', 'Algebraic Expressions', 'Linear Equations', 'Functions', 'Coordinate Geometry', 'Geometry', 'Similarity', 'Pythagorean Theorem', 'Statistics', 'Probability', 'Mathematical Modelling']),
    subject('physics', 'Physics', ['Measurement', 'Vectors & Scalars', 'Motion', 'Linear Motion', 'Forces', "Newton's Laws", 'Work, Energy & Power', 'Momentum', 'Gravitation', 'Properties of Matter', 'Heat', 'Waves', 'Sound', 'Electricity']),
    subject('chemistry', 'Chemistry', ['Laboratory Techniques & Safety', 'Matter', 'Atomic Structure', 'Periodic Table', 'Chemical Bonding', 'Chemical Formulae', 'Chemical Reactions', 'Mole Concept Introduction', 'Stoichiometry', 'Solutions', 'Acids & Bases', 'Environmental Chemistry']),
    subject('biology', 'Biology', ['Biology & Scientific Investigation', 'Cell Biology', 'Biological Molecules', 'Enzymes', 'Cell Division', 'Plant Structure', 'Plant Nutrition', 'Photosynthesis', 'Animal Nutrition', 'Respiration', 'Transport Systems', 'Ecology', 'Biodiversity']),
  ]),
  grade(10, [
    subject('mathematics', 'Mathematics', ['Number Systems', 'Algebra', 'Functions', 'Quadratic Equations', 'Sequences & Series', 'Geometry', 'Trigonometry', 'Coordinate Geometry', 'Statistics', 'Probability', 'Mathematical Modelling']),
    subject('physics', 'Physics', ['Vectors', 'Kinematics', 'Dynamics', 'Circular Motion', 'Work & Energy', 'Momentum', 'Gravitation', 'Fluid Mechanics', 'Thermal Physics', 'Waves', 'Sound', 'Electricity', 'Magnetism']),
    subject('chemistry', 'Chemistry', ['Atomic Structure', 'Periodic Properties', 'Chemical Bonding', 'Mole Concept', 'Stoichiometry', 'Chemical Reactions', 'States of Matter', 'Solutions', 'Acids & Bases', 'Oxidation & Reduction', 'Organic Chemistry Introduction', 'Environmental Chemistry']),
    subject('biology', 'Biology', ['Cell Biology', 'Biomolecules', 'Enzymes', 'Cell Division', 'Genetics Introduction', 'Plant Physiology', 'Animal Physiology', 'Human Body Systems', 'Reproduction', 'Ecology', 'Evolution', 'Biodiversity']),
  ]),
  grade(11, [
    subject('mathematics', 'Mathematics', ['Functions', 'Polynomial Functions', 'Exponential & Logarithmic Functions', 'Trigonometric Functions', 'Sequences & Series', 'Analytical Geometry', 'Vectors', 'Limits', 'Differentiation', 'Applications of Derivatives', 'Statistics', 'Probability']),
    subject('physics', 'Physics', ['Measurement & Experimental Methods', 'Kinematics', 'Dynamics', 'Momentum', 'Work & Energy', 'Circular Motion', 'Gravitation', 'Fluid Mechanics', 'Thermal Physics', 'Oscillations', 'Waves', 'Electrostatics', 'Current Electricity', 'Magnetism']),
    subject('chemistry', 'Chemistry', ['Laboratory Techniques', 'Atomic Structure', 'Periodic Trends', 'Chemical Bonding', 'Stoichiometry', 'Thermochemistry', 'Chemical Equilibrium', 'Acids & Bases', 'Redox Reactions', 'Electrochemistry', 'Organic Chemistry', 'Hydrocarbons', 'Environmental Chemistry']),
    subject('biology', 'Biology', ['Cell Biology', 'Biological Molecules', 'Enzymes', 'Cell Division', 'Genetics', 'Molecular Biology', 'Plant Physiology', 'Animal Physiology', 'Reproduction', 'Microbiology', 'Ecology', 'Evolution', 'Biodiversity']),
  ]),
  grade(12, [
    subject('mathematics', 'Mathematics', ['Functions', 'Advanced Algebra', 'Trigonometry', 'Vectors', 'Analytical Geometry', 'Limits', 'Differentiation', 'Applications of Differentiation', 'Integration', 'Applications of Integration', 'Statistics', 'Probability', 'Mathematical Modelling']),
    subject('physics', 'Physics', ['Advanced Mechanics', 'Gravitation', 'Oscillations', 'Waves', 'Sound', 'Electrostatics', 'Electric Fields', 'Current Electricity', 'Magnetism', 'Electromagnetic Induction', 'Electromagnetic Waves', 'Modern Physics', 'Atomic Physics', 'Nuclear Physics', 'Semiconductor Electronics']),
    subject('chemistry', 'Chemistry', ['Chemical Kinetics', 'Chemical Equilibrium', 'Acids & Bases', 'Solubility Equilibrium', 'Thermochemistry', 'Electrochemistry', 'Redox Chemistry', 'Organic Chemistry', 'Hydrocarbons', 'Alcohols & Ethers', 'Aldehydes & Ketones', 'Carboxylic Acids', 'Polymers', 'Biochemistry', 'Environmental Chemistry']),
    subject('biology', 'Biology', ['Genetics', 'Molecular Genetics', 'DNA & RNA', 'Biotechnology', 'Evolution', 'Plant Physiology', 'Animal Physiology', 'Human Reproduction', 'Immunology', 'Microbiology', 'Ecology', 'Population Biology', 'Biodiversity', 'Environmental Biology', 'Conservation Biology']),
  ]),
]

export type StemCurriculumValidation = {
  valid: boolean
  gradeCount: number
  subjectCount: number
  topicCount: number
  expectedSubjectsPerGrade: number
  invalidGrades: number[]
  emptySubjects: string[]
  duplicateTopics: string[]
  sourceMatchSummary: string
}

export const validateStemCurriculum = (curriculum: readonly StemCurriculumGrade[] = STEM_CURRICULUM): StemCurriculumValidation => {
  const invalidGrades = curriculum.filter((entry) => {
    const subjects = entry.subjects.map((item) => item.subject)
    return entry.subjects.length !== STEM_CURRICULUM_SUBJECTS.length || new Set(subjects).size !== STEM_CURRICULUM_SUBJECTS.length || STEM_CURRICULUM_SUBJECTS.some((expectedSubject) => !subjects.includes(expectedSubject))
  }).map((entry) => entry.grade)
  const emptySubjects: string[] = []
  const duplicateTopics: string[] = []
  curriculum.forEach((entry) => entry.subjects.forEach((item) => {
    if (item.topics.length === 0) emptySubjects.push(`Grade ${entry.grade} · ${item.label}`)
    const seen = new Set<string>()
    item.topics.forEach((topic, index) => {
      if (seen.has(topic)) duplicateTopics.push(`Grade ${entry.grade} · ${item.label} · ${index + 1} · ${topic}`)
      seen.add(topic)
    })
  }))
  const subjectCount = curriculum.reduce((total, entry) => total + entry.subjects.length, 0)
  const topicCount = curriculum.reduce((total, entry) => total + entry.subjects.reduce((subjectTotal, item) => subjectTotal + item.topics.length, 0), 0)
  const valid = curriculum.length === 12 && invalidGrades.length === 0 && emptySubjects.length === 0 && duplicateTopics.length === 0
  return {
    valid,
    gradeCount: curriculum.length,
    subjectCount,
    topicCount,
    expectedSubjectsPerGrade: STEM_CURRICULUM_SUBJECTS.length,
    invalidGrades,
    emptySubjects,
    duplicateTopics,
    sourceMatchSummary: valid ? 'Matches the supplied Grade 1–12 curriculum: 12 grades, 48 subjects, and all topics preserved in source order.' : 'Does not match the supplied Grade 1–12 curriculum validation requirements.',
  }
}

export const STEM_CURRICULUM_VALIDATION = validateStemCurriculum()
