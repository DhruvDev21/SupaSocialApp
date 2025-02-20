import { supabase } from "@/lib/supabase";
import { User } from "../constants/type";

export const getAllUserData = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select()

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

// Function to check if the user is followed
export const isFollowing = async (followerId: string, followingId: string) => {
  const { data, error, status } = await supabase
    .from("follows")
    .select("*")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .single(); // This fetches a single row or null if no match is found

  if (error) {
    console.error("Error checking follow status:", error);
    return false; // Return false on error
  }

  // If no rows are found, `data` will be null. In that case, the user is not following.
  if (!data) {
    console.log(
      `No follow relationship found for ${followerId} -> ${followingId}`
    );
    return false;
  }

  return true; // Return true if there is a follow relationship
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