// screens/profile/steps/ArtistMusicStep.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Keyboard, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import PrimaryButton from "../../buttons/PrimaryButton";
import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import { useModal } from "../../../contexts/ModalContext";
import { MODAL_TYPES } from "../../../constants/ModalTypes";
import { useAppContext } from "../../../contexts/AppContext";
import { API_BASE_URL } from "../../../constants/Global";

const MUSIC_TYPES = [
    { key: "youtube", icon: "youtube", labelKey: "YouTube", placeholder: "youtube.com/@artist vai channel/..." },
    { key: "soundcloud", icon: "soundcloud", labelKey: "SoundCloud", placeholder: "soundcloud.com/artistname" },
    { key: "bandcamp", icon: "music-circle", labelKey: "Bandcamp", placeholder: "artistname.bandcamp.com" },
];

function useDebounced(value, delayMs) {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const t = setTimeout(() => {
            setDebounced(value);
        }, delayMs);

        return () => {
            clearTimeout(t);
        };
    }, [value, delayMs]);

    return debounced;
}

async function getAuthHeaders() {
    const keysToTry = ["api_token", "token", "user_api_token", "auth_token", "access_token"];
    let token = "";

    for (const k of keysToTry) {
        const v = await AsyncStorage.getItem(k);

        if (v && String(v).trim() !== "") {
            token = String(v).trim();
            break;
        }
    }

    if (!token) {
        return {};
    }

    return { Authorization: `Bearer ${token}` };
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

async function searchSpotifyArtists(query) {
    const q = (query || "").trim();

    if (q.length < 2) {
        return { ok: true, results: [] };
    }

    const headers = await getAuthHeaders();

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

    return { ok: true, results: normalizeResults(data.results || []) };
}

async function searchAppleMusicArtists(query, country = "LV") {
    const q = (query || "").trim();

    if (q.length < 2) {
        return { ok: true, results: [] };
    }

    const headers = await getAuthHeaders();

    const res = await fetch(
        `${API_BASE_URL}/apple-music/artists?query=${encodeURIComponent(query)}&country=${encodeURIComponent(country)}`,
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

function ensureHttps(raw) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
        return raw;
    }

    if (raw.startsWith("www.")) {
        return `https://${raw}`;
    }

    return `https://${raw}`;
}

function normalizeUrl(type, value) {
    const raw = (value || "").trim();

    if (raw === "") {
        return "";
    }

    if (type === "youtube") {
        return ensureHttps(raw);
    }

    if (type === "soundcloud") {
        return ensureHttps(raw);
    }

    if (type === "bandcamp") {
        return ensureHttps(raw);
    }

    return ensureHttps(raw);
}

function LinkRow({ icon, label, placeholder, value, onChangeText, disabled }) {
    const filled = (value || "").trim().length > 0;

    return (
        <View className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden mb-4">
            <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
            <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

            <View className="flex-row items-center px-4 pt-4">
                <View className="relative">
                    <View className="absolute inset-0 rounded-2xl bg-primary-5/45 blur-lg" />
                    <View className={`h-11 w-11 rounded-2xl border ${filled ? "border-primary-5/40 bg-primary-5/10" : "border-white/10 bg-white/5"} items-center justify-center`}>
                        <MaterialCommunityIcons name={icon} size={20} color="white" />
                    </View>
                </View>

                <View className="flex-1 pl-3">
                    <View className="flex-row items-center">
                        <Text className="text-text font-extrabold text-sm">
                            {label}
                        </Text>

                        {filled && (
                            <View className="ml-2 flex-row items-center">
                                <View className="h-2 w-2 rounded-full bg-success mr-1.5" />
                                <Text className="text-white/55 text-xs font-semibold">
                                    Pievienots
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-white/55 text-xs mt-1">
                        {placeholder}
                    </Text>
                </View>
            </View>

            <View className="px-4 pb-4 pt-3">
                <PrimaryTextInput
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!disabled}
                    style={{ fontSize: 16, lineHeight: 20, paddingVertical: 12 }}
                />
            </View>
        </View>
    );
}

function LookupRow({
                       platformIcon,
                       title,
                       subtitle,
                       placeholder,
                       value,
                       onChangeText,
                       selected,
                       onSelect,
                       searchFn,
                       disabled,
                   }) {
    const { t } = useTranslation();

    const [focused, setFocused] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);

    const debounced = useDebounced(value, 300);
    const lastQueryRef = useRef("");

    const canSearch = useMemo(() => {
        if (disabled) {
            return false;
        }

        if (!focused) {
            return false;
        }

        const q = (debounced || "").trim();

        if (q.length < 2) {
            return false;
        }

        if (selected?.name && q === selected.name) {
            return false;
        }

        return true;
    }, [disabled, focused, debounced, selected]);

    useEffect(() => {
        const run = async () => {
            if (!canSearch) {
                setResults([]);
                return;
            }

            const q = (debounced || "").trim();

            if (q === lastQueryRef.current) {
                return;
            }

            lastQueryRef.current = q;
            setLoading(true);

            try {
                const res = await searchFn(q);
                setLoading(false);

                if (!res?.ok) {
                    setResults([]);
                    return;
                }

                setResults(res.results || []);
            } catch {
                setLoading(false);
                setResults([]);
            }
        };

        run();
    }, [canSearch, debounced, searchFn]);

    const clearSelection = () => {
        if (onSelect) {
            onSelect(null);
        }

        if (onChangeText) {
            onChangeText("");
        }

        setResults([]);
    };

    const filled = !!selected || ((value || "").trim().length > 0);

    return (
        <View className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden mb-4">
            <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
            <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

            <View className="flex-row items-center px-4 pt-4">
                <View className="relative">
                    <View className="absolute inset-0 rounded-2xl bg-primary-5/45 blur-lg" />
                    <View className={`h-11 w-11 rounded-2xl border ${filled ? "border-primary-5/40 bg-primary-5/10" : "border-white/10 bg-white/5"} items-center justify-center`}>
                        <MaterialCommunityIcons name={platformIcon} size={20} color="white" />
                    </View>
                </View>

                <View className="flex-1 pl-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-text font-extrabold text-sm">
                            {title}
                        </Text>

                        {!!selected && (
                            <View className="flex-row items-center">
                                <View className="h-2 w-2 rounded-full bg-success mr-1.5" />
                                <Text className="text-white/55 text-xs font-semibold">
                                    Pievienots
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-white/55 text-xs mt-0.5">
                        {subtitle}
                    </Text>
                </View>
            </View>

            <View className="px-4 pb-4 pt-5">
                <View className="relative">
                    <PrimaryTextInput
                        placeholder={placeholder}
                        value={selected ? `  ${selected.name}` : value}
                        onChangeText={(v) => {
                            if (disabled) {
                                return;
                            }

                            if (selected) {
                                return;
                            }

                            if (onChangeText) {
                                onChangeText(v);
                            }
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!disabled && !selected}
                        onFocus={() => {
                            setFocused(true);
                        }}
                        onBlur={() => {
                            setFocused(false);
                        }}
                        style={{ fontSize: 16, lineHeight: 20, paddingVertical: 8, paddingRight: 44, paddingLeft: selected ? 40 : 0 }}
                    />

                    {!!selected && (
                        <View className="absolute left-3 top-1/2 -mt-6 h-12 w-12 rounded-xl border border-white/10 bg-black/25 overflow-hidden items-center justify-center">
                            {selected?.image ? (
                                <Image source={{ uri: selected.image }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <MaterialCommunityIcons name="account-music-outline" size={18} color="white" />
                            )}
                        </View>
                    )}

                    {!!selected && (
                        <Pressable
                            onPress={() => {
                                if (disabled) {
                                    return;
                                }

                                clearSelection();
                            }}
                            className="absolute right-3 top-1/2 -mt-5 h-10 w-10 rounded-2xl border border-white/10 bg-black/25 items-center justify-center"
                        >
                            <MaterialCommunityIcons name="close" size={18} color="white" />
                        </Pressable>
                    )}
                </View>

                {loading && (
                    <View className="mt-3 flex-row items-center">
                        <MaterialCommunityIcons name="loading" size={16} color="white" />
                        <Text className="text-white/60 text-xs ml-2">
                            {t("Meklējam...")}
                        </Text>
                    </View>
                )}

                {!selected && focused && results.length > 0 && (
                    <View className="mt-3 rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
                        {results.slice(0, 6).map((r) => {
                            return (
                                <Pressable
                                    key={`${r.id}-${r.name}`}
                                    onPress={() => {
                                        if (onSelect) {
                                            onSelect(r);
                                        }

                                        if (onChangeText) {
                                            onChangeText(r.name);
                                        }

                                        setResults([]);
                                        Keyboard.dismiss();
                                    }}
                                    className="px-4 py-3 border-b border-white/5 flex-row items-center"
                                >
                                    <View className="h-14 w-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden items-center justify-center">
                                        {r.image ? (
                                            <Image source={{ uri: r.image }} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <MaterialCommunityIcons name="account-music-outline" size={18} color="white" />
                                        )}
                                    </View>

                                    <View className="flex-1 pl-3">
                                        <Text className="text-white font-semibold">
                                            {r.name}
                                        </Text>
                                        <Text className="text-white/55 text-xs mt-1">
                                            {r.url}
                                        </Text>
                                    </View>

                                    <MaterialCommunityIcons name="chevron-right" size={18} color="white" />
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {!selected && focused && !loading && (debounced || "").trim().length >= 2 && results.length === 0 && (
                    <View className="mt-3 flex-row items-center">
                        <MaterialCommunityIcons name="magnify" size={16} color="white" />
                        <Text className="text-white/60 text-xs ml-2">
                            {t("Nav rezultātu")}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}

export default function ArtistMusicStep({ initial, submitLabel, onSubmit, onDone }) {
    const safeInitial = useMemo(() => {
        if (!initial || typeof initial !== "object") {
            return {};
        }

        return initial;
    }, [initial]);

    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { showModal, hideModal } = useModal();
    const { showToast } = useAppContext();

    const [saving, setSaving] = useState(false);

    const [spotifyInput, setSpotifyInput] = useState(safeInitial.spotify_artist_name || safeInitial.spotify || "");
    const [spotifyArtist, setSpotifyArtist] = useState(
        safeInitial.spotify_artist_id
            ? {
                id: safeInitial.spotify_artist_id,
                name: safeInitial.spotify_artist_name || "",
                url: safeInitial.spotify || "",
                image: safeInitial.spotify_artist_image || null,
            }
            : null
    );

    const [appleInput, setAppleInput] = useState(safeInitial.apple_music_artist_name || safeInitial.apple_music || "");
    const [appleArtist, setAppleArtist] = useState(
        safeInitial.apple_music_artist_id
            ? {
                id: safeInitial.apple_music_artist_id,
                name: safeInitial.apple_music_artist_name || "",
                url: safeInitial.apple_music || "",
                image: safeInitial.apple_music_artist_image || null,
            }
            : null
    );

    const [values, setValues] = useState({
        youtube: safeInitial.youtube || "",
        soundcloud: safeInitial.soundcloud || "",
        bandcamp: safeInitial.bandcamp || "",
    });

    useEffect(() => {
        setSpotifyInput(safeInitial.spotify_artist_name || safeInitial.spotify || "");
        setSpotifyArtist(
            safeInitial.spotify_artist_id
                ? {
                    id: safeInitial.spotify_artist_id,
                    name: safeInitial.spotify_artist_name || "",
                    url: safeInitial.spotify || "",
                    image: safeInitial.spotify_artist_image || null,
                }
                : null
        );

        setAppleInput(safeInitial.apple_music_artist_name || safeInitial.apple_music || "");
        setAppleArtist(
            safeInitial.apple_music_artist_id
                ? {
                    id: safeInitial.apple_music_artist_id,
                    name: safeInitial.apple_music_artist_name || "",
                    url: safeInitial.apple_music || "",
                    image: safeInitial.apple_music_artist_image || null,
                }
                : null
        );

        setValues({
            youtube: safeInitial.youtube || "",
            soundcloud: safeInitial.soundcloud || "",
            bandcamp: safeInitial.bandcamp || "",
        });
    }, [
        safeInitial.spotify,
        safeInitial.spotify_artist_id,
        safeInitial.spotify_artist_name,
        safeInitial.spotify_artist_image,
        safeInitial.apple_music,
        safeInitial.apple_music_artist_id,
        safeInitial.apple_music_artist_name,
        safeInitial.apple_music_artist_image,
        safeInitial.youtube,
        safeInitial.soundcloud,
        safeInitial.bandcamp,
    ]);

    const normalized = useMemo(() => {
        const out = {};

        out.spotify = spotifyArtist?.url ? spotifyArtist.url : "";
        out.spotify_artist_id = spotifyArtist?.id ? String(spotifyArtist.id) : "";
        out.spotify_artist_name = spotifyArtist?.name ? String(spotifyArtist.name) : "";
        out.spotify_artist_image = spotifyArtist?.image ? String(spotifyArtist.image) : "";

        out.apple_music = appleArtist?.url ? appleArtist.url : "";
        out.apple_music_artist_id = appleArtist?.id ? String(appleArtist.id) : "";
        out.apple_music_artist_name = appleArtist?.name ? String(appleArtist.name) : "";
        out.apple_music_artist_image = appleArtist?.image ? String(appleArtist.image) : "";

        out.youtube = normalizeUrl("youtube", values.youtube);
        out.soundcloud = normalizeUrl("soundcloud", values.soundcloud);
        out.bandcamp = normalizeUrl("bandcamp", values.bandcamp);

        return out;
    }, [spotifyArtist, appleArtist, values]);

    const musicFilledCount = useMemo(() => {
        let c = 0;

        if ((normalized.spotify || "").trim() !== "") c += 1;
        if ((normalized.apple_music || "").trim() !== "") c += 1;
        if ((normalized.youtube || "").trim() !== "") c += 1;
        if ((normalized.soundcloud || "").trim() !== "") c += 1;
        if ((normalized.bandcamp || "").trim() !== "") c += 1;

        return c;
    }, [normalized]);

    const canContinue = useMemo(() => {
        if (saving) {
            return false;
        }

        if (musicFilledCount < 1) {
            return false;
        }

        return true;
    }, [saving, musicFilledCount]);

    const onPressSave = async () => {
        if (saving) {
            return;
        }

        if (musicFilledCount < 1) {
            showToast(t("Lūdzu pievieno vismaz vienu mūzikas profilu."), "error");
            return;
        }

        Keyboard.dismiss();
        setSaving(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const payload = {
                spotify: normalized.spotify || null,
                spotify_artist_id: normalized.spotify_artist_id || null,
                spotify_artist_name: normalized.spotify_artist_name || null,
                spotify_artist_image: normalized.spotify_artist_image || null,

                apple_music: normalized.apple_music || null,
                apple_music_artist_id: normalized.apple_music_artist_id || null,
                apple_music_artist_name: normalized.apple_music_artist_name || null,
                apple_music_artist_image: normalized.apple_music_artist_image || null,

                youtube: normalized.youtube || null,
                soundcloud: normalized.soundcloud || null,
                bandcamp: normalized.bandcamp || null,
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
                        {t("Mūzikas profili")}
                    </Text>

                    <Text className="text-white/75 text-base mt-4 leading-6">
                        {t("Pievieno vismaz 1 mūzikas profilu. Ieteicams: izvēlies Spotify vai Apple no meklēšanas.")}
                    </Text>
                </View>

                <View className="mt-8">
                    <LookupRow
                        platformIcon="spotify"
                        title={t("Spotify")}
                        subtitle={t("Sāc rakstīt nosaukumu, izvēlies no saraksta")}
                        placeholder={t("Meklē Spotify mākslinieku...")}
                        value={spotifyInput}
                        onChangeText={setSpotifyInput}
                        selected={spotifyArtist}
                        onSelect={setSpotifyArtist}
                        searchFn={searchSpotifyArtists}
                        disabled={saving}
                    />

                    <LookupRow
                        platformIcon="apple"
                        title={t("Apple Music")}
                        subtitle={t("Sāc rakstīt nosaukumu, izvēlies no saraksta")}
                        placeholder={t("Meklē Apple Music mākslinieku...")}
                        value={appleInput}
                        onChangeText={setAppleInput}
                        selected={appleArtist}
                        onSelect={setAppleArtist}
                        searchFn={(q) => searchAppleMusicArtists(q, "LV")}
                        disabled={saving}
                    />

                    {MUSIC_TYPES.map((row) => {
                        const key = row.key;

                        return (
                            <LinkRow
                                key={key}
                                icon={row.icon}
                                label={t(row.labelKey)}
                                placeholder={row.placeholder}
                                value={values[key]}
                                disabled={saving}
                                onChangeText={(v) => {
                                    setValues((prev) => ({ ...prev, [key]: v }));
                                }}
                            />
                        );
                    })}
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
