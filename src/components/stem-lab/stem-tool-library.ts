import { type SimulationConfig } from '@/components/admin/admin-data'

export type StemToolId = 'pendulum-lab' | 'neutralization-lab' | 'osmosis-lab' | 'projectile-motion-lab'
export type StemToolSubject = 'Physics' | 'Chemistry' | 'Biology'

export interface StemToolDefinition {
  id: StemToolId
  name: string
  subject: StemToolSubject
  topic: string
  description: string
  config: SimulationConfig
}

export const STEM_TOOL_LIBRARY: StemToolDefinition[] = [
  {
    id: 'pendulum-lab',
    name: 'Pendulum Lab',
    subject: 'Physics',
    topic: 'Pendulum experiment',
    description: 'Test how length changes the period of a pendulum.',
    config: {
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
    },
  },
  {
    id: 'neutralization-lab',
    name: 'Neutralization Lab',
    subject: 'Chemistry',
    topic: 'Acids and bases',
    description: 'Mix acid and base inputs and identify the neutralization result.',
    config: {
      scenarioName: 'Acid-base neutralization',
      overview: 'Add a measured base to an acid sample and observe how the balance between hydrogen and hydroxide ions changes toward neutral pH.',
      variables: [
        { id: 1, label: 'Acid volume', min: 10, max: 100, step: 10, defaultValue: 50, unit: 'mL' },
        { id: 2, label: 'Acid concentration', min: 0.1, max: 1, step: 0.1, defaultValue: 0.5, unit: 'M' },
        { id: 3, label: 'Base volume', min: 10, max: 100, step: 10, defaultValue: 50, unit: 'mL' },
        { id: 4, label: 'Base concentration', min: 0.1, max: 1, step: 0.1, defaultValue: 0.5, unit: 'M' },
      ],
      rule: 'neutralization',
      calculation: 'moles H⁺ − moles OH⁻; equal moles produce neutral pH',
      outputLabel: 'Remaining acid/base balance',
      outputUnit: 'mmol',
      observationPrompt: 'Record what happens when equal acid and base amounts are mixed.',
      expectedObservation: 'The solution becomes neutral',
      acceptedObservations: ['pH moves toward 7', 'acid and base cancel', 'neutral pH'],
    },
  },
  {
    id: 'osmosis-lab',
    name: 'Osmosis Lab',
    subject: 'Biology',
    topic: 'Osmosis',
    description: 'Model water movement across a selectively permeable membrane.',
    config: {
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
    },
  },
  {
    id: 'projectile-motion-lab',
    name: 'Projectile Motion Lab',
    subject: 'Physics',
    topic: 'Projectile motion',
    description: 'Adjust launch conditions and calculate the horizontal range of a projectile.',
    config: {
      scenarioName: 'Projectile motion experiment',
      overview: 'Change the launch speed, angle, and starting height to investigate how launch conditions affect a projectile’s path.',
      variables: [
        { id: 1, label: 'Launch speed', min: 5, max: 40, step: 5, defaultValue: 20, unit: 'm/s' },
        { id: 2, label: 'Launch angle', min: 15, max: 75, step: 5, defaultValue: 45, unit: '°' },
        { id: 3, label: 'Starting height', min: 0, max: 20, step: 1, defaultValue: 2, unit: 'm' },
      ],
      rule: 'projectile-range',
      calculation: 'range = speed² × sin(2 × angle) ÷ 9.81',
      outputLabel: 'Approximate horizontal range',
      outputUnit: 'm',
      observationPrompt: 'Describe the launch angle that produces the greatest range when height is fixed.',
      expectedObservation: 'An angle near 45 degrees gives the greatest range',
      acceptedObservations: ['45 degrees gives the greatest range', 'range is greatest near 45 degrees', 'a 45 degree angle maximizes range'],
    },
  },
]

export const getStemTool = (id?: string) => STEM_TOOL_LIBRARY.find((tool) => tool.id === id)
export const STEM_TOOL_PICKER_COMING_SOON = ['Electric Fields Lab', 'Cellular Respiration Lab', 'Chemical Equilibrium Lab']
