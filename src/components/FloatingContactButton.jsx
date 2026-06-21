import { useEffect, useState } from "react";
import { buildR2FileUrl } from "../lib/r2";
import { supabase } from "../lib/supabaseClient";
import "./FloatingContactButton.css";

const contactConfigKeys = ["floating_contact_avatar", "floating_contact_facebook_url"];

function normalizeFacebookUrl(value) {
  const url = String(value || "").trim();

  if (!url) return "";

  try {
    const parsedUrl = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`);

    if (!/(^|\.)facebook\.com$/i.test(parsedUrl.hostname)) return "";

    return parsedUrl.toString();
  } catch {
    return "";
  }
}

function FloatingContactButton() {
  const [avatarPath, setAvatarPath] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [hasImageError, setHasImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadContactConfig() {
      const { data, error } = await supabase
        .from("cau_hinh_website")
        .select("khoa_cau_hinh, gia_tri_cau_hinh")
        .in("khoa_cau_hinh", contactConfigKeys);

      if (!isMounted) return;

      if (error) {
        console.error("Lỗi tải cấu hình liên hệ nổi:", error.message);
        return;
      }

      const config = Object.fromEntries(
        (data || []).map((item) => [item.khoa_cau_hinh, item.gia_tri_cau_hinh || ""]),
      );

      setAvatarPath(config.floating_contact_avatar || "");
      setFacebookUrl(normalizeFacebookUrl(config.floating_contact_facebook_url));
    }

    loadContactConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!facebookUrl) return null;

  const avatarUrl = avatarPath && !hasImageError ? buildR2FileUrl(avatarPath) : "";

  return (
    <a
      className="floating-contact-button"
      href={facebookUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Liên hệ qua Facebook"
      title="Liên hệ qua Facebook"
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" onError={() => setHasImageError(true)} />
      ) : (
        <span aria-hidden="true">f</span>
      )}
    </a>
  );
}

export default FloatingContactButton;
