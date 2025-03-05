import { useNavigation } from '@react-navigation/native'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import {
  View,
  StyleSheet,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native'
import {
  ActivityIndicator,
  Appbar,
  Button,
  Icon,
  Text,
  TouchableRipple,
  useTheme,
} from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GenerationEntity, useGenerationsDelete } from 'entities/generation'
import { useHistory } from '../models/useGenHistory'
import EmptyAnimation from './assets/austroman.json'
import {
  has,
  makeAutoObservable,
  observable,
  remove,
  runInAction,
  set,
  toJS,
  values,
} from 'mobx'
import { CachedImage } from 'shared/ui/CachedImage'
import { FlashList, ListRenderItem } from '@shopify/flash-list'
import { StickyHeader } from 'shared/ui/StickyHeader'
import { SharedValue, useSharedValue } from 'react-native-reanimated'
import { useCallback, useMemo } from 'react'
import { useStoreData } from 'shared/store'

class SelectionStore {
  private _isActive = false
  readonly selectedItems = observable.set<number>([])
  constructor() {
    makeAutoObservable(this)
  }

  get isActive() {
    return this._isActive
  }

  set isActive(value: boolean) {
    this._isActive = value
  }

  get ids() {
    return values(this.selectedItems)
  }

  addSelection(item: number) {
    set(this.selectedItems, item)
  }

  removeSelection(item: number) {
    remove(this.selectedItems, item)
  }

  cancel() {
    this.selectedItems.clear()
    this.isActive = false
  }
}

function getNumColumns(totalLength: number) {
  // return totalLength > 4 ? 3 : totalLength > 1 ? 2 : 1
  return 2
}

export function HistoryScreen() {
  const { width } = useWindowDimensions()
  const { history, isPending, fetchMore, fetchedAll } = useHistory()
  const isEmpty = history.length === 0
  const numColumns = getNumColumns(history.length)
  const itemSize = width / numColumns
  const topinset = StickyHeader.useTopInset()
  const listTotalSize =
    Math.ceil(history.length / numColumns) * itemSize + 300 + topinset
  const scrollY = useSharedValue(0)
  const selectionStore = useMemo(() => new SelectionStore(), [])

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = event.nativeEvent.contentOffset.y
    },
    [scrollY]
  )

  const renderItem: ListRenderItem<GenerationEntity> = useCallback(
    ({ item, index }) => {
      return (
        <HistoryItem
          generation={item}
          index={index}
          selectionStore={selectionStore}
        />
      )
    },
    [selectionStore]
  )

  return (
    <View className="flex-1">
      {isEmpty && isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isEmpty ? (
        <EmpyState />
      ) : (
        <FlashList<GenerationEntity>
          scrollIndicatorInsets={{ top: StickyHeader.height }}
          onScroll={handleScroll}
          testID="HISTORY_LIST"
          className="flex-1"
          estimatedItemSize={itemSize}
          estimatedListSize={{
            height: listTotalSize,
            width,
          }}
          key={`history_list_col_${numColumns}`}
          data={history}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={<View style={{ height: topinset }} />}
          ListFooterComponent={
            isEmpty ? null : fetchedAll ? (
              <ListFooterFetched />
            ) : isPending ? (
              <ListFooterLoader />
            ) : (
              <ListFooter />
            )
          }
          ListFooterComponentStyle={styles.listFooter}
          numColumns={numColumns}
          onEndReached={!fetchedAll ? fetchMore : undefined}
          onEndReachedThreshold={0.1}
        />
      )}

      <Header scrollY={scrollY} selectionStore={selectionStore} />
    </View>
  )
}

function Header(props: {
  scrollY: SharedValue<number>
  selectionStore: SelectionStore
}) {
  const { scrollY, selectionStore } = props
  const { t } = useTranslation()
  const { isActive, selectedCount } = useStoreData(() => ({
    isActive: selectionStore.isActive,
    selectedCount: selectionStore.selectedItems.size,
  }))
  const deleteImages = useGenerationsDelete()

  return (
    <StickyHeader scrollY={scrollY} autoHide={!isActive}>
      {isActive && (
        <Appbar.Action
          icon="close"
          onPress={() => {
            selectionStore.cancel()
          }}
        />
      )}
      <Appbar.Content
        title={
          isActive ? `Selected: ${selectedCount}` : t('screens.history.title')
        }
      />
      {!isActive && (
        <Appbar.Action
          icon="checkbox-multiple-blank-outline"
          onPress={() => {
            selectionStore.isActive = true
          }}
        />
      )}
      {isActive && (
        <Appbar.Action
          icon="trash-can"
          onPress={() => {
            if (selectionStore.selectedItems.size > 0) {
              deleteImages(selectionStore.ids.slice(), () => {
                selectionStore.cancel()
              })
            }
          }}
        />
      )}
    </StickyHeader>
  )
}

function keyExtractor(item: GenerationEntity) {
  return String(item.id)
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  listFooter: {
    flexGrow: 1,
  },
})

function HistoryItem(props: {
  generation: GenerationEntity
  index: number
  selectionStore: SelectionStore
}) {
  const { generation, selectionStore } = props
  const { navigate } = useNavigation()
  const url = generation.images[0]
  const { isActive, isSelected } = useStoreData(
    () => ({
      isSelected: has(selectionStore.selectedItems, generation.id),
      isActive: selectionStore.isActive,
    }),
    [selectionStore, generation.id]
  )

  const onPress = () => {
    if (isActive) {
      if (isSelected) {
        selectionStore.removeSelection(generation.id)
      } else {
        selectionStore.addSelection(generation.id)
      }
    } else {
      navigate('generation_result', { generation: toJS(generation) })
    }
  }

  const onLongPress = () => {
    if (!isActive) {
      runInAction(() => {
        selectionStore.isActive = true
        selectionStore.addSelection(generation.id)
      })
    }
  }

  const { colors } = useTheme()

  return (
    <View className={'w-full aspect-square p-[0.5]'}>
      <TouchableRipple
        onPress={onPress}
        onLongPress={onLongPress}
        className="flex-1"
      >
        <View className="flex-1">
          <CachedImage
            contentFit="cover"
            contentPosition="center"
            transition={200}
            recyclingKey={url}
            className="flex-1"
            source={url}
          />
          {isSelected && (
            <View className="absolute top-0 right-0 bottom-0 left-0">
              <View
                className="flex-1 opacity-60"
                style={{ backgroundColor: colors.primaryContainer }}
              />

              <View className="absolute top-5 right-5">
                <Icon
                  size={24}
                  source="checkbox-marked-circle"
                  color={colors.onPrimaryContainer}
                />
              </View>
            </View>
          )}
        </View>
      </TouchableRipple>
      {/* {isActive} */}
    </View>
  )
}

function EmpyState() {
  const { t } = useTranslation()
  const { navigate } = useNavigation()

  return (
    <View className="flex-grow items-center justify-center">
      <LottieView
        style={{ width: '90%', height: 180, maxWidth: 500 }}
        source={EmptyAnimation}
        autoPlay
      />
      <Text variant="titleLarge" className="mb-2 mt-4">
        {t('screens.history.empty.title')}
      </Text>
      <Text variant="bodyMedium" className="text-center max-w-[300] mb-10">
        {t('screens.history.empty.description')}
      </Text>

      <Button
        icon="creation"
        onPress={() => navigate('home_tabs', { screen: 'generation' })}
        mode="contained"
      >
        {t('screens.history.empty.button')}
      </Button>
    </View>
  )
}

function ListFooterFetched() {
  const { t } = useTranslation()
  const { navigate } = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <View
      className="flex-grow items-center justify-center min-h-[300] py-10"
      style={{ marginBottom: insets.bottom }}
    >
      <Text variant="titleLarge" className="mb-2 mt-4">
        {t('screens.history.end.title')}
      </Text>
      <Text variant="bodyMedium" className="text-center max-w-[300] mb-4">
        {t('screens.history.end.description')}
      </Text>

      <Button
        icon="creation"
        onPress={() => navigate('home_tabs', { screen: 'generation' })}
        mode="contained"
      >
        {t('screens.history.end.button')}
      </Button>
    </View>
  )
}

function ListFooterLoader() {
  const insets = useSafeAreaInsets()

  return (
    <View className="min-h-[300] py-10 items-center justify-center">
      <ActivityIndicator />
    </View>
  )
}

function ListFooter() {
  const insets = useSafeAreaInsets()

  return (
    <View
      className="min-h-[300] py-10"
      style={{ marginBottom: insets.bottom }}
    />
  )
}
