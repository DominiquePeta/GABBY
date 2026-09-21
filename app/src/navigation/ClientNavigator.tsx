import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClientStackParamList } from './types';
import BrowseScreen from '../screens/client/BrowseScreen';
import DriverProfileScreen from '../screens/client/DriverProfileScreen';
import ConfirmScreen from '../screens/client/ConfirmScreen';
import StatusScreen from '../screens/client/StatusScreen';
import RideScreen from '../screens/client/RideScreen';
import ClientRateScreen from '../screens/client/ClientRateScreen';
import ClientDoneScreen from '../screens/client/ClientDoneScreen';
import NominationFormScreen from '../screens/shared/NominationFormScreen';

const Stack = createNativeStackNavigator<ClientStackParamList>();

export default function ClientNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Browse" component={BrowseScreen} />
      <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
      <Stack.Screen name="Confirm" component={ConfirmScreen} />
      <Stack.Screen name="Status" component={StatusScreen} />
      <Stack.Screen name="Ride" component={RideScreen} />
      <Stack.Screen name="ClientRate" component={ClientRateScreen} />
      <Stack.Screen name="ClientDone" component={ClientDoneScreen} />
      <Stack.Screen name="NominationForm" component={NominationFormScreen} />
    </Stack.Navigator>
  );
}
