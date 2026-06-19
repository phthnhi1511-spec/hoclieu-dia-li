import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import {
  buildHomeConfigMap,
  getHomeImageUrl,
  getHomeSectionItems,
  getHomeTitleLines,
  getResolvedHomeConfig,
  groupHomeItems,
  isExternalLink,
} from "../lib/homePageContent";
import { supabase } from "../lib/supabaseClient";
import "./Home.css";

const FEATURE_CARD_COUNT = 4;
const CAPABILITY_CARD_COUNT = 3;
const FEATURED_CARD_COUNT = 6;

function HomeLink({ children, className, to }) {
  if (!to) {
    return <span className={`${className} home-link-disabled`}>{children}</span>;
  }

  if (isExternalLink(to)) {
    const isMailOrPhoneLink = /^(mailto:|tel:)/i.test(to);

    return (
      <a
        className={className}
        href={to}
        target={isMailOrPhoneLink ? undefined : "_blank"}
        rel={isMailOrPhoneLink ? undefined : "noreferrer"}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className={className} to={to}>
      {children}
    </Link>
  );
}

function SectionHeading({ description, title }) {
  return (
    <header className="home-section-heading">
      <h2>{title}</h2>
      <span className="home-section-divider" aria-hidden="true" />
      {description ? <p>{description}</p> : null}
    </header>
  );
}

function FeatureCard({ item }) {
  return (
    <article className="home-feature-card">
      <span className="home-feature-icon">{item.bieu_tuong || "01"}</span>
      <div>
        <h3>{item.tieu_de}</h3>
        <p>{item.mo_ta || "Nội dung đang được cập nhật."}</p>
      </div>
    </article>
  );
}

function CapabilityCard({ item }) {
  return (
    <article className="home-capability-card">
      <span className="home-capability-icon">{item.bieu_tuong || "01"}</span>
      <h3>{item.tieu_de}</h3>
      <p>{item.mo_ta || "Nội dung đang được cập nhật."}</p>
    </article>
  );
}

function MaterialCard({ item }) {
  const [hasImageError, setHasImageError] = useState(false);
  const imageUrl = !hasImageError ? getHomeImageUrl(item.duong_dan_anh) : "";
  const shouldShowImage = Boolean(imageUrl);

  return (
    <article className="home-material-card">
      <div className="home-material-thumb">
        {shouldShowImage ? (
          <img
            src={imageUrl}
            alt={item.tieu_de}
            className="home-material-image"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="home-material-placeholder">
            <span>{item.bieu_tuong || "Học liệu"}</span>
          </div>
        )}
      </div>

      <div className="home-material-content">
        {item.bieu_tuong ? <span className="home-material-badge">{item.bieu_tuong}</span> : null}
        <h3>{item.tieu_de}</h3>
        <p>{item.mo_ta || "Nội dung đang được cập nhật."}</p>
        <HomeLink to={item.duong_dan} className="home-material-link">
          {item.nhan_hanh_dong || "Xem ngay"}
        </HomeLink>
      </div>
    </article>
  );
}

function FeatureSkeleton() {
  return (
    <article className="home-feature-card home-card-skeleton" aria-hidden="true">
      <div className="home-skeleton home-skeleton-icon" />
      <div className="home-skeleton-block">
        <div className="home-skeleton home-skeleton-title" />
        <div className="home-skeleton home-skeleton-text home-skeleton-text-wide" />
        <div className="home-skeleton home-skeleton-text" />
      </div>
    </article>
  );
}

function CapabilitySkeleton() {
  return (
    <article className="home-capability-card home-card-skeleton" aria-hidden="true">
      <div className="home-skeleton home-skeleton-capability-icon" />
      <div className="home-skeleton home-skeleton-title" />
      <div className="home-skeleton home-skeleton-text home-skeleton-text-wide" />
      <div className="home-skeleton home-skeleton-text" />
    </article>
  );
}

function MaterialSkeleton() {
  return (
    <article className="home-material-card home-card-skeleton" aria-hidden="true">
      <div className="home-material-thumb">
        <div className="home-skeleton home-skeleton-thumb" />
      </div>
      <div className="home-material-content">
        <div className="home-skeleton home-skeleton-chip" />
        <div className="home-skeleton home-skeleton-title" />
        <div className="home-skeleton home-skeleton-text home-skeleton-text-wide" />
        <div className="home-skeleton home-skeleton-link" />
      </div>
    </article>
  );
}

function Home() {
  const [configRows, setConfigRows] = useState([]);
  const [homeRows, setHomeRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadHomePage() {
      setLoading(true);
      setError("");

      const [
        { data: loadedConfigRows, error: configError },
        { data: loadedHomeRows, error: homeRowsError },
      ] = await Promise.all([
        supabase.from("cau_hinh_website").select("khoa_cau_hinh, gia_tri_cau_hinh"),
        supabase
          .from("trang_chu_muc")
          .select("*")
          .eq("da_hien_thi", true)
          .order("khu_vuc", { ascending: true })
          .order("thu_tu_hien_thi", { ascending: true })
          .order("id", { ascending: true }),
      ]);

      if (!isMounted) return;

      if (configError) {
        setError(
          `Lỗi tải cấu hình homepage: ${configError.message}. Cần chạy file supabase/seeds/2026-06-19_trang_chu_noi_dung.sql rồi tải lại trang.`,
        );
        setConfigRows([]);
        setHomeRows([]);
      } else if (homeRowsError) {
        setError(
          `Lỗi tải nội dung homepage: ${homeRowsError.message}. Cần chạy file supabase/seeds/2026-06-19_trang_chu_noi_dung.sql rồi tải lại trang.`,
        );
        setConfigRows(loadedConfigRows || []);
        setHomeRows([]);
      } else {
        setConfigRows(loadedConfigRows || []);
        setHomeRows(loadedHomeRows || []);
      }

      setLoading(false);
    }

    loadHomePage();

    return () => {
      isMounted = false;
    };
  }, []);

  const config = useMemo(
    () => getResolvedHomeConfig(buildHomeConfigMap(configRows)),
    [configRows],
  );

  const groupedItems = useMemo(() => groupHomeItems(homeRows), [homeRows]);

  const featureItems = getHomeSectionItems(groupedItems, "diem_noi_bat");
  const capabilityItems = getHomeSectionItems(groupedItems, "nang_luc_dia_li");
  const featuredItems = getHomeSectionItems(groupedItems, "hoc_lieu_noi_bat");
  const footerQuickLinks = getHomeSectionItems(groupedItems, "footer_lien_ket_nhanh");
  const footerSupportLinks = getHomeSectionItems(groupedItems, "footer_ho_tro");
  const heroTitleLines = getHomeTitleLines(config.hero_title);
  const heroBackgroundImage = getHomeImageUrl(config.hero_image);

  return (
    <div className="home-page">
      <Header />

      <main className="home-main">
        <section
          className="home-hero"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(5, 44, 19, 0.76) 0%, rgba(5, 44, 19, 0.36) 42%, rgba(5, 44, 19, 0.2) 100%), url("${heroBackgroundImage}")`,
          }}
        >
          <div className="home-hero-inner">
            <div className="home-hero-content">
              <h1>
                {heroTitleLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h1>
              <p className="home-hero-description">{config.hero_description}</p>

              <div className="home-hero-actions">
                <HomeLink to={config.hero_primary_link} className="home-button home-button-primary">
                  {config.hero_primary_label}
                </HomeLink>
                <HomeLink to={config.hero_secondary_link} className="home-button home-button-secondary">
                  {config.hero_secondary_label}
                </HomeLink>
              </div>
            </div>
          </div>
        </section>

        <section className="home-feature-strip-wrap">
          <div className="home-feature-strip">
            {loading
              ? Array.from({ length: FEATURE_CARD_COUNT }, (_, index) => <FeatureSkeleton key={index} />)
              : featureItems.map((item) => <FeatureCard key={item.id} item={item} />)}
          </div>
        </section>

        <section className="home-section home-intro-section">
          <SectionHeading
            title="Giới thiệu website"
            description="Website Học liệu số Địa lí Kinh tế Việt Nam được xây dựng nhằm hỗ trợ học sinh học tập, khám phá kiến thức và phát triển năng lực địa lí thông qua hệ thống bản đồ, video, trò chơi học tập, biểu đồ và nhiều học liệu trực quan khác."
          />

          <div className="home-capability-grid">
            {loading
              ? Array.from({ length: CAPABILITY_CARD_COUNT }, (_, index) => <CapabilitySkeleton key={index} />)
              : capabilityItems.map((item) => <CapabilityCard key={item.id} item={item} />)}
          </div>
        </section>

        <section className="home-section">
          <SectionHeading title="Học liệu nổi bật" />

          <div className="home-material-grid">
            {loading
              ? Array.from({ length: FEATURED_CARD_COUNT }, (_, index) => <MaterialSkeleton key={index} />)
              : featuredItems.map((item) => <MaterialCard key={item.id} item={item} />)}
          </div>

          <div className="home-material-cta">
            <HomeLink to={config.featured_cta_link} className="home-button home-button-primary">
              {config.featured_cta_label}
            </HomeLink>
          </div>
        </section>

        {error ? (
          <div className="home-page-message home-page-message-error" role="alert">
            {error}
          </div>
        ) : null}
      </main>

      <footer className="home-footer">
        <div className="home-footer-grid">
          <div className="home-footer-brand">
            <h2>{config.footer_brand_title}</h2>
            <p>{config.footer_brand_description}</p>
          </div>

          <div>
            <h3>{config.footer_links_title}</h3>
            <ul className="home-footer-links">
              {footerQuickLinks.map((item) => (
                <li key={item.id}>
                  <HomeLink to={item.duong_dan} className="home-footer-link">
                    {item.tieu_de}
                  </HomeLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>{config.footer_support_title}</h3>
            <ul className="home-footer-links">
              {footerSupportLinks.map((item) => (
                <li key={item.id}>
                  <HomeLink to={item.duong_dan} className="home-footer-link">
                    {item.tieu_de}
                  </HomeLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3>{config.footer_contact_title}</h3>
            <ul className="home-footer-contact">
              {config.footer_contact_name ? <li>{config.footer_contact_name}</li> : null}
              {config.footer_contact_email ? (
                <li>
                  <a href={`mailto:${config.footer_contact_email}`}>{config.footer_contact_email}</a>
                </li>
              ) : null}
              {config.footer_contact_school ? <li>{config.footer_contact_school}</li> : null}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
