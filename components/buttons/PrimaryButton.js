import React from "react";
import {Text, TouchableOpacity} from "react-native";

export default function PrimaryButton({
                                          title = "Primary",
                                          disabled = false,
                                          onPress,
                                          className = "",
                                          ...props
                                      }) {
    const disabledClasses = disabled
        ? "opacity-50 bg-gray-23 border-gray-23"
        : "bg-primary-5 border-primary-5";

    return (
        <TouchableOpacity
            disabled={disabled}
            onPress={onPress}
            className={`px-6 py-4 rounded-lg border-2 shadow-sm ${disabledClasses} ${className}`}
            {...props}
        >
            <Text
                className={disabled ? "text-gray-18 font-bold text-center" : "text-black font-bold text-center"}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{flexShrink: 1}}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}
