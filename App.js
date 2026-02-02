import "./global.css";
import * as React from 'react';
import * as Linking from 'expo-linking';
import {NavigationContainer, useNavigationContainerRef} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from './screens/WelcomeScreen';
import AuthScreen from './screens/AuthScreen';
import MagicAuthScreen from './screens/MagicAuthScreen';
import AppEntryScreen from './screens/AppEntryScreen';
import {AuthProvider} from './contexts/AuthContext';
import {AppProvider, useAppContext} from './contexts/AppContext';
import ToastNotification from './components/notifications/ToastNotification';
import {ModalProvider} from './contexts/ModalContext';
import GlobalModal from './components/modals/GlobalModal';
import {UserProvider} from './contexts/UserContext';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {I18nextProvider} from 'react-i18next';
import i18n from './i18n';

const Stack = createNativeStackNavigator();

const linking = {
    prefixes: ['meetmeatbar://', "https://www.meetatbar.com", Linking.createURL('/'), 'exp://'],
    config: {
        screens: {
            Welcome: 'welcome',
            Auth: 'auth',
            Dashboard: 'dashboard',
            MagicAuth: 'auth/magic',
            CheckInHandler: {
                path: "checkin",
                parse: {id: (id) => id},
            },
        },
    },
};

function ToastNotificationHooked() {
    const {toast, hideToast} = useAppContext();

    return (
        <ToastNotification
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            onHide={hideToast}
        />
    );
}

export default function App() {
    const navigationRef = useNavigationContainerRef();

    return (
        <I18nextProvider i18n={i18n}>
            <SafeAreaProvider>
                <UserProvider>
                    <AppProvider>
                        <AuthProvider>
                            <ModalProvider>
                                <ToastNotificationHooked/>

                                <NavigationContainer linking={linking} ref={navigationRef}>
                                    <GlobalModal/>

                                    <Stack.Navigator screenOptions={{headerShown: false}}>
                                        <Stack.Screen name="AppEntryScreen" component={AppEntryScreen}/>
                                        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen}/>
                                        <Stack.Screen name="AuthScreen" component={AuthScreen}/>
                                        <Stack.Screen name="MagicAuthScreen" component={MagicAuthScreen}/>
                                    </Stack.Navigator>
                                </NavigationContainer>
                            </ModalProvider>
                        </AuthProvider>
                    </AppProvider>
                </UserProvider>
            </SafeAreaProvider>
        </I18nextProvider>
    );
}
