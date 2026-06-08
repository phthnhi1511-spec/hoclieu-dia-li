-- Chay file nay trong Supabase SQL Editor neu muon trang /admin co the them/sua/xoa.
-- Luu y: Day la cau hinh phu hop cho demo khong dang nhap.
-- Vi frontend dung anon key, nguoi co ky thuat van co the goi truc tiep Supabase API.

do $$
declare
  ten_bang text;
  danh_sach_bang text[] := array[
    'chu_de',
    'loai_hoc_lieu',
    'hoc_lieu',
    'bai_kiem_tra',
    'cau_hoi_kiem_tra',
    'dap_an_kiem_tra',
    'ket_qua_kiem_tra',
    'chi_tiet_ket_qua_kiem_tra',
    'ban_do',
    'vung_kinh_te',
    'tin_tuc_tu_lieu',
    'du_lieu_thong_ke',
    'khao_sat',
    'cau_hoi_khao_sat',
    'lua_chon_khao_sat',
    'phan_hoi_khao_sat',
    'cau_tra_loi_khao_sat',
    'gop_y_lien_he',
    'cau_hinh_website'
  ];
begin
  grant usage on schema public to anon;

  foreach ten_bang in array danh_sach_bang
  loop
    execute format('alter table %I enable row level security', ten_bang);
    execute format('grant select, insert, update, delete on table %I to anon', ten_bang);

    execute format('drop policy if exists "Admin demo doc %s" on %I', ten_bang, ten_bang);
    execute format('drop policy if exists "Admin demo them %s" on %I', ten_bang, ten_bang);
    execute format('drop policy if exists "Admin demo sua %s" on %I', ten_bang, ten_bang);
    execute format('drop policy if exists "Admin demo xoa %s" on %I', ten_bang, ten_bang);

    execute format(
      'create policy "Admin demo doc %s" on %I for select to anon using (true)',
      ten_bang,
      ten_bang
    );

    execute format(
      'create policy "Admin demo them %s" on %I for insert to anon with check (true)',
      ten_bang,
      ten_bang
    );

    execute format(
      'create policy "Admin demo sua %s" on %I for update to anon using (true) with check (true)',
      ten_bang,
      ten_bang
    );

    execute format(
      'create policy "Admin demo xoa %s" on %I for delete to anon using (true)',
      ten_bang,
      ten_bang
    );
  end loop;

  grant usage, select on all sequences in schema public to anon;
end $$;
