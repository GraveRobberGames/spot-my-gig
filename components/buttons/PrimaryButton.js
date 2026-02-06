import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function PrimaryButton({
                                          title = "Primary",
                                          disabled = false,
                                          onPress,
                                          className = "",
                                          ...props
                                      }) {
    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={onPress}
            activeOpacity={0.9}
            className={`relative px-6 py-4 rounded-full shadow-sm overflow-hidden ${
                disabled
                    ? "bg-white/5 border-0"
                    : "bg-primary-5 border-2 border-primary-5"
            } ${className}`}
            {...props}
        >
            {!disabled && (
                <View className="absolute inset-0 bg-white/10" />
            )}

            {disabled && (
                <View className="absolute inset-0 bg-white/5" />
            )}

            <Text
                className={`text-center font-bold ${
                    disabled ? "text-white/55" : "text-white"
                }`}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{ flexShrink: 1 }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}
