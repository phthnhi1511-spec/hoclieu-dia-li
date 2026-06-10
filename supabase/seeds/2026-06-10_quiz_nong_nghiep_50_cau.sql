begin;

do $$
declare
  quiz_id bigint;
  question_id bigint;
begin
  select id
  into quiz_id
  from bai_kiem_tra
  where chu_de_id = 1
    and tieu_de = 'Bộ 50 câu trắc nghiệm Nông nghiệp - Địa lí 9'
  order by id desc
  limit 1;

  if quiz_id is not null then
    delete from dap_an_kiem_tra
    where cau_hoi_id in (
      select id
      from cau_hoi_kiem_tra
      where bai_kiem_tra_id = quiz_id
    );

    delete from cau_hoi_kiem_tra
    where bai_kiem_tra_id = quiz_id;

    delete from bai_kiem_tra
    where id = quiz_id;
  end if;

  insert into bai_kiem_tra (
    tieu_de,
    mo_ta,
    chu_de_id,
    thoi_gian_lam_bai_phut,
    da_xuat_ban
  )
  values (
    'Bộ 50 câu trắc nghiệm Nông nghiệp - Địa lí 9',
    'Bộ câu hỏi ôn tập chủ đề nông nghiệp Địa lí 9, có đáp án đúng và giải thích ngắn gọn.',
    1,
    45,
    true
  )
  returning id into quiz_id;

  insert into cau_hoi_kiem_tra (bai_kiem_tra_id, noi_dung_cau_hoi, duong_dan_anh_cau_hoi, giai_thich_dap_an, diem, thu_tu_hien_thi)
  values (quiz_id, '1. Vai trò quan trọng hàng đầu của ngành nông nghiệp ở nước ta là gì?', null, 'Nông nghiệp cung cấp lương thực thực phẩm cho dân cư, đồng thời tạo nguyên liệu cho công nghiệp và hàng hóa xuất khẩu.', 1, 1)
  returning id into question_id;
  insert into dap_an_kiem_tra (cau_hoi_id, noi_dung_dap_an, la_dap_an_dung, thu_tu_hien_thi) values
    (question_id, 'Cung cấp lương thực thực phẩm', true, 1),
    (question_id, 'Khai thác khoáng sản', false, 2),
    (question_id, 'Phát triển giao thông vận tải', false, 3),
    (question_id, 'Sản xuất điện năng', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '2. Điều kiện tự nhiên quan trọng nhất để phát triển trồng lúa nước ở Việt Nam là', null, 'Lúa nước cần khí hậu nóng ẩm, nguồn nước dồi dào và đất phù sa màu mỡ. Đây là nền tảng của sản xuất lúa ở nước ta.', 1, 2);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'đất badan rộng lớn', false, 1),
    (default, question_id, 'khí hậu nóng ẩm và nguồn nước phong phú', true, 2),
    (default, question_id, 'địa hình núi cao hiểm trở', false, 3),
    (default, question_id, 'mùa đông lạnh kéo dài', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '3. Vùng sản xuất lúa lớn nhất cả nước là', null, 'Đồng bằng sông Cửu Long có diện tích rộng, đất phù sa màu mỡ, khí hậu nóng ẩm quanh năm và mạng lưới sông ngòi kênh rạch dày đặc.', 1, 3);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Đồng bằng sông Hồng', false, 1),
    (default, question_id, 'Đồng bằng sông Cửu Long', true, 2),
    (default, question_id, 'Trung du và miền núi Bắc Bộ', false, 3),
    (default, question_id, 'Duyên hải Nam Trung Bộ', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '4. Cây công nghiệp lâu năm tiêu biểu nhất của Tây Nguyên là', null, 'Tây Nguyên có đất badan rộng lớn, khí hậu cận xích đạo thích hợp cho cà phê, đặc biệt là cà phê vối.', 1, 4);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Cà phê', true, 1),
    (default, question_id, 'Lúa gạo', false, 2),
    (default, question_id, 'Đay', false, 3),
    (default, question_id, 'Thuốc lá', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '5. Vùng chuyên canh cao su lớn nhất nước ta là', null, 'Đông Nam Bộ có diện tích đất badan và đất xám lớn, khí hậu cận xích đạo nóng ẩm, thuận lợi cho cây cao su.', 1, 5);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Đồng bằng sông Hồng', false, 1),
    (default, question_id, 'Đông Nam Bộ', true, 2),
    (default, question_id, 'Bắc Trung Bộ', false, 3),
    (default, question_id, 'Tây Bắc', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '6. Trong cơ cấu giá trị sản xuất nông nghiệp, ngành nào hiện vẫn chiếm tỉ trọng lớn nhất?', null, 'Ở nước ta, trồng trọt vẫn giữ vai trò chủ đạo trong cơ cấu nông nghiệp, dù chăn nuôi đang tăng nhanh.', 1, 6);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Lâm nghiệp', false, 1),
    (default, question_id, 'Ngư nghiệp', false, 2),
    (default, question_id, 'Trồng trọt', true, 3),
    (default, question_id, 'Chăn nuôi', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '7. Vụ đông phát triển mạnh nhất ở vùng nào?', null, 'Đồng bằng sông Hồng có mùa đông lạnh tương đối rõ, thuận lợi để trồng rau màu và cây vụ đông.', 1, 7);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Tây Nguyên', false, 1),
    (default, question_id, 'Đông Nam Bộ', false, 2),
    (default, question_id, 'Đồng bằng sông Hồng', true, 3),
    (default, question_id, 'Đồng bằng sông Cửu Long', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '8. Cây chè được trồng nhiều nhất ở', null, 'Cây chè thích hợp với khí hậu mát và địa hình đồi núi. Trung du và miền núi Bắc Bộ là vùng trồng chè nổi bật nhất.', 1, 8);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Đồng bằng sông Hồng', false, 1),
    (default, question_id, 'Trung du và miền núi Bắc Bộ', true, 2),
    (default, question_id, 'Đồng bằng sông Cửu Long', false, 3),
    (default, question_id, 'Duyên hải Nam Trung Bộ', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '9. Điều kiện nổi bật nhất để phát triển cây công nghiệp lâu năm ở nước ta là', null, 'Nhiều cây công nghiệp lâu năm phát triển tốt trên đất feralit, đặc biệt là đất badan, kết hợp với khí hậu nhiệt đới ẩm.', 1, 9);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'đất feralit và đất badan', true, 1),
    (default, question_id, 'khí hậu ôn đới lạnh', false, 2),
    (default, question_id, 'địa hình núi cao băng tuyết', false, 3),
    (default, question_id, 'thiếu nước quanh năm', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '10. Khó khăn lớn đối với chăn nuôi nước ta hiện nay là', null, 'Dịch bệnh diễn biến phức tạp làm giảm đàn vật nuôi, tăng chi phí sản xuất và rủi ro cho người chăn nuôi.', 1, 10);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'thiếu lao động', false, 1),
    (default, question_id, 'dịch bệnh', true, 2),
    (default, question_id, 'thiếu biển', false, 3),
    (default, question_id, 'không có thị trường', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '11. Chăn nuôi lợn và gia cầm tập trung nhiều ở đồng bằng vì', null, 'Đồng bằng dân cư đông, thị trường tiêu thụ lớn, nguồn thức ăn dồi dào và cơ sở chế biến phát triển hơn.', 1, 11);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'ít dân, ít thị trường', false, 1),
    (default, question_id, 'nhiều đồng cỏ tự nhiên', false, 2),
    (default, question_id, 'thị trường tiêu thụ lớn và nguồn thức ăn phong phú', true, 3),
    (default, question_id, 'khí hậu ôn đới mát lạnh', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '12. Vật nuôi thích hợp nhất với vùng trung du và miền núi Bắc Bộ là', null, 'Trâu được nuôi nhiều ở trung du và miền núi Bắc Bộ nhờ địa hình đồi núi, đồng cỏ và nhu cầu sức kéo.', 1, 12);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Trâu', true, 1),
    (default, question_id, 'Tôm sú', false, 2),
    (default, question_id, 'Bò sữa', false, 3),
    (default, question_id, 'Gia cầm công nghiệp', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '13. Bò sữa ở nước ta phát triển mạnh nhất ở những nơi', null, 'Bò sữa cần gần thị trường tiêu thụ, cơ sở chế biến và nguồn thức ăn ổn định nên tập trung quanh các đô thị lớn.', 1, 13);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'gần các thành phố lớn', true, 1),
    (default, question_id, 'giữa sa mạc khô nóng', false, 2),
    (default, question_id, 'ngoài khơi xa bờ', false, 3),
    (default, question_id, 'đỉnh núi cao quanh năm lạnh giá', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '14. Điều kiện thuận lợi nổi bật để phát triển ngành thủy sản nước ta là', null, 'Nước ta có bờ biển dài, nhiều ngư trường, hệ thống sông ngòi, ao hồ, đầm phá và vùng nước lợ rộng.', 1, 14);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'bờ biển dài và vùng nước phong phú', true, 1),
    (default, question_id, 'ít sông ngòi và đầm phá', false, 2),
    (default, question_id, 'thiếu nguồn lợi hải sản', false, 3),
    (default, question_id, 'không có thị trường xuất khẩu', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '15. Vùng nuôi trồng thủy sản lớn nhất cả nước là', null, 'Đồng bằng sông Cửu Long có diện tích mặt nước lớn, nhiều sông rạch, vùng nước lợ rộng, thuận lợi cho nuôi trồng thủy sản.', 1, 15);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Bắc Trung Bộ', false, 1),
    (default, question_id, 'Đồng bằng sông Cửu Long', true, 2),
    (default, question_id, 'Tây Nguyên', false, 3),
    (default, question_id, 'Tây Bắc', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '16. Lâm nghiệp bao gồm hoạt động chủ yếu nào sau đây?', null, 'Lâm nghiệp không chỉ khai thác mà còn bao gồm trồng, chăm sóc và bảo vệ rừng.', 1, 16);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Trồng, chăm sóc, bảo vệ và khai thác rừng', true, 1),
    (default, question_id, 'Chỉ chặt gỗ tự nhiên', false, 2),
    (default, question_id, 'Chỉ nuôi gia súc lớn', false, 3),
    (default, question_id, 'Chỉ xây dựng thủy điện', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '17. Loại rừng có vai trò bảo vệ môi trường sinh thái là', null, 'Rừng phòng hộ có chức năng chắn gió, giữ đất, giữ nước, hạn chế xói mòn và lũ lụt.', 1, 17);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Rừng sản xuất', false, 1),
    (default, question_id, 'Rừng phòng hộ', true, 2),
    (default, question_id, 'Rừng đặc sản', false, 3),
    (default, question_id, 'Rừng trồng ngắn ngày', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '18. Nguyên nhân chủ yếu làm suy giảm tài nguyên rừng nước ta là', null, 'Khai thác quá mức và phá rừng bừa bãi là nguyên nhân chính làm suy giảm diện tích và chất lượng rừng.', 1, 18);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'khai thác và phá rừng bừa bãi', true, 1),
    (default, question_id, 'mở rộng đánh bắt xa bờ', false, 2),
    (default, question_id, 'phát triển vụ đông', false, 3),
    (default, question_id, 'chăn nuôi bò sữa', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '19. Biện pháp quan trọng để nâng cao giá trị nông sản là', null, 'Đẩy mạnh chế biến và xây dựng vùng chuyên canh giúp tăng giá trị sản phẩm và khả năng cạnh tranh.', 1, 19);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'giảm đầu tư cho chế biến', false, 1),
    (default, question_id, 'tăng xuất khẩu khoáng sản', false, 2),
    (default, question_id, 'đẩy mạnh công nghiệp chế biến', true, 3),
    (default, question_id, 'thu hẹp thị trường tiêu thụ', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '20. Đặc điểm nổi bật của nền nông nghiệp hàng hóa là', null, 'Nông nghiệp hàng hóa sản xuất theo nhu cầu thị trường, gắn với chuyên môn hóa và hiệu quả kinh tế.', 1, 20);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'sản xuất khép kín, tự cấp tự túc là chủ yếu', false, 1),
    (default, question_id, 'gắn chặt với thị trường', true, 2),
    (default, question_id, 'không cần cơ giới hóa', false, 3),
    (default, question_id, 'không cần thâm canh', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '21. Ở nước ta, mùa khô kéo dài gây khó khăn lớn nhất cho sản xuất nông nghiệp là', null, 'Mùa khô thiếu nước tưới, làm giảm năng suất cây trồng và gây khó khăn cho chăn nuôi, nuôi trồng thủy sản.', 1, 21);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'thiếu nước tưới', true, 1),
    (default, question_id, 'thừa nước quanh năm', false, 2),
    (default, question_id, 'đóng băng diện rộng', false, 3),
    (default, question_id, 'không có ánh sáng mặt trời', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '22. Loại đất thích hợp nhất cho cây công nghiệp lâu năm như cà phê, cao su là', null, 'Đất badan tơi xốp, giàu dinh dưỡng, thoát nước tốt nên rất thích hợp với nhiều cây công nghiệp lâu năm.', 1, 22);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'đất mặn ven biển', false, 1),
    (default, question_id, 'đất badan', true, 2),
    (default, question_id, 'đất phèn ngập nước', false, 3),
    (default, question_id, 'đất cát khô hạn', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '23. Đồng bằng sông Hồng có trình độ thâm canh lúa cao chủ yếu do', null, 'Vùng có dân đông, kinh nghiệm thâm canh lâu đời, cơ sở thủy lợi tốt và thị trường tiêu thụ lớn.', 1, 23);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'ít lao động và ít vốn', false, 1),
    (default, question_id, 'thủy lợi tốt và trình độ thâm canh cao', true, 2),
    (default, question_id, 'khí hậu lạnh quanh năm', false, 3),
    (default, question_id, 'diện tích lớn hơn ĐBSCL', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '24. Cây điều được trồng nhiều ở', null, 'Điều là cây công nghiệp phù hợp với khí hậu khô hơn và đất xám, phát triển mạnh ở Đông Nam Bộ.', 1, 24);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Đông Nam Bộ', true, 1),
    (default, question_id, 'Đồng bằng sông Hồng', false, 2),
    (default, question_id, 'Tây Bắc', false, 3),
    (default, question_id, 'Bắc Trung Bộ', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '25. Vùng trồng hồ tiêu nổi bật hiện nay là', null, 'Hồ tiêu được trồng nhiều ở Tây Nguyên và Đông Nam Bộ, trong đó Tây Nguyên là vùng nổi bật.', 1, 25);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Tây Nguyên', true, 1),
    (default, question_id, 'Đồng bằng sông Hồng', false, 2),
    (default, question_id, 'Tây Bắc', false, 3),
    (default, question_id, 'Bắc Trung Bộ', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '26. Nhân tố làm cho chăn nuôi ngày càng chiếm tỉ trọng cao hơn trong nông nghiệp là', null, 'Nhu cầu thị trường tăng, nguồn thức ăn được cải thiện và áp dụng tiến bộ kĩ thuật thúc đẩy chăn nuôi phát triển.', 1, 26);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'nhu cầu thực phẩm tăng và nguồn thức ăn tốt hơn', true, 1),
    (default, question_id, 'đất trồng lúa giảm hoàn toàn', false, 2),
    (default, question_id, 'mưa tuyết nhiều hơn', false, 3),
    (default, question_id, 'đánh bắt xa bờ phát triển', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '27. Mô hình VAC trong nông nghiệp có ý nghĩa chủ yếu là', null, 'VAC giúp tận dụng tổng hợp đất, nước, chất thải và tạo hiệu quả kinh tế cao trong hộ nông dân.', 1, 27);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'tận dụng tổng hợp nguồn lực trong sản xuất', true, 1),
    (default, question_id, 'chỉ phát triển công nghiệp nặng', false, 2),
    (default, question_id, 'chỉ trồng rừng phòng hộ', false, 3),
    (default, question_id, 'giảm hoàn toàn chăn nuôi', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '28. Một trong những khó khăn lớn đối với ngành thủy sản nước ta là', null, 'Nguồn lợi thủy sản tự nhiên giảm, môi trường bị ô nhiễm và thiên tai diễn biến phức tạp gây nhiều khó khăn cho sản xuất.', 1, 28);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'nguồn lợi suy giảm và môi trường ô nhiễm', true, 1),
    (default, question_id, 'không có biển', false, 2),
    (default, question_id, 'không có người lao động', false, 3),
    (default, question_id, 'thiếu hoàn toàn thị trường trong nước', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '29. Sự đa dạng của cây trồng vật nuôi ở nước ta chủ yếu do', null, 'Khí hậu nhiệt đới ẩm gió mùa phân hóa theo không gian và thời gian tạo điều kiện đa dạng hóa sản xuất nông nghiệp.', 1, 29);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'khí hậu nhiệt đới ẩm gió mùa phân hóa', true, 1),
    (default, question_id, 'lãnh thổ hẹp ngang và khô hạn', false, 2),
    (default, question_id, 'ít loại đất', false, 3),
    (default, question_id, 'mùa đông quá dài trên cả nước', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '30. Mục tiêu quan trọng của nông nghiệp nước ta hiện nay là', null, 'Nông nghiệp cần hướng tới sản xuất hàng hóa, hiệu quả cao và phát triển bền vững.', 1, 30);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'sản xuất hàng hóa bền vững', true, 1),
    (default, question_id, 'chỉ đủ ăn trong từng hộ', false, 2),
    (default, question_id, 'giảm hoàn toàn xuất khẩu', false, 3),
    (default, question_id, 'bỏ hết cây công nghiệp', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '31. Cây lương thực quan trọng nhất ở nước ta là', null, 'Lúa gạo là cây lương thực chính, giữ vai trò lớn trong bảo đảm an ninh lương thực và xuất khẩu.', 1, 31);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Lúa', true, 1),
    (default, question_id, 'Cà phê', false, 2),
    (default, question_id, 'Cao su', false, 3),
    (default, question_id, 'Hồ tiêu', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '32. Cây công nghiệp hàng năm tiêu biểu của nước ta là', null, 'Mía, lạc, đậu tương, thuốc lá là những cây công nghiệp hàng năm. Trong đó mía là ví dụ rất tiêu biểu.', 1, 32);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Mía', true, 1),
    (default, question_id, 'Cà phê', false, 2),
    (default, question_id, 'Cao su', false, 3),
    (default, question_id, 'Chè cổ thụ', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '33. Phát triển cây ăn quả ở nước ta có điều kiện thuận lợi nhờ', null, 'Khí hậu nhiệt đới ẩm và sự phân hóa khí hậu, đất đai phong phú giúp cây ăn quả phát triển đa dạng ở nhiều vùng.', 1, 33);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'đất và khí hậu phong phú, đa dạng', true, 1),
    (default, question_id, 'thiếu nước quanh năm', false, 2),
    (default, question_id, 'ít ánh sáng mặt trời', false, 3),
    (default, question_id, 'không có thị trường nội địa', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '34. Chăn nuôi gia cầm phát triển mạnh ở các vùng đồng bằng chủ yếu do', null, 'Đồng bằng có nguồn thức ăn từ phụ phẩm nông nghiệp, thị trường tiêu thụ rộng và giao thông thuận lợi.', 1, 34);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'thị trường lớn và nguồn thức ăn dồi dào', true, 1),
    (default, question_id, 'nhiều đồng cỏ tự nhiên rộng lớn', false, 2),
    (default, question_id, 'nhiệt độ thấp quanh năm', false, 3),
    (default, question_id, 'ít dân cư, ít đô thị', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '35. Thuận lợi lớn nhất cho đánh bắt hải sản của nước ta là', null, 'Biển rộng, bờ biển dài và có nhiều ngư trường lớn là lợi thế rất quan trọng cho hoạt động đánh bắt hải sản.', 1, 35);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'ngư trường rộng và nguồn hải sản phong phú', true, 1),
    (default, question_id, 'không có bão', false, 2),
    (default, question_id, 'nước biển luôn yên tĩnh', false, 3),
    (default, question_id, 'chỉ có một cảng cá lớn', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '36. Một ngư trường trọng điểm của nước ta là', null, 'Các ngư trường trọng điểm gồm Hải Phòng - Quảng Ninh, Hoàng Sa - Trường Sa, Ninh Thuận - Bình Thuận - Bà Rịa Vũng Tàu, Cà Mau - Kiên Giang.', 1, 36);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Cà Mau - Kiên Giang', true, 1),
    (default, question_id, 'Sa Pa - Mộc Châu', false, 2),
    (default, question_id, 'Pleiku - Kon Tum', false, 3),
    (default, question_id, 'Hà Nội - Bắc Ninh', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '37. Rừng sản xuất có chức năng chủ yếu là', null, 'Rừng sản xuất chủ yếu cung cấp gỗ, nguyên liệu giấy, nhựa, dược liệu và nhiều lâm sản khác.', 1, 37);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'cung cấp lâm sản và nguyên liệu', true, 1),
    (default, question_id, 'bảo tồn động thực vật quý hiếm là chính', false, 2),
    (default, question_id, 'chắn sóng ven biển là chính', false, 3),
    (default, question_id, 'phục vụ quốc phòng là chính', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '38. Ý nghĩa nổi bật của công trình thủy lợi trong nông nghiệp là', null, 'Thủy lợi giúp tưới tiêu chủ động, chống úng, chống hạn, thau chua rửa mặn và ổn định sản xuất.', 1, 38);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'chủ động nước tưới và tiêu úng', true, 1),
    (default, question_id, 'làm giảm hoàn toàn thiên tai', false, 2),
    (default, question_id, 'thay thế toàn bộ phân bón', false, 3),
    (default, question_id, 'thay thế lao động nông thôn', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '39. Chuyển dịch cơ cấu mùa vụ trong trồng trọt nhằm mục đích chủ yếu là', null, 'Chuyển dịch mùa vụ nhằm khai thác tốt hơn điều kiện tự nhiên, tăng vụ, tăng năng suất và hiệu quả sản xuất.', 1, 39);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'tăng hiệu quả sử dụng đất và tăng vụ', true, 1),
    (default, question_id, 'giảm diện tích canh tác xuống thấp nhất', false, 2),
    (default, question_id, 'chỉ trồng một loại cây quanh năm', false, 3),
    (default, question_id, 'loại bỏ hoàn toàn cây lương thực', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '40. Mặt hàng nông sản xuất khẩu quan trọng của nước ta là', null, 'Nước ta xuất khẩu nhiều nông sản như gạo, cà phê, cao su, điều, hồ tiêu. Gạo là một mặt hàng tiêu biểu.', 1, 40);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Gạo', true, 1),
    (default, question_id, 'Than đá', false, 2),
    (default, question_id, 'Quặng sắt', false, 3),
    (default, question_id, 'Điện năng', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '41. Vùng cây ăn quả lớn của nước ta hiện nay là', null, 'Nam Bộ, nhất là Đồng bằng sông Cửu Long, có điều kiện thuận lợi để phát triển nhiều loại cây ăn quả nhiệt đới.', 1, 41);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Đồng bằng sông Cửu Long', true, 1),
    (default, question_id, 'Tây Bắc lạnh giá', false, 2),
    (default, question_id, 'Hoàng Liên Sơn', false, 3),
    (default, question_id, 'Cao nguyên đá Đồng Văn', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '42. Đồng bằng sông Cửu Long là vùng trọng điểm lương thực số 1 vì', null, 'Vùng có diện tích lớn, đất phù sa màu mỡ, khí hậu nóng ẩm và hệ thống sông ngòi chằng chịt, thuận lợi cho sản xuất lúa.', 1, 42);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'diện tích rộng, đất phù sa, nước dồi dào', true, 1),
    (default, question_id, 'có mùa đông lạnh sâu', false, 2),
    (default, question_id, 'địa hình núi cao hiểm trở', false, 3),
    (default, question_id, 'ít sông ngòi và kênh rạch', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '43. Cây mía được trồng nhiều để cung cấp nguyên liệu cho ngành', null, 'Mía là nguyên liệu chính cho công nghiệp chế biến đường.', 1, 43);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'chế biến đường', true, 1),
    (default, question_id, 'luyện kim', false, 2),
    (default, question_id, 'điện tử', false, 3),
    (default, question_id, 'khai thác dầu khí', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '44. Biện pháp quan trọng để nâng cao hiệu quả chăn nuôi là', null, 'Muốn chăn nuôi phát triển hiệu quả cần cải tạo giống, phát triển thức ăn công nghiệp và làm tốt công tác thú y.', 1, 44);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'cải tạo giống và tăng cường thú y', true, 1),
    (default, question_id, 'giảm chăm sóc vật nuôi', false, 2),
    (default, question_id, 'không tiêm phòng dịch', false, 3),
    (default, question_id, 'chỉ nuôi nhỏ lẻ tự phát', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '45. Nuôi trồng thủy sản nước ta phát triển mạnh chủ yếu do', null, 'Diện tích mặt nước rộng, nhu cầu thị trường lớn và xuất khẩu thuận lợi là những yếu tố thúc đẩy nuôi trồng thủy sản.', 1, 45);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'mặt nước rộng và thị trường tiêu thụ lớn', true, 1),
    (default, question_id, 'không cần kĩ thuật', false, 2),
    (default, question_id, 'không chịu tác động của thời tiết', false, 3),
    (default, question_id, 'ít lao động hơn mọi ngành khác', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '46. Tác động rõ nhất của công nghiệp hóa, hiện đại hóa nông nghiệp là', null, 'Nông nghiệp ngày càng cơ giới hóa, thủy lợi hóa, áp dụng giống mới và kĩ thuật tiên tiến.', 1, 46);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'cơ giới hóa và áp dụng kĩ thuật mới', true, 1),
    (default, question_id, 'xóa bỏ hoàn toàn trồng trọt', false, 2),
    (default, question_id, 'không cần thủy lợi', false, 3),
    (default, question_id, 'phụ thuộc hơn vào thời tiết', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '47. Hình thức tổ chức lãnh thổ nông nghiệp tiêu biểu trong nền nông nghiệp hàng hóa là', null, 'Vùng chuyên canh và trang trại là các hình thức tiêu biểu của sản xuất nông nghiệp hàng hóa.', 1, 47);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'vùng chuyên canh', true, 1),
    (default, question_id, 'xưởng luyện kim', false, 2),
    (default, question_id, 'đặc khu kinh tế biển', false, 3),
    (default, question_id, 'khu công nghệ cao điện tử', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '48. Kinh tế trang trại phát triển khá mạnh ở', null, 'Kinh tế trang trại phát triển ở nhiều nơi, trong đó Đông Nam Bộ, Tây Nguyên và Đồng bằng sông Cửu Long là những vùng nổi bật.', 1, 48);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'Đông Nam Bộ, Tây Nguyên, Đồng bằng sông Cửu Long', true, 1),
    (default, question_id, 'chỉ ở vùng núi cao băng tuyết', false, 2),
    (default, question_id, 'chỉ ở các đảo xa bờ', false, 3),
    (default, question_id, 'chỉ ở khu công nghiệp nặng', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '49. Nhân tố kinh tế xã hội có vai trò rất quan trọng đối với phát triển nông nghiệp hàng hóa là', null, 'Thị trường định hướng sản xuất, quyết định quy mô, cơ cấu và hiệu quả của nông nghiệp hàng hóa.', 1, 49);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'thị trường tiêu thụ', true, 1),
    (default, question_id, 'núi cao hiểm trở', false, 2),
    (default, question_id, 'băng tuyết quanh năm', false, 3),
    (default, question_id, 'thủy triều lên xuống hằng ngày', false, 4);

  insert into cau_hoi_kiem_tra values (default, quiz_id, '50. Phát triển nông nghiệp bền vững ở nước ta cần gắn với', null, 'Nông nghiệp bền vững phải đi đôi với bảo vệ đất, nước, rừng, môi trường và sử dụng hợp lí tài nguyên.', 1, 50);
  select currval(pg_get_serial_sequence('cau_hoi_kiem_tra','id')) into question_id;
  insert into dap_an_kiem_tra values
    (default, question_id, 'bảo vệ tài nguyên và môi trường', true, 1),
    (default, question_id, 'khai thác kiệt quệ đất và nước', false, 2),
    (default, question_id, 'phá rừng để mở rộng diện tích', false, 3),
    (default, question_id, 'giảm hoàn toàn công nghệ mới', false, 4);
end $$;

commit;
