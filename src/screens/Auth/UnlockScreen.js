import React, { useContext, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, AppState } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

const primaryColor = '#6C63FF';

export default function UnlockScreen() {
  const { authenticate, logout } = useContext(AuthContext);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (appState.current === 'active') {
      authenticate();
    }

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        authenticate();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [authenticate]);

  return (
    <View style={styles.container}>
      <MaterialIcons name="lock-outline" size={80} color={primaryColor} style={styles.icon} />
      <Text style={styles.title}>App Locked</Text>
      <Text style={styles.subtitle}>Unlock to view your expenses and balance.</Text>

      <TouchableOpacity style={styles.button} onPress={authenticate}>
        <Text style={styles.buttonText}>Unlock Now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout instead</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: primaryColor,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 16,
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
