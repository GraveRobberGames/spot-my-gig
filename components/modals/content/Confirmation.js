import React from "react";
import {View, Text, Pressable} from "react-native";
import PrimaryButton from "../../buttons/PrimaryButton";
import SecondaryButton from "../../buttons/SecondaryButton";
import {Path, Svg} from "react-native-svg";
import {useTranslation} from "react-i18next";

export default function Confirmation({
                                    text,
                                    onConfirm,
                                    onClose,
                                }) {
    const {t} = useTranslation();

    return (
        <View className="bg-gray-24 rounded-xl p-6 items-center shadow-lg pt-14">
            <View className="absolute top-4 right-2">
                <Pressable className="absolute right-2" onPress={onClose}>
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                        <Path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.3166 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
                            fill="#ffffff"
                        />
                    </Svg>
                </Pressable>
            </View>
            <Text className="text-white text-xl font-semibold mb-1 text-center">{t('Hey!')}</Text>
            <Text className="text-[#ABAFC4] text-base mb-8 text-center">
                {text}
            </Text>
            <View className="space-y-2 flex-col w-full">
                <PrimaryButton title={t('Yes, I am sure')} onPress={onConfirm}/>
                <SecondaryButton title={t('Go back')} onPress={onClose}/>
            </View>
        </View>
    );
}