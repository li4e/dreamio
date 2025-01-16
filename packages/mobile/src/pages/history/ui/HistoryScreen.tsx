import { useNavigation } from '@react-navigation/native'
import LottieView from 'lottie-react-native'
import { useTranslation } from 'react-i18next'
import { FlatList, View, Image, StyleSheet } from 'react-native'
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

export function HistoryScreen() {
  const insets = useSafeAreaInsets()
  const { history, isPending } = useHistory()
  const isEmpty = history.length === 0
  const { t } = useTranslation()

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
        <FlatList<GenerationEntity>
          className="flex-1"
          contentContainerStyle={[
            styles.contentContainer,
            {
              paddingBottom: insets.bottom,
            },
          ]}
          data={history}
          renderItem={renderItem}
          ListEmptyComponent={<EmpyState />}
          ListFooterComponent={!isEmpty ? <ListFooter /> : null}
          ListFooterComponentStyle={styles.listFooter}
          numColumns={2}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  listFooter: {
    flexGrow: 1,
  },
})

function renderItem({
  item,
  index,
}: {
  item: GenerationEntity
  index: number
}) {
  return (
    <HistoryItem
      firstRow={index <= 1}
      generation={item}
      even={index % 2 === 0}
    />
  )
}

function HistoryItem(props: {
  generation: GenerationEntity
  even: boolean
  firstRow: boolean
}) {
  const { generation, even, firstRow } = props
  const { navigate } = useNavigation()

  return (
    <View
      className={twMerge(
        'w-1/2 aspect-square py-[2]',
        even ? 'pr-[2]' : 'pl-[2]',
        firstRow && 'pt-0'
      )}
    >
      <TouchableRipple
        onPress={() =>
          navigate('generation_result', { generation: generation })
        }
        className="flex-1"
      >
        <Image className="flex-1" source={{ uri: generation.images[0] }} />
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
