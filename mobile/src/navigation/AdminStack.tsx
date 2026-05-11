import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import AdminAuditDataScreen from "../screens/admin/AdminAuditDataScreen";
import AdminCamerasScreen from "../screens/admin/AdminCamerasScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminJobDetailScreen from "../screens/admin/AdminJobDetailScreen";
import AdminJobsScreen from "../screens/admin/AdminJobsScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";

const Stack = createNativeStackNavigator();

export default function AdminStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: true,
                headerBackTitle: "Back",
            }}
            initialRouteName="AdminDashboard"
        >
            <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{ title: "Admin Dashboard" }}
            />
            <Stack.Screen
                name="AdminAuditData"
                component={AdminAuditDataScreen}
                options={{ title: "Audit Data" }}
            />
            <Stack.Screen
                name="AdminUsers"
                component={AdminUsersScreen}
                options={{ title: "Manage Users" }}
            />
            <Stack.Screen
                name="AdminCameras"
                component={AdminCamerasScreen}
                options={{ title: "Camera Health" }}
            />
            <Stack.Screen
                name="AdminJobs"
                component={AdminJobsScreen}
                options={{ title: "Ingestion Jobs" }}
            />
            <Stack.Screen
                name="AdminJobDetail"
                component={AdminJobDetailScreen}
                options={{ title: "Job Details" }}
            />
        </Stack.Navigator>
    );
}
