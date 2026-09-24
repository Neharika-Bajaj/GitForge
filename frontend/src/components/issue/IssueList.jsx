import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./issue.css";

const IssueList = ({ repositoryId }) => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/repo/${repositoryId}/issues`
        );

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || "Failed to load issues");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setIssues(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching issues:", err);
        setError("Failed to load issues for this repository.");
        setLoading(false);
      }
    };

    if (repositoryId) {
      fetchIssues();
    }
  }, [repositoryId]);

  return (
    <div className="issues-container">
      <div className="issues-header">
        <button
          className="repo-btn-primary"
          onClick={() => navigate(`/repo/${repositoryId}/issues/new`)}
        >
          New Issue
        </button>
      </div>

      {loading && <p style={{ color: "#8b949e" }}>Loading issues...</p>}

      {error && <div className="error-banner">{error}</div>}

      {!loading && !error && issues.length === 0 && (
        <div className="empty-state">
          <h3>No issues yet</h3>
          <p>There are no issues for this repository.</p>
        </div>
      )}

      {!loading && !error && issues.length > 0 && (
        <div className="issue-list">
          {issues.map((issue) => (
            <div key={issue._id} className="issue-item">
              <div>
                <Link to={`/issue/${issue._id}`} className="issue-title">
                  {issue.title}
                </Link>
                {issue.description && (
                  <p className="issue-desc">{issue.description}</p>
                )}
              </div>
              <span className={`issue-status ${issue.status}`}>
                {issue.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IssueList;
