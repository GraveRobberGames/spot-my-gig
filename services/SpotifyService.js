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

export async function searchSpotifyArtists(query) {
    const headers = await getAuthHeaders();
    const q = (query || "").trim();

    if (!q) {
        return { ok: true, results: [] };
    }

    const res = await fetch(`${API_BASE_URL}/spotify/artists/search?query=${encodeURIComponent(q)}`, {
        method: "GET",
        headers: {
            ...headers,
        },
    });

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, results: [] };
    }

    return { ok: true, results: data.results || [] };
}
