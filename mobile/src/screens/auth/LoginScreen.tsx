import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Pressable } from "@/components/ui/pressable";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../services/auth";
import useAppStore from "../../store/useAppStore";

export default function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const login = useAppStore((s: any) => s.login);

  const handleLogin = async () => {
    // Validation
    if (!username || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both username and password",
        [{ text: "OK" }],
      );
      return;
    }

    if (username.length < 3) {
      Alert.alert(
        "Invalid Username",
        "Username must be at least 3 characters",
        [{ text: "OK" }],
      );
      return;
    }

    setLoading(true);

    // Call auth service
    const result = await authService.login(username, password);

    setLoading(false);

    if (result.success) {
      // Save user data and token
      login(result.data, result.token);
    } else {
      // Show detailed error popup
      Alert.alert(
        "Login Failed",
        result.error || "Invalid credentials. Please try again.",
        [{ text: "OK", style: "default" }],
        { cancelable: true },
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow p-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <VStack space="lg" className="items-center mt-8 mb-8">
            <Box className="w-20 h-20 rounded-full bg-primary-500/20 items-center justify-center mb-4">
              <Ionicons name="rainy" size={40} color="#3b82f6" />
            </Box>
            <Heading size="2xl" className="text-typography-900">
              Welcome Back
            </Heading>
            <Text size="md" className="text-typography-500 text-center">
              Sign in to access HCM Rain Map
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="xl" className="flex-1">
            {/* Username Input */}
            <VStack space="xs">
              {username.length > 0 && (
                <Text size="sm" bold className="text-typography-900 ml-1">
                  Username
                </Text>
              )}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="Enter your username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </Input>
            </VStack>

            {/* Password Input */}
            <VStack space="xs">
              {password.length > 0 && (
                <Text size="sm" bold className="text-typography-900 ml-1">
                  Password
                </Text>
              )}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <InputSlot
                  className="pr-3"
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </InputSlot>
              </Input>
            </VStack>

            {/* Forgot Password */}
            <Pressable
              onPress={() => navigation.navigate("ForgotPassword")}
              className="self-end"
            >
              <Text size="sm" className="text-primary-600 font-medium">
                Forgot Password?
              </Text>
            </Pressable>

            {/* Login Button */}
            <Button
              size="lg"
              onPress={handleLogin}
              isDisabled={loading}
              className="mt-4"
            >
              {loading && <ButtonSpinner />}
              <ButtonText>{loading ? "Signing In..." : "Sign In"}</ButtonText>
            </Button>

            {/* Divider */}
            <HStack space="md" className="items-center my-6">
              <Box className="flex-1 h-px bg-border-300" />
              <Text size="xs" className="text-typography-400 font-medium">
                OR
              </Text>
              <Box className="flex-1 h-px bg-border-300" />
            </HStack>

            {/* Register Link */}
            <HStack space="xs" className="justify-center items-center mt-4">
              <Text size="sm" className="text-typography-500">
                Don't have an account?
              </Text>
              <Pressable onPress={() => navigation.navigate("Register")}>
                <Text size="sm" bold className="text-primary-600">
                  Sign Up
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
