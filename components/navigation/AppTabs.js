import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import DashboardScreen from "../../screens/DashboardScreen";
import ProfileScreen from "../../screens/profile/ProfileScreen";
import MessagesScreen from "../../screens/MessagesScreen";

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
    return (
        <MaterialCommunityIcons
            name={name}
            size={24}
            color={focused ? "#775EEB" : "#A1A1AA"}
        />
    );
}

function TabBar({ state, descriptors, navigation }) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="bg-bg border-t border-border px-4 pt-2"
            style={{ paddingBottom: Math.max(insets.bottom, 10) }}
        >
            <View className="flex-row">
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <Pressable
                            key={route.key}
                            onPress={onPress}
                            className="flex-1 items-center justify-center py-3"
                            android_ripple={{ color: "rgba(255,255,255,0.05)" }}
                        >
                            <TabIcon
                                name={options.tabBarIconName}
                                focused={isFocused}
                            />

                            <Text
                                className={`text-[11px] mt-1 ${
                                    isFocused ? "text-primary-5" : "text-muted"
                                }`}
                            >
                                {options.tabBarLabel}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}

export default function AppTabs() {
    return (
        <Tab.Navigator
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
                sceneStyle: { backgroundColor: "#0B0B10" },
            }}
        >
            <Tab.Screen
                name="TabHome"
                component={DashboardScreen}
                options={{
                    tabBarLabel: "Sākums",
                    tabBarIconName: "view-dashboard-outline",
                }}
            />
            <Tab.Screen
                name="TabMessages"
                component={MessagesScreen}
                options={{
                    tabBarLabel: "Čats",
                    tabBarIconName: "chat-processing-outline",
                }}
            />
            <Tab.Screen
                name="TabProfile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: "Profils",
                    tabBarIconName: "account-circle-outline",
                }}
            />
        </Tab.Navigator>
    );
}
