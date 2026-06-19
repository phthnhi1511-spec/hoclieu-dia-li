-- Xoa cac bang khong con duoc ung dung su dung.
-- Chay file nay trong Supabase SQL Editor.

begin;

drop table if exists public.cau_tra_loi_khao_sat;
drop table if exists public.lua_chon_khao_sat;
drop table if exists public.phan_hoi_khao_sat;
drop table if exists public.cau_hoi_khao_sat;
drop table if exists public.gop_y_lien_he;
drop table if exists public.du_lieu_thong_ke;

commit;
