import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../data/AuthContext';
import AuthNavigator from './AuthNavigator';
import ClientNavigator from './ClientNavigator';
import DriverGate from './DriverGate';
import AdminScreen from '../screens/admin/AdminScreen';

export default function RootNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      {!session || !profile ? (
        <AuthNavigator />
      ) : profile.role === 'client' ? (
        <ClientNavigator />
      ) : profile.role === 'driver' ? (
        <DriverGate />
      ) : (
        <AdminScreen />
      )}
    </NavigationContainer>
  );
}
