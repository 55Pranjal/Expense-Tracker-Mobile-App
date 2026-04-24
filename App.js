import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { ExpenseProvider } from './src/context/ExpenseContext';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ExpenseProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </ExpenseProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
