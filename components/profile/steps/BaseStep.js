import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "../../buttons/PrimaryButton";
import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "../../../contexts/UserContext";
import { useAppContext } from "../../../contexts/AppContext";
import { useModal } from "../../../contexts/ModalContext";
import { MODAL_TYPES } from "../../../constants/ModalTypes";

export default function BaseStep({ submitLabel, onSubmit, onDone, footerNote }) {
    const { t } = useTranslation();
    const { user, updateUser } = useUserContext();
    const { showToast } = useAppContext();
    const { showModal, hideModal } = useModal();
    const insets = useSafeAreaInsets();

    const isWatcher = user?.type === "watcher";
    const isArtist = user?.type === "artist";
    const isVenue = user?.type === "venue";

    const avatarRequired = !isWatcher;

    const [name, setName] = useState(user?.name || "");
    const [avatarUri, setAvatarUri] = useState(user?.avatar_thumb_url || user?.avatar_full_url || null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setName(user?.name || "");
        setAvatarUri(user?.avatar_thumb_url || user?.avatar_full_url || null);
    }, [user?.name, user?.avatar_thumb_url, user?.avatar_full_url, user?.type]);

    const canContinue = !!name.trim() && (!avatarRequired || !!avatarUri);

    const copy = useMemo(() => {
        if (isArtist) {
            return {
                eyebrow: t("Profils"),
                title: t("Parādi savu skatuves identitāti"),
                subtitle: t("Koncertvietas redzēs šo profilu — dari to pievilcīgu un atpazīstamu."),
                avatarLabel: t("Profila foto"),
                nameLabel: t("Skatuves vārds"),
                namePlaceholder: t("Piemēram: Astro’n’out"),
                vibe: "artist",
            };
        }

        if (isVenue) {
            return {
                eyebrow: t("Profils"),
                title: t("Iedod koncertvietai seju"),
                subtitle: t("Mākslinieki ātri sapratīs, vai Tu esi īstā vieta viņu vakaram."),
                avatarLabel: t("Logo vai foto"),
                nameLabel: t("Koncertvietas nosaukums"),
                namePlaceholder: t("Piemēram: Zeit, radošais kvartāls"),
                vibe: "venue",
            };
        }

        return {
            eyebrow: t("Profils"),
            title: t("Sāksim ar pamatiem"),
            subtitle: t("Izvēlies foto (ja vēlies) un ieraksti savu vārdu — pēc tam varēsi sākt atklāt koncertus."),
            avatarLabel: t("Profila foto (nav obligāti)"),
            nameLabel: t("Tavs vārds"),
            namePlaceholder: t("Piemēram: Normunds"),
            vibe: "watcher",
        };
    }, [isArtist, isVenue, t]);

    const bubbleTint =
        copy.vibe === "artist"
            ? "bg-primary-5/24"
            : copy.vibe === "venue"
                ? "bg-accent-cyan/18"
                : "bg-primary-5/18";

    const pickAvatar = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            showToast(t("Nepieciešama piekļuve galerijai"), "error");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.9,
            allowsEditing: true,
            aspect: [1, 1],
        });

        if (!result.canceled && result.assets?.[0]?.uri) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const save = async () => {
        if (saving) {
            return;
        }

        if (!name.trim()) {
            showToast(t("Lūdzu ievadi nosaukumu"), "error");
            return;
        }

        if (avatarRequired && !avatarUri) {
            showToast(t("Lūdzu pievieno profila attēlu"), "error");
            return;
        }

        setSaving(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const result = await onSubmit({ name: name.trim(), avatarUri });

            hideModal();
            setSaving(false);

            if (!result?.ok) {
                showToast(t("Whoops! Please try again later..."), "error");
                return;
            }

            if (result?.payload) {
                updateUser({ ...result.payload });
                await AsyncStorage.setItem("user", JSON.stringify({ ...result.payload }));
            }

            if (onDone) {
                onDone(result.payload);
            }
        } catch {
            hideModal();
            setSaving(false);
            showToast(t("Looks like there’s a network hiccup. Please check your connection!"), "error");
        }
    };

    return (
        <View className="flex-1">
            <View className="absolute inset-0">
                <View className={`absolute -top-36 -right-28 h-96 w-96 rounded-full ${bubbleTint} blur-2xl`} />
                <View className="absolute top-28 -left-32 h-80 w-80 rounded-full bg-accent-cyan/14 blur-2xl" />
                <View className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-primary-5/16 blur-2xl" />
                <View className="absolute -bottom-16 -right-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            </View>

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 18,
                    paddingHorizontal: 24,
                    paddingBottom: Math.max(18, insets.bottom + 18),
                }}
            >
                <View className="mt-2">
                    <View className="flex-row items-center">
                        <View className="h-2 w-2 rounded-full bg-primary-5 mr-2" />
                        <Text className="text-white/60 text-xs font-semibold tracking-wide uppercase">
                            {copy.eyebrow}
                        </Text>
                    </View>

                    <Text className="text-text text-4xl font-extrabold tracking-tight mt-3 leading-[40px]">
                        {copy.title}
                    </Text>

                    <Text className="text-white/75 text-base mt-4 leading-6">
                        {copy.subtitle}
                    </Text>
                </View>

                <View className="mt-10 items-center">
                    <Pressable onPress={pickAvatar} className="items-center">
                        <View className="relative">
                            <View className="absolute inset-0 rounded-full bg-primary-5/35 blur-2xl" />
                            <View className="absolute inset-0 rounded-full bg-accent-cyan/15 blur-2xl" />

                            <View className="h-40 w-40 rounded-full border border-white/12 bg-black/25 items-center justify-center overflow-hidden">
                                {avatarUri ? (
                                    <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <View className="items-center">
                                        <View className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 items-center justify-center">
                                            <MaterialCommunityIcons name="camera-plus-outline" size={22} color="white" />
                                        </View>

                                        <Text className="text-white/80 text-sm font-semibold mt-4">
                                            {copy.avatarLabel}
                                        </Text>

                                        <Text className="text-white/55 text-xs mt-1">
                                            {avatarRequired ? t("Obligāti") : t("Pēc izvēles")}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {!!avatarUri && (
                                <View className="absolute -bottom-2 -right-2">
                                    <View className="relative">
                                        <View className="absolute inset-0 rounded-2xl bg-primary-5/60 blur-md" />
                                        <View className="h-11 w-11 rounded-2xl border border-primary-5/30 bg-black/35 items-center justify-center">
                                            <MaterialCommunityIcons name="pencil-outline" size={18} color="white" />
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>

                        {!!avatarUri && (
                            <Text className="text-white/60 text-xs mt-3">
                                {t("Pieskaries, lai nomainītu")}
                            </Text>
                        )}
                    </Pressable>
                </View>

                <View className="mt-10">
                    <Text className="text-text font-extrabold text-base mb-3">
                        {copy.nameLabel}
                    </Text>

                    <View className="relative">
                        <View className="absolute -top-6 -left-10 h-24 w-24 rounded-full bg-primary-5/20 blur-2xl" />
                        <View className="absolute -bottom-6 -right-10 h-24 w-24 rounded-full bg-accent-cyan/12 blur-2xl" />

                        <PrimaryTextInput
                            placeholder={copy.namePlaceholder}
                            value={name}
                            onChangeText={setName}
                            style={{ fontSize: 18, lineHeight: 20, paddingVertical: 12 }}
                        />
                    </View>
                </View>

                <View className="mt-10">
                    <View className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-primary-5/18 blur-2xl" />
                    <View className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-accent-cyan/12 blur-2xl" />

                    <PrimaryButton
                        title={submitLabel || t("Turpināt")}
                        disabled={!canContinue || saving}
                        onPress={save}
                    />

                    {!!footerNote && (
                        <Text className="text-white/55 text-xs text-center mt-3 leading-4">
                            {footerNote}
                        </Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
