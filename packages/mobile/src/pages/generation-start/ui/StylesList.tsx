import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Image, ImageSourcePropType } from 'react-native'
import { TouchableRipple, Text, Chip, useTheme } from 'react-native-paper'
import { twMerge } from 'tailwind-merge'
import { ScrollView } from 'shared/ui/styled'

interface StylesListProps {
  onSelect(item: string | null): void
}

export function StylesList(props: StylesListProps) {
  const { onSelect } = props
  const [selected, setSelected] = useState<string | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    onSelect(selected)
  }, [selected, onSelect])

  const handleChange = (style: string | null) =>
    setSelected((currentStyle) => {
      if (currentStyle === style) {
        return null
      }
      return style
    })

  return (
    <View>
      <View className="flex-row items-end justify-between min-h-[35] mb-3 px-5">
        <Text variant="titleMedium" className="mr-3">
          {t('screens.generation.styleLabel')}
        </Text>
        {selected && (
          <Chip compact onClose={() => handleChange(null)}>
            {selected}
          </Chip>
        )}
      </View>

      <ScrollView
        contentInsetAdjustmentBehavior="never"
        horizontal
        className="max-h-[315]"
        contentContainerStyle="px-[1]"
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {artStyles.map((artStylesCol, colIndex) => (
          <View key={colIndex}>
            {artStylesCol.map((artStyle, rowIndex) => (
              <StyleCard
                item={artStyle}
                key={artStyle.name}
                selected={selected === artStyle.name}
                onPress={() => handleChange(artStyle.name)}
              />
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

interface StyleCardProps {
  item: ArtStyle
  selected: boolean
  onPress(): void
}

function StyleCard(props: StyleCardProps) {
  const { item, selected, onPress, ...rest } = props
  const { colors } = useTheme()

  return (
    <TouchableRipple
      key={item.name}
      className="m-[1]"
      onPress={onPress}
      {...rest}
    >
      <View
        className={twMerge(
          'w-[120] opacity-80',
          selected && 'bg-gray-200 opacity-100'
        )}
      >
        <Image
          source={item.imageSource}
          resizeMode="cover"
          className="w-full h-[120]"
        />
        <View
          className="absolute left-0 bottom-0 right-0"
          style={{
            backgroundColor: selected
              ? colors.primaryContainer
              : 'rgba(0,0,0,.7)',
          }}
        >
          <Text
            numberOfLines={1}
            className={'text-center py-1 px-2'}
            variant="labelMedium"
            style={{ color: selected ? colors.onBackground : colors.onPrimary }}
          >
            {item.name}
          </Text>
        </View>
      </View>
    </TouchableRipple>
  )
}

interface ArtStyle {
  name: string
  imageSource: ImageSourcePropType
}

const artStyles: ArtStyle[][] = [
  [
    { name: 'Anime', imageSource: require('./assets/anime.jpeg') },
    {
      name: 'Ultra-realistic',
      imageSource: require('./assets/ultra-realistic.jpeg'),
    },
  ],
  [
    { name: 'Pixel Art', imageSource: require('./assets/pixel-art.jpeg') },
    {
      name: 'Oil Painting',
      imageSource: require('./assets/oil-painting.jpeg'),
    },
  ],
  [
    { name: 'Noir', imageSource: require('./assets/noir.jpeg') },
    { name: 'Cyberpunk', imageSource: require('./assets/cyberpunk.jpeg') },
  ],
  [
    { name: 'Retro', imageSource: require('./assets/retro.jpeg') },
    { name: 'Pop Art', imageSource: require('./assets/pop-art.jpeg') },
  ],
  [
    {
      name: 'Impressionism',
      imageSource: require('./assets/impressionism.jpeg'),
    },
    { name: 'Abstract', imageSource: require('./assets/abstract.jpeg') },
  ],
  [
    { name: 'Gothic', imageSource: require('./assets/gothic.jpeg') },
    { name: 'Vintage', imageSource: require('./assets/vintage.jpeg') },
  ],
  [
    { name: 'Surreal', imageSource: require('./assets/surreal.jpeg') },
    { name: 'Watercolor', imageSource: require('./assets/watercolor.jpeg') },
  ],
] as const
