import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import "./repo.css";

const CreateRepo = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Repository name is required.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please login first.");
      navigate("/auth");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/repo/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          visibility: visibility === "public",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || "Failed to create repository");
        setLoading(false);
        return;
      }

      setLoading(false);
      if (data.repositoryID) {
        navigate(`/repo/${data.repositoryID}`);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error("Error creating repository:", err);
      setError("An unexpected error occurred while creating the repository.");
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="repo-container">
        <div className="create-repo-box">
          <h2>Create a new repository</h2>
          <p style={{ color: "#8b949e", fontSize: "0.95rem" }}>
            A repository contains all project files, including the revision history.
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="repo-name">Repository name *</label>
              <input
                id="repo-name"
                className="repo-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. my-awesome-project"
                autoComplete="off"
                required
              />
              <div className="form-hint">
                Great repository names are short and memorable.
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="repo-desc">Description (optional)</label>
              <textarea
                id="repo-desc"
                className="repo-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short description of your project..."
              />
            </div>

            <div className="form-group">
              <label>Visibility</label>
              <div className="radio-group">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={visibility === "public"}
                    onChange={() => setVisibility("public")}
                  />
                  <div>
                    <strong style={{ color: "#f0f6fc" }}>Public</strong>
                    <div className="form-hint">
                      Anyone on the internet can view this repository.
                    </div>
                  </div>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={visibility === "private"}
                    onChange={() => setVisibility("private")}
                  />
                  <div>
                    <strong style={{ color: "#f0f6fc" }}>Private</strong>
                    <div className="form-hint">
                      You choose who can see and commit to this repository.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="repo-btn-primary"
              disabled={loading}
            >
              {loading ? "Creating repository..." : "Create repository"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateRepo;
