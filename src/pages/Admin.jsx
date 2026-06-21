import { useEffect, useMemo, useState } from "react";
import { adminTables } from "../adminTables";
import { functionsBaseUrl, invokeFunction } from "../lib/functionsClient";
import { buildR2FileUrl } from "../lib/r2";
import { parseMediaList } from "../lib/materialUtils";
import { supabase } from "../lib/supabaseClient";
import {
  buildDefaultEconomicRegionRows,
  normalizeVietnamName,
  parseProvinceList,
} from "../lib/vietnamMap";
import AdminQuizBuilder from "./AdminQuizBuilder";
import AdminQuizResultsManager from "./AdminQuizResultsManager";
import "./Admin.css";

const floatingContactAvatarUpload = {
  accept: ".png,.jpg,.jpeg,.webp",
  functionName: "r2-presign-upload",
  helperText: "Tải ảnh đại diện cho nút liên hệ nổi lên Cloudflare R2.",
  provider: "cloudflare-r2",
};

function isImageUploadField(field) {
  return Boolean(field.upload?.accept && /\.(png|jpe?g|webp)/i.test(field.upload.accept));
}

const sessionKey = "hoclieu_admin_unlocked";

function getInitialForm(fields) {
  return fields.reduce((values, field) => {
    if (field.defaultValue !== undefined) {
      values[field.name] = field.defaultValue;
    } else if (field.name === "da_xuat_ban") {
      values[field.name] = true;
    } else {
      values[field.name] = field.type === "boolean" ? false : "";
    }

    return values;
  }, {});
}

function prepareValue(value, field) {
  if (value === "") return null;
  if (field.type === "number") return Number(value);
  if (field.type === "boolean") return value === true || value === "true";
  if (field.type === "datetime-local") return new Date(value).toISOString();
  return value;
}

function buildReferenceLabel(row, reference) {
  const mainLabel = row?.[reference.labelField];
  const description = reference.descriptionField ? row?.[reference.descriptionField] : "";

  if (mainLabel && description) {
    return `${mainLabel} (${description})`;
  }

  if (mainLabel) return String(mainLabel);
  return `ID ${row.id}`;
}

function formatCellValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function renderTableCellValue(value) {
  const displayValue = formatCellValue(value);

  return (
    <div className="admin-cell-clamp" title={displayValue}>
      {displayValue}
    </div>
  );
}

function parseMultiSelectValues(value) {
  return parseProvinceList(value);
}

function UploadPreviewGallery({ imageUrls, title }) {
  if (imageUrls.length === 0) return null;

  return (
    <div className="admin-upload-preview">
      <strong>{title}</strong>
      <div className="admin-upload-preview-grid">
        {imageUrls.map((imageUrl, index) => (
          <a
            key={`${imageUrl}-${index}`}
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="admin-upload-preview-item"
          >
            <img src={imageUrl} alt={`Preview ${index + 1}`} />
          </a>
        ))}
      </div>
    </div>
  );
}

function LocalFilesPreview({ files, title }) {
  const previewUrls = useMemo(
    () =>
      (files || [])
        .filter((file) => file.type.startsWith("image/"))
        .map((file) => URL.createObjectURL(file)),
    [files],
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  if (previewUrls.length === 0) return null;

  return <UploadPreviewGallery imageUrls={previewUrls} title={title} />;
}

function Admin() {
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(localStorage.getItem(sessionKey) === "true");
  const [loginError, setLoginError] = useState("");

  const [selectedTableName, setSelectedTableName] = useState(adminTables[0].name);
  const selectedTable = useMemo(
    () => adminTables.find((table) => table.name === selectedTableName) || adminTables[0],
    [selectedTableName],
  );
  const isQuizBuilderMode = selectedTableName === "quiz_builder";
  const isQuizResultsMode = selectedTableName === "quiz_results_manager";

  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState(() => getInitialForm(selectedTable.fields));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [referenceOptions, setReferenceOptions] = useState({});
  const [uploadFiles, setUploadFiles] = useState({});
  const [seedingDefaults, setSeedingDefaults] = useState(false);
  const isEconomicRegionTable = selectedTableName === "vung_kinh_te";

  async function loadRows() {
    setLoading(true);
    setError("");
    setMessage("");

    let query = supabase.from(selectedTable.name).select("*");

    if (selectedTable.name === "trang_chu_muc") {
      query = query
        .order("khu_vuc", { ascending: true })
        .order("thu_tu_hien_thi", { ascending: true })
        .order("id", { ascending: true });
    } else {
      query = query.order("id", { ascending: false });
    }

    const { data, error: loadError } = await query.limit(50);

    if (loadError) {
      setError(loadError.message);
      setRows([]);
    } else {
      setRows(data || []);
    }

    setLoading(false);
  }

  async function loadReferenceOptions(table = selectedTable) {
    const referenceFields = table.fields.filter((field) => field.reference);

    if (referenceFields.length === 0) {
      setReferenceOptions({});
      return;
    }

    setReferenceOptions(
      referenceFields.reduce((result, field) => {
        result[field.name] = {
          error: "",
          loading: true,
          options: [],
        };
        return result;
      }, {}),
    );

    const optionEntries = await Promise.all(
      referenceFields.map(async (field) => {
        const { table: referenceTable, labelField, descriptionField } = field.reference;
        const selectFields = ["id", labelField];

        if (descriptionField) {
          selectFields.push(descriptionField);
        }

        const { data, error: loadReferenceError } = await supabase
          .from(referenceTable)
          .select(selectFields.join(", "))
          .order(labelField, { ascending: true });

        if (loadReferenceError) {
          return [
            field.name,
            {
              error: loadReferenceError.message,
              loading: false,
              options: [],
            },
          ];
        }

        return [
          field.name,
          {
            error: "",
            loading: false,
            options: (data || []).map((row) => ({
              label: buildReferenceLabel(row, field.reference),
              value: row.id,
            })),
          },
        ];
      }),
    );

    setReferenceOptions(Object.fromEntries(optionEntries));
  }

  useEffect(() => {
    if (!isUnlocked || isQuizBuilderMode || isQuizResultsMode) return;

    queueMicrotask(() => {
      loadRows();
      loadReferenceOptions();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTableName, isUnlocked, isQuizBuilderMode, isQuizResultsMode]);

  function resetTransientState() {
    setReferenceOptions({});
    setUploadFiles({});
  }

  function handleLogin(event) {
    event.preventDefault();

    if (!adminPassword) {
      setLoginError("Chưa cấu hình VITE_ADMIN_PASSWORD trong file .env.local.");
      return;
    }

    if (password !== adminPassword) {
      setLoginError("Mật mã chưa đúng.");
      return;
    }

    localStorage.setItem(sessionKey, "true");
    setIsUnlocked(true);
    setLoginError("");
  }

  function handleLogout() {
    localStorage.removeItem(sessionKey);
    setIsUnlocked(false);
    setPassword("");
    resetTransientState();
  }

  function handleChange(field, value) {
    if (selectedTable.name === "cau_hinh_website" && field.name === "khoa_cau_hinh") {
      setUploadFiles((current) => {
        const nextFiles = { ...current };
        delete nextFiles.gia_tri_cau_hinh;
        return nextFiles;
      });
    }

    setFormData((current) => ({
      ...current,
      [field.name]: value,
    }));
  }

  function getActiveField(field) {
    if (
      selectedTable.name === "cau_hinh_website" &&
      field.name === "gia_tri_cau_hinh" &&
      formData.khoa_cau_hinh === "floating_contact_avatar"
    ) {
      return {
        ...field,
        label: "Ảnh đại diện liên hệ",
        upload: floatingContactAvatarUpload,
      };
    }

    return field;
  }

  function updateMultiSelectField(field, nextValues) {
    const orderedValues = (field.options || [])
      .map((option) => option.value)
      .filter((value) => nextValues.has(value));

    handleChange(field, orderedValues.join("\n"));
  }

  function toggleMultiSelectValue(field, value) {
    const nextValues = new Set(parseMultiSelectValues(formData[field.name]));

    if (nextValues.has(value)) {
      nextValues.delete(value);
    } else {
      nextValues.add(value);
    }

    updateMultiSelectField(field, nextValues);
  }

  async function handleSeedEconomicRegions() {
    setSeedingDefaults(true);
    setError("");
    setMessage("");

    try {
      const { data: existingRows, error: loadError } = await supabase
        .from("vung_kinh_te")
        .select("id, ten_vung");

      if (loadError) {
        throw new Error(loadError.message);
      }

      const existingByName = new Map(
        (existingRows || []).map((row) => [normalizeVietnamName(row.ten_vung), row]),
      );

      for (const row of buildDefaultEconomicRegionRows()) {
        const existingRow = existingByName.get(normalizeVietnamName(row.ten_vung));

        if (existingRow?.id) {
          const { error: updateError } = await supabase
            .from("vung_kinh_te")
            .update(row)
            .eq("id", existingRow.id);

          if (updateError) {
            throw new Error(updateError.message);
          }
        } else {
          const { error: insertError } = await supabase
            .from("vung_kinh_te")
            .insert(row);

          if (insertError) {
            throw new Error(insertError.message);
          }
        }
      }

      setMessage("Đã đồng bộ 6 vùng kinh tế mặc định lên Supabase.");
      await loadRows();
    } catch (seedError) {
      const nextMessage = seedError.message || "Không thể đồng bộ vùng kinh tế mặc định.";

      if (
        nextMessage.includes("column") &&
        nextMessage.includes("vung_kinh_te")
      ) {
        setError(
          `Schema Supabase của bảng vung_kinh_te còn thiếu cột mới. Cần chạy file supabase/seeds/2026-06-12_vung_kinh_te_ban_do_34_tinh.sql rồi đồng bộ lại. Chi tiết: ${nextMessage}`,
        );
      } else {
        setError(nextMessage);
      }
    }

    setSeedingDefaults(false);
  }

  function handleTableChange(tableName) {
    const nextTable = adminTables.find((table) => table.name === tableName) || adminTables[0];
    setSelectedTableName(tableName);
    setFormData(getInitialForm(nextTable.fields));
    setEditingId(null);
    setRows([]);
    setError("");
    setMessage("");
    resetTransientState();
  }

  function handleFileChange(fieldName, files, isMultiple = false) {
    setUploadFiles((current) => ({
      ...current,
      [fieldName]: isMultiple ? files : files[0] || null,
    }));
  }

  function handleEdit(row) {
    const nextForm = {};

    selectedTable.fields.forEach((field) => {
      if (field.type === "datetime-local" && row[field.name]) {
        nextForm[field.name] = new Date(row[field.name]).toISOString().slice(0, 16);
      } else if (field.type === "boolean") {
        nextForm[field.name] = Boolean(row[field.name]);
      } else {
        nextForm[field.name] = row[field.name] ?? "";
      }
    });

    setEditingId(row.id);
    setFormData(nextForm);
    setUploadFiles({});
    setMessage(`Đang sửa bản ghi ID ${row.id}`);
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setFormData(getInitialForm(selectedTable.fields));
    setUploadFiles({});
  }

  async function uploadFileToCloudflare(field, file) {
    const functionName = field.upload?.functionName;

    if (!functionName) {
      throw new Error("Chưa cấu hình function upload cho trường này.");
    }

    const contentType = file.type || "application/octet-stream";

    if (functionsBaseUrl.startsWith("/")) {
      const query = new URLSearchParams({
        contentType,
        fileName: file.name,
      });

      const response = await fetch(`${functionsBaseUrl}/${functionName}?${query.toString()}`, {
        body: file,
        method: "POST",
      });

      let data;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || `Không tải được file lên Cloudflare (${response.status}).`,
        );
      }

      if (!data?.objectKey) {
        throw new Error("Kết quả upload local không hợp lệ.");
      }

      return data.objectKey;
    }

    const { data, error: functionError } = await invokeFunction(functionName, {
      contentType,
      fileName: file.name,
    });

    if (functionError) {
      throw new Error(`Không tạo được URL upload: ${functionError.message}`);
    }

    if (!data?.uploadUrl || !data?.objectKey) {
      throw new Error("Function upload trả về dữ liệu không hợp lệ.");
    }

    const uploadResponse = await fetch(data.uploadUrl, {
      body: file,
      headers: {
        "Content-Type": contentType,
      },
      method: "PUT",
    });

    if (!uploadResponse.ok) {
      throw new Error(`Tải file lên Cloudflare thất bại (${uploadResponse.status}).`);
    }

    return data.objectKey;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {};

      for (const field of selectedTable.fields) {
        const activeField = getActiveField(field);
        const selectedFile = uploadFiles[activeField.name];

        if (activeField.upload?.multiple && Array.isArray(selectedFile) && selectedFile.length > 0) {
          const existingValues = parseMediaList(formData[activeField.name]);
          const uploadedValues = [];

          for (const file of selectedFile) {
            uploadedValues.push(await uploadFileToCloudflare(activeField, file));
          }

          payload[activeField.name] = [...existingValues, ...uploadedValues].join("\n");
          continue;
        }

        if (activeField.upload && selectedFile) {
          payload[activeField.name] = await uploadFileToCloudflare(activeField, selectedFile);
          continue;
        }

        if (
          activeField.upload &&
          activeField.required &&
          !formData[activeField.name] &&
          (!Array.isArray(selectedFile) || selectedFile.length === 0)
        ) {
          throw new Error("Vui lòng chọn file học liệu để tải lên Cloudflare.");
        }

        payload[activeField.name] = prepareValue(formData[activeField.name], activeField);
      }

      const request = editingId
        ? supabase.from(selectedTable.name).update(payload).eq("id", editingId)
        : supabase.from(selectedTable.name).insert(payload);

      const { error: saveError } = await request;

      if (saveError) {
        throw new Error(saveError.message);
      }

      setMessage(editingId ? "Đã cập nhật bản ghi." : "Đã thêm bản ghi mới.");
      resetForm();
      await loadRows();
    } catch (submitError) {
      setError(submitError.message || "Không thể lưu dữ liệu.");
    }

    setSaving(false);
  }

  async function handleDelete(row) {
    const confirmed = window.confirm(`Xóa bản ghi ID ${row.id}?`);

    if (!confirmed) return;

    setError("");
    setMessage("");

    const { error: deleteError } = await supabase
      .from(selectedTable.name)
      .delete()
      .eq("id", row.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setMessage(`Đã xóa bản ghi ID ${row.id}.`);
    await loadRows();
  }

  function renderUploadField(field) {
    const isImageUpload = isImageUploadField(field);
    const selectedFiles = Array.isArray(uploadFiles[field.name])
      ? uploadFiles[field.name]
      : uploadFiles[field.name]
        ? [uploadFiles[field.name]]
        : [];

    return (
      <>
        <input
          type="file"
          accept={field.upload.accept}
          multiple={field.upload.multiple}
          onChange={(event) =>
            handleFileChange(
              field.name,
              Array.from(event.target.files || []),
              field.upload.multiple,
            )
          }
        />

        {field.upload.multiple ? (
          <textarea
            value={formData[field.name] ?? ""}
            onChange={(event) => handleChange(field, event.target.value)}
            placeholder="Mỗi ảnh hoặc link một dòng. Có thể vừa dán link vừa tải thêm ảnh."
            rows={4}
          />
        ) : (
          <input
            type="text"
            value={formData[field.name] ?? ""}
            onChange={(event) => handleChange(field, event.target.value)}
            placeholder="Tải file lên để tự điền, hoặc dán link ngoài tại đây"
          />
        )}

        <small className="admin-field-help">{field.upload.helperText}</small>

        {uploadFiles[field.name] ? (
          <small className="admin-field-help">
            {Array.isArray(uploadFiles[field.name])
              ? `Đã chọn ${uploadFiles[field.name].length} file`
              : `File đã chọn: ${uploadFiles[field.name].name}`}
          </small>
        ) : null}

        {field.upload.multiple ? (
          <>
            <LocalFilesPreview
              files={selectedFiles}
              title="Ảnh vừa chọn"
            />
            <UploadPreviewGallery
              imageUrls={parseMediaList(formData[field.name]).map((item) => buildR2FileUrl(item))}
              title="Ảnh hiện tại"
            />
          </>
        ) : null}

        {!field.upload.multiple && isImageUpload ? (
          <>
            <LocalFilesPreview files={selectedFiles} title="Ảnh vừa chọn" />
            <UploadPreviewGallery
              imageUrls={formData[field.name] ? [buildR2FileUrl(formData[field.name])] : []}
              title="Ảnh hiện tại"
            />
          </>
        ) : null}

        {formData[field.name] && !field.upload.multiple && !isImageUpload ? (
          <a
            className="admin-inline-link"
            href={buildR2FileUrl(formData[field.name])}
            target="_blank"
            rel="noreferrer"
          >
            Mở file hiện tại
          </a>
        ) : null}
      </>
    );
  }

  function renderField(field) {
    const activeField = getActiveField(field);

    if (activeField !== field) {
      return renderUploadField(activeField);
    }

    if (field.type === "multi-select") {
      const selectedValues = parseMultiSelectValues(formData[field.name]);
      const selectedSet = new Set(selectedValues);

      return (
        <>
          <div className="admin-checkbox-toolbar">
            <strong>Đã chọn {selectedValues.length} tỉnh/thành</strong>
            <div className="admin-checkbox-actions">
              <button
                type="button"
                className="admin-text-button"
                onClick={() => updateMultiSelectField(field, new Set((field.options || []).map((option) => option.value)))}
              >
                Chọn tất cả
              </button>
              <button
                type="button"
                className="admin-text-button"
                onClick={() => handleChange(field, "")}
              >
                Bỏ chọn
              </button>
            </div>
          </div>

          <div className="admin-checkbox-grid">
            {(field.options || []).map((option) => (
              <label key={option.value} className="admin-checkbox-card">
                <input
                  type="checkbox"
                  checked={selectedSet.has(option.value)}
                  onChange={() => toggleMultiSelectValue(field, option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>

          {field.helperText ? <small className="admin-field-help">{field.helperText}</small> : null}
        </>
      );
    }

    if (field.type === "textarea") {
      return (
        <textarea
          value={formData[field.name] ?? ""}
          onChange={(event) => handleChange(field, event.target.value)}
          required={field.required}
          rows={4}
        />
      );
    }

    if (field.type === "select" && field.options) {
      return (
        <select
          value={formData[field.name] ?? ""}
          onChange={(event) => handleChange(field, event.target.value)}
          required={field.required}
        >
          <option value="">Chọn {field.label.toLowerCase()}</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.reference) {
      return (
        <>
          <select
            value={
              formData[field.name] === null || formData[field.name] === undefined
                ? ""
                : String(formData[field.name])
            }
            onChange={(event) => handleChange(field, event.target.value)}
            required={field.required}
            disabled={referenceOptions[field.name]?.loading}
          >
            <option value="">
              {referenceOptions[field.name]?.loading
                ? `Đang tải ${field.reference.entityLabel}...`
                : `Chọn ${field.reference.entityLabel}`}
            </option>
            {(referenceOptions[field.name]?.options || []).map((option) => (
              <option key={option.value} value={String(option.value)}>
                {option.label}
              </option>
            ))}
          </select>

          {referenceOptions[field.name]?.error ? (
            <small className="admin-field-help admin-field-help-error">
              Không tải được danh sách: {referenceOptions[field.name].error}
            </small>
          ) : null}
        </>
      );
    }

    if (field.upload) {
      return renderUploadField(field);
    }

    if (field.type === "boolean") {
      return (
        <select
          value={String(formData[field.name])}
          onChange={(event) => handleChange(field, event.target.value)}
        >
          <option value="true">Có</option>
          <option value="false">Không</option>
        </select>
      );
    }

    return (
      <input
        type={field.type || "text"}
        value={formData[field.name] ?? ""}
        onChange={(event) => handleChange(field, event.target.value)}
        required={field.required}
      />
    );
  }

  if (!isUnlocked) {
    return (
      <main className="admin-login-page">
        <form className="admin-login-card" onSubmit={handleLogin}>
          <h1>Quản trị hệ thống</h1>
          <p>Nhập mật mã quản trị để tiếp tục.</p>

          <label htmlFor="admin-password">Mật mã</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật mã"
            autoComplete="current-password"
          />

          {loginError ? <div className="admin-error">{loginError}</div> : null}

          <button type="submit">Vào trang quản trị</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <div>
          <p className="admin-eyebrow">Website học liệu số</p>
          <h1>Quản trị dữ liệu</h1>
        </div>
        <button className="admin-secondary-button" type="button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </section>

      <section className="admin-toolbar">
        <label htmlFor="table-select">Chọn bảng</label>
        <select
          id="table-select"
          value={selectedTableName}
          onChange={(event) => handleTableChange(event.target.value)}
        >
          {adminTables.map((table) => (
            <option key={table.name} value={table.name}>
              {table.label} ({table.name})
            </option>
          ))}
        </select>
        {!isQuizBuilderMode && !isQuizResultsMode ? (
          <button className="admin-secondary-button" type="button" onClick={loadRows}>
            Tải lại
          </button>
        ) : (
          <div />
        )}
      </section>

      <section className="admin-layout">
        {isQuizBuilderMode ? (
          <AdminQuizBuilder />
        ) : isQuizResultsMode ? (
          <AdminQuizResultsManager />
        ) : (
          <>
            <form className="admin-form" onSubmit={handleSubmit}>
              <div className="admin-panel-title">
                <h2>{editingId ? "Sửa bản ghi" : "Thêm bản ghi"}</h2>
                {editingId ? (
                  <button type="button" className="admin-text-button" onClick={resetForm}>
                    Hủy sửa
                  </button>
                ) : null}
              </div>

              {selectedTable.fields.map((field) => (
                <label key={field.name} className="admin-field">
                  <span>
                    {field.label}
                    {field.required ? " *" : ""}
                  </span>
                  {renderField(field)}
                </label>
              ))}

              <button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : editingId ? "Cập nhật" : "Thêm mới"}
              </button>
            </form>

            <section className="admin-table-panel">
              <div className="admin-panel-title">
                <div>
                  <h2>{selectedTable.label}</h2>
                  <p>Hiển thị tối đa 50 bản ghi mới nhất</p>
                </div>
                {isEconomicRegionTable ? (
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={handleSeedEconomicRegions}
                    disabled={seedingDefaults}
                  >
                    {seedingDefaults ? "Đang đồng bộ..." : "Đồng bộ 6 vùng mặc định"}
                  </button>
                ) : null}
              </div>

              {message ? <div className="admin-success">{message}</div> : null}
              {error ? <div className="admin-error">{error}</div> : null}

              {loading ? (
                <p className="admin-empty">Đang tải dữ liệu...</p>
              ) : rows.length === 0 ? (
                <p className="admin-empty">
                  {isEconomicRegionTable
                    ? "Bảng này đang trống. Bấm \"Đồng bộ 6 vùng mặc định\" để đẩy dữ liệu vùng kinh tế thật lên Supabase."
                    : "Chưa có dữ liệu trong bảng này."}
                </p>
              ) : (
                <div className="admin-table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        {selectedTable.fields.slice(0, 5).map((field) => (
                          <th key={field.name}>{field.label}</th>
                        ))}
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td>{row.id}</td>
                          {selectedTable.fields.slice(0, 5).map((field) => (
                            <td key={field.name}>{renderTableCellValue(row[field.name])}</td>
                          ))}
                          <td className="admin-actions">
                            <button type="button" onClick={() => handleEdit(row)}>
                              Sửa
                            </button>
                            <button
                              type="button"
                              className="admin-danger"
                              onClick={() => handleDelete(row)}
                            >
                              Xóa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default Admin;
