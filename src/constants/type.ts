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
  email?: string;
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

export interface Address {
  id: string;
  addressName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  created_at: string;
}

 export type Product = {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  sizes?: string[];
  color?: string[];
  created_at?: string;
  description?: string;
  gender?: string;
  image_url?: string;
  additional_images:string[];
};

export interface item {
  selectedColor: any;
  selectedSize: any;
  id:string;
  category:string;
  created_at:string;
  description:string;
  gender:string;
  image_url:string;
  name:string;
  price:number;
  quantity:number;
  additional_images:string[];
  sizes?: string[];
  color?:string[];
}

export interface address {
  addressName:string;
  address:string;
  city:string;
  country:string;
  state:string;
  zip:number;
}

export type order = {
  id: any;
  address:address;
  delivery_status:string;
  delivery_date:string;
  items:item[];
  status:string;
  selectedSize:string;
  selectedColor:string;
}