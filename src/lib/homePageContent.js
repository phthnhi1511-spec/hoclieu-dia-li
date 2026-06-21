import { buildR2FileUrl } from "./r2";

export const HOME_SECTION_OPTIONS = [
  { label: "Điểm nổi bật website", value: "diem_noi_bat" },
  { label: "Phát triển năng lực địa lí", value: "nang_luc_dia_li" },
  { label: "Học liệu nổi bật", value: "hoc_lieu_noi_bat" },
  { label: "Hướng dẫn sử dụng", value: "huong_dan_su_dung" },
  { label: "Footer - Liên kết nhanh", value: "footer_lien_ket_nhanh" },
  { label: "Footer - Hỗ trợ", value: "footer_ho_tro" },
];

export const HOME_CONFIG_KEY_OPTIONS = [
  { label: "Hero - Nhãn nhỏ", value: "hero_eyebrow" },
  { label: "Hero - Tiêu đề", value: "hero_title" },
  { label: "Hero - Mô tả", value: "hero_description" },
  { label: "Hero - Ảnh nền", value: "hero_image" },
  { label: "Hero - Nút chính", value: "hero_primary_label" },
  { label: "Hero - Link nút chính", value: "hero_primary_link" },
  { label: "Hero - Nút phụ", value: "hero_secondary_label" },
  { label: "Hero - Link nút phụ", value: "hero_secondary_link" },
  { label: "Điểm nổi bật - Nhãn nhỏ", value: "features_kicker" },
  { label: "Điểm nổi bật - Tiêu đề", value: "features_title" },
  { label: "Điểm nổi bật - Mô tả", value: "features_description" },
  { label: "Năng lực - Nhãn nhỏ", value: "capabilities_kicker" },
  { label: "Năng lực - Tiêu đề", value: "capabilities_title" },
  { label: "Năng lực - Mô tả", value: "capabilities_description" },
  { label: "Học liệu nổi bật - Nhãn nhỏ", value: "featured_kicker" },
  { label: "Học liệu nổi bật - Tiêu đề", value: "featured_title" },
  { label: "Học liệu nổi bật - Mô tả", value: "featured_description" },
  { label: "Học liệu nổi bật - Nút cuối khối", value: "featured_cta_label" },
  { label: "Học liệu nổi bật - Link nút cuối khối", value: "featured_cta_link" },
  { label: "Hướng dẫn - Nhãn nhỏ", value: "guide_kicker" },
  { label: "Hướng dẫn - Tiêu đề", value: "guide_title" },
  { label: "Hướng dẫn - Mô tả", value: "guide_description" },
  { label: "Footer - Tiêu đề giới thiệu", value: "footer_brand_title" },
  { label: "Footer - Mô tả giới thiệu", value: "footer_brand_description" },
  { label: "Footer - Tiêu đề liên kết nhanh", value: "footer_links_title" },
  { label: "Footer - Tiêu đề hỗ trợ", value: "footer_support_title" },
  { label: "Footer - Tiêu đề liên hệ", value: "footer_contact_title" },
  { label: "Footer - Tên liên hệ", value: "footer_contact_name" },
  { label: "Footer - Email liên hệ", value: "footer_contact_email" },
  { label: "Footer - Đơn vị", value: "footer_contact_school" },
  { label: "Liên hệ nổi - Ảnh đại diện", value: "floating_contact_avatar" },
  { label: "Liên hệ nổi - Link Facebook", value: "floating_contact_facebook_url" },
];

export const HOME_SECTION_LIMITS = {
  diem_noi_bat: 4,
  footer_ho_tro: 6,
  footer_lien_ket_nhanh: 6,
  hoc_lieu_noi_bat: 6,
  huong_dan_su_dung: 3,
  nang_luc_dia_li: 3,
};

export const HOME_FALLBACK_CONFIG = {
  capabilities_description:
    "Các khối nội dung được tổ chức để hỗ trợ phát triển nhận thức, khai thác tư liệu và vận dụng kiến thức địa lí kinh tế Việt Nam.",
  capabilities_kicker: "Năng lực",
  capabilities_title: "Phát triển năng lực địa lí",
  featured_description:
    "Đi vào nhanh các khu vực nội dung chính để khám phá học liệu, bản đồ, biểu đồ và khu luyện tập theo định hướng của website.",
  featured_cta_label: "Xem tất cả học liệu",
  featured_cta_link: "/hoc-lieu",
  featured_kicker: "Nổi bật",
  featured_title: "Học liệu nổi bật",
  features_description:
    "Các điểm mạnh cốt lõi giúp website học liệu số dễ dùng, trực quan và phù hợp với quá trình tự học Địa lí 9.",
  features_kicker: "Điểm nổi bật",
  features_title: "Điểm nổi bật của website",
  footer_brand_description:
    "Website học liệu số hỗ trợ dạy và học Địa lí Kinh tế Việt Nam theo định hướng phát triển năng lực.",
  footer_brand_title: "Học liệu số Địa lí Kinh tế Việt Nam",
  footer_contact_email: "",
  footer_contact_name: "",
  footer_contact_school: "",
  footer_contact_title: "Liên hệ",
  footer_links_title: "Liên kết nhanh",
  footer_support_title: "Hỗ trợ",
  guide_description:
    "Luồng sử dụng được tổ chức ngắn gọn để học sinh và giáo viên nhanh chóng tìm nội dung phù hợp rồi chuyển sang luyện tập.",
  guide_kicker: "Hướng dẫn",
  guide_title: "Hướng dẫn sử dụng",
  hero_description: "Khám phá - Tìm hiểu - Vận dụng kiến thức địa lí",
  hero_eyebrow: "Học liệu số",
  hero_image:
    "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80",
  hero_primary_label: "Bắt đầu học tập",
  hero_primary_link: "/hoc-lieu",
  hero_secondary_label: "Khám phá học liệu",
  hero_secondary_link: "/hoc-lieu",
  hero_title: "Học liệu số\nĐịa lí Kinh tế Việt Nam",
};

function sortByDisplayOrder(leftItem, rightItem) {
  const leftOrder = Number(leftItem.thu_tu_hien_thi) || 0;
  const rightOrder = Number(rightItem.thu_tu_hien_thi) || 0;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return (leftItem.id || 0) - (rightItem.id || 0);
}

export function buildHomeConfigMap(rows) {
  return (rows || []).reduce((result, row) => {
    if (!row?.khoa_cau_hinh) return result;

    result[row.khoa_cau_hinh] = row.gia_tri_cau_hinh || "";
    return result;
  }, {});
}

export function getResolvedHomeConfig(configMap) {
  return {
    ...HOME_FALLBACK_CONFIG,
    ...(configMap || {}),
  };
}

export function groupHomeItems(rows) {
  return (rows || []).reduce((result, row) => {
    if (!row?.khu_vuc) return result;

    if (!result[row.khu_vuc]) {
      result[row.khu_vuc] = [];
    }

    result[row.khu_vuc].push(row);
    result[row.khu_vuc].sort(sortByDisplayOrder);
    return result;
  }, {});
}

export function getHomeSectionItems(groupedItems, sectionKey) {
  const items = groupedItems?.[sectionKey] || [];
  const limit = HOME_SECTION_LIMITS[sectionKey];

  return typeof limit === "number" ? items.slice(0, limit) : items;
}

export function getHomeImageUrl(imagePath) {
  if (!imagePath) return "";
  return buildR2FileUrl(imagePath);
}

export function getHomeTitleLines(title) {
  return String(title || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function isExternalLink(url) {
  return /^(https?:\/\/|mailto:|tel:)/i.test(String(url || ""));
}
