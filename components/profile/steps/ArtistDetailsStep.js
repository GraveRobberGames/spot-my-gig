import React, {useEffect, useMemo, useRef, useState} from "react";
import { View, Text, ScrollView, Pressable, Keyboard } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../buttons/PrimaryButton";
import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import { useAppContext } from "../../../contexts/AppContext";
import { useModal } from "../../../contexts/ModalContext";
import { MODAL_TYPES } from "../../../constants/ModalTypes";
import { useUserContext } from "../../../contexts/UserContext";

function GenreChip({ active, label, onPress, disabled }) {
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

export default function ArtistDetailsStep({ submitLabel, onSubmit, onDone }) {
    const { t } = useTranslation();
    const { user } = useUserContext();
    const { showToast } = useAppContext();
    const { showModal, hideModal } = useModal();

    const [saving, setSaving] = useState(false);

    const BIO_MAX = 1200;

    const [bio, setBio] = useState(user?.biography || "");
    const [selectedGenres, setSelectedGenres] = useState(user?.genres || []);

    const genres = useMemo(() => {
        return [
            { key: "pop", label: t("genres.pop", "Pop") },
            { key: "rock", label: t("genres.rock", "Rock") },
            { key: "indie", label: t("genres.indie", "Indie") },
            { key: "hip_hop", label: t("genres.hip_hop", "Hip-hop") },
            { key: "electronic", label: t("genres.electronic", "Electronic") },
            { key: "jazz", label: t("genres.jazz", "Jazz") },
            { key: "folk", label: t("genres.folk", "Folk") },
            { key: "metal", label: t("genres.metal", "Metal") },
            { key: "punk", label: t("genres.punk", "Punk") },
            { key: "rnb", label: t("genres.rnb", "R&B") },
            { key: "soul", label: t("genres.soul", "Soul") },
            { key: "reggae", label: t("genres.reggae", "Reggae") },
            { key: "classical", label: t("genres.classical", "Classical") },
            { key: "blues", label: t("genres.blues", "Blues") },
            { key: "country", label: t("genres.country", "Country") },
            { key: "alternative", label: t("genres.alternative", "Alternative") },
        ];
    }, [t]);

    const touchedRef = useRef(false);

    useEffect(() => {
        if (touchedRef.current) {
            return;
        }

        setBio(user?.biography || "");
        setSelectedGenres(user?.genres || []);
    }, [user?.biography, user?.genres]);

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

    const canContinue = useMemo(() => {
        if (saving) {
            return false;
        }

        if (!selectedGenres.length) {
            return false;
        }

        if (selectedGenres.length > 3) {
            return false;
        }

        if ((bio || "").trim().length < 20) {
            return false;
        }

        return true;
    }, [saving, selectedGenres, bio]);

    const save = async () => {
        if (!canContinue) {
            if (!selectedGenres.length) {
                showToast(t("Lūdzu izvēlies vismaz vienu žanru."), "error");
                return;
            }

            if (selectedGenres.length > 3) {
                showToast(t("Var izvēlēties maksimums 3 žanrus."), "error");
                return;
            }

            if ((bio || "").trim().length < 20) {
                showToast(t("Biogrāfijai jābūt vismaz 20 rakstzīmes."), "error");
                return;
            }

            return;
        }

        setSaving(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const result = await onSubmit({ bio: (bio || "").trim(), genres: selectedGenres });

            hideModal();
            setSaving(false);

            if (!result?.ok) {
                showToast(t("Whoops! Please try again later..."), "error");
                return;
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
                <View className="absolute -top-40 -right-28 h-96 w-96 rounded-full bg-primary-5/22 blur-2xl" />
                <View className="absolute top-24 -left-32 h-80 w-80 rounded-full bg-accent-cyan/14 blur-2xl" />
                <View className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-primary-5/14 blur-2xl" />
                <View className="absolute -bottom-16 -right-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            </View>

            <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 24, paddingBottom: 24 }}
            >
                <View className="mt-2">
                    <View className="flex-row items-center">
                        <View className="h-2 w-2 rounded-full bg-primary-5 mr-2" />
                        <Text className="text-white/60 text-xs font-semibold tracking-wide uppercase">
                            {t("Mākslinieka profils")}
                        </Text>
                    </View>

                    <Text className="text-text text-4xl font-extrabold tracking-tight mt-3 leading-[44px]">
                        {t("Tavs skanējums")}
                    </Text>

                    <Text className="text-white/75 text-base mt-4 leading-6">
                        {t("Izvēlies līdz 3 žanriem, kuros Tu spēlē. Tas palīdzēs koncertvietām Tevi atrast.")}
                    </Text>
                </View>

                <View className="mt-7 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 overflow-hidden">
                    <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
                    <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

                    <View className="flex-row items-center justify-between">
                        <Text className="text-text font-extrabold text-sm">
                            {t("Žanri")}
                        </Text>
                    </View>

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
                            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="white" />
                            <Text className="text-white/60 text-xs ml-2">
                                {t("Izvēlies vismaz vienu žanru.")}
                            </Text>
                        </View>
                    )}

                    {selectedGenres.length >= 3 && (
                        <View className="mt-3 flex-row items-center">
                            <MaterialCommunityIcons name="information-outline" size={16} color="white" />
                            <Text className="text-white/60 text-xs ml-2">
                                {t("Maksimums 3 žanri.")}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 overflow-hidden">
                    <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
                    <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

                    <View className="flex-row items-center justify-between">
                        <Text className="text-text font-extrabold text-sm">
                            {t("Biogrāfija")}
                        </Text>

                        <Text className="text-white/45 text-xs font-semibold">
                            {t("{count}/{max}", { count: Math.min(BIO_MAX, (bio || "").length), max: BIO_MAX })}
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
                            style={{ minHeight: 160, fontSize: 16, lineHeight: 22, paddingVertical: 2 }}
                        />
                    </View>

                    {((bio || "").trim().length < 20) && (
                        <View className="mt-3 flex-row items-center">
                            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="white" />
                            <Text className="text-white/60 text-xs ml-2">
                                {t("Biogrāfijai jābūt vismaz 20 rakstzīmes.")}
                            </Text>
                        </View>
                    )}
                </View>

                <View className="mt-10">
                    <PrimaryButton
                        title={submitLabel || t("Turpināt")}
                        disabled={!canContinue}
                        onPress={() => {
                            Keyboard.dismiss();
                            save();
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
