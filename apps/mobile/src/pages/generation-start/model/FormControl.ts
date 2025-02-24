import { Control } from 'react-hook-form'
import { AspectRatio } from 'shared/ui/AspectedRatioView'

export type FormControl = Control<
  {
    enhance: NonNullable<boolean | undefined>
    aspectRatio: NonNullable<AspectRatio | undefined>
    style: string | null
    prompt: string
  },
  any
>
