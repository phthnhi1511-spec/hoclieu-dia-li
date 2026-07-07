-- SQL seed dữ liệu cho trang Hướng dẫn sử dụng
insert into public.cau_hinh_website (khoa_cau_hinh, gia_tri_cau_hinh)
values
  ('guide_page_title', 'Hướng dẫn sử dụng website Học liệu số Địa lí 9'),
  ('guide_page_content', 'Chào mừng bạn đến với website học liệu số hỗ trợ dạy và học Địa lí 9! Website được thiết kế trực quan nhằm giúp học sinh tự học và giáo viên dễ dàng khai thác tài nguyên học liệu số Địa lí Kinh tế Việt Nam.')
on conflict (khoa_cau_hinh) do nothing;

insert into public.cau_hinh_website (khoa_cau_hinh, gia_tri_cau_hinh)
values
  ('guide_page_file', null)
on conflict (khoa_cau_hinh) do nothing;
