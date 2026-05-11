import { Box } from "@/components/ui/box";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Input, InputField, InputSlot } from "@/components/ui/input";
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

export default function ChangePasswordScreen({ navigation }: any) {
  const token = useAppStore((s: any) => s.token);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Show/hide password states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill in all fields", [
        { text: "OK" },
      ]);
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Weak Password",
        "New password must be at least 6 characters",
        [{ text: "OK" }],
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "New passwords do not match. Please try again.",
        [{ text: "OK" }],
      );
      return;
    }

    if (oldPassword === newPassword) {
      Alert.alert(
        "Same Password",
        "New password must be different from old password",
        [{ text: "OK" }],
      );
      return;
    }

    setLoading(true);

    // Call auth service
    const result = await authService.changePassword(
      oldPassword,
      newPassword,
      token,
    );

    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Success",
        result.message || "Password changed successfully!",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
        { cancelable: false },
      );
    } else {
      Alert.alert(
        "Failed",
        result.error || "Failed to change password. Please try again.",
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
          contentContainerClassName="flex-grow p-6 pb-10"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <VStack space="lg" className="items-center pt-8 pb-6">
            <Box className="w-20 h-20 rounded-full bg-primary-500/20 items-center justify-center mb-2">
              <Text className="text-4xl">🔒</Text>
            </Box>
            <Heading size="xl" className="text-typography-900">
              Change Password
            </Heading>
            <Text size="md" className="text-typography-500 text-center">
              Enter your current and new password
            </Text>
          </VStack>

          {/* Form */}
          <VStack space="lg" className="flex-1 pt-6">
            {/* Current Password Input */}
            <VStack space="xs">
              {oldPassword.length > 0 && (
                <Text size="sm" bold className="text-typography-900 ml-1">
                  Current Password
                </Text>
              )}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="Enter current password"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <InputSlot
                  className="pr-3"
                  onPress={() => setShowOldPassword(!showOldPassword)}
                >
                  <Ionicons
                    name={showOldPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </InputSlot>
              </Input>
            </VStack>

            {/* New Password Input */}
            <VStack space="xs">
              {newPassword.length > 0 && (
                <Text size="sm" bold className="text-typography-900 ml-1">
                  New Password
                </Text>
              )}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <InputSlot
                  className="pr-3"
                  onPress={() => setShowNewPassword(!showNewPassword)}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color="#666"
                  />
                </InputSlot>
              </Input>
            </VStack>

            {/* Confirm New Password Input */}
            <VStack space="xs">
              {confirmPassword.length > 0 && (
                <Text size="sm" bold className="text-typography-900 ml-1">
                  Confirm New Password
                </Text>
              )}
              <Input size="lg" variant="outline">
                <InputField
                  placeholder="Confirm new password"
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

            {/* Change Password Button */}
            <Button
              size="lg"
              onPress={handleChangePassword}
              isDisabled={loading}
              className="mt-8"
            >
              {loading && <ButtonSpinner />}
              <ButtonText>
                {loading ? "Changing..." : "Change Password"}
              </ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
