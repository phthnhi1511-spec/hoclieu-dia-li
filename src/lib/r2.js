const r2PublicBaseUrl = (import.meta.env.CLOUDFLARE_R2_PUBLIC_BASE_URL || "").replace(
  /\/+$/,
  "",
);
const localR2ObjectBaseUrl = "/dev-r2-object";

if (!r2PublicBaseUrl) {
  throw new Error("Missing CLOUDFLARE_R2_PUBLIC_BASE_URL.");
}

function normalizeObjectPath(filePath) {
  return String(filePath)
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function buildR2PublicFileUrl(filePath) {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  return `${r2PublicBaseUrl}/${normalizeObjectPath(filePath)}`;
}

export function buildR2FileUrl(filePath) {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const normalizedPath = normalizeObjectPath(filePath);

  if (import.meta.env.DEV) {
    return `${localR2ObjectBaseUrl}/${normalizedPath}`;
  }

  return `${r2PublicBaseUrl}/${normalizedPath}`;
}

export function buildR2ProxyFileUrl(filePath) {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const normalizedPath = normalizeObjectPath(filePath);

  if (import.meta.env.DEV) {
    return `${localR2ObjectBaseUrl}/${normalizedPath}`;
  }

  return `${r2PublicBaseUrl}/${normalizedPath}`;
}

export function getR2PublicBaseUrl() {
  return r2PublicBaseUrl;
}

async function invokeLocalFunction(functionName, body) {
  const response = await fetch(`/dev-functions/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Function error (${response.status})`);
  }

  return data;
}

export async function resolveR2ObjectUrl(filePath, options = {}) {
  if (!filePath) return "";
  if (/^https?:\/\//i.test(filePath)) return filePath;

  const normalizedPath = String(filePath).replace(/^\/+/, "");
  const expiresIn = Math.max(60, Math.min(Number(options.expiresIn) || 3600, 86400));

  if (!import.meta.env.DEV) {
    return buildR2PublicFileUrl(normalizedPath);
  }

  try {
    const data = await invokeLocalFunction("r2-sign-file-url", {
      objectKey: normalizedPath,
      expiresIn,
    });

    if (data?.fileUrl) {
      return data.fileUrl;
    }
  } catch {
    return `${localR2ObjectBaseUrl}/${normalizeObjectPath(normalizedPath)}`;
  }

  return buildR2PublicFileUrl(normalizedPath);
}
