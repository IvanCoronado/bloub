import { PRESETS, type AgentConfig, type Motion } from '../catalog'

export const PRESENTATION = { width: 1920, height: 1080, fps: 30, duration: 30, intro: 1.2, solo: 4.6, teamStart: 24.2 } as const

export const CAST: { id: string; name: string; area: string; role: string; description: string[]; tags: string[]; motion: Motion }[] = [
  {
    id: 'qphone', name: 'Nico', area: 'Teléfono', role: 'Recepcionista telefónico', motion: 'listening',
    description: ['Atiende llamadas, resuelve consultas y gestiona', 'reservas y pedidos. Sugiere extras cuando corresponde.'],
    tags: ['Llamadas', 'Reservas', 'Pedidos']
  },
  {
    id: 'marketing', name: 'Lola', area: 'Marketing', role: 'Responsable de marketing', motion: 'speaking',
    description: ['Atrae clientes y hace que vuelvan: campañas,', 'promociones, comunicación, fidelización y reputación.'],
    tags: ['Campañas', 'Fidelización', 'Reputación']
  },
  {
    id: 'equipo', name: 'Alex', area: 'Equipo', role: 'Responsable de personal', motion: 'working',
    description: ['Organiza turnos y tareas. Ayuda a incorporar y formar', 'trabajadores y hace seguimiento del rendimiento.'],
    tags: ['Turnos', 'Formación', 'Rendimiento']
  },
  {
    id: 'carta', name: 'Vera', area: 'Carta', role: 'Responsable de carta', motion: 'thinking',
    description: ['Revisa platos, precios, escandallos y ventas para', 'mejorar la oferta del restaurante y su rentabilidad.'],
    tags: ['Platos', 'Escandallos', 'Rentabilidad']
  },
  {
    id: 'compras', name: 'Bruno', area: 'Compras', role: 'Responsable de compras', motion: 'working',
    description: ['Prevé lo que falta y controla existencias y mermas.', 'Prepara pedidos y revisa proveedores, precios', 'y recepciones.'],
    tags: ['Existencias', 'Proveedores', 'Pedidos']
  }
]

export function presentationAt(time: number) {
  const t = Math.max(0, Math.min(PRESENTATION.duration, Number.isFinite(time) ? time : 0))
  if (t < PRESENTATION.intro) return { kind: 'intro' as const, time: t, index: -1 }
  if (t >= PRESENTATION.teamStart) return { kind: 'team' as const, time: t - PRESENTATION.teamStart, index: -1 }
  const index = Math.min(CAST.length - 1, Math.floor((t - PRESENTATION.intro + 1e-8) / PRESENTATION.solo))
  return { kind: 'solo' as const, index, time: t - PRESENTATION.intro - index * PRESENTATION.solo }
}

export function presentationCast(agents: AgentConfig[] = PRESETS) {
  return CAST.map(member => ({
    ...member,
    config: {
      ...(agents.find(agent => agent.id === member.id) ?? PRESETS.find(agent => agent.id === member.id)!),
      name: member.name,
      role: member.role
    }
  }))
}
