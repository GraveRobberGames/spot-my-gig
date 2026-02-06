import React, { useMemo } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useUserContext } from "../../contexts/UserContext";
import {getCountryByCode, getFlagEmoji} from "../../constants/Countries";

function SectionTitle({ title }) {
    return (
        <Text className="text-white/70 text-sm font-extrabold tracking-wide uppercase px-6 mt-7 mb-3">
            {title}
        </Text>
    );
}

function Row({ icon, title, onPress, danger = false }) {
    return (
        <Pressable onPress={onPress} className="px-5 py-3 active:opacity-90">
            <View className="flex-row items-center">
                <View
                    className={`h-10 w-10 rounded-xl items-center justify-center border ${
                        danger ? "bg-danger/10 border-danger/20" : "bg-white/5 border-white/10"
                    }`}
                >
                    <MaterialCommunityIcons
                        name={icon}
                        size={20}
                        color={danger ? "rgba(239,68,68,0.95)" : "rgba(243,244,246,0.9)"}
                    />
                </View>

                <View className="flex-1 pl-4 pr-3">
                    <Text className={`text-md font-extrabold ${danger ? "text-danger" : "text-text"}`}>
                        {title}
                    </Text>
                </View>

                <MaterialCommunityIcons name="chevron-right" size={22} color="rgba(255,255,255,0.35)" />
            </View>
        </Pressable>
    );
}

function Card({ children }) {
    return (
        <View className="mx-6 rounded-3xl bg-surface border border-border overflow-hidden">
            {children}
        </View>
    );
}

function Divider() {
    return (
        <View className="px-5">
            <View className="h-[1px] bg-border ml-14" />
        </View>
    );
}

export default function ProfileScreen({ navigation }) {
    const { t } = useTranslation();
    const { user } = useUserContext();

    const displayName = useMemo(() => {
        const name = String(user?.name || "").trim();

        if (name !== "") {
            return name;
        }

        const email = String(user?.email || "").trim();

        if (email !== "") {
            return email;
        }

        return t("Mans profils");
    }, [t, user]);

    const avatarUrl = useMemo(() => {
        const url = String(user?.avatar_thumb_url || user?.avatar_full_url || "").trim();

        if (url !== "") {
            return url;
        }

        return "";
    }, [user]);

    const sections = useMemo(() => {
        const base = [
            {
                title: t("Konts"),
                items: [
                    {
                        icon: "account-edit-outline",
                        title: t("Rediģēt profilu"),
                        subtitle: t("Vārds, foto, valsts, bio"),
                        route: "EditProfile",
                    },
                    {
                        icon: "shield-check-outline",
                        title: t("Drošība"),
                        subtitle: t("Pieslēgšanās, ierīces, sesijas"),
                        route: "SecuritySettings",
                    },
                    {
                        icon: "translate",
                        title: t("Valoda"),
                        subtitle: t("Latviešu / English"),
                        route: "LanguageSettings",
                    },
                ],
            },
            {
                title: t("Iestatījumi"),
                items: [
                    {
                        icon: "bell-outline",
                        title: t("Paziņojumi"),
                        subtitle: t("Push, e-pasts"),
                        route: "NotificationSettings",
                    },
                    {
                        icon: "map-marker-outline",
                        title: t("Lokācija"),
                        subtitle: t("Kur Tu darbojas"),
                        route: "LocationSettings",
                    },
                    {
                        icon: "help-circle-outline",
                        title: t("Atbalsts"),
                        subtitle: t("Palīdzība un kontakti"),
                        route: "SupportScreen",
                    },
                ],
            },
        ];

        const artist = [
            {
                title: t("Mākslinieka iestatījumi"),
                items: [
                    {
                        icon: "account-music-outline",
                        title: t("Žanri un biogrāfija"),
                        route: "EditArtistGenreDescriptionScreen",
                    },
                    {
                        icon: "spotify",
                        title: t("Ārējie mūzikas profili"),
                        route: "EditArtistMusicScreen",
                    },
                    {
                        icon: "image-multiple-outline",
                        title: t("Galerija"),
                        route: "EditArtistGalleryScreen",
                    },
                    {
                        icon: "share-variant-outline",
                        title: t("Sociālie tīkli"),
                        route: "EditArtistSocialMediaScreen",
                    },
                    {
                        icon: "cash-multiple",
                        title: t("Honorārs"),
                        route: "ArtistRateSettings",
                    },
                ],
            },
        ];

        const venue = [
            {
                title: t("Koncertvietas iestatījumi"),
                items: [
                    {
                        icon: "storefront-outline",
                        title: t("Vietas informācija"),
                        subtitle: t("Apraksts, adrese, ietilpība"),
                        route: "VenueDetailsSettings",
                    },
                    {
                        icon: "calendar-outline",
                        title: t("Pieejamība"),
                        subtitle: t("Datumi, laiki, grafiks"),
                        route: "VenueAvailabilitySettings",
                    },
                    {
                        icon: "instagram",
                        title: t("Sociālie tīkli"),
                        subtitle: t("Instagram, TikTok, Facebook, mājaslapa"),
                        route: "VenueSocialSettings",
                    },
                ],
            },
        ];

        const watcher = [
            {
                title: t("Apmeklētāja iestatījumi"),
                items: [
                    {
                        icon: "heart-outline",
                        title: t("Saglabātie"),
                        subtitle: t("Mākslinieki un vietas"),
                        route: "SavedScreen",
                    },
                    {
                        icon: "tune-vertical",
                        title: t("Intereses"),
                        subtitle: t("Žanri un ieteikumi"),
                        route: "WatcherPreferences",
                    },
                ],
            },
        ];

        const type = String(user?.type || "");

        if (type === "artist") {
            return [...artist, ...base];
        }

        if (type === "venue") {
            return [...venue, ...base];
        }

        if (type === "watcher") {
            return [...watcher, ...base];
        }

        return base;
    }, [t, user]);

    const bottom = useMemo(() => {
        return [
            {
                title: t("Juridiski"),
                items: [
                    {
                        icon: "file-document-outline",
                        title: t("Lietošanas noteikumi"),
                        subtitle: t("Apskati noteikumus"),
                        route: "TermsScreen",
                    },
                    {
                        icon: "lock-outline",
                        title: t("Privātuma politika"),
                        subtitle: t("Kā apstrādājam datus"),
                        route: "PrivacyScreen",
                    },
                ],
            },
            {
                title: t("Konts"),
                items: [
                    {
                        icon: "logout",
                        title: t("Iziet"),
                        subtitle: t("Atvienot šo ierīci"),
                        route: "SignOut",
                        danger: true,
                    },
                ],
            },
        ];
    }, [t]);

    return (
        <SafeAreaView className="flex-1 bg-bg" edges={["top", "bottom"]}>
            <View className="absolute inset-0">
                <View className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary-5/20" />
                <View className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-accent-cyan/10" />
                <View className="absolute inset-0 bg-black/40" />
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="px-6 pt-6">
                    <Text className="text-text text-4xl font-extrabold tracking-tight">
                        {t("Profils")}
                    </Text>
                </View>

                <View className="mt-6 mx-6 items-center">
                    <View className="h-28 w-28 rounded-full bg-white/5 border border-white/10 overflow-hidden items-center justify-center">
                        {avatarUrl !== "" ? (
                            <Image
                                source={{ uri: avatarUrl }}
                                className="h-28 w-28 rounded-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <MaterialCommunityIcons
                                name="account"
                                size={44}
                                color="rgba(243,244,246,0.85)"
                            />
                        )}
                    </View>

                    <Text className="text-text text-2xl font-extrabold mt-4 text-center">
                        {displayName}
                    </Text>

                    {!!user?.country_code && (
                        <View className="flex-row items-center">
                            <Text className="text-base mr-2">
                                {getFlagEmoji(user.country_code)}
                            </Text>

                            <Text className="text-muted text-sm font-semibold">
                                {getCountryByCode(user.country_code)?.name || user.country_code}
                            </Text>
                        </View>
                    )}
                </View>

                {sections.map((section, sectionIdx) => {
                    return (
                        <View key={`${section.title}-${sectionIdx}`}>
                            <SectionTitle title={section.title} />

                            <Card>
                                {section.items.map((item, idx) => {
                                    return (
                                        <View key={`${item.title}-${idx}`}>
                                            <Row
                                                icon={item.icon}
                                                title={item.title}
                                                danger={!!item.danger}
                                                onPress={() => {
                                                    if (item.route === "SignOut") {
                                                        navigation.navigate("SignOutConfirm");
                                                    } else {
                                                        navigation.navigate(item.route);
                                                    }
                                                }}
                                            />
                                            {idx !== section.items.length - 1 && <Divider />}
                                        </View>
                                    );
                                })}
                            </Card>
                        </View>
                    );
                })}

                {bottom.map((section, sectionIdx) => {
                    return (
                        <View key={`${section.title}-${sectionIdx}`}>
                            <SectionTitle title={section.title} />

                            <Card>
                                {section.items.map((item, idx) => {
                                    return (
                                        <View key={`${item.title}-${idx}`}>
                                            <Row
                                                icon={item.icon}
                                                title={item.title}
                                                subtitle={item.subtitle}
                                                danger={!!item.danger}
                                                onPress={() => {
                                                    if (item.route === "SignOut") {
                                                        navigation.navigate("SignOutConfirm");
                                                    } else {
                                                        navigation.navigate(item.route);
                                                    }
                                                }}
                                            />
                                            {idx !== section.items.length - 1 && <Divider />}
                                        </View>
                                    );
                                })}
                            </Card>
                        </View>
                    );
                })}

                <View className="px-6 mt-10">
                    <Text className="text-white/40 text-xs text-center">
                        SpotMyGig • v1.0
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
