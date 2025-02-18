import { StyleSheet, ViewStyle } from "react-native";
import React from "react";
import { hp } from "../helpers/Common";
import { theme } from "../constants/theme";
import { Image } from "expo-image";
import { getUserImageSrc } from "../services/imageService";

// Define prop types
interface AvatarProps {
  uri: string;
  size?: number;
  rounded?: number;
  style?: any;
}

const Avatar: React.FC<AvatarProps> = ({ 
  uri, 
  size = hp(4.5), 
  rounded = theme.radius.md, 
  style = {} 
}) => {
  return (
    <Image
      source={getUserImageSrc(uri)}
      transition={100}
      style={[styles.avatar, { height: size, width: size, borderRadius: rounded }, style]}
    />
  );
};

export default Avatar;

const styles = StyleSheet.create({
  avatar: {
    borderCurve: "continuous",
    borderColor: theme.colors.darkLight,
    borderWidth: 1,
  },
});
