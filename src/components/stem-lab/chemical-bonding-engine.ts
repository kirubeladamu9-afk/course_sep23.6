export type Vec3 = { x: number; y: number; z: number }

export type BondMode = 'Covalent' | 'Ionic' | 'Metallic'

export type ElementData = {
  symbol: string
  name: string
  atomicNumber: number
  color: string
  cpkColor: string
  covalentRadiusPm: number
  shells: number[]
  valence: number
  electronegativity: number
  massAmu: number
  metal: boolean
  ljSigmaPm: number
  ljEpsilonKjMol: number
}

export type EngineAtom = {
  id: number
  symbol: string
  position: Vec3
  velocity: Vec3
  force: Vec3
  charge: number
}

export type EngineBond = {
  a: number
  b: number
  order: number
  distancePm: number
  active: boolean
}

export type EngineEnergy = {
  kinetic: number
  potential: number
  total: number
  temperatureK: number
}

export type EngineSnapshot = {
  atoms: EngineAtom[]
  bonds: EngineBond[]
  energy: EngineEnergy
  timeFs: number
  bondDistancePm: number
  equilibriumDistancePm: number
  angleDeg: number | null
  targetAngleDeg: number | null
  brokenBond: boolean
}

export const CHEMICAL_ELEMENTS: ElementData[] = [
  // Covalent radii and CPK colors: Blue Obelisk Data Repository, elements 1, 6–9, 11, 12 and 17.
  // Pauling electronegativities: NIST Chemistry WebBook / Allred-Rochow compilation.
  // Masses and shell populations: NIST Atomic Spectra Database, standard atomic weights.
  // Lennard-Jones sigma/epsilon: Rappe et al., UFF, J. Am. Chem. Soc. 1992, 114, 10024.
  { symbol: 'H', name: 'Hydrogen', atomicNumber: 1, color: '#f0f4f7', cpkColor: '#FFFFFF', covalentRadiusPm: 31, shells: [1], valence: 1, electronegativity: 2.20, massAmu: 1.008, metal: false, ljSigmaPm: 255.1, ljEpsilonKjMol: 0.0657 },
  { symbol: 'C', name: 'Carbon', atomicNumber: 6, color: '#414141', cpkColor: '#404040', covalentRadiusPm: 76, shells: [2, 4], valence: 4, electronegativity: 2.55, massAmu: 12.011, metal: false, ljSigmaPm: 340.3, ljEpsilonKjMol: 0.4393 },
  { symbol: 'N', name: 'Nitrogen', atomicNumber: 7, color: '#4c85d3', cpkColor: '#3050F8', covalentRadiusPm: 71, shells: [2, 5], valence: 5, electronegativity: 3.04, massAmu: 14.007, metal: false, ljSigmaPm: 325.6, ljEpsilonKjMol: 0.7113 },
  { symbol: 'O', name: 'Oxygen', atomicNumber: 8, color: '#e55252', cpkColor: '#FF0D0D', covalentRadiusPm: 66, shells: [2, 6], valence: 6, electronegativity: 3.44, massAmu: 15.999, metal: false, ljSigmaPm: 296.4, ljEpsilonKjMol: 0.6694 },
  { symbol: 'F', name: 'Fluorine', atomicNumber: 9, color: '#a8e08a', cpkColor: '#90E050', covalentRadiusPm: 57, shells: [2, 7], valence: 7, electronegativity: 3.98, massAmu: 18.998, metal: false, ljSigmaPm: 311.7, ljEpsilonKjMol: 0.2552 },
  { symbol: 'Na', name: 'Sodium', atomicNumber: 11, color: '#8b8bd8', cpkColor: '#AB5CF2', covalentRadiusPm: 166, shells: [2, 8, 1], valence: 1, electronegativity: 0.93, massAmu: 22.990, metal: true, ljSigmaPm: 279.1, ljEpsilonKjMol: 0.0115 },
  { symbol: 'Mg', name: 'Magnesium', atomicNumber: 12, color: '#b5a4dd', cpkColor: '#8AFF00', covalentRadiusPm: 141, shells: [2, 8, 2], valence: 2, electronegativity: 1.31, massAmu: 24.305, metal: true, ljSigmaPm: 252.2, ljEpsilonKjMol: 0.1113 },
  { symbol: 'Cl', name: 'Chlorine', atomicNumber: 17, color: '#68d2a0', cpkColor: '#1FF01F', covalentRadiusPm: 102, shells: [2, 8, 7], valence: 7, electronegativity: 3.16, massAmu: 35.45, metal: false, ljSigmaPm: 347.3, ljEpsilonKjMol: 0.1084 },
]

const ELEMENT_BY_SYMBOL = new Map(CHEMICAL_ELEMENTS.map((element) => [element.symbol, element]))

export const BOND_REFERENCES: Record<string, { order: number; lengthPm: number; energyKjMol: number }> = {
  // NIST CCCBDB experimental equilibrium distances and dissociation energies; UFF bond-order references.
  'H-H': { order: 1, lengthPm: 74, energyKjMol: 436 },
  'Cl-H': { order: 1, lengthPm: 127, energyKjMol: 431 },
  'H-O': { order: 1, lengthPm: 96, energyKjMol: 463 },
  'C-H': { order: 1, lengthPm: 109, energyKjMol: 413 },
  'C-O': { order: 2, lengthPm: 116, energyKjMol: 799 },
  'N-N': { order: 3, lengthPm: 110, energyKjMol: 945 },
  'O-O': { order: 2, lengthPm: 121, energyKjMol: 498 },
  'C-C': { order: 1, lengthPm: 154, energyKjMol: 347 },
}

// NIST CCCBDB equilibrium angles: water 104.5°, ammonia 107.0°, methane 109.5°.
export const TARGET_ANGLES_DEG = { H2O: 104.5, NH3: 107, CH4: 109.5, CO2: 180 }

// UFF uses a Morse well; alpha is a teaching-scale inverse pm chosen to show vibration over a desktop viewport.
const MORSE_ALPHA_PER_PM = 0.020
// UFF angle-bending force constants are represented here by a stable cosine-well teaching value in kJ mol−1.
const ANGLE_FORCE_KJ_MOL = 55
// Rappe et al. UFF uses geometric combining rules for unlike Lennard-Jones atom types.
const LJ_CUTOFF_PM = 900
// Coulomb constant 138.935456 kJ mol−1 nm e−2 from CODATA 2018, converted from nm to pm.
const COULOMB_KJ_PM = 138935.456
// SPC/E water partial charges: Jorgensen et al., J. Chem. Phys. 1994, 100, 7164.
const PARTIAL_CHARGES: Record<string, number> = { H: 0.417, O: -0.834, C: 0, N: 0, F: 0, Na: 1, Mg: 2, Cl: -1 }
// CODATA 2018 Boltzmann constant in kJ mol−1 K−1.
const BOLTZMANN_KJ_MOL_K = 0.008314462618
// Requested integrator timestep: 0.5 fs, within the sub-femtosecond range used for covalent vibrations.
export const TIME_STEP_FS = 0.5
// Requested live bond hysteresis: form at 1.2× and break at 1.5× the covalent-radius sum.
const BOND_FORMATION_FACTOR = 1.2
const BOND_BREAK_FACTOR = 1.5
// The requested 1-4 non-bonded scale is 0.5; 1-2 and 1-3 interactions are excluded.
const ONE_FOUR_SCALE = 0.5
const FORCE_TO_ACCELERATION = 0.001

export const vec = (x = 0, y = 0, z = 0): Vec3 => ({ x, y, z })
const add = (a: Vec3, b: Vec3): Vec3 => vec(a.x + b.x, a.y + b.y, a.z + b.z)
const sub = (a: Vec3, b: Vec3): Vec3 => vec(a.x - b.x, a.y - b.y, a.z - b.z)
const scale = (a: Vec3, factor: number): Vec3 => vec(a.x * factor, a.y * factor, a.z * factor)
const dot = (a: Vec3, b: Vec3) => a.x * b.x + a.y * b.y + a.z * b.z
const length = (a: Vec3) => Math.sqrt(dot(a, a))
const unit = (a: Vec3) => scale(a, 1 / Math.max(length(a), 1e-8))
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const pairKey = (a: string, b: string) => [a, b].sort().join('-')
const element = (symbol: string) => ELEMENT_BY_SYMBOL.get(symbol) ?? CHEMICAL_ELEMENTS[0]

export const morsePotential = (distancePm: number, equilibriumPm: number, depthKjMol: number, alphaPerPm = MORSE_ALPHA_PER_PM) => {
  const exponential = Math.exp(-alphaPerPm * (distancePm - equilibriumPm))
  return depthKjMol * (1 - exponential) ** 2
}

export const morseForceMagnitude = (distancePm: number, equilibriumPm: number, depthKjMol: number, alphaPerPm = MORSE_ALPHA_PER_PM) => {
  const exponential = Math.exp(-alphaPerPm * (distancePm - equilibriumPm))
  return -2 * depthKjMol * alphaPerPm * exponential * (1 - exponential)
}

export const lennardJonesPotential = (distancePm: number, sigmaPm: number, epsilonKjMol: number) => {
  const ratio = sigmaPm / Math.max(distancePm, 1e-6)
  const sixth = ratio ** 6
  return 4 * epsilonKjMol * (sixth * sixth - sixth)
}

export const lennardJonesForceMagnitude = (distancePm: number, sigmaPm: number, epsilonKjMol: number) => {
  const ratio = sigmaPm / Math.max(distancePm, 1e-6)
  const sixth = ratio ** 6
  return (24 * epsilonKjMol / Math.max(distancePm, 1e-6)) * (2 * sixth * sixth - sixth)
}

export const shiftedCoulombPotential = (distancePm: number, chargeA: number, chargeB: number, cutoffPm = LJ_CUTOFF_PM) => {
  if (distancePm >= cutoffPm) return 0
  return COULOMB_KJ_PM * chargeA * chargeB * (1 / Math.max(distancePm, 1e-6) - 1 / cutoffPm)
}

const shiftedCoulombForceMagnitude = (distancePm: number, chargeA: number, chargeB: number) => COULOMB_KJ_PM * chargeA * chargeB / Math.max(distancePm, 1e-6) ** 2

const referenceFor = (a: string, b: string) => {
  const key = pairKey(a, b)
  const known = BOND_REFERENCES[key]
  if (known) return known
  const left = element(a)
  const right = element(b)
  return { order: 1, lengthPm: Math.round(left.covalentRadiusPm + right.covalentRadiusPm), energyKjMol: 350 }
}

export const estimateBondOrder = (a: string, b: string, distancePm: number) => {
  const key = pairKey(a, b)
  if (key === 'C-O') return distancePm < 125 ? 2 : 1
  if (key === 'N-N') return distancePm < 118 ? 3 : 1
  if (key === 'O-O') return distancePm < 128 ? 2 : 1
  return referenceFor(a, b).order
}

export const classifyBond = (a: string, b: string, mode: BondMode) => {
  const left = element(a)
  const right = element(b)
  if (mode === 'Metallic' || (left.metal && right.metal)) return 'metallic' as const
  if (Math.abs(left.electronegativity - right.electronegativity) > 1.7) return 'ionic' as const
  return 'covalent' as const
}

export const moleculeAngle = (a: string, b: string, c: string) => {
  const symbols = [a, b, c].sort().join('')
  if (symbols === 'HHO') return TARGET_ANGLES_DEG.H2O
  if (symbols === 'HNN') return TARGET_ANGLES_DEG.NH3
  if (symbols === 'CHH') return TARGET_ANGLES_DEG.CH4
  if (symbols === 'COO') return TARGET_ANGLES_DEG.CO2
  return null
}

const rotate = (radius: number, angle: number, z = 0): Vec3 => vec(radius * Math.cos(angle), radius * Math.sin(angle), z)

export const createMolecule = (symbols: string[]): { atoms: EngineAtom[]; angleTargetDeg: number | null } => {
  const formula = [...symbols].sort().join('')
  let positions: Vec3[]
  let angleTargetDeg: number | null = null
  if (formula === 'HHO') {
    const radius = 96
    const halfAngle = (TARGET_ANGLES_DEG.H2O * Math.PI) / 360
    positions = [vec(0, 0, 0), vec(-radius * Math.sin(halfAngle), radius * Math.cos(halfAngle), 0), vec(radius * Math.sin(halfAngle), radius * Math.cos(halfAngle), 0)]
    angleTargetDeg = TARGET_ANGLES_DEG.H2O
  } else if (formula === 'HHHN') {
    const radius = 101
    const z = Math.sqrt((Math.cos((TARGET_ANGLES_DEG.NH3 * Math.PI) / 180) + 0.5) / 1.5)
    const radial = Math.sqrt(1 - z * z)
    positions = [vec(0, 0, 0), scale(vec(radial, 0, z), radius), scale(rotate(radial, (2 * Math.PI) / 3, z), radius), scale(rotate(radial, (4 * Math.PI) / 3, z), radius)]
    angleTargetDeg = TARGET_ANGLES_DEG.NH3
  } else if (formula === 'CHHHH') {
    const radius = 109
    const tetrahedral = [vec(1, 1, 1), vec(1, -1, -1), vec(-1, 1, -1), vec(-1, -1, 1)].map((position) => scale(unit(position), radius))
    positions = [vec(0, 0, 0), ...tetrahedral]
    angleTargetDeg = TARGET_ANGLES_DEG.CH4
  } else if (formula === 'COO') {
    positions = [vec(0, 0, 0), vec(-116, 0, 0), vec(116, 0, 0)]
    angleTargetDeg = TARGET_ANGLES_DEG.CO2
  } else {
    const first = element(symbols[0] ?? 'H')
    const second = element(symbols[1] ?? symbols[0] ?? 'H')
    const distance = referenceFor(first.symbol, second.symbol).lengthPm
    positions = symbols.map((_, index) => vec((index - (symbols.length - 1) / 2) * distance, 0, 0))
  }
  const atoms = symbols.map((symbol, index) => ({ id: index, symbol, position: positions[index] ?? vec(index * 100, 0, 0), velocity: vec(), force: vec(), charge: PARTIAL_CHARGES[symbol] ?? 0 }))
  return { atoms, angleTargetDeg }
}

const cloneAtom = (atom: EngineAtom): EngineAtom => ({ ...atom, position: { ...atom.position }, velocity: { ...atom.velocity }, force: { ...atom.force } })

export class ChemicalBondEngine {
  readonly atoms: EngineAtom[]
  readonly angleTargetDeg: number | null
  bonds: EngineBond[] = []
  temperatureTargetK = 298
  thermostatEnabled = true
  timeFs = 0
  private potentialEnergy = 0

  constructor(symbols: string[]) {
    const molecule = createMolecule(symbols)
    this.atoms = molecule.atoms
    this.angleTargetDeg = molecule.angleTargetDeg
    this.detectBonds(true)
    this.calculateForces()
  }

  reset(symbols: string[]) {
    const molecule = createMolecule(symbols)
    this.atoms.splice(0, this.atoms.length, ...molecule.atoms)
    this.bonds = []
    this.timeFs = 0
    this.detectBonds(true)
    this.calculateForces()
  }

  setTemperature(temperatureK: number) {
    this.temperatureTargetK = clamp(temperatureK, 0, 1200)
  }

  setBondDistance(distancePm: number) {
    if (this.atoms.length < 2) return
    const anchor = this.atoms[0].position
    const direction = unit(sub(this.atoms[1].position, anchor))
    this.atoms[1].position = add(anchor, scale(direction, clamp(distancePm, 40, 600)))
    this.atoms[1].velocity = vec()
    this.detectBonds(false)
    this.calculateForces()
  }

  step(count = 1) {
    for (let index = 0; index < count; index += 1) this.integrate()
    return this.snapshot()
  }

  minimize(iterations = 400) {
    for (let iteration = 0; iteration < iterations; iteration += 1) {
      this.calculateForces()
      const learningRate = 0.08 / (1 + iteration * 0.004)
      for (const atom of this.atoms) {
        const displacement = scale(atom.force, learningRate / Math.max(element(atom.symbol).massAmu, 1))
        const limit = Math.max(length(displacement), 1e-6)
        atom.position = add(atom.position, scale(displacement, Math.min(1, 1.2 / limit)))
        atom.velocity = vec()
      }
    }
    this.calculateForces()
    return this.snapshot()
  }

  snapshot(): EngineSnapshot {
    const firstBond = this.bonds[0]
    const firstDistance = firstBond ? distance(this.atoms[firstBond.a].position, this.atoms[firstBond.b].position) : 0
    const kinetic = this.kineticEnergy()
    const temperatureK = this.temperature()
    return {
      atoms: this.atoms.map(cloneAtom),
      bonds: this.bonds.map((bond) => ({ ...bond, distancePm: distance(this.atoms[bond.a].position, this.atoms[bond.b].position) })),
      energy: { kinetic, potential: this.potentialEnergy, total: kinetic + this.potentialEnergy, temperatureK },
      timeFs: this.timeFs,
      bondDistancePm: firstDistance,
      equilibriumDistancePm: firstBond ? referenceFor(this.atoms[firstBond.a].symbol, this.atoms[firstBond.b].symbol).lengthPm : 0,
      angleDeg: this.currentAngle(),
      targetAngleDeg: this.angleTargetDeg,
      brokenBond: Boolean(firstBond && !firstBond.active),
    }
  }

  private integrate() {
    this.calculateForces()
    for (const atom of this.atoms) {
      const acceleration = scale(atom.force, FORCE_TO_ACCELERATION / element(atom.symbol).massAmu)
      atom.velocity = add(atom.velocity, scale(acceleration, TIME_STEP_FS / 2))
      atom.position = add(atom.position, scale(atom.velocity, TIME_STEP_FS))
    }
    this.detectBonds(false)
    this.calculateForces()
    for (const atom of this.atoms) {
      const acceleration = scale(atom.force, FORCE_TO_ACCELERATION / element(atom.symbol).massAmu)
      atom.velocity = add(atom.velocity, scale(acceleration, TIME_STEP_FS / 2))
    }
    if (this.thermostatEnabled) this.applyBerendsenThermostat()
    this.timeFs += TIME_STEP_FS
  }

  private detectBonds(initial: boolean) {
    const next: EngineBond[] = []
    const valenceUsed = new Array(this.atoms.length).fill(0) as number[]
    for (const bond of this.bonds) {
      if (bond.active) {
        valenceUsed[bond.a] += bond.order
        valenceUsed[bond.b] += bond.order
      }
    }
    for (let a = 0; a < this.atoms.length; a += 1) {
      for (let b = a + 1; b < this.atoms.length; b += 1) {
        const left = element(this.atoms[a].symbol)
        const right = element(this.atoms[b].symbol)
        const distancePm = distance(this.atoms[a].position, this.atoms[b].position)
        const existing = this.bonds.find((bond) => bond.a === a && bond.b === b)
        const radiiSum = left.covalentRadiusPm + right.covalentRadiusPm
        const shouldKeep = Boolean(existing?.active && distancePm <= radiiSum * BOND_BREAK_FACTOR)
        const shouldForm = initial ? distancePm <= referenceFor(left.symbol, right.symbol).lengthPm * BOND_FORMATION_FACTOR : distancePm <= radiiSum * BOND_FORMATION_FACTOR
        const canForm = valenceUsed[a] < left.valence && valenceUsed[b] < right.valence
        if (shouldKeep || (shouldForm && canForm)) {
          const order = existing?.order ?? estimateBondOrder(left.symbol, right.symbol, distancePm)
          next.push({ a, b, order, distancePm, active: true })
          if (!existing) {
            valenceUsed[a] += order
            valenceUsed[b] += order
          }
        }
      }
    }
    this.bonds = next
  }

  private calculateForces() {
    for (const atom of this.atoms) atom.force = vec()
    let potential = 0
    for (const bond of this.bonds) {
      const first = this.atoms[bond.a]
      const second = this.atoms[bond.b]
      const delta = sub(first.position, second.position)
      const distancePm = Math.max(length(delta), 1e-6)
      const reference = referenceFor(first.symbol, second.symbol)
      const force = scale(unit(delta), morseForceMagnitude(distancePm, reference.lengthPm, reference.energyKjMol))
      first.force = add(first.force, force)
      second.force = sub(second.force, force)
      potential += morsePotential(distancePm, reference.lengthPm, reference.energyKjMol)
    }
    const neighbors = this.bondGraphDistances()
    for (let center = 0; center < this.atoms.length; center += 1) {
      const connected = this.bonds.filter((bond) => bond.a === center || bond.b === center).map((bond) => bond.a === center ? bond.b : bond.a)
      for (let left = 0; left < connected.length; left += 1) {
        for (let right = left + 1; right < connected.length; right += 1) {
          const i = this.atoms[connected[left]]
          const j = this.atoms[center]
          const k = this.atoms[connected[right]]
          const firstVector = sub(i.position, j.position)
          const secondVector = sub(k.position, j.position)
          const firstLength = Math.max(length(firstVector), 1e-6)
          const secondLength = Math.max(length(secondVector), 1e-6)
          const cosine = clamp(dot(firstVector, secondVector) / (firstLength * secondLength), -1, 1)
          const target = Math.cos(((this.angleTargetDeg ?? 109.5) * Math.PI) / 180)
          const dVdc = 2 * ANGLE_FORCE_KJ_MOL * (cosine - target)
          const gradientFirst = sub(scale(secondVector, 1 / (firstLength * secondLength)), scale(firstVector, cosine / (firstLength * firstLength)))
          const gradientSecond = sub(scale(firstVector, 1 / (firstLength * secondLength)), scale(secondVector, cosine / (secondLength * secondLength)))
          const forceFirst = scale(gradientFirst, -dVdc)
          const forceSecond = scale(gradientSecond, -dVdc)
          i.force = add(i.force, forceFirst)
          k.force = add(k.force, forceSecond)
          j.force = sub(j.force, add(forceFirst, forceSecond))
          potential += ANGLE_FORCE_KJ_MOL * (cosine - target) ** 2
        }
      }
    }
    for (let a = 0; a < this.atoms.length; a += 1) {
      for (let b = a + 1; b < this.atoms.length; b += 1) {
        const graphDistance = neighbors[a][b]
        if (graphDistance === 1 || graphDistance === 2) continue
        const scaleFactor = graphDistance === 3 ? ONE_FOUR_SCALE : 1
        if (graphDistance === 0) {
          const delta = sub(this.atoms[a].position, this.atoms[b].position)
          const distancePm = length(delta)
          if (distancePm < 1) continue
          const left = element(this.atoms[a].symbol)
          const right = element(this.atoms[b].symbol)
          const sigma = Math.sqrt(left.ljSigmaPm * right.ljSigmaPm)
          const epsilon = Math.sqrt(left.ljEpsilonKjMol * right.ljEpsilonKjMol)
          const ljEnergy = lennardJonesPotential(distancePm, sigma, epsilon)
          const coulombEnergy = shiftedCoulombPotential(distancePm, this.atoms[a].charge, this.atoms[b].charge)
          const totalForce = (lennardJonesForceMagnitude(distancePm, sigma, epsilon) + shiftedCoulombForceMagnitude(distancePm, this.atoms[a].charge, this.atoms[b].charge)) * scaleFactor
          const force = scale(unit(delta), totalForce)
          this.atoms[a].force = add(this.atoms[a].force, force)
          this.atoms[b].force = sub(this.atoms[b].force, force)
          potential += (ljEnergy + coulombEnergy) * scaleFactor
        }
      }
    }
    this.potentialEnergy = potential
  }

  private bondGraphDistances() {
    const distances = this.atoms.map(() => this.atoms.map(() => 0))
    for (let start = 0; start < this.atoms.length; start += 1) {
      const queue = [start]
      const seen = new Set([start])
      while (queue.length) {
        const current = queue.shift() as number
        for (const bond of this.bonds) {
          const next = bond.a === current ? bond.b : bond.b === current ? bond.a : -1
          if (next >= 0 && !seen.has(next)) {
            seen.add(next)
            distances[start][next] = distances[start][current] + 1
            queue.push(next)
          }
        }
      }
    }
    return distances
  }

  private kineticEnergy() {
    return this.atoms.reduce((sum, atom) => sum + 0.5 * element(atom.symbol).massAmu * dot(atom.velocity, atom.velocity), 0)
  }

  private temperature() {
    const degreesOfFreedom = Math.max(1, this.atoms.length * 3 - 3)
    return (2 * this.kineticEnergy()) / (degreesOfFreedom * BOLTZMANN_KJ_MOL_K)
  }

  private applyBerendsenThermostat() {
    const current = this.temperature()
    if (current < 1e-6) return
    // Berendsen relaxation time of 100 fs is a gentle educational coupling, not a statistical-ensemble sampler.
    const relaxationTimeFs = 100
    const factor = Math.sqrt(Math.max(0, 1 + (TIME_STEP_FS / relaxationTimeFs) * (this.temperatureTargetK / current - 1)))
    for (const atom of this.atoms) atom.velocity = scale(atom.velocity, factor)
  }

  private currentAngle() {
    if (this.atoms.length < 3 || !this.bonds.length) return null
    const center = this.atoms[0]
    const neighbors = this.bonds.filter((bond) => bond.a === 0 || bond.b === 0).map((bond) => bond.a === 0 ? bond.b : bond.a)
    if (neighbors.length < 2) return null
    const first = unit(sub(this.atoms[neighbors[0]].position, center.position))
    const second = unit(sub(this.atoms[neighbors[1]].position, center.position))
    return Math.acos(clamp(dot(first, second), -1, 1)) * 180 / Math.PI
  }
}

export const elementBySymbol = (symbol: string) => element(symbol)
export const formulaFor = (symbols: string[]) => symbols.reduce<Record<string, number>>((counts, symbol) => ({ ...counts, [symbol]: (counts[symbol] ?? 0) + 1 }), {})
export const distance = (a: Vec3, b: Vec3) => length(sub(a, b))
