create table if not exists tro_choi_hoc_tap (
  id bigint generated always as identity primary key,
  ten_tro_choi text not null,
  mo_ta text,
  duong_dan text not null,
  chu_de text not null,
  hinh_dai_dien_url text,
  thu_tu_hien_thi int default 0,
  da_xuat_ban boolean default true,
  ngay_tao timestamp with time zone default now(),
  ngay_cap_nhat timestamp with time zone default now()
);

alter table tro_choi_hoc_tap enable row level security;

grant usage on schema public to anon;
grant select, insert, update, delete on table tro_choi_hoc_tap to anon;
grant usage, select on all sequences in schema public to anon;

drop policy if exists "Cong khai xem tro choi hoc tap" on tro_choi_hoc_tap;
drop policy if exists "Admin demo them tro choi hoc tap" on tro_choi_hoc_tap;
drop policy if exists "Admin demo sua tro choi hoc tap" on tro_choi_hoc_tap;
drop policy if exists "Admin demo xoa tro choi hoc tap" on tro_choi_hoc_tap;

create policy "Cong khai xem tro choi hoc tap"
on tro_choi_hoc_tap
for select
to anon
using (da_xuat_ban = true);

create policy "Admin demo them tro choi hoc tap"
on tro_choi_hoc_tap
for insert
to anon
with check (true);

create policy "Admin demo sua tro choi hoc tap"
on tro_choi_hoc_tap
for update
to anon
using (true)
with check (true);

create policy "Admin demo xoa tro choi hoc tap"
on tro_choi_hoc_tap
for delete
to anon
using (true);

insert into tro_choi_hoc_tap
  (ten_tro_choi, mo_ta, duong_dan, chu_de, thu_tu_hien_thi, da_xuat_ban)
values
  (
    'Ô chữ Địa lí kinh tế',
    'Củng cố khái niệm, ngành kinh tế và vùng kinh tế qua trò chơi ô chữ.',
    'https://wordwall.net/vi-vn/community/%C4%91%E1%BB%8Ba-l%C3%AD-9',
    'Nông nghiệp',
    1,
    true
  ),
  (
    'Đố vui nhanh',
    'Luyện phản xạ với các câu hỏi ngắn về Địa lí Việt Nam lớp 9.',
    'https://quizizz.com/admin/search/%C4%91%E1%BB%8Ba%20l%C3%AD%209',
    'Công nghiệp',
    2,
    true
  ),
  (
    'Ghép cặp bản đồ',
    'Nhận diện địa danh, vùng kinh tế và kiến thức bản đồ bằng hoạt động tương tác.',
    'https://learningapps.org/index.php?category=89&s=%C4%91%E1%BB%8Ba+l%C3%AD+9',
    'Dịch vụ',
    3,
    true
  )
on conflict do nothing;
