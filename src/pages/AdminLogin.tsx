import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    } else {
      navigate("/admin");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "hsl(var(--gem-navy))" }}>
      <Helmet>
        <title>Admin Login — Gemscape</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{
        backgroundColor: "hsl(var(--gem-cream))",
        padding: "56px 64px",
        maxWidth: 440,
        width: "100%",
      }}>
        <div className="text-center">
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 300,
            fontSize: 36,
            color: "hsl(var(--gem-navy))",
            marginTop: 24,
            lineHeight: 1,
          }}>
            Admin Access
          </h1>
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-8">
          <div>
            <label className="admin-form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="admin-form-input"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="admin-form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="admin-form-input"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, fontSize: 14, color: "hsl(var(--gem-coral))" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: 52,
              backgroundColor: "hsl(var(--gem-navy))",
              color: "white",
              border: "none",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.3s",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
