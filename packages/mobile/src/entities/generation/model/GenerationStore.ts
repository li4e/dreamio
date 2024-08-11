import { observable, makeAutoObservable, set, remove } from 'mobx'
import { GenerationEntity } from './GenerationEntity'

export class GenerationStore {
  readonly items = observable.map<number, GenerationEntity>({})

  constructor() {
    makeAutoObservable(this)
  }

  addItem(item: GenerationEntity) {
    set(this.items, item.id, item)
  }

  removeItem(id: number) {
    remove(this.items, id)
  }
}
