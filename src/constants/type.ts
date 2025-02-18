export type ErrorState = {
  emailError: string;
  passwordError: string;
  nameError?: string;
  logInError?: string;
};

export type User = {
  name: string;
  phoneNumber: string;
  image: string | any;
  bio: string;
  address: string;
};

export type mediaType = {
  mediaTypes: string[];
  allowsEditing: boolean;
  aspect?: number[];
  quality?: number;
};

export interface postType {
  id: string;
  userid: string;
  postLikes: any[]; // Adjust this type based on your actual like structure
  comments: { count: number }[]; // Adjust as needed
  user?: {
    id: string;
    username?: string;
    avatarUrl?: string;
  };
}

export interface PostEventPayload {
  eventType: string;
  new?: postType;
  old?: postType;
}

export interface NotificationPayload {
  eventType: string;
  new: {
    senderId: string;
    title: string;
    data: string; // This can be JSON string, so you can parse it later
  };
}

export interface Notification {
  senderId: string;
  receiverId: string;
  message: string;
  type: string;
  created_at?: string; // Optional if Supabase handles it automatically
}

export interface PostLike {
  userId: string;
  postId: string;
  created_at?: string;
}

export interface Comment {
  postId: string;
  userId: string;
  text: string;
  created_at?: string;
}
