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

export default function RegisterScreen({ navigation }: any) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const login = useAppStore((s: any) => s.login);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleRegister = async () => {
    // Validation
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill in all fields", [
        { text: "OK" },
      ]);
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

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address", [
        { text: "OK" },
      ]);
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters", [
        { text: "OK" },
      ]);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "Passwords do not match. Please try again.",
        [{ text: "OK" }],
      );
      return;
    }

    setLoading(true);

    // Call auth service
    const result = await authService.register({
      username,
      email,
      password,
    });

    setLoading(false);

    if (result.success) {
      // Save user data and token
      login(result.data, result.token);
      Alert.alert(
        "Success",
        result.message ||
          "Account created successfully! Welcome to HCM Rain Map.",
        [{ text: "OK" }],
        { cancelable: false },
      );
    } else {
      Alert.alert(
        "Registration Failed",
        result.error || "Failed to create account. Please try again.",
        [{ text: "OK" }],
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
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <VStack space="lg" className="items-center mt-6 mb-8">
            <Box className="w-20 h-20 rounded-full bg-background-50 items-center justify-center mb-4">
              <Ionicons name="rainy" size={40} color="#3b82f6" />
            </Box>
            <Heading size="2xl" className="text-typography-900">
              Create Account
            </Heading>
            <Text size="md" className="text-typography-500 text-center">
              Join HCM Rain Map to get started
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="lg" className="flex-1">
            {/* Username Input */}
            <VStack space="xs">
              {username.length > 0 && (
                <Text size="sm" bold className="text-typography-900 ml-1">
                  Username
                </Text>
              )}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </Input>
            </VStack>

            {/* Email Input */}
            <VStack space="xs">
              {email.length > 0 && (
                <Text size="sm" bold className="text-typography-900 ml-1">
                  Email
                </Text>
              )}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
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
                  placeholder="At least 6 characters"
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

            {/* Confirm Password Input */}
            <VStack space="xs">
              {confirmPassword.length > 0 && (
                <Text size="sm" bold className="text-typography-900 ml-1">
                  Confirm Password
                </Text>
              )}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <InputSlot
                  className="pr-3"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-outline" : "eye-off-outline"
                    }
                    size={20}
                    color="#666"
                  />
                </InputSlot>
              </Input>
            </VStack>

            {/* Terms */}
            <HStack space="xs" className="flex-wrap justify-center px-4">
              <Text size="xs" className="text-typography-500 text-center">
                By signing up, you agree to our{" "}
              </Text>
              <Pressable
                onPress={() =>
                  Alert.alert("Terms", "Terms of Service will be shown here")
                }
              >
                <Text size="xs" className="text-primary-600 font-semibold">
                  Terms of Service
                </Text>
              </Pressable>
              <Text size="xs" className="text-typography-500">
                {" "}
                and{" "}
              </Text>
              <Pressable
                onPress={() =>
                  Alert.alert("Privacy", "Privacy Policy will be shown here")
                }
              >
                <Text size="xs" className="text-primary-600 font-semibold">
                  Privacy Policy
                </Text>
              </Pressable>
            </HStack>

            {/* Register Button */}
            <Button
              size="lg"
              onPress={handleRegister}
              isDisabled={loading}
              className="mt-2"
            >
              {loading && <ButtonSpinner />}
              <ButtonText>
                {loading ? "Creating..." : "Create Account"}
              </ButtonText>
            </Button>

            {/* Divider */}
            <HStack space="md" className="items-center my-6">
              <Box className="flex-1 h-px bg-border-300" />
              <Text size="xs" className="text-typography-400 font-medium">
                OR
              </Text>
              <Box className="flex-1 h-px bg-border-300" />
            </HStack>

            {/* Login Link */}
            <HStack space="xs" className="justify-center items-center mt-2">
              <Text size="sm" className="text-typography-500">
                Already have an account?
              </Text>
              <Pressable onPress={() => navigation.navigate("Login")}>
                <Text size="sm" bold className="text-primary-600">
                  Sign In
                </Text>
              </Pressable>
            </HStack>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
