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

export async function saveProfileBase({ name, avatarUri }) {
    const headers = await getAuthHeaders();

    const form = new FormData();
    form.append("name", name);

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

export async function saveArtistSocialMedia({ instagram, tiktok, facebook, website }) {
    const headers = await getAuthHeaders();

    const res = await fetch(`${API_BASE_URL}/profile/artist-social-media`, {
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
