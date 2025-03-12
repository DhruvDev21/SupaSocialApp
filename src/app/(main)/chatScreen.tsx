import React, { useState, useRef, useEffect } from "react";
import {
  ActivityIndicator,
  BackHandler,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/src/components/Header";
import Avatar from "@/src/components/Avatar";
import { hp, wp } from "@/src/helpers/Common";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import Icon from "@/assets/icons";
import { theme } from "@/src/constants/theme";
import Input from "@/src/components/input";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  fetchMessages,
  Message,
  sendMessage,
  subscribeToMessages,
  unsubscribeFromMessages,
} from "@/src/services/chatServices";

const EmptyState = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>No chat available</Text>
  </View>
);

const ChatScreen: React.FC = () => {
  const { user } = useLocalSearchParams<{ user: string }>();
  const chatUser = user ? JSON.parse(user) : null;
  const { user: loggedUser } = useAuth();
  const navigation = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const flatListRef = useRef<FlatList>(null);
  const subscriptionRef = useRef<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.push("/(tabs)/userChatList"); // Navigate to user chat list screen
        return true; // Prevent default behavior
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove(); // Cleanup
    }, [navigation])
  );

  useEffect(() => {
    console.log("🚀 Fetching initial messages...");
    setLoading(true); // Start loading state
    if (loggedUser && loggedUser.id && chatUser && chatUser.id) {
      fetchMessages(loggedUser.id, chatUser.id).then((data) => {
        console.log("📩 Initial messages fetched:", data.length);
        setMessages(data);
        setLoading(false); // Stop loading state
      });

      subscriptionRef.current = subscribeToMessages(
        loggedUser.id,
        chatUser.id,
        setMessages
      );

      return () => {
        console.log("🔴 Unsubscribing from messages...");
        unsubscribeFromMessages(subscriptionRef.current);
      };
    } else {
      console.error("❌ User IDs are not available!");
      setLoading(false); // Stop loading state
    }
  }, [loggedUser?.id, chatUser?.id]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || loading) return; // Prevent sending while loading

    console.log("✉️ Sending message:", messageText);
    setMessageText("");

    if (!loggedUser || !loggedUser.id || !chatUser || !chatUser.id) {
      console.error("❌ User IDs are not available!");
      return;
    }

    const sentMessage = await sendMessage(
      loggedUser.id,
      chatUser.id,
      messageText
    );

    if (!sentMessage) {
      console.error("❌ Message failed to send!");
    } else {
      console.log("✅ Message successfully stored in Supabase:", sentMessage);
    }

    flatListRef.current?.scrollToOffset({ animated: true, offset: 0 });
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        loggedUser && item.sender_id === loggedUser.id
          ? styles.sentMessage
          : styles.receivedMessage,
      ]}
    >
      <Text>{item.text}</Text>
    </View>
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.headerContainer}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Avatar uri={chatUser.image} size={hp(5.5)} />
          <Header title={chatUser.name} showBackButton={false} />
        </View>
        <Icon
          name="threeDotsHorizontal"
          color={theme.colors.dark}
          strokeWidth={3}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : messages.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          inverted
          contentContainerStyle={styles.messageContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.inputContainer}>
        <Input
          value={messageText}
          onChangeText={setMessageText}
          placeholder="Type message..."
          placeholderTextColor={theme.colors.textLight}
          containerStyles={{
            flex: 1,
            height: hp(6.3),
            width: hp(35),
            borderRadius: theme.radius.xl,
          }}
          editable={!loading} // Disable input while loading
        />
        <TouchableOpacity
          style={[styles.sendIcon, loading && { opacity: 0.5 }]} // Reduce opacity while loading
          onPress={handleSendMessage}
          disabled={loading} // Disable send button while loading
        >
          <Icon name={"send"} color={theme.colors.primaryDark} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wp(4),
    paddingVertical: wp(2),
    borderBottomWidth: 1,
    borderColor: theme.colors.gray,
  },
  messageContainer: {
    paddingHorizontal: wp(4),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: hp(2.2),
    color: theme.colors.textLight,
  },
  messageBubble: {
    maxWidth: "80%",
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
    marginVertical: wp(2),
    borderRadius: theme.radius.xxl,
  },
  sentMessage: {
    backgroundColor: theme.colors.primary,
    alignSelf: "flex-end",
  },
  receivedMessage: {
    backgroundColor: theme.colors.gray,
    alignSelf: "flex-start",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: wp(4),
    paddingVertical: wp(3),
    borderTopWidth: 1,
    borderColor: theme.colors.gray,
  },
  sendIcon: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.8,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    height: hp(5.8),
    width: hp(5.8),
  },
});

export default ChatScreen;
