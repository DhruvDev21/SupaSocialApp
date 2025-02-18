import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { StatusBar } from "expo-status-bar";
import BackButton from "../components/BackButton";
import { useRouter } from "expo-router";
import { hp, wp } from "../helpers/Common";
import { theme } from "../constants/theme";
import Icon from "@/assets/icons";
import Input from "../components/input";
import Button from "../components/Button";
import { ErrorState } from "../constants/type";
import { supabase } from "@/lib/supabase";

const login = () => {
  const navigation = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorState>({
    emailError: "",
    passwordError: "",
    logInError:"",
  });

  const validateInputs = () => {
    let isValid = true;
    let newErrors: ErrorState = { emailError: "", passwordError: "" };

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
      setLoading(true)
      try {
        let email = emailRef.current.trim();
        let password = passwordRef.current.trim();
        const {error} = await supabase.auth.signInWithPassword({
          email,
          password
        })
        setLoading(false)
        if (error) {
          setError((prev) => ({ ...prev, logInError: error.message }));
        } else {
          setError({ emailError: "", passwordError: "", logInError: "" });
        }
      } catch (e) {
        console.error("error while loging", e);
        setLoading(false)
      }
    }
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton navigation={navigation} />

        <View>
          <Text style={styles.welcomeBackText}>Hey,</Text>
          <Text style={styles.welcomeBackText}>Welcome Back</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.formtext}>Please Log In to continue</Text>
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

          <Text style={styles.forgotPassword}>Forgot Password?</Text>
          <Button title="Login" loading={loading} onPress={onLogIn} />
          {error.logInError ? (
            <Text style={styles.errorText}>{error.logInError}</Text>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.push("/signUp")}>
            <Text
              style={[
                styles.footerText,
                {
                  color: theme.colors.primaryDark,
                  fontWeight: theme.fonts.semibold,
                },
              ]}
            >
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default login;

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
    marginBottom: -5,
  },
});
