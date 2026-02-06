import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Keyboard } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../buttons/PrimaryButton";
import ArtistMusicForm from "../../profile/forms/ArtistMusicForm";
import { useModal } from "../../../contexts/ModalContext";
import { MODAL_TYPES } from "../../../constants/ModalTypes";
import { useAppContext } from "../../../contexts/AppContext";
import { API_BASE_URL } from "../../../constants/Global";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

async function getAuthHeaders() {
    const token = await AsyncStorage.getItem("api_token");

    if (!token) {
        return {};
    }

    return { Authorization: `Bearer ${token}` };
}

async function searchSpotifyArtists(query) {
    const q = (query || "").trim();

    if (q.length < 2) {
        return { ok: true, results: [] };
    }

    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/spotify/artists/search?query=${encodeURIComponent(q)}`, {
        method: "GET",
        headers: { ...headers },
    });

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, results: [] };
    }

    return { ok: true, results: data.results || [] };
}

async function searchAppleMusicArtists(query, country = "LV") {
    const q = (query || "").trim();

    if (q.length < 2) {
        return { ok: true, results: [] };
    }

    const headers = await getAuthHeaders();

    const res = await fetch(
        `${API_BASE_URL}/apple-music/artists?query=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`,
        { method: "GET", headers: { ...headers } }
    );

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, results: [] };
    }

    return { ok: true, results: data.results || [] };
}

export default function ArtistMusicStep({ initial, submitLabel, onSubmit, onDone }) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { showModal, hideModal } = useModal();
    const { showToast } = useAppContext();

    const [saving, setSaving] = useState(false);
    const [formState, setFormState] = useState(null);

    const canContinue = useMemo(() => {
        if (saving) {
            return false;
        }

        if (!formState) {
            return false;
        }

        return formState.isValid;
    }, [saving, formState]);

    const onPressSave = async () => {
        if (!formState?.isValid) {
            showToast(formState?.errors?.[0] || t("Lūdzu pārbaudi ievadi."), "error");
            return;
        }

        Keyboard.dismiss();
        setSaving(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const n = formState.normalized;

            const payload = {
                spotify: n.spotify || null,
                spotify_artist_id: n.spotify_artist_id || null,
                spotify_artist_name: n.spotify_artist_name || null,
                spotify_artist_image: n.spotify_artist_image || null,

                apple_music: n.apple_music || null,
                apple_music_artist_id: n.apple_music_artist_id || null,
                apple_music_artist_name: n.apple_music_artist_name || null,
                apple_music_artist_image: n.apple_music_artist_image || null,

                youtube: n.youtube || null,
                soundcloud: n.soundcloud || null,
                bandcamp: n.bandcamp || null,
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
                        {t("Ārējie mūzikas profili")}
                    </Text>

                    <Text className="text-white/75 text-base mt-4 leading-6">
                        {t("Pievieno vismaz 1 mūzikas profilu. Ieteicams: izvēlies Spotify vai Apple no meklēšanas.")}
                    </Text>
                </View>

                <View className="mt-8">
                    <ArtistMusicForm
                        initial={initial}
                        disabled={saving}
                        onChange={setFormState}
                        searchSpotifyArtists={searchSpotifyArtists}
                        searchAppleMusicArtists={searchAppleMusicArtists}
                        appleCountry="LV"
                    />
                </View>

                <View className="mt-4">
                    <PrimaryButton
                        title={submitLabel || t("Turpināt")}
                        disabled={!canContinue || saving}
                        onPress={onPressSave}
                    />
                </View>

                <View className="mt-3">
                    <Text className="text-white/55 text-xs text-center leading-4">
                        {t("Padoms: visvieglāk ir izvēlēties Spotify/Apple no meklēšanas, bet vari arī ielīmēt linkus (YouTube/SoundCloud/Bandcamp).")}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
