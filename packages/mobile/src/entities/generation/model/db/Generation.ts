import { Entity, Column, PrimaryColumn } from 'typeorm'
import { GenerationEntity, GenerationEntityStatus } from '../GenerationEntity'

@Entity()
export class Generation implements GenerationEntity {
  @PrimaryColumn()
  id!: number
  @Column()
  prompt!: string
  @Column()
  style!: string | null
  @Column()
  status!: GenerationEntityStatus
  @Column()
  createdAt!: number // timestamp in nanoseconds
  @Column()
  updatedAt!: number // timestamp in nanoseconds
  @Column()
  images!: Array<{ url: string }>
}
