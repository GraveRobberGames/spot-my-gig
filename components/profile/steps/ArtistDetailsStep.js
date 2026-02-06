import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Keyboard } from "react-native";
import { useTranslation } from "react-i18next";
import PrimaryButton from "../../buttons/PrimaryButton";
import { useAppContext } from "../../../contexts/AppContext";
import { useModal } from "../../../contexts/ModalContext";
import { MODAL_TYPES } from "../../../constants/ModalTypes";
import { useUserContext } from "../../../contexts/UserContext";
import ArtistGenresDescriptionForm from "../forms/ArtistGenresDescriptionForm";

export default function ArtistDetailsStep({ submitLabel, onSubmit, onDone }) {
    const { t } = useTranslation();
    const { user } = useUserContext();
    const { showToast } = useAppContext();
    const { showModal, hideModal } = useModal();

    const [saving, setSaving] = useState(false);
    const [formState, setFormState] = useState(null);

    const canContinue = useMemo(() => {
        if (saving) {
            return false;
        }

        if (!formState) {
            return false;
        }

        return formState.isValid;
    }, [saving, formState]);

    const save = async () => {
        if (!formState?.isValid) {
            const msg = formState?.errors?.[0] || t("Lūdzu pārbaudi ievadi.");
            showToast(msg, "error");
            return;
        }

        setSaving(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const result = await onSubmit({
                bio: (formState.bio || "").trim(),
                genres: formState.genres,
            });

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
                <View className="absolute -top-40 -right-28 h-96 w-96 rounded-full bg-primary-5/22 blur-2xl" />
                <View className="absolute top-24 -left-32 h-80 w-80 rounded-full bg-accent-cyan/14 blur-2xl" />
                <View className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-primary-5/14 blur-2xl" />
                <View className="absolute -bottom-16 -right-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
            </View>

            <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: 16, paddingHorizontal: 24, paddingBottom: 24 }}
            >
                <View className="mt-2">
                    <Text className="text-white/60 text-xs font-semibold tracking-wide uppercase">
                        {t("Mākslinieka profils")}
                    </Text>

                    <Text className="text-text text-4xl font-extrabold tracking-tight mt-3 leading-[44px]">
                        {t("Tavs skanējums")}
                    </Text>

                    <Text className="text-white/75 text-base mt-4 leading-6">
                        {t("Izvēlies līdz 3 žanriem, kuros Tu spēlē. Tas palīdzēs koncertvietām Tevi atrast.")}
                    </Text>
                </View>

                <View className="mt-7">
                    <ArtistGenresDescriptionForm
                        initialDescription={user?.biography || ""}
                        initialGenres={user?.genres || []}
                        onChange={setFormState}
                    />
                </View>

                <View className="mt-6">
                    <PrimaryButton
                        title={submitLabel || t("Turpināt")}
                        disabled={!canContinue}
                        onPress={() => {
                            Keyboard.dismiss();
                            save();
                        }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}
