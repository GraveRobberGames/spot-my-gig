import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Keyboard, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import PrimaryButton from "../../buttons/PrimaryButton";
import PrimaryTextInput from "../../inputs/PrimaryTextInput";
import { useAppContext } from "../../../contexts/AppContext";
import { useModal } from "../../../contexts/ModalContext";
import { MODAL_TYPES } from "../../../constants/ModalTypes";

const GOOGLE_PLACES_API_KEY =
    process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || "AIzaSyD_b_AEtX0lZj0ocQi1f8jpaZee8S1YYKY";

function normalizeInitial(initial) {
    if (!initial || typeof initial !== "object") {
        return { place: null, description: "" };
    }

    const place = initial.place && typeof initial.place === "object" ? initial.place : null;
    const description = typeof initial.description === "string" ? initial.description : "";

    const hasCoords = place && typeof place.lat === "number" && typeof place.lng === "number";

    if (!place || !place.place_id || !hasCoords) {
        return { place: null, description };
    }

    return { place, description };
}

export default function VenueDetailsStep({ onSubmit, onDone, onDraftChange, initial }) {
    const { t } = useTranslation();
    const insets = useSafeAreaInsets();
    const { showToast } = useAppContext();
    const { showModal, hideModal } = useModal();

    const placesRef = useRef(null);
    const hydratedFromInitialRef = useRef(false);
    const touchedRef = useRef(false);

    const [saving, setSaving] = useState(false);

    const [place, setPlace] = useState(null);
    const [description, setDescription] = useState("");

    const normalized = useMemo(() => {
        return normalizeInitial(initial);
    }, [initial]);

    useEffect(() => {
        if (hydratedFromInitialRef.current) {
            return;
        }

        if (touchedRef.current) {
            return;
        }

        if (!normalized.place?.place_id) {
            return;
        }

        hydratedFromInitialRef.current = true;

        setPlace(normalized.place);
        setDescription(normalized.description || "");

        const text = normalized.place?.address || normalized.place?.name || "";

        if (placesRef.current?.setAddressText) {
            placesRef.current.setAddressText(text);
        }
    }, [normalized]);

    useEffect(() => {
        if (!onDraftChange) {
            return;
        }

        onDraftChange({ place, description });
    }, [place, description, onDraftChange]);

    const canContinue = useMemo(() => {
        if (saving) {
            return false;
        }

        if (!place?.place_id) {
            return false;
        }

        if (typeof place?.lat !== "number" || typeof place?.lng !== "number") {
            return false;
        }

        if (!(description || "").trim().length) {
            return false;
        }

        return true;
    }, [place, saving, description]);

    const onPickPlace = (data, details) => {
        if (!details) {
            return;
        }

        const lat = details?.geometry?.location?.lat;
        const lng = details?.geometry?.location?.lng;

        if (typeof lat !== "number" || typeof lng !== "number") {
            showToast(t("Neizdevās nolasīt vietas koordinātas"), "error");
            return;
        }

        const formattedAddress = details?.formatted_address || data?.description || "";
        const name = details?.name || data?.structured_formatting?.main_text || "";

        touchedRef.current = true;

        setPlace({
            place_id: data?.place_id || details?.place_id,
            name,
            address: formattedAddress,
            lat,
            lng,
            city: details?.address_components?.find((c) => (c?.types || []).includes("locality"))?.long_name || null,
            country: details?.address_components?.find((c) => (c?.types || []).includes("country"))?.long_name || null,
        });

        Keyboard.dismiss();
    };

    const clearPlace = () => {
        touchedRef.current = true;

        setPlace(null);

        if (placesRef.current?.setAddressText) {
            placesRef.current.setAddressText("");
        }
    };

    const save = async () => {
        if (saving) {
            return;
        }

        if (!GOOGLE_PLACES_API_KEY) {
            showToast(t("Trūkst Google Places API atslēga"), "error");
            return;
        }

        if (!place?.place_id) {
            showToast(t("Lūdzu izvēlies vietu no saraksta"), "error");
            return;
        }

        if (!(description || "").trim().length) {
            showToast(t("Biogrāfija ir obligāta"), "error");
            return;
        }

        setSaving(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const payload = {
                place_id: place.place_id,
                name: place.name,
                address: place.address,
                lat: place.lat,
                lng: place.lng,
                city: place.city,
                country: place.country,
                description: (description || "").trim() || null,
            };

            const result = await onSubmit?.(payload);

            hideModal();
            setSaving(false);

            if (!result?.ok) {
                showToast(t("Whoops! Please try again later..."), "error");
                return;
            }

            if (onDone) {
                onDone(result.payload);
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
                <View className="absolute -top-36 -right-28 h-96 w-96 rounded-full bg-primary-5/24 blur-2xl" />
                <View className="absolute top-28 -left-32 h-80 w-80 rounded-full bg-accent-cyan/14 blur-2xl" />
                <View className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-primary-5/16 blur-2xl" />
                <View className="absolute -bottom-16 -right-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
                <View className="absolute inset-0 bg-bg" />
                <View className="absolute inset-0 bg-black/65" />
            </View>

            <View className="flex-1">
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingTop: 22,
                        paddingHorizontal: 24,
                        paddingBottom: Math.max(18, insets.bottom + 18),
                    }}
                >
                    <View className="mt-2">
                        <View className="flex-row items-center">
                            <View className="h-2 w-2 rounded-full bg-primary-5 mr-2" />
                            <Text className="text-white/60 text-xs font-semibold tracking-wide uppercase">
                                {t("Koncertvieta")}
                            </Text>
                        </View>

                        <Text className="text-text text-4xl font-extrabold tracking-tight mt-3 leading-[40px]">
                            {t("Atzīmē savu vietu kartē")}
                        </Text>

                        <Text className="text-white/75 text-base mt-4 leading-6">
                            {t("Ieraksti nosaukumu vai adresi un izvēlies precīzu vietu no saraksta.")}
                        </Text>
                    </View>

                    <View className="mt-8">
                        <Text className="text-text font-extrabold text-base mb-3">
                            {t("Atrašanās vieta")}
                        </Text>

                        <View className="rounded-2xl">
                            <GooglePlacesAutocomplete
                                ref={placesRef}
                                disableScroll={true}
                                placeholder={t("Sāc rakstīt: Zeit, Rīga...")}
                                fetchDetails={true}
                                enablePoweredByContainer={false}
                                onPress={onPickPlace}
                                query={{
                                    key: GOOGLE_PLACES_API_KEY,
                                    language: "lv",
                                }}
                                styles={{
                                    container: { flex: 0, width: "100%" },
                                    textInputContainer: {
                                        flexDirection: "row",
                                        alignItems: "center",
                                        backgroundColor: "rgba(255,255,255,0.06)",
                                        borderRadius: 14,
                                        paddingHorizontal: 10,
                                        height: 52,
                                        width: "100%",
                                    },
                                    textInput: {
                                        flex: 1,
                                        height: "100%",
                                        color: "white",
                                        fontSize: 16,
                                        paddingHorizontal: 8,
                                        paddingTop: 10,
                                        backgroundColor: "transparent",
                                        minWidth: 0,
                                    },
                                    listView: {
                                        backgroundColor: "rgba(10,10,12,0.98)",
                                        marginTop: 8,
                                        borderRadius: 16,
                                        padding: 8,
                                        width: "100%",
                                        overflow: "hidden",
                                    },
                                    row: {
                                        paddingVertical: 14,
                                        paddingHorizontal: 12,
                                        borderRadius: 14,
                                        backgroundColor: "rgba(255,255,255,0.04)",
                                        marginBottom: 6,
                                    },
                                    separator: { height: 0 },
                                }}
                                renderRow={(rowData) => {
                                    const main = rowData?.structured_formatting?.main_text || rowData?.description || "";
                                    const secondary = rowData?.structured_formatting?.secondary_text || "";

                                    return (
                                        <View style={{ width: "100%" }}>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={{ color: "white", fontSize: 15, fontWeight: "700", minWidth: 0 }}
                                            >
                                                {main}
                                            </Text>

                                            {!!secondary && (
                                                <Text
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                    style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 2, minWidth: 0 }}
                                                >
                                                    {secondary}
                                                </Text>
                                            )}
                                        </View>
                                    );
                                }}
                                renderLeftButton={() => (
                                    <View className="h-full items-center justify-center pr-2">
                                        <View className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 items-center justify-center">
                                            <MaterialCommunityIcons name="map-marker-outline" size={20} color="white" />
                                        </View>
                                    </View>
                                )}
                            />
                        </View>

                        {!!place?.place_id && (
                            <View className="mt-5 rounded-2xl border border-primary-5/25 bg-primary-5/10 px-5 py-4 overflow-hidden">
                                <View className="flex-row items-start">
                                    <View className="mr-4 mt-1">
                                        <View className="h-11 w-11 rounded-2xl border border-primary-5/30 bg-black/30 items-center justify-center">
                                            <MaterialCommunityIcons name="check-circle-outline" size={20} color="white" />
                                        </View>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-text font-extrabold text-base">
                                            {place.name || t("Izvēlētā vieta")}
                                        </Text>

                                        <Text className="text-white/70 text-sm mt-1 leading-5">
                                            {place.address}
                                        </Text>

                                        <Pressable onPress={clearPlace} className="mt-3 self-start">
                                            <Text className="text-primary-5 font-semibold text-sm">
                                                {t("Mainīt")}
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>

                    <View className="mt-10">
                        <Text className="text-text font-extrabold text-base mb-3">
                            {t("Apraksts")}
                        </Text>

                        <PrimaryTextInput
                            placeholder={t("Piemēram: intīma skatuve, laba skaņa, bieži indie/rock vakari…")}
                            value={description}
                            onChangeText={(v) => {
                                touchedRef.current = true;
                                setDescription(v);
                            }}
                            multiline={true}
                            style={{
                                fontSize: 16,
                                lineHeight: 20,
                                paddingVertical: 4,
                                minHeight: 120,
                                textAlignVertical: "top",
                            }}
                        />
                    </View>

                    <View className="mt-10">
                        <PrimaryButton
                            title={t("Turpināt")}
                            disabled={!canContinue}
                            onPress={() => {
                                Keyboard.dismiss();
                                save();
                            }}
                        />
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}
