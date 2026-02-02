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
        <View className="w-full">
            <View
                className={`rounded-xl px-4 py-3 border ${
                    disabled
                        ? "border-white/5"
                        : "border-primary-5"
                }`}
            >
                <TextInput
                    className={`text-text text-base w-full leading-5 ${className}`}
                    placeholder={placeholder}
                    placeholderTextColor="#A1A1AA"
                    value={value}
                    onChangeText={onChangeText}
                    editable={!disabled}
                    selectionColor="#775EEB"
                    {...props}
                />
            </View>
        </View>
    );
}
