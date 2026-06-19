import { getFileExtension, parseMediaList } from "./materialUtils";
import { buildR2FileUrl } from "./r2";

export function normalizeExternalUrl(url) {
  if (!url) return "";

  const trimmedUrl = String(url).trim();

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl.replace(/^\/+/, "")}`;
}

export function formatPublishDate(value) {
  if (!value) return "Chưa cập nhật ngày đăng";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật ngày đăng";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function getExamKindLabel(filePath) {
  const extension = getFileExtension(filePath);

  if (extension === "pdf") return "PDF";
  if (["doc", "docx"].includes(extension)) return "WORD";
  if (["jpg", "jpeg", "png", "webp"].includes(extension)) return "ẢNH";

  return "TỆP";
}

export function getExamThumbnailUrl(exam) {
  const previewImages = parseMediaList(exam.duong_dan_anh_dai_dien);

  if (previewImages[0]) {
    return buildR2FileUrl(previewImages[0]);
  }

  if (["jpg", "jpeg", "png", "webp"].includes(getFileExtension(exam.duong_dan_file))) {
    return buildR2FileUrl(exam.duong_dan_file);
  }

  return "";
}
