import { ChemicalBondEngine, type BondMode, type EngineSnapshot } from './chemical-bonding-engine'

export type ChemicalWorkerCommand =
  | { type: 'init'; symbols: string[]; mode: BondMode }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'step' }
  | { type: 'reset'; symbols: string[]; mode: BondMode }
  | { type: 'set-temperature'; temperatureK: number }
  | { type: 'set-rate'; rate: number }
  | { type: 'set-thermostat'; enabled: boolean }
  | { type: 'minimize' }
  | { type: 'drag-distance'; distancePm: number }

export type ChemicalWorkerEvent =
  | { type: 'ready'; snapshot: EngineSnapshot }
  | { type: 'state'; snapshot: EngineSnapshot }
  | { type: 'error'; message: string }

const workerScope = self as unknown as { postMessage: (event: ChemicalWorkerEvent) => void; onmessage: (message: MessageEvent<ChemicalWorkerCommand>) => void }
let engine: ChemicalBondEngine | undefined
let mode: BondMode = 'Covalent'
let timer: ReturnType<typeof setInterval> | undefined
let simulationRate = 1

const emit = (event: ChemicalWorkerEvent) => workerScope.postMessage(event)
const publish = (type: 'ready' | 'state') => { if (engine) emit({ type, snapshot: engine.snapshot() }) }
const stopTimer = () => { if (timer) { clearInterval(timer); timer = undefined } }
const startTimer = () => {
  stopTimer()
  timer = setInterval(() => {
    if (!engine) return
    engine.step(Math.max(1, Math.round(4 * simulationRate)))
    publish('state')
  }, 16)
}

workerScope.onmessage = (message: MessageEvent<ChemicalWorkerCommand>) => {
  try {
    const command = message.data
    if (command.type === 'init' || command.type === 'reset') {
      mode = command.mode
      engine = new ChemicalBondEngine(command.symbols)
      engine.thermostatEnabled = true
      if (command.type === 'init') startTimer()
      publish('ready')
      return
    }
    if (!engine) return
    if (command.type === 'play') startTimer()
    if (command.type === 'pause') stopTimer()
    if (command.type === 'set-temperature') engine.setTemperature(command.temperatureK)
    if (command.type === 'set-rate') simulationRate = Math.max(0.15, Math.min(1.5, command.rate))
    if (command.type === 'set-thermostat') engine.thermostatEnabled = command.enabled
    if (command.type === 'step') {
      engine.step(1)
      publish('state')
    }
    if (command.type === 'minimize') {
      engine.minimize()
      publish('state')
    }
    if (command.type === 'drag-distance') {
      engine.setBondDistance(command.distancePm)
      publish('state')
    }
  } catch (error) {
    emit({ type: 'error', message: error instanceof Error ? error.message : 'The chemistry engine stopped unexpectedly.' })
  }
}

export {}
