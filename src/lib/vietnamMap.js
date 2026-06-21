import rawVietnamGeoJson from "../data/vietnam-34-provinces.geo.json";

export const VIETNAM_34_PROVINCES = [
  { name: "Hà Nội", slug: "ha-noi", mergedFrom: ["Hà Nội", "Hà Tây"] },
  { name: "Bắc Ninh", slug: "bac-ninh", mergedFrom: ["Bắc Ninh", "Bắc Giang"] },
  { name: "Quảng Ninh", slug: "quang-ninh", mergedFrom: ["Quảng Ninh"] },
  { name: "Hải Phòng", slug: "hai-phong", mergedFrom: ["Hải Phòng", "Hải Dương"] },
  { name: "Hưng Yên", slug: "hung-yen", mergedFrom: ["Hưng Yên", "Thái Bình"] },
  { name: "Ninh Bình", slug: "ninh-binh", mergedFrom: ["Ninh Bình", "Nam Định", "Hà Nam"] },
  { name: "Cao Bằng", slug: "cao-bang", mergedFrom: ["Cao Bằng"] },
  { name: "Tuyên Quang", slug: "tuyen-quang", mergedFrom: ["Tuyên Quang", "Hà Giang"] },
  { name: "Lào Cai", slug: "lao-cai", mergedFrom: ["Lào Cai", "Yên Bái"] },
  { name: "Thái Nguyên", slug: "thai-nguyen", mergedFrom: ["Thái Nguyên", "Bắc Kạn"] },
  { name: "Lạng Sơn", slug: "lang-son", mergedFrom: ["Lạng Sơn"] },
  { name: "Phú Thọ", slug: "phu-tho", mergedFrom: ["Phú Thọ", "Vĩnh Phúc", "Hòa Bình"] },
  { name: "Điện Biên", slug: "dien-bien", mergedFrom: ["Điện Biên"] },
  { name: "Lai Châu", slug: "lai-chau", mergedFrom: ["Lai Châu"] },
  { name: "Sơn La", slug: "son-la", mergedFrom: ["Sơn La"] },
  { name: "Thanh Hóa", slug: "thanh-hoa", mergedFrom: ["Thanh Hóa"] },
  { name: "Nghệ An", slug: "nghe-an", mergedFrom: ["Nghệ An"] },
  { name: "Hà Tĩnh", slug: "ha-tinh", mergedFrom: ["Hà Tĩnh"] },
  { name: "Quảng Trị", slug: "quang-tri", mergedFrom: ["Quảng Trị", "Quảng Bình"] },
  { name: "Huế", slug: "hue", mergedFrom: ["Huế", "Thừa Thiên Huế"] },
  { name: "Đà Nẵng", slug: "da-nang", mergedFrom: ["Đà Nẵng", "Quảng Nam"] },
  { name: "Quảng Ngãi", slug: "quang-ngai", mergedFrom: ["Quảng Ngãi", "Kon Tum"] },
  { name: "Khánh Hòa", slug: "khanh-hoa", mergedFrom: ["Khánh Hòa", "Ninh Thuận"] },
  { name: "Gia Lai", slug: "gia-lai", mergedFrom: ["Gia Lai", "Bình Định"] },
  { name: "Đắk Lắk", slug: "dak-lak", mergedFrom: ["Đắk Lắk", "Phú Yên"] },
  { name: "Lâm Đồng", slug: "lam-dong", mergedFrom: ["Lâm Đồng", "Đắk Nông", "Bình Thuận"] },
  { name: "Tây Ninh", slug: "tay-ninh", mergedFrom: ["Tây Ninh", "Long An"] },
  { name: "Đồng Nai", slug: "dong-nai", mergedFrom: ["Đồng Nai", "Bình Phước"] },
  {
    name: "Hồ Chí Minh",
    slug: "ho-chi-minh",
    mergedFrom: ["Hồ Chí Minh", "Bình Dương", "Bà Rịa - Vũng Tàu"],
  },
  { name: "Vĩnh Long", slug: "vinh-long", mergedFrom: ["Vĩnh Long", "Bến Tre", "Trà Vinh"] },
  { name: "Đồng Tháp", slug: "dong-thap", mergedFrom: ["Đồng Tháp", "Tiền Giang"] },
  { name: "An Giang", slug: "an-giang", mergedFrom: ["An Giang", "Kiên Giang"] },
  { name: "Cần Thơ", slug: "can-tho", mergedFrom: ["Cần Thơ", "Hậu Giang", "Sóc Trăng"] },
  { name: "Cà Mau", slug: "ca-mau", mergedFrom: ["Cà Mau", "Bạc Liêu"] },
];

export const VIETNAM_ARCHIPELAGOS = [
  { name: "Hoàng Sa", x: 4550, y: 5200 },
  { name: "Trường Sa", x: 4580, y: 1250 },
];

const EXTRA_PROVINCE_ALIASES = {
  "ba ria vung tau": "Hồ Chí Minh",
  "ba ria-vung tau": "Hồ Chí Minh",
  "ba ria vung tau province": "Hồ Chí Minh",
  "ba ria vung tau city": "Hồ Chí Minh",
  "ba ria vung tau tỉnh": "Hồ Chí Minh",
  "ba ria vung tau thanh pho": "Hồ Chí Minh",
  "ba ria-vung tau thanh pho": "Hồ Chí Minh",
  "ba ria-vung tau tinh": "Hồ Chí Minh",
  "ho chi minh city": "Hồ Chí Minh",
  "thanh pho ho chi minh": "Hồ Chí Minh",
  hanoi: "Hà Nội",
  haiphong: "Hải Phòng",
  cantho: "Cần Thơ",
  "quang nam": "Đà Nẵng",
  "quang nam province": "Đà Nẵng",
  "quang ngai province": "Quảng Ngãi",
  "dak lak": "Đắk Lắk",
  "daklak": "Đắk Lắk",
  "dak nong": "Lâm Đồng",
  "daknong": "Lâm Đồng",
  "binh dinh": "Gia Lai",
  "binh duong": "Hồ Chí Minh",
  "binh phuoc": "Đồng Nai",
  "binh thuan": "Lâm Đồng",
  "phu yen": "Đắk Lắk",
  "kien giang": "An Giang",
  "hau giang": "Cần Thơ",
  "soc trang": "Cần Thơ",
  "bac kan": "Thái Nguyên",
  "bac can": "Thái Nguyên",
  "thua thien hue": "Huế",
  "thua thien - hue": "Huế",
  hue: "Huế",
  southeast: "Đồng Nai",
  "south east": "Đồng Nai",
};

const REGION_COLORS = ["#0b8b4d", "#1572a1", "#d97706", "#8b5cf6", "#c2410c", "#0f766e"];

export const DEFAULT_ECONOMIC_REGIONS = [
  {
    id: "trung-du-mien-nui-phia-bac",
    ten_vung: "Trung du và miền núi phía Bắc",
    duong_dan: "trung-du-va-mien-nui-phia-bac",
    mo_ta: "Vùng có địa hình đồi núi, tài nguyên khoáng sản và thủy điện lớn, giữ vai trò quan trọng về sinh thái và quốc phòng.",
    danhSachTinh: [
      "Cao Bằng",
      "Tuyên Quang",
      "Lào Cai",
      "Thái Nguyên",
      "Lạng Sơn",
      "Phú Thọ",
      "Điện Biên",
      "Lai Châu",
      "Sơn La",
    ],
    dien_tich_km2: 0,
    dan_so: 0,
    mat_do_dan_so: 0,
    the_manh_tu_nhien: "Khoáng sản, rừng, thủy điện, đất feralit và cảnh quan du lịch sinh thái.",
    the_manh_nhan_luc: "Lực lượng lao động nông - lâm nghiệp dồi dào, kinh nghiệm sản xuất vùng cao.",
    thanh_pho_tieu_bieu: "Lào Cai, Thái Nguyên, Việt Trì, Sơn La",
  },
  {
    id: "dong-bang-song-hong",
    ten_vung: "Đồng bằng sông Hồng",
    duong_dan: "dong-bang-song-hong",
    mo_ta: "Vùng phát triển sớm, hạ tầng dày đặc, tập trung các trung tâm công nghiệp, dịch vụ, logistics và giáo dục lớn.",
    danhSachTinh: ["Hà Nội", "Bắc Ninh", "Quảng Ninh", "Hải Phòng", "Hưng Yên", "Ninh Bình"],
    dien_tich_km2: 0,
    dan_so: 0,
    mat_do_dan_so: 0,
    the_manh_tu_nhien: "Đồng bằng phù sa màu mỡ, hệ thống sông ngòi và cảng biển.",
    the_manh_nhan_luc: "Dân cư đông, tay nghề cao, thị trường lớn, cơ sở đào tạo tập trung.",
    thanh_pho_tieu_bieu: "Hà Nội, Hải Phòng, Hạ Long, Bắc Ninh",
  },
  {
    id: "bac-trung-bo",
    ten_vung: "Bắc Trung Bộ",
    duong_dan: "bac-trung-bo",
    mo_ta: "Vùng cầu nối Bắc - Nam, có kinh tế biển, công nghiệp năng lượng và nông nghiệp đa dạng theo dải lãnh thổ kéo dài.",
    danhSachTinh: ["Thanh Hóa", "Nghệ An", "Hà Tĩnh", "Quảng Trị", "Huế"],
    dien_tich_km2: 0,
    dan_so: 0,
    mat_do_dan_so: 0,
    the_manh_tu_nhien: "Biển, rừng, khoáng sản, bãi biển và đầm phá.",
    the_manh_nhan_luc: "Nguồn lao động dồi dào, truyền thống sản xuất và thương mại lâu đời.",
    thanh_pho_tieu_bieu: "Thanh Hóa, Vinh, Hà Tĩnh, Huế",
  },
  {
    id: "nam-trung-bo",
    ten_vung: "Nam Trung Bộ",
    duong_dan: "nam-trung-bo",
    mo_ta: "Nhóm tỉnh có thế mạnh kinh tế biển, du lịch, cảng nước sâu và các cực tăng trưởng ven biển - cao nguyên liên kết chặt chẽ.",
    danhSachTinh: ["Đà Nẵng", "Quảng Ngãi", "Khánh Hòa", "Gia Lai", "Đắk Lắk", "Lâm Đồng"],
    dien_tich_km2: 0,
    dan_so: 0,
    mat_do_dan_so: 0,
    the_manh_tu_nhien: "Biển, cảng, du lịch, cao nguyên bazan, thủy điện và nông nghiệp hàng hóa.",
    the_manh_nhan_luc: "Lao động dịch vụ - du lịch tăng nhanh, khả năng liên kết vùng tốt.",
    thanh_pho_tieu_bieu: "Đà Nẵng, Nha Trang, Quảng Ngãi, Pleiku, Buôn Ma Thuột, Đà Lạt",
  },
  {
    id: "dong-nam-bo",
    ten_vung: "Đông Nam Bộ",
    duong_dan: "dong-nam-bo",
    mo_ta: "Vùng động lực kinh tế lớn nhất cả nước, nổi bật về công nghiệp, dịch vụ, tài chính và logistics.",
    danhSachTinh: ["Tây Ninh", "Đồng Nai", "Hồ Chí Minh"],
    dien_tich_km2: 0,
    dan_so: 0,
    mat_do_dan_so: 0,
    the_manh_tu_nhien: "Vị trí giao thương quốc tế, cảng biển, đất bazan và hệ thống giao thông phát triển.",
    the_manh_nhan_luc: "Lao động kỹ thuật cao, thị trường tiêu thụ rộng, sức hút đầu tư mạnh.",
    thanh_pho_tieu_bieu: "Hồ Chí Minh, Biên Hòa, Thủ Dầu Một, Vũng Tàu, Tây Ninh",
  },
  {
    id: "dong-bang-song-cuu-long",
    ten_vung: "Đồng bằng sông Cửu Long",
    duong_dan: "dong-bang-song-cuu-long",
    mo_ta: "Vùng trọng điểm lúa gạo, thủy sản và cây ăn quả, có mạng lưới sông ngòi dày đặc và kinh tế nông nghiệp hàng hóa đặc trưng.",
    danhSachTinh: ["Vĩnh Long", "Đồng Tháp", "An Giang", "Cần Thơ", "Cà Mau"],
    dien_tich_km2: 0,
    dan_so: 0,
    mat_do_dan_so: 0,
    the_manh_tu_nhien: "Đất phù sa, sông ngòi chằng chịt, thủy sản nước ngọt và nước lợ.",
    the_manh_nhan_luc: "Kinh nghiệm sản xuất nông nghiệp - thủy sản, hệ thống chợ đầu mối và logistics nội vùng.",
    thanh_pho_tieu_bieu: "Cần Thơ, Long Xuyên, Cà Mau, Cao Lãnh, Vĩnh Long",
  },
];

const provinceMetaByName = new Map(
  VIETNAM_34_PROVINCES.map((province, index) => [province.name, { ...province, order: index }]),
);

const provinceAliasLookup = VIETNAM_34_PROVINCES.reduce((lookup, province) => {
  [province.name, ...(province.mergedFrom || [])].forEach((alias) => {
    lookup[normalizeVietnamName(alias)] = province.name;
  });

  return lookup;
}, { ...EXTRA_PROVINCE_ALIASES });

export function normalizeVietnamName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function slugifyVietnamName(value) {
  return normalizeVietnamName(value).replace(/\s+/g, "-");
}

export function parseProvinceList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(/\r?\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getProvince34Name(value) {
  const normalized = normalizeVietnamName(value);

  if (!normalized) return "";

  return (
    provinceAliasLookup[normalized] ||
    VIETNAM_34_PROVINCES.find((province) => normalizeVietnamName(province.name) === normalized)?.name ||
    ""
  );
}

export function getProvinceMetaByName(value) {
  const provinceName = getProvince34Name(value) || value;
  return provinceMetaByName.get(provinceName) || null;
}

export function getRegionColor(index) {
  return REGION_COLORS[index % REGION_COLORS.length];
}

export function buildMergedVietnamGeoJson(geoJson = rawVietnamGeoJson) {
  const grouped = new Map();

  for (const feature of geoJson.features || []) {
    const sourceName = feature?.properties?.name || "";
    const targetName = getProvince34Name(sourceName) || sourceName;
    const provinceMeta = getProvinceMetaByName(targetName);

    if (!provinceMeta) {
      continue;
    }

    if (!grouped.has(provinceMeta.name)) {
      grouped.set(provinceMeta.name, {
        meta: provinceMeta,
        features: [],
      });
    }

    grouped.get(provinceMeta.name).features.push(feature);
  }

  const mergedFeatures = [...grouped.values()]
    .sort((a, b) => a.meta.order - b.meta.order)
    .map(({ meta, features }) => {
      const mergedCoordinates = [];
      const mergedFrom = [];

      features.forEach((feature) => {
        const geometry = feature?.geometry;
        const originalName = feature?.properties?.name;

        if (originalName) {
          mergedFrom.push(originalName);
        }

        if (!geometry) {
          return;
        }

        if (geometry.type === "Polygon") {
          mergedCoordinates.push(geometry.coordinates);
        } else if (geometry.type === "MultiPolygon") {
          mergedCoordinates.push(...geometry.coordinates);
        }
      });

      return {
        type: "Feature",
        geometry: {
          type: "MultiPolygon",
          coordinates: mergedCoordinates,
        },
        properties: {
          "hc-key": `vn34-${meta.slug}`,
          id: meta.slug,
          mergedFrom,
          name: meta.name,
          slug: meta.slug,
        },
      };
    });

  return {
    type: "FeatureCollection",
    features: mergedFeatures,
  };
}

export const mergedVietnam34GeoJson = buildMergedVietnamGeoJson();

function extendBoundsFromCoordinates(bounds, coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return;
  }

  if (
    coordinates.length >= 2 &&
    typeof coordinates[0] === "number" &&
    typeof coordinates[1] === "number"
  ) {
    bounds.x1 = Math.min(bounds.x1, coordinates[0]);
    bounds.x2 = Math.max(bounds.x2, coordinates[0]);
    bounds.y1 = Math.min(bounds.y1, coordinates[1]);
    bounds.y2 = Math.max(bounds.y2, coordinates[1]);
    return;
  }

  coordinates.forEach((item) => extendBoundsFromCoordinates(bounds, item));
}

export function getBoundsForProvinceNames(provinceNames, geoJson = mergedVietnam34GeoJson) {
  const normalizedNames = new Set(
    parseProvinceList(provinceNames)
      .map(getProvince34Name)
      .filter(Boolean)
      .map(normalizeVietnamName),
  );

  if (normalizedNames.size === 0) {
    return null;
  }

  const bounds = {
    x1: Number.POSITIVE_INFINITY,
    x2: Number.NEGATIVE_INFINITY,
    y1: Number.POSITIVE_INFINITY,
    y2: Number.NEGATIVE_INFINITY,
  };

  (geoJson.features || []).forEach((feature) => {
    const provinceName = feature?.properties?.name || "";

    if (!normalizedNames.has(normalizeVietnamName(provinceName))) {
      return;
    }

    extendBoundsFromCoordinates(bounds, feature?.geometry?.coordinates);
  });

  if (![bounds.x1, bounds.x2, bounds.y1, bounds.y2].every(Number.isFinite)) {
    return null;
  }

  return bounds;
}

export function buildDefaultEconomicRegionRows() {
  return DEFAULT_ECONOMIC_REGIONS.map((region, index) => ({
    da_xuat_ban: true,
    dan_so: region.dan_so || 0,
    danh_sach_tinh: region.danhSachTinh.join("\n"),
    dien_tich_km2: region.dien_tich_km2 || 0,
    duong_dan: region.duong_dan,
    mat_do_dan_so: region.mat_do_dan_so || 0,
    mo_ta: region.mo_ta,
    ten_vung: region.ten_vung,
    thanh_pho_tieu_bieu: region.thanh_pho_tieu_bieu,
    the_manh_nhan_luc: region.the_manh_nhan_luc,
    the_manh_tu_nhien: region.the_manh_tu_nhien,
    thu_tu_hien_thi: index + 1,
  }));
}

export const VIETNAM_34_PROVINCE_OPTIONS = VIETNAM_34_PROVINCES.map((province) => ({
  label: province.name,
  value: province.name,
}));
