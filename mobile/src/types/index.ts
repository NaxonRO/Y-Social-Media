export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PostAuthor {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  is_verified: boolean;
}

export interface Post {
  id: string;
  user_id: string;
  author: PostAuthor;
  content: string;
  media_url: string | null;
  media_type: 'image' | 'gif' | 'video' | null;
  like_count: number;
  comment_count: number;
  repost_count: number;
  liked_by_me: boolean;
  reposted_by_me: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  author: PostAuthor;
  content: string;
  like_count: number;
  created_at: string;
}

export interface MockProfile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
}

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export interface AppNotification {
  id: string;
  type: 'like' | 'comment' | 'repost' | 'message' | 'follow';
  actor: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
  post_id: string | null;
  post_preview: string | null;
  conversation_id: string | null;
  message_preview: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  other_user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
    is_verified: boolean;
  };
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export type MainStackParamList = {
  MainTabs: undefined;
  PostDetail: { postId: string; post?: Post };
  EditProfile: undefined;
  Conversation: { conversationId: string; otherUsername: string };
};

export type MainTabParamList = {
  Feed: undefined;
  Search: undefined;
  Compose: undefined;
  Notifications: undefined;
  Profile: undefined;
};
