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

export async function searchAppleMusicArtists(query, country = "LV") {
    const headers = await getAuthHeaders();

    const q = (query || "").trim();

    if (q === "") {
        return { ok: true, results: [] };
    }

    const url = `${API_BASE_URL}/apple-music/artists?query=${encodeURIComponent(q)}&country=${encodeURIComponent(country)}`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            ...headers,
        },
    });

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, data };
    }

    return { ok: true, results: data.results || [] };
}
