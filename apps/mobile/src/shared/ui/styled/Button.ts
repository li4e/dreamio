import { styled } from "nativewind";
import { Button as PaperButton } from "react-native-paper";

export const Button = styled(PaperButton, {
  props: {
    contentStyle: true,
    labelStyle: true,
  },
});
