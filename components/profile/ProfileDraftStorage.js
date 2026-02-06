import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAFT_VERSION = "v1";

function buildDraftKey(userId) {
    const id = userId ? String(userId) : "anon";
    return `profile_draft_${DRAFT_VERSION}_${id}`;
}

async function safeRead(key) {
    try {
        const raw = await AsyncStorage.getItem(key);

        if (!raw) {
            return {};
        }

        const parsed = JSON.parse(raw);

        if (!parsed || typeof parsed !== "object") {
            return {};
        }

        return parsed;
    } catch {
        return {};
    }
}

async function safeWrite(key, value) {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value || {}));
    } catch {
    }
}

export async function loadProfileDraft(userId) {
    const key = buildDraftKey(userId);
    return await safeRead(key);
}

export async function setProfileDraftStep(userId, stepKey, stepValue) {
    const key = buildDraftKey(userId);
    const draft = await safeRead(key);

    let nextValue = stepValue;

    if (nextValue === null || nextValue === undefined) {
        nextValue = {};
    }

    const next = {
        ...draft,
        [stepKey]: nextValue,
    };

    await safeWrite(key, next);

    return next;
}

export async function clearProfileDraftStep(userId, stepKey) {
    const key = buildDraftKey(userId);
    const draft = await safeRead(key);

    if (!draft || typeof draft !== "object") {
        return {};
    }

    const next = { ...draft };
    delete next[stepKey];

    await safeWrite(key, next);

    return next;
}

export async function clearProfileDraftAll(userId) {
    const key = buildDraftKey(userId);
    await safeWrite(key, {});
}
