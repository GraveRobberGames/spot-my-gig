import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {API_BASE_URL} from "../constants/Global";

export const registerPushToken = async (userId) => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') return;

    const tokenData = await Notifications.getExpoPushTokenAsync();
    const pushToken = tokenData.data;
    await AsyncStorage.setItem('expoPushToken', pushToken);

    const token = await AsyncStorage.getItem("api_token");

    await fetch(`${API_BASE_URL}/user/save-expo-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, token: pushToken }),
    });
};
