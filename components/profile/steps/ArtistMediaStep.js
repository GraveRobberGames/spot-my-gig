import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Keyboard } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import PrimaryButton from "../../buttons/PrimaryButton";
import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import {useModal} from "../../../contexts/ModalContext";
import {MODAL_TYPES} from "../../../constants/ModalTypes";
import {useAppContext} from "../../../contexts/AppContext";

const TYPES = [
    { key: "instagram", icon: "instagram", labelKey: "Instagram", placeholder: "instagram.com/yourname" },
    { key: "tiktok", icon: "music-note-outline", labelKey: "TikTok", placeholder: "tiktok.com/@yourname" },
    { key: "facebook", icon: "facebook", labelKey: "Facebook", placeholder: "facebook.com/yourpage" },
    { key: "website", icon: "web", labelKey: "Website", placeholder: "yourdomain.com" },
];

function normalizeSocialUrl(type, value) {
    const raw = (value || "").trim();

    if (raw === "") {
        return "";
    }

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
        return raw;
    }

    if (raw.startsWith("www.")) {
        return `https://${raw}`;
    }

    if (type === "instagram") {
        if (raw.includes("instagram.com/")) {
            return `https://${raw}`;
        }
        const handle = raw.replace("@", "").replace(/^instagram\.com\//, "").trim();
        return `https://instagram.com/${handle}`;
    }

    if (type === "tiktok") {
        if (raw.includes("tiktok.com/")) {
            return `https://${raw}`;
        }
        const handle = raw.replace("@", "").replace(/^tiktok\.com\//, "").trim();
        return `https://tiktok.com/@${handle}`;
    }

    if (type === "facebook") {
        if (raw.includes("facebook.com/")) {
            return `https://${raw}`;
        }
        const handle = raw.replace(/^facebook\.com\//, "").trim();
        return `https://facebook.com/${handle}`;
    }

    return `https://${raw}`;
}

function SocialRow({ typeKey, icon, label, placeholder, value, onChangeText }) {
    const filled = (value || "").trim().length > 0;

    return (
        <View className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden mb-4">
            <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
            <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

            <View className="flex-row items-center px-4 pt-4">
                <View className="relative">
                    <View className="absolute inset-0 rounded-2xl bg-primary-5/45 blur-lg" />
                    <View className={`h-11 w-11 rounded-2xl border ${filled ? "border-primary-5/40 bg-primary-5/10" : "border-white/10 bg-white/5"} items-center justify-center`}>
                        <MaterialCommunityIcons name={icon} size={20} color="white" />
                    </View>
                </View>

                <View className="flex-1 pl-3">
                    <View className="flex-row items-center">
                        <Text className="text-text font-extrabold text-sm">
                            {label}
                        </Text>

                        {filled && (
                            <View className="ml-2 flex-row items-center">
                                <View className="h-2 w-2 rounded-full bg-primary-5 mr-1.5" />
                                <Text className="text-white/55 text-xs font-semibold">
                                    Linked
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-white/55 text-xs mt-1">
                        {placeholder}
                    </Text>
                </View>
            </View>

            <View className="px-4 pb-4 pt-3">
                <PrimaryTextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{ fontSize: 16, lineHeight: 20, paddingVertical: 12 }}
                />
            </View>
        </View>
    );
}

export default function ArtistMediaStep({ initial = {}, submitLabel, onSubmit, onDone }) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();

    const [saving, setSaving] = useState(false);
    const { showModal, hideModal } = useModal();
    const { showToast } = useAppContext();

    const [values, setValues] = useState({
        instagram: initial.instagram || "",
        tiktok: initial.tiktok || "",
        facebook: initial.facebook || "",
        website: initial.website || "",
    });

    const normalized = useMemo(() => {
        return {
            instagram: normalizeSocialUrl("instagram", values.instagram),
            tiktok: normalizeSocialUrl("tiktok", values.tiktok),
            facebook: normalizeSocialUrl("facebook", values.facebook),
            website: normalizeSocialUrl("website", values.website),
        };
    }, [values]);

    const filledCount = useMemo(() => {
        return Object.values(values).filter((v) => (v || "").trim().length > 0).length;
    }, [values]);

    const canContinue = useMemo(() => {
        if (saving) {
            return false;
        }

        return true;
    }, [saving]);

    return (
        <View className="flex-1">
            <View className="absolute inset-0">
                <View className="absolute -top-40 -right-28 h-96 w-96 rounded-full bg-primary-5/22 blur-2xl" />
                <View className="absolute top-24 -left-32 h-80 w-80 rounded-full bg-accent-cyan/14 blur-2xl" />
                <View className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-primary-5/14 blur-2xl" />
                <View className="absolute -bottom-16 -right-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
                <View className="absolute inset-0 bg-bg" />
                <View className="absolute inset-0 bg-black/65" />
            </View>

            <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingTop: 16,
                    paddingHorizontal: 24,
                    paddingBottom: Math.max(18, insets.bottom + 18),
                }}
            >
                <View className="mt-2">
                    <View className="flex-row items-center">
                        <View className="h-2 w-2 rounded-full bg-primary-5 mr-2" />
                        <Text className="text-white/60 text-xs font-semibold tracking-wide uppercase">
                            {t("Mākslinieka profils")}
                        </Text>
                    </View>

                    <Text className="text-text text-4xl font-extrabold tracking-tight mt-3 leading-[44px]">
                        {t("Saites")}
                    </Text>

                    <Text className="text-white/75 text-base mt-4 leading-6">
                        {t("Pievieno sociālos tīklus, lai koncertvietas var Tevi ātri atrast. Vari pievienot vienu vai vairākas saites.")}
                    </Text>

                    <View className="mt-5 flex-row items-center">
                        <View className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5">
                            <Text className="text-white/70 text-xs font-semibold">
                                {t("{count} pievienotas", { count: filledCount })}
                            </Text>
                        </View>

                        <View className="ml-3 flex-row items-center">
                            <MaterialCommunityIcons name="sparkles" size={14} color="white" />
                            <Text className="text-white/55 text-xs ml-2">
                                {t("Var ierakstīt @vārds vai pilnu saiti — mēs sakārtosim.")}
                            </Text>
                        </View>
                    </View>
                </View>

                <View className="mt-8">
                    {TYPES.map((row) => {
                        return (
                            <SocialRow
                                key={row.key}
                                typeKey={row.key}
                                icon={row.icon}
                                label={t(row.labelKey)}
                                placeholder={row.placeholder}
                                value={values[row.key]}
                                onChangeText={(v) => {
                                    setValues((prev) => ({ ...prev, [row.key]: v }));
                                }}
                            />
                        );
                    })}
                </View>

                <View className="mt-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 overflow-hidden">
                    <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
                    <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

                    <View className="flex-row items-start">
                        <View className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 items-center justify-center">
                            <MaterialCommunityIcons name="link-variant" size={18} color="white" />
                        </View>

                        <View className="flex-1 pl-3">
                            <Text className="text-text font-extrabold text-sm">
                                {t("Priekšskatījums")}
                            </Text>

                            <Text className="text-white/60 text-xs mt-1 leading-4">
                                {t("Tā mēs saglabāsim saites (normalizētas).")}
                            </Text>

                            <View className="mt-3">
                                {Object.entries(normalized).map(([k, v]) => {
                                    if (!v) {
                                        return null;
                                    }

                                    return (
                                        <View key={k} className="flex-row items-center mb-2">
                                            <View className="h-2 w-2 rounded-full bg-primary-5 mr-2" />
                                            <Text className="text-white/80 text-xs font-semibold">
                                                {v}
                                            </Text>
                                        </View>
                                    );
                                })}

                                {!Object.values(normalized).some((v) => !!v) && (
                                    <Text className="text-white/50 text-xs">
                                        {t("Nav pievienotu saišu.")}
                                    </Text>
                                )}
                            </View>
                        </View>
                    </View>
                </View>

                <View className="mt-10">
                    <PrimaryButton
                        title={submitLabel || t("Turpināt")}
                        disabled={!canContinue || saving}
                        onPress={async () => {
                            if (saving) {
                                return;
                            }

                            Keyboard.dismiss();
                            setSaving(true);
                            showModal(MODAL_TYPES.LOADING);

                            try {
                                const payload = {
                                    instagram: normalized.instagram || null,
                                    tiktok: normalized.tiktok || null,
                                    facebook: normalized.facebook || null,
                                    website: normalized.website || null,
                                };

                                const res = await onSubmit(payload);

                                hideModal();
                                setSaving(false);

                                if (!res?.ok) {
                                    showToast(t("Whoops! Please try again later..."), "error");
                                    return;
                                }

                                if (onDone) {
                                    onDone(res.payload);
                                }
                            } catch {
                                hideModal();
                                setSaving(false);
                                showToast(t("Looks like there’s a network hiccup. Please check your connection!"), "error");
                            }
                        }}
                    />
                </View>

                <View className="mt-3">
                    <Text className="text-white/55 text-xs text-center leading-4">
                        {t("Padoms: pietiek ar vienu saiti — bet vairāk saišu palīdz koncertvietām ātrāk sazināties.")}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
