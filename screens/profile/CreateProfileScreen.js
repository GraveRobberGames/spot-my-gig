import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUserContext } from "../../contexts/UserContext";

import { getProfileStepsForUserType, PROFILE_STEP_KEYS } from "../../components/profile/ProfileFlowConfig";
import ProfileProgressBar from "../../components/profile/ProfileProgressBar";

import ChooseTypeStep from "../../components/profile/steps/ChooseTypeStep";
import BaseStep from "../../components/profile/steps/BaseStep";
import WatcherPreferencesStep from "../../components/profile/steps/WatcherPreferencesStep";
import VenueDetailsStep from "../../components/profile/steps/VenueDetailsStep";
import VenueSocialMediaStep from "../../components/profile/steps/VenueSocialMediaStep";
import ArtistDetailsStep from "../../components/profile/steps/ArtistDetailsStep";
import ArtistSocialMediaStep from "../../components/profile/steps/ArtistSocialMediaStep";
import ArtistMusicStep from "../../components/profile/steps/ArtistMusicStep";

import {
    saveProfileBase,
    saveArtistDetails,
    saveArtistSocialMedia,
    saveArtistMusic,
    saveVenueDetails, saveVenueSocialMedia
} from "../../services/ProfileService";

import {
    loadProfileDraft,
    setProfileDraftStep,
    clearProfileDraftStep
} from "../../components/profile/ProfileDraftStorage";

function buildVenueDetailsInitialFromUser(user) {
    const venue = user?.profile?.venue || user?.venue || null;

    if (!venue) {
        return null;
    }

    const hasCoords = typeof venue.lat === "number" && typeof venue.lng === "number";

    if (!venue.place_id || !hasCoords) {
        return null;
    }

    return {
        place: {
            place_id: venue.place_id,
            name: venue.name || "",
            address: venue.address || "",
            lat: venue.lat,
            lng: venue.lng,
            city: venue.city || null,
            country: venue.country || null,
        },
        description: typeof venue.description === "string" ? venue.description : "",
    };
}

function buildArtistMusicInitialFromUser(user) {
    const music = user?.artist?.music || user?.profile?.artist?.music || null;

    if (!music || typeof music !== "object") {
        return null;
    }

    return music;
}

export default function CreateProfileScreen({ route, navigation }) {
    const { t } = useTranslation();
    const { user, updateUser } = useUserContext();
    const initialStep = route.params?.initialStep ?? 0;

    const steps = useMemo(() => {
        return getProfileStepsForUserType(user?.type);
    }, [user?.type]);

    const [stepIndex, setStepIndex] = useState(initialStep);
    const stepKey = steps[stepIndex] || PROFILE_STEP_KEYS.CHOOSE_TYPE;

    const completedSteps = user?.profile_progress?.completed_steps || [];

    const labelsByKey = useMemo(() => {
        return {
            [PROFILE_STEP_KEYS.CHOOSE_TYPE]: t("Tips"),
            [PROFILE_STEP_KEYS.BASE]: t("Profils"),
            [PROFILE_STEP_KEYS.WATCHER_PREFERENCES]: t("Prefs"),
            [PROFILE_STEP_KEYS.VENUE_DETAILS]: t("Detaļas"),
            [PROFILE_STEP_KEYS.VENUE_SOCIAL_MEDIA]: t("Sociālie tīkli"),
            [PROFILE_STEP_KEYS.ARTIST_DETAILS]: t("Detaļas"),
            [PROFILE_STEP_KEYS.ARTIST_MUSIC]: t("Mūzika"),
            [PROFILE_STEP_KEYS.ARTIST_SOCIAL_MEDIA]: t("Sociālie tīkli"),
        };
    }, [t]);

    const [draft, setDraft] = useState({});
    const userId = user?.id ? String(user.id) : null;

    useEffect(() => {
        let mounted = true;

        async function run() {
            const loaded = await loadProfileDraft(userId);

            if (!mounted) {
                return;
            }

            setDraft(loaded || {});
        }

        run();

        return () => {
            mounted = false;
        };
    }, [userId]);

    const goNext = () => {
        const next = stepIndex + 1;

        if (next >= steps.length) {
            navigation.reset({ index: 0, routes: [{ name: "AppTabs" }] });
            return;
        }

        setStepIndex(next);
    };

    const goToStepKey = (key) => {
        const idx = steps.indexOf(key);

        if (idx === -1) {
            setStepIndex(0);
            return;
        }

        setStepIndex(idx);
    };

    const showProgress = stepKey !== PROFILE_STEP_KEYS.CHOOSE_TYPE;

    const progressSteps = useMemo(() => {
        return steps.filter((k) => k !== PROFILE_STEP_KEYS.CHOOSE_TYPE);
    }, [steps]);

    const progressCurrentKey = useMemo(() => {
        if (stepKey === PROFILE_STEP_KEYS.CHOOSE_TYPE) {
            return progressSteps[0] || PROFILE_STEP_KEYS.BASE;
        }

        return stepKey;
    }, [stepKey, progressSteps]);

    const applyUserPayload = async (payload) => {
        updateUser({ ...payload });
        await AsyncStorage.setItem("user", JSON.stringify({ ...payload }));
    };

    const setDraftStep = async (key, value) => {
        const next = await setProfileDraftStep(userId, key, value);
        setDraft(next || {});
    };

    const clearDraftStep = async (key) => {
        const next = await clearProfileDraftStep(userId, key);
        setDraft(next || {});
    };

    const venueDetailsInitial = useMemo(() => {
        const fromDraft = draft?.[PROFILE_STEP_KEYS.VENUE_DETAILS] || null;

        if (fromDraft) {
            return fromDraft;
        }

        return buildVenueDetailsInitialFromUser(user);
    }, [draft, user]);

    const artistMusicInitial = useMemo(() => {
        const fromDraft = draft?.[PROFILE_STEP_KEYS.ARTIST_MUSIC] || null;

        if (fromDraft && typeof fromDraft === "object") {
            return fromDraft;
        }

        return buildArtistMusicInitialFromUser(user) || {};
    }, [draft, user]);

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
            <View className="flex-1">
                {showProgress && (
                    <ProfileProgressBar
                        steps={progressSteps}
                        currentStepKey={progressCurrentKey}
                        completedSteps={completedSteps}
                        labelsByKey={labelsByKey}
                        onGoToStep={(key) => {
                            goToStepKey(key);
                        }}
                    />
                )}

                <View className="flex-1">
                    {stepKey === PROFILE_STEP_KEYS.CHOOSE_TYPE && (
                        <ChooseTypeStep
                            onTypeSaved={() => {
                                goToStepKey(PROFILE_STEP_KEYS.BASE);
                            }}
                        />
                    )}

                    {stepKey === PROFILE_STEP_KEYS.BASE && (
                        <BaseStep
                            footerNote={t("Svarīgi: izvēlies rūpīgi — profila tipu vēlāk mainīt nevarēs.")}
                            onSubmit={async ({ name, avatarUri, country_code }) => {
                                return await saveProfileBase({ name, avatarUri, country_code });
                            }}
                            onDone={async (payload) => {
                                await applyUserPayload(payload);
                                goNext();
                            }}
                        />
                    )}

                    {stepKey === PROFILE_STEP_KEYS.WATCHER_PREFERENCES && (
                        <WatcherPreferencesStep onSaved={goNext} />
                    )}

                    {stepKey === PROFILE_STEP_KEYS.VENUE_DETAILS && (
                        <VenueDetailsStep
                            initial={venueDetailsInitial}
                            onDraftChange={async (value) => {
                                await setDraftStep(PROFILE_STEP_KEYS.VENUE_DETAILS, value);
                            }}
                            onSubmit={saveVenueDetails}
                            onDone={async (payload) => {
                                await clearDraftStep(PROFILE_STEP_KEYS.VENUE_DETAILS);
                                await applyUserPayload(payload);
                                goNext();
                            }}
                        />
                    )}

                    {stepKey === PROFILE_STEP_KEYS.VENUE_SOCIAL_MEDIA && (
                        <VenueSocialMediaStep
                            initial={user?.social_media || {}}
                            onSubmit={async ({ instagram, tiktok, facebook, website }) => {
                                return await saveVenueSocialMedia({ instagram, tiktok, facebook, website });
                            }}
                            onDone={async (payload) => {
                                await applyUserPayload(payload);
                                goNext();
                            }}
                        />
                    )}

                    {stepKey === PROFILE_STEP_KEYS.ARTIST_DETAILS && (
                        <ArtistDetailsStep
                            onSubmit={async ({ bio, genres }) => {
                                return await saveArtistDetails({ bio, genres });
                            }}
                            onDone={async (payload) => {
                                await applyUserPayload(payload);
                                goNext();
                            }}
                        />
                    )}

                    {stepKey === PROFILE_STEP_KEYS.ARTIST_MUSIC && (
                        <ArtistMusicStep
                            initial={artistMusicInitial}
                            onDraftChange={async (value) => {
                                await setDraftStep(PROFILE_STEP_KEYS.ARTIST_MUSIC, value);
                            }}
                            onSubmit={async (payload) => {
                                const res = await saveArtistMusic(payload);

                                if (res?.ok) {
                                    const savedMusic =
                                        res?.payload?.artist?.music && typeof res.payload.artist.music === "object"
                                            ? res.payload.artist.music
                                            : payload;

                                    await setDraftStep(PROFILE_STEP_KEYS.ARTIST_MUSIC, savedMusic);
                                }

                                return res;
                            }}
                            onDone={async (payload) => {
                                await clearDraftStep(PROFILE_STEP_KEYS.ARTIST_MUSIC);

                                if (payload) {
                                    await applyUserPayload(payload);
                                }

                                goNext();
                            }}
                        />
                    )}

                    {stepKey === PROFILE_STEP_KEYS.ARTIST_SOCIAL_MEDIA && (
                        <ArtistSocialMediaStep
                            initial={user?.social_media || {}}
                            onSubmit={async ({ instagram, tiktok, facebook, website }) => {
                                return await saveArtistSocialMedia({ instagram, tiktok, facebook, website });
                            }}
                            onDone={async (payload) => {
                                await applyUserPayload(payload);
                                goNext();
                            }}
                        />
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
