import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { fetch } from '@tensorflow/tfjs-react-native';
import { Camera } from 'expo-camera';

export default function App() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);                                           
  const [model, setModel] = useState(null);                                   
  const [predictions, setPredictions] = useState(null);
  const [cameraRef, setCameraRef] = useState(null);

  useEffect(() => {
    async function prepare() {
      await tf.ready();
      setIsTfReady(true);
      await loadModel();
    }
    prepare();
  }, []);

  async function loadModel() {
    await fetch('./model.json');
    const model = await mobilenet.load();
    setModel(model);
    setIsModelReady(true);
  }

  async function predict(imageData) {
    const imageTensor = tf.browser.fromPixels(imageData, 3)
      .resizeNearestNeighbor([224, 224])
      .toFloat()
      .expandDims();
    const predictions = await model.classify(imageTensor);
    setPredictions(predictions);
  }

  async function takePicture() {
    if (cameraRef) {
      const imageData = await cameraRef.takePictureAsync({ quality: 1, base64: true });
      await predict(imageData.base64);
    }
  }

  async function selectImage() {
    const { cancelled, base64 } = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!cancelled) {
      await predict(base64);
    }
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={ref => setCameraRef(ref)}
        style={styles.camera}
        type={Camera.Constants.Type.back}
      />
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Text style={styles.buttonText}>Take Picture</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={selectImage}>
          <Text style={styles.buttonText}>Select Image</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.predictionContainer}>
        {predictions && predictions.length > 0 &&
          <>
            <Text style={styles.text}>Prediction: {predictions[0].className}</Text>
            <Text style={styles.text}>Probability: {predictions[0].probability.toFixed(2)}</Text>
          </>
        }
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    height: '100%',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    paddingVertical: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems:'center'
    , justifiqueContent: 'center',
},
buttonText: { color: '#fff', 
fontWeight: 'bold', textAlign: 'center', }, predictContainer: { position: 'absolute', top: 20, }, text: { color: '#fff', fontSize: 18, }, });