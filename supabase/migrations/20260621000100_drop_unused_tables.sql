-- Remove legacy tables that are no longer used by the application.
-- Child survey tables are removed before their former parent tables.

begin;

drop table if exists public.cau_tra_loi_khao_sat cascade;
drop table if exists public.lua_chon_khao_sat cascade;
drop table if exists public.phan_hoi_khao_sat cascade;
drop table if exists public.cau_hoi_khao_sat cascade;
drop table if exists public.gop_y_lien_he cascade;
drop table if exists public.du_lieu_thong_ke cascade;

commit;
