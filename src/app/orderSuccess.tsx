import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import React, { useRef, useState, useEffect, useCallback } from "react";
import LottieView from "lottie-react-native";
import { theme } from "../constants/theme";
import { wp } from "../helpers/Common";
import Button from "../components/Button";
import { useFocusEffect, useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import { getLastOrder } from "../services/orderServices";

interface OrderDetails {
  id: string;
  created_at: string;
  total_amount: number;
  delivery_date: number;
}

const OrderSuccess = () => {
  const navigation = useRouter();
  const animation = useRef<LottieView>(null);
  const [lastOrder, setLastOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLastOrder = async () => {
      if (user?.id) {
        const data = await getLastOrder(user.id);
        setLastOrder(data);
        setLoading(false);
      }
    };

    fetchLastOrder();
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.replace("/shopping"); // Replace the current screen with shopping
        return true; // Prevent default back action
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove(); // Cleanup on unmount
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!lastOrder) {
    return (
      <View style={styles.container}>
        <Text style={styles.noOrdersText}>No recent orders found!</Text>
        <Button
          title="Shop More"
          textStyle={{ fontSize: 20 }}
          onPress={() => navigation.push("/shopping")}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LottieView
        autoPlay
        ref={animation}
        style={{
          width: "100%",
          height: "45%",
        }}
        source={require("../../assets/icons/orderConfirm.json")}
      />
      <View style={styles.titleTextContainer}>
        <Text style={styles.titleText}>🎉 Congratulations!! 🎉</Text>
        <Text style={styles.titleInfo}>
          Your order has been placed successfully!
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Order Details</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.label}>Order Date</Text>
            <Text style={styles.value}>
              {new Date(lastOrder.created_at).toLocaleDateString()}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={[styles.value,{maxWidth:wp(30)}]} numberOfLines={1} ellipsizeMode="clip" >{lastOrder.id}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Delivery Date</Text>
            <Text style={styles.value}>
              {new Date(lastOrder.delivery_date).toLocaleDateString()}
            </Text>
          </View>

          <View
            style={[
              styles.row,
              { borderTopWidth: 1, borderColor: theme.colors.gray },
            ]}
          >
            <Text style={{ color: theme.colors.primary, paddingTop: 5 }}>
              Total
            </Text>
            <Text style={{ color: theme.colors.primary, paddingTop: 5 }}>
              ${lastOrder.total_amount.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.btnContainer}>
        <Button
          title="Shop More"
          textStyle={{ fontSize: 18 }}
          onPress={() => navigation.push("/shopping")}
        />
        <Button
          title="View order"
          textStyle={{ fontSize: 18, color: theme.colors.primary }}
          btnStyle={styles.orderViewBtn}
          onPress={()=> navigation.push('/orderScreen')}
        />
      </View>
    </View>
  );
};

export default OrderSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleTextContainer: {
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  titleText: {
    fontSize: 30,
    fontWeight: "bold",
  },
  titleInfo: {
    fontSize: 16,
    fontWeight: "600",
  },
  detailsContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
    margin: wp(4),
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  header: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  content: {
    paddingTop: wp(3),
    paddingBottom: wp(1),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: wp(3.5),
  },
  label: {
    color: "#6b7280",
  },
  value: {
    color: "#374151",
  },
  btnContainer: {
    paddingHorizontal: wp(4),
    gap: wp(3),
  },
  orderViewBtn: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  noOrdersText: {
    textAlign: "center",
    marginVertical: 20,
    color: theme.colors.gray,
  },
});
