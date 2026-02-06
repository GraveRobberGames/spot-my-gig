import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import { searchSpotifyArtists } from "../../../services/SpotifyService";
import { useAppContext } from "../../../contexts/AppContext";

function looksLikeUrl(value) {
    const v = (value || "").trim().toLowerCase();

    if (!v) {
        return false;
    }

    if (v.startsWith("http://") || v.startsWith("https://")) {
        return true;
    }

    if (v.includes("open.spotify.com/")) {
        return true;
    }

    if (v.startsWith("spotify:artist:")) {
        return true;
    }

    return false;
}

export default function SpotifyArtistInput({
                                               label,
                                               placeholder,
                                               value,
                                               onChangeText,
                                               selectedArtist,
                                               onSelectArtist,
                                               disabled,
                                           }) {
    const { t } = useTranslation();
    const { showToast } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);

    const debounceRef = useRef(null);
    const activeReqRef = useRef(0);

    const query = useMemo(() => {
        return (value || "").trim();
    }, [value]);

    useEffect(() => {
        if (disabled) {
            setOpen(false);
            setResults([]);
            return;
        }

        if (looksLikeUrl(query)) {
            setOpen(false);
            setResults([]);
            return;
        }

        if (selectedArtist && query === selectedArtist.name) {
            setOpen(false);
            setResults([]);
            return;
        }

        if (query.length < 2) {
            setOpen(false);
            setResults([]);
            return;
        }

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(async () => {
            const reqId = activeReqRef.current + 1;
            activeReqRef.current = reqId;

            setLoading(true);

            try {
                const res = await searchSpotifyArtists(query);

                if (activeReqRef.current !== reqId) {
                    setLoading(false);
                    return;
                }

                setLoading(false);

                if (!res.ok) {
                    setResults([]);
                    setOpen(false);
                    return;
                }

                const list = Array.isArray(res.results) ? res.results : [];
                setResults(list);
                setOpen(true);
            } catch {
                if (activeReqRef.current !== reqId) {
                    setLoading(false);
                    return;
                }

                setLoading(false);
                setResults([]);
                setOpen(false);
            }
        }, 450);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [query, disabled, selectedArtist]);

    return (
        <View className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden mb-4">
            <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
            <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

            <View className="flex-row items-center px-4 pt-4">
                <View className="relative">
                    <View className="absolute inset-0 rounded-2xl bg-primary-5/45 blur-lg" />
                    <View className={`h-11 w-11 rounded-2xl border ${selectedArtist ? "border-primary-5/40 bg-primary-5/10" : "border-white/10 bg-white/5"} items-center justify-center overflow-hidden`}>
                        {selectedArtist?.image ? (
                            <Image source={{ uri: selectedArtist.image }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <MaterialCommunityIcons name="spotify" size={20} color="white" />
                        )}
                    </View>
                </View>

                <View className="flex-1 pl-3">
                    <View className="flex-row items-center">
                        <Text className="text-text font-extrabold text-sm">
                            {label}
                        </Text>

                        {loading && (
                            <View className="ml-2 flex-row items-center">
                                <MaterialCommunityIcons name="loading" size={14} color="white" />
                                <Text className="text-white/55 text-xs font-semibold ml-2">
                                    {t("Meklē...")}
                                </Text>
                            </View>
                        )}

                        {!!selectedArtist && !loading && (
                            <View className="ml-2 flex-row items-center">
                                <View className="h-2 w-2 rounded-full bg-primary-5 mr-1.5" />
                                <Text className="text-white/55 text-xs font-semibold">
                                    Linked
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
                    onChangeText={(v) => {
                        if (selectedArtist && v !== selectedArtist.name) {
                            onSelectArtist(null);
                        }
                        onChangeText(v);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!disabled}
                    style={{ fontSize: 16, lineHeight: 20, paddingVertical: 12 }}
                />

                {open && results.length > 0 && (
                    <View className="mt-3 rounded-2xl border border-white/10 bg-black/35 overflow-hidden">
                        {results.map((a) => {
                            const img = a.image || null;

                            return (
                                <Pressable
                                    key={a.id}
                                    onPress={() => {
                                        if (!a?.id || !a?.url || !a?.name) {
                                            showToast(t("Neizdevās izvēlēties mākslinieku"), "error");
                                            return;
                                        }

                                        onSelectArtist({
                                            id: a.id,
                                            name: a.name,
                                            url: a.url,
                                            image: img,
                                        });

                                        onChangeText(a.name);
                                        setOpen(false);
                                    }}
                                    className="px-3 py-3 flex-row items-center border-b border-white/5"
                                >
                                    <View className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 overflow-hidden items-center justify-center">
                                        {img ? (
                                            <Image source={{ uri: img }} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <MaterialCommunityIcons name="account-music-outline" size={18} color="white" />
                                        )}
                                    </View>

                                    <View className="flex-1 ml-3">
                                        <Text className="text-white font-semibold text-sm">
                                            {a.name}
                                        </Text>

                                        {!!a.followers && (
                                            <Text className="text-white/55 text-xs mt-0.5">
                                                {t("{count} sekotāji", { count: a.followers })}
                                            </Text>
                                        )}
                                    </View>

                                    <MaterialCommunityIcons name="chevron-right" size={20} color="white" />
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
}
