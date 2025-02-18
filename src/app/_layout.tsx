import { LogBox, StatusBar, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserData } from "../services/userService";
import { User } from "@supabase/supabase-js";

LogBox.ignoreLogs([
  "Warning: TNodeChildrenRenderer",
  "Warning: MemoizedTNodeRenderer",
  "Warning: TRenderEngineProvider",
]);

const _layout = () => {
  return (
    <AuthProvider>
      <StatusBar barStyle={'dark-content'} />
      <MainLayout />
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const navigation = useRouter();
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      console.log("the user session:", session);

      if (session) {
        setAuth(session?.user);
        updateUserData(session?.user, session?.user?.email ?? "");
        navigation.replace("/(main)/home");
      } else {
        setAuth(null);
        navigation.replace("/welcome");
      }
    });
  }, []);

  const updateUserData = async (user: User, email: string) => {
    let res = await getUserData(user?.id);
    if (res.success) {
      setUserData({ ...res.data, email });
    }
  };
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="/(main)/postDetails"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
};

export default _layout;

const styles = StyleSheet.create({});
