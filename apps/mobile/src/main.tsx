import "reflect-metadata"; // Required for TypeORM
import "react-native-url-polyfill/auto"; // Required for Axios
import "app/lib/gesture-handler";
import "app/lib/dayjs";

import { registerRootComponent } from "expo";
import { App } from "app/App";

registerRootComponent(App);
