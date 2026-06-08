import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

function SupabaseConnectionTest() {
  const [status, setStatus] = useState("dang_kiem_tra");
  const [message, setMessage] = useState("Dang kiem tra ket noi Supabase...");

  useEffect(() => {
    let isMounted = true;

    async function testConnection() {
      const { error } = await supabase.from("chu_de").select("id").limit(1);

      if (!isMounted) return;

      if (error) {
        setStatus("loi");
        setMessage(`Ket noi Supabase chua thanh cong: ${error.message}`);
        return;
      }

      setStatus("thanh_cong");
      setMessage("Ket noi Supabase thanh cong");
    }

    testConnection();

    return () => {
      isMounted = false;
    };
  }, []);

  const isSuccess = status === "thanh_cong";
  const isError = status === "loi";

  return (
    <div
      style={{
        background: isSuccess ? "#e8f5e9" : isError ? "#ffebee" : "#fffde7",
        border: `1px solid ${isSuccess ? "#81c784" : isError ? "#ef9a9a" : "#fbc02d"}`,
        color: isSuccess ? "#1b5e20" : isError ? "#b71c1c" : "#795548",
        fontSize: "14px",
        fontWeight: 600,
        padding: "10px 40px",
        textAlign: "center",
      }}
    >
      {message}
    </div>
  );
}

export default SupabaseConnectionTest;
