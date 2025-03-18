import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import Header from "@/src/components/Header";
import PostCard from "@/src/components/PostCard";
import { wp } from "@/src/helpers/Common";
import { theme } from "@/src/constants/theme";
import { useAuth } from "@/src/contexts/AuthContext";
import { useRouter } from "expo-router";
import ProductCard from "@/src/components/ProductCard";
import { addToCart } from "@/src/redux/cartSlice";
import ProductOptionsModal from "@/src/components/ProductOptionsModal";
import { item } from "@/src/constants/type";

const Saved = () => {
  const [selectedOption, setSelectedOption] = useState<string>("Post");
  const dispatch = useDispatch();
  const savedPosts = useSelector(
    (state: RootState) => state.savedPosts.savedPosts
  );
  const savedProducts =
    useSelector((state: RootState) => state.product.savedProducts) || [];
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { user } = useAuth();
  const navigation = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<item | null>(null);

  const handleAddToCartPress = (item: item) => {
    if (item.sizes?.length || item.color?.length) {
      setSelectedProduct(item);
      setModalVisible(true);
    } else {
      dispatch(addToCart(item));
    }
  };
  const handleConfirmSelection = (size?: string, color?: string) => {
    if (selectedProduct) {
      dispatch(
        addToCart({
          ...selectedProduct,
          selectedSize: size,
          selectedColor: color,
        })
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Saved" showBackButton={false} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.optionContainer}>
        {["Post", "Product"].map((filter) => (
          <Pressable
            key={filter}
            style={[
              styles.optionButton,
              selectedOption === filter && styles.activeOptionButton,
            ]}
            onPress={() => setSelectedOption(filter)}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === filter && styles.activeOptionText,
              ]}
            >
              {filter}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Show Saved Posts only if "Post" is selected */}
      {selectedOption === "Post" ? (
        <FlatList
          key={"post"}
          data={Array.isArray(savedPosts) ? savedPosts : []}
          contentContainerStyle={{ padding: wp(4) }}
          keyExtractor={(item) =>
            item?.id ? String(item.id) : Math.random().toString()
          }
          renderItem={({ item }) =>
            item?.id ? (
              <PostCard
                item={item}
                currentUser={user}
                navigation={navigation}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.noProductContainer}>
              <Text style={styles.noSavedText}>No saved posts.</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          key={"product"}
          data={savedProducts}
          contentContainerStyle={{ padding: wp(4) }}
          numColumns={2}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              cartItems={cartItems}
              onAddToCart={handleAddToCartPress}
            />
          )}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.noProductContainer}>
              <Text style={styles.noSavedText}>No saved products.</Text>
            </View>
          }
        />
      )}

      <ProductOptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmSelection}
        sizes={selectedProduct?.sizes ?? []}
        colors={selectedProduct?.color ?? []}
      />
    </View>
  );
};

export default Saved;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    alignItems: "flex-start",
    paddingHorizontal: wp(4),
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  row: {
    justifyContent: "space-between",
  },
  optionButton: {
    flex: 1,
    paddingVertical: wp(1),
    borderRadius: theme.radius.sm,
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderColor: theme.colors.text,
  },
  activeOptionButton: {
    borderColor: theme.colors.primary,
  },
  optionText: {
    fontSize: 17,
    color: theme.colors.text,
    fontWeight: "500",
  },
  activeOptionText: {
    color: theme.colors.primary,
  },
  noProductContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  noSavedText: {
    textAlign: "center",
    marginTop: 20,
    color: theme.colors.text,
  },
});
