import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { getMaterialKind, getTypeName, parseMediaList } from "../lib/materialUtils";
import { buildR2ProxyFileUrl } from "../lib/r2";
import { supabase } from "../lib/supabaseClient";
import "./HocLieuTheoChuDe.css";

const ITEMS_PER_PAGE = 9;
const SKELETON_CARD_COUNT = 6;

function MaterialListCard({ activityById, material, topicById, types }) {
  const typeName = getTypeName(material, types);
  const topic = topicById.get(material.chu_de_id);
  const detailPath = topic?.duong_dan ? `/hoc-lieu/${topic.duong_dan}/${material.id}` : "/hoc-lieu";
  const imageList = parseMediaList(material.duong_dan_anh_dai_dien);
  const thumbnailUrl = imageList[0] ? buildR2ProxyFileUrl(imageList[0]) : "";
  const materialKind = getMaterialKind(material, types);
  const teachingActivity = activityById.get(material.hoat_dong_day_hoc_id);
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
          {topic?.ten_chu_de ? <span>{topic.ten_chu_de}</span> : null}
          {teachingActivity?.ten_hoat_dong ? <span>{teachingActivity.ten_hoat_dong}</span> : null}
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

function HocLieuTatCa() {
  const [topics, setTopics] = useState([]);
  const [types, setTypes] = useState([]);
  const [teachingActivities, setTeachingActivities] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("tat-ca");
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

      const [
        { data: topicsData, error: topicsError },
        { data: typesData, error: typesError },
        { data: teachingActivitiesData },
        { data: materialsData, error: materialsError },
      ] = await Promise.all([
        supabase
          .from("chu_de")
          .select("id, ten_chu_de, duong_dan")
          .eq("dang_hien_thi", true)
          .order("thu_tu_hien_thi", { ascending: true }),
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
          .from("hoc_lieu")
          .select("*")
          .eq("da_xuat_ban", true)
          .order("ngay_tao", { ascending: false }),
      ]);

      if (!isMounted) return;

      if (topicsError) {
        setError(`Lỗi tải chủ đề: ${topicsError.message}`);
      } else if (typesError) {
        setError(`Lỗi tải loại học liệu: ${typesError.message}`);
      } else if (materialsError) {
        setError(`Lỗi tải học liệu: ${materialsError.message}`);
      } else {
        setTopics(topicsData || []);
        setTypes(typesData || []);
        setTeachingActivities(teachingActivitiesData || []);
        setMaterials(materialsData || []);
      }

      setLoading(false);
    }

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, []);

  const topicById = useMemo(
    () => new Map(topics.map((topic) => [topic.id, topic])),
    [topics],
  );
  const activityById = useMemo(
    () => new Map(teachingActivities.map((activity) => [activity.id, activity])),
    [teachingActivities],
  );

  const filteredMaterials = useMemo(() => {
    const keyword = deferredSearchText.trim().toLowerCase();

    return materials.filter((material) => {
      const topicName = topicById.get(material.chu_de_id)?.ten_chu_de?.toLowerCase() || "";
      const matchesTopic =
        selectedTopicId === "tat-ca" || material.chu_de_id === Number(selectedTopicId);
      const matchesType =
        selectedTypeId === "tat-ca" || material.loai_hoc_lieu_id === Number(selectedTypeId);
      const matchesTeachingActivity =
        selectedTeachingActivity === "tat-ca" ||
        material.hoat_dong_day_hoc_id === Number(selectedTeachingActivity);
      const matchesSearch =
        keyword === "" ||
        material.tieu_de?.toLowerCase().includes(keyword) ||
        material.mo_ta?.toLowerCase().includes(keyword) ||
        topicName.includes(keyword) ||
        getTypeName(material, types).toLowerCase().includes(keyword);

      return matchesTopic && matchesType && matchesTeachingActivity && matchesSearch;
    });
  }, [
    materials,
    deferredSearchText,
    selectedTeachingActivity,
    selectedTopicId,
    selectedTypeId,
    topicById,
    types,
  ]);

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
          <h1>Toàn bộ học liệu</h1>
          <p>
            Xem tất cả học liệu đã xuất bản trên website, tìm nhanh theo chủ đề hoặc loại học liệu,
            rồi đi vào từng trang chi tiết để đọc, xem hoặc tải về.
          </p>
        </section>

        <section className="materials-topbar">
          <div className="materials-breadcrumbs">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Học liệu</span>
            <span>/</span>
            <strong>Toàn bộ học liệu</strong>
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
                  placeholder="Nhập tên học liệu, mô tả, chủ đề hoặc loại học liệu"
                />
              </label>

              <label>
                <span>Lọc theo chủ đề</span>
                <select
                  value={selectedTopicId}
                  onChange={(event) => {
                    setSelectedTopicId(event.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="tat-ca">Tất cả chủ đề</option>
                  {topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.ten_chu_de}
                    </option>
                  ))}
                </select>
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
                Chưa có học liệu phù hợp với bộ lọc hiện tại.
              </section>
            ) : (
              <>
                <section className="materials-list">
                  {paginatedMaterials.map((material) => (
                    <MaterialListCard
                      key={material.id}
                      activityById={activityById}
                      material={material}
                      topicById={topicById}
                      types={types}
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
      </main>
    </div>
  );
}

export default HocLieuTatCa;
