import React, { useEffect, useState } from "react";
import { Pressable, View, StyleSheet, Modal } from "react-native";
import { useAuth } from "@/src/contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { uploadFile } from "@/src/services/imageService";
import { theme } from "@/src/constants/theme";
import Icon from "@/assets/icons";
import { supabase } from "@/lib/supabase";
import StoryViewer from "./StoryViewer";
import Avatar from "../Avatar";
import { createStory, markStorySeen } from "@/src/services/storyServices";
import { wp } from "@/src/helpers/Common";
import Cameraview from "./CameraView";

const StoryUploader = ({
  fetchStories,
  isSeen,
}: {
  fetchStories: () => void;
  isSeen: boolean;
}) => {
  const { user } = useAuth();
  const [userStories, setUserStories] = useState<{ id: any; url: any }[]>([]);
  const [isStoryVisible, setIsStoryVisible] = useState(false);
  const [unseenStories, setUnseenStories] = useState<{ id: any; url: any }[]>([]);
  const [showCamera, setShowCamera] = useState(false); // New state for camera modal

  console.log("StoryUploader isSeen:", isSeen);
  useEffect(() => {
    fetchUserStories();

    const subscription = supabase
      .channel("stories")
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "stories" },
        (payload) => {
          console.log("🗑️ User's story deleted:", payload.old.id);
          fetchUserStories();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "stories" },
        () => {
          console.log("🆕 New user story added.");
          fetchUserStories();
        }
      )
      .subscribe();

    return () => {
      console.log("🛑 Removing Supabase subscription for uploader...");
      supabase.removeChannel(subscription);
    };
  }, []);

  // New function to show camera options
  const showStoryOptions = async () => {
    // If user already has stories, just show them
    if (userStories.length > 0) {
      setIsStoryVisible(true);
      return;
    }
    
    // Otherwise show camera
    setShowCamera(true);
  };

  const fetchUserStories = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("stories")
      .select("id, image_url")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (!error && data.length > 0) {
      const stories = data.map((story) => ({
        id: story.id,
        url: story.image_url,
      }));
      setUserStories(stories);
      // For each story, check if it's in the story_views table
      await checkUnseenStories(stories);
    } else {
      setUserStories([]);
      setUnseenStories([]);
    }
  };

  const checkUnseenStories = async (stories: { id: any; url: any }[]) => {
    if (!stories.length || !user) return;

    console.log(
      "Checking unseen stories for:",
      stories.map((s) => s.id)
    );
    // Get all story views for the current user's stories
    const { data: viewsData, error } = await supabase
      .from("story_views")
      .select("story_id, user_id")
      .eq("user_id", user.id)
      .in(
        "story_id",
        stories.map((story) => story.id)
      );

    if (error) {
      console.error("Error fetching story views:", error);
      return;
    }
    // Create a set of seen story IDs for faster lookups
    const seenStoryIds = new Set(viewsData?.map((view) => view.story_id) || []);
    // Filter for unseen stories
    const unseen = stories.filter((story) => !seenStoryIds.has(story.id));
    setUnseenStories(unseen);

    console.log(
      "Unseen stories count:",
      unseen.length,
      "out of",
      stories.length
    );
  };

  const uploadStory = async (uri: string): Promise<void> => {
    if (!user) return;

    const folderPath = `stories/${user.id}`;
    const uploadResponse = await uploadFile(folderPath, uri, true);

    if (!uploadResponse) {
      console.error("Upload failed: No response received.");
      return;
    }

    if (!uploadResponse.success) {
      console.error("Upload error:", uploadResponse.msg);
      return;
    }

    const imageUrl: string = uploadResponse.data || "";
    // Use the createStory service function
    if (!user?.id) {
      console.error("User ID is undefined. Cannot create story.");
      return;
    }
    const success = await createStory(user.id, imageUrl);
    if (success) {
      await fetchUserStories(); // Refresh local stories
      fetchStories(); // Notify parent component to update
    }
  };

  // Handle image captured from camera
  const handleCameraCapture = (uri: string) => {
    setShowCamera(false);
    uploadStory(uri);
  };

  const handleStoryPress = () => {
    if (userStories.length === 0) {
      // Instead of directly picking an image, show camera
      showStoryOptions();
      return;
    }

    setIsStoryVisible(true);
  };
  
  // Mark a single story as seen using the service function
  const handleStoryChange = async (storyId: string | undefined) => {
    if (!user?.id || !storyId) return;
    // Use the service function
    const success = await markStorySeen(storyId, user.id);
    if (success) {
      // Update local state if marking was successful
      setUnseenStories((prev) => prev.filter((story) => story.id !== storyId));
    }
  };

  // Calculate border color - Fixed logic
  const borderColor =
    userStories.length === 0
      ? "transparent"
      : unseenStories.length > 0
      ? theme.colors.primary // Only primary when there are unseen stories
      : "gray";

  console.log(
    "Border color calculated:",
    borderColor,
    "Unseen stories:",
    unseenStories.length
  );

  return (
    <View style={styles.avatarWrapper}>
      <Pressable
        onPress={handleStoryPress}
        style={[styles.avatarContainer, { borderColor: borderColor }]}
      >
        <Avatar
          uri={user?.image}
          rounded={theme.radius.xxl * 2}
          style={styles.avatar}
        />
      </Pressable>
      <Pressable onPress={() => setShowCamera(true)} style={styles.plusIcon}>
        <Icon name="plus" size={15} color={theme.colors.textLight} />
      </Pressable>
      
      {/* Camera Modal */}
      {showCamera && (
        <Modal
          animationType="slide"
          transparent={false}
          visible={showCamera}
          onRequestClose={() => setShowCamera(false)}
        >
          <Cameraview 
            onCapture={handleCameraCapture}
            onClose={() => setShowCamera(false)}
          />
        </Modal>
      )}
      
      {isStoryVisible && userStories.length > 0 && (
        <StoryViewer
          user={{
            avatar: user?.image,
            userName: user?.name || "Unknown",
            stories: userStories,
          }}
          onClose={() => {
            setIsStoryVisible(false);
            fetchUserStories();
            fetchStories();
          }}
          onStoryChange={handleStoryChange}
          isLoggedIn={true}
          loggedInUserId={user?.id}
        />
      )}
    </View>
  );
};

export default StoryUploader;

const styles = StyleSheet.create({
  avatarWrapper: {
    position: "relative",
  },
  avatarContainer: {
    borderWidth: 2,
    borderRadius: theme.radius.xxl * 2,
  },
  avatar: {
    width: wp(15),
    height: wp(15),
    borderWidth: 3,
    backgroundColor: "white",
  },
  plusIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: wp(5.5),
    height: wp(5.5),
    borderRadius: 10,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    padding: wp(2.5),
    elevation: 2,
  },
});