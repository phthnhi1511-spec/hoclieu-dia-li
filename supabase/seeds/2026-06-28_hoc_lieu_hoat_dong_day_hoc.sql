create table if not exists public.hoat_dong_day_hoc (
  id bigserial primary key,
  ten_hoat_dong text not null,
  duong_dan text not null unique,
  mo_ta text,
  thu_tu_hien_thi integer default 0,
  dang_hien_thi boolean default true,
  ngay_tao timestamptz default now()
);

comment on table public.hoat_dong_day_hoc is
'Danh muc the hoat dong day hoc gan cho hoc_lieu.';

comment on column public.hoat_dong_day_hoc.duong_dan is
'Slug duy nhat cua hoat dong day hoc, vi du khoi-dong, hinh-thanh-kien-thuc.';

insert into public.hoat_dong_day_hoc (
  ten_hoat_dong,
  duong_dan,
  mo_ta,
  thu_tu_hien_thi,
  dang_hien_thi
)
values
  ('Khởi động', 'khoi-dong', 'Học liệu dùng để tạo tình huống, gợi mở bài học.', 1, true),
  ('Hình thành kiến thức', 'hinh-thanh-kien-thuc', 'Học liệu phục vụ hoạt động khám phá và hình thành kiến thức mới.', 2, true),
  ('Luyện tập', 'luyen-tap', 'Học liệu dùng để củng cố, luyện tập kiến thức và kĩ năng.', 3, true),
  ('Vận dụng', 'van-dung', 'Học liệu dùng để vận dụng kiến thức vào nhiệm vụ hoặc tình huống thực tiễn.', 4, true)
on conflict (duong_dan) do update
set
  ten_hoat_dong = excluded.ten_hoat_dong,
  mo_ta = excluded.mo_ta,
  thu_tu_hien_thi = excluded.thu_tu_hien_thi,
  dang_hien_thi = excluded.dang_hien_thi;

alter table public.hoc_lieu
  add column if not exists hoat_dong_day_hoc_id bigint;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'hoc_lieu'
      and column_name = 'hoat_dong_day_hoc'
  ) then
    execute $migrate$
      update public.hoc_lieu as hoc_lieu
      set hoat_dong_day_hoc_id = hoat_dong_day_hoc.id
      from public.hoat_dong_day_hoc as hoat_dong_day_hoc
      where hoc_lieu.hoat_dong_day_hoc_id is null
        and (
          hoc_lieu.hoat_dong_day_hoc = hoat_dong_day_hoc.duong_dan
          or hoc_lieu.hoat_dong_day_hoc = replace(hoat_dong_day_hoc.duong_dan, '-', '_')
        )
    $migrate$;
  end if;
end $$;

alter table public.hoc_lieu
  drop constraint if exists hoc_lieu_hoat_dong_day_hoc_id_fkey;

alter table public.hoc_lieu
  add constraint hoc_lieu_hoat_dong_day_hoc_id_fkey
  foreign key (hoat_dong_day_hoc_id)
  references public.hoat_dong_day_hoc(id)
  on update cascade
  on delete set null;

comment on column public.hoc_lieu.hoat_dong_day_hoc_id is
'Nullable reference to public.hoat_dong_day_hoc for teaching activity tags and public filtering.';
