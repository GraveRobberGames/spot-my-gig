import React, {useEffect, useMemo, useRef, useState} from "react";
import {View, Text, Pressable} from "react-native";
import {MaterialCommunityIcons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import {useAppContext} from "../../../contexts/AppContext";

function GenreChip({active, label, onPress, disabled}) {
    return (
        <Pressable onPress={onPress} disabled={disabled} className="mr-2 mb-2">
            <View
                className={`px-4 py-2 rounded-full border ${
                    active ? "border-primary-5/60 bg-primary-5/15" : "border-white/10 bg-black/20"
                } ${disabled ? "opacity-40" : "opacity-100"}`}
            >
                <Text className={`text-sm font-semibold ${active ? "text-white" : "text-white/70"}`}>
                    {label}
                </Text>
            </View>
        </Pressable>
    );
}

export default function ArtistGenresDescriptionForm({
                                                        initialDescription = "",
                                                        initialGenres = [],
                                                        onChange,
                                                        descriptionHeight = 160,
                                                    }) {
    const {t} = useTranslation();
    const {showToast} = useAppContext();

    const BIO_MAX = 1200;

    const [bio, setBio] = useState(initialDescription || "");
    const [selectedGenres, setSelectedGenres] = useState(initialGenres || []);
    const touchedRef = useRef(false);

    const genres = useMemo(() => {
        return [
            {key: "pop", label: t("genres.pop", "Pop")},
            {key: "rock", label: t("genres.rock", "Rock")},
            {key: "indie", label: t("genres.indie", "Indie")},
            {key: "hip_hop", label: t("genres.hip_hop", "Hip-hop")},
            {key: "electronic", label: t("genres.electronic", "Electronic")},
            {key: "jazz", label: t("genres.jazz", "Jazz")},
            {key: "folk", label: t("genres.folk", "Folk")},
            {key: "metal", label: t("genres.metal", "Metal")},
            {key: "punk", label: t("genres.punk", "Punk")},
            {key: "rnb", label: t("genres.rnb", "R&B")},
            {key: "soul", label: t("genres.soul", "Soul")},
            {key: "reggae", label: t("genres.reggae", "Reggae")},
            {key: "classical", label: t("genres.classical", "Classical")},
            {key: "blues", label: t("genres.blues", "Blues")},
            {key: "country", label: t("genres.country", "Country")},
            {key: "alternative", label: t("genres.alternative", "Alternative")},
        ];
    }, [t]);

    const state = useMemo(() => {
        const trimmed = (bio || "").trim();

        const errors = [];

        if (!selectedGenres.length) {
            errors.push(t("Lūdzu izvēlies vismaz vienu žanru."));
        }

        if (selectedGenres.length > 3) {
            errors.push(t("Var izvēlēties maksimums 3 žanrus."));
        }

        if (trimmed.length < 20) {
            errors.push(t("Biogrāfijai jābūt vismaz 20 rakstzīmes."));
        }

        return {
            bio,
            genres: selectedGenres,
            bioCount: (bio || "").length,
            bioMax: BIO_MAX,
            isValid: errors.length === 0,
            errors,
        };
    }, [bio, selectedGenres, t]);

    useEffect(() => {
        if (onChange) {
            onChange(state);
        }
    }, [state, onChange]);

    useEffect(() => {
        if (touchedRef.current) {
            return;
        }

        setBio(initialDescription || "");
        setSelectedGenres(initialGenres || []);
    }, [initialDescription, initialGenres]);

    const toggleGenre = (genreKey) => {
        touchedRef.current = true;

        setSelectedGenres((prev) => {
            if (prev.includes(genreKey)) {
                return prev.filter((g) => g !== genreKey);
            }

            if (prev.length >= 3) {
                showToast(t("Var izvēlēties maksimums 3 žanrus."), "error");
                return prev;
            }

            return [...prev, genreKey];
        });
    };

    return (
        <View className="gap-y-4">
            <View className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 overflow-hidden">
                <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl"/>
                <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl"/>

                <Text className="text-text font-extrabold text-sm">
                    {t("Žanri")}
                </Text>

                <View className="mt-4 flex-row flex-wrap">
                    {genres.map((g) => {
                        const active = selectedGenres.includes(g.key);
                        const disabled = !active && selectedGenres.length >= 3;

                        return (
                            <GenreChip
                                key={g.key}
                                label={g.label}
                                active={active}
                                disabled={disabled}
                                onPress={() => toggleGenre(g.key)}
                            />
                        );
                    })}
                </View>

                {!selectedGenres.length && (
                    <View className="mt-3 flex-row items-center">
                        <MaterialCommunityIcons name="alert-circle-outline" size={16} color="white"/>
                        <Text className="text-white/60 text-xs ml-2">
                            {t("Izvēlies vismaz vienu žanru.")}
                        </Text>
                    </View>
                )}
            </View>

            <View className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 overflow-hidden">
                <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl"/>
                <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl"/>

                <View className="flex-row items-center justify-between">
                    <Text className="text-text font-extrabold text-sm">
                        {t("Biogrāfija")}
                    </Text>

                    <Text className="text-white/45 text-xs font-semibold">
                        {t("{count}/{max}", {count: Math.min(BIO_MAX, state.bioCount), max: BIO_MAX})}
                    </Text>
                </View>

                <View className="mt-3 rounded-2xl bg-black/25">
                    <PrimaryTextInput
                        placeholder={t("Pastāsti par sevi, skanējumu, sastāvu, pieredzi, un ko vēlies spēlēt.")}
                        value={bio}
                        onChangeText={(v) => {
                            touchedRef.current = true;

                            if (v.length > BIO_MAX) {
                                setBio(v.slice(0, BIO_MAX));
                                return;
                            }

                            setBio(v);
                        }}
                        multiline
                        style={{
                            minHeight: descriptionHeight,
                            fontSize: 16,
                            lineHeight: 22,
                            paddingVertical: 2,
                        }}
                    />
                </View>

                {((bio || "").trim().length < 20) && (
                    <View className="mt-3 flex-row items-center">
                        <MaterialCommunityIcons name="alert-circle-outline" size={16} color="white"/>
                        <Text className="text-white/60 text-xs ml-2">
                            {t("Biogrāfijai jābūt vismaz 20 rakstzīmes.")}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
