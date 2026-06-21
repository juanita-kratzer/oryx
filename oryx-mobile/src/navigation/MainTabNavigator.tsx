import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MyCardsScreen } from "../screens/MyCardsScreen";
import { ScannedContactsScreen } from "../screens/ScannedContactsScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { useTheme } from "../contexts/ThemeContext";
import type { BrandColors } from "../constants/colors";
import type { MainTabParamList } from "../types";
import { useTabBarInsets } from "../lib/screenInsets";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const Tab = createBottomTabNavigator<MainTabParamList>();

function createStyles(colors: BrandColors, compact: boolean) {
  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.card,
      borderTopColor: colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      elevation: 0,
      shadowOpacity: 0,
      overflow: "visible",
    },
    tabBarItem: {
      flex: 1,
      justifyContent: "flex-end",
      alignItems: "center",
      paddingBottom: 2,
      overflow: "visible",
    },
    tabItem: {
      alignItems: "center",
      justifyContent: "flex-end",
      minWidth: compact ? 64 : 72,
      paddingHorizontal: 2,
      overflow: "visible",
    },
    tabItemCenter: {
      marginTop: compact ? -2 : -4,
    },
    iconWrap: {
      width: compact ? 28 : 30,
      height: compact ? 28 : 30,
      borderRadius: compact ? 14 : 15,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 2,
    },
    iconWrapCenter: {
      width: compact ? 44 : 48,
      height: compact ? 44 : 48,
      borderRadius: compact ? 22 : 24,
      marginBottom: 2,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconWrapFocused: {
      backgroundColor: colors.border,
    },
    iconWrapCenterFocused: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    label: {
      marginTop: 0,
      fontSize: compact ? 10 : 11,
      lineHeight: compact ? 12 : 13,
      fontWeight: "500",
      color: colors.textSecondary,
      textAlign: "center",
      width: "100%",
      includeFontPadding: false,
    },
    labelFocused: {
      color: colors.text,
      fontWeight: "600",
    },
    labelCenter: {
      fontSize: compact ? 11 : 12,
      fontWeight: "600",
    },
  });
}

function TabIcon({
  label,
  icon,
  iconFocused,
  focused,
  center,
  colors,
  styles,
  compact,
}: {
  label: string;
  icon: IoniconName;
  iconFocused: IoniconName;
  focused: boolean;
  center?: boolean;
  colors: BrandColors;
  styles: ReturnType<typeof createStyles>;
  compact: boolean;
}) {
  const iconColor =
    center && focused
      ? colors.onPrimary
      : focused
        ? colors.text
        : colors.textSecondary;
  const iconSize = center ? (compact ? 22 : 24) : compact ? 20 : 22;

  return (
    <View style={[styles.tabItem, center && styles.tabItemCenter]}>
      <View
        style={[
          styles.iconWrap,
          center && styles.iconWrapCenter,
          focused && !center && styles.iconWrapFocused,
          center && focused && styles.iconWrapCenterFocused,
        ]}
      >
        <Ionicons
          name={focused ? iconFocused : icon}
          size={iconSize}
          color={iconColor}
        />
      </View>
      <Text
        style={[
          styles.label,
          focused && styles.labelFocused,
          center && styles.labelCenter,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.85}
      >
        {label}
      </Text>
    </View>
  );
}

export function MainTabNavigator() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const { bottomPadding, tabBarHeight } = useTabBarInsets();
  const styles = useMemo(
    () => createStyles(colors, compact),
    [colors, compact]
  );

  const tabBarStyle = useMemo(
    () => ({
      ...styles.tabBar,
      height: tabBarHeight,
      paddingTop: 10,
      paddingBottom: bottomPadding,
    }),
    [styles.tabBar, tabBarHeight, bottomPadding]
  );

  return (
    <Tab.Navigator
      initialRouteName="Cards"
      safeAreaInsets={{ bottom: 0 }}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle,
        tabBarItemStyle: styles.tabBarItem,
        tabBarHideOnKeyboard: Platform.OS !== "web",
      }}
    >
      <Tab.Screen
        name="Contacts"
        component={ScannedContactsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Contacts"
              icon="people-outline"
              iconFocused="people"
              focused={focused}
              colors={colors}
              styles={styles}
              compact={compact}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Cards"
        component={MyCardsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Cards"
              icon="card-outline"
              iconFocused="card"
              focused={focused}
              center
              colors={colors}
              styles={styles}
              compact={compact}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              label="Account"
              icon="person-circle-outline"
              iconFocused="person-circle"
              focused={focused}
              colors={colors}
              styles={styles}
              compact={compact}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
