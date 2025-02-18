import { StyleSheet, Text, View } from "react-native";
import React from "react";
import Loading from "../components/loading";

const index = () => {
  return (
    <View style={styles.container}>
      <Loading />
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
