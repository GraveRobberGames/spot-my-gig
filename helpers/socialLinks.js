export const SOCIAL_LINK_TYPES = {
    instagram: "instagram",
    tiktok: "tiktok",
    facebook: "facebook",
    website: "website",
};

export function ensureHttps(raw) {
    const value = (raw || "").trim();

    if (value === "") {
        return "";
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    if (value.startsWith("www.")) {
        return `https://${value}`;
    }

    return `https://${value}`;
}

function stripLeadingAt(value) {
    return (value || "").trim().replace(/^@+/, "");
}

function stripDomainPrefix(value, domain) {
    const v = (value || "").trim();
    return v.replace(new RegExp(`^${domain.replace(".", "\\.")}/`, "i"), "").trim();
}

export function normalizeSocialUrl(type, value) {
    const raw = (value || "").trim();

    if (raw === "") {
        return "";
    }

    if (type === SOCIAL_LINK_TYPES.instagram) {
        if (raw.startsWith("http://") || raw.startsWith("https://")) {
            return raw;
        }

        if (raw.toLowerCase().includes("instagram.com/")) {
            return ensureHttps(raw);
        }

        const handle = stripDomainPrefix(stripLeadingAt(raw), "instagram.com");

        if (handle === "") {
            return "";
        }

        return `https://instagram.com/${handle}`;
    }

    if (type === SOCIAL_LINK_TYPES.tiktok) {
        if (raw.startsWith("http://") || raw.startsWith("https://")) {
            return raw;
        }

        if (raw.toLowerCase().includes("tiktok.com/")) {
            return ensureHttps(raw);
        }

        const handle = stripDomainPrefix(stripLeadingAt(raw), "tiktok.com");

        if (handle === "") {
            return "";
        }

        return `https://tiktok.com/@${handle}`;
    }

    if (type === SOCIAL_LINK_TYPES.facebook) {
        if (raw.startsWith("http://") || raw.startsWith("https://")) {
            return raw;
        }

        if (raw.toLowerCase().includes("facebook.com/")) {
            return ensureHttps(raw);
        }

        const handle = stripDomainPrefix(raw, "facebook.com");

        if (handle === "") {
            return "";
        }

        return `https://facebook.com/${handle}`;
    }

    if (type === SOCIAL_LINK_TYPES.website) {
        return ensureHttps(raw);
    }

    return ensureHttps(raw);
}

export function normalizeSocialValues(values) {
    const safe = values && typeof values === "object" ? values : {};

    return {
        instagram: normalizeSocialUrl(SOCIAL_LINK_TYPES.instagram, safe.instagram),
        tiktok: normalizeSocialUrl(SOCIAL_LINK_TYPES.tiktok, safe.tiktok),
        facebook: normalizeSocialUrl(SOCIAL_LINK_TYPES.facebook, safe.facebook),
        website: normalizeSocialUrl(SOCIAL_LINK_TYPES.website, safe.website),
    };
}

export function toSocialPayload(values) {
    const normalized = normalizeSocialValues(values);

    return {
        instagram: normalized.instagram || null,
        tiktok: normalized.tiktok || null,
        facebook: normalized.facebook || null,
        website: normalized.website || null,
    };
}

export function countFilledSocialLinks(valuesOrPayload) {
    const v = valuesOrPayload && typeof valuesOrPayload === "object" ? valuesOrPayload : {};
    let c = 0;

    if ((v.instagram || "").trim() !== "") c += 1;
    if ((v.tiktok || "").trim() !== "") c += 1;
    if ((v.facebook || "").trim() !== "") c += 1;
    if ((v.website || "").trim() !== "") c += 1;

    return c;
}

export function normalizeSocialInitial(initial) {
    if (!initial || typeof initial !== "object") {
        return { instagram: "", tiktok: "", facebook: "", website: "" };
    }

    return {
        instagram: typeof initial.instagram === "string" ? initial.instagram : "",
        tiktok: typeof initial.tiktok === "string" ? initial.tiktok : "",
        facebook: typeof initial.facebook === "string" ? initial.facebook : "",
        website: typeof initial.website === "string" ? initial.website : "",
    };
}
