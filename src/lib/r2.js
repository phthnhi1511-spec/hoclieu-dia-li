import { invokeFunction, functionsBaseUrl } from "./functionsClient";

const defaultR2PublicBaseUrl =
  "https://04443c5d0ebe24eaa3c36a88b0f7dc6e.r2.cloudflarestorage.com/hoc-lieu";

const r2PublicBaseUrl = (
  import.meta.env.VITE_R2_PUBLIC_BASE_URL || defaultR2PublicBaseUrl
).replace(/\/+$/, "");
const localR2ObjectBaseUrl = "/dev-r2-object";
const defaultFunctionsBaseUrl = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL.replace(/\/+$/, "")}/functions/v1`
  : "";

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

  const activeFunctionsBaseUrl = (functionsBaseUrl || defaultFunctionsBaseUrl).replace(/\/+$/, "");

  if (!activeFunctionsBaseUrl) {
    return `${r2PublicBaseUrl}/${normalizedPath}`;
  }

  return `${activeFunctionsBaseUrl}/r2-file-proxy?objectKey=${normalizedPath}`;
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

  try {
    if (!functionsBaseUrl && import.meta.env.DEV) {
      const data = await invokeLocalFunction("r2-sign-file-url", {
        objectKey: normalizedPath,
        expiresIn,
      });

      if (data?.fileUrl) {
        return data.fileUrl;
      }
    } else {
      const { data, error } = await invokeFunction("r2-sign-file-url", {
        objectKey: normalizedPath,
        expiresIn,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.fileUrl) {
        return data.fileUrl;
      }
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      return `${localR2ObjectBaseUrl}/${normalizeObjectPath(normalizedPath)}`;
    }

    throw error;
  }

  return buildR2PublicFileUrl(normalizedPath);
}
