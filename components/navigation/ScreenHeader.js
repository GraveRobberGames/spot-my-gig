import React from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreenHeader({ title, onBack }) {
    const insets = useSafeAreaInsets();

    return (
        <View
            className="px-6 pb-3 border-b border-border bg-bg"
        >
            <View className="flex-row items-center">
                <Pressable
                    onPress={onBack}
                    className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 items-center justify-center mr-3"
                >
                    <MaterialCommunityIcons name="arrow-left" size={22} color="white" />
                </Pressable>
            </View>
        </View>
    );
}
