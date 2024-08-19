import { observable, makeAutoObservable, set, remove, get, values } from 'mobx'
import { GenerationEntity } from './GenerationEntity'

export class GenerationStore {
  readonly items = observable.map<number, GenerationEntity>({})

  constructor() {
    makeAutoObservable(this)

    // this.setItem({
    //   id: 1,
    //   prompt: 'Super puper high quality generate image',
    //   style: 'Noir',
    //   createdAt: Date.now(),
    //   updatedAt: Date.now(),
    //   images: [
    //     'https://i.natgeofe.com/n/fb52a1e1-024c-4015-a0b8-83e05f0d7038/2MJX38R_square.jpg?w=256&h=256',
    //   ],
    //   status: 2,
    // })
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
