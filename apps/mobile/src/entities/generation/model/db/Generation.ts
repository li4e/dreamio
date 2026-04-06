import { Entity, Column, PrimaryColumn } from 'typeorm'
import { GenerationEntity, GenerationEntityStatus } from '../GenerationEntity'

@Entity()
export class Generation implements GenerationEntity {
  @PrimaryColumn()
  id: number
  @Column({ nullable: true })
  remoteId: string | null
  @Column()
  prompt: string
  @Column({ nullable: true })
  style: string | null
  @Column({ type: 'simple-enum', enum: GenerationEntityStatus })
  status: number
  @Column()
  createdAt: number // timestamp in nanoseconds
  @Column()
  updatedAt: number // timestamp in nanoseconds
  @Column({ default: true })
  enhance: boolean
  @Column({ default: 1000 })
  width: number
  @Column({ default: 1000 })
  height: number
  @Column({ type: 'simple-array' })
  images: Array<string>
}
