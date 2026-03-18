import React from 'react';
import { StatusBar } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * AgentForge Mobile App
 * v2.2.0 - 企业级移动端管理
 */
export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <AppNavigator />
    </>
  );
}
