import { useTranslation } from 'react-i18next'
import {
  View,
  FlatList,
  ListRenderItem,
  ListRenderItemInfo,
} from 'react-native'
import {
  TouchableRipple,
  Text,
  useTheme,
  Button,
  List,
  Icon,
} from 'react-native-paper'
import { twMerge } from 'tailwind-merge'
import { useDialog } from 'shared/ui/Dialog'
import { useCallback, useEffect } from 'react'
import { useLocalObservable } from 'mobx-react-lite'
import { useStoreData } from 'shared/store'
import { makeAutoObservable } from 'mobx'
import { Image, ImageSource } from 'expo-image'

interface StylesListProps {
  value: string | null
  onSelect(item: string | null): void
  disabled: boolean
}

export class StylesListStore {
  constructor() {
    makeAutoObservable(this)
  }

  private _selected: null | string = null
  private _isDisabled = false

  set selected(value: null | string) {
    this._selected = value
  }
  get selected() {
    return this._selected
  }

  set disabled(value: boolean) {
    this._isDisabled = value
  }
  get disabled() {
    return this._isDisabled
  }
}

export function StylesList(props: StylesListProps) {
  const { onSelect, value, disabled } = props
  const { t } = useTranslation()

  const { showDialog } = useDialog()

  const handleChange = useCallback(
    (style: string | null) => onSelect(style),
    []
  )

  const stylesListStore = useLocalObservable(() => new StylesListStore())

  useEffect(() => {
    stylesListStore.selected = value
    stylesListStore.disabled = disabled
  }, [stylesListStore, value, disabled])

  const handleTitlePress = () => {
    showDialog({
      title: t('screens.generation.styleDialog.title'),
      content: t('screens.generation.styleDialog.text'),
      renderActions(dismiss) {
        return (
          <Button onPress={dismiss}>
            {t('screens.generation.styleDialog.button')}
          </Button>
        )
      },
    })
  }

  const renderItem: ListRenderItem<ArtStyle[]> = useCallback(
    ({ item }: ListRenderItemInfo<ArtStyle[]>) => {
      return (
        <View>
          {item.map((artStyle) => (
            <StyleCard
              disabled={disabled}
              item={artStyle}
              key={artStyle.name}
              store={stylesListStore}
              onChange={handleChange}
            />
          ))}
        </View>
      )
    },
    [handleChange, stylesListStore]
  )

  return (
    <View>
      <List.Item
        onPress={handleTitlePress}
        left={(props) => <List.Icon icon="palette" {...props} />}
        title={t('screens.generation.styleLabel')}
        right={() => (
          <View className="self-center pl-4">
            <Text variant="labelLarge">
              {value || t('screens.generation.settings.style.none')}
            </Text>
          </View>
        )}
      />

      <FlatList
        scrollEnabled={!disabled}
        horizontal
        data={artStyles}
        renderItem={renderItem}
        keyboardShouldPersistTaps="always"
        showsHorizontalScrollIndicator={false}
        // estimatedItemSize={120}
        // estimatedListSize={{ width: 120 * artStyles.length, height: 240 }}
      />
    </View>
  )
}

interface StyleCardProps {
  item: ArtStyle
  store: StylesListStore
  onChange: (value: string | null) => void
  disabled: boolean
  flex?: boolean
}

export function StyleCard(props: StyleCardProps) {
  const { item, store, disabled, onChange, flex = false, ...rest } = props
  const { colors } = useTheme()
  const isSelected = useStoreData(
    () => store.selected === item.name,
    [store, item.name]
  )

  return (
    <TouchableRipple
      key={item.name}
      className="m-[1]"
      onPress={() => {
        if (!store.disabled) {
          onChange(isSelected ? null : item.name)
        }
      }}
      disabled={disabled}
      {...rest}
    >
      <View
        className={twMerge(
          flex ? 'w-full h-full' : 'w-[120] h-[120]',
          'opacity-80',
          isSelected && 'bg-gray-200 opacity-100'
        )}
      >
        <Image
          source={item.imageSource}
          contentFit="cover"
          contentPosition="center"
          className="absolute top-0 right-0 bottom-0 left-0"
        />
        <View
          className="absolute left-0 bottom-0 right-0"
          style={{
            backgroundColor: isSelected
              ? colors.inverseSurface
              : colors.primaryContainer,
          }}
        >
          <Text
            numberOfLines={1}
            className={'text-center py-1 px-2'}
            variant="labelMedium"
            style={{
              color: isSelected
                ? colors.inverseOnSurface
                : colors.onPrimaryContainer,
            }}
          >
            {item.name}
          </Text>
        </View>
      </View>
    </TouchableRipple>
  )
}

export interface ArtStyle {
  name: string
  imageSource: ImageSource
}

const artStyles: ArtStyle[][] = [
  [
    { name: 'Anime', imageSource: require('./assets/anime.jpeg') },
    {
      name: 'Photo Realistic',
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

export const flatArtStyles = artStyles.flat()
