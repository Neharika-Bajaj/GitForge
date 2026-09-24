import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../Navbar";
import "./issue.css";
import "../repo/repo.css";

const CreateIssue = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Issue title is required");
      return;
    }

    if (!description.trim()) {
      setError("Issue description is required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please login.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/repo/${id}/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create issue");
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate(`/repo/${id}/issues`);
    } catch (err) {
      console.error("Error creating issue:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="issue-container">
        <div className="issue-nav-back">
          <Link to={`/repo/${id}/issues`}>← Back to Issues</Link>
        </div>

        <div className="issue-form-card">
          <h2>Create New Issue</h2>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="issue-title">Title</label>
              <input
                id="issue-title"
                type="text"
                className="repo-input"
                style={{ maxWidth: "100%" }}
                placeholder="Issue title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="issue-desc">Description</label>
              <textarea
                id="issue-desc"
                className="repo-textarea"
                style={{ minHeight: "140px" }}
                placeholder="Issue description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                type="submit"
                className="repo-btn-primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Issue"}
              </button>
              <button
                type="button"
                className="issue-btn-secondary"
                disabled={loading}
                onClick={() => navigate(`/repo/${id}/issues`)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateIssue;
