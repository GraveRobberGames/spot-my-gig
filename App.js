import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GlobalModal from './components/modals/GlobalModal';
import ToastNotification from './components/notifications/ToastNotification';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { UserProvider } from './contexts/UserContext';
import "./global.css";
import i18n from './i18n';
import AppEntryScreen from './screens/AppEntryScreen';
import AuthScreen from './screens/AuthScreen';
import MagicAuthScreen from './screens/MagicAuthScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import CreateProfileScreen from "./screens/profile/CreateProfileScreen";

const Stack = createNativeStackNavigator();

const linking = {
    prefixes: ["spotmygig://", "https://www.spotmygig.com", Linking.createURL("/"), "exp://"],
    config: {
        screens: {
            WelcomeScreen: "welcome",
            AuthScreen: "auth",
            DashboardScreen: "dashboard",
            MagicAuthScreen: {
                path: "auth/magic",
                parse: {
                    token: (token) => token,
                    email: (email) => email,
                },
            },
        },
    },
};

function ToastNotificationHooked() {
    const { toast, hideToast } = useAppContext();

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
                                <ToastNotificationHooked />

                                <NavigationContainer linking={linking} ref={navigationRef}>
                                    <GlobalModal />

                                    <Stack.Navigator screenOptions={{ headerShown: false }}>
                                        <Stack.Screen name="AppEntryScreen" component={AppEntryScreen} />
                                        <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
                                        <Stack.Screen name="AuthScreen" component={AuthScreen} />
                                        <Stack.Screen name="MagicAuthScreen" component={MagicAuthScreen} />
                                        <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
                                        <Stack.Screen name="CreateProfile" component={CreateProfileScreen} />
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
