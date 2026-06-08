import { useEffect, useMemo, useState } from "react";
import { adminTables } from "../adminTables";
import { supabase } from "../lib/supabaseClient";
import "./Admin.css";

const sessionKey = "hoclieu_admin_unlocked";

function getInitialForm(fields) {
  return fields.reduce((values, field) => {
    values[field.name] = field.type === "boolean" ? false : "";
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

function formatCellValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function Admin() {
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(
    localStorage.getItem(sessionKey) === "true",
  );
  const [loginError, setLoginError] = useState("");

  const [selectedTableName, setSelectedTableName] = useState(adminTables[0].name);
  const selectedTable = useMemo(
    () => adminTables.find((table) => table.name === selectedTableName) || adminTables[0],
    [selectedTableName],
  );

  const [rows, setRows] = useState([]);
  const [formData, setFormData] = useState(() => getInitialForm(selectedTable.fields));
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (isUnlocked) {
      queueMicrotask(() => {
        loadRows();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTableName, isUnlocked]);

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
    setMessage(`Đang sửa bản ghi ID ${row.id}`);
    setError("");
  }

  function resetForm() {
    setEditingId(null);
    setFormData(getInitialForm(selectedTable.fields));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const payload = {};
    selectedTable.fields.forEach((field) => {
      payload[field.name] = prepareValue(formData[field.name], field);
    });

    const request = editingId
      ? supabase.from(selectedTable.name).update(payload).eq("id", editingId)
      : supabase.from(selectedTable.name).insert(payload);

    const { error: saveError } = await request;

    if (saveError) {
      setError(saveError.message);
    } else {
      setMessage(editingId ? "Đã cập nhật bản ghi." : "Đã thêm bản ghi mới.");
      resetForm();
      await loadRows();
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

          {loginError && <div className="admin-error">{loginError}</div>}

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
        <button className="admin-secondary-button" type="button" onClick={loadRows}>
          Tải lại
        </button>
      </section>

      <section className="admin-layout">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-panel-title">
            <h2>{editingId ? "Sửa bản ghi" : "Thêm bản ghi"}</h2>
            {editingId && (
              <button type="button" className="admin-text-button" onClick={resetForm}>
                Hủy sửa
              </button>
            )}
          </div>

          {selectedTable.fields.map((field) => (
            <label key={field.name} className="admin-field">
              <span>
                {field.label}
                {field.required ? " *" : ""}
              </span>

              {field.type === "textarea" ? (
                <textarea
                  value={formData[field.name] ?? ""}
                  onChange={(event) => handleChange(field, event.target.value)}
                  required={field.required}
                  rows={4}
                />
              ) : field.type === "boolean" ? (
                <select
                  value={String(formData[field.name])}
                  onChange={(event) => handleChange(field, event.target.value)}
                >
                  <option value="true">Có</option>
                  <option value="false">Không</option>
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  value={formData[field.name] ?? ""}
                  onChange={(event) => handleChange(field, event.target.value)}
                  required={field.required}
                />
              )}
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

          {message && <div className="admin-success">{message}</div>}
          {error && <div className="admin-error">{error}</div>}

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
                        <button type="button" className="admin-danger" onClick={() => handleDelete(row)}>
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
      </section>
    </main>
  );
}

export default Admin;
