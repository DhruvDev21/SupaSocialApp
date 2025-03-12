import { ActivityIndicator, Pressable, StyleSheet, Text, View, TextStyle, ViewStyle } from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helpers/Common";
import Loading from "./loading";

interface ButtonProps {
  btnStyle?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  title?: string;
  onPress?: () => void;
  loading?: boolean;
  hasShadow?: boolean;
  disabled?:boolean
}

const Button: React.FC<ButtonProps> = ({
  btnStyle,
  textStyle,
  title = "",
  onPress = () => {},
  loading = false,
  hasShadow = true,
  disabled= false,
}) => {
  const shadowStyle: ViewStyle = {
    shadowColor: theme.colors.dark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  };

  if (loading) {
    return (
      <View style={[styles.button, btnStyle, { backgroundColor: "white" }]}>
        <Loading/>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, btnStyle, hasShadow && shadowStyle]}
      disabled={disabled}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    height: hp(6.6),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.radius.xl,
  },
  text: {
    fontSize: hp(2.5),
    color: "white",
    fontWeight: theme.fonts.bold,
  },
});
