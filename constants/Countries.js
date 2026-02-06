export const COUNTRIES = [
    { code: "LV", name: "Latvija" },
    { code: "LT", name: "Lietuva" },
    { code: "EE", name: "Igaunija" },
    { code: "FI", name: "Somija" },
    { code: "SE", name: "Zviedrija" },
    { code: "NO", name: "Norvēģija" },
    { code: "DK", name: "Dānija" },
    { code: "DE", name: "Vācija" },
    { code: "PL", name: "Polija" },
    { code: "GB", name: "Apvienotā Karaliste" },
    { code: "IE", name: "Īrija" },
    { code: "FR", name: "Francija" },
    { code: "ES", name: "Spānija" },
    { code: "IT", name: "Itālija" },
    { code: "NL", name: "Nīderlande" },
    { code: "BE", name: "Beļģija" },
    { code: "CZ", name: "Čehija" },
    { code: "SK", name: "Slovākija" },
    { code: "AT", name: "Austrija" },
    { code: "CH", name: "Šveice" },
    { code: "PT", name: "Portugāle" },
    { code: "UA", name: "Ukraina" },
    { code: "US", name: "Amerikas Savienotās Valstis" },
    { code: "CA", name: "Kanāda" },
];

export function getFlagEmoji(countryCode) {
    const code = String(countryCode || "").toUpperCase();

    if (code.length !== 2) {
        return "🏳️";
    }

    const A = 0x1f1e6;
    const chars = Array.from(code).map((c) => A + (c.charCodeAt(0) - 65));

    return String.fromCodePoint(...chars);
}

export function getCountryByCode(code) {
    const c = String(code || "").toUpperCase();
    return COUNTRIES.find((x) => x.code === c) || null;
}
