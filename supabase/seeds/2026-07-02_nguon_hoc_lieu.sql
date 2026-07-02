-- Tạo bảng nguon_hoc_lieu
create table if not exists public.nguon_hoc_lieu (
  id bigserial primary key,
  ten_nguon text not null unique,
  mo_ta text,
  thu_tu_hien_thi integer default 0,
  ngay_tao timestamptz default now()
);

comment on table public.nguon_hoc_lieu is
'Danh muc nguon hoc lieu gan cho hoc_lieu.';

-- Seed dữ liệu mẫu ban đầu
insert into public.nguon_hoc_lieu (ten_nguon, mo_ta, thu_tu_hien_thi)
values
  ('Tự thiết kế', 'Học liệu do giáo viên/nhà trường tự thiết kế và xây dựng.', 1),
  ('Thu thập', 'Học liệu thu thập từ các nguồn bên ngoài, có chọn lọc và kiểm định.', 2)
on conflict (ten_nguon) do nothing;

-- Thêm cột nguon_hoc_lieu_id vào bảng hoc_lieu
alter table public.hoc_lieu
  add column if not exists nguon_hoc_lieu_id bigint;

-- Thêm ràng buộc khóa ngoại
alter table public.hoc_lieu
  drop constraint if exists hoc_lieu_nguon_hoc_lieu_id_fkey;

alter table public.hoc_lieu
  add constraint hoc_lieu_nguon_hoc_lieu_id_fkey
  foreign key (nguon_hoc_lieu_id)
  references public.nguon_hoc_lieu(id)
  on update cascade
  on delete set null;

comment on column public.hoc_lieu.nguon_hoc_lieu_id is
'Nullable reference to public.nguon_hoc_lieu for source classification (Tự thiết kế / Thu thập).';
