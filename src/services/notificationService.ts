import { supabase } from "@/lib/supabase";
// import { Notification } from "../constants/type";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export interface NotificationPayload {
  senderId: string;
  receiverId: string;
  title: string;
  message: string;
  data: string;
  type: string;
}


export const createNotification = async (notification: NotificationPayload) => {
  try {
    // Fetch receiver's push token
    const { data: user, error } = await supabase
      .from("users")
      .select("expopushtoken")
      .eq("id", notification.receiverId)
      .single();

    if (error || !user?.expopushtoken) {
      console.error("Error fetching receiver push token:", error);
      return { success: false, msg: "User push token not found." };
    }

    // Insert notification into Supabase
    await supabase.from("notifications").insert(notification).single();

    // Send push notification
    await sendPushNotification(
      user.expopushtoken,
      notification.title,
      notification.message,
      notification.data
    );

    return { success: true };
  } catch (e) {
    console.error("Notification error:", e);
    return { success: false, msg: "Could not send notification." };
  }
};


export const sendPushNotification = async (expoPushToken: string, title: string, message: string, data: any) => {
  try {
    await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title,
        body: message,
        data,
      }),
    });
  } catch (error) {
    console.error("Error sending push notification:", error);
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

const updatePushToken = async (userId: string, expoPushToken: string) => {
  const { error } = await supabase
    .from("users")
    .update({ expopushtoken: expoPushToken }) // Match column name
    .eq("id", userId);

  if (error) {
    console.error("Error updating push token:", error.message);
  } else {
    console.log("Push token updated successfully");
  }
};
export const registerForPushNotifications = async (userId: string): Promise<void> => {
  if (!Device.isDevice) {
    alert("Push notifications are not supported on simulators.");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    alert("Failed to get push notification permissions!");
    return;
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync();
    if (token) {
      await updatePushToken(userId, token);
      console.log("Push token saved:", token);
    }
  } catch (error) {
    console.error("Error fetching push token:", error);
  }
};
