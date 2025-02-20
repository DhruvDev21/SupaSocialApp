import { ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { fetchNotification } from "@/src/services/notificationService";
import { useAuth } from "@/src/contexts/AuthContext";
import { hp, wp } from "@/src/helpers/Common";
import { theme } from "@/src/constants/theme";
import ScreenWrapper from "@/src/components/ScreenWrapper";
import { useRouter } from "expo-router";
import NotificationItem from "@/src/components/NotificationItem";
import Header from "@/src/components/Header";

interface Notification {
  id: string;
  message: string;
  sender: {
    id: string;
    name: string;
    image?: string;
  };
  created_at: string;
}

const Notification = () => {
  const { user } = useAuth();
  const navigation = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    if (!user?.id) return; // Ensure user.id is defined

    let res = await fetchNotification(user.id);
    if (res.sucess) setNotifications(res.data);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Header title="Notifications" />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.liststyle}
        >
          {notifications.map((item) => {
            return (
              <NotificationItem
                item={item}
                key={item?.id}
                navigation={navigation}
              />
            );
          })}
          {notifications.length === 0 && (
            <Text style={styles.noData}>No notifications yet</Text>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
};

export default Notification;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  liststyle: {
    paddingVertical: 20,
    gap: 10,
  },
  noData: {
    fontSize: hp(1.8),
    fontWeight: theme.fonts.medium,
    color: theme.colors.text,
    textAlign: "center",
  },
});
