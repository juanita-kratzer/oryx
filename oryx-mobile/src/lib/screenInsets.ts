import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Inner tab row height — room for icon circles, raised center tab, and full labels.
 * Safe-area bottom inset is added separately via paddingBottom.
 */
export const TAB_BAR_CONTENT_HEIGHT = 72;

export const TAB_BAR_BOTTOM_SHIFT = Platform.OS === "ios" ? 6 : 8;

export function useTabBarInsets() {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + TAB_BAR_BOTTOM_SHIFT;
  const tabBarHeight = TAB_BAR_CONTENT_HEIGHT + bottomPadding;
  const topExtra = Platform.OS === "web" ? 36 : 20;
  const headerTopPadding = Math.max(insets.top + topExtra, topExtra);

  return {
    topInset: insets.top,
    bottomInset: insets.bottom,
    bottomPadding,
    tabBarHeight,
    listBottomPadding: tabBarHeight + 28,
    headerTopPadding,
  };
}
