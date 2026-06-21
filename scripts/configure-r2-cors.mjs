const defaultAllowedOrigins = [
  "https://phthnhi1511-spec.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

function getAllowedOrigins() {
  const configuredOrigins = (process.env.R2_CORS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  return configuredOrigins.length > 0 ? configuredOrigins : defaultAllowedOrigins;
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME?.trim();
const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

if (!accountId || !bucketName || !apiToken) {
  throw new Error(
    "Missing CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_R2_BUCKET_NAME, or CLOUDFLARE_API_TOKEN.",
  );
}

const allowedOrigins = getAllowedOrigins();
const response = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/buckets/${bucketName}/cors`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rules: [
        {
          id: "hoc-lieu-browser-access",
          allowed: {
            origins: allowedOrigins,
            methods: ["GET", "HEAD", "PUT"],
            headers: ["*"],
          },
          exposeHeaders: ["ETag"],
          maxAgeSeconds: 3600,
        },
      ],
    }),
  },
);

const result = await response.json();

if (!response.ok || !result.success) {
  const message = result.errors?.map((error) => error.message).join("; ") || response.statusText;
  throw new Error(`Cloudflare rejected the R2 CORS policy: ${message}`);
}

console.log(`Configured R2 CORS for bucket "${bucketName}".`);
console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
