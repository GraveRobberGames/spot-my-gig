import React from "react";
import { Modal, View, Pressable } from "react-native";

export default function BaseModal({
                                      visible,
                                      onClose,
                                      animationType = "fade",
                                      children,
                                      ...props
                                  }) {
    return (
        <Modal
            visible={visible}
            animationType={animationType}
            transparent
            onRequestClose={onClose}
            statusBarTranslucent
            {...props}
        >
            <View className="flex-1">
                <Pressable onPress={onClose} className="absolute inset-0 bg-black/95" />

                <View className="flex-1 justify-center px-4">
                    <View className="p-5">
                        {children}
                    </View>
                </View>
            </View>
        </Modal>
    );
}
