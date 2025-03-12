import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import Header from "../components/Header";
import { wp } from "../helpers/Common";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { theme } from "../constants/theme";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import Icon from "@/assets/icons";
import Input from "../components/input";
import Button from "../components/Button";
import { clearCart } from "../redux/cartSlice";
import { placeOrder } from "../services/orderServices";
import { useAuth } from "../contexts/AuthContext";

const SHIPPING_CHARGES = 15.0; // Fixed shipping charges
const TAX_PERCENTAGE = 0.05; // 5% tax

const PaymentScreen = () => {
  const navigation = useRouter();
  const dispatch= useDispatch();
  const { user }= useAuth();
  console.log('user data',user)
  const selectedReduxAddress = useSelector(
    (state: RootState) => state.address.selectedAddress
  );
  const productList = useSelector((state: RootState) => state.cart.items);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [upiId, setUpiId] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState({
    upiId: "",
    accountNumber: "",
    ifscCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    paymentMethod: "",
  });

  // Reset form fields when payment method changes
  useEffect(() => {
    // Reset all input fields when payment method changes
    setUpiId("");
    setAccountNumber("");
    setIfscCode("");
    setCardNumber("");
    setExpiryDate("");
    setCvv("");

    // Clear all errors when payment method changes
    setErrors({
      upiId: "",
      accountNumber: "",
      ifscCode: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      paymentMethod: "",
    });
  }, [selectedPaymentMethod]);

  // Handle input changes and clear errors immediately
  const handleUpiChange = (text: string) => {
    setUpiId(text);
    setErrors((prev) => ({ ...prev, upiId: "" }));
  };

  const handleAccountNumberChange = (text: string) => {
    setAccountNumber(text);
    setErrors((prev) => ({ ...prev, accountNumber: "" }));
  };

  const handleIfscChange = (text: string) => {
    setIfscCode(text);
    setErrors((prev) => ({ ...prev, ifscCode: "" }));
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(text);
    setErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  const handleExpiryDateChange = (text: string) => {
    setExpiryDate(text);
    setErrors((prev) => ({ ...prev, expiryDate: "" }));
  };

  const handleCvvChange = (text: string) => {
    setCvv(text);
    setErrors((prev) => ({ ...prev, cvv: "" }));
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
    setErrors((prev) => ({ ...prev, paymentMethod: "" }));
  };

  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      upiId: "",
      accountNumber: "",
      ifscCode: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      paymentMethod: "",
    };

    // Check if payment method is selected
    if (!selectedPaymentMethod) {
      newErrors.paymentMethod = "Please select a payment method";
      valid = false;
    }

    if (selectedPaymentMethod === "upi") {
      if (!upiId.trim()) {
        newErrors.upiId = "UPI ID is required";
        valid = false;
      } else if (!/^\w+@\w+$/.test(upiId)) {
        newErrors.upiId = "Invalid UPI ID format";
        valid = false;
      }
    }

    if (selectedPaymentMethod === "netbanking") {
      if (!accountNumber.trim()) {
        newErrors.accountNumber = "Account number is required";
        valid = false;
      } else if (!/^\d{9,18}$/.test(accountNumber)) {
        newErrors.accountNumber = "Invalid account number";
        valid = false;
      }

      if (!ifscCode.trim()) {
        newErrors.ifscCode = "IFSC code is required";
        valid = false;
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) {
        newErrors.ifscCode = "Invalid IFSC code";
        valid = false;
      }
    }

    if (selectedPaymentMethod === "creditcard") {
      if (!cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
        valid = false;
      } else if (!/^\d{16}$/.test(cardNumber)) {
        newErrors.cardNumber = "Invalid card number";
        valid = false;
      }

      if (!expiryDate.trim()) {
        newErrors.expiryDate = "Expiry date is required";
        valid = false;
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
        newErrors.expiryDate = "Invalid expiry date (MM/YY)";
        valid = false;
      }

      if (!cvv.trim()) {
        newErrors.cvv = "CVV is required";
        valid = false;
      } else if (!/^\d{3}$/.test(cvv)) {
        newErrors.cvv = "Invalid CVV";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const renderPaymentInputs = () => {
    if (selectedPaymentMethod === "cod") return null; // No inputs for COD

    return (
      <View style={styles.paymentInputContainer}>
        {selectedPaymentMethod === "upi" && (
          <View>
            <Input
              placeholder="Enter UPI ID"
              keyboardType="email-address"
              value={upiId}
              onChangeText={handleUpiChange}
              style={styles.paymentInput}
              errorMessage={errors.upiId}
            />
          </View>
        )}
        {selectedPaymentMethod === "netbanking" && (
          <View style={{ gap: wp(3) }}>
            <Input
              placeholder="Enter Account Number"
              keyboardType="numeric"
              value={accountNumber}
              onChangeText={handleAccountNumberChange}
              style={styles.paymentInput}
              errorMessage={errors.accountNumber}
            />
            <Input
              placeholder="Enter IFSC Code"
              value={ifscCode}
              onChangeText={handleIfscChange}
              style={styles.paymentInput}
              errorMessage={errors.ifscCode}
            />
          </View>
        )}
        {selectedPaymentMethod === "creditcard" && (
          <View style={{ gap: wp(3) }}>
            <Input
              placeholder="Enter Card Number"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              style={styles.paymentInput}
              errorMessage={errors.cardNumber}
            />
            <Input
              placeholder="Enter Expiry Date (MM/YY)"
              keyboardType="numeric"
              value={expiryDate}
              onChangeText={handleExpiryDateChange}
              style={styles.paymentInput}
              errorMessage={errors.expiryDate}
            />
            <Input
              placeholder="Enter CVV"
              keyboardType="numeric"
              secureTextEntry
              value={cvv}
              onChangeText={handleCvvChange}
              style={styles.paymentInput}
              errorMessage={errors.cvv}
            />
          </View>
        )}
      </View>
    );
  };

  const paymentMethods = [
    { id: "upi", label: "UPI" },
    { id: "cod", label: "Cash on Delivery" },
    { id: "netbanking", label: "Net Banking" },
    { id: "creditcard", label: "Credit/Debit Card" },
  ];

  const handleAddAddress = () => {
    navigation.push("/AddressScreen");
  };

  const handlePlaceOrder = async () => {
    if (validateInputs()) {

      const currentDate = new Date();
      const deliveryDate = new Date(currentDate);
      deliveryDate.setDate(currentDate.getDate() + 7);

      const orderData = {
        user_id: selectedReduxAddress.user_id,   // Replace with actual user ID
        address: selectedReduxAddress,
        items: productList,
        total_amount: grandTotal,
        payment_method: selectedPaymentMethod,
        status: "pending",
        created_at: new Date().toISOString(),
        delivery_date: deliveryDate.toISOString(),
        contact_number: user ? user.phoneNumber : ""
      };
      console.log('the order data',orderData)
  
      const response = await placeOrder(orderData);  // ✅ Make API call
  
      if (response.success) {
        console.log("Order placed successfully!");
        dispatch(clearCart());  // ✅ Clear the cart only if successful
        navigation.push("/orderSuccess");
      } else {
        console.log("Failed to place order:", response.message);
      }
    } else {
      console.log("Validation failed!");
    }
  };

  const renderProductItem = ({ item }: any) => (
    <View style={styles.productItem}>
      <Image source={{ uri: item.image_url }} style={styles.image} />
      <View style={{ flex: 1 }}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={{flexDirection:'row', gap:wp(4)}}>
        <Text style={styles.productPrice}>${item.price} x {item.quantity}</Text>
        {item.selectedSize && (
        <Text style={styles.productPrice}>Size: {item.selectedSize}</Text>
        )}
                            <Text style={styles.productPrice}>color:</Text>
                          {item.selectedColor && (
                            <View style={{backgroundColor:item.selectedColor,elevation:5,height:15,width:15,borderRadius:8,marginLeft:-10}}/>
                          )}
                          </View>
        <View style={styles.productTotalContainer}>
          <Text style={styles.productTotal}>Total:</Text>
          <Text style={styles.productTotal}>${item.price * item.quantity}</Text>
        </View>
      </View>
    </View>
  );

  const calculateTotalPrice = () => {
    return productList.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
  };

  const productTotal = calculateTotalPrice();
  const taxAmount = productTotal * TAX_PERCENTAGE;
  const grandTotal = productTotal + SHIPPING_CHARGES + taxAmount;

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Header title="Payment" onPress={() => navigation.push("/bag")} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollViewContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Selected Address Section */}
          <View style={styles.addressContainer}>
            {selectedReduxAddress ? (
              <>
                <View style={styles.addressTitleContainer}>
                  <Text style={styles.addressTitle}>Shipping Address</Text>
                  <TouchableOpacity onPress={handleAddAddress}>
                    <Icon name={"edit"} size={20} />
                  </TouchableOpacity>
                </View>
                <Text
                  style={[
                    styles.addressText,
                    { marginBottom: wp(0.5), fontSize: 15, fontWeight: "500" },
                  ]}
                >
                  {selectedReduxAddress.addressName}
                </Text>
                <Text style={styles.addressText}>
                  {selectedReduxAddress.address}, {selectedReduxAddress.city},{" "}
                  {selectedReduxAddress.state} - {selectedReduxAddress.zip},{" "}
                  {selectedReduxAddress.country}
                </Text>
              </>
            ) : (
              <TouchableOpacity onPress={handleAddAddress}>
                <Text style={styles.addAddressText}>Add Address</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Product List Section */}
          <View style={styles.productContainer}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <FlatList
              data={productList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderProductItem}
            />

            <View style={styles.billingContainer}>
              <View style={styles.row}>
                <Text style={styles.summaryText}>Product Total:</Text>
                <Text style={styles.summaryText}>
                  ₹{productTotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.summaryText}>Shipping Charges:</Text>
                <Text style={styles.summaryText}>
                  ${SHIPPING_CHARGES.toFixed(2)}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.summaryText}>Tax (5%):</Text>
                <Text style={styles.summaryText}>${taxAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.totalText}>Grand Total:</Text>
                <Text style={styles.totalText}>${grandTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.paymentContainer}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            {errors.paymentMethod ? (
              <Text style={styles.errorText}>{errors.paymentMethod}</Text>
            ) : null}
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={styles.paymentOption}
                onPress={() => handlePaymentMethodChange(method.id)}
              >
                <Icon
                  name={
                    selectedPaymentMethod === method.id
                      ? "checkedCirlce"
                      : "circle"
                  }
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={styles.paymentText}>{method.label}</Text>
              </TouchableOpacity>
            ))}

            {/* Show inputs if not COD */}
            {renderPaymentInputs()}
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <Button
            title="Place Order"
            onPress={handlePlaceOrder}
            textStyle={{ fontSize: 20 }}
            disabled={!selectedReduxAddress || !selectedPaymentMethod} // Disable if no address or payment method
            btnStyle={{
              backgroundColor:
                !selectedReduxAddress || !selectedPaymentMethod
                  ? theme.colors.textLight // Use a disabled color if button is disabled
                  : theme.colors.primary,
            }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    paddingBottom: wp(34),
  },
  headerContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: wp(1),
  },
  scrollViewContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: wp(5),
  },
  addressContainer: {
    marginTop: wp(2),
    padding: wp(4),
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
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
  changeAddressText: {
    fontSize: 14,
    color: theme.colors.primary,
    textDecorationLine: "underline",
  },
  addAddressText: {
    fontSize: 16,
    color: theme.colors.primary,
    textAlign: "center",
  },
  productContainer: {
    marginTop: wp(5),
    padding: wp(4),
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
  },
  billingContainer: {
    marginTop: wp(2),
    padding: wp(4),
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: wp(2),
  },
  productItem: {
    paddingVertical: wp(2),
    flexDirection: "row",
    alignItems: "center",
    gap: wp(4),
  },
  image: {
    width: wp(20),
    height: wp(20),
    borderRadius: 10,
  },
  totalContainer: {
    marginTop: wp(2),
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: wp(2),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: wp(1),
  },
  summaryText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  totalText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  productName: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "500",
  },
  productPrice: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: "400",
  },
  productTotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productTotal: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: "600",
    marginTop: 5,
  },
  paymentContainer: {
    marginTop: wp(5),
    padding: wp(4),
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 5,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: wp(2),
  },
  paymentText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: wp(2),
  },
  paymentInputContainer: {
    marginTop: wp(3),
  },
  paymentInput: {
    padding: wp(1),
  },
  footer: {
    backgroundColor: "white",
    paddingTop: wp(4),
    paddingHorizontal: wp(4),
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: wp(2),
  },
});
