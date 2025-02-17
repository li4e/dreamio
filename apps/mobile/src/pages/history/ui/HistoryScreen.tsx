import { useNavigation } from '@react-navigation/native'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import {
  ActivityIndicator,
  Appbar,
  Button,
  Text,
  TouchableRipple,
} from 'react-native-paper'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GenerationEntity } from 'entities/generation'
import { useHistory } from '../models/useGenHistory'
import EmptyAnimation from './assets/austroman.json'
import { toJS } from 'mobx'
import { CachedImage } from 'shared/ui/CachedImage'
import { FlashList } from '@shopify/flash-list'

function getNumColumns(totalLength: number) {
  // return totalLength > 4 ? 3 : totalLength > 1 ? 2 : 1
  return 2
}

export function HistoryScreen() {
  const { width } = useWindowDimensions()
  const { history, isPending, fetchMore, fetchedAll } = useHistory()
  const isEmpty = history.length === 0
  const { t } = useTranslation()
  const numColumns = getNumColumns(history.length)
  const itemSize = width / numColumns
  const listTotalSize = Math.ceil(history.length / numColumns) * itemSize + 300

  return (
    <View className="flex-1">
      <Appbar.Header>
        <Appbar.Content title={t('screens.history.title')} />
      </Appbar.Header>
      {isEmpty && isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator />
        </View>
      ) : isEmpty ? (
        <EmpyState />
      ) : (
        <FlashList<GenerationEntity>
          testID="HISTORY_LIST"
          className="flex-1"
          estimatedItemSize={itemSize}
          estimatedListSize={{
            height: listTotalSize,
            width,
          }}
          key={`history_list_col_${numColumns}`}
          data={history}
          renderItem={({ item, index }) => (
            <HistoryItem generation={item} index={index} />
          )}
          keyExtractor={keyExtractor}
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

function HistoryItem(props: { generation: GenerationEntity; index: number }) {
  const { generation, index } = props
  const { navigate } = useNavigation()
  const url = generation.images[0]

  return (
    <View className={'w-full aspect-square p-[0.5]'}>
      <TouchableRipple
        onPress={() =>
          navigate('generation_result', { generation: toJS(generation) })
        }
        className="flex-1"
      >
        <CachedImage
          transition={300}
          recyclingKey={url}
          className="flex-1"
          source={url}
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
