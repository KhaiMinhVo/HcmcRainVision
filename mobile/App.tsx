import { SafeAreaProvider } from "react-native-safe-area-context";
import RootNavigator from "./src/navigation/RootNavigator";

import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import "@/global.css";

export default function App() {
  return (
    <GluestackUIProvider mode="light">
      <SafeAreaProvider>
        <RootNavigator />
      </SafeAreaProvider>
    </GluestackUIProvider>
  );
}
