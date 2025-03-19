import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";
import { wp } from "../helpers/Common";
import { order } from "../constants/type";
import { useAuth } from "../contexts/AuthContext";
import { cancelOrder, getUserOrders } from "../services/orderServices";
import Icon from "@/assets/icons";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";
import { statusStylesMock } from "../helpers/mockData";
import { fetchReviews } from "../services/reviewService";
import { supabase } from "@/lib/supabase";

const orderScreen = () => {
  const { user } = useAuth();
  const navigation = useRouter();
  const [order, setOrder] = useState<order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [reviews, setReviews] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (!user || !user.id) {
      console.log("User is not logged in");
      return;
    }
  
    const getUserData = async () => {
      try {
        const response = await getUserOrders(user.id as string);
        if (response) {
          setOrder(
            response.map((o) => ({
              ...o,
              status: o.status === "completed" ? "delivered" : o.status,
            }))
          );
        } else {
          console.log("Error fetching the order data");
        }
      } catch (e) {
        console.error("Cannot fetch the order data", e);
      }
    };
  
    const loadReviews = async () => {
      if (!user) return;
  
      const reviewsData: { [key: string]: any } = {};
      
      await Promise.all(
        order.flatMap((o) =>
          o.items.map(async (product) => {
            const review = await fetchReviews(product.id, user.id as string);
            if (review) reviewsData[product.id] = review;
          })
        )
      );
  
      setReviews(reviewsData);
    };
  
    getUserData();
    loadReviews();
  
    const subscription = supabase
    .channel("reviews")
    .on<{ product_id: string }>(
      'postgres_changes',
      { event: "*", schema: "public", table: "reviews" },
      (payload) => {
        console.log("Review updated:", payload);
        setReviews((prev) => ({ 
          ...prev,
          [(payload.new as { product_id: string }).product_id]: payload.new,
        }));
      }
    )
    .subscribe();
  
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [user, order]);
  

  const filteredOrders = order.filter((o) =>
    selectedFilter === "all" ? true : o.status === selectedFilter
  );

  const orderCard = ({ item }: { item: order }) => {
    if (!item || !item.items) return null;

    const handleCancelPress = async (orderId: string) => {
      const response = await cancelOrder(orderId);
      if (response.success) {
        setOrder((prevOrders) =>
          prevOrders.map((o) =>
            o.id === orderId ? { ...o, status: "cancelled" } : o
          )
        );
      } else {
        console.log("Failed to cancel order:", response.message);
      }
    };

    const handleTrackPress = (orderId: string) => {
      navigation.push({
        pathname: "/orderDetails",
        params: { orderId },
      });
    };

    const statusStyles = statusStylesMock.reduce(
      (acc: { [key: string]: any }, item) => {
        acc[item.status] = item;
        return acc;
      },
      {}
    );

    const currentStatus = statusStyles[item.status] || statusStyles.pending;

    const handleReview = async (
      productId: string,
      userId: string,
      rating: number
    ) => {
      try {
        const { data: existingReview, error: fetchError } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", productId)
          .eq("user_id", userId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        if (existingReview) {
          const { error: updateError } = await supabase
            .from("reviews")
            .update({ rating })
            .eq("product_id", productId)
            .eq("user_id", userId);

          if (updateError) throw updateError;
        } else {
          const { error: insertError } = await supabase
            .from("reviews")
            .insert([{ product_id: productId, user_id: userId, rating }]);

          if (insertError) throw insertError;
        }

        const { data: updatedReview, error: refreshError } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", productId)
          .eq("user_id", userId)
          .single();

        if (refreshError) throw refreshError;

        setReviews((prev) => ({
          ...prev,
          [productId]: { ...existingReview, rating },
        }));

        console.log("Updated reviews state:", reviews);
      } catch (e) {
        console.error("Error submitting review:", e);
      }
    };

    return (
      <Pressable
        style={styles.cardContainer}
        onPress={() => handleTrackPress(item.id)}
      >
        <View style={styles.cardHeaderContainer}>
          <View
            style={[
              styles.headericon,
              { backgroundColor: currentStatus.color },
            ]}
          >
            <Icon
              name={currentStatus.icon}
              size={currentStatus.iconSize}
              color={"white"}
            />
          </View>
          <View>
            <Text style={styles.deliveryStatusText}>{item.status}</Text>
            <Text style={styles.deliveryDate}>
              {item.delivery_date || "Not yet assigned"}
            </Text>
          </View>
        </View>
        <View style={styles.itemContainer}>
          {item.items.map((productArray, index) => (
            <View key={index} style={styles.cardImageContainer}>
              <Image
                source={{ uri: productArray.image_url }}
                style={styles.cardImage}
              />
              <View>
                <Text style={styles.productName}>{productArray.name}</Text>
                <View style={{ flexDirection: "row", gap: wp(4) }}>
                  <Text style={styles.quantityText}>
                    quantity: {productArray.quantity}
                  </Text>
                  {productArray.selectedSize && (
                    <Text style={styles.quantityText}>
                      Size: {productArray.selectedSize}
                    </Text>
                  )}
                  {productArray.selectedColor && (
                    <>
                      <Text style={styles.quantityText}>color:</Text>
                      <View
                        style={{
                          backgroundColor: productArray.selectedColor,
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
                {item?.status == "delivered" && (
                    <View style={styles.starContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Pressable
                          key={star}
                          onPress={() =>
                            user?.id && handleReview(productArray.id, user.id, star)
                          }
                        >
                          <Icon
                            name={
                              reviews[productArray.id]?.rating >= star
                                ? "filledStar"
                                : "emptyStar"
                            }
                            size={15}
                            color={reviews[productArray.id]?.rating >= star ? '#ffc107' : theme.colors.textDark}
                          />
                        </Pressable>
                      ))}
                    </View>
                )}
              </View>
            </View>
          ))}
        </View>
        {item?.status !== "cancelled" && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.button}
              onPress={() => handleCancelPress(item.id)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.button}
              onPress={() => handleTrackPress(item.id)}
            >
              <Text style={styles.buttonText}>Track</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <ScreenWrapper>
      <View style={styles.headerContainer}>
        <Header title="Order" onPress={() => navigation.push("/shopping")} />
      </View>
      <View style={styles.filterContainer}>
        {["all", "pending", "delivered", "cancelled"].map((filter) => (
          <Pressable
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.activeFilterButton,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                selectedFilter === filter && styles.activeFilterText,
              ]}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={orderCard}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Order Found</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
};

export default orderScreen;

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: wp(4),
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: wp(2),
    width: "100%",
    paddingHorizontal: wp(4),
    gap: wp(2),
  },
  filterButton: {
    flex: 1,
    paddingVertical: wp(1),
    borderRadius: theme.radius.sm,
    alignItems: "center",
    borderBottomWidth: 1.5,
    borderColor: theme.colors.text,
  },
  activeFilterButton: {
    borderColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  activeFilterText: {
    color: theme.colors.primary,
  },
  cardContainer: {
    backgroundColor: "white",
    marginHorizontal: wp(4),
    marginVertical: wp(3),
    borderRadius: theme.radius.md,
    elevation: 2,
    padding: wp(3),
  },
  cardHeaderContainer: {
    flexDirection: "row",
    gap: wp(2),
    marginBottom: wp(1),
    alignItems: "center",
  },
  headericon: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.xl,
    height: wp(8),
    width: wp(8),
    justifyContent: "center",
    alignItems: "center",
  },
  deliveryStatusText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "500",
  },
  deliveryDate: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: "400",
  },
  itemContainer: {
    backgroundColor: theme.colors.primaryLight,
    padding: wp(2),
    marginVertical: wp(1),
    borderRadius: theme.radius.sm,
  },
  cardImageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  cardImage: {
    height: wp(15),
    width: wp(15),
    borderRadius: theme.radius.sm,
    marginRight: wp(2),
  },
  productName: {
    fontSize: 15,
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "400",
    color: theme.colors.text,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: wp(3),
    marginTop: wp(1),
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
  starContainer: {
    flexDirection: "row",
    gap: 5,
    marginVertical:wp(1)
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.text,
    fontWeight: "500",
  },
});
