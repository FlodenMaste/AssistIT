import React from 'react';
import { StatusBar, LogBox } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Ignorer les warnings non critiques
LogBox.ignoreLogs([
  'Non-serializable values',
  'Sending `onAnimatedValueUpdate`',
]);

function App() {
  return (
    <AuthProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <AppNavigator />
    </AuthProvider>
  );
}

export default App;
