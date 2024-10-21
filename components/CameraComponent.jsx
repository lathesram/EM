import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

const CameraComponent = ({ onPhotoTaken }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [camera, setCamera] = useState(null);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    (async () => {
      const permission = await Camera.requestCameraPermissionsAsync();
      // setHasPermission(permission.granted);
      // console.log(permission.granted);
    })();
  }, []);

  const takePhoto = async () => {
    if (camera) {
      const photoData = await camera.takePictureAsync();
      setPhoto(photoData.uri);
      onPhotoTaken(photoData.uri);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <Camera ref={(ref) => setCamera(ref)} style={styles.camera} />
      <Button title="Take Photo" onPress={takePhoto} />
      {photo && <Image source={{ uri: photo }} style={styles.photo} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  photo: { width: 100, height: 100, margin: 10 },
});

export default CameraComponent;
