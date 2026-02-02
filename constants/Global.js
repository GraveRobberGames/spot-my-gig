const ENV = "development";

export const BASE_URL = "https://www.meetatbar.com/";

const API_BASE_URLS = {
    development: BASE_URL + "api",
    production: BASE_URL + "api"
};

export const API_BASE_URL = API_BASE_URLS[ENV];
export const MAX_DISTANCE_FROM_BAR = 100;

// Apple testing
export const APPLE_TESTING_EMAIL = 'apple@example.com';
export const APPLE_TESTING_TOKEN = 'f2b7bdfdb0a220d1cd3f3208e160f0abb1233bfab91ad939c963bb883dd5dab5';