import { supabase } from "@/lib/supabase";
import { User } from "../constants/type";

export const getAllUserData = async () => {
  try {
    const { data, error } = await supabase.from("users").select();

    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, data };
  } catch (e) {
    console.log("Error fetching user data", e);
    return { success: false, msg: e };
  }
};
export const getUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", userId)
      .single();

    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, data };
  } catch (e) {
    console.log("Error fetching all user data", e);
    return { success: false, msg: e };
  }
};
export const updateUser = async (userId: string, data: User) => {
  console.log("userId", userId);
  try {
    const { error } = await supabase
      .from("users")
      .update(data)
      .eq("id", userId);

    if (error) {
      return { success: false, msg: error.message };
    }
    return { success: true, data };
  } catch (e) {
    console.log("Error fetching user data", e);
    return { success: false, msg: e };
  }
};

export const followUser = async (followerId: string, followingId: string) => {
  try {
    const { error } = await supabase
      .from("follows")
      .insert([{ follower_id: followerId, following_id: followingId }]);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error following user:", error);
    return { success: false, msg: error };
  }
};

// Function to unfollow a user
export const unfollowUser = async (followerId: string, followingId: string) => {
  try {
    const { error } = await supabase
      .from("follows")
      .delete()
      .match({ follower_id: followerId, following_id: followingId });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return { success: false, msg: error };
  }
};

export const isFollowing = async (followerId: string, followingId: string) => {
  try {
    const { data, error } = await supabase
      .from("follows")
      .select("*")
      .eq("follower_id", followerId)
      .eq("following_id", followingId)
      .maybeSingle(); // <-- Use maybeSingle() instead of single()

    if (error) throw error;
    return !!data; // Returns true if following, false otherwise
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
};


export const getFollowCounts = async (userId: string) => {
  const { count: followersCount } = await supabase
    .from("follows")
    .select("*", { count: "exact" })
    .eq("following_id", userId);

  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact" })
    .eq("follower_id", userId);

  return {
    followers: followersCount ?? 0,
    following: followingCount ?? 0,
  };
};

export const getFollowedUsers = async (userId: string) => {
  try {
    const { data: followedUsers, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    if (error) {
      return { success: false, msg: error.message };
    }

    if (!followedUsers.length) {
      return { success: true, data: [] }; // Return empty if no users are followed
    }

    const followedUserIds = followedUsers.map((f) => f.following_id);

    const { data: users, error: usersError } = await supabase
      .from("users")
      .select()
      .in("id", followedUserIds);

    if (usersError) {
      return { success: false, msg: usersError.message };
    }

    return { success: true, data: users };
  } catch (e) {
    console.log("Error fetching followed users", e);
    return { success: false, msg: e };
  }
};

export const getFollowedStories = async (loggedInUserId: string) => {
  try {
    // Step 1: Get the list of users the logged-in user follows
    let { data: followedUsers, error: followError } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", loggedInUserId);

    if (followError) throw followError;

    // Extract just the list of followed user IDs
    const followedUserIds = followedUsers ? followedUsers.map((user) => user.following_id) : [];

    if (followedUserIds.length === 0) {
      return []; // No followed users, so no stories to show
    }

    // Step 2: Get stories only from followed users
    let { data: stories, error: storyError } = await supabase
      .from("stories")
      .select("*")
      .in("user_id", followedUserIds)
      .order("created_at", { ascending: true });

    if (storyError) throw storyError;

    return stories;
  } catch (error) {
    console.error("Error fetching followed stories:", error);
    return [];
  }
};
