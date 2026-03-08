// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';

import { AppProvider } from './app/context/AppContext';
import { initDatabase } from './app/database/db';

// Screens
import HomeScreen from './app/screens/HomeScreen';
import IdentificationScreen from './app/screens/IdentificationScreen';
import UserProfileListScreen from './app/screens/UserProfileListScreen';
import UserProfileScreen from './app/screens/UserProfileScreen';
import CreateProfileScreen from './app/screens/CreateProfileScreen';
import RoomProfileScreen from './app/screens/RoomProfileScreen';
import MaterialSelectionScreen from './app/screens/MaterialSelectionScreen';
import MaterialListTakenScreen from './app/screens/MaterialListTakenScreen';
import SignatureFirstScreen from './app/screens/SignatureFirstScreen';
import SignatureReturnScreen from './app/screens/SignatureReturnScreen';
import SettingsScreen from './app/screens/SettingsScreen';
import AddMaterialScreen from './app/screens/AddMaterialScreen';
import MaterialInventoryScreen from './app/screens/MaterialInventoryScreen';
import BiometricDBScreen from './app/screens/BiometricDBScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Force landscape
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    // Init DB
    initDatabase().catch(console.error);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <NavigationContainer>
          <StatusBar hidden />
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              orientation: 'landscape',
            }}
          >
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Identification" component={IdentificationScreen} />
            <Stack.Screen name="UserProfileList" component={UserProfileListScreen} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
            <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
            <Stack.Screen name="RoomProfile" component={RoomProfileScreen} />
            <Stack.Screen name="MaterialSelection" component={MaterialSelectionScreen} />
            <Stack.Screen name="MaterialListTaken" component={MaterialListTakenScreen} />
            <Stack.Screen name="SignatureFirst" component={SignatureFirstScreen} />
            <Stack.Screen name="SignatureReturn" component={SignatureReturnScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="AddMaterial" component={AddMaterialScreen} />
            <Stack.Screen name="MaterialInventory" component={MaterialInventoryScreen} />
            <Stack.Screen name="BiometricDB" component={BiometricDBScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
