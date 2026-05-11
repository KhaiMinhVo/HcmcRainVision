import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
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

interface ForgotPasswordScreenProps {
  navigation: any;
}

export default function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validation
    if (!email) {
      Alert.alert("Missing Information", "Please enter your email address", [
        { text: "OK" },
      ]);
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address (e.g., user@example.com)",
        [{ text: "OK" }],
      );
      return;
    }

    setLoading(true);

    // Call auth service
    const result = await authService.forgotPassword(email);

    setLoading(false);

    if (result.success) {
      setSubmitted(true);
      Alert.alert(
        "Email Sent",
        result.message || "Vui lòng kiểm tra email để đặt lại mật khẩu.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login"),
          },
        ],
      );
    } else {
      Alert.alert(
        "Request Failed",
        result.error || "Failed to send reset email. Please try again.",
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
          {/* Back Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center mb-6"
          >
            <Ionicons name="arrow-back" size={24} color="#666" />
            <Text size="md" className="text-typography-700 ml-2">
              Back to Login
            </Text>
          </Pressable>

          {/* Header */}
          <VStack space="lg" className="items-center mt-8 mb-8">
            <Box className="w-20 h-20 rounded-full bg-primary-500/20 items-center justify-center mb-4">
              <Ionicons name="key" size={40} color="#3b82f6" />
            </Box>
            <Heading size="2xl" className="text-typography-900">
              Forgot Password
            </Heading>
            <Text size="md" className="text-typography-500 text-center px-8">
              Enter your email address and we'll send you instructions to reset
              your password
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="xl" className="flex-1">
            {/* Email Input */}
            <VStack space="xs">
              {email.length > 0 && (
                <Text size="sm" bold className="text-typography-900 ml-1">
                  Email Address
                </Text>
              )}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="Enter your email address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!loading && !submitted}
                />
              </Input>
              <Text size="xs" className="text-typography-400 ml-1 mt-1">
                Example: user@example.com
              </Text>
            </VStack>

            {/* Submit Button */}
            <Button
              size="lg"
              onPress={handleSubmit}
              isDisabled={loading || submitted}
              className="mt-4"
            >
              {loading && <ButtonSpinner />}
              <ButtonText>
                {loading
                  ? "Sending..."
                  : submitted
                    ? "Email Sent"
                    : "Send Reset Link"}
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

            {/* Sign Up Link */}
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
