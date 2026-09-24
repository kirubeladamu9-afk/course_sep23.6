export type ParticlePhase = 'Solid' | 'Liquid' | 'Gas'

export type SimParticle = {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  anchorX: number
  anchorY: number
  radius: number
}

export const PARTICLE_PHASES: ParticlePhase[] = ['Solid', 'Liquid', 'Gas']

const randomValue = (seed: number) => {
  const value = Math.sin(seed * 91.37) * 43758.5453
  return value - Math.floor(value)
}

export const createParticleGroup = (phase: ParticlePhase, seed: number, count = phase === 'Solid' ? 12 : 10): SimParticle[] => Array.from({ length: count }, (_, index) => {
  const column = index % 4
  const row = Math.floor(index / 4)
  const randomX = randomValue(seed * 13 + index * 3)
  const randomY = randomValue(seed * 17 + index * 5)
  const anchorX = phase === 'Solid' ? 30 + column * 13 : phase === 'Liquid' ? 28 + column * 13 + (row % 2) * 4 : 12 + randomX * 76
  const anchorY = phase === 'Solid' ? 26 + row * 13 : phase === 'Liquid' ? 48 + row * 11 + randomY * 9 : 12 + randomY * 76
  const speed = phase === 'Gas' ? 18 + randomX * 16 : phase === 'Liquid' ? 3 + randomX * 4 : 1 + randomX * 1.5
  const angle = randomY * Math.PI * 2
  return {
    id: index,
    x: anchorX,
    y: anchorY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    anchorX,
    anchorY,
    radius: phase === 'Gas' ? 3.1 : 4.2,
  }
})

export const advanceParticleGroup = (particles: SimParticle[], phase: ParticlePhase, delta: number) => {
  const next = particles.map((particle) => ({ ...particle }))
  for (let index = 0; index < next.length; index += 1) {
    const particle = next[index]
    if (phase === 'Solid') {
      const springX = (particle.anchorX - particle.x) * 8
      const springY = (particle.anchorY - particle.y) * 8
      particle.vx = (particle.vx + springX * delta) * 0.86
      particle.vy = (particle.vy + springY * delta) * 0.86
      particle.x += particle.vx * delta
      particle.y += particle.vy * delta
    } else {
      if (phase === 'Liquid') {
        const centerPullX = (50 - particle.x) * 0.035
        const centerPullY = (58 - particle.y) * 0.035
        particle.vx = (particle.vx + centerPullX) * 0.996
        particle.vy = (particle.vy + centerPullY) * 0.996
      }
      for (let otherIndex = index + 1; otherIndex < next.length; otherIndex += 1) {
        const other = next[otherIndex]
        const dx = particle.x - other.x
        const dy = particle.y - other.y
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.01
        const minimumDistance = particle.radius + other.radius + 1
        if (distance < minimumDistance) {
          const push = (minimumDistance - distance) * 0.12
          const pushX = (dx / distance) * push
          const pushY = (dy / distance) * push
          particle.vx += pushX
          particle.vy += pushY
          other.vx -= pushX
          other.vy -= pushY
        }
      }
      particle.x += particle.vx * delta
      particle.y += particle.vy * delta
    }
    if (phase === 'Gas') {
      if (particle.x < particle.radius || particle.x > 100 - particle.radius) {
        particle.x = Math.max(particle.radius, Math.min(100 - particle.radius, particle.x))
        particle.vx *= -1
      }
      if (particle.y < particle.radius || particle.y > 100 - particle.radius) {
        particle.y = Math.max(particle.radius, Math.min(100 - particle.radius, particle.y))
        particle.vy *= -1
      }
    } else {
      particle.x = Math.max(10, Math.min(90, particle.x))
      particle.y = Math.max(12, Math.min(88, particle.y))
    }
  }
  return next
}
