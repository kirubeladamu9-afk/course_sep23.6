import { describe, expect, it } from 'vitest'
import { BOND_REFERENCES, ChemicalBondEngine, classifyBond, lennardJonesForceMagnitude, lennardJonesPotential, morseForceMagnitude, morsePotential, shiftedCoulombPotential } from './chemical-bonding-engine'

const numericalDerivative = (energy: (distancePm: number) => number, distancePm: number) => {
  const stepPm = 0.001
  return (energy(distancePm + stepPm) - energy(distancePm - stepPm)) / (2 * stepPm)
}

const minimizedDistance = (symbols: string[]) => {
  const engine = new ChemicalBondEngine(symbols)
  engine.thermostatEnabled = false
  return engine.minimize(260).bondDistancePm
}

describe('chemical bonding analytic potentials', () => {
  it('matches Morse force to the negative numerical energy derivative', () => {
    const force = morseForceMagnitude(118, 109, 413)
    const derivative = numericalDerivative((distancePm) => morsePotential(distancePm, 109, 413), 118)
    expect(force).toBeCloseTo(-derivative, 3)
  })

  it('matches Lennard-Jones force to the negative numerical energy derivative', () => {
    const force = lennardJonesForceMagnitude(410, 340.3, 0.4393)
    const derivative = numericalDerivative((distancePm) => lennardJonesPotential(distancePm, 340.3, 0.4393), 410)
    expect(force).toBeCloseTo(-derivative, 5)
  })

  it('uses a finite shifted Coulomb potential at the cutoff', () => {
    expect(shiftedCoulombPotential(900, 1, -1)).toBe(0)
    expect(shiftedCoulombPotential(450, 1, -1)).toBeLessThan(0)
  })
})

describe('chemical bonding equilibrium references', () => {
  it.each([
    [['H', 'H'], 'H-H'],
    [['H', 'Cl'], 'Cl-H'],
    [['O', 'H'], 'H-O'],
    [['N', 'N'], 'N-N'],
    [['C', 'O'], 'C-O'],
  ] as const)('relaxes %s to its published bond length', (symbols, referenceKey) => {
    const distancePm = minimizedDistance([...symbols])
    expect(distancePm).toBeCloseTo(BOND_REFERENCES[referenceKey].lengthPm, 0)
  })

  it.each([
    [['O', 'H', 'H'], 104.5],
    [['N', 'H', 'H', 'H'], 107],
    [['C', 'H', 'H', 'H', 'H'], 109.5],
    [['C', 'F', 'F', 'F', 'F'], 109.5],
    [['C', 'Cl', 'Cl', 'Cl', 'Cl'], 109.5],
    [['C', 'O', 'O'], 180],
  ] as const)('preserves the %s equilibrium angle', (symbols, target) => {
    const engine = new ChemicalBondEngine([...symbols])
    engine.thermostatEnabled = false
    expect(engine.minimize(260).angleDeg).toBeCloseTo(target, 0)
  })
})

describe('chemical bonding classification and stoichiometry', () => {
  it.each([
    [['H', 'O'], 'covalent'], [['H', 'N'], 'covalent'], [['H', 'F'], 'covalent'], [['H', 'Cl'], 'covalent'],
    [['C', 'H'], 'covalent'], [['C', 'O'], 'covalent'], [['C', 'N'], 'covalent'], [['C', 'F'], 'covalent'], [['C', 'Cl'], 'covalent'],
    [['H', 'H'], 'covalent'], [['N', 'N'], 'covalent'], [['O', 'O'], 'covalent'], [['F', 'F'], 'covalent'], [['Cl', 'Cl'], 'covalent'],
    [['Na', 'F'], 'ionic'], [['Na', 'Cl'], 'ionic'], [['Na', 'O'], 'ionic'], [['Na', 'N'], 'ionic'],
    [['Mg', 'F'], 'ionic'], [['Mg', 'Cl'], 'ionic'], [['Mg', 'O'], 'ionic'], [['Mg', 'N'], 'ionic'],
    [['Na', 'Na'], 'metallic'], [['Mg', 'Mg'], 'metallic'], [['Na', 'Mg'], 'metallic'],
  ] as const)('classifies %s as %s', ([left, right], expected) => {
    expect(classifyBond(left, right, 'Covalent')).toBe(expected)
  })

  it.each([
    [['C', 'F', 'F', 'F', 'F'], 5], [['C', 'Cl', 'Cl', 'Cl', 'Cl'], 5],
    [['O', 'Na', 'Na'], 3], [['Mg', 'Cl', 'Cl'], 3], [['Mg', 'F', 'F'], 3],
  ] as const)('builds the requested %s composition with the expected atom count', (symbols, count) => {
    expect(new ChemicalBondEngine([...symbols]).snapshot().atoms).toHaveLength(count)
  })
})

describe('chemical bonding dynamics', () => {
  it('keeps energy nearly conserved when the thermostat is disabled', () => {
    const engine = new ChemicalBondEngine(['H', 'H'])
    engine.thermostatEnabled = false
    engine.atoms[0].velocity.x = 0.01
    engine.atoms[1].velocity.x = -0.01
    const initial = engine.snapshot().energy.total
    const final = engine.step(80).energy.total
    expect(Math.abs(final - initial)).toBeLessThan(Math.max(0.5, Math.abs(initial) * 0.05))
  })

  it('forms and breaks a bond using the covalent-radius hysteresis', () => {
    const engine = new ChemicalBondEngine(['H', 'H'])
    expect(engine.snapshot().bonds).toHaveLength(1)
    engine.setBondDistance(120)
    expect(engine.snapshot().bonds).toHaveLength(0)
    engine.setBondDistance(70)
    expect(engine.snapshot().bonds).toHaveLength(1)
  })
})
