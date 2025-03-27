import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import {
  Camera,
  type CameraType,
  CameraView,
  type FlashMode,
} from "expo-camera";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import Icon from "@/assets/icons";
import { wp } from "@/src/helpers/Common";
import { theme } from "@/src/constants/theme";

interface CameraviewProps {
  onCapture: (imageUri: string) => void;
  onClose: () => void;
}

export default function Cameraview({ onCapture, onClose }: CameraviewProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [type, setType] = useState("back");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const cameraRef = useRef<CameraView | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera access is required", [
          { text: "OK" },
        ]);
      }
    })();
  }, []);

  const handleAccept = async () => {
    if (capturedImage) {
      // Pass the image to the parent component
      onCapture(capturedImage);
    }
  };

  const pickImageFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setCapturedImage(uri);
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: false });
      if (photo && photo.uri) {
        setCapturedImage(photo.uri);
      } else {
        console.error("Photo is undefined or invalid");
        Alert.alert("Error", "Failed to capture photo");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert("Error", "Failed to take picture");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {capturedImage ? (
        <View style={styles.previewContainer}>
          {/* Image Preview */}
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />

          {/* Preview Controls */}
          <View style={styles.previewControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setCapturedImage(null)}
            >
              {/* <Text style={styles.buttonText}>Retake</Text> */}
              <Icon name={'retakeCamera'} color={'white'}/>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton} onPress={handleAccept}>
              {/* <Text style={styles.buttonText}>Save</Text> */}
              <Icon name={'share'} color={'white'}/>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.cameraContainer}>
          <CameraView
            style={styles.camera}
            facing={type as CameraType}
            flash={flashMode}
            ref={cameraRef}
          >
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: wp(4),
                paddingVertical: wp(4),
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setFlashMode(flashMode === "off" ? "on" : "off")}
              >
                <Icon
                  name={flashMode === "on" ? "zapon" : "zap"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </CameraView>

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={pickImageFromGallery}
            >
              <Icon name="image" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={() => setType(type === "back" ? "front" : "back")}
            >
              <Icon name="camera" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  previewContainer: { flex: 1 },
  previewImage: { flex: 1, resizeMode: "cover" },
  previewControls: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 30,
    gap: wp(4),
  },
  cameraContainer: { flex: 1 },
  camera: { flex: 1 },
  cameraControls: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  controlButton: {
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "white",
    fontSize: 18,
  },
  buttonText: { color: "white" },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
  },
  shareButton: { padding: 10, backgroundColor: theme.colors.primary, borderRadius: 10 },
});
