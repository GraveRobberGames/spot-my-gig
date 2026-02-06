import React, {useEffect} from "react";
import {View, ActivityIndicator} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useUserContext} from "../contexts/UserContext";
import {getProfileStepIndex} from "../helpers/getProfileStepIndex";
import {API_BASE_URL} from "../constants/Global";

export default function AppEntryScreen({navigation}) {
    const {setUser} = useUserContext();

    useEffect(() => {
        async function checkUserState() {
            try {
                const userJson = await AsyncStorage.getItem("user");

                if (!userJson) {
                    navigation.reset({index: 0, routes: [{name: "WelcomeScreen"}]});
                    return;
                }

                const user = JSON.parse(userJson);
                const token = await AsyncStorage.getItem("api_token");

                const res = await fetch(`${API_BASE_URL}/user/load?email=${user.email}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    await AsyncStorage.removeItem('user');
                    navigation.reset({index: 0, routes: [{name: "WelcomeScreen"}]});
                    return;
                }

                const freshUser = await res.json();
                setUser(freshUser.payload);

                await AsyncStorage.setItem('user', JSON.stringify(freshUser.payload));

                if (freshUser.payload.is_profile_completed) {
                    navigation.reset({index: 0, routes: [{name: "DashboardScreen"}]});
                } else {
                    const initialStep = getProfileStepIndex(freshUser.payload.profile);

                    navigation.reset({
                        index: 0,
                        routes: [{
                            name: "CreateProfile",
                            params: {
                                initialStep,
                                profile: freshUser.payload.profile
                            }
                        }],
                    });
                }
            } catch (e) {
                navigation.reset({index: 0, routes: [{name: "WelcomeScreen"}]});
            }
        }

        checkUserState();
    }, []);

    return (
        <View style={{flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#17171a"}}>
            <ActivityIndicator size="large" color="#fc42a4"/>
        </View>
    );
}
