import React from 'react'
import { createIconSetFromFontello } from 'react-native-vector-icons'
import config from './config.json'
import { IconName } from './Icon.d'

const VectorIcon = createIconSetFromFontello(config)

interface IconProps {
  name: IconName
  size: number
}

export const Icon = (props: IconProps) => {
  const { name, size } = props
  return <VectorIcon name={name} size={size} />
}
