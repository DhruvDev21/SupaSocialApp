import { supabase } from "@/lib/supabase";
import { User } from "../constants/type";

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
    console.log("Error fetching user data", e);
    return { success: false, msg: e };
  }
};
export const updateUser = async (userId: string, data: User) => {
  console.log('userId', userId)
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
