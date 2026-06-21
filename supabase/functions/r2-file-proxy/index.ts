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

  const publicBaseUrl = Deno.env.get("CLOUDFLARE_R2_PUBLIC_BASE_URL")?.replace(/\/+$/, "");

  if (!publicBaseUrl) {
    return buildErrorResponse("Missing CLOUDFLARE_R2_PUBLIC_BASE_URL in Edge Function secrets.");
  }

  const requestUrl = new URL(request.url);
  const objectKey = requestUrl.searchParams.get("objectKey")?.trim().replace(/^\/+/, "");

  if (!objectKey) {
    return buildErrorResponse("objectKey is required.", 400);
  }

  try {
    const normalizedObjectKey = objectKey
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const objectResponse = await fetch(`${publicBaseUrl}/${normalizedObjectKey}`);

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

    if (!objectResponse.body) {
      return buildErrorResponse("File body is empty.", 502);
    }

    return new Response(objectResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return buildErrorResponse(
      error instanceof Error ? error.message : "Could not read file from R2.",
    );
  }
});
