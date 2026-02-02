import React, {useEffect} from 'react';
import {View, Text, ActivityIndicator} from 'react-native';
import {useAppContext} from '../contexts/AppContext';
import {useModal} from '../contexts/ModalContext';
import {useUserContext} from "../contexts/UserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {getProfileStepIndex} from "../helpers/getProfileStepIndex";
import {MODAL_TYPES} from "../constants/ModalTypes";
import {registerPushToken} from "../hooks/expoPushToken";
import {API_BASE_URL} from "../constants/Global";
import {useTranslation} from "react-i18next";

export default function MagicAuth({route, navigation}) {
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
                    routes: [{name: 'Auth'}],
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
                } catch (e) {
                    // ignore JSON parse error, we'll fall back to generic message
                }

                if (!res.ok || !data?.success) {
                    const messageFromApi = data?.message || t('Sorry, we couldn’t sign you in. Please try again!');

                    hideModal();
                    showToast(messageFromApi, 'error');

                    navigation.reset({
                        index: 0,
                        routes: [{name: 'Auth'}],
                    });

                    return;
                }

                hideModal();

                updateUser({...data.payload});
                await AsyncStorage.setItem('user', JSON.stringify({...data.payload}));
                await AsyncStorage.setItem('api_token', data.token);
                await registerPushToken(data.payload.id);

                if (data.payload.is_profile_completed) {
                    navigation.reset({
                        index: 0,
                        routes: [{name: 'Dashboard', params: {email}}],
                    });
                } else {
                    const initialStep = getProfileStepIndex(data.payload.profile);

                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: 'CreateProfile',
                            params: {
                                initialStep,
                                profile: data.payload.profile ?? {},
                            },
                        }],
                    });
                }
            } catch (e) {
                hideModal();
                showToast(t('Sorry, we couldn’t sign you in. Please try again!'), 'error');

                navigation.reset({
                    index: 0,
                    routes: [{name: 'Auth'}],
                });
            }
        }

        if (token && email) {
            verifyMagic();
        } else {
            showToast(t('Invalid login link. Please request a new one from the app.'), 'error');

            navigation.reset({
                index: 0,
                routes: [{name: 'Auth'}],
            });
        }
    }, [token, email]);

    return (
        <View className="flex-1 bg-black justify-center items-center">
            <ActivityIndicator color="#fc42a4" size="large"/>
            <Text className="text-primary-5 mt-5">{t('Authenticating...')}</Text>
        </View>
    );
}
