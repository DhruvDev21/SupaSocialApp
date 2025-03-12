import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import {
  addUserAddress,
  fetchUserAddresses,
  updateUserAddress,
} from "../services/addressServices";
import Header from "../components/Header";
import Icon from "@/assets/icons";
import Input from "../components/input";
import { hp, wp } from "../helpers/Common";
import { theme } from "../constants/theme";
import Button from "../components/Button";
import Loading from "../components/loading";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { addAddress } from "../redux/addressSlice";
import { RootState } from "../redux/store";

const AddressScreen = () => {
  const { user } = useAuth();
  const navigation = useRouter();
  const dispatch = useDispatch();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  ); // Track selected address
  const [addressForm, setAddressForm] = useState({
    addressName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });
  const [addressLoader, setAddressLoader] = useState(false);

  const selectedReduxAddress = useSelector(
    (state: RootState) => state.address.selectedAddress
  );

  useEffect(() => {
    const loadAddresses = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      const data = await fetchUserAddresses(user.id as string);
      setAddresses(data);

      // Check if there's an address in Redux and select it
      if (selectedReduxAddress) {
        const existingAddress = data.find(
          (addr) => addr.id === selectedReduxAddress.id
        );
        if (existingAddress) {
          setSelectedAddressId(existingAddress.id); // Auto-select the address from Redux
        }
      }

      setLoading(false);
    };

    loadAddresses();
  }, [user, selectedReduxAddress]);

  const handleInputChange = (field: string, value: string) => {
    let isValid = true;

    // Validation rules
    const textOnlyRegex = /^[A-Za-z\s]*$/; // For name, city, state, country
    const addressRegex = /^[A-Za-z0-9\s,/]*$/; // For address (allows letters, numbers, spaces, and commas)
    const numbersOnlyRegex = /^\d*$/; // For zip code

    // Apply validation based on the field
    switch (field) {
      case "addressName":
      case "city":
      case "state":
      case "country":
        isValid = textOnlyRegex.test(value);
        break;
      case "address":
        isValid = addressRegex.test(value);
        break;
      case "zip":
        isValid = numbersOnlyRegex.test(value);
        break;
      default:
        break;
    }

    // Update state only if valid
    if (isValid) {
      setAddressForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleAddAddress = async () => {
    setAddressLoader(true);
    if (!user || !user.id) return;

    const { addressName, address, city, state, zip, country } = addressForm;

    if (!addressName || !address || !city || !state || !zip || !country) {
      console.warn("Please fill in all fields");
      setAddressLoader(false);
      return;
    }

    try {
      if (editMode && selectedAddressId) {
        const result = await updateUserAddress(selectedAddressId, addressForm);
        if (result) {
          setAddresses((prev) =>
            prev.map((addr) =>
              addr.id === selectedAddressId ? { ...addr, ...addressForm } : addr
            )
          );
        }
      } else {
        const result = await addUserAddress(user.id, addressForm);
        if (result && result.length > 0) {
          setAddresses((prev) => [result[0], ...prev]);
        }
      }
      setModalVisible(false);
      resetForm();
    } catch (error) {
      console.error("Error adding/updating address:", error);
    } finally {
      setAddressLoader(false);
    }
  };

  const resetForm = () => {
    setAddressForm({
      addressName: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    });
    setEditMode(false);
    setSelectedAddressId(null);
  };

  const handleEditAddress = (address: any) => {
    setSelectedAddressId(address.id);
    setAddressForm(address);
    setEditMode(true);
    setModalVisible(true);
  };

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId((prev) => (prev === id ? null : id));
    const selectedAddress = addresses.find((addr) => addr.id === id);
    console.log("Selected Address:", selectedAddress);
  };

  const proceedToPayment = () => {
    if (selectedAddressId) {
      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId
      );
      console.log("Proceeding with Address:", selectedAddress);
      if (selectedAddress) {
        dispatch(addAddress(selectedAddress)); // Replace the address in Redux
        navigation.push("/paymentScreen");
      }
    }
  };

  useEffect(() => {
    const loadAddresses = async () => {
      if (!user || !user.id) return;
      setLoading(true);
      const data = await fetchUserAddresses(user.id as string);
      setAddresses(data);
      setLoading(false);
    };

    loadAddresses();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.notextContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="Address" />
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => setModalVisible(true)}
        >
          <Icon name="plusIcon" size={22} color={theme.colors.rose} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={addresses}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ flex: 1 }}
        renderItem={({ item }) => (
          <Pressable
            style={[
              styles.addressCard,
              selectedAddressId === item.id && styles.selectedCard,
            ]}
            onPress={() => handleSelectAddress(item.id)}
          >
            <View style={styles.addressEditContainer}>
              <View style={styles.iconContainer}>
                <Icon
                  name={
                    selectedAddressId === item.id ? "checkedCirlce" : "circle"
                  }
                  size={24}
                  color={
                    selectedAddressId === item.id
                      ? theme.colors.primary
                      : theme.colors.text
                  }
                  strokeWidth={2}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.addressName}>{item.addressName}</Text>
                <Text
                  style={[
                    styles.addressName,
                    { fontSize: 14, fontWeight: "500" },
                  ]}
                >
                  {item.address}, {item.city}, {item.state} - {item.zip}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditAddress(item)}
              >
                <Icon name="edit" size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Address Found</Text>
            <Text
              style={[styles.emptyText, { fontSize: 14, fontWeight: "400" }]}
            >
              Please add new address
            </Text>
          </View>
        }
      />

      <View style={styles.proceedButton}>
        <Button
          title="Procced to Payment"
          onPress={proceedToPayment}
          btnStyle={{
            backgroundColor: !selectedAddressId
              ? theme.colors.textLight
              : theme.colors.primary,
          }}
          textStyle={{ fontSize: 18 }}
          disabled={selectedAddressId ? false : true}
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderContainer}>
              {editMode ? (
                <Text style={styles.modalTitle}>Update Address</Text>
              ) : (
                <Text style={styles.modalTitle}>Add New Address</Text>
              )}
              <Pressable
                style={styles.closeButton}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Icon name="close" color={"red"} size={15} />
              </Pressable>
            </View>

            <View style={{ gap: wp(4) }}>
              <Input
                placeholder="Enter address title"
                value={addressForm.addressName}
                onChangeText={(value) =>
                  handleInputChange("addressName", value)
                }
              />
              <Input
                placeholder="Enter address"
                value={addressForm.address}
                onChangeText={(value) => handleInputChange("address", value)}
              />
              <Input
                placeholder="Enter city"
                value={addressForm.city}
                onChangeText={(value) => handleInputChange("city", value)}
              />
              <Input
                placeholder="Enter state"
                value={addressForm.state}
                onChangeText={(value) => handleInputChange("state", value)}
              />
              <Input
                placeholder="Enter zip Code"
                keyboardType="number-pad"
                value={addressForm.zip}
                onChangeText={(value) => handleInputChange("zip", value)}
              />
              <Input
                placeholder="Enter Country"
                value={addressForm.country}
                onChangeText={(value) => handleInputChange("country", value)}
              />
              {addressLoader ? (
                <Loading />
              ) : (
                <Button
                  title={editMode ? "Update Address" : "Add Address"}
                  onPress={handleAddAddress}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AddressScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: wp(4) },
  noAddressText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "gray",
    fontWeight: "bold",
  },
  headerContainer: {
    justifyContent: "center",
    marginBottom: wp(3),
  },
  addressCard: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    borderColor: theme.colors.textLight,
  },
  selectedCard: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  addressEditContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 10,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "700",
    color: theme.colors.text,
  },
  iconContainer: {
    paddingRight: 10,
  },
  editButton: {},
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
  proceedButton: {
    marginVertical: 20,
    backgroundColor: "white",
  },
  disabledButton: {
    backgroundColor: theme.colors.gray,
  },
  logoutBtn: {
    position: "absolute",
    right: 0,
    padding: 6,
    top: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
  notextContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 250,
  },
  modalHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Distributes space between title and close button
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.text,
    paddingLeft: 5,
  },
  closeButton: {
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
});
