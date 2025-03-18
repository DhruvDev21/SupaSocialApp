import React from "react";
import {
  TouchableOpacity,
  StyleSheet,
  type GestureResponderEvent,
  View,
} from "react-native";
import { Tabs } from "expo-router";
import Icon from "@/assets/icons";
import { theme } from "@/src/constants/theme";
import { wp } from "@/src/helpers/Common";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.TabBar,
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarButton: (props) => (
            <CustomTabButton {...props} iconName="home" />
          ),
        }}
      />
      <Tabs.Screen
        name="userChatList"
        options={{
          tabBarButton: (props) => (
            <CustomTabButton {...props} iconName="ChatIcon" isChat />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          tabBarButton: (props) => (
            <CustomTabButton
              {...props}
              iconName="unSaved"
              isChat
              iconSize={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          tabBarButton: (props) => (
            <CustomTabButton {...props} iconName="shopping" />
          ),
        }}
      />
    </Tabs>
  );
}

// Define Types for Props
type CustomTabButtonProps = {
  iconName: string;
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
  isChat?: boolean;
  iconSize?: number;
};

// Custom Floating Button Component with Proper Types
const CustomTabButton: React.FC<CustomTabButtonProps> = ({
  iconName,
  onPress,
  accessibilityState,
  isChat,
  iconSize = 24,
}) => {
  const isSelected = accessibilityState?.selected ?? false;

  return (
    <View style={styles.iconView}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.iconContainer,
          isSelected && styles.activeIcon,
          { marginHorizontal: wp(8) }, // Increase horizontal margin for better spacing
        ]}
      >
        <Icon
          name={iconName}
          size={iconSize}
          color={isSelected ? "white" : theme.colors.textLight}
        />
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  TabBar: {
    backgroundColor: "#fefefe",
    height: wp(16), // Increased height for better visibility
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 1, // Add a border to distinguish the tab bar
    borderTopColor: "#ddd", // Light gray border color
    elevation: 10, // Increase elevation for a stronger shadow effect
    shadowColor: "#000",
    shadowOpacity: 0.15, // Subtle shadow for better visibility
    shadowOffset: { width: 0, height: -2 }, // Shadow above the tab bar
    shadowRadius: 5,
  },
  iconView: {
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    // backgroundColor: theme.colors.gray,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIcon: {
    backgroundColor: theme.colors.primary,
  },
});
