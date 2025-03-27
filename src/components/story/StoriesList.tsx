import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { getFollowedStories } from "@/src/services/userService";
import { useAuth } from "@/src/contexts/AuthContext";
import { theme } from "@/src/constants/theme";
import StoryUploader from "./StoryUploader";
import StoryViewer from "./StoryViewer";
import Avatar from "../Avatar";
import { wp } from "@/src/helpers/Common";
import {
  deleteExpiredStories,
  markStorySeen,
  processStoriesWithUserData,
} from "@/src/services/storyServices";
import { supabase } from "@/lib/supabase";

const StoriesList = () => {
  const { user } = useAuth();
  interface GroupedStories {
    [userId: string]: {
      userImage: string;
      userName: string; // Added userName property
      stories: { id: string; url: string; seen: boolean }[];
    };
  }

  const [groupedStories, setGroupedStories] = useState<GroupedStories>({});
  const [selectedUserStories, setSelectedUserStories] = useState<{
    userId: string;
    userName?: string;
    avatar?: string;
    stories: Array<{ id: string; url: string }>;
  }>({ userId: "", stories: [] });
  const [uploaderSeen, setUploaderSeen] = useState(false);

  const fetchStories = async () => {
    if (!user?.id) return;

    console.log("🔄 Fetching updated stories...");
    const stories = await getFollowedStories(user.id);

    if (!stories || stories.length === 0) {
      console.log("🚨 No stories found, clearing state...");
      setGroupedStories({});
      setUploaderSeen(false); // Reset uploader state
      return;
    }

    const grouped = await processStoriesWithUserData(stories, user.id);
    console.log("✅ Updated grouped stories:", grouped);

    setGroupedStories((prev) => {
      if (JSON.stringify(prev) !== JSON.stringify(grouped)) {
        console.log("🔄 Updating state with new stories...");
        return grouped;
      }
      console.log("⚠️ No change detected, state remains the same.");
      return prev;
    });

    // ✅ Ensure StoryUploader refreshes
    if (grouped[user.id]) {
      const hasSeenOwnStories = grouped[user.id].stories.every(
        (story) => story.seen
      );
      console.log(`👀 StoryUploader isSeen updated: ${hasSeenOwnStories}`);
      setUploaderSeen(hasSeenOwnStories);
    } else {
      setUploaderSeen(false); // Ensure it resets when stories are gone
    }
  };

  const handleStoryPress = (userId: string) => {
    const userData = groupedStories[userId];
    console.log("th user data", userData);

    if (!userData) {
      console.log("No user data found for:", userId);
      return;
    }

    console.log("User Data Before Setting:", userData);

    setSelectedUserStories({
      userId,
      userName: userData.userName ?? "Unknown", // Ensure name is present
      avatar: userData.userImage,
      stories: userData.stories.map((story) => ({
        id: story.id,
        url: story.url,
      })),
    });
  };

  const handleStoryChange = async (storyId: string | undefined) => {
    if (!user?.id || !storyId) return;

    const success = await markStorySeen(storyId, user.id);
    if (success) {
      setGroupedStories((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((userId) => {
          const storyIndex = updated[userId].stories.findIndex(
            (s) => s.id === storyId
          );
          if (storyIndex !== -1) {
            updated[userId].stories[storyIndex].seen = true;
          }
        });
        return updated;
      });
    }

    await fetchStories(); // Ensure stories are refreshed
  };

  useEffect(() => {
    fetchStories(); // Load stories initially

    const interval = setInterval(() => {
      console.log("🕒 Running deleteExpiredStories...");
      deleteExpiredStories().then(fetchStories); // Refresh after deletion
    }, 60 * 1000); // Runs every 1 min

    const subscription = supabase
      .channel("stories")
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "stories" },
        (payload) => {
          console.log("🗑️ Story deleted:", payload.old.id);
          fetchStories(); // Refresh UI and uploader
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "stories" },
        (payload) => {
          console.log("🆕 New story added:", payload.new.id);
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      console.log("🛑 Removing Supabase subscription...");
      supabase.removeChannel(subscription);
      clearInterval(interval);
    };
  }, []);

  return (
    <View>
      <FlatList
        data={Object.entries(groupedStories)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          gap: wp(2),
          paddingTop: wp(2),
          paddingBottom: wp(3),
        }}
        keyExtractor={([userId]) => userId}
        renderItem={({ item }) => {
          const [userId, { userImage, stories }] = item;
          const isSeen = stories.every((story) => story.seen); // Check if ALL stories are seen

          return (
            <Pressable
              onPress={() => handleStoryPress(userId)}
              style={[
                styles.avatarContainer,
                { borderColor: isSeen ? "gray" : theme.colors.primary },
              ]}
            >
              <Avatar
                uri={userImage}
                rounded={theme.radius.xxl * 2}
                style={styles.story}
              />
            </Pressable>
          );
        }}
        ListHeaderComponent={
          <StoryUploader fetchStories={fetchStories} isSeen={uploaderSeen} />
        }
      />

      {selectedUserStories.stories.length > 0 && (
        <StoryViewer
          user={selectedUserStories}
          onClose={() => {
            setSelectedUserStories({ userId: "", stories: [] });
            fetchStories(); // Refresh stories when viewer is closed
          }}
          onStoryChange={handleStoryChange}
        />
      )}
    </View>
  );
};

export default StoriesList;

const styles = StyleSheet.create({
  avatarContainer: {
    borderWidth: 2,
    borderRadius: theme.radius.xxl * 2,
  },
  story: {
    width: wp(15),
    height: wp(15),
    borderWidth: 3,
    borderColor: "white",
  },
});
