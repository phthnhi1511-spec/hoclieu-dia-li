import { functionsBaseUrl, invokeFunction } from "./functionsClient";

const r2PublicBaseUrl = (import.meta.env.CLOUDFLARE_R2_PUBLIC_BASE_URL || "").replace(
  /\/+$/,
  "",
);
const localR2ObjectBaseUrl = "/dev-r2-object";
const defaultFunctionsBaseUrl = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL.replace(/\/+$/, "")}/functions/v1`
  : "";

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

function getObjectKey(filePath) {
  if (!filePath) return "";
  if (!/^https?:\/\//i.test(filePath)) return String(filePath).replace(/^\/+/, "");

  try {
    const fileUrl = new URL(filePath);
    const publicBaseUrl = new URL(`${r2PublicBaseUrl}/`);

    if (fileUrl.origin === publicBaseUrl.origin) {
      return decodeURIComponent(fileUrl.pathname.replace(/^\/+/, ""));
    }
  } catch {
    return "";
  }

  return "";
}

export function buildR2ReadableFileUrl(filePath) {
  const objectKey = getObjectKey(filePath);

  if (!objectKey) return filePath || "";

  if (import.meta.env.DEV) {
    return `${localR2ObjectBaseUrl}/${normalizeObjectPath(objectKey)}`;
  }

  const activeFunctionsBaseUrl = (functionsBaseUrl || defaultFunctionsBaseUrl).replace(/\/+$/, "");

  if (!activeFunctionsBaseUrl) return buildR2PublicFileUrl(objectKey);

  return `${activeFunctionsBaseUrl}/r2-file-proxy?objectKey=${normalizeObjectPath(objectKey)}`;
}

export async function getR2DownloadUrl(filePath, downloadFileName) {
  const objectKey = getObjectKey(filePath);

  if (!objectKey) {
    throw new Error("Không thể xác định file cần tải.");
  }

  const payload = {
    objectKey,
    downloadFileName,
    expiresIn: 600,
  };
  const { data, error } = import.meta.env.DEV
    ? { data: await invokeLocalFunction("r2-sign-file-url", payload), error: null }
    : await invokeFunction("r2-sign-file-url", payload);

  if (error || !data?.fileUrl) {
    throw new Error(error?.message || "Không tạo được liên kết tải file.");
  }

  return data.fileUrl;
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

export async function deleteR2File(filePath) {
  const objectKey = getObjectKey(filePath);
  if (!objectKey) return;

  const payload = { objectKey };

  try {
    const { data, error } = import.meta.env.DEV
      ? { data: await invokeLocalFunction("r2-delete-file", payload), error: null }
      : await invokeFunction("r2-delete-file", payload);

    if (error) {
      console.error(`Lỗi xóa file ${objectKey} trên R2:`, error.message);
    } else {
      console.log(`Đã xóa file ${objectKey} thành công trên R2.`);
    }
  } catch (err) {
    console.error(`Lỗi hệ thống khi xóa file ${objectKey} trên R2:`, err.message);
  }
}
