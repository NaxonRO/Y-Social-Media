import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { PostsProvider } from './src/context/PostsContext';
import { FollowProvider } from './src/context/FollowContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <FollowProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </FollowProvider>
      </PostsProvider>
    </AuthProvider>
  );
}
