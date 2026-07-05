export function getMaterialType(material, types) {
  return types.find((item) => item.id === material.loai_hoc_lieu_id) || null;
}

export function getTypeName(material, types) {
  return getMaterialType(material, types)?.ten_loai || "Chưa phân loại";
}

export function getTypeSlug(material, types) {
  return getMaterialType(material, types)?.duong_dan || "";
}

export function getFileExtension(filePath) {
  const cleanValue = (filePath || "").split("?")[0].toLowerCase();
  const segments = cleanValue.split(".");
  return segments.length > 1 ? segments.at(-1) : "";
}

export function parseMediaList(value) {
  if (!value) return [];

  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getMaterialKind(material, types) {
  const typeSlug = getTypeSlug(material, types);
  const fileExtension = getFileExtension(material.duong_dan_file);

  if (typeSlug === "pdf") return "pdf";
  if (typeSlug === "powerpoint") return "powerpoint";
  if (typeSlug === "video") return "video";
  if (typeSlug === "ke-hoach-bai-day") return "lesson-plan";
  if (typeSlug === "phieu-hoc-tap") return "worksheet";
  if (typeSlug === "so-do-tu-duy") return "mindmap";
  if (typeSlug === "infographic") return "infographic";

  if (typeSlug === "atlat") {
    if (fileExtension === "pdf") return "atlat";
    return "atlat-image";
  }

  if (typeSlug === "bang-so-lieu" || typeSlug === "bieu-do") {
    if (["xls", "xlsx"].includes(fileExtension)) return "excel";
    if (fileExtension === "pdf") return "pdf";
    return "image-gallery";
  }

  if (fileExtension === "pdf") return "pdf";
  if (["ppt", "pptx"].includes(fileExtension)) return "powerpoint";
  if (["doc", "docx"].includes(fileExtension)) return "lesson-plan";
  if (["xls", "xlsx"].includes(fileExtension)) return "excel";
  if (["mp4", "webm", "ogg"].includes(fileExtension)) return "video";
  if (["jpg", "jpeg", "png", "webp"].includes(fileExtension)) return "infographic";

  return "generic";
}
