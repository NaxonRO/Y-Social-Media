import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { PostsProvider } from './src/context/PostsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <PostsProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </PostsProvider>
    </AuthProvider>
  );
}
