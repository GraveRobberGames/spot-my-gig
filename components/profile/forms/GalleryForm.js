import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import * as ImagePicker from "expo-image-picker";

function uid() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function GalleryTile({ item, disabled, onRemove }) {
    return (
        <View className="w-1/3 p-1.5">
            <View className="relative rounded-2xl border border-white/10 bg-black/20 overflow-hidden aspect-square">
                <Image source={{ uri: item.uri }} className="w-full h-full" resizeMode="cover" />

                {!disabled && (
                    <Pressable
                        onPress={() => onRemove(item.id)}
                        className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 border border-white/10 items-center justify-center"
                    >
                        <MaterialCommunityIcons name="close" size={16} color="white" />
                    </Pressable>
                )}
            </View>
        </View>
    );
}

export default function GalleryForm({
                                        initial = [],
                                        disabled = false,
                                        minCount = 5,
                                        maxCount = 12,
                                        onChange,
                                    }) {
    const { t } = useTranslation();

    const initialItems = useMemo(() => {
        const list = Array.isArray(initial) ? initial : [];

        return list
            .map((x) => {
                const uri = String(x?.url || x?.uri || "").trim();
                const path = String(x?.path || "").trim();

                if (uri === "") {
                    return null;
                }

                return {
                    id: String(x?.id || path || uri || uid()),
                    uri,
                    existing: path !== "",
                    path,
                };
            })
            .filter(Boolean);
    }, [initial]);

    const [items, setItems] = useState(initialItems);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const pickMore = async () => {
        if (disabled) {
            return;
        }

        if (items.length >= maxCount) {
            return;
        }

        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!perm?.granted) {
            return;
        }

        const remaining = Math.max(0, maxCount - items.length);

        const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            selectionLimit: remaining,
            quality: 0.9,
        });

        if (res?.canceled) {
            return;
        }

        const assets = Array.isArray(res?.assets) ? res.assets : [];

        setItems((prev) => {
            const next = [...prev];

            assets.forEach((a) => {
                const uri = String(a?.uri || "").trim();

                if (uri === "") {
                    return;
                }

                next.push({
                    id: uid(),
                    uri,
                    existing: false,
                    path: "",
                });
            });

            return next.slice(0, maxCount);
        });
    };

    const removeOne = (id) => {
        if (disabled) {
            return;
        }

        setItems((prev) => {
            return prev.filter((x) => x.id !== id);
        });
    };

    const state = useMemo(() => {
        const errors = [];

        if (items.length < minCount) {
            errors.push(t("Lūdzu pievieno vismaz {count} bildes.", { count: minCount }));
        }

        if (items.length > maxCount) {
            errors.push(t("Maksimums {count} bildes.", { count: maxCount }));
        }

        const existing = items
            .filter((x) => x.existing && String(x.path || "").trim() !== "")
            .map((x) => x.path);

        const newFiles = items
            .filter((x) => !x.existing)
            .map((x) => x.uri);

        return {
            items,
            existing,
            newFiles,
            count: items.length,
            isValid: errors.length === 0,
            errors,
        };
    }, [items, minCount, maxCount, t]);

    useEffect(() => {
        if (onChange) {
            onChange(state);
        }
    }, [state, onChange]);

    return (
        <View>
            <View className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden">
                <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
                <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

                <View className="px-4 py-4">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-text font-extrabold text-sm">
                            {t("Galerija")}
                        </Text>

                        <Text className="text-white/55 text-xs font-semibold">
                            {t("{count}/{max}", { count: state.count, max: maxCount })}
                        </Text>
                    </View>

                    <Text className="text-white/65 text-xs mt-2 leading-4">
                        {t("Pievieno vismaz {min} bildes. Vari pievienot līdz {max}.", { min: minCount, max: maxCount })}
                    </Text>

                    <View className="mt-4 -mx-1.5 flex-row flex-wrap">
                        {items.map((it) => {
                            return (
                                <GalleryTile
                                    key={it.id}
                                    item={it}
                                    disabled={disabled}
                                    onRemove={removeOne}
                                />
                            );
                        })}
                    </View>

                    <View className="mt-3">
                        <Pressable
                            onPress={pickMore}
                            disabled={disabled || items.length >= maxCount}
                            className={`rounded-2xl border px-4 py-4 flex-row items-center justify-center ${
                                disabled || items.length >= maxCount
                                    ? "border-white/10 bg-white/5 opacity-60"
                                    : "border-primary-5/35 bg-primary-5/10"
                            }`}
                        >
                            <MaterialCommunityIcons name="plus" size={18} color="white" />
                            <Text className="text-white font-extrabold ml-2">
                                {t("Pievienot bildes")}
                            </Text>
                        </Pressable>
                    </View>

                    {!state.isValid && (
                        <View className="mt-3 flex-row items-center">
                            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="white" />
                            <Text className="text-white/60 text-xs ml-2">
                                {state.errors[0]}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}
