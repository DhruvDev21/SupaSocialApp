import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { useAuth } from "@/src/contexts/AuthContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import Header from "@/src/components/Header";
import { hp, wp } from "@/src/helpers/Common";
import { TouchableOpacity } from "react-native";
import Icon from "@/assets/icons";
import { theme } from "@/src/constants/theme";
import { supabase } from "@/lib/supabase";
import Avatar from "@/src/components/Avatar";
import { postType, User } from "@/src/constants/type";
import { fetchPosts } from "@/src/services/postService";
import PostCard from "@/src/components/PostCard";
import Loading from "@/src/components/loading";
import {
  followUser,
  getFollowCounts,
  getUserData,
  isFollowing,
  unfollowUser,
} from "@/src/services/userService";
import Button from "@/src/components/Button";

interface UserHeaderProps {
  user: User | null;
  handleLogout: () => void;
  navigation: ReturnType<typeof useRouter>;
  isCurrentUser: boolean;
  isFollowingUser: boolean;
  handleFollowToggle: () => void;
  followersCount: number;
  followingCount: number;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const navigation = useRouter();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [posts, setPosts] = useState<postType[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFollowingUser, setIsFollowingUser] = useState<boolean>(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);

  let limit = 10;

  useEffect(() => {
    const channel = supabase
      .channel("realtime-follows")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "follows" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            if (payload.new.follower_id === user?.id) {
              setFollowingCount((prev) => prev + 1);
            }
            if (payload.new.following_id === user?.id) {
              setFollowersCount((prev) => prev + 1);
            }
          } else if (payload.eventType === "DELETE") {
            if (payload.old.follower_id === user?.id) {
              setFollowingCount((prev) => Math.max(0, prev - 1));
            }
            if (payload.old.following_id === user?.id) {
              setFollowersCount((prev) => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchUserProfile = async () => {
    if (!userId || userId === user?.id) {
      setProfileUser({
        ...user,
        name: user?.name ?? '',
        phoneNumber: user?.phoneNumber ?? '',
        image: user?.image ?? '',
        bio: user?.bio ?? '',
        address: user?.address ?? '',
      });
      setLoading(false);
    } else {
      setLoading(true);
      const response = await getUserData(userId);
      if (response.success) {
        setProfileUser(response.data);
      } else {
        console.error("Error fetching user profile:", response.msg);
      }
      setLoading(false);
    }

    const counts = await getFollowCounts(userId ?? user?.id ?? '');
    setFollowersCount(counts.followers);
    setFollowingCount(counts.following); 
  };

  useEffect(() => {
    const checkIfFollowingUser = async () => {
      if (user && userId) {
        const isFollowingStatus = await isFollowing(user.id ?? '', userId);
        setIsFollowingUser(isFollowingStatus);
      }
    };

    checkIfFollowingUser();
  }, [userId, user]);

  const handleFollowToggle = async () => {
    if (!user || !userId) return;

    if (isFollowingUser) {
      const response = await unfollowUser(user.id ?? '', userId);
      if (response.success) {
        setIsFollowingUser(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));

        setFollowingCount((prev) => Math.max(0, prev - 1));
      }
    } else {
      const checkIfFollowing = await isFollowing(user.id ?? '', userId);
      if (checkIfFollowing) {
        console.log("You are already following this user");
        setIsFollowingUser(true);
        return;
      }

      const response = await followUser(user.id ?? '', userId);
      if (response.success) {
        setIsFollowingUser(true);
        setFollowersCount((prev) => prev + 1);
      } else {
        console.error("Error following user:", response);
      }
    }
  };

  const getPosts = async () => {
    if (!hasMore) return;
    limit += 10;
    const res = await fetchPosts(limit, userId || user?.id);
    if (res?.data) {
      if (posts.length === res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  const onLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error while logging out", error);
  };

  const handleLogout = () => {
    Alert.alert("Confirm", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: onLogout, style: "destructive" },
    ]);
  };

  useEffect(() => {
    fetchUserProfile();
    getPosts();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.loginContainer}>
        <Loading />
      </View>
    );
  }

  return (
    <ScreenWrapper bg="white">
      <FlatList
        data={posts}
        ListHeaderComponent={
          <UserHeader
            user={profileUser}
            isCurrentUser={!userId || userId === user?.id}
            handleLogout={handleLogout}
            navigation={navigation}
            isFollowingUser={isFollowingUser}
            handleFollowToggle={handleFollowToggle}
            followersCount={followersCount}
            followingCount={followingCount}
          />
        }
        ListHeaderComponentStyle={{ marginBottom: 20 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listsStyle}
        renderItem={({ item }) => (
          <PostCard
            item={item}
            currentUser={user}
            navigation={navigation}
            profileClick={false}
          />
        )}
        onEndReached={getPosts}
        ListFooterComponent={
          hasMore ? (
            <View style={{ marginVertical: posts.length === 0 ? 200 : 30 }}>
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
  isCurrentUser,
  isFollowingUser,
  handleFollowToggle,
  followersCount,
  followingCount,
}) => {
  return (
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title="Profile" mb={30} />
        {isCurrentUser && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Icon name="logout" color={theme.colors.rose} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.container}>
        <View style={{ gap: 15, flexDirection: "row" }}>
          <View style={styles.avatarContainer}>
            <Avatar
              uri={user?.image}
              size={hp(12)}
              rounded={theme.radius.xxl * 1.4}
            />
            {isCurrentUser && (
              <Pressable
                style={styles.editIcon}
                onPress={() => navigation.push("/(main)/editProfile")}
              >
                <Icon name={"edit"} strokeWidth={2.5} size={20} />
              </Pressable>
            )}
          </View>

          <View style={{ gap: 3, marginLeft: 5 }}>
            {user?.name && <Text style={styles.userName}>{user.name}</Text>}
            {user?.address && (
              <Text style={styles.infotext}>{user.address}</Text>
            )}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 20,
                marginTop: 10,
              }}
            >
              <View style={{ alignItems: "center" }}>
                <Text style={styles.statNumber}>{followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={{ alignItems: "center" }}>
                <Text style={styles.statNumber}>{followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
            {!isCurrentUser && (
              <Button
                title={isFollowingUser ? "Unfollow" : "Follow"}
                onPress={handleFollowToggle}
                btnStyle={{
                  height: hp(3.45),
                  width: hp(9),
                  borderRadius: theme.radius.sm,
                  marginTop: 5,
                  backgroundColor: isFollowingUser
                    ? theme.colors.rose
                    : theme.colors.primary,
                }}
                textStyle={{ fontSize: hp(1.7), color: "white" }}
              />
            )}
          </View>
        </View>
        <View style={{ gap: 10, marginTop: 20 }}>
          {user?.email && (
            <View style={styles.info}>
              <Icon name={"mail"} size={20} color={theme.colors.textLight} />
              <Text style={styles.infotext}>{user.email}</Text>
            </View>
          )}

          {user?.phoneNumber && (
            <View style={styles.info}>
              <Icon name={"call"} size={20} color={theme.colors.textLight} />
              <Text style={styles.infotext}>{user.phoneNumber}</Text>
            </View>
          )}

          {user?.bio && <Text style={styles.infotext}>{user.bio}</Text>}
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
  loginContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  statNumber: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: theme.colors.textDark,
  },
  statLabel: {
    fontSize: hp(1.7),
    color: theme.colors.textLight,
  },
});
