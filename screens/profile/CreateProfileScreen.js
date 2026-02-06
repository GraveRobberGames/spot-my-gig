import React, { useMemo, useState } from "react";
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
import VenueLocationStep from "../../components/profile/steps/VenueLocationStep";
import ArtistDetailsStep from "../../components/profile/steps/ArtistDetailsStep";
import ArtistMediaStep from "../../components/profile/steps/ArtistMediaStep";

import {saveProfileBase, saveArtistDetails, saveArtistSocialMedia} from "../../services/ProfileService";

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
            [PROFILE_STEP_KEYS.CHOOSE_TYPE]: t("Type"),
            [PROFILE_STEP_KEYS.BASE]: t("Profile"),
            [PROFILE_STEP_KEYS.WATCHER_PREFERENCES]: t("Prefs"),
            [PROFILE_STEP_KEYS.VENUE_DETAILS]: t("Details"),
            [PROFILE_STEP_KEYS.VENUE_LOCATION]: t("Location"),
            [PROFILE_STEP_KEYS.ARTIST_DETAILS]: t("Details"),
            [PROFILE_STEP_KEYS.ARTIST_MEDIA]: t("Media"),
        };
    }, [t]);

    const goNext = () => {
        const next = stepIndex + 1;

        if (next >= steps.length) {
            navigation.reset({ index: 0, routes: [{ name: "DashboardScreen" }] });
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

    const applyUserPayload = async (payload) => {
        updateUser({ ...payload });
        await AsyncStorage.setItem("user", JSON.stringify({ ...payload }));
    };

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
            <View className="flex-1">
                {showProgress && (
                    <ProfileProgressBar
                        steps={steps}
                        currentStepKey={stepKey}
                        completedSteps={completedSteps}
                        labelsByKey={labelsByKey}
                        disabledKeys={["choose_type"]}
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
                            onSubmit={async ({ name, avatarUri }) => {
                                return await saveProfileBase({ name, avatarUri });
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

                    {stepKey === PROFILE_STEP_KEYS.VENUE_DETAILS && <VenueDetailsStep onSaved={goNext} />}

                    {stepKey === PROFILE_STEP_KEYS.VENUE_LOCATION && <VenueLocationStep onSaved={goNext} />}

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

                    {stepKey === PROFILE_STEP_KEYS.ARTIST_MEDIA && (
                        <ArtistMediaStep
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
