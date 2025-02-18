import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { hp, wp } from "@/src/helpers/Common";
import { ScrollView } from "react-native";
import Header from "@/src/components/Header";
import { Image } from "expo-image";
import { useAuth } from "@/src/contexts/AuthContext";
import { getUserImageSrc, uploadFile } from "@/src/services/imageService";
import Icon from "@/assets/icons";
import { theme } from "@/src/constants/theme";
import Input from "@/src/components/input";
import { User } from "@/src/constants/type";
import Button from "@/src/components/Button";
import { updateUser } from "@/src/services/userService";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { supabase } from "@/lib/supabase";
import { decode } from "base64-arraybuffer";

const EditProfile = () => {
  const { user: currentUser, setUserData }: any = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useRouter();

  // Initialize user state properly
  const [user, setUser] = useState<User>({
    name: "",
    phoneNumber: "",
    image: null,
    bio: "",
    address: "",
  });

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        phoneNumber: currentUser.phoneNumber || "",
        image: currentUser.image || null,
        bio: currentUser.bio || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);

  // Ensure imageSource is defined only after user state is initialized

  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log("the selected image", result);

    if (!result.canceled) {
      setUser({ ...user, image: result.assets[0].uri });
    }
  };

  const imageSource =
    user.image && typeof user.image === "object"
      ? user.image.uri
      : getUserImageSrc(user.image ?? "");

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, phoneNumber, image, address, bio } = userData;

    if (!name || !phoneNumber || !address || !bio || !image) {
      Alert.alert("Profile", "Please fill all the fields");
      return;
    }

    setLoading(true);

    if (typeof image === "string" && image.startsWith("file://")) {
      const uploadResult: any = await uploadFile("profiles", image, true);
      if (uploadResult.success) {
        userData.image = uploadResult.data;
      } else {
        Alert.alert(
          "Upload Failed",
          "Could not upload image. Please try again."
        );
        setLoading(false);
        return;
      }
    }

    const res = await updateUser(currentUser?.id, userData);
    console.log("Updated User Data:", res);
    setLoading(false);

    if (res.success) {
      setUserData({ ...currentUser, ...userData });
      navigation.back();
    }
  };
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Header title="Edit Profile" />
          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name="camera" size={20} strokeWidth={2.5} />
              </Pressable>
            </View>

            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
              Please fill your profile details
            </Text>
            <Input
              icon={<Icon name="user" />}
              placeholder="Enter your Name"
              value={user.name}
              onChangeText={(value) => setUser({ ...user, name: value })}
            />
            <Input
              icon={<Icon name="call" />}
              placeholder="Enter your phone number"
              value={user.phoneNumber}
              onChangeText={(value) => setUser({ ...user, phoneNumber: value })}
            />
            <Input
              icon={<Icon name="location" />}
              placeholder="Enter your address"
              value={user.address}
              onChangeText={(value) => setUser({ ...user, address: value })}
            />
            <Input
              placeholder="Enter your Bio"
              value={user.bio}
              multiline
              containerStyles={styles.bio}
              onChangeText={(value) => setUser({ ...user, bio: value })}
            />
            <Button title="Update" loading={loading} onPress={onSubmit} />
          </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  form: {
    gap: 20,
    marginTop: 20,
  },
  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },
  avatar: {
    height: "100%",
    width: "100%",
    borderRadius: theme.radius.xxl * 1.8,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  cameraIcon: {
    position: "absolute",
    right: -10,
    bottom: 0,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
  input: {
    flexDirection: "row",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
    padding: 17,
    paddingHorizontal: 20,
    gap: 15,
  },
});
