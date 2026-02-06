const ENV = "development";

export const BASE_URL = "https://superoptimal-moises-nonoptimistic.ngrok-free.dev/";

const API_BASE_URLS = {
    development: BASE_URL + "api",
    production: BASE_URL + "api"
};

export const API_BASE_URL = API_BASE_URLS[ENV];