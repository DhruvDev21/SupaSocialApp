import Icon from "@/assets/icons";
import { supabase } from "@/lib/supabase";
import { theme } from "@/src/constants/theme";
import { wp } from "@/src/helpers/Common";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Image,
  StyleSheet,
  Pressable,
  View,
  Dimensions,
  Text,
  FlatList,
} from "react-native";

interface StoryViewerProps {
  user: any;
  onClose: () => void;
  onStoryChange?: (storyId: string | undefined) => void;
  isLoggedIn?: boolean;
  loggedInUserId?: string;
}

const StoryViewer: React.FC<StoryViewerProps> = ({
  user,
  onClose,
  onStoryChange,
  isLoggedIn = false,
  loggedInUserId = "",
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [viewers, setViewers] = useState<any[]>([]);
  const [showViewers, setShowViewers] = useState(false);
  const storyDuration = 50000; // 5 seconds per story

  useEffect(() => {
    if (!user?.stories?.length) {
      onClose();
      return;
    }
    setCurrentIndex(0);
    setProgress(0);
  }, [user?.stories?.length]);

  useEffect(() => {
    if (currentIndex >= user?.stories?.length) {
      onClose();
      return;
    }
    const currentStory = user?.stories[currentIndex];
    if (onStoryChange && currentStory.id) {
      onStoryChange(currentStory.id);
    }
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => prev + 1);
    }, storyDuration / 100);

    const timeout = setTimeout(() => {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }, storyDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentIndex]);

  if (!user?.stories?.length || currentIndex >= user?.stories?.length)
    return null;

  const handleTapLeft = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTapRight = () => {
    if (currentIndex < user.stories.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onClose();
    }
  };
  const fetchViewers = async () => {
    const storyId = user.stories[currentIndex].id;
    if (!storyId) return;

    const { data: views, error: viewsError } = await supabase
      .from("story_views")
      .select("user_id")
      .eq("story_id", storyId);

    if (viewsError) {
      console.error("Error fetching story viewers:", viewsError.message);
      return;
    }

    if (!views || views.length === 0) {
      setViewers([]);
      setShowViewers(true);
      return;
    }

    const userIds = views.map((view) => view.user_id);

    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, name, image")
      .in("id", userIds);

    if (usersError) {
      console.error("Error fetching user details:", usersError.message);
      return;
    }

    // Exclude the logged-in user from the viewers list
    const filteredViewers = usersData.filter(
      (viewer) => viewer.id !== loggedInUserId
    );

    setViewers(filteredViewers);
    setShowViewers(true);
  };

  const { width } = Dimensions.get("window");
  const halfWidth = width / 2;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.container}>
        <View style={styles.userInfo}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <Text style={styles.userName}>{user.userName}</Text>
          </View>
          <Pressable onPress={onClose}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.progressContainer}>
          {user.stories.map((_: any, index: number) => (
            <View key={index} style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width:
                      index === currentIndex
                        ? `${progress}%`
                        : index < currentIndex
                        ? "100%"
                        : "0%",
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <Image
          source={{ uri: user.stories[currentIndex].url }}
          style={styles.storyImage}
          resizeMode="contain"
        />

        <View style={styles.eyeContainer}>
          {isLoggedIn && (
            <Pressable onPress={fetchViewers}>
              <Icon name={"eye"} color={"white"} size={24} />
            </Pressable>
          )}
        </View>

        <Pressable
          style={[styles.touchArea, { left: 0, width: halfWidth }]}
          onPress={handleTapLeft}
        />
        <Pressable
          style={[styles.touchArea, { right: 0, width: halfWidth }]}
          onPress={handleTapRight}
        />

        <Modal visible={showViewers} transparent animationType="slide">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowViewers(false)} // Close modal when tapping outside
          >
            <View style={styles.viewersModal}>
              <View style={styles.headerContainer}>
                <Text style={styles.viewersTitle}>Story Viewers</Text>
                <Pressable onPress={() => setShowViewers(false)}>
                  <Text
                    style={[styles.closeText, { color: theme.colors.text }]}
                  >
                    ✕
                  </Text>
                </Pressable>
              </View>
              {viewers.length > 0 ? (
                <FlatList
                  data={viewers}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.viewerItem}>
                      <Image
                        source={{ uri: item.image }}
                        style={styles.viewerAvatar}
                      />
                      <Text style={styles.viewerName}>{item.name}</Text>
                    </View>
                  )}
                />
              ) : (
                <Text style={styles.noViewersText}>No viewers yet.</Text>
              )}
            </View>
          </Pressable>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wp(3),
    paddingVertical: wp(3),
  },
  avatar: {
    width: wp(8),
    height: wp(8),
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "white",
  },
  userName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  progressContainer: {
    paddingHorizontal: wp(2),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressBarBackground: {
    flex: 1,
    height: wp(0.5),
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginHorizontal: wp(0.5),
    borderRadius: 1,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
  },
  storyImage: {
    width: "100%",
    height: "100%",
    flex: 1,
  },
  eyeContainer: {
    zIndex: 99,
    marginHorizontal: wp(3),
    paddingBottom: wp(2),
  },
  touchArea: {
    position: "absolute",
    top: 0,
    bottom: 0,
    zIndex: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Align modal at the bottom
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Dim background
  },
  viewersModal: {
    width: "100%",
    height: "50%", // Limit to half screen
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: wp(4),
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewersTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  viewerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: wp(2),
  },
  viewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  viewerName: {
    color: theme.colors.text,
    fontSize: 16,
  },
  closeText: {
    color: "white",
    fontSize: 18,
  },
  noViewersText: {
    color: "gray",
    fontSize: 16,
  },
});

export default StoryViewer;
