import { VIETNAM_34_PROVINCE_OPTIONS } from "./lib/vietnamMap";
import { HOME_CONFIG_KEY_OPTIONS, HOME_SECTION_OPTIONS } from "./lib/homePageContent";

const commonStatusFields = [{ name: "da_xuat_ban", label: "Đã xuất bản", type: "boolean" }];

const GAME_TOPIC_OPTIONS = [
  { label: "Nông nghiệp", value: "Nông nghiệp" },
  { label: "Công nghiệp", value: "Công nghiệp" },
  { label: "Dịch vụ", value: "Dịch vụ" },
  { label: "Lâm nghiệp & Thủy sản", value: "Lâm nghiệp & Thủy sản" },
];

const references = {
  baiKiemTra: {
    entityLabel: "bài kiểm tra",
    labelField: "tieu_de",
    table: "bai_kiem_tra",
  },
  cauHoiKiemTra: {
    entityLabel: "câu hỏi kiểm tra",
    labelField: "noi_dung_cau_hoi",
    table: "cau_hoi_kiem_tra",
  },
  chuDe: { entityLabel: "chủ đề", labelField: "ten_chu_de", table: "chu_de" },
  dapAnKiemTra: {
    entityLabel: "đáp án kiểm tra",
    labelField: "noi_dung_dap_an",
    table: "dap_an_kiem_tra",
  },
  ketQuaKiemTra: {
    descriptionField: "ten_lop",
    entityLabel: "kết quả kiểm tra",
    labelField: "ho_ten_hoc_sinh",
    table: "ket_qua_kiem_tra",
  },
  khaoSat: { entityLabel: "khảo sát", labelField: "tieu_de", table: "khao_sat" },
  loaiHocLieu: {
    entityLabel: "loại học liệu",
    labelField: "ten_loai",
    table: "loai_hoc_lieu",
  },
  hoatDongDayHoc: {
    entityLabel: "hoạt động dạy học",
    labelField: "ten_hoat_dong",
    table: "hoat_dong_day_hoc",
  },
  nguonHocLieu: {
    entityLabel: "nguồn học liệu",
    labelField: "ten_nguon",
    table: "nguon_hoc_lieu",
  },
};

export const adminTables = [
  {
    fields: [
      { name: "ten_chu_de", label: "Tên chủ đề", required: true },
      { name: "duong_dan", label: "Đường dẫn", required: true },
      { name: "mo_ta", label: "Mô tả", type: "textarea" },
      { name: "thu_tu_hien_thi", label: "Thứ tự hiển thị", type: "number" },
      { name: "dang_hien_thi", label: "Đang hiển thị", type: "boolean" },
    ],
    label: "Chủ đề",
    name: "chu_de",
  },
  {
    fields: [
      { name: "ten_loai", label: "Tên loại", required: true },
      { name: "duong_dan", label: "Đường dẫn", required: true },
      { name: "mo_ta", label: "Mô tả", type: "textarea" },
      { name: "thu_tu_hien_thi", label: "Thứ tự hiển thị", type: "number" },
      { name: "dang_hien_thi", label: "Đang hiển thị", type: "boolean" },
    ],
    label: "Loại học liệu",
    name: "loai_hoc_lieu",
  },
  {
    fields: [
      { name: "ten_hoat_dong", label: "Tên hoạt động", required: true },
      { name: "duong_dan", label: "Đường dẫn", required: true },
      { name: "mo_ta", label: "Mô tả", type: "textarea" },
      { name: "thu_tu_hien_thi", label: "Thứ tự hiển thị", type: "number" },
      { name: "dang_hien_thi", label: "Đang hiển thị", type: "boolean" },
    ],
    label: "Hoạt động dạy học",
    name: "hoat_dong_day_hoc",
  },
  {
    fields: [
      { name: "ten_nguon", label: "Tên nguồn", required: true },
      { name: "mo_ta", label: "Mô tả", type: "textarea" },
      { name: "thu_tu_hien_thi", label: "Thứ tự hiển thị", type: "number" },
    ],
    label: "Phân loại nguồn học liệu",
    name: "nguon_hoc_lieu",
  },
  {
    fields: [
      { name: "tieu_de", label: "Tiêu đề", required: true },
      { name: "mo_ta", label: "Yêu cầu cần đạt", type: "textarea" },
      { name: "chu_de_id", label: "Chủ đề", reference: references.chuDe, type: "number" },
      {
        name: "loai_hoc_lieu_id",
        label: "Loại học liệu",
        reference: references.loaiHocLieu,
        type: "number",
      },
      {
        name: "hoat_dong_day_hoc_id",
        label: "Hoạt động dạy học",
        reference: references.hoatDongDayHoc,
        type: "number",
      },
      {
        name: "nguon_hoc_lieu_id",
        label: "Nguồn học liệu",
        reference: references.nguonHocLieu,
        type: "number",
      },
      {
        name: "duong_dan_file",
        label: "File hoặc link học liệu",
        required: true,
        upload: {
          accept: ".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.zip,.rar,.mp4,.mp3,.png,.jpg,.jpeg",
          functionName: "r2-presign-upload",
          helperText:
            "Chọn file để tải lên Cloudflare R2. Nếu là phiếu học tập hoặc tài liệu mở bằng link ngoài, dán URL trực tiếp ở ô bên dưới.",
          provider: "cloudflare-r2",
        },
      },
      {
        name: "duong_dan_anh_dai_dien",
        label: "Ảnh đại diện / thư viện ảnh",
        upload: {
          accept: ".png,.jpg,.jpeg,.webp",
          functionName: "r2-presign-upload",
          helperText:
            "Có thể chọn nhiều ảnh để tải lên. Mỗi ảnh sẽ được lưu thành một dòng, phù hợp cho infographic, sơ đồ tư duy, phiếu học tập preview.",
          multiple: true,
          provider: "cloudflare-r2",
        },
      },
      { name: "ten_nguon", label: "Tên nguồn" },
      { name: "lop", label: "Lớp", type: "number" },
      {
        name: "huong_dan_khai_thac",
        label: "Hướng dẫn khai thác",
        type: "textarea",
        helperText: "Nhập mỗi ý hướng dẫn gạch đầu dòng trên một dòng.",
      },
      {
        name: "cau_hoi_luyen_tap",
        label: "Câu hỏi luyện tập & Gợi ý",
        type: "textarea",
        helperText: "Nhập mỗi câu hỏi một dòng. Để thêm gợi ý đáp án, nhập dạng: Nội dung câu hỏi ::: Gợi ý đáp án (hoặc dán mảng JSON)",
      },
      { name: "noi_bat", label: "Nổi bật", type: "boolean" },
      ...commonStatusFields,
    ],
    label: "Học liệu",
    name: "hoc_lieu",
  },
  {
    fields: [
      { name: "tieu_de", label: "Tiêu đề", required: true },
      { name: "mo_ta", label: "Mô tả", type: "textarea" },
      { name: "chu_de_id", label: "Chủ đề", reference: references.chuDe, type: "number" },
      {
        name: "duong_dan_file",
        label: "File đề thi",
        required: true,
        upload: {
          accept: ".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp",
          functionName: "r2-presign-upload",
          helperText:
            "Tải file đề thi lên Cloudflare R2. Hỗ trợ ảnh, PDF và Word để phục vụ mục tải về trong thư viện.",
          provider: "cloudflare-r2",
        },
      },
      {
        name: "duong_dan_anh_dai_dien",
        label: "Ảnh xem trước",
        upload: {
          accept: ".png,.jpg,.jpeg,.webp",
          functionName: "r2-presign-upload",
          helperText:
            "Có thể tải ảnh preview riêng cho đề thi. Nếu bỏ trống, hệ thống sẽ dùng chính file ảnh nếu đề thi là ảnh.",
          provider: "cloudflare-r2",
        },
      },
      { name: "ten_nguon", label: "Tên nguồn" },
      ...commonStatusFields,
    ],
    label: "Đề thi",
    name: "de_thi",
  },
  {
    fields: [],
    label: "Kiểm tra - Câu hỏi - Đáp án",
    name: "quiz_builder",
  },
  {
    fields: [],
    label: "Kết quả kiểm tra - Chi tiết",
    name: "quiz_results_manager",
  },
  {
    fields: [
      { name: "ten_tro_choi", label: "Tên trò chơi", required: true },
      { name: "mo_ta", label: "Mô tả ngắn", type: "textarea" },
      { name: "duong_dan", label: "Link trò chơi", required: true },
      {
        name: "chu_de",
        label: "Chủ đề",
        options: GAME_TOPIC_OPTIONS,
        required: true,
        type: "select",
      },
      {
        name: "hinh_dai_dien_url",
        label: "Hình đại diện",
        upload: {
          accept: ".png,.jpg,.jpeg,.webp",
          functionName: "r2-presign-upload",
          helperText:
            "Có thể tải ảnh đại diện lên Cloudflare R2 hoặc dán URL ảnh trực tiếp. Trường này không bắt buộc.",
          provider: "cloudflare-r2",
        },
      },
      { name: "thu_tu_hien_thi", label: "Thứ tự hiển thị", type: "number" },
      { name: "da_xuat_ban", label: "Đang hiển thị", defaultValue: true, type: "boolean" },
    ],
    label: "QUẢN LÝ TRÒ CHƠI HỌC TẬP",
    name: "tro_choi_hoc_tap",
  },
  {
    fields: [
      { name: "ten_vung", label: "Tên vùng", required: true },
      { name: "duong_dan", label: "Đường dẫn", required: true },
      {
        name: "danh_sach_tinh",
        label: "Tỉnh/thành thuộc vùng",
        type: "multi-select",
        helperText:
          "Tick trực tiếp các tỉnh/thành thuộc vùng. Danh sách này quyết định khi click vào bản đồ thì tỉnh sẽ hiện thông tin của vùng nào.",
        options: VIETNAM_34_PROVINCE_OPTIONS,
      },
      { name: "mo_ta", label: "Mô tả", type: "textarea" },
      { name: "dien_tich_km2", label: "Diện tích (km²)", type: "number" },
      { name: "dan_so", label: "Dân số", type: "number" },
      { name: "mat_do_dan_so", label: "Mật độ dân số", type: "number" },
      { name: "the_manh_tu_nhien", label: "Thế mạnh kinh tế tự nhiên", type: "textarea" },
      { name: "the_manh_nhan_luc", label: "Thế mạnh kinh tế nhân lực", type: "textarea" },
      {
        name: "thanh_pho_tieu_bieu",
        label: "Đô thị / trung tâm hành chính lớn",
        type: "textarea",
      },
      { name: "thu_tu_hien_thi", label: "Thứ tự hiển thị", type: "number" },
      ...commonStatusFields,
    ],
    label: "Vùng kinh tế",
    name: "vung_kinh_te",
  },
  {
    fields: [
      { name: "tieu_de", label: "Tiêu đề", required: true },
      { name: "duong_dan", label: "Đường dẫn", required: true },
      { name: "tom_tat", label: "Tóm tắt", type: "textarea" },
      { name: "noi_dung", label: "Nội dung", type: "textarea" },
      { name: "chu_de_id", label: "Chủ đề", reference: references.chuDe, type: "number" },
      {
        name: "duong_dan_anh_dai_dien",
        label: "Ảnh đại diện",
        upload: {
          accept: ".png,.jpg,.jpeg,.webp",
          functionName: "r2-presign-upload",
          helperText:
            "Chọn ảnh để tải lên Cloudflare R2, hoặc dán URL ảnh trực tiếp nếu bạn dùng ảnh ngoài.",
          provider: "cloudflare-r2",
        },
      },
      { name: "ten_nguon", label: "Tên nguồn" },
      { name: "duong_dan_nguon", label: "Đường dẫn nguồn", required: true },
      { name: "ngay_xuat_ban", label: "Ngày xuất bản", type: "datetime-local" },
      ...commonStatusFields,
    ],
    label: "Tin tức tư liệu",
    name: "tin_tuc_tu_lieu",
  },
  {
    fields: [
      { name: "tieu_de", label: "Tiêu đề", required: true },
      { name: "mo_ta", label: "Mô tả", type: "textarea" },
      { name: "doi_tuong_khao_sat", label: "Đối tượng khảo sát" },
      { name: "duong_dan_khao_sat", label: "Link khảo sát ngoài", required: true },
      { name: "dang_mo", label: "Đang mở", type: "boolean" },
    ],
    label: "Khảo sát",
    name: "khao_sat",
  },
  {
    fields: [
      {
        name: "khoa_cau_hinh",
        label: "Khóa cấu hình",
        options: HOME_CONFIG_KEY_OPTIONS,
        required: true,
        type: "select",
      },
      { name: "gia_tri_cau_hinh", label: "Giá trị cấu hình", type: "textarea" },
    ],
    label: "Cấu hình website",
    name: "cau_hinh_website",
  },
  {
    fields: [
      {
        name: "khu_vuc",
        label: "Khu vực hiển thị",
        options: HOME_SECTION_OPTIONS,
        required: true,
        type: "select",
      },
      { name: "ma_muc", label: "Mã mục duy nhất", required: true },
      { name: "tieu_de", label: "Tiêu đề", required: true },
      { name: "mo_ta", label: "Mô tả", type: "textarea" },
      { name: "bieu_tuong", label: "Biểu tượng / nhãn ngắn" },
      {
        name: "duong_dan_anh",
        label: "Ảnh hiển thị",
        upload: {
          accept: ".png,.jpg,.jpeg,.webp",
          functionName: "r2-presign-upload",
          helperText:
            "Tải ảnh minh họa cho card trên trang chủ. Có thể để trống nếu mục này chỉ cần biểu tượng hoặc văn bản.",
          provider: "cloudflare-r2",
        },
      },
      { name: "nhan_hanh_dong", label: "Nhãn nút / liên kết" },
      { name: "duong_dan", label: "Đường dẫn nội bộ hoặc URL ngoài" },
      { name: "thu_tu_hien_thi", label: "Thứ tự hiển thị", type: "number" },
      { name: "da_hien_thi", label: "Đang hiển thị", defaultValue: true, type: "boolean" },
    ],
    label: "Mục nội dung trang chủ",
    name: "trang_chu_muc",
  },
];
