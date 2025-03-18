import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import ImageUploader from './components/ImageUploader';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ImageUploader />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});