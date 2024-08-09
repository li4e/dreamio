import { View, Image, ImageSourcePropType } from 'react-native'
import { TouchableRipple, Text } from 'react-native-paper'
import { twMerge } from 'tailwind-merge'
import { ScrollView } from 'shared/ui/styled'

interface StylesListProps {
  selectedStyle: string | null
  onSelect(item: string): void
}

export function StylesList(props: StylesListProps) {
  const { selectedStyle, onSelect } = props

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="never"
      horizontal
      className="-mx-5 max-h-[315]"
      contentContainerStyle="px-4"
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {artStyles.map((artStylesCol, colIndex) => (
        <View key={colIndex}>
          {artStylesCol.map((artStyle, rowIndex) => (
            <StyleCard
              item={artStyle}
              key={artStyle.name}
              selected={selectedStyle === artStyle.name}
              onPress={() => onSelect(artStyle.name)}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  )
}

interface StyleCardProps {
  item: ArtStyle
  selected: boolean
  onPress(): void
}

function StyleCard(props: StyleCardProps) {
  const { item, selected, onPress, ...rest } = props

  return (
    <TouchableRipple
      key={item.name}
      className="m-[6] rounded-xl overflow-hidden"
      onPress={onPress}
      {...rest}
    >
      <View
        className={twMerge(
          'w-[120] border-[1px] rounded-xl border-gray-200 bg-white',
          selected && 'bg-gray-200'
        )}
      >
        <Image
          source={item.imageSource}
          resizeMode="cover"
          className="w-full h-[120] rounded-t-xl"
        />
        <Text
          numberOfLines={1}
          className={'text-center py-1 px-2'}
          variant="labelMedium"
        >
          {item.name}
        </Text>
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
