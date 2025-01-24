import { styled } from 'nativewind'
import { Modal as PaperModel, ModalProps, useTheme } from 'react-native-paper'

export const Modal = styled(
  (props: ModalProps) => {
    const { children, contentContainerStyle, ...rest } = props
    const { colors } = useTheme()
    const style = {
      backgroundColor: colors.background,
    }

    return (
      <PaperModel
        contentContainerStyle={[contentContainerStyle, style]}
        {...rest}
      >
        {children}
      </PaperModel>
    )
  },
  {
    props: {
      contentContainerStyle: true,
    },
  }
)
