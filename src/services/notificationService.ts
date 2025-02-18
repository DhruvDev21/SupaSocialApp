import { supabase } from "@/lib/supabase";
import { Notification } from "../constants/type";

export const createNotification = async (notification:Notification) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert(notification)
      .select()
      .single();

    if (error) {
      console.error("notification  error", error);
      return { success: false, msg: "could not send the notification" };
    }
    return { success: true, data: data };
  } catch (e) {
    console.error("notification  error", e);
    return { success: false, msg: "could not send the notification" };
  }
};

export const fetchNotification = async (receiverId:string) => {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select(
        `
        *,
        sender: senderId(id, name, image)
        `
      )
      .eq("receiverId", receiverId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("error fetching notifications", error);
      return { success: false, msg: "could not fetch the notifications" };
    }
    return { sucess: true, data: data };
  } catch (e) {
    console.error("error fetching the post details", e);
    return { success: false, msg: "could not fetch your notifications" };
  }
};
