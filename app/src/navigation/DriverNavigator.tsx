import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DriverStackParamList } from './types';
import DashboardScreen from '../screens/driver/DashboardScreen';
import DriverRideScreen from '../screens/driver/DriverRideScreen';
import DriverRateScreen from '../screens/driver/DriverRateScreen';
import NominationFormScreen from '../screens/shared/NominationFormScreen';

const Stack = createNativeStackNavigator<DriverStackParamList>();

export default function DriverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="DriverRide" component={DriverRideScreen} />
      <Stack.Screen name="DriverRate" component={DriverRateScreen} />
      <Stack.Screen name="NominationForm" component={NominationFormScreen} />
    </Stack.Navigator>
  );
}
