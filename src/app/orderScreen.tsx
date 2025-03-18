import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  ScrollView,
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

const orderScreen = () => {
  const { user } = useAuth();
  const navigation = useRouter();
  const [order, setOrder] = useState<order[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    const getUserData = async () => {
      if (!user || !user.id) {
        console.log("User is not logged in");
        return;
      }
      try {
        const response = await getUserOrders(user.id);
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
    getUserData();
  }, []);

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
      {/* <View> */}
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

      {/* </View> */}
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
