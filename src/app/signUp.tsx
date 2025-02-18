import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import Input from "../components/input";
import Button from "../components/Button";
import { useRouter } from "expo-router";
import { ErrorState } from "../constants/type";
import Icon from "@/assets/icons";
import { theme } from "../constants/theme";
import { hp, wp } from "../helpers/Common";
import { supabase } from "@/lib/supabase";

const sighUp = () => {
  const navigation = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({
    emailError: "",
    passwordError: "",
    nameError: "",
  });

  const validateInputs = () => {
    let isValid = true;
    let newErrors: ErrorState = { emailError: "", passwordError: "" };

    if (!nameRef.current.trim()) {
      newErrors.nameError = "Name is required";
      isValid = false;
    }

    if (!emailRef.current.trim()) {
      newErrors.emailError = "Email is required";
      isValid = false;
    }
    if (!emailRef.current.trim()) {
      newErrors.emailError = "Email is required";
      isValid = false;
    }

    if (!passwordRef.current.trim()) {
      newErrors.passwordError = "Password is required";
      isValid = false;
    }

    setError(newErrors);
    return isValid;
  };

  const onLogIn = async () => {
    if (validateInputs()) {
      setLoading(true);
      try {
        let name = nameRef.current.trim();
        let email = emailRef.current.trim(); // FIXED
        let password = passwordRef.current.trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options:{
            data:{
              name
            }
          }
        });
        console.log("Supabase response:", data, error);
        setLoading(false);
      } catch (e) {
        console.error("Error creating new account:", e);
        setLoading(false);
      }
    }
  };
  

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton navigation={navigation} />

        <View>
          <Text style={styles.welcomeBackText}>Let's</Text>
          <Text style={styles.welcomeBackText}>Get Started</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formtext}>
            Please fill the deatils to create an account
          </Text>
          <Input
            icon={<Icon name={"user"} size={26} strokeWidth={1.2} />}
            placeholder="Enter your name"
            onChangeText={(value) => {
              nameRef.current = value;
              setError((prev) => ({ ...prev, nameError: "" }));
            }}
          />
          {error.nameError ? (
            <Text style={styles.errorText}>{error.nameError}</Text>
          ) : null}

          <Input
            icon={<Icon name={"mail"} size={26} strokeWidth={1.2} />}
            placeholder="Enter your email"
            onChangeText={(value) => {
              emailRef.current = value;
              setError((prev) => ({ ...prev, emailError: "" }));
            }}
          />
          {error.emailError ? (
            <Text style={styles.errorText}>{error.emailError}</Text>
          ) : null}

          <Input
            icon={<Icon name={"lock"} size={26} strokeWidth={1.2} />}
            placeholder="Enter your password"
            secureTextEntry
            onChangeText={(value) => {
              passwordRef.current = value;
              setError((prev) => ({ ...prev, passwordError: "" }));
            }}
          />
          {error.passwordError ? (
            <Text style={styles.errorText}>{error.passwordError}</Text>
          ) : null}

          <Button title="Sign Up" loading={loading} onPress={onLogIn} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => navigation.push("/login")}>
            <Text
              style={[
                styles.footerText,
                {
                  color: theme.colors.primaryDark,
                  fontWeight: theme.fonts.semibold,
                },
              ]}
            >
              Log In
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default sighUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 45,
    paddingHorizontal: wp(5),
  },
  welcomeBackText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },
  formtext: {
    fontSize: hp(1.5),
    color: theme.colors.text,
  },
  forgotPassword: {
    textAlign: "right",
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  },
  errorText: {
    color: "red",
    fontSize: hp(1.5),
    marginTop: -20,
  },
});
