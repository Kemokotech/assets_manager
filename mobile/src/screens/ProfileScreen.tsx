import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          // Auth state polling in App.tsx will detect this and switch to Login screen
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Profile</Title>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.avatar}>
            <Title style={styles.avatarText}>{user?.name?.charAt(0)}</Title>
          </View>
          <Title style={styles.name}>{user?.name}</Title>
          <Paragraph style={styles.email}>{user?.email}</Paragraph>
          <Paragraph style={styles.role}>Role: {user?.role}</Paragraph>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#EF4444"
      >
        Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 20, paddingTop: 60, backgroundColor: 'white' },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  card: { margin: 20, alignItems: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: { color: 'white', fontSize: 32 },
  name: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  email: { textAlign: 'center', color: '#6B7280' },
  role: { textAlign: 'center', marginTop: 8, color: '#3B82F6' },
  logoutButton: { margin: 20 },
});
