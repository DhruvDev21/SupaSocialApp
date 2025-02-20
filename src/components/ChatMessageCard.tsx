import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";

type ChatProps = {
  sender: "me" | "you";
  text: string;
};

const ChatMessageCard = memo(({ sender, text }: ChatProps) => {
  const isMyMessage = sender === "me";

  return (
    <View style={[styles.container, isMyMessage ? styles.alignRight : styles.alignLeft]}>
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
        <Text style={[styles.text, isMyMessage && styles.myText]}>{text}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    marginHorizontal: 8,
  },
  alignRight: {
    justifyContent: "flex-end",
  },
  alignLeft: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    padding: 10,
    borderRadius: 12,
    maxWidth: "70%",
  },
  myMessage: {
    backgroundColor: "#007AFF", // Primary color
  },
  otherMessage: {
    backgroundColor: "#FFFFFF",
  },
  text: {
    fontSize: 16,
  },
  myText: {
    color: "#FFFFFF",
  },
});

export default ChatMessageCard;
