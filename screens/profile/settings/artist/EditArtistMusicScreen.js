import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../../../components/buttons/PrimaryButton";
import ArtistMusicForm from "../../../../components/profile/forms/ArtistMusicForm";
import { useUserContext } from "../../../../contexts/UserContext";
import { useAppContext } from "../../../../contexts/AppContext";
import { useModal } from "../../../../contexts/ModalContext";
import { MODAL_TYPES } from "../../../../constants/ModalTypes";
import { saveArtistMusic } from "../../../../services/ProfileService";
import { searchSpotifyArtists, searchAppleMusicArtists } from "../../../../services/MusicLookupService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScreenHeader from "../../../../components/navigation/ScreenHeader";

export default function EditArtistMusicScreen({ navigation }) {
    const { t } = useTranslation();
    const { user, updateUser } = useUserContext();
    const { showToast } = useAppContext();
    const { showModal, hideModal } = useModal();

    const [saving, setSaving] = useState(false);
    const [formState, setFormState] = useState(null);

    const initial = useMemo(() => {
        const music = user?.artist?.music;

        if (music && typeof music === "object") {
            return music;
        }

        return {};
    }, [user]);

    const canSave = useMemo(() => {
        if (saving) {
            return false;
        }

        if (!formState) {
            return false;
        }

        return formState.isValid;
    }, [saving, formState]);

    const save = async () => {
        if (!formState?.isValid) {
            showToast(formState?.errors?.[0] || t("Lūdzu pārbaudi ievadi."), "error");
            return;
        }

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

            const result = await saveArtistMusic(payload);

            hideModal();
            setSaving(false);

            if (!result?.ok) {
                showToast(t("Whoops! Please try again later..."), "error");
                return;
            }

            updateUser(result.payload);
            await AsyncStorage.setItem("user", JSON.stringify(result.payload));

            showToast(t("Profils tika veiksmīgi saglabāts!"), "success");
            navigation.goBack();
        } catch {
            hideModal();
            setSaving(false);
            showToast(t("Looks like there’s a network hiccup. Please check your connection!"), "error");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
            <ScreenHeader
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 140 }}
            >
                <Text className="text-text text-4xl font-extrabold tracking-tight">
                    {t("Ārējie mūzikas profili")}
                </Text>

                <Text className="text-white/70 text-base mt-4 leading-6">
                    {t("Pievieno vismaz 1 mūzikas profilu. Ieteicams: izvēlies Spotify vai Apple no meklēšanas.")}
                </Text>

                <View className="mt-7">
                    <ArtistMusicForm
                        initial={initial}
                        disabled={saving}
                        onChange={setFormState}
                        searchSpotifyArtists={searchSpotifyArtists}
                        searchAppleMusicArtists={searchAppleMusicArtists}
                        appleCountry="LV"
                    />
                </View>
            </ScrollView>

            <View className="px-6 pb-6 pt-4 border-t border-border bg-bg">
                <PrimaryButton
                    title={t("Saglabāt")}
                    disabled={!canSave}
                    onPress={() => {
                        Keyboard.dismiss();
                        save();
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
