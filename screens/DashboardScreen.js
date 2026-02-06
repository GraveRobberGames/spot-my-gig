import React, { useEffect, useMemo, useRef, useState } from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {StatusBar, Text, View} from "react-native";

export default function WelcomeScreen({ navigation }) {

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
            <StatusBar barStyle="light-content" />
            <Text className="text-text mt-4 text-base font-semibold">
                Notiek autentifikācija…
            </Text>
        </SafeAreaView>
    );
}
