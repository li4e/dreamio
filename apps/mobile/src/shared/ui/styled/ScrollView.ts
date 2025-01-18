import { styled } from "nativewind";
import { ScrollView as RNScrollView } from "react-native";

export const ScrollView = styled(RNScrollView, {
  props: {
    contentContainerStyle: true,
  },
});
