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

function normalizeResults(list) {
    const arr = Array.isArray(list) ? list : [];

    return arr
        .map((r) => {
            const id = r?.id ?? r?.spotify_id ?? r?.artist_id ?? r?.am_id ?? r?.apple_music_id ?? null;
            const name = r?.name ?? r?.artist_name ?? r?.title ?? null;
            const url = r?.url ?? r?.spotify_url ?? r?.artist_url ?? r?.href ?? null;

            const image =
                r?.image ??
                r?.image_url ??
                r?.avatar_url ??
                r?.artwork_url ??
                r?.artwork ??
                r?.images?.[0]?.url ??
                r?.artworkUrl100 ??
                r?.artworkUrl60 ??
                null;

            if (!id || !name || !url) {
                return null;
            }

            return {
                id: String(id),
                name: String(name),
                url: String(url),
                image: image ? String(image) : null,
            };
        })
        .filter(Boolean);
}

export async function searchSpotifyArtists(query) {
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

    return { ok: true, results: normalizeResults(data.results || []) };
}

export async function searchAppleMusicArtists(query, country = "LV") {
    const q = (query || "").trim();

    if (q.length < 2) {
        return { ok: true, results: [] };
    }

    const headers = await getAuthHeaders();

    const res = await fetch(
        `${API_BASE_URL}/apple-music/artists?query=${encodeURIComponent(q)}&country=${encodeURIComponent(country)}`,
        {
            method: "GET",
            headers: { ...headers },
        }
    );

    const data = await safeJson(res);

    if (!res.ok || !data?.success) {
        return { ok: false, results: [] };
    }

    return { ok: true, results: normalizeResults(data.results || []) };
}
