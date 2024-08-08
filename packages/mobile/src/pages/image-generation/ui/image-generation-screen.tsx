import { useTranslation } from 'react-i18next'
import { View, Image } from 'react-native'
import { Text, TextInput, TouchableRipple } from 'react-native-paper'
import { ScrollView, Button } from 'shared/ui/styled'

export function ImageGenerationScreen() {
  const { t } = useTranslation()
  return (
    <ScrollView className="flex-1" contentContainerStyle="p-5 pb-10 flex-grow">
      <View className="flex-1 justify-center">
        <View>
          <View className="px-1 py-6 bg-white rounded-2xl border-gray-200 border-[1px] min-h-[210] justify-between mb-5">
            <View>
              <Text variant="titleLarge" className="mx-4">
                {t('screens.generation.inputLabel')}
              </Text>
              <TextInput
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                multiline
                placeholder={t('screens.generation.inputPlaceholder')}
                className="bg-transparent px-0"
              />
            </View>
            <View className="items-end px-4">
              <Button
                compact
                mode="outlined"
                icon="dice-multiple"
                contentStyle="flex-row-reverse px-1"
              >
                {t('screens.generation.randomButton')}
              </Button>
            </View>
          </View>
          <Text variant="titleMedium" className="mb-1">
            {t('screens.generation.styleLabel')}
          </Text>
          <ScrollView
            horizontal
            className="-mx-5"
            contentContainerStyle="px-4"
            showsHorizontalScrollIndicator={false}
          >
            {artStyles.map((artStyle) => (
              <TouchableRipple
                key={artStyle.name}
                className="mx-1 rounded-xl overflow-hidden"
              >
                <View className="w-[150] h-[150] border-[1px] border-gray-100 bg-white">
                  <Image
                    source={artStyle.imageSource}
                    resizeMode="cover"
                    className="w-full h-[150]"
                  />
                  <Text>{artStyle.name}</Text>
                </View>
              </TouchableRipple>
            ))}
          </ScrollView>
        </View>
      </View>
      <View className="items-center">
        <Button
          icon="creation"
          mode="contained"
          className="rounded-full"
          contentStyle="px-4 py-2"
        >
          {t('screens.generation.startButton')}
        </Button>
      </View>
    </ScrollView>
  )
}

const artStyles = [
  { name: 'Anime', imageSource: require('./assets/anime.jpeg') },
  {
    name: 'Ultra-realistic',
    imageSource: require('./assets/ultra-realistic.jpeg'),
  },
  { name: 'Pixel Art', imageSource: require('./assets/pixel-art.jpeg') },
  { name: 'Oil Painting', imageSource: require('./assets/oil-painting.jpeg') },
  { name: 'Noir', imageSource: require('./assets/noir.jpeg') },
  { name: 'Cyberpunk', imageSource: require('./assets/cyberpunk.jpeg') },
  { name: 'Retro', imageSource: require('./assets/retro.jpeg') },
  { name: 'Pop Art', imageSource: require('./assets/pop-art.jpeg') },
  {
    name: 'Impressionism',
    imageSource: require('./assets/impressionism.jpeg'),
  },
  { name: 'Abstract', imageSource: require('./assets/abstract.jpeg') },
  { name: 'Gothic', imageSource: require('./assets/gothic.jpeg') },
  { name: 'Vintage', imageSource: require('./assets/vintage.jpeg') },
  { name: 'Surreal', imageSource: require('./assets/surreal.jpeg') },
  { name: 'Watercolor', imageSource: require('./assets/watercolor.jpeg') },
] as const
