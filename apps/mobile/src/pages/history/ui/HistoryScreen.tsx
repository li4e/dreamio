import { useNavigation } from '@react-navigation/native'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'
import {
  ActivityIndicator,
  Appbar,
  Button,
  Text,
  TouchableRipple,
} from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { twMerge } from 'tailwind-merge'
import { GenerationEntity } from 'entities/generation'
import { useHistory } from '../models/useGenHistory'
import EmptyAnimation from './assets/austroman.json'
import { toJS } from 'mobx'
import { CachedImage } from 'shared/ui/CachedImage'
import Animated from 'react-native-reanimated'
import { useCallback } from 'react'

function getNumColumns(totalLength: number) {
  return totalLength > 4 ? 3 : totalLength > 1 ? 2 : 1
}

export function HistoryScreen() {
  const insets = useSafeAreaInsets()
  const { history, isPending } = useHistory()
  const isEmpty = history.length === 0
  const { t } = useTranslation()
  const numColumns = getNumColumns(history.length)
  const renderItem = useCallback(
    ({ item, index }: { item: GenerationEntity; index: number }) => {
      return (
        <HistoryItem generation={item} numColumns={numColumns} index={index} />
      )
    },
    [numColumns]
  )

  return (
    <View className="flex-1">
      <Appbar.Header>
        <Appbar.Content title={t('screens.history.title')} />
      </Appbar.Header>
      {isEmpty && isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : (
        <Animated.FlatList<GenerationEntity>
          testID="HISTORY_LIST"
          className="flex-1"
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingBottom: insets.bottom,
            },
          ]}
          key={`history_list_col_${numColumns}`}
          data={history}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListEmptyComponent={<EmpyState />}
          ListFooterComponent={!isEmpty ? <ListFooter /> : null}
          ListFooterComponentStyle={styles.listFooter}
          numColumns={numColumns}
        />
      )}
    </View>
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
  numColumns: number
  index: number
}) {
  const { generation, numColumns, index } = props
  const { navigate } = useNavigation()

  return (
    <View
      className={twMerge(
        'aspect-square pt-[1]',
        numColumns === 1 && 'w-full',
        numColumns === 2 && 'w-1/2',
        numColumns === 2 && index % 2 && 'pl-[1]',
        numColumns === 3 && 'w-1/3 pr-[1]',
        numColumns === 3 && index % 3 === 2 && 'pr-0'
      )}
    >
      <TouchableRipple
        onPress={() =>
          navigate('generation_result', { generation: toJS(generation) })
        }
        className="flex-1"
      >
        <CachedImage
          className="flex-1"
          source={{ uri: generation.images[0] }}
        />
      </TouchableRipple>
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

function ListFooter() {
  const { t } = useTranslation()
  const { navigate } = useNavigation()

  return (
    <View className="flex-grow items-center justify-center py-10">
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
