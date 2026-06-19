create table if not exists public.cau_hinh_website (
  id bigserial primary key,
  khoa_cau_hinh text not null,
  gia_tri_cau_hinh text
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'cau_hinh_website_khoa_cau_hinh_key'
  ) then
    alter table public.cau_hinh_website
      add constraint cau_hinh_website_khoa_cau_hinh_key unique (khoa_cau_hinh);
  end if;
end $$;

create table if not exists public.trang_chu_muc (
  id bigserial primary key,
  khu_vuc text not null,
  ma_muc text not null,
  tieu_de text not null,
  mo_ta text,
  bieu_tuong text,
  duong_dan_anh text,
  nhan_hanh_dong text,
  duong_dan text,
  thu_tu_hien_thi integer not null default 0,
  da_hien_thi boolean not null default true,
  ngay_tao timestamptz not null default timezone('utc'::text, now())
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trang_chu_muc_ma_muc_key'
  ) then
    alter table public.trang_chu_muc
      add constraint trang_chu_muc_ma_muc_key unique (ma_muc);
  end if;
end $$;

comment on table public.trang_chu_muc is
'Noi dung card va lien ket cho homepage, tach rieng de admin co the CRUD tung khoi.';

comment on column public.trang_chu_muc.khu_vuc is
'Khu vuc hien thi tren homepage, vi du diem_noi_bat, nang_luc_dia_li, hoc_lieu_noi_bat, huong_dan_su_dung, footer_lien_ket_nhanh, footer_ho_tro.';

comment on column public.trang_chu_muc.ma_muc is
'Ma duy nhat cua tung muc homepage, dung de seed va cap nhat on dinh.';

insert into public.cau_hinh_website (khoa_cau_hinh, gia_tri_cau_hinh)
values
  ('hero_eyebrow', 'HỌC LIỆU SỐ'),
  ('hero_title', E'HỌC LIỆU SỐ\nĐỊA LÍ KINH TẾ VIỆT NAM'),
  ('hero_description', 'Khám phá - Tìm hiểu - Vận dụng kiến thức địa lí'),
  ('hero_image', 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1600&q=80'),
  ('hero_primary_label', 'BẮT ĐẦU HỌC TẬP'),
  ('hero_primary_link', '/hoc-lieu'),
  ('hero_secondary_label', 'KHÁM PHÁ HỌC LIỆU'),
  ('hero_secondary_link', '/hoc-lieu'),
  ('features_kicker', 'ĐIỂM NỔI BẬT'),
  ('features_title', 'ĐIỂM NỔI BẬT CỦA WEBSITE'),
  ('features_description', 'Những khối chức năng giúp website học liệu số trực quan, thuận tiện và phù hợp cho học sinh, giáo viên khi khai thác kiến thức Địa lí Kinh tế Việt Nam.'),
  ('capabilities_kicker', 'NĂNG LỰC'),
  ('capabilities_title', 'PHÁT TRIỂN NĂNG LỰC ĐỊA LÍ'),
  ('capabilities_description', 'Các học liệu, bản đồ và hoạt động luyện tập được tổ chức để hỗ trợ nhận thức, tìm hiểu và vận dụng kiến thức địa lí kinh tế Việt Nam.'),
  ('featured_kicker', 'NỔI BẬT'),
  ('featured_title', 'HỌC LIỆU NỔI BẬT'),
  ('featured_description', 'Từ trang chủ, người dùng có thể đi nhanh vào các nhóm nội dung chính thay vì nhảy tới từng chủ đề rời rạc, giúp việc khai thác website gọn và rõ hơn.'),
  ('featured_cta_label', 'XEM TẤT CẢ HỌC LIỆU'),
  ('featured_cta_link', '/hoc-lieu'),
  ('guide_kicker', 'HƯỚNG DẪN'),
  ('guide_title', 'HƯỚNG DẪN SỬ DỤNG'),
  ('guide_description', 'Luồng sử dụng ngắn gọn để học sinh và giáo viên nhanh chóng chọn nội dung phù hợp rồi chuyển sang khám phá, luyện tập và vận dụng.'),
  ('footer_brand_title', 'HỌC LIỆU SỐ ĐỊA LÍ KINH TẾ VIỆT NAM'),
  ('footer_brand_description', 'Website học liệu số hỗ trợ dạy và học môn Địa lí Kinh tế Việt Nam theo định hướng phát triển năng lực.'),
  ('footer_links_title', 'LIÊN KẾT NHANH'),
  ('footer_support_title', 'HỖ TRỢ'),
  ('footer_contact_title', 'LIÊN HỆ'),
  ('footer_contact_name', 'Phan Thị Hoài Nhi'),
  ('footer_contact_email', 'hoainhi@edu.vn'),
  ('footer_contact_school', 'Trường Đại học Sư phạm')
on conflict (khoa_cau_hinh) do update
set gia_tri_cau_hinh = excluded.gia_tri_cau_hinh;

insert into public.trang_chu_muc (
  khu_vuc,
  ma_muc,
  tieu_de,
  mo_ta,
  bieu_tuong,
  duong_dan_anh,
  nhan_hanh_dong,
  duong_dan,
  thu_tu_hien_thi,
  da_hien_thi
)
values
  (
    'diem_noi_bat',
    'feature-hoc-moi-luc',
    'Học mọi lúc mọi nơi',
    'Truy cập học liệu trên nhiều thiết bị.',
    '01',
    null,
    null,
    null,
    1,
    true
  ),
  (
    'diem_noi_bat',
    'feature-ban-do-tuong-tac',
    'Bản đồ tương tác',
    'Khám phá kiến thức qua bản đồ số.',
    '02',
    null,
    null,
    null,
    2,
    true
  ),
  (
    'diem_noi_bat',
    'feature-bieu-do-truc-quan',
    'Biểu đồ trực quan',
    'Dữ liệu kinh tế - xã hội sinh động.',
    '03',
    null,
    null,
    null,
    3,
    true
  ),
  (
    'diem_noi_bat',
    'feature-hoc-tap-tuong-tac',
    'Học tập qua trò chơi',
    'Ôn luyện kiến thức bằng hoạt động tương tác.',
    '04',
    null,
    null,
    null,
    4,
    true
  ),
  (
    'nang_luc_dia_li',
    'capacity-nhan-thuc',
    'Nhận thức khoa học địa lí',
    'Hiểu đặc điểm và sự phân bố các ngành kinh tế.',
    '01',
    null,
    null,
    null,
    1,
    true
  ),
  (
    'nang_luc_dia_li',
    'capacity-tim-hieu',
    'Tìm hiểu địa lí',
    'Khai thác bản đồ, atlas và học liệu số.',
    '02',
    null,
    null,
    null,
    2,
    true
  ),
  (
    'nang_luc_dia_li',
    'capacity-van-dung',
    'Vận dụng kiến thức',
    'Giải quyết các tình huống thực tiễn.',
    '03',
    null,
    null,
    null,
    3,
    true
  ),
  (
    'hoc_lieu_noi_bat',
    'featured-nong-nghiep',
    'Nông nghiệp Việt Nam',
    'Tìm hiểu các tư liệu, bài giảng và học liệu về nông nghiệp Việt Nam.',
    'Học liệu',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
    'Khám phá ngay',
    '/hoc-lieu/nong-nghiep',
    1,
    true
  ),
  (
    'hoc_lieu_noi_bat',
    'featured-cong-nghiep',
    'Công nghiệp Việt Nam',
    'Khám phá tài nguyên học liệu về công nghiệp, sản xuất và các trung tâm công nghiệp.',
    'Học liệu',
    'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    'Khám phá ngay',
    '/hoc-lieu/cong-nghiep',
    2,
    true
  ),
  (
    'hoc_lieu_noi_bat',
    'featured-dich-vu',
    'Dịch vụ Việt Nam',
    'Theo dõi học liệu về thương mại, giao thông, du lịch và các ngành dịch vụ.',
    'Học liệu',
    'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80',
    'Khám phá ngay',
    '/hoc-lieu/dich-vu',
    3,
    true
  ),
  (
    'hoc_lieu_noi_bat',
    'featured-ban-do',
    'Bản đồ tương tác',
    'Khám phá thông tin vùng kinh tế bằng bản đồ Việt Nam tương tác.',
    'Bản đồ',
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80',
    'Khám phá ngay',
    '/ban-do',
    4,
    true
  ),
  (
    'hoc_lieu_noi_bat',
    'featured-bieu-do',
    'Biểu đồ kinh tế - xã hội',
    'Tiếp cận các tư liệu trực quan về chỉ số và dữ liệu kinh tế - xã hội.',
    'Dữ liệu',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    'Khám phá ngay',
    '/hoc-lieu',
    5,
    true
  ),
  (
    'hoc_lieu_noi_bat',
    'featured-luyen-tap',
    'Luyện tập',
    'Làm bài trắc nghiệm, lưu kết quả và xem lại phần giải thích đáp án.',
    'Luyện tập',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
    'Khám phá ngay',
    '/luyen-tap',
    6,
    true
  ),
  (
    'huong_dan_su_dung',
    'guide-buoc-1',
    'Chọn học liệu',
    'Đi vào học liệu, bản đồ, thư viện hoặc khu luyện tập tùy nhu cầu.',
    '01',
    null,
    null,
    null,
    1,
    true
  ),
  (
    'huong_dan_su_dung',
    'guide-buoc-2',
    'Khám phá nội dung',
    'Mở từng học liệu chi tiết để đọc, xem, tải về hoặc tương tác.',
    '02',
    null,
    null,
    null,
    2,
    true
  ),
  (
    'huong_dan_su_dung',
    'guide-buoc-3',
    'Luyện tập và vận dụng',
    'Chuyển sang phần luyện tập để kiểm tra mức độ hiểu bài và ghi nhận kết quả.',
    '03',
    null,
    null,
    null,
    3,
    true
  ),
  (
    'footer_lien_ket_nhanh',
    'footer-link-home',
    'Trang chủ',
    null,
    null,
    null,
    null,
    '/',
    1,
    true
  ),
  (
    'footer_lien_ket_nhanh',
    'footer-link-materials',
    'Học liệu',
    null,
    null,
    null,
    null,
    '/hoc-lieu',
    2,
    true
  ),
  (
    'footer_lien_ket_nhanh',
    'footer-link-map',
    'Bản đồ',
    null,
    null,
    null,
    null,
    '/ban-do',
    3,
    true
  ),
  (
    'footer_lien_ket_nhanh',
    'footer-link-quiz',
    'Luyện tập',
    null,
    null,
    null,
    null,
    '/luyen-tap',
    4,
    true
  ),
  (
    'footer_lien_ket_nhanh',
    'footer-link-library',
    'Thư viện',
    null,
    null,
    null,
    null,
    '/thu-vien',
    5,
    true
  ),
  (
    'footer_ho_tro',
    'footer-support-guide',
    'Hướng dẫn sử dụng',
    null,
    null,
    null,
    null,
    '/',
    1,
    true
  ),
  (
    'footer_ho_tro',
    'footer-support-survey',
    'Khảo sát',
    null,
    null,
    null,
    null,
    '/khao-sat',
    2,
    true
  ),
  (
    'footer_ho_tro',
    'footer-support-contact',
    'Góp ý',
    null,
    null,
    null,
    null,
    'mailto:hoainhi@edu.vn',
    3,
    true
  )
on conflict (ma_muc) do update
set
  khu_vuc = excluded.khu_vuc,
  tieu_de = excluded.tieu_de,
  mo_ta = excluded.mo_ta,
  bieu_tuong = excluded.bieu_tuong,
  duong_dan_anh = excluded.duong_dan_anh,
  nhan_hanh_dong = excluded.nhan_hanh_dong,
  duong_dan = excluded.duong_dan,
  thu_tu_hien_thi = excluded.thu_tu_hien_thi,
  da_hien_thi = excluded.da_hien_thi;
