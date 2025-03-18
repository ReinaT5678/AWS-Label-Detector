import React, { useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://localhost:5000/api/process-image';

const ImageUploader = () => {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pickImage = async () => {
    // allow user to pick an image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setProcessedImage(null);
      setLabels([]);
      setError(null);
    }
  };

  // process image
  const processImage = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      // Get base64 data from the image
      const base64Image = await fetch(image)
        .then(response => response.blob())
        .then(blob => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        });

      // send informatino to backend using POST req
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      const data = await response.json();
      // set image if successful
      if (data.success) {
        setLabels(data.results.labels);
        setProcessedImage(`data:image/png;base64,${data.results.visualization}`);
      } else {
        setError(data.error || 'Failed to process image');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Image Label Detector</Text>
      
      <View style={styles.buttonContainer}>
        <Button title="Pick an image" onPress={pickImage} />
        {image && <Button title="Process Image" onPress={processImage} disabled={loading} />}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Processing image...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {image && !processedImage && (
        <View style={styles.imageContainer}>
          <Text style={styles.subtitle}>Selected Image:</Text>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      )}

      {labels.length > 0 && (
        <View style={styles.labelsContainer}>
          <Text style={styles.subtitle}>Detected Labels:</Text>
          {labels.map((label, index) => (
            <View key={index} style={styles.labelItem}>
              <Text style={styles.labelName}>{label.name}</Text>
              <Text style={styles.labelConfidence}>
                Confidence: {label.confidence.toFixed(2)}%
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  labelsContainer: {
    marginBottom: 20,
  },
  labelItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  labelName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  labelConfidence: {
    fontSize: 14,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#ffeeee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  errorText: {
    color: 'red',
  },
});

export default ImageUploader;