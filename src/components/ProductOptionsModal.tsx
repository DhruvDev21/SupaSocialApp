import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { theme } from "@/src/constants/theme";
import { hp, wp } from "@/src/helpers/Common";
import Button from "./Button";
import Icon from "@/assets/icons";

interface ProductOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (selectedSize?: string, selectedColor?: string) => void;
  sizes?: string[];
  colors?: string[];
}

const ProductOptionsModal: React.FC<ProductOptionsModalProps> = ({
  visible,
  onClose,
  onConfirm,
  sizes = [],
  colors = [],
}) => {
  const [selectedSize, setSelectedSize] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}
        >
            <View style={styles.header}>
          <Text style={styles.title}>Select Options</Text>
          <Pressable onPress={onClose}>
          <Icon name={'close'} size={18} color={theme.colors.rose}/>
          </Pressable>
          </View>

          {sizes.length > 0 && (
            <View style={styles.optionContainer}>
              <Text style={styles.optionTitle}>Size</Text>
              <FlatList
                data={sizes}
                horizontal
                keyExtractor={(item) => item}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: wp(3) }}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.sizeOptionButton,
                      selectedSize === item && styles.selectedOption,
                    ]}
                    onPress={() => setSelectedSize(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selectedSize === item && styles.selectedOptionText,
                      ]}
                    >
                      {item}
                    </Text>
                  </Pressable>
                )}
              />
            </View>
          )}

          {colors.length > 0 && (
            <View style={styles.optionContainer}>
              <Text style={styles.optionTitle}>Color</Text>
              <FlatList
                data={colors}
                horizontal
                keyExtractor={(item) => item}
                contentContainerStyle={{ gap: wp(3) }}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.colorOptionButton,
                      selectedColor === item && styles.selectedOption,
                      { backgroundColor: item },
                    ]}
                    onPress={() => setSelectedColor(item)}
                  />
                )}
              />
            </View>
          )}

          <View>
            <Button
              title="Add to Bag"
              textStyle={{ fontSize: 20 }}
              onPress={() => {
                onConfirm(selectedSize, selectedColor);
                onClose();
              }}
            />
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: wp(4),
  },
  header:{
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginBottom:wp(2)
  },
  title: {
    fontSize: hp(2.5),
    fontWeight: "bold",
  },
  optionContainer: {
    width: "100%",
    marginBottom: hp(2),
  },
  optionTitle: {
    fontSize: hp(2),
    fontWeight: "bold",
    marginBottom: hp(1),
  },
  sizeOptionButton: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.text,
    height: wp(9),
    width: wp(10),
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionButton: {
    borderRadius: 20,
    height: wp(10),
    width: wp(10),
    elevation: 5,
    marginVertical: 5,
  },
  selectedOption: {
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: hp(1.8),
  },
  selectedOptionText: {
    color: theme.colors.primary,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#ccc",
    paddingVertical: hp(1),
    paddingHorizontal: wp(6),
    borderRadius: 10,
  },
  cancelButtonText: {
    color: "#000",
    fontSize: hp(1.8),
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1),
    paddingHorizontal: wp(6),
    borderRadius: 10,
  },
  confirmButtonText: {
    color: "white",
    fontSize: hp(1.8),
  },
});

export default ProductOptionsModal;
