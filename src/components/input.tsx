import {
  StyleSheet,
  TextInput,
  View,
  ViewStyle,
  TextInputProps,
  Text,
} from "react-native";
import React from "react";
import { theme } from "../constants/theme";
import { hp } from "../helpers/Common";

interface InputProps extends TextInputProps {
  containerStyles?: ViewStyle;
  icon?: React.ReactNode;
  inputRef?: React.RefObject<TextInput>;
  errorMessage?:any
}

const Input = (props: InputProps) => {
  return (
    <View>
      <View
        style={[
          styles.container,
          props.containerStyles && props.containerStyles,
        ]}
      >
        {props.icon && props.icon}
        <TextInput
          style={{ flex: 1 }}
          placeholderTextColor={theme.colors.textLight}
          ref={props.inputRef}
          {...props}
        />
      </View>
      {props.errorMessage && (
      <Text style={styles.errorText}>{props.errorMessage}</Text>
      )}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: hp(6.5),
    alignItems: "center",
    justifyContent: "flex-start",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xl,
    borderCurve: "continuous",
    paddingHorizontal: 18,
    gap: 12,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
    marginLeft: 5,
  },
});
