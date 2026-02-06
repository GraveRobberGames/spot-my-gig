import React, {useMemo, useState} from "react";
import {View, Text, Pressable, ScrollView} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import PrimaryButton from "../../buttons/PrimaryButton";
import {useTranslation} from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {API_BASE_URL} from "../../../constants/Global";
import {useUserContext} from "../../../contexts/UserContext";
import {useAppContext} from "../../../contexts/AppContext";
import {useModal} from "../../../contexts/ModalContext";
import {MODAL_TYPES} from "../../../constants/ModalTypes";

const USER_TYPES = {
    WATCHER: "watcher",
    VENUE: "venue",
    ARTIST: "artist",
};

function FeatureRow({text}) {
    return (
        <View className="flex-row items-center mt-2">
            <View className="h-5 w-5 rounded-lg border border-white/10 bg-white/5 items-center justify-center">
                <MaterialCommunityIcons name="check" size={14} color="white" />
            </View>
            <Text className="text-white/75 text-xs ml-2 leading-4 flex-1">
                {text}
            </Text>
        </View>
    );
}

function TypeCard({active, title, subtitle, iconName, features, onPress}) {
    return (
        <Pressable onPress={onPress} className="mb-4">
            <View className={`rounded-2xl border overflow-hidden ${active ? "border-primary-5/60" : "border-white/10"}`}>
                <View className="relative">
                    <View
                        className={`absolute -top-10 -right-10 h-40 w-40 rounded-full ${
                            active ? "bg-primary-5/30" : "bg-white/5"
                        } blur-2xl`}
                    />
                    <View
                        className={`absolute -bottom-12 -left-12 h-44 w-44 rounded-full ${
                            active ? "bg-accent-cyan/18" : "bg-white/5"
                        } blur-2xl`}
                    />

                    <View className={`${active ? "bg-primary-5/10" : "bg-black/20"} px-5 py-5`}>
                        <View className="flex-row items-start">
                            <View className="mr-4">
                                <View className="relative">
                                    <View
                                        className={`absolute inset-0 rounded-2xl ${
                                            active ? "bg-primary-5/55" : "bg-white/10"
                                        } blur-md`}
                                    />
                                    <View
                                        className={`h-12 w-12 rounded-2xl items-center justify-center border ${
                                            active ? "border-primary-5/35 bg-primary-5/15" : "border-white/10 bg-white/5"
                                        }`}
                                    >
                                        <MaterialCommunityIcons name={iconName} size={22} color="white" />
                                    </View>
                                </View>
                            </View>

                            <View className="flex-1">
                                <Text className="text-text text-lg font-extrabold">
                                    {title}
                                </Text>

                                <Text className="text-white/70 text-sm mt-2 leading-5">
                                    {subtitle}
                                </Text>

                                <View className="mt-4">
                                    {features.map((f, idx) => (
                                        <FeatureRow key={idx} text={f} />
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

export default function ChooseTypeStep({onTypeSaved}) {
    const {t} = useTranslation();
    const {user, updateUser} = useUserContext();
    const {showToast} = useAppContext();
    const {showModal, hideModal} = useModal();
    const insets = useSafeAreaInsets();

    const [selectedType, setSelectedType] = useState(user?.type || USER_TYPES.ARTIST);
    const [saving, setSaving] = useState(false);

    const cards = useMemo(() => {
        return [
            {
                type: USER_TYPES.ARTIST,
                title: t("Mākslinieks"),
                subtitle: t("Izveido profilu un saņem koncertu piedāvājumus — mēs palīdzēsim ar procesu no A līdz Z."),
                iconName: "guitar-electric",
                features: [
                    t("Piesakies koncertiem un saņem piedāvājumus"),
                    t("Parādi savu skaņu un sociālos tīklus"),
                    t("Sakārtots kalendārs un vienošanās"),
                ],
            },
            {
                type: USER_TYPES.VENUE,
                title: t("Koncertvieta"),
                subtitle: t("Ātri atrod māksliniekus, organizē vakarus un saņem pieteikumus vienā plūsmā."),
                iconName: "storefront-outline",
                features: [
                    t("Publicē pasākumus un brīvos datumus"),
                    t("Saņem pieteikumus un piedāvājumus"),
                    t("Ērta komunikācija ar māksliniekiem"),
                ],
            },
            {
                type: USER_TYPES.WATCHER,
                title: t("Skatītājs"),
                subtitle: t("Atrodi koncertus un seko māksliniekiem — viss vienuviet, bez liekas meklēšanas."),
                iconName: "account-eye-outline",
                features: [
                    t("Seko māksliniekiem un pasākumiem"),
                    t("Saņem ieteikumus pēc gaumes"),
                    t("Saglabā iecienītos vakarus"),
                ],
            },
        ];
    }, [t]);

    const saveType = async () => {
        if (saving) {
            return;
        }

        setSaving(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const apiToken = await AsyncStorage.getItem("api_token");

            const res = await fetch(`${API_BASE_URL}/profile/set-type`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(apiToken ? {Authorization: `Bearer ${apiToken}`} : {}),
                },
                body: JSON.stringify({ type: selectedType })
            });

            let data = null;

            try {
                data = await res.json();
            } catch {}

            if (!res.ok || !data?.success) {
                hideModal();
                setSaving(false);
                showToast(t("Whoops! Please try again later..."), "error");
                return;
            }

            hideModal();
            setSaving(false);

            if (data?.payload) {
                updateUser({...data.payload});
                await AsyncStorage.setItem("user", JSON.stringify({...data.payload}));
            }

            if (onTypeSaved) {
                onTypeSaved(selectedType, data?.payload);
            }
        } catch (e) {
            hideModal();
            setSaving(false);
            showToast(t("Looks like there’s a network hiccup. Please check your connection!"), "error");
        }
    };

    return (
        <View className="flex-1">
            <View className="absolute inset-0">
                <View className="absolute -top-32 -right-28 h-80 w-80 rounded-full bg-primary-5/24 blur-2xl" />
                <View className="absolute top-24 -left-28 h-72 w-72 rounded-full bg-accent-cyan/16 blur-2xl" />
                <View className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-primary-5/16 blur-2xl" />
            </View>

            <View className="px-6 pt-6 pb-2">
                <Text className="text-text text-4xl font-extrabold tracking-tight">
                    {t("Kas Tu esi?")}
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 16,
                    paddingHorizontal: 24,
                    paddingBottom: Math.max(18, insets.bottom + 18),
                }}
            >
                {cards.map((card) => (
                    <TypeCard
                        key={card.type}
                        active={selectedType === card.type}
                        title={card.title}
                        subtitle={card.subtitle}
                        iconName={card.iconName}
                        features={card.features}
                        onPress={() => setSelectedType(card.type)}
                    />
                ))}

                <View className="mt-6">
                    <View className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-primary-5/18 blur-2xl" />
                    <View className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-accent-cyan/12 blur-2xl" />

                    <PrimaryButton
                        title={t("Turpināt")}
                        disabled={saving || !selectedType}
                        onPress={saveType}
                    />

                    <Text className="text-white/55 text-xs text-center mt-3 leading-4">
                        {t("Svarīgi: izvēlies rūpīgi — profila tipu vēlāk mainīt nevarēs.")}
                    </Text>
                </View>

                <View style={{ height: 10 }} />
            </ScrollView>
        </View>
    );
}
