// App.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import { AppProvider } from './app/context/AppContext';
import { initDatabase } from './app/database/db';

// Screens
import HomeScreen from './app/Screens/HomeScreen';
import UserProfileListScreen from './app/Screens/UserProfileListScreen';
import UserProfileScreen from './app/Screens/UserProfileScreen';
import CreateProfileScreen from './app/Screens/CreateProfileScreen';
import RoomProfileScreen from './app/Screens/RoomProfileScreen';
import MaterialSelectionScreen from './app/Screens/MaterialSelectionScreen';
import MaterialListTakenScreen from './app/Screens/MaterialListTakenScreen';
import SignatureFirstScreen from './app/Screens/SignatureFirstScreen';
import SignatureReturnScreen from './app/Screens/SignatureReturnScreen';
import SettingsScreen from './app/Screens/SettingsScreen';
import AddMaterialScreen from './app/Screens/AddMaterialScreen';
import MaterialInventoryScreen from './app/Screens/MaterialInventoryScreen';
import BiometricDBScreen from './app/Screens/BiometricDBScreen';
import TransactionHistoryScreen from './app/Screens/TransactionHistoryScreen';
import IncompleteProfilesScreen from './app/Screens/IncompleteProfilesScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      await initDatabase();
      setReady(true);
    })();
  }, []);

  if (!ready) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F3' }}>
      <ActivityIndicator size="large" color="#8B0000" />
    </View>
  );

  return (
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="Home" component={HomeScreen} />
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
          <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
          <Stack.Screen name="IncompleteProfiles" component={IncompleteProfilesScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
