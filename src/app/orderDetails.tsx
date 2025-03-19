import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { cancelOrder, fetchOrderDetails } from "../services/orderServices";
import { theme } from "../constants/theme";
import Header from "../components/Header";
import type { order } from "../constants/type";
import { screenWidth, wp } from "../helpers/Common";
import ProgressBarOforder from "../components/ProgressBarOforder";
import Icon from "@/assets/icons";
import {
  fetchReviews,
  updateRating,
  submitFullReview,
} from "../services/reviewService";
import { useAuth } from "../contexts/AuthContext";
import { deliveryStatuses } from "../helpers/mockData";

const orderDetails = () => {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<(order & { items: { id: number }[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reviews, setReviews] = useState<{ [key: number]: string }>({});
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [reviewLoading, setReviewLoading] = useState<{
    [key: number]: boolean;
  }>({});
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempReview, setTempReview] = useState<{ [key: number]: string }>({});
  const { user } = useAuth();

  const handleStarPress = async (productId: number, rating: number) => {
    setRatings((prevRatings) => ({ ...prevRatings, [productId]: rating }));
    if (user) {
      await updateRating(productId, user.id, rating);
    } else {
      console.error("User is not authenticated.");
    }
  };

  const handleEditReview = (index: number) => {
    setEditingIndex(index);
    setTempReview((prev) => ({
      ...prev,
      [index]: reviews[order?.items?.[index]?.id || 0] || "",
    }));
  };
  const handleSaveReview = async (index: number) => {
    const productId = order?.items?.[index]?.id;
    if (!productId) {
      console.error("Invalid product ID or order is null.");
      return;
    }
    const reviewText = tempReview[index] || "";
    const rating = ratings[productId] || 0;

    if (!reviewText && rating === 0) {
      console.log("Review or rating is required.");
      return;
    }

    setReviewLoading((prev) => ({ ...prev, [index]: true }));

    try {
      const result = await submitFullReview(
        productId,
        user?.id || "",
        reviewText,
        rating
      );

        setReviews((prevReviews) => ({
          ...prevReviews,
          [productId]: reviewText,
        }));

        setTempReview((prev) => ({
          ...prev,
          [index]: "",
        }));

        setEditingIndex(null);
        console.log("Review submitted successfully:", result);
    } catch (error) {
      console.error("Error submitting review:", error);
    }

    setReviewLoading((prev) => ({ ...prev, [index]: false }));
  };

  useEffect(() => {
    const getOrderDetails = async () => {
      if (orderId) {
        setLoading(true);
        const data = await fetchOrderDetails(orderId as string);
        if (data) {
          setOrder(data);
          await loadReviews(data);
        }
        setLoading(false);
      }
    };

    const loadReviews = async (orderData: order) => {
      if (!orderData?.items) return;
      const fetchedRatings: { [key: number]: number } = {};
      const fetchedReviews: { [key: number]: string } = {};

      for (const item of orderData.items) {
        const reviewData = user ? await fetchReviews(item.id, user.id) : null;
        if (reviewData) {
          fetchedRatings[item.id as any] = reviewData.rating || 0;
          fetchedReviews[item.id as any] = reviewData.comment || "";
        }
      }
      setRatings(fetchedRatings);
      setReviews(fetchedReviews);
    };

    getOrderDetails();
  }, [orderId]);

  const handleCancelPress = async () => {
    if (order && order.id) {
      const response = await cancelOrder(order.id);
      if (response.success) {
        setOrder((prevOrder) =>
          prevOrder ? { ...prevOrder, status: "cancelled" } : null
        );
      } else {
        console.log("Failed to cancel order:", response.message);
      }
    }
  };

  const currentStatus = order?.delivery_status?.toLowerCase() || "pending";
  const currentStepIndex = deliveryStatuses.indexOf(currentStatus);
  const isCanceled = order?.status === "cancelled";

  const validStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  const steps = deliveryStatuses.map((status, index) => ({
    label: status,
    completed: index <= validStepIndex,
  }));

  const itemSubtotal =
    order?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) ||
    0;
  const taxAmount = itemSubtotal * 0.05;
  const shippingCharges = 15;
  const totalPrice = itemSubtotal + taxAmount + shippingCharges;

  const handleScroll = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
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
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleCancelPress}
          >
            <Icon name="delete" color={theme.colors.rose} />
          </TouchableOpacity>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <FlatList
          data={order.items}
          keyExtractor={(item) => item.id}
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.itemContainer, { width: screenWidth }]}>
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
            </View>
          )}
        </View>
        <View style={styles.orderStatusContainer}>
          <Text style={styles.statusTitle}>Order Status</Text>
          <ProgressBarOforder steps={steps} isCanceled={isCanceled} />
        </View>
        {order?.status === "completed" && (
          <View style={styles.reviewContainer}>
            <Text style={styles.reviewTitle}>Review</Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() =>
                    handleStarPress(order.items[activeIndex].id, star)
                  }
                >
                  <Icon
                    name={
                      ratings[order.items[activeIndex]?.id ?? 0] >= star
                        ? "filledStar"
                        : "emptyStar"
                    }
                    size={24}
                    color={
                      ratings[order.items[activeIndex].id] >= star
                        ? "#ffc107"
                        : theme.colors.textDark
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            {editingIndex === activeIndex ? (
              <>
                <TextInput
                  style={styles.reviewInput}
                  value={tempReview[activeIndex] || ""}
                  onChangeText={(text) =>
                    setTempReview((prev) => ({ ...prev, [activeIndex]: text }))
                  }
                />
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => handleSaveReview(activeIndex)}
                >
                  {reviewLoading[activeIndex] ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.reviewButtonText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : reviews[order.items[activeIndex]?.id] ? (
              <View style={styles.reviewTextContainer}>
                <Text style={styles.reviewText}>
                  {reviews[order.items[activeIndex]?.id]}
                </Text>
                <TouchableOpacity onPress={() => handleEditReview(activeIndex)}>
                  <Icon name="edit" size={20} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Write your review..."
                  value={tempReview[activeIndex] || ""}
                  onChangeText={(text) =>
                    setTempReview((prev) => ({ ...prev, [activeIndex]: text }))
                  }
                />
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => handleSaveReview(activeIndex)}
                >
                  {reviewLoading[activeIndex] ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text style={styles.reviewButtonText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
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
    top: wp(2),
    right: wp(5),
    padding: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  scrollViewContainer: {
    paddingBottom: wp(15),
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
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: wp(1),
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
  starsContainer: {
    flexDirection: "row",
    marginBottom: wp(2),
    gap: wp(4),
  },
  reviewContainer: {
    padding: wp(4),
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 2,
    marginHorizontal: wp(4),
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: wp(2),
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: theme.colors.textLight,
    borderRadius: 8,
    padding: wp(2),
    fontSize: 14,
    marginBottom: wp(2),
  },
  reviewButton: {
    backgroundColor: theme.colors.primary,
    padding: wp(2),
    borderRadius: 8,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "white",
    fontWeight: "600",
  },
  reviewTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: wp(2),
  },
  reviewText: {
    marginTop: wp(2),
    fontSize: 14,
    color: theme.colors.textDark,
  },
});
