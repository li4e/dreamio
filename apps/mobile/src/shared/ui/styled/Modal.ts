import { styled } from "nativewind";
import { Modal as PaperModel } from "react-native-paper";

export const Modal = styled(PaperModel, {
  props: {
    contentContainerStyle: true,
  },
});
