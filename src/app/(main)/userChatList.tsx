import React, { useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import Header from "@/src/components/Header";
import { wp, hp } from "@/src/helpers/Common";
import {
  fetchChatUsers,
  getUnseenMessagesCount,
  markMessagesAsSeen,
} from "@/src/services/chatServices";
import Icon from "@/assets/icons";
import { theme } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/AuthContext";
import { useFocusEffect, useRouter } from "expo-router";
import Avatar from "@/src/components/Avatar";
import Loading from "@/src/components/loading";
import { supabase } from "@/lib/supabase";
import { createNotification } from "@/src/services/notificationService";

interface ChatUser {
  chat_id: string;
  lastMessage: string;
  id: any;
  name: any;
  image: any;
  email: any;
  bio: any;
  address: any;
}

const UserChatList = () => {
  const navigation = useRouter();
  const { user: loggedUser } = useAuth();
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [unseenMessages, setUnseenMessages] = useState<{
    [key: string]: number;
  }>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchChats = async () => {
        if (!loggedUser) return;
        setLoading(true);

        const users = await fetchChatUsers(loggedUser.id as string);
        const unseenCounts: { [key: string]: number } = {};

        for (const user of users) {
          if (user.chat_id) {
            const count = await getUnseenMessagesCount(
              loggedUser.id as string,
              user.chat_id
            );
            unseenCounts[user.id] = count;
          }
        }

        setChatUsers(users);
        setUnseenMessages(unseenCounts);
        setLoading(false);
      };

      fetchChats();

      // **Listening for new messages**
      const messageChannel = supabase
        .channel("newMessages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `receiverId=eq.${loggedUser?.id}`,
          },
          async (payload) => {
            console.log("📩 New message received:", payload);

            // Update unread messages count
            setUnseenMessages((prev) => ({
              ...prev,
              [payload.new.senderId]: (prev[payload.new.senderId] || 0) + 1,
            }));

            // Send push notification
            const notificationPayload = {
              senderId: payload.new.senderId,
              receiverId: loggedUser?.id ?? "",
              title: "New Message",
              message: payload.new.text,
              data: JSON.stringify({ chatId: payload.new.chat_id }),
              type: "message",
            };

            await createNotification(notificationPayload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(messageChannel);
      };
    }, [loggedUser])
  );

  const onPressAddUser = () => {
    navigation.push("/(main)/newUserChat");
  };

  const onPressChat = async (user: any) => {
    if (loggedUser) {
      await markMessagesAsSeen(loggedUser.id as string, user.chat_id);
    }
    navigation.push({
      pathname: "/(main)/chatScreen",
      params: { user: JSON.stringify(user) },
    });
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => onPressChat(item)}>
      <Avatar uri={item.image} size={hp(5.5)} />
      <View style={styles.messageContainer}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage || "Start a conversation"}
        </Text>
      </View>

      {/* Right-side Container for Unseen Badge and Timestamp */}
      <View style={styles.rightContainer}>
        {unseenMessages[item.id] > 0 && (
          <View style={styles.unseenBadge}>
            <Text style={styles.unseenText}>{unseenMessages[item.id]}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Header title="Chat" showBackButton={false} />
          {/* {isCurrentUser && ( */}
          <View style={{flexDirection:'row',gap:wp(2)}}>
          <TouchableOpacity style={styles.logoutBtn} onPress={onPressAddUser}>
            <Icon name="addIcon" color={theme.colors.text} size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={onPressAddUser}>
            <Icon name="threeDotsHorizontal" color={theme.colors.text} size={20} strokeWidth={4} />
          </TouchableOpacity>
          </View>
          {/* )} */}
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Loading />
          </View>
        ) : (
          <FlatList
            data={chatUsers}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No chats available. Add a user to start chatting!
                </Text>
              </View>
            )}
            contentContainerStyle={chatUsers.length === 0 && styles.emptyList}
          />
        )}
      </View>

      {/* <View style={styles.addButtonContainer}>
        <Pressable style={styles.addIcon} onPress={onPressAddUser}>
          <Icon name={"addIcon"} color={"white"} strokeWidth={3} />
        </Pressable>
      </View> */}
    </ScreenWrapper>
  );
};

export default UserChatList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: theme.colors.gray,
    paddingHorizontal: wp(4),
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutBtn: {
    height: hp(4),
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    borderRadius: theme.radius.sm,
    // backgroundColor: "#d7f7c7",
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: wp(2),
    alignItems: "center",
    gap: wp(3),
    paddingHorizontal: wp(4),
  },
  messageContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 5,
  },
  lastMessage: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    minWidth: wp(13),
  },
  unseenBadge: {
    backgroundColor: theme.colors.primary,
    width: hp(2.3),
    height: hp(2.3),
    borderRadius: hp(1.5),
    justifyContent: "center",
    alignItems: "center",
  },
  unseenText: {
    color: "white",
    fontWeight: "bold",
    fontSize: hp(1.3),
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textLight,
  },
  addButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    margin: 16,
    marginBottom: 100,
  },
  addIcon: {
    backgroundColor: theme.colors.primary,
    paddingLeft: 16,
    paddingRight: 13,
    paddingVertical: 15,
    borderRadius: 50,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
  },
});
