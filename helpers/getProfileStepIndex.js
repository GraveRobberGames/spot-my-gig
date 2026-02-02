export function getProfileStepIndex(profile) {
    if (!profile.name) return 0;
    if (!profile.born_at) return 1;
    if (!profile.gender) return 2;
    if (!profile.seeking_genders) return 3;
    if (!profile.photo_url) return 4;

    return 5;
}
