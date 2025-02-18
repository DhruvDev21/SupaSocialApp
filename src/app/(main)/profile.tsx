import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { useAuth } from "@/src/contexts/AuthContext";
import { Router, useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/src/components/Header";
import { hp, wp } from "@/src/helpers/Common";
import { TouchableOpacity } from "react-native";
import Icon from "@/assets/icons";
import { theme } from "@/src/constants/theme";
import { supabase } from "@/lib/supabase";
import Avatar from "@/src/components/Avatar";
import { postType } from "@/src/constants/type";
import { fetchPosts } from "@/src/services/postService";
import PostCard from "@/src/components/PostCard";
import Loading from "@/src/components/loading";

// Define types
interface UserHeaderProps {
  user?: any; // Adjust type according to your actual user object structure
  handleLogout: () => void;
  navigation: Router;
}

var limit = 0;
const Profile = () => {
  const { user } = useAuth();
  const { userId } = useLocalSearchParams();
  console.log(' the user id',userId)
  console.log(' the user id', user?.id)
  const navigation = useRouter();
  const [posts, setPosts] = useState<postType[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error while logging out", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        onPress: () => console.log("Cancel clicked"),
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  const getPosts = async () => {
    if (!hasMore) return null;
    limit = limit + 10;
    let res = await fetchPosts(limit, user?.id);
    console.log("the data", res);
    if (res && res.data) {
      if (posts.length == res.data?.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader
            user={user}
            handleLogout={handleLogout}
            navigation={navigation}
          />
        }
        ListHeaderComponentStyle={{marginBottom:20}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listsStyle}
        // keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => {
          console.log(" the flat list render item");
          return (
            <PostCard item={item} currentUser={user} navigation={navigation} />
          );
        }}
        onEndReached={() => {
          console.log("the end has beed reached fetching new data");
          getPosts();
        }}
        ListFooterComponent={
          hasMore ? (
            <View style={{ marginVertical: posts.length == 0 ? 200 : 30 }}>
              <Loading />
            </View>
          ) : (
            <View style={{ marginVertical: 30 }}>
              <Text style={styles.noPosts}>No more posts</Text>
            </View>
          )
        }
      />
    </ScreenWrapper>
  );
};

const UserHeader: React.FC<UserHeaderProps> = ({
  user,
  navigation,
  handleLogout,
}) => {
  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title="Profile" mb={30} />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Icon name="logout" color={theme.colors.rose} />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15 }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            <Pressable
              style={styles.editIcon}
              onPress={() => navigation.push("/(main)/editProfile")}
            >
              <Icon name={"edit"} strokeWidth={2.5} size={20} />
            </Pressable>
          </View>

          <View style={{ alignItems: "center", gap: 4 }}>
            <Text style={styles.userName}>{user && user?.name}</Text>
            <Text style={styles.infotext}>{user && user?.address}</Text>
          </View>

          <View style={{ gap: 10 }}>
            <View style={styles.info}>
              <Icon name={"mail"} size={20} color={theme.colors.textLight} />
              <Text style={styles.infotext}>{user && user?.email}</Text>
            </View>

            {user && user?.phoneNumber && (
              <View style={styles.info}>
                <Icon name={"call"} size={20} color={theme.colors.textLight} />
                <Text style={styles.infotext}>{user && user?.phoneNumber}</Text>
              </View>
            )}
            {user && user?.bio && (
              <Text style={styles.infotext}>{user?.bio}</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  logoutBtn: {
    position: "absolute",
    right: 0,
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  container: {},
  avatarContainer: {
    height: hp(12),
    width: hp(12),
    alignSelf: "center",
  },
  editIcon: {
    position: "absolute",
    right: -12,
    bottom: 0,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textDark,
  },
  infotext: {
    fontSize: hp(1.6),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  info: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  listsStyle: {
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
});
