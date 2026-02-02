import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StatusBar, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Video, ResizeMode, Audio } from "expo-av";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PrimaryButton from "../components/buttons/PrimaryButton";
import SecondaryButton from "../components/buttons/SecondaryButton";

const VIDEO_SOURCE = require("../assets/videos/intro.mp4");

export default function WelcomeScreen({ navigation }) {
    const videoRef = useRef(null);
    const [videoReady, setVideoReady] = useState(false);
    const { t } = useTranslation();
    const [user] = useState(null);

    const checkpoints = useMemo(
        () => [
            { text: t("Savienosim Tevi ar koncertvietu") },
            { text: t("Dabūsim labāko honorāra piedāvājumu") },
            { text: t("Sakārtosim papīrus un uzturēsim Tavu kalendāru") },
        ],
        [t]
    );

    useEffect(() => {
        (async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (e) {}
        })();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
            <StatusBar barStyle="light-content" />
            <View className="absolute inset-0">
                <Video
                    ref={videoRef}
                    source={VIDEO_SOURCE}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay
                    isLooping
                    isMuted
                    onReadyForDisplay={() => setVideoReady(true)}
                    style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
                />

                <View className="absolute inset-0 bg-black/80" />
                <View className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-5/35" />
                <View className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent-cyan/20" />

                {!videoReady && <View className="absolute inset-0 bg-bg" />}
            </View>

            <View className="flex-1 px-6">
                <View className="pt-7">
                    <Text className="text-text text-3xl font-bold tracking-tight">
                        Spot<Text className="text-primary-5">My</Text>Gig
                    </Text>

                    <Text className="text-text font-extrabold mt-16 text-5xl leading-[50px]">
                        {t("Vieta, kur satiekas")}
                        {"\n"}
                        {t("koncertvietas un")}
                        {"\n"}
                        {t("mākslinieki")}
                    </Text>

                    <View className="mt-12 rounded-2xl border border-white/10 bg-black/25 px-5 py-5">
                        <Text className="text-text font-bold text-lg">
                            {t("Mēs parūpēsimies par visu!")}
                        </Text>

                        <View className="mt-4 gap-y-3">
                            {checkpoints.map((item, idx) => {
                                const isLast = idx === checkpoints.length - 1;

                                return (
                                    <View key={idx} className="relative flex-row items-center">
                                        <View className="relative items-center mr-4">
                                            <View className="relative">
                                                <View className="absolute inset-0 rounded-xl bg-primary-5/80 blur-md" />

                                                <View className="rounded-xl bg-white/10 border border-white/15 items-center justify-center h-10 w-10">
                                                    <MaterialCommunityIcons name="check" size={18} color="white" />
                                                </View>
                                            </View>

                                            {!isLast && (
                                                <View
                                                    className="absolute left-1/2 -translate-x-[1px] w-[2px] bg-white/10 top-10"
                                                    style={{ height: "100%" }}
                                                />
                                            )}
                                        </View>

                                        <View className="flex-1">
                                            <Text className="text-white font-semibold text-base leading-6">
                                                {item.text}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>

                <View className="mt-auto pb-6 pt-5">
                    {user && user.email ? (
                        <View className="gap-y-3">
                            <PrimaryButton
                                title={t("Pieslēgties kā {{email}}", { email: user.email })}
                                onPress={() => navigation.navigate("AuthScreen", { email: user.email })}
                            />
                            <SecondaryButton
                                title={t("Izvēlēties citu profilu")}
                                onPress={() => navigation.navigate("AuthScreen")}
                            />
                        </View>
                    ) : (
                        <View className="gap-y-2">
                            <PrimaryButton title={t("Izveidot profilu")} onPress={() => navigation.navigate("AuthScreen")} />
                            <SecondaryButton title={t("Ienākt")} onPress={() => navigation.navigate("AuthScreen")} />
                        </View>
                    )}

                    <Text className="text-white/85 text-xs text-center mt-4 leading-4">
                        {t("Pieslēdzoties platformai, Tu piekrīti mūsu")}{" "}
                        <Text className="font-bold underline" onPress={() => Linking.openURL("https://www.meetatbar.com/terms")}>
                            {t("Lietošanas noteikumiem")}
                        </Text>
                        . {t("Uzzini kā mēs apstrādājam Tavus datus")}{" "}
                        <Text className="font-bold underline" onPress={() => Linking.openURL("https://www.meetatbar.com/privacy-policy")}>
                            {t("Privātuma politikā")}
                        </Text>
                        .
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
