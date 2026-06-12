alter table if exists vung_kinh_te
  add column if not exists danh_sach_tinh text,
  add column if not exists dien_tich_km2 numeric,
  add column if not exists dan_so numeric,
  add column if not exists mat_do_dan_so numeric,
  add column if not exists the_manh_tu_nhien text,
  add column if not exists the_manh_nhan_luc text;

update vung_kinh_te
set
  ten_vung = 'Trung du và miền núi phía Bắc',
  danh_sach_tinh = E'Cao Bằng\nTuyên Quang\nLào Cai\nThái Nguyên\nLạng Sơn\nPhú Thọ\nĐiện Biên\nLai Châu\nSơn La',
  mo_ta = 'Vùng có địa hình đồi núi, tài nguyên khoáng sản và thủy điện lớn, giữ vai trò quan trọng về sinh thái và quốc phòng.',
  the_manh_tu_nhien = 'Khoáng sản, rừng, thủy điện, đất feralit và cảnh quan du lịch sinh thái.',
  the_manh_nhan_luc = 'Lực lượng lao động nông - lâm nghiệp dồi dào, kinh nghiệm sản xuất vùng cao.',
  thanh_pho_tieu_bieu = 'Lào Cai, Thái Nguyên, Việt Trì, Sơn La',
  thu_tu_hien_thi = 1,
  da_xuat_ban = true
where duong_dan = 'trung-du-va-mien-nui-phia-bac';

insert into vung_kinh_te (
  ten_vung,
  duong_dan,
  danh_sach_tinh,
  mo_ta,
  the_manh_tu_nhien,
  the_manh_nhan_luc,
  thanh_pho_tieu_bieu,
  thu_tu_hien_thi,
  da_xuat_ban
)
select
  'Trung du và miền núi phía Bắc',
  'trung-du-va-mien-nui-phia-bac',
  E'Cao Bằng\nTuyên Quang\nLào Cai\nThái Nguyên\nLạng Sơn\nPhú Thọ\nĐiện Biên\nLai Châu\nSơn La',
  'Vùng có địa hình đồi núi, tài nguyên khoáng sản và thủy điện lớn, giữ vai trò quan trọng về sinh thái và quốc phòng.',
  'Khoáng sản, rừng, thủy điện, đất feralit và cảnh quan du lịch sinh thái.',
  'Lực lượng lao động nông - lâm nghiệp dồi dào, kinh nghiệm sản xuất vùng cao.',
  'Lào Cai, Thái Nguyên, Việt Trì, Sơn La',
  1,
  true
where not exists (
  select 1 from vung_kinh_te where duong_dan = 'trung-du-va-mien-nui-phia-bac'
);

update vung_kinh_te
set
  ten_vung = 'Đồng bằng sông Hồng',
  danh_sach_tinh = E'Hà Nội\nBắc Ninh\nQuảng Ninh\nHải Phòng\nHưng Yên\nNinh Bình',
  mo_ta = 'Vùng phát triển sớm, hạ tầng dày đặc, tập trung các trung tâm công nghiệp, dịch vụ, logistics và giáo dục lớn.',
  the_manh_tu_nhien = 'Đồng bằng phù sa màu mỡ, hệ thống sông ngòi và cảng biển.',
  the_manh_nhan_luc = 'Dân cư đông, tay nghề cao, thị trường lớn, cơ sở đào tạo tập trung.',
  thanh_pho_tieu_bieu = 'Hà Nội, Hải Phòng, Hạ Long, Bắc Ninh',
  thu_tu_hien_thi = 2,
  da_xuat_ban = true
where duong_dan = 'dong-bang-song-hong';

insert into vung_kinh_te (
  ten_vung,
  duong_dan,
  danh_sach_tinh,
  mo_ta,
  the_manh_tu_nhien,
  the_manh_nhan_luc,
  thanh_pho_tieu_bieu,
  thu_tu_hien_thi,
  da_xuat_ban
)
select
  'Đồng bằng sông Hồng',
  'dong-bang-song-hong',
  E'Hà Nội\nBắc Ninh\nQuảng Ninh\nHải Phòng\nHưng Yên\nNinh Bình',
  'Vùng phát triển sớm, hạ tầng dày đặc, tập trung các trung tâm công nghiệp, dịch vụ, logistics và giáo dục lớn.',
  'Đồng bằng phù sa màu mỡ, hệ thống sông ngòi và cảng biển.',
  'Dân cư đông, tay nghề cao, thị trường lớn, cơ sở đào tạo tập trung.',
  'Hà Nội, Hải Phòng, Hạ Long, Bắc Ninh',
  2,
  true
where not exists (
  select 1 from vung_kinh_te where duong_dan = 'dong-bang-song-hong'
);

update vung_kinh_te
set
  ten_vung = 'Bắc Trung Bộ',
  danh_sach_tinh = E'Thanh Hóa\nNghệ An\nHà Tĩnh\nQuảng Trị\nHuế',
  mo_ta = 'Vùng cầu nối Bắc - Nam, có kinh tế biển, công nghiệp năng lượng và nông nghiệp đa dạng theo dải lãnh thổ kéo dài.',
  the_manh_tu_nhien = 'Biển, rừng, khoáng sản, bãi biển và đầm phá.',
  the_manh_nhan_luc = 'Nguồn lao động dồi dào, truyền thống sản xuất và thương mại lâu đời.',
  thanh_pho_tieu_bieu = 'Thanh Hóa, Vinh, Hà Tĩnh, Huế',
  thu_tu_hien_thi = 3,
  da_xuat_ban = true
where duong_dan = 'bac-trung-bo';

insert into vung_kinh_te (
  ten_vung,
  duong_dan,
  danh_sach_tinh,
  mo_ta,
  the_manh_tu_nhien,
  the_manh_nhan_luc,
  thanh_pho_tieu_bieu,
  thu_tu_hien_thi,
  da_xuat_ban
)
select
  'Bắc Trung Bộ',
  'bac-trung-bo',
  E'Thanh Hóa\nNghệ An\nHà Tĩnh\nQuảng Trị\nHuế',
  'Vùng cầu nối Bắc - Nam, có kinh tế biển, công nghiệp năng lượng và nông nghiệp đa dạng theo dải lãnh thổ kéo dài.',
  'Biển, rừng, khoáng sản, bãi biển và đầm phá.',
  'Nguồn lao động dồi dào, truyền thống sản xuất và thương mại lâu đời.',
  'Thanh Hóa, Vinh, Hà Tĩnh, Huế',
  3,
  true
where not exists (
  select 1 from vung_kinh_te where duong_dan = 'bac-trung-bo'
);

update vung_kinh_te
set
  ten_vung = 'Nam Trung Bộ',
  danh_sach_tinh = E'Đà Nẵng\nQuảng Ngãi\nKhánh Hòa\nGia Lai\nĐắk Lắk\nLâm Đồng',
  mo_ta = 'Nhóm tỉnh có thế mạnh kinh tế biển, du lịch, cảng nước sâu và các cực tăng trưởng ven biển - cao nguyên liên kết chặt chẽ.',
  the_manh_tu_nhien = 'Biển, cảng, du lịch, cao nguyên bazan, thủy điện và nông nghiệp hàng hóa.',
  the_manh_nhan_luc = 'Lao động dịch vụ - du lịch tăng nhanh, khả năng liên kết vùng tốt.',
  thanh_pho_tieu_bieu = 'Đà Nẵng, Nha Trang, Quảng Ngãi, Pleiku, Buôn Ma Thuột, Đà Lạt',
  thu_tu_hien_thi = 4,
  da_xuat_ban = true
where duong_dan = 'nam-trung-bo';

insert into vung_kinh_te (
  ten_vung,
  duong_dan,
  danh_sach_tinh,
  mo_ta,
  the_manh_tu_nhien,
  the_manh_nhan_luc,
  thanh_pho_tieu_bieu,
  thu_tu_hien_thi,
  da_xuat_ban
)
select
  'Nam Trung Bộ',
  'nam-trung-bo',
  E'Đà Nẵng\nQuảng Ngãi\nKhánh Hòa\nGia Lai\nĐắk Lắk\nLâm Đồng',
  'Nhóm tỉnh có thế mạnh kinh tế biển, du lịch, cảng nước sâu và các cực tăng trưởng ven biển - cao nguyên liên kết chặt chẽ.',
  'Biển, cảng, du lịch, cao nguyên bazan, thủy điện và nông nghiệp hàng hóa.',
  'Lao động dịch vụ - du lịch tăng nhanh, khả năng liên kết vùng tốt.',
  'Đà Nẵng, Nha Trang, Quảng Ngãi, Pleiku, Buôn Ma Thuột, Đà Lạt',
  4,
  true
where not exists (
  select 1 from vung_kinh_te where duong_dan = 'nam-trung-bo'
);

update vung_kinh_te
set
  ten_vung = 'Đông Nam Bộ',
  danh_sach_tinh = E'Tây Ninh\nĐồng Nai\nHồ Chí Minh',
  mo_ta = 'Vùng động lực kinh tế lớn nhất cả nước, nổi bật về công nghiệp, dịch vụ, tài chính và logistics.',
  the_manh_tu_nhien = 'Vị trí giao thương quốc tế, cảng biển, đất bazan và hệ thống giao thông phát triển.',
  the_manh_nhan_luc = 'Lao động kỹ thuật cao, thị trường tiêu thụ rộng, sức hút đầu tư mạnh.',
  thanh_pho_tieu_bieu = 'Hồ Chí Minh, Biên Hòa, Thủ Dầu Một, Vũng Tàu, Tây Ninh',
  thu_tu_hien_thi = 5,
  da_xuat_ban = true
where duong_dan = 'dong-nam-bo';

insert into vung_kinh_te (
  ten_vung,
  duong_dan,
  danh_sach_tinh,
  mo_ta,
  the_manh_tu_nhien,
  the_manh_nhan_luc,
  thanh_pho_tieu_bieu,
  thu_tu_hien_thi,
  da_xuat_ban
)
select
  'Đông Nam Bộ',
  'dong-nam-bo',
  E'Tây Ninh\nĐồng Nai\nHồ Chí Minh',
  'Vùng động lực kinh tế lớn nhất cả nước, nổi bật về công nghiệp, dịch vụ, tài chính và logistics.',
  'Vị trí giao thương quốc tế, cảng biển, đất bazan và hệ thống giao thông phát triển.',
  'Lao động kỹ thuật cao, thị trường tiêu thụ rộng, sức hút đầu tư mạnh.',
  'Hồ Chí Minh, Biên Hòa, Thủ Dầu Một, Vũng Tàu, Tây Ninh',
  5,
  true
where not exists (
  select 1 from vung_kinh_te where duong_dan = 'dong-nam-bo'
);

update vung_kinh_te
set
  ten_vung = 'Đồng bằng sông Cửu Long',
  danh_sach_tinh = E'Vĩnh Long\nĐồng Tháp\nAn Giang\nCần Thơ\nCà Mau',
  mo_ta = 'Vùng trọng điểm lúa gạo, thủy sản và cây ăn quả, có mạng lưới sông ngòi dày đặc và kinh tế nông nghiệp hàng hóa đặc trưng.',
  the_manh_tu_nhien = 'Đất phù sa, sông ngòi chằng chịt, thủy sản nước ngọt và nước lợ.',
  the_manh_nhan_luc = 'Kinh nghiệm sản xuất nông nghiệp - thủy sản, hệ thống chợ đầu mối và logistics nội vùng.',
  thanh_pho_tieu_bieu = 'Cần Thơ, Long Xuyên, Cà Mau, Cao Lãnh, Vĩnh Long',
  thu_tu_hien_thi = 6,
  da_xuat_ban = true
where duong_dan = 'dong-bang-song-cuu-long';

insert into vung_kinh_te (
  ten_vung,
  duong_dan,
  danh_sach_tinh,
  mo_ta,
  the_manh_tu_nhien,
  the_manh_nhan_luc,
  thanh_pho_tieu_bieu,
  thu_tu_hien_thi,
  da_xuat_ban
)
select
  'Đồng bằng sông Cửu Long',
  'dong-bang-song-cuu-long',
  E'Vĩnh Long\nĐồng Tháp\nAn Giang\nCần Thơ\nCà Mau',
  'Vùng trọng điểm lúa gạo, thủy sản và cây ăn quả, có mạng lưới sông ngòi dày đặc và kinh tế nông nghiệp hàng hóa đặc trưng.',
  'Đất phù sa, sông ngòi chằng chịt, thủy sản nước ngọt và nước lợ.',
  'Kinh nghiệm sản xuất nông nghiệp - thủy sản, hệ thống chợ đầu mối và logistics nội vùng.',
  'Cần Thơ, Long Xuyên, Cà Mau, Cao Lãnh, Vĩnh Long',
  6,
  true
where not exists (
  select 1 from vung_kinh_te where duong_dan = 'dong-bang-song-cuu-long'
);
