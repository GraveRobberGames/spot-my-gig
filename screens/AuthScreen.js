import React, {useMemo, useState} from "react";
import {View, Text, ScrollView, Keyboard} from "react-native";
import {useTranslation} from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PrimaryButton from "../components/buttons/PrimaryButton";
import PrimaryTextInput from "../components/inputs/PrimaryTextInput";
import CloseButton from "../components/buttons/CloseButton";
import {useAppContext} from "../contexts/AppContext";
import {useUserContext} from "../contexts/UserContext";
import {useModal} from "../contexts/ModalContext";
import {MODAL_TYPES} from "../constants/ModalTypes";
import {API_BASE_URL} from "../constants/Global";
import {LOCALES} from "../constants/Locales";
import {SafeAreaView} from "react-native-safe-area-context";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AuthScreen({navigation, route}) {
    const [email, setEmail] = useState(route?.params?.email || "");
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [emailTouched, setEmailTouched] = useState(false);

    const {showToast} = useAppContext();
    const {showModal, hideModal} = useModal();
    const {setUser} = useUserContext();
    const {t} = useTranslation();

    const emailTrimmed = useMemo(() => (email || "").trim(), [email]);
    const isValidEmail = useMemo(() => EMAIL_REGEX.test(emailTrimmed), [emailTrimmed]);

    const emailError = useMemo(() => {
        if (!emailTouched) {
            return "";
        }

        if (!emailTrimmed) {
            return "";
        }

        if (!isValidEmail) {
            return t("Lūdzu ievadi pareizu e-pasta adresi");
        }

        return "";
    }, [emailTouched, emailTrimmed, isValidEmail, t]);

    const handleClose = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate("WelcomeScreen");
        }
    };

    const getCurrentLocale = async () => {
        const saved = await AsyncStorage.getItem("language");

        if (saved && [LOCALES.EN, LOCALES.LV].includes(saved)) {
            return saved;
        }
        return LOCALES.EN;
    };

    const requestMagicLink = async () => {
        const locale = await getCurrentLocale();
        setButtonDisabled(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const res = await fetch(`${API_BASE_URL}/user/confirm-email`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: emailTrimmed, locale}),
            });
            console.log(res);
            setButtonDisabled(false);

            if (!res.ok) {
                hideModal();
                showToast(t("Whoops! Please try again later..."), "error");
                return;
            }

            const data = await res.json();

            if (data.success) {
                setCooldown(30);

                const interval = setInterval(() => {
                    setCooldown((prev) => {
                        if (prev <= 1) {
                            clearInterval(interval);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);

                showModal(MODAL_TYPES.EMAIL_CONFIRMATION, {
                    email: emailTrimmed,
                    token: data.token,
                });

                setUser({
                    token: data.token,
                    email: data.email,
                    locale,
                });
            } else {
                hideModal();
                showToast(t("Whoops! Please try again later..."), "error");
            }
        } catch {
            hideModal();
            setButtonDisabled(false);
            showToast(t("Looks like there’s a network hiccup. Please check your connection!"), "error");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
            <View className="absolute inset-0">
                <View className="absolute inset-0 bg-black/85"/>
                <View className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-5/35"/>
                <View className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary-3/35"/>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{flexGrow: 1}}
                keyboardShouldPersistTaps="handled"
            >
                <View className="absolute top-1 right-4 z-[999]">
                    <CloseButton onClose={handleClose} width={25} height={25}/>
                </View>

                <View className="flex-1 px-6 pt-8">
                    <Text className="text-text text-3xl font-bold tracking-tight">
                        Spot
                        <Text className="text-primary-5">My</Text>
                        Gig
                    </Text>

                    <Text className="text-text font-extrabold mt-12 text-3xl">
                        {t("Kur nosūtīt apstiprinājuma saiti?")}
                    </Text>

                    <Text className="text-white/75 text-base mt-4 leading-6">
                        {t("Ievadi savu e-pastu, un mēs nosūtīsim Tev apstiprinājuma saiti.")}{" "}
                        {t("Mēs cienām Tavu privātumu.")}
                    </Text>

                    <View className="mt-10 rounded-2xl border border-white/10 bg-black/25 px-5 py-5">
                        <Text className="text-text font-bold text-lg">
                            {t("Tavs e-pasts")}
                        </Text>

                        <View className="mt-3">
                            <PrimaryTextInput
                                style={{lineHeight: 15, paddingVertical: 5}}
                                placeholder={t("hello@gmail.com")}
                                value="normunds.petrovs23@gmail.com"
                                onChangeText={(v) => {
                                    setEmail(v);
                                    if (!emailTouched) {
                                        setEmailTouched(true);
                                    }
                                }}
                                onBlur={() => {
                                    if (!emailTouched) {
                                        setEmailTouched(true);
                                    }
                                }}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="done"
                                onSubmitEditing={() => {
                                    if (!isValidEmail || buttonDisabled || cooldown > 0) {
                                        setEmailTouched(true);
                                        return;
                                    }

                                    Keyboard.dismiss();
                                    requestMagicLink();
                                }}
                            />

                            {!!emailError && (
                                <Text className="text-red-400 text-sm mt-2">
                                    {emailError}
                                </Text>
                            )}
                        </View>

                        <View className="mt-3">
                            {cooldown > 0 ? (
                                <PrimaryButton
                                    title={t("Lūdzu uzgaidi {seconds} sekundes...", {seconds: cooldown})}
                                    disabled
                                />
                            ) : (
                                <PrimaryButton
                                    title={t("Turpināt")}
                                    disabled={!isValidEmail || buttonDisabled}
                                    onPress={() => {
                                        if (!isValidEmail) {
                                            setEmailTouched(true);
                                            return;
                                        }
                                        Keyboard.dismiss();
                                        requestMagicLink();
                                    }}
                                />
                            )}
                        </View>

                        <Text className="text-white/60 text-sm mt-4 leading-5">
                            {t("Ja neredzi ziņu, iemet aci arī savā spam mapē.")}
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
