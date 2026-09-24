import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../Navbar";
import "./issue.css";
import "../repo/repo.css";

const IssueDetails = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();

  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("open");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/issue/${issueId}`
        );

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Issue not found");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setIssue(data);
        setEditTitle(data.title || "");
        setEditDescription(data.description || "");
        setEditStatus(data.status || "open");
        setLoading(false);
      } catch (err) {
        console.error("Error fetching issue:", err);
        setError("Failed to load issue details.");
        setLoading(false);
      }
    };

    if (issueId) {
      fetchIssue();
    }
  }, [issueId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setActionError("");

    if (!editTitle.trim()) {
      setActionError("Title cannot be empty");
      return;
    }

    if (!editDescription.trim()) {
      setActionError("Description cannot be empty");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setActionError("Authentication required. Please login.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/issue/update/${issueId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
            status: editStatus,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to update issue");
        setActionLoading(false);
        return;
      }

      setIssue(data.issue);
      setIsEditing(false);
      setActionLoading(false);
    } catch (err) {
      console.error("Error updating issue:", err);
      setActionError("An unexpected error occurred");
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?"
    );
    if (!confirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setActionError("Authentication required. Please login.");
      return;
    }

    try {
      setActionLoading(true);
      setActionError("");

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/issue/delete/${issueId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setActionError(data.error || "Failed to delete issue");
        setActionLoading(false);
        return;
      }

      navigate(`/repo/${issue.repository}/issues`);
    } catch (err) {
      console.error("Error deleting issue:", err);
      setActionError("An unexpected error occurred");
      setActionLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="issue-container">
        {issue && issue.repository && (
          <div className="issue-nav-back">
            <Link to={`/repo/${issue.repository}/issues`}>
              ← Back to Issues
            </Link>
          </div>
        )}

        {loading && <p style={{ color: "#8b949e" }}>Loading issue details...</p>}

        {error && <div className="error-banner">{error}</div>}

        {!loading && issue && (
          <div className="issue-details-card">
            {actionError && <div className="error-banner">{actionError}</div>}

            {isEditing ? (
              <form onSubmit={handleUpdate}>
                <h2>Edit Issue</h2>

                <div className="form-group">
                  <label htmlFor="edit-title">Title</label>
                  <input
                    id="edit-title"
                    type="text"
                    className="repo-input"
                    style={{ maxWidth: "100%" }}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-description">Description</label>
                  <textarea
                    id="edit-description"
                    className="repo-textarea"
                    style={{ minHeight: "140px" }}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-status">Status</label>
                  <select
                    id="edit-status"
                    className="repo-input"
                    style={{ maxWidth: "200px" }}
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="open">open</option>
                    <option value="closed">closed</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button
                    type="submit"
                    className="repo-btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="issue-btn-secondary"
                    disabled={actionLoading}
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(issue.title);
                      setEditDescription(issue.description);
                      setEditStatus(issue.status);
                      setActionError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="issue-details-header">
                  <div className="issue-details-title-row">
                    <h2>{issue.title}</h2>
                    <span className={`issue-status ${issue.status}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>

                <p className="issue-details-desc">{issue.description}</p>

                <div className="issue-details-actions">
                  <button
                    className="repo-btn-primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    className="issue-btn-danger"
                    disabled={actionLoading}
                    onClick={handleDelete}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default IssueDetails;
