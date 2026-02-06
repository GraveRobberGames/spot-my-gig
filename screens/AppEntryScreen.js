import React, { useEffect } from "react";
import {View, ActivityIndicator, Text} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "../contexts/UserContext";
import { API_BASE_URL } from "../constants/Global";
import { getProfileStepIndex } from "../components/profile/ProfileFlowConfig";
import {useTranslation} from "react-i18next";

async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function clearAuthStorage() {
    try {
        await AsyncStorage.multiRemove(["user", "api_token"]);
    } catch {
    }
}

export default function AppEntryScreen({ navigation }) {
    const { setUser } = useUserContext();
    const {t} = useTranslation();

    useEffect(() => {
        async function checkUserState() {
            try {
                const token = await AsyncStorage.getItem("api_token");

                if (!token) {
                    await clearAuthStorage();
                    navigation.reset({ index: 0, routes: [{ name: "WelcomeScreen" }] });
                    return;
                }

                const res = await fetch(`${API_BASE_URL}/user/load`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await safeJson(res);

                if (!res.ok || !data?.success || !data?.payload) {
                    await clearAuthStorage();
                    navigation.reset({ index: 0, routes: [{ name: "WelcomeScreen" }] });
                    return;
                }

                const freshUser = data.payload;

                setUser(freshUser);
                await AsyncStorage.setItem("user", JSON.stringify(freshUser));

                const progress = freshUser.profile_progress;

                if (progress?.is_completed) {
                    navigation.reset({ index: 0, routes: [{ name: "AppTabs" }] });
                    return;
                }

                const initialStep = getProfileStepIndex(freshUser?.type, progress?.next_step);

                navigation.reset({
                    index: 0,
                    routes: [{
                        name: "CreateProfile",
                        params: {
                            initialStep,
                            stepKey: progress?.next_step,
                        },
                    }],
                });
            } catch (e) {
                await clearAuthStorage();
                navigation.reset({ index: 0, routes: [{ name: "WelcomeScreen" }] });
            }
        }

        checkUserState();
    }, [navigation, setUser]);

    return (
        <View className="flex-1 bg-bg justify-center items-center">
            <View className="items-center rounded-2xl border border-white/10 bg-black/25 px-8 py-7">
                <ActivityIndicator size="large" color="#775EEB" />

                <Text className="text-text mt-4 text-base font-semibold">
                    {t("Atveram Tavu sesiju…")}
                </Text>

                <Text className="text-white/60 mt-1 text-sm">
                    {t("Lūdzu, uzgaidi mirkli")}
                </Text>
            </View>
        </View>
    );
}
