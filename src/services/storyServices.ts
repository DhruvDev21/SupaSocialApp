import { supabase } from "@/lib/supabase";
import { getUserData } from "./userService";

export interface Story {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
}

export interface GroupedStories {
  [userId: string]: {
    userImage: string;
    userName: string;
    stories: { id: string; url: string; seen: boolean; userName: string }[];
  };
}
// Get stories from followed users
export async function getFollowedStories(userId: string): Promise<Story[]> {
  // First, get the list of users that the current user follows
  const { data: followingData, error: followingError } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (followingError || !followingData) {
    console.error("Error fetching followed users:", followingError);
    return [];
  }
  // Extract the IDs of followed users
  const followingIds = followingData.map((follow) => follow.following_id);
  // Include the user's own ID to see their own stories
  followingIds.push(userId);
  // If not following anyone, just return own stories
  if (followingIds.length === 0) {
    const { data, error } = await supabase
      .from("stories")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching own stories:", error);
      return [];
    }

    return data || [];
  }
  // Fetch stories from followed users and own stories
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .in("user_id", followingIds)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching stories:", error);
    return [];
  }

  return data || [];
}
// Get stories for a specific user
export async function getUserStories(
  userId: string
): Promise<{ id: string; url: string }[]> {
  const { data, error } = await supabase
    .from("stories")
    .select("id, image_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Error fetching user stories:", error);
    return [];
  }

  return data.map((story) => ({
    id: story.id,
    url: story.image_url,
  }));
}
// Check if a story has been viewed by a user
export async function hasUserSeenStory(
  storyId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("story_views")
    .select("id")
    .eq("story_id", storyId)
    .eq("user_id", userId)
    .single();

  return !error && !!data;
}

export async function markStorySeen(
  storyId: string,
  userId: string
): Promise<boolean> {
  try {
    const { data: existingView } = await supabase
      .from("story_views")
      .select("id")
      .eq("story_id", storyId)
      .eq("user_id", userId)
      .maybeSingle(); // Avoids throwing an error if no record is found
    if (existingView) {
      console.log(`Story ${storyId} already marked as seen by user ${userId}`);
      return true; // Already marked as seen
    }
    // Insert new view record
    const { error } = await supabase
      .from("story_views")
      .insert([{ story_id: storyId, user_id: userId }]);
    if (error) {
      console.error(`Error marking story ${storyId} as seen:`, error);
      return false;
    }

    console.log(
      `Successfully marked story ${storyId} as seen by user ${userId}`
    );
    return true;
  } catch (error) {
    console.error("Unexpected error in markStorySeen:", error);
    return false;
  }
}
// Create a new story
export async function createStory(
  userId: string,
  imageUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from("stories")
    .insert([{ user_id: userId, image_url: imageUrl }]);
  return !error;
}

// Process stories data with user information and seen status
export async function processStoriesWithUserData(
  stories: Story[],
  currentUserId: string
): Promise<GroupedStories> {
  // Get all story views for the current user in one query for efficiency
  const { data: allViews, error: viewsError } = await supabase
    .from("story_views")
    .select("story_id")
    .eq("user_id", currentUserId);

  if (viewsError) {
    console.error("Error fetching story views:", viewsError);
  }
  // Create a Set of seen story IDs for faster lookups
  const seenStoryIds = new Set((allViews || []).map((view) => view.story_id));

  const userDataPromises = stories.map(async (story) => {
    const userDataResponse = await getUserData(story.user_id);
    console.log(" user dtata", userDataResponse);
    // Check if this story is in the set of seen stories
    const seen = seenStoryIds.has(story.id);

    return {
      storyId: story.id,
      userId: story.user_id,
      userImage: userDataResponse.success
        ? userDataResponse.data.image
        : "https://via.placeholder.com/150",
      userName: userDataResponse.success
        ? userDataResponse.data.name
        : "unknown",
      storyUrl: story.image_url,
      seen: seen,
    };
  });

  const userDataArray = await Promise.all(userDataPromises);
  const grouped: GroupedStories = {};

  userDataArray.forEach(
    ({ userId, userImage, storyId, storyUrl, seen, userName }) => {
      if (!grouped[userId]) {
        grouped[userId] = { userImage, stories: [], userName };
      }
      grouped[userId].stories.push({
        id: storyId,
        url: storyUrl,
        seen,
        userName,
      });
    }
  );

  return grouped;
}

export const deleteExpiredStories = async () => {
  const { error } = await supabase
    .from("stories")
    .delete()
    .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // 24 hours

  if (error) {
    console.error("Error deleting expired stories:", error.message);
  } else {
    console.log("✅ Expired stories deleted after 24 hours.");
  }
};
