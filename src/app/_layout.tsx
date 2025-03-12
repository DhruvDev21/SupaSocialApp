import { LogBox, StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { Slot, useRouter } from "expo-router";
import { Provider } from "react-redux"; 
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserData } from "../services/userService";
import { User } from "@supabase/supabase-js";
import { store } from "../redux/store";

LogBox.ignoreLogs([
  "Warning: TNodeChildrenRenderer",
  "Warning: MemoizedTNodeRenderer",
  "Warning: TRenderEngineProvider",
]);

const Layout = () => {
  return (
    <Provider store={store}>
    <AuthProvider>
      <StatusBar barStyle={"dark-content"} />
      <MainLayout />
    </AuthProvider>
    </Provider>
  );
};

const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();
  const navigation = useRouter();
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("the user session:", session);

      if (session) {
        setAuth(session?.user);
        await updateUserData(session?.user, session?.user?.email ?? "");
        navigation.replace("/(tabs)/home"); // Make sure this is the correct path
      } else {
        setAuth(null);
        navigation.replace("/welcome");
      }

      setLoading(false); // Set loading to false after checking auth state
    });
  }, []);

  const updateUserData = async (user: User, email: string) => {
    let res = await getUserData(user?.id);
    if (res.success) {
      setUserData({ ...res.data, email });
    }
  };

  return <Slot />;
};

export default Layout;
