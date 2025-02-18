import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import BackButton from "./BackButton";
import { hp } from "../helpers/Common";
import { theme } from "../constants/theme";

// Define prop types
interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  mb?: number;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = true, mb = 10 }) => {
  const navigation = useRouter();
  
  return (
    <View style={[styles.container, { marginBottom: mb }]}>
      {showBackButton && (
        <View style={styles.backButton}>
          <BackButton navigation={navigation} />
        </View>
      )}
      <Text style={styles.title}>{title || ""}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    gap: 10,
  },
  backButton: {
    position: "absolute",
    left: 0,
  },
  title: {
    fontSize: hp(2.7),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.textDark,
  },
});
