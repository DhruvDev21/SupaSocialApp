import React from "react";
import { Modal, TouchableOpacity, View, StyleSheet } from "react-native";
import { Image } from "expo-image";

type ImageModalProps = {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
};

const ImageModal: React.FC<ImageModalProps> = ({ visible, imageUri, onClose }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalContainer}>
        <TouchableOpacity onPress={onClose} style={styles.fullscreenTouchable}>
          {imageUri && <Image source={{ uri: imageUri }} style={styles.fullscreenImage} />}
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default ImageModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenTouchable: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "90%",
    height: "80%",
    resizeMode: "contain",
  },
});