import { useEffect, useMemo, useState } from "react";
import { adminTables } from "../adminTables";
import { functionsBaseUrl, invokeFunction } from "../lib/functionsClient";
import { buildR2FileUrl } from "../lib/r2";
import { parseMediaList } from "../lib/materialUtils";
import { supabase } from "../lib/supabaseClient";
import AdminQuizBuilder from "./AdminQuizBuilder";
import "./Admin.css";

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

  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState(() => getInitialForm(selectedTable.fields));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [referenceOptions, setReferenceOptions] = useState({});
  const [uploadFiles, setUploadFiles] = useState({});

  async function loadRows() {
    setLoading(true);
    setError("");
    setMessage("");

    const { data, error: loadError } = await supabase
      .from(selectedTable.name)
      .select("*")
      .order("id", { ascending: false })
      .limit(50);

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
    if (!isUnlocked || isQuizBuilderMode) return;

    queueMicrotask(() => {
      loadRows();
      loadReferenceOptions();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTableName, isUnlocked, isQuizBuilderMode]);

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
    setFormData((current) => ({
      ...current,
      [field.name]: value,
    }));
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
        const selectedFile = uploadFiles[field.name];

        if (field.upload?.multiple && Array.isArray(selectedFile) && selectedFile.length > 0) {
          const existingValues = parseMediaList(formData[field.name]);
          const uploadedValues = [];

          for (const file of selectedFile) {
            uploadedValues.push(await uploadFileToCloudflare(field, file));
          }

          payload[field.name] = [...existingValues, ...uploadedValues].join("\n");
          continue;
        }

        if (field.upload && selectedFile) {
          payload[field.name] = await uploadFileToCloudflare(field, selectedFile);
          continue;
        }

        if (
          field.upload &&
          field.required &&
          !formData[field.name] &&
          (!Array.isArray(selectedFile) || selectedFile.length === 0)
        ) {
          throw new Error("Vui lòng chọn file học liệu để tải lên Cloudflare.");
        }

        payload[field.name] = prepareValue(formData[field.name], field);
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
              files={Array.isArray(uploadFiles[field.name]) ? uploadFiles[field.name] : []}
              title="Ảnh vừa chọn"
            />
            <UploadPreviewGallery
              imageUrls={parseMediaList(formData[field.name]).map((item) => buildR2FileUrl(item))}
              title="Ảnh hiện tại"
            />
          </>
        ) : null}

        {formData[field.name] && !field.upload.multiple ? (
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
        {!isQuizBuilderMode ? (
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
                <h2>{selectedTable.label}</h2>
                <p>Hiển thị tối đa 50 bản ghi mới nhất</p>
              </div>

              {message ? <div className="admin-success">{message}</div> : null}
              {error ? <div className="admin-error">{error}</div> : null}

              {loading ? (
                <p className="admin-empty">Đang tải dữ liệu...</p>
              ) : rows.length === 0 ? (
                <p className="admin-empty">Chưa có dữ liệu trong bảng này.</p>
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
                            <td key={field.name}>{formatCellValue(row[field.name])}</td>
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
