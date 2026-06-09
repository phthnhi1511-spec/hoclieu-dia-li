import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import react from "@vitejs/plugin-react";
import { Buffer } from "node:buffer";
import process from "node:process";
import { defineConfig, loadEnv } from "vite";

const defaultAccountId = "04443c5d0ebe24eaa3c36a88b0f7dc6e";
const defaultBucketName = "hoc-lieu";
const defaultPublicBaseUrl = `https://${defaultAccountId}.r2.cloudflarestorage.com/${defaultBucketName}`;

function sanitizeFileName(fileName) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createDevR2FunctionPlugin(env) {
  return {
    name: "dev-r2-function",
    configureServer(server) {
      const accessKeyId = env.CLOUDFLARE_R2_ACCESS_KEY || env.R2_ACCESS_KEY_ID;
      const secretAccessKey = env.CLOUDFLARE_R2_SECRET_KEY || env.R2_SECRET_ACCESS_KEY;
      const accountId = env.CLOUDFLARE_ACCOUNT_ID || env.R2_ACCOUNT_ID || defaultAccountId;
      const bucketName =
        env.CLOUDFLARE_R2_BUCKET_NAME || env.R2_BUCKET_NAME || defaultBucketName;
      const publicBaseUrl = (
        env.CLOUDFLARE_R2_PUBLIC_BASE_URL ||
        env.R2_PUBLIC_BASE_URL ||
        defaultPublicBaseUrl
      ).replace(/\/+$/, "");

      function createClient() {
        return new S3Client({
          region: "auto",
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        });
      }

      server.middlewares.use("/dev-r2-object", async (req, res, next) => {
        if (req.method !== "GET") {
          next();
          return;
        }

        if (!accessKeyId || !secretAccessKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Missing local R2 credentials in .env.local." }));
          return;
        }

        try {
          const objectKey = decodeURIComponent((req.url || "").replace(/^\/+/, ""));

          if (!objectKey) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "object key is required." }));
            return;
          }

          const client = createClient();
          const objectResponse = await client.send(
            new GetObjectCommand({
              Bucket: bucketName,
              Key: objectKey,
            }),
          );

          if (objectResponse.ContentType) {
            res.setHeader("Content-Type", objectResponse.ContentType);
          }

          if (objectResponse.ContentLength) {
            res.setHeader("Content-Length", String(objectResponse.ContentLength));
          }

          if (objectResponse.ETag) {
            res.setHeader("ETag", objectResponse.ETag);
          }

          if (!objectResponse.Body) {
            res.statusCode = 404;
            res.end();
            return;
          }

          const bytes = await objectResponse.Body.transformToByteArray();
          res.statusCode = 200;
          res.end(Buffer.from(bytes));
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Could not read file from R2.",
            }),
          );
        }
      });

      server.middlewares.use("/dev-functions/r2-presign-upload", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          next();
          return;
        }

        if (!accessKeyId || !secretAccessKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Missing local R2 credentials in .env.local." }));
          return;
        }

        try {
          const chunks = [];

          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }

          const bodyBuffer = Buffer.concat(chunks);
          const requestContentType = req.headers["content-type"] || "";

          let fileName = "";
          let contentType = "application/octet-stream";
          let uploadBody = bodyBuffer;

          if (requestContentType.includes("application/json")) {
            const rawBody = bodyBuffer.toString("utf8");
            const payload = rawBody ? JSON.parse(rawBody) : {};
            fileName = payload.fileName?.trim();
            contentType = payload.contentType?.trim() || "application/octet-stream";
            uploadBody = null;
          } else {
            const requestUrl = new URL(req.url || "", "http://localhost");
            fileName = requestUrl.searchParams.get("fileName")?.trim() || "";
            contentType =
              requestUrl.searchParams.get("contentType")?.trim() || "application/octet-stream";
          }

          if (!fileName) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "fileName is required." }));
            return;
          }

          const sanitizedFileName = sanitizeFileName(fileName);
          const dateSegment = new Date().toISOString().slice(0, 10);
          const objectKey = `${dateSegment}/${Date.now()}-${sanitizedFileName || "tai-lieu"}`;

          const client = createClient();

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");

          if (uploadBody) {
            await client.send(
              new PutObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
                Body: uploadBody,
                ContentType: contentType,
              }),
            );

            res.end(
              JSON.stringify({
                objectKey,
                fileUrl: `${publicBaseUrl}/${objectKey}`,
              }),
            );
            return;
          }

          const uploadUrl = await getSignedUrl(
            client,
            new PutObjectCommand({
              Bucket: bucketName,
              Key: objectKey,
              ContentType: contentType,
            }),
            { expiresIn: 600 },
          );

          res.end(
            JSON.stringify({
              uploadUrl,
              objectKey,
              fileUrl: `${publicBaseUrl}/${objectKey}`,
            }),
          );
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Could not create upload URL.",
            }),
          );
        }
      });

      server.middlewares.use("/dev-functions/r2-sign-file-url", async (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== "POST") {
          next();
          return;
        }

        if (!accessKeyId || !secretAccessKey) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Missing local R2 credentials in .env.local." }));
          return;
        }

        try {
          const chunks = [];

          for await (const chunk of req) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
          }

          const rawBody = Buffer.concat(chunks).toString("utf8");
          const payload = rawBody ? JSON.parse(rawBody) : {};
          const objectKey = payload.objectKey?.trim().replace(/^\/+/, "");
          const expiresIn = Math.max(60, Math.min(Number(payload.expiresIn) || 3600, 86400));

          if (!objectKey) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "objectKey is required." }));
            return;
          }

          const client = createClient();
          const fileUrl = await getSignedUrl(
            client,
            new GetObjectCommand({
              Bucket: bucketName,
              Key: objectKey,
            }),
            { expiresIn },
          );

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              objectKey,
              fileUrl,
            }),
          );
        } catch (error) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : "Could not create file URL.",
            }),
          );
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), createDevR2FunctionPlugin(env)],
  };
});
