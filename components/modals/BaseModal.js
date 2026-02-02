import React from "react";
import { Modal, View } from "react-native";

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
            {...props}
        >
            <View className="flex-1 bg-black/90 justify-center text-center p-4 w-full">
                {children}
            </View>
        </Modal>
    );
}
