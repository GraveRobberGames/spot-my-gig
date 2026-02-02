import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function SecondaryButton({
                                            title = "Secondary",
                                            disabled = false,
                                            onPress,
                                            className = "",
                                            ...props
                                        }) {
    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={onPress}
            className={`px-6 py-4 rounded-lg border-2 bg-gray-22 border-gray-22 shadow-sm ${className}`}
            {...props}
        >
            <Text className="font-bold text-center text-primary-5">
                {title}
            </Text>
        </TouchableOpacity>
    );
}
