import React, { useEffect, useMemo, useState } from "react";
import { View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import {
    normalizeSocialInitial,
    normalizeSocialValues,
    countFilledSocialLinks,
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

export default function ArtistSocialMediaForm({ initial, disabled = false, onChange }) {
    const { t } = useTranslation();

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

    const state = useMemo(() => {
        const errors = [];

        if (socialFilledCount < 1) {
            errors.push(t("Lūdzu pievieno vismaz vienu sociālo saiti."));
        }

        return {
            values,
            normalized,
            socialFilledCount,
            isValid: errors.length === 0,
            errors,
        };
    }, [values, normalized, socialFilledCount, t]);

    useEffect(() => {
        if (onChange) {
            onChange(state);
        }
    }, [state, onChange]);

    return (
        <View>
            {SOCIAL_TYPES.map((row) => {
                const key = row.key;

                return (
                    <LinkRow
                        key={key}
                        icon={row.icon}
                        label={t(row.labelKey)}
                        placeholder={row.placeholder}
                        value={values[key]}
                        disabled={disabled}
                        onChangeText={(v) => {
                            setValues((prev) => ({ ...prev, [key]: v }));
                        }}
                    />
                );
            })}
        </View>
    );
}
