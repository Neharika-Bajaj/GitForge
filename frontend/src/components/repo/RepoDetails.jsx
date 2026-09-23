import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar";
import "./repo.css";

const RepoDetails = () => {
  const { id } = useParams();
  const [repository, setRepository] = useState(null);
  const [commits, setCommits] = useState([]);
  const [activeTab, setActiveTab] = useState("code");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchRepoData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch repository info
        const repoRes = await fetch(
          `${import.meta.env.VITE_API_URL}/repo/${id}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (!repoRes.ok) {
          const errData = await repoRes.json().catch(() => ({}));
          setError(errData.error || "Repository not found");
          setLoading(false);
          return;
        }

        const repoData = await repoRes.json();
        setRepository(repoData);

        // Fetch commits for this repository
        const commitsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/repo/${id}/commits`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );

        if (commitsRes.ok) {
          const commitsData = await commitsRes.json();
          setCommits(Array.isArray(commitsData.commits) ? commitsData.commits : []);
        } else {
          setCommits([]);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching repository details:", err);
        setError("Failed to load repository details.");
        setLoading(false);
      }
    };

    if (id) {
      fetchRepoData();
    }
  }, [id]);

  // Decode file content safely from base64 (UTF-8 robust)
  const decodeContent = (content) => {
    if (!content) return "";
    try {
      const binaryString = atob(content);
      const bytes = Uint8Array.from(binaryString, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return content;
    }
  };

  // Get files from the most recent commit
  const latestCommit = commits.length > 0 ? commits[0] : null;
  const filesList = latestCommit && Array.isArray(latestCommit.files)
    ? latestCommit.files
    : [];

  return (
    <>
      <Navbar />
      <div className="repo-container">
        {loading && <p style={{ color: "#8b949e" }}>Loading repository...</p>}

        {error && <div className="error-banner">{error}</div>}

        {!loading && repository && (
          <>
            <div className="repo-header">
              <div className="repo-title-row">
                <h1>
                  {repository.owner?.username || "owner"} /{" "}
                  <strong>{repository.name}</strong>
                </h1>
                <span className="visibility-badge">
                  {repository.visibility ? "Public" : "Private"}
                </span>
              </div>
              <p className="repo-desc">
                {repository.description || "No description provided for this repository."}
              </p>
            </div>

            <div className="repo-tabs">
              <button
                className={`repo-tab-btn ${activeTab === "code" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("code");
                  setSelectedFile(null);
                }}
              >
                Code
              </button>
              <button
                className={`repo-tab-btn ${activeTab === "commits" ? "active" : ""}`}
                onClick={() => setActiveTab("commits")}
              >
                Commits ({commits.length})
              </button>
            </div>

            {activeTab === "code" && (
              <div>
                {selectedFile ? (
                  <div style={{ backgroundColor: "#161b22", border: "1px solid #30363d", borderRadius: "6px" }}>
                    <div style={{
                      padding: "10px 16px",
                      borderBottom: "1px solid #21262d",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}>
                      <span style={{ fontWeight: 600, color: "#f0f6fc" }}>{selectedFile.fileName}</span>
                      <button
                        onClick={() => setSelectedFile(null)}
                        style={{ background: "none", border: "none", color: "#58a6ff", cursor: "pointer" }}
                      >
                        Back to files
                      </button>
                    </div>
                    <pre style={{
                      padding: "16px",
                      margin: 0,
                      overflowX: "auto",
                      color: "#c9d1d9",
                      fontSize: "0.9rem",
                      lineHeight: "1.5"
                    }}>
                      <code>{decodeContent(selectedFile.content)}</code>
                    </pre>
                  </div>
                ) : filesList.length > 0 ? (
                  <div className="file-list">
                    {filesList.map((file, idx) => (
                      <div
                        key={idx}
                        className="file-item"
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedFile(file)}
                      >
                        <span className="file-icon">📄</span>
                        <span style={{ color: "#58a6ff" }}>{file.fileName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>This repository is empty</h3>
                    <p>Push existing code or commits from your terminal using the GitForge CLI:</p>
                    <pre style={{
                      backgroundColor: "#0d1117",
                      border: "1px solid #30363d",
                      borderRadius: "6px",
                      padding: "14px",
                      textAlign: "left",
                      display: "inline-block",
                      maxWidth: "600px",
                      width: "100%",
                      color: "#c9d1d9"
                    }}>
{`# Initialize local repository
node index.js init

# Link to this remote repository
node index.js remote ${repository._id}

# Stage, commit, and push
node index.js add <file>
node index.js commit "Initial commit"
node index.js push`}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === "commits" && (
              <div className="commit-list">
                {commits.length > 0 ? (
                  commits.map((commit) => (
                    <div key={commit._id || commit.commitId} className="commit-card">
                      <div>
                        <h4>{commit.message || "Commit"}</h4>
                        <p className="commit-meta">
                          Committed on{" "}
                          {new Date(commit.timestamp).toLocaleString()}{" "}
                          • {Array.isArray(commit.files) ? commit.files.length : 0} file(s)
                        </p>
                      </div>
                      <span className="commit-hash">
                        {(commit.commitId || "").substring(0, 8)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <h3>No commits yet</h3>
                    <p>Commits pushed to this repository will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default RepoDetails;
