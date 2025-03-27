import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { getFollowedUsers } from "@/src/services/userService";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import Avatar from "@/src/components/Avatar";
import { hp, wp } from "@/src/helpers/Common";
import Header from "@/src/components/Header";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { theme } from "@/src/constants/theme";
import { fetchChatUsers } from "@/src/services/chatServices";

interface User {
  id: string;
  address: string;
  bio: string;
  created_at: string;
  email: string;
  image: string;
  name: string;
  phoneNumber: string;
}

const NewUserChat = () => {
  const { user } = useAuth();
  const navigation = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add loader state

  const getuserdata = async () => {
    if (!user || !user.id) {
      console.error("User is null or undefined");
      setLoading(false);
      return;
    }
    try {
      setLoading(true); // Start loading
      const followedUsersRes = await getFollowedUsers(user.id);
      const chatUsersRes = await fetchChatUsers(user.id);

      console.log("Followed Users Response:", followedUsersRes);
      console.log("Chat Users Response:", chatUsersRes);

      if (followedUsersRes?.data && Array.isArray(chatUsersRes)) {
        const followedUsers = followedUsersRes.data || [];
        const chatUsers = chatUsersRes || [];

        console.log(
          "Followed Users List:",
          followedUsers.map((user) => user.name)
        );
        console.log(
          "Chatted Users List:",
          chatUsers.map((user) => user.name)
        );

        const chattedUserIds = new Set(chatUsers.map((chat) => chat.id));
        console.log("Chatted User IDs:", chattedUserIds);

        const newUsers = followedUsers.filter(
          (user) => !chattedUserIds.has(user.id)
        );
        console.log(
          "New Users List:",
          newUsers.map((user) => user.name)
        );

        setUsers(newUsers);
      } else {
        console.log("Invalid API response");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUsers([]);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const onUserClick = async (user: User) => {
    navigation.push({
      pathname: "/(main)/chatScreen",
      params: { user: JSON.stringify(user) },
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      getuserdata();
    }, [])
  );

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View
          style={{
            borderBottomWidth: 1,
            borderColor: theme.colors.gray,
            paddingHorizontal: wp(4),
          }}
        >
          <Header title="New Chat" onPress={()=>navigation.push('/(tabs)/userChatList')} />
        </View>

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.flatlistStyle}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Please follow someone to chat
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                style={styles.userContainer}
                onPress={() => onUserClick(item)}
              >
                <Avatar uri={item.image} size={hp(6)} />
                <Text style={styles.userName}>{item.name}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </ScreenWrapper>
  );
};

export default NewUserChat;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: wp(3),
    paddingHorizontal: wp(4),
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: hp(2.2),
    color: theme.colors.text,
    fontWeight: "bold",
    textAlign: "center",
  },
  flatlistStyle: {
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
