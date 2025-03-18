import React from "react";
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from "react-native";
import { hp, wp } from "@/src/helpers/Common";
import { theme } from "@/src/constants/theme";
import { useRouter } from "expo-router";
import { item } from "../constants/type";
import Icon from "@/assets/icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { removeProduct, saveProduct } from "../redux/productSlice";

const screenWidth = Dimensions.get("window").width;
const padding = wp(4);
const gap = wp(2);
const itemWidth = (screenWidth - 2 * padding - gap) / 2;

interface ProductCardProps {
  item: item;
  cartItems: item[];
  onAddToCart: (item: item) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ item, cartItems, onAddToCart }) => {
  const navigation = useRouter();
  const isInCart = cartItems.some(cartItem => cartItem.id.toString() === item.id.toString());
  const dispatch = useDispatch();
  const savedProducts = useSelector((state: RootState) => state.product.savedProducts);

  console.log('saved productas',savedProducts)
  const isSaved = savedProducts.some((prod) => prod.id === item.id);

  const handleSaveProduct = () => {
    if (isSaved) {
      dispatch(removeProduct(item.id));
    } else {
      dispatch(saveProduct(item));
    }
  };

  const handleCardPress = () => {
    navigation.push({ pathname: "/productDetails", params: { productId: item.id } });
  };

  return (
    <Pressable style={[styles.card, { width: itemWidth }]} onPress={handleCardPress}>
      <Pressable style={styles.savedContainer} onPress={handleSaveProduct}>
        <Icon name={isSaved  ? 'saved':'unSaved'} size={18}/>
      </Pressable>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      <Text style={styles.price}>${item.price}</Text>
      {isInCart ? (
        <Pressable onPress={() => navigation.push("/bag")} style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Go to Bag</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => onAddToCart(item)} style={styles.buyButton}>
          <Text style={styles.buyButtonText}>Add to Bag</Text>
        </Pressable>
      )}
    </Pressable>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
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
  savedContainer:{
    position:'absolute',
    zIndex:1,
    backgroundColor:'white',
    padding:wp(1.3),
    borderRadius:20,
    top:wp(3.5),
    right:wp(3.5)
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
});