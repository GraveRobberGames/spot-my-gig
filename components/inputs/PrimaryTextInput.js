import React from "react";
import { TextInput, View } from "react-native";

export default function PrimaryTextInput({
                                             placeholder = "Primary",
                                             disabled = false,
                                             value,
                                             onChangeText,
                                             className = "",
                                             ...props
                                         }) {
    return (
        <View className="relative w-full">
            <View className="border border-gray-22 rounded-lg px-4 py-3">
                <TextInput
                    className={`text-white text-base pb-1 w-full ${className}`}
                    placeholder={placeholder}
                    placeholderTextColor="#888DAA"
                    value={value}
                    onChangeText={onChangeText}
                    editable={!disabled}
                    {...props}
                />
            </View>
        </View>
    );
}
