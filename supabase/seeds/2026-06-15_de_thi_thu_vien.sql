create table if not exists public.de_thi (
  id bigserial primary key,
  tieu_de text not null,
  mo_ta text,
  chu_de_id bigint references public.chu_de(id) on delete set null,
  duong_dan_file text not null,
  duong_dan_anh_dai_dien text,
  ten_nguon text,
  da_xuat_ban boolean not null default true,
  ngay_tao timestamptz not null default timezone('utc'::text, now())
);

comment on table public.de_thi is
'Bang de thi rieng cho trang thu vien, tach biet voi hoc_lieu.';

comment on column public.de_thi.duong_dan_file is
'Object key hoac URL file de thi luu tren Cloudflare R2.';

comment on column public.de_thi.duong_dan_anh_dai_dien is
'Anh preview cua de thi neu can hien thi trong danh sach thu vien.';
