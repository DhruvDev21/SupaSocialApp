import { Pressable, StyleSheet } from "react-native";
import React from "react";
import Icon from "@/assets/icons";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";

interface BackButtonProps {
  size?: number;
  navigation: ReturnType<typeof useRouter>;
}

const BackButton: React.FC<BackButtonProps> = ({ size = 26, navigation }) => {
  return (
    <Pressable onPress={() => navigation.back()} style={styles.buttonStyle}>
      <Icon
        name={"arrowLeft"}
        strokeWidth={2.5}
        size={size}
        color={theme.colors.text}
      />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  buttonStyle: {
    alignSelf: "flex-start",
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "rgba(0,0,0,0.07)",
  },
});
