import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../../contexts/AppContext";
import { searchAppleMusicArtists } from "../../../services/AppleMusicService";

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

export default function AppleMusicArtistInput({
                                                  label,
                                                  placeholder,
                                                  value,
                                                  onChangeText,
                                                  selectedArtist,
                                                  onSelectArtist,
                                                  disabled,
                                                  country = "LV",
                                              }) {
    const { t } = useTranslation();
    const { showToast } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [focused, setFocused] = useState(false);

    const lastQueryRef = useRef("");
    const debounced = useDebounced(value, 300);

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

        if (selectedArtist?.name && q === selectedArtist.name) {
            return false;
        }

        return true;
    }, [disabled, focused, debounced, selectedArtist]);

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
                const res = await searchAppleMusicArtists(q, country);

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
    }, [canSearch, debounced, country]);

    const clearSelection = () => {
        if (onSelectArtist) {
            onSelectArtist(null);
        }

        if (onChangeText) {
            onChangeText("");
        }

        setResults([]);
    };

    return (
        <View className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden mb-4">
            <View className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-primary-5/14 blur-2xl" />
            <View className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent-cyan/10 blur-2xl" />

            <View className="flex-row items-center px-4 pt-4">
                <View className="relative">
                    <View className="absolute inset-0 rounded-2xl bg-primary-5/45 blur-lg" />
                    <View className={`h-11 w-11 rounded-2xl border ${selectedArtist ? "border-primary-5/40 bg-primary-5/10" : "border-white/10 bg-white/5"} items-center justify-center`}>
                        <MaterialCommunityIcons name="apple" size={20} color="white" />
                    </View>
                </View>

                <View className="flex-1 pl-3">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-text font-extrabold text-sm">
                            {label || t("Apple Music")}
                        </Text>

                        {selectedArtist && (
                            <View className="flex-row items-center">
                                <View className="h-2 w-2 rounded-full bg-primary-5 mr-1.5" />
                                <Text className="text-white/55 text-xs font-semibold">
                                    Linked
                                </Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-white/55 text-xs mt-1">
                        {placeholder || t("Ieraksti nosaukumu (meklēsim) vai ielīmē saiti")}
                    </Text>
                </View>
            </View>

            <View className="px-4 pb-4 pt-3">
                <PrimaryTextInput
                    placeholder={placeholder || t("Meklē Apple Music mākslinieku...")}
                    value={selectedArtist ? selectedArtist.name : value}
                    onChangeText={(v) => {
                        if (disabled) {
                            return;
                        }

                        if (selectedArtist && onSelectArtist) {
                            onSelectArtist(null);
                        }

                        if (onChangeText) {
                            onChangeText(v);
                        }
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!disabled}
                    onFocus={() => {
                        setFocused(true);
                    }}
                    onBlur={() => {
                        setFocused(false);
                    }}
                    style={{ fontSize: 16, lineHeight: 20, paddingVertical: 12 }}
                />

                {selectedArtist && (
                    <Pressable
                        onPress={() => {
                            clearSelection();
                        }}
                        disabled={disabled}
                        className="mt-3 self-start"
                    >
                        <Text className="text-primary-5 font-semibold text-sm">
                            {t("Mainīt")}
                        </Text>
                    </Pressable>
                )}

                {loading && (
                    <View className="mt-3 flex-row items-center">
                        <MaterialCommunityIcons name="loading" size={16} color="white" />
                        <Text className="text-white/60 text-xs ml-2">
                            {t("Meklējam...")}
                        </Text>
                    </View>
                )}

                {!selectedArtist && focused && results.length > 0 && (
                    <View className="mt-3 rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
                        {results.slice(0, 6).map((r) => {
                            return (
                                <Pressable
                                    key={r.id}
                                    onPress={() => {
                                        if (!r?.id || !r?.name || !r?.url) {
                                            showToast(t("Neizdevās izvēlēties mākslinieku"), "error");
                                            return;
                                        }

                                        if (onSelectArtist) {
                                            onSelectArtist(r);
                                        }

                                        if (onChangeText) {
                                            onChangeText(r.name);
                                        }

                                        setResults([]);
                                    }}
                                    className="px-4 py-3 border-b border-white/5"
                                >
                                    <Text className="text-white font-semibold">
                                        {r.name}
                                    </Text>
                                    <Text className="text-white/55 text-xs mt-1">
                                        {r.url}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )}

                {!selectedArtist && focused && !loading && (debounced || "").trim().length >= 2 && results.length === 0 && (
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
