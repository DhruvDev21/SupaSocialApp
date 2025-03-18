import { useEffect, useState, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { useAuth } from "@/src/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { hp, wp } from "@/src/helpers/Common";
import { theme } from "@/src/constants/theme";
import Icon from "@/assets/icons";
import { useRouter } from "expo-router";
import Avatar from "@/src/components/Avatar";
import { fetchPostDetails, fetchPosts } from "@/src/services/postService";
import type {
  NotificationPayload,
  PostEventPayload,
  postType,
} from "@/src/constants/type";
import PostCard from "@/src/components/PostCard";
import { FlatList } from "react-native";
import Loading from "@/src/components/loading";
import { getUserData } from "@/src/services/userService";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import React from "react";
import eventEmitter from "@/src/utils/EventEmitter";

var limit = 0;

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const registerForPushNotifications = async () => {
  if (!Constants.isDevice) {
    // alert("Must use physical device for Push Notifications");
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    if (newStatus !== "granted") {
      alert("Failed to get push token for push notifications!");
      return;
    }
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Expo Push Token:", token);

  return token;
};

const Home = () => {
  const navigation = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<postType[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const handlePostEvent = async (payload: PostEventPayload | any) => {
    console.log("🚀 Post event received:", payload);

    if (payload.eventType === "INSERT" && payload?.new?.id) {
      setPosts((prevPost) => [payload.new, ...prevPost]);
    }

    if (payload.eventType === "DELETE" && payload?.old?.id) {
      setPosts((prevPost) =>
        prevPost.filter((post) => post.id !== payload.old.id)
      );
    }

    if (payload.eventType === "UPDATE" && payload?.new?.id) {
      const { data: updatedPost } = await fetchPostDetails(payload.new.id);
      if (updatedPost) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === updatedPost.id ? updatedPost : post
          )
        );
      }
    }
  };

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) setExpoPushToken(token);
    });

    // Handle notification received while the app is open (Foreground)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("New notification received:", notification);
      });

    // Handle notification click event (When user taps on the notification)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("User tapped the notification:", response);
        console.log(
          "Complete notification data:",
          JSON.stringify(response.notification.request.content.data, null, 2)
        );

        // Check if the user tapped on the notification and if postId is present
        const postId = response.notification.request.content.data?.postId;
        console.log("Extracted postId:", postId);

        if (postId && postId !== "undefined") {
          // Add a small delay to ensure navigation stability
          setTimeout(() => {
            console.log("Navigating to post details with postId:", postId);
            navigation.push({
              pathname: "/(main)/postDetails",
              params: { postId }, // Pass postId as a parameter
            });
          }, 100);
        } else {
          console.log(
            "No valid postId found in the notification data - won't navigate"
          );
        }
      });

    const postChannel = supabase
      .channel("posts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        handlePostEvent
      )
      .subscribe();

    const notificationChannel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `receiverId=eq.${user?.id}`,
        },
        handleNewNotification
      )
      .subscribe();

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
      supabase.removeChannel(postChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [user?.id]);

  useEffect(() => {
    const handlePostLikeChange = ({
      postId,
      likes,
    }: {
      postId: string;
      likes: any;
    }) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, postLikes: likes } : post
        )
      );
    };
    eventEmitter.on("postLikeChanged", handlePostLikeChange);

    return () => {
      eventEmitter.off("postLikeChanged", handlePostLikeChange);
    };
  }, []);

  const handleNewNotification = async (payload: NotificationPayload) => {
    console.log("You just received a new notification", payload);

    if (payload.eventType === "INSERT" && payload.new) {
      setNotificationCount((prev) => prev + 1);
      const { senderId, title, data } = payload.new;

      let notificationData;
      try {
        notificationData = JSON.parse(data);
        console.log("Parsed notification data:", notificationData);

        // Validate postId before using it
        if (!notificationData.postId) {
          console.error("Missing postId in notification data");
        }
      } catch (error) {
        console.error("Error parsing notification data:", error);
        notificationData = {};
      }

      getUserData(senderId).then((senderData) => {
        const senderName = senderData?.data?.username || "Someone";

        // Only schedule notification if postId exists and is valid
        if (
          notificationData.postId &&
          notificationData.postId !== "undefined"
        ) {
          Notifications.scheduleNotificationAsync({
            content: {
              title: "LinkUp",
              body: `${senderName} ${title}`,
              data: { postId: notificationData.postId },
            },
            trigger: null, // Show immediately
          });
        } else {
          console.error(
            "Not scheduling notification - missing or invalid postId"
          );
        }
      });
    }
  };

  const getPosts = async () => {
    if (!hasMore) return null;
    limit = limit + 10;
    const res = await fetchPosts(limit);

    if (res && res.data) {
      if (posts.length === res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  };

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>SupaSocial</Text>
          <View style={styles.icons}>
            <Pressable
              onPress={() => {
                setNotificationCount(0);
                navigation.push("/(main)/notification");
              }}
            >
              <Icon
                name={"heart"}
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
              {notificationCount > 0 && (
                <View style={styles.pill}>
                  <Text style={styles.pillText}>{notificationCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable onPress={() => navigation.push("/(main)/newPost")}>
              <Icon
                name={"plus"}
                size={hp(3.2)}
                strokeWidth={2}
                color={theme.colors.text}
              />
            </Pressable>
            <Pressable onPress={() => navigation.push("/(main)/profile")}>
              <Avatar
                uri={user?.image}
                size={hp(4.3)}
                rounded={theme.radius.sm}
                style={{ borderWidth: 2 }}
              />
            </Pressable>
          </View>
        </View>
        <FlatList
          data={posts}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listsStyle}
          renderItem={({ item }) => (
            <PostCard item={item} currentUser={user} navigation={navigation} />
          )}
          onEndReached={getPosts}
          ListFooterComponent={
            hasMore ? (
              <View style={{ marginVertical: posts.length == 0 ? 300 : 15 }}>
                <Loading />
              </View>
            ) : (
              <View style={{ marginTop: 10, marginBottom: 20 }}>
                <Text style={styles.noPosts}>No more posts</Text>
              </View>
            )
          }
        />
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: theme.colors.gray,
    paddingHorizontal: wp(4),
    paddingBottom: wp(2),
  },
  title: {
    color: theme.colors.text,
    fontSize: hp(3.2),
    fontWeight: theme.fonts.bold,
  },
  icons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
  },
  listsStyle: {
    paddingTop: wp(4),
    paddingHorizontal: wp(4),
  },
  noPosts: {
    fontSize: hp(2),
    textAlign: "center",
    color: theme.colors.text,
  },
  pill: {
    position: "absolute",
    right: -10,
    top: -4,
    height: hp(2.2),
    width: hp(2.2),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: theme.colors.roseLight,
  },
  pillText: {
    color: "white",
    fontSize: hp(1.2),
    fontWeight: theme.fonts.bold,
  },
});
