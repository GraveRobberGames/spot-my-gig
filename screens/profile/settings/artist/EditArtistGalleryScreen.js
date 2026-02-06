import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ScreenHeader from "../../../../components/navigation/ScreenHeader";
import PrimaryButton from "../../../../components/buttons/PrimaryButton";
import GalleryForm from "../../../../components/profile/forms/GalleryForm";

import { useUserContext } from "../../../../contexts/UserContext";
import { useAppContext } from "../../../../contexts/AppContext";
import { useModal } from "../../../../contexts/ModalContext";
import { MODAL_TYPES } from "../../../../constants/ModalTypes";

import { saveProfileGallery } from "../../../../services/ProfileService";

export default function EditArtistGalleryScreen({ navigation }) {
    const { t } = useTranslation();
    const { user, updateUser } = useUserContext();
    const { showToast } = useAppContext();
    const { showModal, hideModal } = useModal();

    const [saving, setSaving] = useState(false);
    const [formState, setFormState] = useState(null);

    const initial = useMemo(() => {
        if (Array.isArray(user?.gallery)) {
            return user.gallery;
        }
        return [];
    }, [user]);

    const canSave = useMemo(() => {
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
            showToast(formState?.errors?.[0] || t("Lūdzu pārbaudi ievadi."), "error");
            return;
        }

        setSaving(true);
        showModal(MODAL_TYPES.LOADING);

        try {
            const result = await saveProfileGallery({
                existing: formState.existing,
                photos: formState.newFiles,
            });

            hideModal();
            setSaving(false);

            if (!result?.ok) {
                showToast(t("Whoops! Please try again later..."), "error");
                return;
            }

            updateUser(result.payload);
            await AsyncStorage.setItem("user", JSON.stringify(result.payload));

            showToast(t("Profils tika veiksmīgi saglabāts!"), "success");
            navigation.goBack();
        } catch {
            hideModal();
            setSaving(false);
            showToast(t("Looks like there’s a network hiccup. Please check your connection!"), "error");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
            <ScreenHeader onBack={() => navigation.goBack()} />

            <ScrollView
                className="flex-1"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 140 }}
            >
                <Text className="text-text text-4xl font-extrabold tracking-tight">
                    {t("Galerija")}
                </Text>

                <Text className="text-white/70 text-base mt-4 leading-6">
                    {t("Pievieno vismaz 5 bildes, lai koncertvietas var sajust Tavu vibe.")}
                </Text>

                <View className="mt-7">
                    <GalleryForm
                        initial={initial}
                        disabled={saving}
                        minCount={1}
                        maxCount={12}
                        onChange={setFormState}
                    />
                </View>
            </ScrollView>

            <View className="px-6 pb-6 pt-4 border-t border-border bg-bg">
                <PrimaryButton
                    title={t("Saglabāt")}
                    disabled={!canSave}
                    onPress={() => {
                        Keyboard.dismiss();
                        save();
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
