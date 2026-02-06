import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import PrimaryButton from "../../buttons/PrimaryButton";
import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import { useModal } from "../../../contexts/ModalContext";
import { MODAL_TYPES } from "../../../constants/ModalTypes";
import { useAppContext } from "../../../contexts/AppContext";
import {
    normalizeSocialInitial,
    normalizeSocialValues,
    countFilledSocialLinks,
    toSocialPayload,
} from "../../../helpers/socialLinks";

const SOCIAL_TYPES = [
    { key: "instagram", icon: "instagram", labelKey: "Instagram", placeholder: "instagram.com/yourname" },
    { key: "tiktok", icon: "music-note-outline", labelKey: "TikTok", placeholder: "tiktok.com/@yourname" },
    { key: "facebook", icon: "facebook", labelKey: "Facebook", placeholder: "facebook.com/yourpage" },
    { key: "website", icon: "web", labelKey: "Website", placeholder: "yourdomain.com" },
];

function LinkRow({ icon, label, placeholder, value, onChangeText, disabled }) {
    const filled = (value || "").trim().length > 0;

    return (
        <View className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden mb-4">
            <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
            <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

            <View className="flex-row items-center px-4 pt-4">
                <View className="relative">
                    <View className="absolute inset-0 rounded-2xl bg-primary-5/45 blur-lg" />
                    <View
                        className={`h-11 w-11 rounded-2xl border ${
                            filled ? "border-primary-5/40 bg-primary-5/10" : "border-white/10 bg-white/5"
                        } items-center justify-center`}
                    >
                        <MaterialCommunityIcons name={icon} size={20} color="white" />
                    </View>
                </View>

                <View className="flex-1 pl-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-text font-extrabold text-sm">
                            {label}
                        </Text>

                        {filled && (
                            <View className="flex-row items-center">
                                <View className="h-2 w-2 rounded-full bg-success mr-1.5" />
                                <Text className="text-white/55 text-xs font-semibold">
                                    Pievienots
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-white/55 text-xs mt-0.5">
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
                    editable={!disabled}
                    style={{ fontSize: 16, lineHeight: 20, paddingVertical: 6 }}
                />
            </View>
        </View>
    );
}

export default function ArtistSocialMediaStep({ initial, submitLabel, onSubmit, onDone }) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { showModal, hideModal } = useModal();
    const { showToast } = useAppContext();

    const [saving, setSaving] = useState(false);

    const normalizedInitial = useMemo(() => {
        return normalizeSocialInitial(initial);
    }, [initial]);

    const [values, setValues] = useState(() => {
        return {
            instagram: normalizedInitial.instagram,
            tiktok: normalizedInitial.tiktok,
            facebook: normalizedInitial.facebook,
            website: normalizedInitial.website,
        };
    });

    useEffect(() => {
        setValues({
            instagram: normalizedInitial.instagram,
            tiktok: normalizedInitial.tiktok,
            facebook: normalizedInitial.facebook,
            website: normalizedInitial.website,
        });
    }, [normalizedInitial]);

    const normalized = useMemo(() => {
        return normalizeSocialValues(values);
    }, [values]);

    const socialFilledCount = useMemo(() => {
        return countFilledSocialLinks(normalized);
    }, [normalized]);

    const canContinue = useMemo(() => {
        if (saving) {
            return false;
        }

        if (socialFilledCount < 1) {
            return false;
        }

        return true;
    }, [saving, socialFilledCount]);

    const onPressSave = async () => {
        if (saving) {
            return;
        }

        if (socialFilledCount < 1) {
            showToast(t("Lūdzu pievieno vismaz vienu sociālo saiti."), "error");
            return;
        }

        Keyboard.dismiss();
        setSaving(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const payload = toSocialPayload(values);
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
    };

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
                        {t("Sociālie tīkli")}
                    </Text>

                    <Text className="text-white/75 text-base mt-4 leading-6">
                        {t("Pievieno vismaz 1 sociālo saiti (Instagram/TikTok/Facebook vai mājaslapa).")}
                    </Text>
                </View>

                <View className="mt-8">
                    {SOCIAL_TYPES.map((row) => {
                        const key = row.key;

                        return (
                            <LinkRow
                                key={key}
                                icon={row.icon}
                                label={t(row.labelKey)}
                                placeholder={row.placeholder}
                                value={values[key]}
                                disabled={saving}
                                onChangeText={(v) => {
                                    setValues((prev) => ({ ...prev, [key]: v }));
                                }}
                            />
                        );
                    })}
                </View>

                <View className="mt-10">
                    <PrimaryButton
                        title={submitLabel || t("Turpināt")}
                        disabled={!canContinue || saving}
                        onPress={onPressSave}
                    />
                </View>

                <View className="mt-3">
                    <Text className="text-white/55 text-xs text-center leading-4">
                        {t("Padoms: vari ielīmēt pilnu linku vai tikai lietotājvārdu (piem., @artist).")}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
