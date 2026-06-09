import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { renderAsync } from "docx-preview";
import { pdfjs } from "react-pdf";
import Header from "../components/Header";
import { buildR2ProxyFileUrl, resolveR2ObjectUrl } from "../lib/r2";
import {
  getFileExtension,
  getMaterialKind,
  getTypeName,
  parseMediaList,
} from "../lib/materialUtils";
import { supabase } from "../lib/supabaseClient";
import "./HocLieuChiTiet.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const officeViewerBaseUrl = "https://view.officeapps.live.com/op/embed.aspx?src=";

function getPrimaryActionConfig(materialKind, fileUrl) {
  if (!fileUrl) return null;

  if (materialKind === "worksheet") {
    return {
      href: fileUrl,
      label: "Mở worksheet",
      rel: "noreferrer",
      target: "_blank",
    };
  }

  return {
    download: true,
    href: fileUrl,
    label: "Tải về",
  };
}

function PdfPreview({ fileUrl, title }) {
  return (
    <div className="material-detail-frame">
      <iframe src={fileUrl} title={title} loading="lazy" />
    </div>
  );
}

function VideoPreview({ fileUrl }) {
  return (
    <div className="material-detail-video">
      <video controls preload="metadata">
        <source src={fileUrl} />
        Trình duyệt của bạn chưa hỗ trợ phát video này.
      </video>
    </div>
  );
}

function OfficePreview({ fileUrl, title, helperText }) {
  const canEmbed = /^https?:\/\//i.test(fileUrl) && !fileUrl.includes("localhost");

  if (!canEmbed) {
    return (
      <div className="material-detail-note">
        <strong>{helperText}</strong>
        <p>
          Tệp này chưa có URL đọc trực tiếp phù hợp để nhúng trình xem
          Word/PowerPoint. Bạn vẫn có thể tải file bên dưới.
        </p>
      </div>
    );
  }

  return (
    <div className="material-detail-frame material-detail-frame-tall">
      <iframe
        src={`${officeViewerBaseUrl}${encodeURIComponent(fileUrl)}`}
        title={title}
        loading="lazy"
      />
    </div>
  );
}

function LessonPlanDocxPreview({ fileUrl }) {
  const pagesContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function renderDocx() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`Không thể tải file kế hoạch bài dạy (${response.status}).`);
        }

        const arrayBuffer = await response.arrayBuffer();

        if (!pagesContainerRef.current) {
          throw new Error("Không thể khởi tạo vùng hiển thị kế hoạch bài dạy.");
        }

        pagesContainerRef.current.replaceChildren();

        await renderAsync(arrayBuffer, pagesContainerRef.current, undefined, {
          breakPages: true,
          ignoreLastRenderedPageBreak: false,
          inWrapper: true,
          useBase64URL: true,
        });

        if (!isMounted) return;

        setLoading(false);
      } catch (renderError) {
        if (!isMounted) return;
        setError(
          renderError?.message || "Không thể hiển thị nội dung kế hoạch bài dạy này.",
        );
        setLoading(false);
      }
    }

    renderDocx();

    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  if (error) {
    return (
      <div className="material-detail-note">
        <strong>Không mở được kế hoạch bài dạy.</strong>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="material-docx-viewer">
      <div className="material-docx-stage">
        <div ref={pagesContainerRef} className="material-docx-pages" />
        {loading ? (
          <div className="material-docx-skeleton-overlay" aria-hidden="true">
            <div className="material-docx-content material-docx-content-skeleton">
              <div className="material-skeleton material-skeleton-text material-skeleton-text-wide" />
              <div className="material-skeleton material-skeleton-text material-skeleton-text-medium" />
              <div className="material-skeleton material-skeleton-text material-skeleton-text-wide" />
              <div className="material-skeleton material-skeleton-block" />
              <div className="material-skeleton material-skeleton-text material-skeleton-text-medium" />
              <div className="material-skeleton material-skeleton-block material-skeleton-block-short" />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function WorksheetPreview({ linkUrl, imageUrls }) {
  return (
    <div className="material-detail-note">
      {imageUrls.length > 0 ? (
        <div className="material-detail-gallery material-detail-gallery-single">
          <img src={imageUrls[0]} alt="Xem trước phiếu học tập" />
        </div>
      ) : (
        <div className="material-detail-placeholder">Phiếu học tập trực tuyến</div>
      )}
      <p>
        Phiếu học tập được mở bằng liên kết ngoài. Bạn có thể xem ảnh preview
        trước rồi mở bài làm.
      </p>
      <a className="material-detail-inline-link" href={linkUrl} target="_blank" rel="noreferrer">
        Mở Life Worksheet
      </a>
    </div>
  );
}

function ImageGalleryPreview({ imageUrls, label }) {
  if (imageUrls.length === 0) {
    return (
      <div className="material-detail-note">
        <p>Chưa có ảnh minh họa cho {label.toLowerCase()} này.</p>
      </div>
    );
  }

  return (
    <div className="material-detail-gallery">
      {imageUrls.map((imageUrl, index) => (
        <img key={`${imageUrl}-${index}`} src={imageUrl} alt={`${label} ${index + 1}`} />
      ))}
    </div>
  );
}

function AtlatPageSkeleton() {
  return (
    <div className="material-atlat-page-skeleton" aria-hidden="true">
      <div className="material-atlat-page-skeleton-line material-atlat-page-skeleton-line-short" />
      <div className="material-atlat-page-skeleton-line" />
      <div className="material-atlat-page-skeleton-line material-atlat-page-skeleton-line-medium" />
      <div className="material-atlat-page-skeleton-line material-atlat-page-skeleton-line-tall" />
    </div>
  );
}

function AtlatCanvasPage({ pdfDocument, pageNumber, pageWidth, side }) {
  const canvasContainerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function renderPage() {
      if (!pdfDocument || !pageNumber || !canvasContainerRef.current) return;

      setIsRendering(true);
      setRenderError("");

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();

          try {
            await renderTaskRef.current.promise;
          } catch {
            // Ignore cancellation errors from previous render.
          }
        }

        const pdfPage = await pdfDocument.getPage(pageNumber);
        const baseViewport = pdfPage.getViewport({ scale: 1 });
        const scale = pageWidth / baseViewport.width;
        const viewport = pdfPage.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { alpha: false });

        if (!context) {
          throw new Error("Không khởi tạo được canvas hiển thị PDF.");
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.className = "material-atlat-canvas";

        canvasContainerRef.current.replaceChildren(canvas);

        renderTaskRef.current = pdfPage.render({
          canvasContext: context,
          viewport,
        });

        await renderTaskRef.current.promise;

        if (!isMounted) return;

        renderTaskRef.current = null;
        setIsRendering(false);
      } catch (error) {
        if (!isMounted || error?.name === "RenderingCancelledException") return;

        renderTaskRef.current = null;
        setRenderError(error?.message || "Không thể hiển thị trang PDF này.");
        setIsRendering(false);
      }
    }

    renderPage();

    return () => {
      isMounted = false;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pageNumber, pageWidth, pdfDocument]);

  if (!pageNumber) {
    return <div className="material-atlat-sheet material-atlat-sheet-empty" />;
  }

  return (
    <div
      className={`material-atlat-sheet ${
        side === "left" ? "material-atlat-sheet-left" : "material-atlat-sheet-right"
      }`}
    >
      <div className="material-atlat-sheet-inner">
        {renderError ? (
          <div className="material-atlat-page-error">{renderError}</div>
        ) : (
          <>
            <div
              ref={canvasContainerRef}
              className={`material-atlat-canvas-shell ${
                isRendering ? "material-atlat-canvas-hidden" : ""
              }`}
            />
            {isRendering ? <AtlatPageSkeleton /> : null}
          </>
        )}
      </div>
      {!isRendering && !renderError ? (
        <span className="material-atlat-page-number">{pageNumber}</span>
      ) : null}
    </div>
  );
}

function AtlatViewerSkeleton({ bookHeight, isCompactViewport }) {
  return (
    <div className="material-atlat-viewer">
      <div className="material-atlat-toolbar material-atlat-toolbar-skeleton">
        <div className="material-atlat-toolbar-info">
          <div className="material-skeleton material-skeleton-text material-atlat-toolbar-line" />
        </div>
        <div className="material-atlat-toolbar-actions">
          <div className="material-skeleton material-skeleton-button material-skeleton-button-pill" />
          <div className="material-skeleton material-skeleton-button material-skeleton-button-pill" />
        </div>
      </div>

      <div className="material-atlat-stage">
        <div
          className={`material-atlat-book ${
            isCompactViewport ? "material-atlat-book-single" : ""
          }`}
          style={{ minHeight: `${bookHeight}px` }}
        >
          <div className="material-atlat-sheet material-atlat-sheet-left">
            <div className="material-atlat-sheet-inner">
              <AtlatPageSkeleton />
            </div>
          </div>
          {!isCompactViewport ? (
            <div className="material-atlat-sheet material-atlat-sheet-right">
              <div className="material-atlat-sheet-inner">
                <AtlatPageSkeleton />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function AtlatPreview({ fileUrl, title }) {
  const [pageCount, setPageCount] = useState(0);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [spreadStart, setSpreadStart] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );
  const [loadError, setLoadError] = useState("");
  const [turnDirection, setTurnDirection] = useState("");
  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const turnTimeoutRef = useRef(null);
  const documentTaskRef = useRef(null);

  useEffect(() => {
    function handleResize() {
      setViewportWidth(window.innerWidth);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (turnTimeoutRef.current) {
        window.clearTimeout(turnTimeoutRef.current);
      }

      if (documentTaskRef.current) {
        documentTaskRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadPdfDocument() {
      setLoadError("");
      setPdfDocument(null);
      setPageCount(0);
      setSpreadStart(1);
      setIsDocumentLoading(true);

      try {
        if (documentTaskRef.current) {
          await documentTaskRef.current.destroy();
        }

        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`Không thể tải file PDF (${response.status}).`);
        }

        const pdfBytes = new Uint8Array(await response.arrayBuffer());
        const loadingTask = pdfjs.getDocument({ data: pdfBytes });

        documentTaskRef.current = loadingTask;

        const documentProxy = await loadingTask.promise;

        if (!isMounted) {
          await documentProxy.destroy();
          return;
        }

        setPdfDocument(documentProxy);
        setPageCount(documentProxy.numPages);
        setIsDocumentLoading(false);
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error?.message || "Không thể tải file PDF.");
        setIsDocumentLoading(false);
      }
    }

    loadPdfDocument();

    return () => {
      isMounted = false;
    };
  }, [fileUrl]);

  const isCompactViewport = viewportWidth < 960;
  const basePageWidth = isCompactViewport
    ? Math.max(280, Math.min(440, viewportWidth - 64))
    : Math.max(420, Math.min(560, Math.floor((viewportWidth - 140) / 2)));
  const pageWidth = Math.max(220, basePageWidth - 34);
  const bookHeight = Math.round(pageWidth * 1.42) + 72;
  const step = isCompactViewport ? 1 : 2;
  const displayStartPage = Math.min(spreadStart, Math.max(pageCount, 1));
  const displayEndPage = isCompactViewport
    ? displayStartPage
    : Math.min(displayStartPage + 1, Math.max(pageCount, 1));
  const leftPageNumber = displayStartPage;
  const rightPageNumber = isCompactViewport ? null : displayEndPage;
  const canGoPrev = displayStartPage > 1;
  const canGoNext = pageCount > 0 && displayEndPage < pageCount;

  function queueTurn(direction, nextStartPage) {
    if (turnTimeoutRef.current) {
      window.clearTimeout(turnTimeoutRef.current);
    }

    setTurnDirection(direction);
    turnTimeoutRef.current = window.setTimeout(() => {
      startTransition(() => {
        setSpreadStart(nextStartPage);
      });
      turnTimeoutRef.current = window.setTimeout(() => {
        setTurnDirection("");
      }, 340);
    }, 140);
  }

  const handlePrev = () => {
    if (!canGoPrev) return;
    queueTurn("prev", Math.max(1, spreadStart - step));
  };

  const handleNext = () => {
    if (!canGoNext) return;
    queueTurn("next", Math.min(pageCount, spreadStart + step));
  };

  if (loadError) {
    return (
      <div className="material-atlat-viewer">
        <div className="material-detail-note">
          <strong>Không mở được Atlat.</strong>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  if (isDocumentLoading || !pdfDocument || pageCount === 0) {
    return <AtlatViewerSkeleton bookHeight={bookHeight} isCompactViewport={isCompactViewport} />;
  }

  return (
    <div className="material-atlat-viewer">
      <div className="material-atlat-toolbar">
        <div className="material-atlat-toolbar-info">
          <span>
            Trang {displayStartPage}
            {displayEndPage > displayStartPage ? ` - ${displayEndPage}` : ""} / {pageCount}
          </span>
        </div>

        <div className="material-atlat-toolbar-actions">
          <button type="button" onClick={handlePrev} disabled={!canGoPrev}>
            Trang trước
          </button>
          <button type="button" onClick={handleNext} disabled={!canGoNext}>
            Trang sau
          </button>
        </div>
      </div>

      <div className="material-atlat-stage">
        <div
          key={`${title}-${displayStartPage}-${displayEndPage}`}
          className={`material-atlat-book ${
            turnDirection ? `material-atlat-book-${turnDirection}` : ""
          } ${isCompactViewport ? "material-atlat-book-single" : ""}`}
          style={{ minHeight: `${bookHeight}px` }}
        >
          <AtlatCanvasPage
            pdfDocument={pdfDocument}
            pageNumber={leftPageNumber}
            pageWidth={pageWidth}
            side="left"
          />
          {!isCompactViewport ? (
            <AtlatCanvasPage
              pdfDocument={pdfDocument}
              pageNumber={rightPageNumber}
              pageWidth={pageWidth}
              side="right"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MaterialDetailPreview({ material, types, fileUrl, imageUrls, officeFileUrl }) {
  const kind = getMaterialKind(material, types);
  const fileExtension = getFileExtension(material.duong_dan_file);

  if (kind === "pdf") {
    return <PdfPreview fileUrl={fileUrl} title={material.tieu_de} />;
  }

  if (kind === "video") {
    return <VideoPreview fileUrl={fileUrl} />;
  }

  if (kind === "powerpoint") {
    return (
      <OfficePreview
        fileUrl={officeFileUrl}
        title={material.tieu_de}
        helperText="PowerPoint được hiển thị qua trình xem tài liệu."
      />
    );
  }

  if (kind === "lesson-plan") {
    if (fileExtension === "docx") {
      return <LessonPlanDocxPreview fileUrl={fileUrl} />;
    }

    return (
      <OfficePreview
        fileUrl={officeFileUrl}
        title={material.tieu_de}
        helperText="Kế hoạch bài dạy được hiển thị như tài liệu lướt đọc."
      />
    );
  }

  if (kind === "atlat") {
    return <AtlatPreview fileUrl={fileUrl} title={material.tieu_de} />;
  }

  if (kind === "worksheet") {
    return <WorksheetPreview linkUrl={fileUrl} imageUrls={imageUrls} />;
  }

  if (kind === "mindmap") {
    return <ImageGalleryPreview imageUrls={imageUrls} label="Sơ đồ tư duy" />;
  }

  if (kind === "infographic") {
    return <ImageGalleryPreview imageUrls={imageUrls} label="Infographic" />;
  }

  if (imageUrls.length > 0) {
    return <ImageGalleryPreview imageUrls={imageUrls} label={getTypeName(material, types)} />;
  }

  return <div className="material-detail-placeholder">{getTypeName(material, types)}</div>;
}

function MaterialDetailSkeleton() {
  return (
    <>
      <section className="material-detail-hero material-detail-hero-skeleton">
        <div className="material-detail-breadcrumbs">
          <div className="material-skeleton material-skeleton-text material-skeleton-breadcrumb" />
          <div className="material-skeleton material-skeleton-text material-skeleton-breadcrumb" />
          <div className="material-skeleton material-skeleton-text material-skeleton-breadcrumb-wide" />
        </div>

        <div className="material-detail-meta">
          <div className="material-skeleton material-skeleton-chip" />
          <div className="material-skeleton material-skeleton-chip" />
        </div>

        <div className="material-skeleton material-skeleton-title" />
        <div className="material-skeleton material-skeleton-text material-skeleton-text-wide" />
        <div className="material-skeleton material-skeleton-text material-skeleton-text-medium" />

        <div className="material-detail-actions">
          <div className="material-skeleton material-skeleton-button" />
          <div className="material-skeleton material-skeleton-button" />
        </div>
      </section>

      <section className="material-detail-content material-detail-content-skeleton">
        <div className="material-detail-loading-frame">
          <div className="material-skeleton material-skeleton-page" />
        </div>
      </section>
    </>
  );
}

function HocLieuChiTiet() {
  const { duongDan, materialId } = useParams();
  const [topic, setTopic] = useState(null);
  const [types, setTypes] = useState([]);
  const [material, setMaterial] = useState(null);
  const [resolvedFileUrl, setResolvedFileUrl] = useState("");
  const [resolvedImageUrls, setResolvedImageUrls] = useState([]);
  const [officeFileUrl, setOfficeFileUrl] = useState("");
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadPageData() {
      setLoading(true);
      setError("");
      setTopic(null);
      setMaterial(null);

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
            .eq("id", Number(materialId))
            .eq("chu_de_id", topicData.id)
            .eq("da_xuat_ban", true)
            .maybeSingle(),
        ]);

      if (!isMounted) return;

      if (typeError) {
        setError(`Lỗi tải loại học liệu: ${typeError.message}`);
      } else if (materialError) {
        setError(`Lỗi tải học liệu: ${materialError.message}`);
      } else if (!materialData) {
        setError("Không tìm thấy học liệu hoặc học liệu chưa xuất bản.");
      } else {
        setTopic(topicData);
        setTypes(typeData || []);
        setMaterial(materialData);
      }

      setLoading(false);
    }

    loadPageData();

    return () => {
      isMounted = false;
    };
  }, [duongDan, materialId]);

  useEffect(() => {
    let isMounted = true;

    async function loadAssetUrls() {
      if (!material) {
        setResolvedFileUrl("");
        setResolvedImageUrls([]);
        setOfficeFileUrl("");
        setAssetLoading(false);
        setAssetError("");
        return;
      }

      const nextFileUrl = buildR2ProxyFileUrl(material.duong_dan_file);
      const nextImageUrls = parseMediaList(material.duong_dan_anh_dai_dien).map((imagePath) =>
        buildR2ProxyFileUrl(imagePath),
      );
      const materialKind = getMaterialKind(material, types);
      const fileExtension = getFileExtension(material.duong_dan_file);
      const needsOfficeViewerUrl =
        materialKind === "powerpoint" ||
        (materialKind === "lesson-plan" && fileExtension !== "docx");

      setAssetError("");
      setResolvedFileUrl(nextFileUrl);
      setResolvedImageUrls(nextImageUrls);
      setOfficeFileUrl("");

      if (!needsOfficeViewerUrl) {
        setAssetLoading(false);
        return;
      }

      setAssetLoading(true);

      try {
        const nextOfficeFileUrl = await resolveR2ObjectUrl(material.duong_dan_file, {
          expiresIn: 3600,
        });

        if (!isMounted) return;

        setOfficeFileUrl(nextOfficeFileUrl);
      } catch (assetLoadError) {
        if (!isMounted) return;
        setAssetError(assetLoadError?.message || "Không thể chuẩn bị file học liệu này.");
      } finally {
        if (isMounted) {
          setAssetLoading(false);
        }
      }
    }

    loadAssetUrls();

    return () => {
      isMounted = false;
    };
  }, [material, types]);

  const fileUrl = useMemo(() => resolvedFileUrl, [resolvedFileUrl]);
  const materialKind = useMemo(
    () => (material ? getMaterialKind(material, types) : ""),
    [material, types],
  );
  const primaryAction = useMemo(
    () => getPrimaryActionConfig(materialKind, fileUrl),
    [fileUrl, materialKind],
  );

  return (
    <div>
      <Header />

      <main className="material-detail-page">
        {loading ? (
          <MaterialDetailSkeleton />
        ) : error ? (
          <section className="material-detail-status material-detail-error">{error}</section>
        ) : (
          <>
            <section className="material-detail-hero">
              <div className="material-detail-breadcrumbs">
                <Link to="/">Trang chủ</Link>
                <span>/</span>
                <Link to={`/hoc-lieu/${duongDan}`}>{topic?.ten_chu_de}</Link>
                <span>/</span>
                <strong>{material?.tieu_de}</strong>
              </div>

              <div className="material-detail-meta">
                <span>{getTypeName(material, types)}</span>
                {material?.ten_nguon ? <span>Nguồn: {material.ten_nguon}</span> : null}
                {material?.noi_bat ? <span>Nổi bật</span> : null}
              </div>

              <h1>{material?.tieu_de}</h1>
              <p>{material?.mo_ta || "Chưa có mô tả cho học liệu này."}</p>

              <div className="material-detail-actions">
                {primaryAction ? (
                  <a
                    href={primaryAction.href}
                    download={primaryAction.download}
                    rel={primaryAction.rel}
                    target={primaryAction.target}
                  >
                    {primaryAction.label}
                  </a>
                ) : null}
                <Link to={`/hoc-lieu/${duongDan}`}>Quay lại danh sách</Link>
              </div>
            </section>

            <section
              className={`material-detail-content ${
                materialKind === "atlat" ? "material-detail-content-book" : ""
              }`}
            >
              {assetLoading ? (
                <div className="material-detail-loading-frame">
                  <div className="material-skeleton material-skeleton-page" />
                </div>
              ) : assetError ? (
                <div className="material-detail-note">
                  <strong>Không thể chuẩn bị học liệu để hiển thị.</strong>
                  <p>{assetError}</p>
                </div>
              ) : (
                <MaterialDetailPreview
                  material={material}
                  types={types}
                  fileUrl={resolvedFileUrl}
                  imageUrls={resolvedImageUrls}
                  officeFileUrl={officeFileUrl}
                />
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default HocLieuChiTiet;
