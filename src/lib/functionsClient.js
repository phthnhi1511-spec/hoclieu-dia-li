import { supabase } from "./supabaseClient";

const configuredFunctionsBaseUrl =
  import.meta.env.VITE_SUPABASE_FUNCTIONS_URL?.replace(/\/+$/, "") || "";

export const functionsBaseUrl =
  import.meta.env.DEV || /^https?:\/\//i.test(configuredFunctionsBaseUrl)
    ? configuredFunctionsBaseUrl
    : "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function invokeFunction(functionName, body) {
  if (!functionsBaseUrl) {
    return supabase.functions.invoke(functionName, { body });
  }

  const response = await fetch(`${functionsBaseUrl}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: supabaseAnonKey,
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
    return {
      data,
      error: {
        message: data?.error || data?.message || `Function error (${response.status})`,
      },
    };
  }

  return {
    data,
    error: null,
  };
}
