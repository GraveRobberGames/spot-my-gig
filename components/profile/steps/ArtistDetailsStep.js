import React, {useEffect, useMemo, useState} from "react";
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
    const [selectedGenres, setSelectedGenres] = useState(user?.artist?.genres || []);

    const genres = useMemo(() => {
        return [
            t("Pop"),
            t("Rock"),
            t("Indie"),
            t("Hip-hop"),
            t("Electronic"),
            t("Jazz"),
            t("Folk"),
            t("Metal"),
            t("Punk"),
            t("R&B"),
            t("Soul"),
            t("Reggae"),
            t("Classical"),
            t("Blues"),
            t("Country"),
            t("Alternative"),
        ];
    }, [t]);

    useEffect(() => {
        setBio(user?.biography || "");
        setSelectedGenres(user?.artist?.genres || []);
    }, [user?.biography, user?.artist?.genres]);

    const toggleGenre = (genre) => {
        setSelectedGenres((prev) => {
            if (prev.includes(genre)) {
                return prev.filter((g) => g !== genre);
            }

            if (prev.length >= 3) {
                showToast(t("Var izvēlēties maksimums 3 žanrus."), "error");
                return prev;
            }

            return [...prev, genre];
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
                            const active = selectedGenres.includes(g);
                            const disabled = !active && selectedGenres.length >= 3;

                            return (
                                <GenreChip
                                    key={g}
                                    label={g}
                                    active={active}
                                    disabled={disabled}
                                    onPress={() => toggleGenre(g)}
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

                <View className="mt-8 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 overflow-hidden">
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
                                if (v.length > BIO_MAX) {
                                    setBio(v.slice(0, BIO_MAX));
                                    return;
                                }
                                setBio(v);
                            }}
                            multiline
                            style={{ minHeight: 160, fontSize: 16, lineHeight: 22, paddingVertical: 10 }}
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
