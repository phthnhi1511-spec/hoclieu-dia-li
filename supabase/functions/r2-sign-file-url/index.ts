import { GetObjectCommand, S3Client } from "npm:@aws-sdk/client-s3@3.916.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.916.0";

const defaultAccountId = "04443c5d0ebe24eaa3c36a88b0f7dc6e";
const defaultBucketName = "hoc-lieu";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed." }, 405);
  }

  const accountId =
    Deno.env.get("R2_ACCOUNT_ID") ||
    Deno.env.get("CLOUDFLARE_ACCOUNT_ID") ||
    defaultAccountId;
  const bucketName =
    Deno.env.get("R2_BUCKET_NAME") ||
    Deno.env.get("CLOUDFLARE_R2_BUCKET_NAME") ||
    defaultBucketName;
  const accessKeyId =
    Deno.env.get("R2_ACCESS_KEY_ID") || Deno.env.get("CLOUDFLARE_R2_ACCESS_KEY");
  const secretAccessKey =
    Deno.env.get("R2_SECRET_ACCESS_KEY") || Deno.env.get("CLOUDFLARE_R2_SECRET_KEY");

  if (!accessKeyId || !secretAccessKey) {
    return jsonResponse({ error: "Missing R2 credentials in Edge Function secrets." }, 500);
  }

  let payload: { objectKey?: string; expiresIn?: number; downloadFileName?: string };

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload." }, 400);
  }

  const objectKey = payload.objectKey?.trim().replace(/^\/+/, "");
  const expiresIn = Math.max(60, Math.min(Number(payload.expiresIn) || 3600, 86400));
  const requestedFileName = payload.downloadFileName?.trim();

  if (!objectKey) {
    return jsonResponse({ error: "objectKey is required." }, 400);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const fallbackFileName = objectKey.split("/").pop() || "hoc-lieu";
  const downloadFileName = (requestedFileName || fallbackFileName)
    .replace(/[\r\n"]/g, "")
    .trim();
  const asciiFileName = downloadFileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-");
  const contentDisposition = requestedFileName
    ? `attachment; filename="${asciiFileName || "hoc-lieu"}"; filename*=UTF-8''${encodeURIComponent(downloadFileName)}`
    : undefined;

  const fileUrl = await getSignedUrl(
    client,
    new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ResponseContentDisposition: contentDisposition,
    }),
    { expiresIn },
  );

  return jsonResponse({
    objectKey,
    fileUrl,
  });
});
