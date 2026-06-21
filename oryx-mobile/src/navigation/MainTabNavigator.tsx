import React, { useMemo } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MyCardsScreen } from "../screens/MyCardsScreen";
import { ScannedContactsScreen } from "../screens/ScannedContactsScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { useTheme } from "../contexts/ThemeContext";
import type { BrandColors } from "../constants/colors";
import type { MainTabParamList } from "../types";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const Tab = createBottomTabNavigator<MainTabParamList>();

function createStyles(colors: BrandColors) {
  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.card,
      borderTopColor: colors.border,
      borderTopWidth: 1,
      height: Platform.OS === "ios" ? 88 : 68,
      paddingTop: 8,
      paddingBottom: Platform.OS === "ios" ? 28 : 10,
    },
    tabBarItem: {
      paddingTop: 4,
    },
    tabItem: {
      alignItems: "center",
      justifyContent: "center",
      minWidth: 72,
    },
    tabItemCenter: {
      marginTop: -18,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    iconWrapCenter: {
      width: 52,
      height: 52,
      borderRadius: 26,
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
      marginTop: 4,
      fontSize: 11,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    labelFocused: {
      color: colors.text,
      fontWeight: "600",
    },
    labelCenter: {
      fontSize: 12,
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
}: {
  label: string;
  icon: IoniconName;
  iconFocused: IoniconName;
  focused: boolean;
  center?: boolean;
  colors: BrandColors;
  styles: ReturnType<typeof createStyles>;
}) {
  const iconColor =
    center && focused
      ? colors.onPrimary
      : focused
        ? colors.text
        : colors.textSecondary;
  const iconSize = center ? 24 : 22;

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
      >
        {label}
      </Text>
    </View>
  );
}

export function MainTabNavigator() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Tab.Navigator
      initialRouteName="Cards"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
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
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
