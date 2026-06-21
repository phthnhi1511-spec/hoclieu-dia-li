import { GetObjectCommand, S3Client } from "npm:@aws-sdk/client-s3@3.916.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.916.0";

const defaultAccountId = "04443c5d0ebe24eaa3c36a88b0f7dc6e";
const defaultBucketName = "hoc-lieu";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Expose-Headers": "Content-Length, Content-Type, ETag",
};

function buildErrorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
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

  if (request.method !== "GET") {
    return buildErrorResponse("Method not allowed.", 405);
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
    return buildErrorResponse("Missing R2 credentials in Edge Function secrets.");
  }

  const requestUrl = new URL(request.url);
  const objectKey = requestUrl.searchParams.get("objectKey")?.trim().replace(/^\/+/, "");

  if (!objectKey) {
    return buildErrorResponse("objectKey is required.", 400);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  try {
    const signedFileUrl = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
      { expiresIn: 60 },
    );
    const objectResponse = await fetch(signedFileUrl);

    if (!objectResponse.ok) {
      return buildErrorResponse("File not found.", objectResponse.status);
    }

    const headers = new Headers(corsHeaders);
    const contentType = objectResponse.headers.get("Content-Type");
    const contentLength = objectResponse.headers.get("Content-Length");
    const etag = objectResponse.headers.get("ETag");

    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    if (etag) {
      headers.set("ETag", etag);
    }

    const objectBytes = await objectResponse.arrayBuffer();

    return new Response(objectBytes, {
      status: 200,
      headers,
    });
  } catch (error) {
    return buildErrorResponse(
      error instanceof Error ? error.message : "Could not read file from R2.",
    );
  }
});
