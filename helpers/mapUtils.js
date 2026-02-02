export const regionAlmostSame = (a, b) => {
    if (!a || !b) return false;

    const epsCenter = 0.00015;
    const epsDelta = 0.00015;

    return (
        Math.abs(a.latitude - b.latitude) < epsCenter &&
        Math.abs(a.longitude - b.longitude) < epsCenter &&
        Math.abs(a.latitudeDelta - b.latitudeDelta) < epsDelta &&
        Math.abs(a.longitudeDelta - b.longitudeDelta) < epsDelta
    );
};

export const computeBarZIndex = (bar, activeCount, isCurrentVenue) => {
    const crowdBoost = Math.min(activeCount, 999);
    const highlightBoost = bar?.is_highlighted ? 1000 : 0;
    const currentBoost = isCurrentVenue ? 2000 : 0;

    return 1000 + currentBoost + highlightBoost + crowdBoost;
};

export const getBoundsFromRegion = (reg) => {
    const latDelta = reg.latitudeDelta / 2;
    const lngDelta = reg.longitudeDelta / 2;

    return {
        minLat: reg.latitude - latDelta,
        maxLat: reg.latitude + latDelta,
        minLng: reg.longitude - lngDelta,
        maxLng: reg.longitude + lngDelta,
    };
};

export const toNumber = (v) => {
    if (v === null || v === undefined) return null;
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(",", "."));

    return Number.isFinite(n) ? n : null;
};

const toRad = (deg) => (deg * Math.PI) / 180;

export const distanceInMeters = (from, to) => {
    if (!from || !to) return null;

    const lat1 = toNumber(from.latitude);
    const lon1 = toNumber(from.longitude);
    const lat2 = toNumber(to.latitude);
    const lon2 = toNumber(to.longitude);

    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
        return null;
    }

    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lon2 - lon1);
    const rLat1 = toRad(lat1);
    const rLat2 = toRad(lat2);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(rLat1) * Math.cos(rLat2) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
};

export const makeFetchKey = (bounds, userLat, userLng) => {
    return [
        bounds.minLat.toFixed(4),
        bounds.maxLat.toFixed(4),
        bounds.minLng.toFixed(4),
        bounds.maxLng.toFixed(4),
        userLat.toFixed(4),
        userLng.toFixed(4),
    ].join("|");
};
