import { freshProject, parseProject, type AgentProject, type CollectionId } from './catalog'

export const collectionKey = (collection: CollectionId) => collection === 'classic' ? 'qamarero-agent-studio-v1' : 'qamarero-agent-studio-ingredients-v1'
export const collectionFromSearch = (search: string): CollectionId => new URLSearchParams(search).get('coleccion') === 'ingredientes' ? 'ingredients' : 'classic'

export function readCollectionProject(storage: Pick<Storage, 'getItem'>, collection: CollectionId): AgentProject {
  const value = storage.getItem(collectionKey(collection))
  if (!value) return freshProject(collection)
  const project = parseProject(JSON.parse(value))
  if ((project.collection ?? 'classic') !== collection) throw new Error('La colección guardada no coincide con el proyecto.')
  return project
}

export function writeCollectionProject(storage: Pick<Storage, 'setItem'>, collection: CollectionId, project: AgentProject) {
  storage.setItem(collectionKey(collection), JSON.stringify(project))
}
