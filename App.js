// App.js
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import { AppProvider } from './app/context/AppContext';
import { initDatabase } from './app/database/db';

// Screens
import HomeScreen from './app/screens/HomeScreen';
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
import TransactionHistoryScreen from './app/screens/TransactionHistoryScreen';
import IncompleteProfilesScreen from './app/screens/IncompleteProfilesScreen';

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
