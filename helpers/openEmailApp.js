import {ActionSheetIOS, Alert, Linking, Platform} from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

export async function openEmailApp() {
    if (Platform.OS === 'ios') {
        const candidates = [
            {name: 'Apple Mail', url: 'message://'},
            {name: 'Gmail', url: 'googlegmail://'},
            {name: 'Outlook', url: 'ms-outlook://'},
            {name: 'Spark', url: 'readdle-spark://'},
        ];

        const available = [];
        for (const c of candidates) {
            try {
                if (await Linking.canOpenURL(c.url)) available.push(c);
            } catch (_) {
            }
        }

        if (available.length === 0) {
            await fallbackMailto();
            return;
        }

        if (available.length === 1) {
            await Linking.openURL(available[0].url).catch(fallbackMailto);
            return;
        }

        const options = available.map(c => c.name).concat('Cancel');

        ActionSheetIOS.showActionSheetWithOptions(
            {options, cancelButtonIndex: options.length - 1},
            async idx => {
                if (idx < available.length) {
                    try {
                        await Linking.openURL(available[idx].url);
                    } catch {
                        await fallbackMailto();
                    }
                }
            },
        );
        return;
    }

    try {
        await IntentLauncher.startActivityAsync('android.intent.action.SENDTO', {
            data: 'mailto:',
        });
    } catch {
        await fallbackMailto();
    }

    async function fallbackMailto() {
        try {
            const ok = await Linking.openURL('mailto:');
            if (!ok) throw new Error();
        } catch {
            Alert.alert(
                'No mail app found',
                'Please install Gmail, Outlook, Spark, or Apple Mail to read your verification email.',
            );
        }
    }
}
