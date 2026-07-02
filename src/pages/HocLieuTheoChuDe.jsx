import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import { buildR2ProxyFileUrl } from "../lib/r2";
import { getMaterialKind, getTypeName, parseMediaList } from "../lib/materialUtils";
import { supabase } from "../lib/supabaseClient";
import "./HocLieuTheoChuDe.css";

const ITEMS_PER_PAGE = 6;
const SKELETON_CARD_COUNT = 6;

function MaterialListCard({ activityById, duongDan, material, types, sourceById }) {
  const typeName = getTypeName(material, types);
  const detailPath = `/hoc-lieu/${duongDan}/${material.id}`;
  const imageList = parseMediaList(material.duong_dan_anh_dai_dien);
  const thumbnailUrl = imageList[0] ? buildR2ProxyFileUrl(imageList[0]) : "";
  const materialKind = getMaterialKind(material, types);
  const teachingActivity = activityById.get(material.hoat_dong_day_hoc_id);
  const sourceClassification = sourceById?.get(material.nguon_hoc_lieu_id);
  const [hasImageError, setHasImageError] = useState(false);
  const shouldShowImage = Boolean(thumbnailUrl) && !hasImageError;

  return (
    <article className="material-list-card">
      {shouldShowImage ? (
        <img
          className="material-list-thumb"
          src={thumbnailUrl}
          alt={material.tieu_de}
          onError={() => setHasImageError(true)}
        />
      ) : (
        <div className={`material-list-thumb material-list-thumb-${materialKind}`}>
          <span>{typeName}</span>
        </div>
      )}

      <div className="material-list-body">
        <div className="material-meta">
          <span>{typeName}</span>
          {teachingActivity?.ten_hoat_dong ? <span>{teachingActivity.ten_hoat_dong}</span> : null}
          {sourceClassification?.ten_nguon ? (
            <span className={sourceClassification.ten_nguon.toLowerCase().includes("tự thiết kế") ? "source-badge-self" : "source-badge-external"}>
              {sourceClassification.ten_nguon}
            </span>
          ) : null}
          {material.noi_bat ? <span>Nổi bật</span> : null}
          {material.ten_nguon ? <span>Nguồn: {material.ten_nguon}</span> : null}
        </div>

        <h2>{material.tieu_de}</h2>
        <p>{material.mo_ta || "Chưa có mô tả cho học liệu này."}</p>

        <div className="material-actions">
          <Link to={detailPath}>Xem chi tiết</Link>
        </div>
      </div>
    </article>
  );
}

function MaterialListCardSkeleton() {
  return (
    <article className="material-list-card material-list-card-skeleton" aria-hidden="true">
      <div className="material-list-thumb material-list-thumb-skeleton">
        <div className="material-skeleton material-skeleton-thumb" />
      </div>

      <div className="material-list-body">
        <div className="material-meta">
          <div className="material-skeleton material-skeleton-chip" />
          <div className="material-skeleton material-skeleton-chip" />
        </div>

        <div className="material-skeleton material-skeleton-title" />
        <div className="material-skeleton material-skeleton-text material-skeleton-text-wide" />
        <div className="material-skeleton material-skeleton-text material-skeleton-text-medium" />

        <div className="material-actions">
          <div className="material-skeleton material-skeleton-button" />
        </div>
      </div>
    </article>
  );
}

function MaterialsControlsSkeleton() {
  return (
    <section className="materials-controls materials-controls-skeleton" aria-hidden="true">
      <div>
        <div className="material-skeleton material-skeleton-label" />
        <div className="material-skeleton material-skeleton-input" />
      </div>
      <div>
        <div className="material-skeleton material-skeleton-label" />
        <div className="material-skeleton material-skeleton-input" />
      </div>
      <div>
        <div className="material-skeleton material-skeleton-label" />
        <div className="material-skeleton material-skeleton-input" />
      </div>
    </section>
  );
}

function MaterialsPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="materials-pagination" aria-label="Phân trang học liệu">
      <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Trang trước
      </button>

      <div className="materials-pagination-pages">
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={page === currentPage ? "is-active" : ""}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Trang sau
      </button>
    </nav>
  );
}

function HocLieuTheoChuDe() {
  const { duongDan } = useParams();
  const [topic, setTopic] = useState(null);
  const [types, setTypes] = useState([]);
  const [teachingActivities, setTeachingActivities] = useState([]);
  const [sources, setSources] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("tat-ca");
  const [selectedTeachingActivity, setSelectedTeachingActivity] = useState("tat-ca");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const deferredSearchText = useDeferredValue(searchText);

  useEffect(() => {
    let isMounted = true;

    async function loadPageData() {
      setLoading(true);
      setError("");
      setTopic(null);
      setMaterials([]);
      setTeachingActivities([]);
      setSelectedTypeId("tat-ca");
      setSelectedTeachingActivity("tat-ca");
      setCurrentPage(1);

      const { data: topicData, error: topicError } = await supabase
        .from("chu_de")
        .select("id, ten_chu_de, duong_dan, mo_ta")
        .eq("duong_dan", duongDan)
        .maybeSingle();

      if (!isMounted) return;

      if (topicError) {
        setError(`Lỗi tải chủ đề: ${topicError.message}`);
        setLoading(false);
        return;
      }

      if (!topicData) {
        setError("Không tìm thấy chủ đề học liệu.");
        setLoading(false);
        return;
      }

      const [
        { data: typeData, error: typeError },
        { data: teachingActivityData },
        sourcesData,
        { data: materialData, error: materialError },
      ] =
        await Promise.all([
          supabase
            .from("loai_hoc_lieu")
            .select("id, ten_loai, duong_dan")
            .eq("dang_hien_thi", true)
            .order("thu_tu_hien_thi", { ascending: true }),
          supabase
            .from("hoat_dong_day_hoc")
            .select("id, ten_hoat_dong, duong_dan")
            .eq("dang_hien_thi", true)
            .order("thu_tu_hien_thi", { ascending: true }),
          supabase
            .from("nguon_hoc_lieu")
            .select("id, ten_nguon")
            .order("thu_tu_hien_thi", { ascending: true })
            .then(({ data, error }) => {
              if (error) return [];
              return data || [];
            })
            .catch(() => []),
          supabase
            .from("hoc_lieu")
            .select("*")
            .eq("chu_de_id", topicData.id)
            .eq("da_xuat_ban", true)
            .order("ngay_tao", { ascending: false }),
        ]);

      if (!isMounted) return;

      if (typeError) {
        setError(`Lỗi tải loại học liệu: ${typeError.message}`);
      } else if (materialError) {
        setError(`Lỗi tải học liệu: ${materialError.message}`);
      } else {
        setTopic(topicData);
        setTypes(typeData || []);
        setTeachingActivities(teachingActivityData || []);
        setSources(sourcesData || []);
        setMaterials(materialData || []);
      }

      setLoading(false);
    }

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, [duongDan]);

  const activityById = useMemo(
    () => new Map(teachingActivities.map((activity) => [activity.id, activity])),
    [teachingActivities],
  );
  const sourceById = useMemo(
    () => new Map(sources.map((src) => [src.id, src])),
    [sources],
  );

  const filteredMaterials = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesType =
        selectedTypeId === "tat-ca" || material.loai_hoc_lieu_id === Number(selectedTypeId);
      const matchesTeachingActivity =
        selectedTeachingActivity === "tat-ca" ||
        material.hoat_dong_day_hoc_id === Number(selectedTeachingActivity);
      const matchesSearch =
        keyword === "" ||
        material.tieu_de?.toLowerCase().includes(keyword) ||
        material.mo_ta?.toLowerCase().includes(keyword) ||
        getTypeName(material, types).toLowerCase().includes(keyword);

      return matchesType && matchesTeachingActivity && matchesSearch;
    });
  }, [materials, deferredSearchText, selectedTeachingActivity, selectedTypeId, types]);

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginatedMaterials = filteredMaterials.slice(
    (currentPageSafe - 1) * ITEMS_PER_PAGE,
    currentPageSafe * ITEMS_PER_PAGE,
  );

  return (
    <div>
      <Header />

      <main className="materials-page">
        <section className="materials-hero">
          <p className="materials-eyebrow">Học liệu số</p>
          <h1>{topic?.ten_chu_de || "Học liệu theo chủ đề"}</h1>
          <p>
            {topic?.mo_ta ||
              "Xem danh sách học liệu theo chủ đề, chọn đúng tài liệu rồi mở trang chi tiết để đọc, xem hoặc tải."}
          </p>
        </section>

        <section className="materials-topbar">
          <div className="materials-breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Học liệu</span>
            <span>/</span>
            <strong>{topic?.ten_chu_de || "Đang tải chủ đề"}</strong>
          </div>

          <Link to="/" className="materials-topbar-action">
            Về trang chủ
          </Link>
        </section>

        {loading ? (
          <>
            <MaterialsControlsSkeleton />

            <section className="materials-list materials-list-skeleton">
              {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
                <MaterialListCardSkeleton key={index} />
              ))}
            </section>

            <div className="materials-pagination materials-pagination-skeleton" aria-hidden="true">
              <div className="material-skeleton material-skeleton-button" />
              <div className="materials-pagination-pages">
                <div className="material-skeleton material-skeleton-pagination-dot" />
                <div className="material-skeleton material-skeleton-pagination-dot" />
                <div className="material-skeleton material-skeleton-pagination-dot" />
              </div>
              <div className="material-skeleton material-skeleton-button" />
            </div>
          </>
        ) : (
          <>
            <section className="materials-controls">
              <label>
                <span>Tìm kiếm học liệu</span>
                <input
                  type="search"
                  value={searchText}
                  onChange={(event) => {
                    setSearchText(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Nhập tên tài liệu, mô tả hoặc loại học liệu"
                />
              </label>

              <label>
                <span>Lọc theo loại học liệu</span>
                <select
                  value={selectedTypeId}
                  onChange={(event) => {
                    setSelectedTypeId(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="tat-ca">Tất cả loại học liệu</option>
                  {types.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.ten_loai}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Lọc theo hoạt động dạy học</span>
                <select
                  value={selectedTeachingActivity}
                  onChange={(event) => {
                    setSelectedTeachingActivity(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="tat-ca">Tất cả hoạt động</option>
                  {teachingActivities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.ten_hoat_dong}
                    </option>
                  ))}
                </select>
              </label>
            </section>

            {error ? (
              <section className="materials-status materials-error">{error}</section>
            ) : filteredMaterials.length === 0 ? (
              <section className="materials-status">
                Chưa có học liệu phù hợp. Bạn có thể thêm học liệu trong trang quản trị.
              </section>
            ) : (
              <>
                <section className="materials-list">
                  {paginatedMaterials.map((material) => (
                    <MaterialListCard
                      key={material.id}
                      activityById={activityById}
                      duongDan={duongDan}
                      material={material}
                      types={types}
                      sourceById={sourceById}
                    />
                  ))}
                </section>

                <MaterialsPagination
                  currentPage={currentPageSafe}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        )}

        <div className="materials-back">
          <Link to="/">Quay lại trang chủ</Link>
        </div>
      </main>
    </div>
  );
}

export default HocLieuTheoChuDe;
