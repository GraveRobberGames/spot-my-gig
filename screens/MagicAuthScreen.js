import React, {useEffect} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {useAppContext} from '../contexts/AppContext';
import {useModal} from '../contexts/ModalContext';
import {useUserContext} from "../contexts/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {MODAL_TYPES} from "../constants/ModalTypes";
import {registerPushToken} from "../hooks/expoPushToken";
import {API_BASE_URL} from "../constants/Global";
import {useTranslation} from "react-i18next";
import {getProfileStepIndex} from "../components/profile/ProfileFlowConfig";

export default function MagicAuthScreen({route, navigation}) {
    const token = route.params?.token;
    const email = route.params?.email;

    const {showToast} = useAppContext();
    const {updateUser} = useUserContext();
    const {showModal, hideModal} = useModal();
    const {t} = useTranslation();

    useEffect(() => {
        async function verifyMagic() {
            if (!token || !email) {
                showToast(t('Invalid login link. Please request a new one from the app.'), 'error');

                navigation.reset({
                    index: 0,
                    routes: [{name: 'AuthScreen'}],
                });

                return;
            }

            showModal(MODAL_TYPES.LOADING);

            try {
                const res = await fetch(`${API_BASE_URL}/user/auth`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({token, email}),
                });

                let data = null;

                try {
                    data = await res.json();
                } catch {}

                if (!res.ok || !data?.success) {
                    const messageFromApi = data?.message || t('Sorry, we couldn’t sign you in. Please try again!');

                    hideModal();
                    showToast(messageFromApi, 'error');

                    navigation.reset({
                        index: 0,
                        routes: [{name: 'AuthScreen'}],
                    });

                    return;
                }

                hideModal();

                updateUser({...data.payload});
                await AsyncStorage.setItem('user', JSON.stringify({...data.payload}));
                await AsyncStorage.setItem('api_token', data.token);
                await registerPushToken(data.payload.id);

                const progress = data.payload.profile_progress;

                if (progress?.is_completed) {
                    navigation.reset({index: 0, routes: [{name: "DashboardScreen"}]});
                    return;
                }

                const initialStep = getProfileStepIndex(data.payload?.type, progress?.next_step);

                navigation.reset({
                    index: 0,
                    routes: [{
                        name: "CreateProfile",
                        params: {
                            initialStep,
                            stepKey: progress?.next_step,
                        },
                    }],
                });
            } catch (e) {
                hideModal();
                showToast(t('Sorry, we couldn’t sign you in. Please try again!'), 'error');

                navigation.reset({
                    index: 0,
                    routes: [{name: 'AuthScreen'}],
                });
            }
        }

        verifyMagic();
    }, [token, email]);

    return (
        <View className="flex-1 bg-bg justify-center items-center">
            <View className="items-center rounded-2xl border border-white/10 bg-black/25 px-8 py-7">
                <ActivityIndicator size="large" color="#775EEB" />

                <Text className="text-text mt-4 text-base font-semibold">
                    {t("Notiek autentifikācija…")}
                </Text>

                <Text className="text-white/60 mt-1 text-sm">
                    {t("Lūdzu, uzgaidi mirkli")}
                </Text>
            </View>
        </View>
    );
}
