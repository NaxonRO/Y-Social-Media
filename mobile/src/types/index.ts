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

export type MainStackParamList = {
  MainTabs: undefined;
  PostDetail: { postId: string };
  EditProfile: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Search: undefined;
  Compose: undefined;
  Notifications: undefined;
  Profile: undefined;
};
