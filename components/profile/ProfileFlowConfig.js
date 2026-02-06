export const PROFILE_STEP_KEYS = {
    CHOOSE_TYPE: "choose_type",
    BASE: "base",

    WATCHER_PREFERENCES: "watcher_preferences",

    VENUE_DETAILS: "venue_details",
    VENUE_LOCATION: "venue_location",

    ARTIST_DETAILS: "artist_details",
    ARTIST_MEDIA: "artist_media",
};

export const PROFILE_STEPS_BY_TYPE = {
    watcher: [
        PROFILE_STEP_KEYS.CHOOSE_TYPE,
        PROFILE_STEP_KEYS.BASE,
        PROFILE_STEP_KEYS.WATCHER_PREFERENCES,
    ],
    venue: [
        PROFILE_STEP_KEYS.CHOOSE_TYPE,
        PROFILE_STEP_KEYS.BASE,
        PROFILE_STEP_KEYS.VENUE_DETAILS,
        PROFILE_STEP_KEYS.VENUE_LOCATION,
    ],
    artist: [
        PROFILE_STEP_KEYS.CHOOSE_TYPE,
        PROFILE_STEP_KEYS.BASE,
        PROFILE_STEP_KEYS.ARTIST_DETAILS,
        PROFILE_STEP_KEYS.ARTIST_MEDIA,
    ],
};

export function getProfileStepsForUserType(type) {
    if (!type || !PROFILE_STEPS_BY_TYPE[type]) {
        return [PROFILE_STEP_KEYS.CHOOSE_TYPE, PROFILE_STEP_KEYS.BASE];
    }

    return PROFILE_STEPS_BY_TYPE[type];
}

export function getProfileStepIndex(type, stepKey) {
    const steps = getProfileStepsForUserType(type);
    const idx = steps.indexOf(stepKey);

    if (idx === -1) {
        return 0;
    }

    return idx;
}
