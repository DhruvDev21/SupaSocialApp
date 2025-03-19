import {
  FlatList,
  Text,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useState } from "react";
import { hp, screenWidth, wp } from "@/src/helpers/Common";
import { theme } from "@/src/constants/theme";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { RootState } from "../redux/store";
import { ImageBackground } from "expo-image";
import { offers } from "../helpers/mockData";
import { item, Product } from "../constants/type";
import ProductOptionsModal from "./ProductOptionsModal";
import ProductCard from "./ProductCard";

const padding = wp(4);
const gap = wp(2);
const itemWidth = (screenWidth - 2 * padding - gap) / 2;

interface ProductListProps {
  data: Product[] | any;
}

const ProductList: React.FC<ProductListProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <Text style={styles.noProducts}>No products found</Text>;
  }

  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
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
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.offerCarouselContainer}>
          <FlatList
            data={offers}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ width: screenWidth * 3 }}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <ImageBackground
                  source={item.image}
                  style={[styles.offerCard, { width: screenWidth - wp(8) }]}
                  imageStyle={{ borderRadius: 20 }}
                >
                  <View style={styles.overlay} />
                  <Text style={styles.offerTitle}>{item.title}</Text>
                  <Text style={styles.offerSubtitle}>{item.subtitle}</Text>
                  <Text style={styles.offerDetails}>{item.details}</Text>
                  <Pressable style={styles.shopNowButton}>
                    <Text style={styles.shopNowText}>Shop Now</Text>
                  </Pressable>
                </ImageBackground>
              </View>
            )}
            pagingEnabled
          />
        </View>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              cartItems={cartItems}
              onAddToCart={handleAddToCartPress}
            />
          )}
          // renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          scrollEnabled={false} // Prevents inner FlatList from scrolling independently
        />
      </ScrollView>

      <ProductOptionsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmSelection}
        sizes={selectedProduct?.sizes ?? []}
        colors={selectedProduct?.color ?? []}
      />
    </>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: hp(1),
    backgroundColor: "#fff",
  },
  noProducts: {
    textAlign: "center",
    fontSize: hp(2),
    marginTop: hp(5),
  },
  listContainer: {
    paddingHorizontal: padding,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    padding: wp(2),
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginVertical: wp(2),
  },
  image: {
    width: "100%",
    height: hp(20),
    borderRadius: 10,
  },
  title: {
    fontSize: hp(2),
    fontWeight: "bold",
    textAlign: "center",
    marginTop: hp(1),
  },
  description: {
    fontSize: hp(1.7),
    color: "#666",
    textAlign: "center",
    marginTop: hp(0.5),
  },
  price: {
    fontSize: hp(2.2),
    fontWeight: "bold",
    color: "#000",
    marginTop: hp(0.5),
  },
  buyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(0.5),
    paddingHorizontal: wp(8),
    borderRadius: 20,
    marginTop: hp(1),
  },
  buyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: hp(1.7),
  },
  offerCarouselContainer: {
    marginBottom: hp(1),
    marginTop: hp(2),
  },
  cardContainer: {
    paddingHorizontal: wp(4),
  },
  offerCard: {
    borderRadius: 30,
    padding: wp(4),
    justifyContent: "center",
    alignItems: "flex-start",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 20,
    paddingHorizontal: wp(4),
  },
  offerTitle: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "#fff",
    marginBottom: hp(0.5),
  },
  offerSubtitle: {
    fontSize: hp(1.8),
    color: "#fff",
  },
  offerDetails: {
    fontSize: hp(1.6),
    color: "#fff",
    marginBottom: hp(1),
  },
  shopNowButton: {
    marginTop: hp(1),
    borderWidth: 1,
    borderColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.5),
  },
  shopNowText: {
    color: "#fff",
    fontSize: hp(1.8),
  },
});
