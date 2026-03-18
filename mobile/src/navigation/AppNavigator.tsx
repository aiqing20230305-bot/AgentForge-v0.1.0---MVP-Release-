import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AgentListScreen } from '../screens/AgentListScreen';
import { AgentDetailScreen } from '../screens/AgentDetailScreen';
import { AgentCreateScreen } from '../screens/AgentCreateScreen';

/**
 * Main App Navigator
 * v2.2.0 - 移动端路由配置
 */

export type RootStackParamList = {
  AgentList: undefined;
  AgentDetail: { agentId: string };
  AgentCreate: undefined;
  AgentEdit: { agentId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AgentList"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6366f1',
          },
          headerTintColor: '#ffffff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="AgentList"
          component={AgentListScreen}
          options={{
            title: 'AgentForge',
            headerLargeTitle: true,
          }}
        />

        <Stack.Screen
          name="AgentDetail"
          component={AgentDetailScreen}
          options={{
            title: 'Agent Details',
          }}
        />

        <Stack.Screen
          name="AgentCreate"
          component={AgentCreateScreen}
          options={{
            title: 'Create Agent',
            presentation: 'modal',
          }}
        />

        <Stack.Screen
          name="AgentEdit"
          component={AgentCreateScreen}
          options={{
            title: 'Edit Agent',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
