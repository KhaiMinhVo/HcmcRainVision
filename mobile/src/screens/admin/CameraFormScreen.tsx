import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cameraService } from "../../services/cameras";
import useAppStore from "../../store/useAppStore";

export default function CameraFormScreen({ navigation, route }: any) {
    const { camera, mode } = route.params || {}; // mode: 'create' | 'edit'
    const isEdit = mode === "edit";

    const user = useAppStore((s) => s.user);

    const [id, setId] = useState(camera?.id || "");
    const [name, setName] = useState(camera?.name || "");
    const [latitude, setLatitude] = useState(camera?.latitude?.toString() || "");
    const [longitude, setLongitude] = useState(camera?.longitude?.toString() || "");
    const [wardId, setWardId] = useState(camera?.wardId || "");
    const [streamUrl, setStreamUrl] = useState(camera?.streamUrl || "");

    // Specific to Create
    const [streamType, setStreamType] = useState("HLS");

    // Specific to Edit
    const [status, setStatus] = useState(camera?.status || "Active");

    const [loading, setLoading] = useState(false);

    // Secure Guard: Only Admin
    if (user?.role !== "Admin") {
        return (
            <Box className="flex-1 bg-white items-center justify-center p-4">
                <Text className="text-xl font-bold text-red-600 mb-2">Access Denied</Text>
                <Text className="text-gray-600 text-center mb-4">You do not have permission to access camera management.</Text>
                <Button onPress={() => navigation.goBack()}>
                    <ButtonText>Go Back</ButtonText>
                </Button>
            </Box>
        );
    }

    const handleSave = async () => {
        // Basic validations
        if (!name || !latitude || !longitude || !wardId || !streamUrl) {
            Alert.alert("Validation Error", "Please fill in all required fields.");
            return;
        }
        if (!isEdit && !id) {
            Alert.alert("Validation Error", "Camera ID is required for creation.");
            return;
        }

        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        if (isNaN(lat) || isNaN(lng)) {
            Alert.alert("Validation Error", "Latitude and Longitude must be valid numbers.");
            return;
        }

        setLoading(true);

        try {
            if (isEdit) {
                // PUT /api/Camera/{id}
                const payload = {
                    name,
                    latitude: lat,
                    longitude: lng,
                    wardId,
                    status,
                    streamUrl,
                };
                const res = await cameraService.updateCamera(id, payload);
                if (res.success) {
                    Alert.alert("Success", "Camera updated successfully", [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                } else {
                    Alert.alert("Error", res.error || "Failed to update camera");
                }
            } else {
                // POST /api/Camera
                const payload = {
                    id,
                    name,
                    latitude: lat,
                    longitude: lng,
                    wardId,
                    streamUrl,
                    streamType,
                };
                const res = await cameraService.createCamera(payload);
                if (res.success) {
                    Alert.alert("Success", "Camera created successfully", [
                        { text: "OK", onPress: () => navigation.goBack() }
                    ]);
                } else {
                    Alert.alert("Error", res.error || "Failed to create camera");
                }
            }
        } catch (e: any) {
            Alert.alert("Error", e.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box className="flex-1 bg-gray-50">
            <StatusBar style="dark" />
            <SafeAreaView edges={["top"]}>
                <HStack className="items-center px-4 py-3 bg-white border-b border-gray-200">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
                        <ChevronLeft size={24} color="#111827" />
                    </TouchableOpacity>
                    <Heading size="lg" className="text-gray-900 font-bold flex-1">
                        {isEdit ? "Edit Camera" : "Create Camera"}
                    </Heading>
                </HStack>
            </SafeAreaView>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                <VStack className="bg-white p-4 rounded-xl border border-gray-200 gap-4 mb-8">

                    {!isEdit && (
                        <VStack className="gap-1">
                            <Text className="text-sm font-semibold text-gray-700">Camera ID *</Text>
                            <Input variant="outline" size="md">
                                <InputField value={id} onChangeText={setId} placeholder="e.g. CAM_001" />
                            </Input>
                        </VStack>
                    )}

                    <VStack className="gap-1">
                        <Text className="text-sm font-semibold text-gray-700">Name *</Text>
                        <Input variant="outline" size="md">
                            <InputField value={name} onChangeText={setName} placeholder="Camera junction name" />
                        </Input>
                    </VStack>

                    <HStack className="gap-3">
                        <VStack className="flex-1 gap-1">
                            <Text className="text-sm font-semibold text-gray-700">Latitude *</Text>
                            <Input variant="outline" size="md">
                                <InputField value={latitude} onChangeText={setLatitude} keyboardType="numeric" placeholder="10.8..." />
                            </Input>
                        </VStack>
                        <VStack className="flex-1 gap-1">
                            <Text className="text-sm font-semibold text-gray-700">Longitude *</Text>
                            <Input variant="outline" size="md">
                                <InputField value={longitude} onChangeText={setLongitude} keyboardType="numeric" placeholder="106.6..." />
                            </Input>
                        </VStack>
                    </HStack>

                    <VStack className="gap-1">
                        <Text className="text-sm font-semibold text-gray-700">Ward ID *</Text>
                        <Input variant="outline" size="md">
                            <InputField value={wardId} onChangeText={setWardId} placeholder="e.g. W_001" />
                        </Input>
                    </VStack>

                    <VStack className="gap-1">
                        <Text className="text-sm font-semibold text-gray-700">Stream URL *</Text>
                        <Input variant="outline" size="md">
                            <InputField value={streamUrl} onChangeText={setStreamUrl} placeholder="http://..." />
                        </Input>
                    </VStack>

                    {!isEdit && (
                        <VStack className="gap-1">
                            <Text className="text-sm font-semibold text-gray-700">Stream Type *</Text>
                            <Input variant="outline" size="md">
                                <InputField value={streamType} onChangeText={setStreamType} placeholder="e.g. HLS" />
                            </Input>
                        </VStack>
                    )}

                    {isEdit && (
                        <VStack className="gap-1">
                            <Text className="text-sm font-semibold text-gray-700">Status *</Text>
                            <Input variant="outline" size="md">
                                <InputField value={status} onChangeText={setStatus} placeholder="Active / Offline" />
                            </Input>
                        </VStack>
                    )}

                    <Button onPress={handleSave} disabled={loading} className="mt-4 bg-blue-600">
                        {loading ? <Spinner size="small" color="white" /> : <ButtonText>Save Camera</ButtonText>}
                    </Button>

                </VStack>
            </ScrollView>
        </Box>
    );
}
