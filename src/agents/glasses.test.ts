import { describe, expect, it } from 'vitest'
import { glassesLayout } from './glasses'

describe('glasses geometry', () => {
  it('keeps the outer rims separated for every accessory size', () => {
    for (const distance of [20, 44, 65, 90]) for (const scale of [0.65, 1, 1.3]) {
      const glasses = glassesLayout([{ matrix: `matrix(1,0,0,1,${-distance / 2},0)` }, { matrix: `matrix(1,0,0,1,${distance / 2},0)` }], scale)!
      const gap = (2 * glasses.halfSpacing - 2 * glasses.radius - glasses.stroke) * scale
      expect(gap).toBeGreaterThanOrEqual(6 * scale - 1e-10)
      expect(glasses.bridgeStart).toBeLessThan(glasses.bridgeEnd)
    }
  })
  it('does not squash or shear the frame when an eye blinks', () => {
    const open = glassesLayout([{ matrix: 'matrix(.9,-.3,.3,.9,-30,10)' }, { matrix: 'matrix(.9,-.3,.3,.9,30,-10)' }], 1)
    const blinking = glassesLayout([{ matrix: 'matrix(.9,-.018,.3,.054,-30,10)' }, { matrix: 'matrix(.9,-.3,.3,.9,30,-10)' }], 1)
    expect(blinking).toEqual(open)
  })
  it('shares one head pose and keeps the bridge between the lenses', () => {
    const glasses = glassesLayout([{ matrix: 'matrix(1,0,0,1,-30,10)' }, { matrix: 'matrix(1,0,0,1,30,-10)' }], 1)!
    expect(glasses.x).toBe(0)
    expect(glasses.y).toBe(0)
    expect(glasses.rotation).toBeCloseTo(-18.4349, 4)
    expect(glasses.bridgeStart).toBeCloseTo(-glasses.bridgeEnd)
  })
})
