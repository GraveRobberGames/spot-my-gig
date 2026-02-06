import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/Global";

async function getAuthHeaders() {
    const apiToken = await AsyncStorage.getItem("api_token");

    if (!apiToken) {
        return {};
    }

    return { Authorization: `Bearer ${apiToken}` };
}

async function safeJson(res) {
    try {
        return await res.json();
    } catch {
        return null;
    }
}

export async function saveProfileBase({ name, avatarUri, country_code }) {
    const headers = await getAuthHeaders();

    const form = new FormData();
    form.append("name", String(name || "").trim());

    const code = String(country_code || "").trim().toUpperCase();

    if (code !== "") {
        form.append("country_code", code);
    }

    if (avatarUri) {
        form.append("avatar", {
            uri: avatarUri,
            name: "avatar.jpg",
            type: "image/jpeg",
        });
    }

    const res = await fetch(`${API_BASE_URL}/profile/base`, {
        method: "POST",
        headers: {
            ...headers,
        },
        body: form,
    });

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, data };
    }

    return { ok: true, payload: data.payload };
}

export async function saveArtistDetails({ bio, genres }) {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/profile/artist/details`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify({
            bio,
            genres,
        }),
    });

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, data };
    }

    return { ok: true, payload: data.payload };
}

export async function saveArtistMusic(payload) {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/profile/artist/music`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(payload),
    });

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, data };
    }

    return { ok: true, payload: data.payload };
}

export async function saveArtistSocialMedia({ instagram, tiktok, facebook, website }) {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/profile/artist/social-media`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify({
            instagram,
            tiktok,
            facebook,
            website,
        }),
    });

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, data };
    }

    return { ok: true, payload: data.payload };
}

export async function saveVenueDetails(payload) {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/profile/venue/details`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(payload),
    });

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, data };
    }

    return { ok: true, payload: data.payload };
}

export async function saveVenueSocialMedia({ instagram, tiktok, facebook, website }) {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/profile/venue/social-media`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify({
            instagram,
            tiktok,
            facebook,
            website,
        }),
    });

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, data };
    }

    return { ok: true, payload: data.payload };
}

export async function saveProfileGallery({ existing = [], photos = [] }) {
    const headers = await getAuthHeaders();

    const form = new FormData();

    (Array.isArray(existing) ? existing : []).forEach((p) => {
        const val = String(p || "").trim();
        if (val !== "") {
            form.append("existing[]", val);
        }
    });

    (Array.isArray(photos) ? photos : []).forEach((file, idx) => {
        if (!file) {
            return;
        }

        const uri = String(file.uri || file);
        const name = String(file.fileName || file.name || `photo_${idx}.jpg`);
        const type = String(file.mimeType || file.type || "image/jpeg");

        form.append("photos[]", { uri, name, type });
    });

    const res = await fetch(`${API_BASE_URL}/profile/gallery`, {
        method: "POST",
        headers: {
            ...headers,
            // IMPORTANT: do NOT set Content-Type for FormData in RN
        },
        body: form,
    });

    console.log(res);
    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, data, status: res.status };
    }

    return { ok: true, payload: data.payload };
}

export const PROFILE_STEP_KEYS = {
    CHOOSE_TYPE: "choose_type",
    BASE: "base",

    WATCHER_PREFERENCES: "watcher_preferences",

    VENUE_DETAILS: "venue_details",
    VENUE_SOCIAL_MEDIA: "venue_social_media",

    ARTIST_DETAILS: "artist_details",
    ARTIST_MUSIC: "artist_music",
    ARTIST_SOCIAL_MEDIA: "artist_social_media",
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
        PROFILE_STEP_KEYS.VENUE_SOCIAL_MEDIA,
    ],
    artist: [
        PROFILE_STEP_KEYS.CHOOSE_TYPE,
        PROFILE_STEP_KEYS.BASE,
        PROFILE_STEP_KEYS.ARTIST_DETAILS,
        PROFILE_STEP_KEYS.ARTIST_MUSIC,
        PROFILE_STEP_KEYS.ARTIST_SOCIAL_MEDIA,
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
