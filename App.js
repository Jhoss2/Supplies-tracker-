// App.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import { AppProvider } from './app/context/AppContext';
import { initDatabase } from './app/database/db';

// Écrans (Assurez-vous que le dossier s'appelle "screens" en minuscule sur GitHub)
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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <ScrollView style={eb.container} contentContainerStyle={eb.content}>
          <Text style={eb.title}>🔴 ERREUR AU DÉMARRAGE</Text>
          <Text style={eb.msg}>{this.state.error?.message || 'Erreur inconnue'}</Text>
          <Text style={eb.stack}>{this.state.error?.stack || ''}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}

const eb = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a0000' },
  content: { padding: 20, paddingTop: 60 },
  title: { color: '#FF4444', fontSize: 18, fontWeight: '900', marginBottom: 16, textAlign: 'center' },
  msg: { color: '#FFB3B3', fontSize: 14, fontWeight: '700', marginBottom: 16, backgroundColor: '#2a0000', padding: 12, borderRadius: 8 },
  stack: { color: '#888', fontSize: 11, fontFamily: 'monospace' },
});

export default function App() {
  const [ready, setReady] = useState(false);
  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const prepareApp = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        await initDatabase();
        if (isMounted) setReady(true);
      } catch (e) {
        if (isMounted) setDbError(e);
      }
    };
    prepareApp();
    return () => { isMounted = false; };
  }, []);

  if (dbError) return (
    <ScrollView style={eb.container} contentContainerStyle={eb.content}>
      <Text style={eb.title}>🔴 ERREUR BASE DE DONNÉES</Text>
      <Text style={eb.msg}>{dbError?.message || 'Erreur inconnue'}</Text>
      <Text style={eb.stack}>{dbError?.stack || ''}</Text>
    </ScrollView>
  );

  if (!ready) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#8B0000' }}>
      <ActivityIndicator size="large" color="#FFFFFF" />
      <Text style={{ color: '#FFFFFF', marginTop: 15, fontFamily: 'serif', fontWeight: 'bold' }}>Chargement du système U-AUBEN...</Text>
    </View>
  );

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
  }
                                          
