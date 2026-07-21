-- Thêm 2 cột mới cho bảng học liệu nếu chưa tồn tại
alter table public.hoc_lieu add column if not exists huong_dan_khai_thac text;
alter table public.hoc_lieu add column if not exists cau_hoi_luyen_tap text;

-- Cập nhật dữ liệu mẫu cho các học liệu để kiểm tra giao diện hiển thị
update public.hoc_lieu
set
  huong_dan_khai_thac = 'Đọc tên bảng số liệu để xác định nội dung cần khai thác.
Xác định đơn vị tính của diện tích và sản lượng.
Quan sát số liệu qua các năm, so sánh năm đầu và năm cuối.
Nhận xét sự thay đổi của diện tích gieo trồng và sản lượng lúa.
Giải thích nguyên nhân của sự thay đổi.',
  cau_hoi_luyen_tap = 'Nhận xét sự thay đổi diện tích gieo trồng lúa của nước ta giai đoạn 2000 - 2024. ::: Diện tích gieo trồng lúa nhìn chung có xu hướng giảm nhẹ do chuyển đổi cơ cấu cây trồng và đô thị hóa.
Nhận xét sự thay đổi sản lượng lúa của nước ta giai đoạn 2000 - 2024. ::: Sản lượng lúa tăng liên tục nhờ thâm canh, tăng năng suất và ứng dụng giống lúa mới.
Giải thích vì sao diện tích gieo trồng lúa giảm nhưng sản lượng lúa vẫn tăng. ::: Do năng suất lúa tăng nhanh nhờ tiến bộ khoa học kỹ thuật, phòng trừ sâu bệnh tốt và thủy lợi hoàn thiện.
Theo em, sự thay đổi đó phản ánh điều gì về nền nông nghiệp nước ta? ::: Phản ánh nền nông nghiệp đang chuyển đổi từ phát triển theo chiều rộng sang chiều sâu, nâng cao chất lượng và hiệu quả kinh tế.'
where id in (select id from public.hoc_lieu limit 5);
