import { observable, makeAutoObservable, set, remove, get, values } from 'mobx'
import { GenerationEntity } from './GenerationEntity'
import { launchArguments } from 'shared/lib/launchArguments'
import { screenshotsData } from './screenshotsData'

export class GenerationStore {
  readonly items = observable.map<number, GenerationEntity>({})

  constructor() {
    makeAutoObservable(this)

    if (launchArguments.screenshotsMode) {
      this.setItems(screenshotsData)
    }
  }

  setItem(item: GenerationEntity) {
    set(this.items, item.id, item)
  }

  setItems(items: GenerationEntity[]) {
    items.forEach((item) => {
      this.setItem(item)
    })
  }

  removeItem(id: number) {
    remove(this.items, id)
  }

  getItem(id: number): GenerationEntity | null {
    return get(this.items, id) || null
  }

  clear() {
    for (const item of this.list) {
      this.removeItem(item.id)
    }
  }

  get list(): Readonly<GenerationEntity[]> {
    return values(this.items)
  }
}
