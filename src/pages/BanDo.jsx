import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import VietnamEconomicMap from "../components/VietnamEconomicMap";
import { supabase } from "../lib/supabaseClient";
import {
  DEFAULT_ECONOMIC_REGIONS,
  VIETNAM_ADMINISTRATIVE_UNITS,
  getProvince34Name,
  getProvinceMetaByName,
  getRegionColor,
  normalizeVietnamName,
  parseProvinceList,
  slugifyVietnamName,
} from "../lib/vietnamMap";
import "./BanDo.css";

function formatStatValue(value, suffix = "") {
  if (value === null || value === undefined || value === "" || Number(value) === 0) {
    return "Chưa cập nhật";
  }

  return `${Number(value).toLocaleString("vi-VN")}${suffix}`;
}

function buildRegionFromSource(source, fallback, index) {
  const provinceNames = parseProvinceList(source?.danh_sach_tinh)
    .map(getProvince34Name)
    .filter(Boolean);

  return {
    color: source?.mau_hien_thi || fallback?.color || getRegionColor(index),
    dan_so: source?.dan_so ?? fallback?.dan_so ?? "",
    danhSachTinh: provinceNames.length > 0 ? provinceNames : fallback?.danhSachTinh || [],
    dien_tich_km2: source?.dien_tich_km2 ?? fallback?.dien_tich_km2 ?? "",
    duong_dan:
      source?.duong_dan ||
      fallback?.duong_dan ||
      slugifyVietnamName(source?.ten_vung || fallback?.ten_vung || `vung-${index + 1}`),
    id: String(source?.id ?? fallback?.id ?? `region-${index + 1}`),
    mat_do_dan_so: source?.mat_do_dan_so ?? fallback?.mat_do_dan_so ?? "",
    mo_ta: source?.mo_ta || fallback?.mo_ta || "",
    ten_vung: source?.ten_vung || fallback?.ten_vung || `Vùng ${index + 1}`,
    thanh_pho_tieu_bieu:
      source?.thanh_pho_tieu_bieu || fallback?.thanh_pho_tieu_bieu || "",
    the_manh_nhan_luc:
      source?.the_manh_nhan_luc || fallback?.the_manh_nhan_luc || "",
    the_manh_tu_nhien:
      source?.the_manh_tu_nhien || source?.the_manh || fallback?.the_manh_tu_nhien || "",
    thu_tu_hien_thi: source?.thu_tu_hien_thi ?? index + 1,
  };
}

function BanDo() {
  const [regions, setRegions] = useState(
    DEFAULT_ECONOMIC_REGIONS.map((region, index) => ({
      ...region,
      color: getRegionColor(index),
      id: region.id,
    })),
  );
  const [warning, setWarning] = useState("");
  const [query, setQuery] = useState("");
  const [selectedProvinceName, setSelectedProvinceName] = useState("");
  const [selectedRegionId, setSelectedRegionId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRegions() {
      setWarning("");

      const fallbackMap = new Map(
        DEFAULT_ECONOMIC_REGIONS.map((region, index) => [
          normalizeVietnamName(region.ten_vung),
          { ...region, color: getRegionColor(index) },
        ]),
      );

      const { data, error } = await supabase
        .from("vung_kinh_te")
        .select("*")
        .eq("da_xuat_ban", true)
        .order("thu_tu_hien_thi", { ascending: true });

      if (!isMounted) return;

      if (error) {
        setWarning("Không tải được dữ liệu vùng từ Supabase, đang dùng cấu hình mặc định.");
        return;
      }

      const publishedRows = (data || []).filter((row) => row.ten_vung);

      if (publishedRows.length === 0) {
        setWarning(
          "Bảng vùng kinh tế trên Supabase đang trống. Trang này đang dùng dữ liệu mặc định; vào Admin > Vùng kinh tế để đồng bộ 6 vùng mẫu.",
        );
        return;
      }

      const nextRegions = publishedRows.map((row, index) => {
        const fallback =
          fallbackMap.get(normalizeVietnamName(row.ten_vung)) ||
          DEFAULT_ECONOMIC_REGIONS[index] ||
          null;

        return buildRegionFromSource(row, fallback, index);
      });

      setRegions(nextRegions);
    }

    loadRegions();

    return () => {
      isMounted = false;
    };
  }, []);

  const provinceRegionLookup = useMemo(() => {
    const nextLookup = new Map();

    regions.forEach((region) => {
      region.danhSachTinh.forEach((provinceName) => {
        nextLookup.set(normalizeVietnamName(provinceName), region);
      });
    });

    return nextLookup;
  }, [regions]);

  const selectedProvinceMeta = useMemo(
    () => getProvinceMetaByName(selectedProvinceName),
    [selectedProvinceName],
  );

  const selectedRegion = useMemo(() => {
    if (selectedProvinceMeta?.type === "special-zone") {
      return null;
    }

    if (selectedProvinceName) {
      const regionFromProvince = provinceRegionLookup.get(normalizeVietnamName(selectedProvinceName));

      if (regionFromProvince) {
        return regionFromProvince;
      }
    }

    if (!selectedRegionId) {
      return null;
    }

    return regions.find((region) => String(region.id) === String(selectedRegionId)) || null;
  }, [provinceRegionLookup, regions, selectedProvinceMeta, selectedProvinceName, selectedRegionId]);

  const searchOptions = useMemo(() => {
    const provinceOptions = VIETNAM_ADMINISTRATIVE_UNITS.map((province) => ({
      label: province.name,
      type: "province",
      value: province.name,
    }));

    const regionOptions = regions.map((region) => ({
      label: region.ten_vung,
      type: "region",
      value: region.ten_vung,
    }));

    const seen = new Set();

    return [...regionOptions, ...provinceOptions].filter((option) => {
      const key = normalizeVietnamName(option.value);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [regions]);

  function handleProvinceClick(point) {
    const provinceName = getProvince34Name(point?.name) || point?.name || "";
    const provinceMeta = getProvinceMetaByName(provinceName);

    if (provinceMeta?.type === "special-zone") {
      setSelectedProvinceName(provinceName);
      setSelectedRegionId("");
      return;
    }

    const provinceRegion = provinceRegionLookup.get(normalizeVietnamName(provinceName));

    setSelectedProvinceName(provinceName);
    setSelectedRegionId(provinceRegion?.id || point?.regionId || "");
  }

  function handleSelectRegion(region) {
    setSelectedRegionId(region.id);
    setSelectedProvinceName(region.danhSachTinh[0] || "");
  }

  function handleCloseDetail() {
    setSelectedProvinceName("");
    setSelectedRegionId("");
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    const normalizedQuery = normalizeVietnamName(query);

    if (!normalizedQuery) {
      return;
    }

    const directProvince = getProvince34Name(query);

    if (directProvince) {
      handleProvinceClick({ name: directProvince });
      return;
    }

    const matchedProvince = VIETNAM_ADMINISTRATIVE_UNITS.find((province) =>
      normalizeVietnamName(province.name).includes(normalizedQuery),
    );

    if (matchedProvince) {
      handleProvinceClick({ name: matchedProvince.name });
      return;
    }

    const matchedRegion = regions.find((region) => {
      if (normalizeVietnamName(region.ten_vung).includes(normalizedQuery)) {
        return true;
      }

      return region.danhSachTinh.some((provinceName) =>
        normalizeVietnamName(provinceName).includes(normalizedQuery),
      );
    });

    if (matchedRegion) {
      handleSelectRegion(matchedRegion);
    }
  }

  return (
    <main className="map-page">
      <Header />

      <section className="map-hero">
        <p className="map-eyebrow">Bản đồ tương tác</p>
        <h1>Bản đồ Việt Nam 34 tỉnh, thành phố và 13 đặc khu</h1>
        <p>
          Click trực tiếp vào tỉnh/thành hoặc đặc khu để mở thông tin tương ứng,
          đồng thời đọc nhanh các thông tin vùng do admin quản lý. Đặc khu Hoàng Sa và Đặc khu
          Trường Sa được hiển thị theo dữ liệu đường bờ và rạn san hô thực tế.
        </p>
      </section>

      <section className="map-topbar">
        <div className="map-breadcrumbs">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <strong>Bản đồ vùng kinh tế</strong>
        </div>
        <Link className="map-topbar-action" to="/">
          Về trang chủ
        </Link>
      </section>

      {warning ? <div className="map-status map-status-warning">{warning}</div> : null}

      <section className={`map-layout ${selectedProvinceName ? "has-selection" : ""}`}>
        <div className="map-canvas-card">
          <div className="map-card-header">
            <div>
              <h2>Bản đồ hành chính 34 tỉnh/thành và 13 đặc khu</h2>
              <p>Chọn trực tiếp trên bản đồ hoặc tìm nhanh theo tên tỉnh/thành, đặc khu, tên vùng.</p>
            </div>

            <form className="map-search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                list="map-search-options"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ví dụ: Hà Nội, Đặc khu Hoàng Sa, Đồng bằng sông Hồng..."
              />
              <button type="submit">Tìm nhanh</button>
              <datalist id="map-search-options">
                {searchOptions.map((option) => (
                  <option key={`${option.type}-${option.value}`} value={option.value} />
                ))}
              </datalist>
            </form>
          </div>

          <VietnamEconomicMap
            onProvinceClick={handleProvinceClick}
            provinceRegionLookup={provinceRegionLookup}
            selectedProvinceName={selectedProvinceName}
            selectedRegion={selectedRegion}
          />
        </div>

        {selectedProvinceName ? (
          <aside className="map-detail-card">
            <div className="map-detail-topbar">
              <div className="map-detail-header">
                <p>Đơn vị hành chính đang chọn</p>
                <h2>{selectedProvinceName}</h2>
              </div>

              <button
                type="button"
                className="map-detail-close"
                onClick={handleCloseDetail}
              >
                Đóng
              </button>
            </div>

            {selectedRegion ? (
              <>
                <div
                  className="map-region-badge"
                  style={{
                    backgroundColor: `${selectedRegion.color}1F`,
                    color: selectedRegion.color,
                  }}
                >
                  {selectedRegion.ten_vung}
                </div>

                <p className="map-detail-description">
                  {selectedRegion.mo_ta || "Admin chưa cập nhật mô tả cho vùng kinh tế này."}
                </p>

                <div className="map-stat-grid">
                  <div>
                    <span>Diện tích</span>
                    <strong>{formatStatValue(selectedRegion.dien_tich_km2, " km²")}</strong>
                  </div>
                  <div>
                    <span>Dân số</span>
                    <strong>{formatStatValue(selectedRegion.dan_so, " người")}</strong>
                  </div>
                  <div>
                    <span>Mật độ dân số</span>
                    <strong>{formatStatValue(selectedRegion.mat_do_dan_so, " người/km²")}</strong>
                  </div>
                </div>

                <div className="map-detail-section">
                  <h3>Thế mạnh tự nhiên</h3>
                  <p>{selectedRegion.the_manh_tu_nhien || "Admin chưa cập nhật."}</p>
                </div>

                <div className="map-detail-section">
                  <h3>Thế mạnh nhân lực</h3>
                  <p>{selectedRegion.the_manh_nhan_luc || "Admin chưa cập nhật."}</p>
                </div>

                <div className="map-detail-section">
                  <h3>Đô thị / trung tâm hành chính lớn</h3>
                  <p>{selectedRegion.thanh_pho_tieu_bieu || "Admin chưa cập nhật."}</p>
                </div>

                <div className="map-detail-section">
                  <h3>Các tỉnh/thành trong vùng</h3>
                  <div className="map-chip-list">
                    {selectedRegion.danhSachTinh.map((provinceName) => (
                      <button
                        key={provinceName}
                        type="button"
                        className={`map-chip ${provinceName === selectedProvinceName ? "is-active" : ""}`}
                        onClick={() => handleProvinceClick({ name: provinceName, regionId: selectedRegion.id })}
                      >
                        {provinceName}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : selectedProvinceMeta?.type === "special-zone" ? (
              <>
                <div className="map-region-badge">Đặc khu</div>
                <p className="map-detail-description">
                  {selectedProvinceMeta.description}
                </p>
                <div className="map-detail-section">
                  <h3>Đơn vị trực thuộc</h3>
                  <p>{selectedProvinceMeta.administrativeParent}</p>
                </div>
              </>
            ) : (
              <div className="map-empty-panel">
                <p>Tỉnh/thành này chưa được gán vào vùng kinh tế trong admin.</p>
              </div>
            )}

            {selectedProvinceMeta?.mergedFrom?.length > 1 ? (
              <div className="map-detail-section">
                <h3>Tỉnh cũ được hợp nhất</h3>
                <p>{selectedProvinceMeta.mergedFrom.join(", ")}</p>
              </div>
            ) : null}
          </aside>
        ) : null}
      </section>
    </main>
  );
}

export default BanDo;
