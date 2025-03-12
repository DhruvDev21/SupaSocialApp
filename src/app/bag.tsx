import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import React from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";
import { wp, hp } from "../helpers/Common";
import { useDispatch, useSelector } from "react-redux";
import { removeFromCart, updateQuantity } from "../redux/cartSlice";
import { RootState } from "../redux/store";
import Icon from "@/assets/icons";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";
import Button from "../components/Button";

const SHIPPING_FEE = 15;
const TAX_PERCENTAGE = 0.05; // 5%

const Bag = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  console.log("cart items", cartItems);
  const dispatch = useDispatch();
  const navigation = useRouter();

  const handleIncrease = (id: number) => {
    dispatch(updateQuantity({ id, quantityChange: 1 }));
  };

  const handleDecrease = (id: number, quantity: number) => {
    if (quantity > 1) {
      dispatch(updateQuantity({ id, quantityChange: -1 }));
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * TAX_PERCENTAGE;
  const total = subtotal + tax;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.padding}>
          <Header title="Bag" onPress={() => navigation.push("/shopping")} />
        </View>

        {cartItems.length > 0 ? (
          <>
            <FlatList
              data={cartItems}
              keyExtractor={(item) => item.id.toString()}
              style={styles.padding}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Image
                    source={{ uri: item.image_url }}
                    style={styles.image}
                  />
                  <View style={styles.details}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: wp(4),
                        alignItems: "center",
                      }}
                    >
                      <Text style={styles.price}>
                        ${item.price} x {item.quantity}
                      </Text>
                      {item.selectedSize && (
                        <Text style={styles.price}>
                          Size: {item.selectedSize}
                        </Text>
                      )}
                      {item.selectedColor && (
                        <>
                          <Text style={styles.price}>color:</Text>
                          <View
                            style={{
                              backgroundColor: item.selectedColor,
                              elevation: 5,
                              height: 15,
                              width: 15,
                              borderRadius: 8,
                              marginLeft: -10,
                            }}
                          />
                        </>
                      )}
                    </View>

                    {/* Quantity Controls */}
                    <View style={styles.quantityContainer}>
                      {item.quantity > 1 ? (
                        <Pressable
                          onPress={() => handleDecrease(item.id, item.quantity)}
                          style={styles.quantityButton}
                        >
                          <Icon
                            name={"minus"}
                            size={15}
                            strokeWidth={4}
                            color={theme.colors.text}
                          />
                        </Pressable>
                      ) : (
                        <Pressable
                          onPress={() => dispatch(removeFromCart({ id: item.id }))}
                          style={styles.quantityButton}
                        >
                          <Icon
                            name={"delete"}
                            size={15}
                            strokeWidth={2}
                            color={theme.colors.rose}
                          />
                        </Pressable>
                      )}
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <Pressable
                        onPress={() => handleIncrease(item.id)}
                        style={styles.quantityButton}
                      >
                        <Icon
                          name={"plusIcon"}
                          size={15}
                          strokeWidth={3}
                          color={theme.colors.text}
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            />

            {/* Total Price and Checkout Button */}
            <View style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal:</Text>
                <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping:</Text>
                {/* <Text style={styles.summaryValue}>${SHIPPING_FEE.toFixed(2)}</Text> */}
                <Text
                  style={[
                    styles.summaryValue,
                    {
                      fontSize: 12,
                      fontWeight: "400",
                      color: theme.colors.text,
                      maxWidth: wp(20),
                      textAlign: "right",
                    },
                  ]}
                >
                  Calculated at Checkout
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (5%):</Text>
                <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
              </View>

              <Button
                title="Procced to Checkout"
                onPress={() => navigation.push("/paymentScreen")}
                textStyle={{ fontSize: 18 }}
              />
            </View>
          </>
        ) : (
          <View style={styles.emptyCartContainer}>
            <Text style={styles.emptyCartText}>No products in cart</Text>
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Bag;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderColor: theme.colors.gray,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: wp(3),
    marginVertical: hp(1),
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  image: {
    width: wp(20),
    height: wp(20),
    borderRadius: 10,
  },
  details: {
    flex: 1,
    marginLeft: wp(3),
  },
  name: {
    fontSize: wp(4),
    fontWeight: "bold",
  },
  price: {
    fontSize: wp(3.5),
    color: "#555",
    marginVertical: hp(0.5),
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp(1),
  },
  quantityButton: {
    backgroundColor: "#ddd",
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.8),
    borderRadius: 5,
    marginHorizontal: wp(2),
  },
  quantityText: {
    fontSize: wp(4),
    fontWeight: "bold",
  },
  quantity: {
    fontSize: wp(4),
    fontWeight: "bold",
    minWidth: wp(6),
    textAlign: "center",
  },
  summaryContainer: {
    padding: wp(4),
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hp(1),
  },
  summaryLabel: {
    fontSize: wp(4),
    color: "#333",
  },
  summaryValue: {
    fontSize: wp(4),
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: hp(1),
  },
  totalLabel: {
    fontSize: wp(4.5),
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: wp(4.5),
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  checkoutText: {
    color: "#fff",
    fontSize: wp(4),
    fontWeight: "bold",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: wp(5),
    color: "#777",
    fontWeight: "bold",
  },
});
