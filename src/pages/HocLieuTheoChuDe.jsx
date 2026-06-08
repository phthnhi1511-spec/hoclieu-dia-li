import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header";
import { supabase } from "../lib/supabaseClient";
import "./HocLieuTheoChuDe.css";

function getTypeName(material, types) {
  const type = types.find((item) => item.id === material.loai_hoc_lieu_id);
  return type?.ten_loai || "Chưa phân loại";
}

function HocLieuTheoChuDe() {
  const { duongDan } = useParams();
  const [topic, setTopic] = useState(null);
  const [types, setTypes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedTypeId, setSelectedTypeId] = useState("tat-ca");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPageData() {
      setLoading(true);
      setError("");
      setTopic(null);
      setMaterials([]);
      setSelectedTypeId("tat-ca");

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

      const [{ data: typeData, error: typeError }, { data: materialData, error: materialError }] =
        await Promise.all([
          supabase
            .from("loai_hoc_lieu")
            .select("id, ten_loai, duong_dan")
            .eq("dang_hien_thi", true)
            .order("thu_tu_hien_thi", { ascending: true }),
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
        setMaterials(materialData || []);
      }

      setLoading(false);
    }

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, [duongDan]);

  const filteredMaterials = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return materials.filter((material) => {
      const matchesType =
        selectedTypeId === "tat-ca" || material.loai_hoc_lieu_id === Number(selectedTypeId);
      const matchesSearch =
        keyword === "" ||
        material.tieu_de?.toLowerCase().includes(keyword) ||
        material.mo_ta?.toLowerCase().includes(keyword) ||
        getTypeName(material, types).toLowerCase().includes(keyword);

      return matchesType && matchesSearch;
    });
  }, [materials, searchText, selectedTypeId, types]);

  return (
    <div>
      <Header />

      <main className="materials-page">
        <section className="materials-hero">
          <p className="materials-eyebrow">Học liệu số</p>
          <h1>{topic?.ten_chu_de || "Học liệu theo chủ đề"}</h1>
          <p>
            Xem, tìm kiếm và tải học liệu theo chủ đề Địa lí kinh tế Việt Nam lớp 9.
          </p>
        </section>

        <section className="materials-controls">
          <label>
            <span>Tìm kiếm học liệu</span>
            <input
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Nhập tên tài liệu, mô tả hoặc loại học liệu"
            />
          </label>

          <label>
            <span>Lọc theo loại học liệu</span>
            <select
              value={selectedTypeId}
              onChange={(event) => setSelectedTypeId(event.target.value)}
            >
              <option value="tat-ca">Tất cả loại học liệu</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.ten_loai}
                </option>
              ))}
            </select>
          </label>
        </section>

        {loading ? (
          <section className="materials-status">Đang tải học liệu...</section>
        ) : error ? (
          <section className="materials-status materials-error">{error}</section>
        ) : filteredMaterials.length === 0 ? (
          <section className="materials-status">
            Chưa có học liệu phù hợp. Bạn có thể thêm học liệu trong trang quản trị.
          </section>
        ) : (
          <section className="materials-grid">
            {filteredMaterials.map((material) => (
              <article className="material-card" key={material.id}>
                {material.duong_dan_anh_dai_dien ? (
                  <img src={material.duong_dan_anh_dai_dien} alt={material.tieu_de} />
                ) : (
                  <div className="material-placeholder">{getTypeName(material, types)}</div>
                )}

                <div className="material-card-body">
                  <div className="material-meta">
                    <span>{getTypeName(material, types)}</span>
                    {material.noi_bat && <span>Nổi bật</span>}
                  </div>

                  <h2>{material.tieu_de}</h2>
                  <p>{material.mo_ta || "Chưa có mô tả cho học liệu này."}</p>

                  <div className="material-actions">
                    <a href={material.duong_dan_file} target="_blank" rel="noreferrer">
                      Xem trực tiếp
                    </a>
                    <a href={material.duong_dan_file} download>
                      Tải về
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        <div className="materials-back">
          <Link to="/">Quay lại trang chủ</Link>
        </div>
      </main>
    </div>
  );
}

export default HocLieuTheoChuDe;
