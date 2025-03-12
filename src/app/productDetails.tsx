import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { screenWidth, wp } from "../helpers/Common";
import Header from "../components/Header";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  fetchProductById,
  fetchSimilarProducts,
} from "../services/productServices";
import { item, Product } from "../constants/type";
import { theme } from "../constants/theme";
import { Image } from "expo-image";
import ImageModal from "../components/ImageModal";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { addToCart } from "../redux/cartSlice";
import Button from "../components/Button";
import ProductCard from "../components/ProductCard";
import ProductOptionsModal from "../components/ProductOptionsModal";

const ProductDetails = () => {
  const navigation = useRouter();
  const dispatch = useDispatch();
  const { productId } = useLocalSearchParams();
  const [product, setProduct] = useState<item | null>(null);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const lastIndexRef = useRef(activeIndex);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const cartItems = useSelector((state: RootState) => state.cart.items) || [];
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [colorError, setColorError] = useState<boolean>(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const getProduct = async () => {
      if (productId) {
        const productData = await fetchProductById(
          Array.isArray(productId) ? productId[0] : productId
        );
        console.log("the product data", productData);
        setProduct(productData);
        setLoading(false);
      }
    };

    getProduct();
  }, [productId]);

  useEffect(() => {
    const getSimilarProducts = async () => {
      if (product?.category) {
        const similarProductsData = await fetchSimilarProducts(
          product.category,
          product.id
        );
        setSimilarProducts(similarProductsData);
      }
    };

    getSimilarProducts();
  }, [product]);

  const onScroll = (event: any) => {
    if (!event) return; // Prevents null event errors

    event.persist(); // Ensures the event is not nullified

    if (!event.nativeEvent?.contentOffset) return; // Prevents errors if contentOffset is null

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      const slideIndex = Math.round(
        event.nativeEvent.contentOffset.x / screenWidth
      );

      if (lastIndexRef.current !== slideIndex) {
        lastIndexRef.current = slideIndex;
        setActiveIndex(slideIndex);
      }
    }, 100); // Debounce for smooth scrolling
  };

  const handleImagePress = (index: number) => {
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };
  const handleAddToCart = (item: Product) => {
    if (product && product.sizes && product.sizes.length > 0 && !selectedSize) {
      setSizeError(true); // Show error message if size is required but not selected
      return;
    }
    if (
      product &&
      product.color &&
      product.color.length > 0 &&
      !selectedColor
    ) {
      // Fix: Check selectedColor, not colorError
      setColorError(true); // Show error message if color is required but not selected
      return;
    }

    const itemToAdd = { ...item, selectedSize, selectedColor }; // Include selected color in the cart item
    dispatch(addToCart(itemToAdd));
  };
  const handleGoToBag = () => {
    navigation.push("/bag");
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSizeError(false); // Hide error once a size is selected
  };
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setColorError(false); // Hide error once a size is selected
  };

  const handleSuggestionAddToCartPress = (item: item) => {
    if (item.sizes?.length || item.color?.length) {
      setSelectedProduct(item);
      setModalVisible(true);
    } else {
      dispatch(addToCart(item));
    }
  };
  const handleSuggestionConfirmSelection = (size?: string, color?: string) => {
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

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found!</Text>
      </View>
    );
  }

  const renderPagination = () => {
    if (!product?.additional_images) return null;

    return (
      <View style={styles.paginationContainer}>
        {product.additional_images.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    );
  };
  const isInCart = cartItems.some(
    (cartItem) => cartItem?.id?.toString() === productId?.toString()
  );
  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header
          title="Product Detail"
          onPress={() => navigation.push("/(tabs)/shopping")}
        />
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          data={product.additional_images}
          keyExtractor={(_, index) => index?.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.sliderImageContainer}
              onPress={() => setSelectedImage(item)}
            >
              <Image source={{ uri: item }} style={styles.sliderImage} />
            </TouchableOpacity>
          )}
          onScroll={onScroll}
          initialScrollIndex={activeIndex}
        />
        {renderPagination()}

        {product.additional_images && product.additional_images.length > 0 && (
          <FlatList
            horizontal
            data={product.additional_images}
            keyExtractor={(item, index) => index?.toString()}
            renderItem={({ item, index }) => (
              <TouchableOpacity onPress={() => handleImagePress(index)}>
                <Image source={{ uri: item }} style={styles.additionalImage} />
              </TouchableOpacity>
            )}
            showsHorizontalScrollIndicator={false}
          />
        )}
        <Text style={styles.productTitle}>{product.name}</Text>
        <Text style={styles.productDescription}>{product.description}</Text>
        <Text style={styles.productPrice}>Price: ${product.price}</Text>

        {product.color && product.color.length > 0 && (
          <View style={{ marginBottom: wp(4) }}>
            <Text style={styles.sizeLabel}>Select Color:</Text>
            <View style={{ flexDirection: "row" }}>
              {product.color?.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => handleColorSelect(color)}
                  style={{
                    padding: wp(4),
                    margin: 5,
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color ? theme.colors.primary : color,
                    borderWidth: 2,
                    elevation: 4,
                    borderRadius: 20,
                  }}
                ></TouchableOpacity>
              ))}
            </View>
            {colorError && (
              <Text style={styles.sizeErrorText}>Please select a color</Text>
            )}
          </View>
        )}

        {product.sizes && product.sizes.length > 0 && (
          <View style={styles.sizesContainer}>
            <Text style={styles.sizeLabel}>Available Sizes:</Text>
            <FlatList
              horizontal
              data={product.sizes}
              contentContainerStyle={{ gap: wp(3) }}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.sizeOption,
                    selectedSize === item && {
                      borderColor: theme.colors.primary,
                    },
                  ]}
                  onPress={() => handleSizeSelect(item)}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      selectedSize === item && {
                        color: theme.colors.primary,
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />
            {sizeError && (
              <Text style={styles.sizeErrorText}>Please select a size</Text>
            )}
          </View>
        )}

        {isInCart ? (
          <Button
            title="Go to Bag"
            onPress={handleGoToBag}
            btnStyle={{
              backgroundColor: "white",
              borderWidth: 1.5,
              elevation: 2,
              borderColor: theme.colors.primary,
            }}
            textStyle={{ color: theme.colors.primary }}
          />
        ) : (
          <Button title="Add to Bag" onPress={() => handleAddToCart(product)} />
        )}

        {similarProducts.length > 0 && (
          <>
            <View style={styles.suggestionContainer}>
              <Text style={styles.suggestionText}>Similar Products</Text>
              <FlatList
                horizontal
                data={similarProducts}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ gap: wp(2) }}
                renderItem={({ item }) => (
                  <ProductCard
                    item={item}
                    cartItems={cartItems}
                    onAddToCart={handleSuggestionAddToCartPress}
                  />
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
            <ProductOptionsModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onConfirm={handleSuggestionConfirmSelection}
              sizes={selectedProduct?.sizes ?? []}
              colors={selectedProduct?.color ?? []}
            />
          </>
        )}
      </ScrollView>

      <ImageModal
        visible={!!selectedImage}
        imageUri={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </View>
  );
};

export default ProductDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderColor: theme.colors.gray,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    height: "100%",
    width: "100%",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  contentContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(2),
    paddingBottom: wp(3),
  },
  sliderImageContainer: {
    height: 300,
    width: screenWidth - wp(8),
  },
  sliderImage: {
    width: "100%",
    height: 300,
  },
  productTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: wp(2),
    marginTop: wp(2),
  },
  productDescription: {
    fontSize: 16,
    marginBottom: wp(2),
  },
  sizesContainer: {
    marginBottom: wp(4),
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sizeOption: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: wp(2),
    justifyContent: "center",
    alignItems: "center",
    width: wp(10),
    borderColor: theme.colors.textLight,
  },
  sizeText: {
    fontSize: 14,
  },
  sizeErrorText: {
    color: "red",
    fontSize: 14,
    marginTop: wp(1),
  },
  productPrice: {
    fontSize: 18,
    color: theme.colors.primary,
    marginBottom: wp(4),
  },
  additionalImage: {
    width: 100,
    height: 80,
    marginRight: 10,
    borderRadius: 10,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: wp(3),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
  },
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
  suggestionContainer: {
    marginTop: wp(4),
  },
  suggestionText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
