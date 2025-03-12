import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { cancelOrder, fetchOrderDetails } from "../services/orderServices";
import { theme } from "../constants/theme";
import Header from "../components/Header";
import { order } from "../constants/type";
import { wp } from "../helpers/Common";
import ProgressBarOforder from "../components/ProgressBarOforder";
import Icon from "@/assets/icons";

const SCREEN_WIDTH = Dimensions.get("window").width;

const deliveryStatuses = [
  "pending",
  "confirmed",
  "packed",
  "being shipped",
  "shipped",
  "out for delivery",
  "delivered",
];

const orderDetails = () => {
  const { orderId } = useLocalSearchParams(); // Get the order ID
  const [order, setOrder] = useState<order | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const getOrderDetails = async () => {
      if (orderId) {
        const data = await fetchOrderDetails(orderId as string);
        console.log("the order data", data);
        if (data) setOrder(data);
        setLoading(false);
      }
    };
    getOrderDetails();
  }, [orderId]);
  const handleCancelPress = async () => {
    if (order && order.id) {
      const response = await cancelOrder(order.id);
      if (response.success) {
        // Directly update the order status to 'cancelled'
        setOrder((prevOrder) =>
          prevOrder ? { ...prevOrder, status: "cancelled" } : null
        );
      } else {
        console.log("Failed to cancel order:", response.message);
      }
    }
  };

  const currentStatus = order?.delivery_status?.toLowerCase() || "pending"; // Ensure lowercase
  const currentStepIndex = deliveryStatuses.indexOf(currentStatus);
  const isCanceled = order?.status === "cancelled";

  // If status is invalid, default to "pending"
  const validStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  const steps = deliveryStatuses.map((status, index) => ({
    label: status,
    completed: index <= validStepIndex,
  }));

  console.log("Current Status:", currentStatus);
  console.log("Current Step Index:", validStepIndex);

  const itemSubtotal =
    order?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) ||
    0;
  const taxAmount = itemSubtotal * 0.05; // 5% tax
  const shippingCharges = 15;
  const totalPrice = itemSubtotal + taxAmount + shippingCharges;

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  const items = order?.items || [];

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Order Details" />
        {order?.status !== "cancelled" && (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleCancelPress}>
            <Icon name="delete" color={theme.colors.rose} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <FlatList
          data={order.items}
          keyExtractor={(item) => item.id.toString()}
          horizontal // Enable horizontal scrolling
          pagingEnabled // Snap to each item like a carousel
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.itemContainer, { width: SCREEN_WIDTH }]}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: item.image_url }}
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>{item.description}</Text>
              </View>
            </View>
          )}
          onScroll={handleScroll}
        />
        {items.length > 1 && (
          <View style={styles.dotContainer}>
            {items.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeIndex === index ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        )}
        <View style={styles.addressContainer}>
          <View style={styles.addressTitleContainer}>
            <Text style={styles.addressTitle}>Delivary Address</Text>
            {/* <TouchableOpacity onPress={handleAddAddress}> */}
            {/* <Icon name={"edit"} size={20} /> */}
            {/* </TouchableOpacity> */}
          </View>
          <Text
            style={[
              styles.addressText,
              { marginBottom: wp(0.5), fontSize: 15, fontWeight: "500" },
            ]}
          >
            {order.address.addressName}
          </Text>
          <Text style={styles.addressText}>
            {order.address.address}, {order.address.city}, {order.address.state}{" "}
            - {order.address.zip}, {order.address.country}
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <TouchableOpacity
            onPress={() => setIsSummaryVisible(!isSummaryVisible)}
            style={styles.totalContainer}
          >
            <Text style={styles.totalPriceText}>Total:</Text>
            <View style={styles.totalContainer}>
              <Text style={[styles.totalPriceText, { marginRight: wp(1) }]}>
                ${totalPrice.toFixed(2)}
              </Text>
              <Icon
                name={isSummaryVisible ? "upArrow" : "downArrow"}
                size={16}
              />
            </View>
          </TouchableOpacity>
          {isSummaryVisible && (
            <View style={styles.summaryContainer}>
              {order.items.map((item, index) => (
                <View key={item.id} style={styles.itemSummaryContainer}>
                  <Text style={styles.summaryText}>{item.name}:</Text>
                  <Text style={styles.summaryText}>
                    {" "}
                    ${item.price.toFixed(2)} x {item.quantity}
                  </Text>
                </View>
              ))}
              <View style={styles.itemSummaryContainer}>
                <Text style={styles.summaryText}>Tax (5%):</Text>
                <Text style={styles.summaryText}> ${taxAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.itemSummaryContainer}>
                <Text style={styles.summaryText}>Shipping:</Text>
                <Text style={styles.summaryText}>
                  ${shippingCharges.toFixed(2)}
                </Text>
              </View>
              {/* <View style={styles.itemSummaryContainer}>
                <Text style={[styles.summaryText, { fontWeight: "bold" }]}>
                  Total:
                </Text>
                <Text style={styles.summaryText}>${totalPrice.toFixed(2)}</Text>
              </View> */}
            </View>
          )}
        </View>
        <View style={styles.orderStatusContainer}>
          <Text style={styles.statusTitle}>Order Status</Text>
          <ProgressBarOforder steps={steps} isCanceled={isCanceled} />
        </View>
      </ScrollView>
    </View>
  );
};

export default orderDetails;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
  },
  headerContainer: {
    paddingHorizontal: wp(5),
  },
  logoutBtn: {
    position: "absolute",
    top:wp(2),
    right: wp(5),
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  scrollViewContainer: {
    paddingBottom: wp(10),
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    marginBottom: 5,
  },
  date: {
    fontSize: 16,
    marginBottom: 10,
  },
  itemContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: theme.radius.md,
  },
  imageContainer: {
    width: wp(45),
    height: wp(45),
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  infoContainer: {
    marginTop: wp(4),
    alignItems: "center",
  },
  itemName: {
    fontSize: 18,
    fontWeight: "500",
    color: theme.colors.textDark,
    marginBottom: wp(1),
  },
  itemQuantity: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "400",
    textAlign: "center",
    paddingHorizontal: wp(2),
  },
  dotContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: wp(2),
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: theme.colors.primary,
  },
  inactiveDot: {
    backgroundColor: theme.colors.textLight,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  addressContainer: {
    marginTop: wp(2),
    padding: wp(4),
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: wp(4),
  },
  addressTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: wp(2),
  },
  addressText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: wp(2),
    fontWeight: "400",
  },
  priceContainer: {
    paddingHorizontal: wp(4),
    paddingVertical: wp(2),
    backgroundColor: "white",
    borderRadius: 8,
    marginHorizontal: wp(4),
    marginTop: wp(2),
    elevation: 2,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalPriceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.textDark,
  },
  summaryContainer: {
    marginTop: wp(2),
    backgroundColor: "white",
    borderRadius: 8,
  },
  itemSummaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // marginBottom: wp(1),
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: wp(1),
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wp(3),
    marginTop: wp(3),
    paddingHorizontal: wp(4),
  },
  button: {
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: wp(1),
    borderColor: theme.colors.textLight,
    borderRadius: theme.radius.xs,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "400",
    color: theme.colors.textDark,
  },
  orderStatusContainer: {
    paddingHorizontal: wp(4),
    marginTop: wp(4),
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: wp(4),
  },
});
