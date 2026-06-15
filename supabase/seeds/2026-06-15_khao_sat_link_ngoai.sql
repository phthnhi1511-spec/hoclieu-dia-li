alter table public.khao_sat
add column if not exists duong_dan_khao_sat text;

comment on column public.khao_sat.duong_dan_khao_sat is
'Link biểu mẫu khảo sát ngoài website, thường là Google Form.';
