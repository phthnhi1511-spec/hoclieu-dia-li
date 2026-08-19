import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { renderAsync } from "docx-preview";
import { pdfjs } from "react-pdf";
import Header from "../components/Header";
import {
  buildR2ProxyFileUrl,
  buildR2ReadableFileUrl,
  getR2DownloadUrl,
  resolveR2ObjectUrl,
} from "../lib/r2";
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

  return {
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

function VideoPreview({ fileUrl, posterUrl }) {
  const isYoutube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(fileUrl);

  if (isYoutube) {
    let videoId = "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = fileUrl.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }

    if (videoId) {
      return (
        <div className="material-detail-video-iframe-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }
  }

  const isDrive = /drive\.google\.com/i.test(fileUrl);
  if (isDrive) {
    const embedUrl = fileUrl.replace(/\/view\?usp=drivesdk|\/view$/i, "/preview");
    return (
      <div className="material-detail-video-iframe-wrapper">
        <iframe
          src={embedUrl}
          title="Google Drive video player"
          allow="autoplay"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div className="material-detail-video">
      <video
        controls
        preload="metadata"
        playsInline
        poster={posterUrl}
        style={{ width: "100%", maxHeight: "560px", background: "#000", borderRadius: "12px" }}
      >
        <source src={fileUrl} />
        Trình duyệt của bạn chưa hỗ trợ phát video này trực tiếp.
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



function ImageGalleryPreview({ imageUrls, label }) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [zoomScale, setZoomScale] = useState(1);

  const viewportRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [scrollTopState, setScrollTopState] = useState(0);
  const [mouseDownPos, setMouseDownPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setMouseDownPos({ x: e.pageX, y: e.pageY });
    if (zoomScale <= 1 || !viewportRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - viewportRef.current.offsetLeft);
    setStartY(e.pageY - viewportRef.current.offsetTop);
    setScrollLeftState(viewportRef.current.scrollLeft);
    setScrollTopState(viewportRef.current.scrollTop);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomScale <= 1 || !viewportRef.current) return;
    e.preventDefault();
    const x = e.pageX - viewportRef.current.offsetLeft;
    const y = e.pageY - viewportRef.current.offsetTop;
    const walkX = (x - startX) * 1.5;
    const walkY = (y - startY) * 1.5;
    viewportRef.current.scrollLeft = scrollLeftState - walkX;
    viewportRef.current.scrollTop = scrollTopState - walkY;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    setZoomScale(1);
  }, [activeIndex]);

  useEffect(() => {
    if (activeIndex < 0) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setActiveIndex(-1);
        return;
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => Math.min(imageUrls.length - 1, current + 1));
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => Math.max(0, current - 1));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex, imageUrls.length]);

  if (imageUrls.length === 0) {
    return (
      <div className="material-detail-note">
        <p>Chưa có ảnh minh họa cho {label.toLowerCase()} này.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`material-detail-gallery ${imageUrls.length === 1 ? "material-detail-gallery-single" : ""}`}>
        {imageUrls.map((imageUrl, index) => (
          <button
            key={`${imageUrl}-${index}`}
            type="button"
            className="material-detail-gallery-item"
            onClick={() => setActiveIndex(index)}
            aria-label={`Mở ảnh ${index + 1} của ${label}`}
          >
            <img src={imageUrl} alt={`${label} ${index + 1}`} />
            <span className="material-detail-gallery-hint">Bấm để xem lớn</span>
          </button>
        ))}
      </div>

      {activeIndex >= 0 ? (
        <div
          className="material-detail-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${label} ảnh ${activeIndex + 1}`}
          onClick={() => setActiveIndex(-1)}
        >
          <div
            className="material-detail-lightbox-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="material-detail-lightbox-toolbar">
              <span>
                {label} {activeIndex + 1}/{imageUrls.length}
              </span>

              <div className="material-detail-lightbox-zoom-controls">
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.max(1, s - 0.25))}
                  disabled={zoomScale <= 1}
                  aria-label="Thu nhỏ"
                >
                  -
                </button>
                <span>{Math.round(zoomScale * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setZoomScale((s) => Math.min(3, s + 0.25))}
                  disabled={zoomScale >= 3}
                  aria-label="Phóng to"
                >
                  +
                </button>
                <button
                  type="button"
                  className="material-detail-lightbox-zoom-reset"
                  onClick={() => setZoomScale(1)}
                  disabled={zoomScale === 1}
                  aria-label="Đặt lại về mặc định"
                >
                  Đặt lại
                </button>
              </div>

              <button
                type="button"
                className="material-detail-lightbox-close"
                onClick={() => setActiveIndex(-1)}
                aria-label="Đóng ảnh lớn"
              >
                ×
              </button>
            </div>

            <div className="material-detail-lightbox-stage">
              {imageUrls.length > 1 ? (
                <button
                  type="button"
                  className="material-detail-lightbox-nav"
                  onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
                  disabled={activeIndex === 0}
                  aria-label="Ảnh trước"
                >
                  ‹
                </button>
              ) : (
                <div style={{ width: "46px" }} />
              )}

              <div
                ref={viewportRef}
                className={`material-detail-lightbox-viewport ${zoomScale > 1 ? "is-zoomed" : ""}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                style={{ cursor: zoomScale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
              >
                <img
                  src={imageUrls[activeIndex]}
                  alt={`${label} ${activeIndex + 1}`}
                  className={`material-detail-lightbox-image ${zoomScale > 1 ? "is-zoomed" : ""}`}
                  style={{
                    maxWidth: zoomScale === 1 ? "100%" : `${100 * zoomScale}%`,
                    maxHeight: zoomScale === 1 ? "calc(100vh - 150px)" : `${100 * zoomScale}vh`,
                    width: "auto",
                    height: "auto",
                    transition: isDragging ? "none" : "max-width 0.15s ease, max-height 0.15s ease",
                    cursor: zoomScale > 1 ? (isDragging ? "grabbing" : "zoom-out") : "zoom-in",
                  }}
                  onClick={(e) => {
                    const distance = Math.sqrt(
                      Math.pow(e.pageX - mouseDownPos.x, 2) + Math.pow(e.pageY - mouseDownPos.y, 2)
                    );
                    if (distance > 6) return;

                    if (zoomScale > 1) {
                      setZoomScale(1);
                    } else {
                      setZoomScale(1.5);
                    }
                  }}
                  draggable={false}
                />
              </div>

              {imageUrls.length > 1 ? (
                <button
                  type="button"
                  className="material-detail-lightbox-nav"
                  onClick={() =>
                    setActiveIndex((current) => Math.min(imageUrls.length - 1, current + 1))
                  }
                  disabled={activeIndex === imageUrls.length - 1}
                  aria-label="Ảnh sau"
                >
                  ›
                </button>
              ) : (
                <div style={{ width: "46px" }} />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
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

  const viewerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === viewerRef.current);
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;

    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch((err) => {
        console.error("Không thể kích hoạt chế độ toàn màn hình:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

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
  const maxPageWidthByWidth = isCompactViewport
    ? (viewportWidth - 32)
    : Math.floor((viewportWidth - 80) / 2);

  const windowHeight = typeof window === "undefined" ? 800 : window.innerHeight;
  const maxBookHeight = isFullscreen ? (windowHeight - 110) : Math.min(800, windowHeight - 200);
  const maxPageWidthByHeight = Math.floor((maxBookHeight - 40) / 1.42);

  const pageWidth = Math.max(220, Math.min(maxPageWidthByWidth, maxPageWidthByHeight) - 16);
  const bookHeight = Math.round(pageWidth * 1.42) + 36;
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
    <div ref={viewerRef} className="material-atlat-viewer">
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
          <button type="button" onClick={toggleFullscreen}>
            {isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
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
    return <VideoPreview fileUrl={fileUrl} posterUrl={imageUrls[0]} />;
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

  if (kind === "excel") {
    return (
      <OfficePreview
        fileUrl={officeFileUrl}
        title={material.tieu_de}
        helperText="Tài liệu Excel được hiển thị qua trình xem trực tuyến."
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

  if (kind === "atlat-image") {
    return <ImageGalleryPreview imageUrls={imageUrls} label="Hình ảnh Atlat" />;
  }

  if (kind === "image-gallery") {
    return <ImageGalleryPreview imageUrls={imageUrls} label={getTypeName(material, types)} />;
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

function MaterialExplorationGuide({ guides }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!guides || !Array.isArray(guides) || guides.length === 0) return null;

  return (
    <section className="material-guide-box">
      <button
        type="button"
        className="material-guide-header"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="material-guide-title">
          <span className="material-guide-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
              <path d="M9 18h6"/>
              <path d="M10 22h4"/>
            </svg>
          </span>
          <span>HƯỚNG DẪN KHAI THÁC</span>
        </div>
        <span className={`material-accordion-arrow ${isOpen ? "is-open" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div className="material-guide-body">
          <ul className="material-guide-list">
            {guides.map((g, idx) => (
              <li key={g.id || idx}>{g.noi_dung}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function MaterialPracticeQuestions({ questions }) {
  const [isOpen, setIsOpen] = useState(true);
  const [openHintIndex, setOpenHintIndex] = useState({});

  if (!questions || !Array.isArray(questions) || questions.length === 0) return null;

  const toggleHint = (index) => {
    setOpenHintIndex((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <section className="material-questions-box">
      <button
        type="button"
        className="material-questions-header"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <div className="material-questions-title">
          <span className="material-questions-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </span>
          <span>CÂU HỎI LUYỆN TẬP</span>
        </div>
        <span className={`material-accordion-arrow ${isOpen ? "is-open" : ""}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>

      {isOpen ? (
        <div className="material-questions-body">
          {questions.map((q, idx) => {
            const isHintOpen = Boolean(openHintIndex[idx]);

            return (
              <div key={q.id || idx} className="material-question-item">
                <div className="material-question-row">
                  <div className="material-question-left">
                    <span className="material-question-number">{idx + 1}</span>
                    <span className="material-question-text" style={{ whiteSpace: "pre-line" }}>{q.noi_dung_cau_hoi}</span>
                  </div>

                  {q.goi_y_dap_an ? (
                    <button
                      type="button"
                      className="material-hint-button"
                      onClick={() => toggleHint(idx)}
                    >
                      {isHintOpen ? "Ẩn gợi ý" : "Hiện gợi ý"}
                    </button>
                  ) : null}
                </div>

                {q.goi_y_dap_an && isHintOpen ? (
                  <div className="material-hint-box">
                    <strong>Gợi ý đáp án:</strong>
                    <p style={{ whiteSpace: "pre-line" }}>{q.goi_y_dap_an}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

function HocLieuChiTiet() {
  const { duongDan, materialId } = useParams();
  const [topic, setTopic] = useState(null);
  const [types, setTypes] = useState([]);
  const [sources, setSources] = useState([]);
  const [material, setMaterial] = useState(null);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [explorationGuides, setExplorationGuides] = useState([]);
  const [resolvedFileUrl, setResolvedFileUrl] = useState("");
  const [resolvedImageUrls, setResolvedImageUrls] = useState([]);
  const [officeFileUrl, setOfficeFileUrl] = useState("");
  const [assetLoading, setAssetLoading] = useState(false);
  const [assetError, setAssetError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloading, setDownloading] = useState(false);
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

      const [
        { data: typeData, error: typeError },
        sourcesData,
        { data: materialData, error: materialError },
        questionsData,
        guidesData,
      ] = await Promise.all([
        supabase
          .from("loai_hoc_lieu")
          .select("id, ten_loai, duong_dan")
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
          .eq("id", Number(materialId))
          .eq("chu_de_id", topicData.id)
          .eq("da_xuat_ban", true)
          .maybeSingle(),
        supabase
          .from("cau_hoi_hoc_lieu")
          .select("*")
          .eq("hoc_lieu_id", Number(materialId))
          .order("thu_tu_hien_thi", { ascending: true })
          .then(({ data, error }) => {
            if (error) return [];
            return data || [];
          })
          .catch(() => []),
        supabase
          .from("huong_dan_hoc_lieu")
          .select("*")
          .eq("hoc_lieu_id", Number(materialId))
          .order("thu_tu_hien_thi", { ascending: true })
          .then(({ data, error }) => {
            if (error) return [];
            return data || [];
          })
          .catch(() => []),
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
        setSources(sourcesData || []);
        setMaterial(materialData);
        setPracticeQuestions(questionsData || []);
        setExplorationGuides(guidesData || []);
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

      const materialKind = getMaterialKind(material, types);
      const nextFileUrl =
        materialKind === "atlat"
          ? buildR2ReadableFileUrl(material.duong_dan_file)
          : buildR2ProxyFileUrl(material.duong_dan_file);
      const nextImageUrls = parseMediaList(material.duong_dan_anh_dai_dien).map((imagePath) =>
        buildR2ProxyFileUrl(imagePath),
      );
      const fileExtension = getFileExtension(material.duong_dan_file);
      const isExternalFile = /^https?:\/\//i.test(material.duong_dan_file || "");
      const needsSignedUrl =
        !isExternalFile &&
        (materialKind === "powerpoint" ||
          materialKind === "excel" ||
          materialKind === "video" ||
          (materialKind === "lesson-plan" && fileExtension !== "docx"));

      setAssetError("");
      setResolvedFileUrl(nextFileUrl);
      setResolvedImageUrls(nextImageUrls);
      setOfficeFileUrl("");

      if (!needsSignedUrl) {
        setAssetLoading(false);
        return;
      }

      setAssetLoading(true);

      try {
        const signedUrl = await resolveR2ObjectUrl(material.duong_dan_file, {
          expiresIn: 3600,
        });

        if (!isMounted) return;

        if (materialKind === "video") {
          setResolvedFileUrl(signedUrl);
        } else {
          setOfficeFileUrl(signedUrl);
        }
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
  const sourceClassification = useMemo(
    () => (material && sources.length > 0 ? sources.find((src) => src.id === material.nguon_hoc_lieu_id) : null),
    [material, sources],
  );
  const primaryAction = useMemo(
    () => getPrimaryActionConfig(materialKind, fileUrl),
    [fileUrl, materialKind],
  );

  async function handleDownload(event) {
    event.preventDefault();

    if (!material?.duong_dan_file || downloading) return;

    setDownloading(true);
    setDownloadError("");

    try {
      const extension = getFileExtension(material.duong_dan_file);
      const downloadFileName = `${material.tieu_de || "hoc-lieu"}${extension ? `.${extension}` : ""}`;
      const downloadUrl = await getR2DownloadUrl(material.duong_dan_file, downloadFileName);
      const downloadLink = document.createElement("a");
      downloadLink.href = downloadUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
    } catch (downloadFileError) {
      setDownloadError(downloadFileError?.message || "Không thể tải file.");
    } finally {
      setDownloading(false);
    }
  }

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
                {sourceClassification?.ten_nguon ? (
                  <span className={sourceClassification.ten_nguon.toLowerCase().includes("tự thiết kế") ? "source-badge-self" : "source-badge-external"}>
                    {sourceClassification.ten_nguon}
                  </span>
                ) : null}
                {material?.ten_nguon ? <span>Nguồn: {material.ten_nguon}</span> : null}
                {material?.noi_bat ? <span>Nổi bật</span> : null}
              </div>

              <h1>{material?.tieu_de}</h1>
              <p>{material?.mo_ta || "Chưa có mô tả cho học liệu này."}</p>

              <div className="material-detail-actions">
                {primaryAction ? (
                  <a
                    href={primaryAction.href}
                    onClick={handleDownload}
                    rel={primaryAction.rel}
                    target={primaryAction.target}
                    aria-disabled={downloading}
                  >
                    {downloading ? "Đang chuẩn bị..." : primaryAction.label}
                  </a>
                ) : null}
                <Link to={`/hoc-lieu/${duongDan}`}>Quay lại danh sách</Link>
              </div>
              {downloadError ? <p className="material-detail-download-error">{downloadError}</p> : null}
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

            <section className="material-detail-extra-sections">
              <MaterialExplorationGuide guides={explorationGuides} />
              <MaterialPracticeQuestions questions={practiceQuestions} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default HocLieuChiTiet;
