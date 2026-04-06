export const normalizeBaseUrl = (value = "") =>
  value.trim().replace(/\/+$/, "");

export const buildApiUrl = (baseUrl, path) =>
  `${normalizeBaseUrl(baseUrl)}${path.startsWith("/") ? path : `/${path}`}`;
