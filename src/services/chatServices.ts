import { supabase } from "@/lib/supabase";
import { createNotification, NotificationPayload, sendPushNotification } from "./notificationService";

// Define message type
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  created_at: string;
}

// Generate a consistent chat ID based on user IDs
const getChatId = (user1: string, user2: string): string => {
  return [user1, user2].sort().join("_"); // Ensures consistency
};

// Fetch messages for a specific chat
export const fetchMessages = async (loggedUserId: string, chatUserId: string): Promise<Message[]> => {
  const chatId = getChatId(loggedUserId, chatUserId);

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ Error fetching messages:", error);
    return [];
  }

  return data as Message[];
};

// Send a message
export const sendMessage = async (senderId: string, receiverId: string, text: string): Promise<Message | null> => {
  const chatId = getChatId(senderId, receiverId);

  // Fetch receiver's Expo push token
  const { data: receiver, error: receiverError } = await supabase
    .from("users")
    .select("expopushtoken")
    .eq("id", receiverId)
    .single();

  if (receiverError || !receiver?.expopushtoken) {
    console.error("❌ Error fetching receiver push token:", receiverError);
  }

  // Fetch sender's name
  const { data: sender, error: senderError } = await supabase
  .from("users")
  .select("name")
  .eq("id", senderId)
  .single();

if (senderError || !sender?.name) {
  console.error("❌ Error fetching sender name:", senderError);
}

  const { data, error } = await supabase
    .from("messages")
    .insert([{ sender_id: senderId, receiver_id: receiverId, chat_id: chatId, text, seen: false }])
    .select("*");

  if (error) {
    console.error("❌ Supabase Insert Error:", error);
    return null;
  }

  // Send push notification if the token exists
  if (receiver?.expopushtoken && sender?.name) {
    // const notificationMessage = `${sender.name}\nsent you a message:\n${text}`;
    // await sendPushNotification(receiver.expopushtoken,notificationMessage);
    let notify: NotificationPayload = {
      senderId: senderId,
      receiverId: receiverId,
      title: `${sender.name}`,
      message: `${text}`,
      data: JSON.stringify({ text }),
      type: "chat",
    };
    createNotification(notify);
  }
  

  return data ? (data[0] as Message) : null;
};

// Subscribe to real-time messages
export const subscribeToMessages = (
  loggedUserId: string,
  chatUserId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) => {
  console.log("🔄 Subscribing to messages...");
  const chatId = getChatId(loggedUserId, chatUserId);

  const subscription = supabase
    .channel(`chat_${chatId}`)
    .on<Message>(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${chatId}`, // Filter at source
      },
      (payload) => {
        console.log("📩 New message received:", payload.new);
        setMessages((prevMessages) => [payload.new, ...prevMessages]);
      }
    )
    .subscribe();

  return subscription;
};

export const fetchChatUsers = async (loggedUserId: string) => {
  try {
    // Fetch latest message per chat
    const { data: latestMessages, error: msgError } = await supabase
      .from("messages")
      .select("id, sender_id, receiver_id, text, created_at, chat_id")
      .or(`sender_id.eq.${loggedUserId},receiver_id.eq.${loggedUserId}`)
      .order("created_at", { ascending: false });

    if (msgError) throw new Error("Error fetching chat messages: " + msgError.message);

    // Extract unique user IDs and their corresponding chat_id
    const uniqueChats = new Map<string, { chat_id: string; lastMessage: string }>();

    latestMessages.forEach((msg) => {
      const otherUserId =
        msg.sender_id === loggedUserId ? msg.receiver_id : msg.sender_id;

      if (!uniqueChats.has(otherUserId)) {
        uniqueChats.set(otherUserId, {
          chat_id: msg.chat_id,
          lastMessage: msg.text || "Start a conversation",
        });
      }
    });

    if (uniqueChats.size === 0) return [];

    // Fetch user details for chat participants
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id, name, image, email, bio, address")
      .in("id", Array.from(uniqueChats.keys()));

    if (userError) throw new Error("Error fetching user details: " + userError.message);

    // Attach chat_id and last message to user data
    const usersWithChatData = users.map((user) => ({
      ...user,
      chat_id: uniqueChats.get(user.id)?.chat_id || "",
      lastMessage: uniqueChats.get(user.id)?.lastMessage || "Start a conversation",
    }));

    return usersWithChatData;
  } catch (error) {
    console.error("❌ fetchChatUsers Error: ", error);
    return [];
  }
};


// Subscribe to new messages and trigger update
export const subscribeToNewMessages = (
  loggedUserId: string,
  refreshChatList: () => void
) => {
  console.log("🔄 Subscribing to new chat messages...");

  const subscription = supabase
    .channel(`user_chats_${loggedUserId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `sender_id=eq.${loggedUserId},receiver_id=eq.${loggedUserId}`,
      },
      () => {
        console.log("📩 New chat message detected, updating chat list...");
        refreshChatList(); // Re-fetch the chat list
      }
    )
    .subscribe();

  return subscription;
};


// Unsubscribe from messages
export const unsubscribeFromMessages = (subscription: any) => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
};

export const getUnseenMessagesCount = async (userId: string, chatId: string) => {
  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("receiver_id", userId)
    .eq("chat_id", chatId)
    .eq("seen", false);

  if (error) {
    console.error("❌ Error fetching unseen messages count:", error);
    return 0;
  }

  console.log(`📩 Unseen messages count for chat ${chatId}:`, count);
  return count || 0;
};
export const markMessagesAsSeen = async (userId: string, chatId: string) => {
  await supabase
    .from("messages")
    .update({ seen: true })
    .eq("receiver_id", userId)
    .eq("chat_id", chatId)
    .eq("seen", false);
};

