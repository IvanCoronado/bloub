import type { RenderedEye } from '@/bot/engine'

/** Une seule monture rigide : les verres ne reprennent pas les matrices des paupieres. */
export function glassesLayout(eyes: Pick<RenderedEye, 'matrix'>[], scale: number) {
  const centers = eyes.map(eye => eye.matrix.slice(7, -1).split(',').map(Number))
  const [left, right] = centers
  if (!left || !right) return null
  const dx = right[4]! - left[4]!
  const dy = right[5]! - left[5]!
  const radius = 31
  const stroke = 7
  // Six unites libres entre les bords exterieurs, meme avec de grands accessoires.
  const halfSpacing = Math.max(Math.hypot(dx, dy) / (2 * scale), radius + stroke / 2 + 3)
  return {
    x: (left[4]! + right[4]!) / 2,
    y: (left[5]! + right[5]!) / 2,
    rotation: Math.atan2(dy, dx) * 180 / Math.PI,
    radius,
    stroke,
    halfSpacing,
    bridgeStart: -halfSpacing + radius,
    bridgeEnd: halfSpacing - radius
  }
}
