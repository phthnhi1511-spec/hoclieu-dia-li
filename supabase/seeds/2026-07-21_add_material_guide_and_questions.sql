-- SQL bổ sung 2 cột mới cho bảng hoc_lieu
alter table public.hoc_lieu add column if not exists huong_dan_khai_thac text;
alter table public.hoc_lieu add column if not exists cau_hoi_luyen_tap text;
