import { GenerationStore } from 'entities/generation'

export class Store {
  generation = new GenerationStore()
}

declare global {
  type RootStore = InstanceType<typeof Store>
}
