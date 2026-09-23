import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";
import Navbar from "../Navbar";

const Dashboard = () => {
  const [repositories, setRepositories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedRepositories, setSuggestedRepositories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchRepositories = async () => {
      try {
        const headers = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/repo/user`,
          { headers }
        );
        if (response.ok) {
          const data = await response.json();
          setRepositories(Array.isArray(data.repositories) ? data.repositories : []);
        } else {
          setRepositories([]);
        }
      } catch (err) {
        console.error("Error while fetching repositories: ", err);
        setRepositories([]);
      }
    };

    const fetchSuggestedRepositories = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/repo/all`
        );
        if (response.ok) {
          const data = await response.json();
          setSuggestedRepositories(Array.isArray(data) ? data : []);
        } else {
          setSuggestedRepositories([]);
        }
      } catch (err) {
        console.error("Error while fetching suggested repositories: ", err);
        setSuggestedRepositories([]);
      }
    };

    fetchRepositories();
    fetchSuggestedRepositories();
  }, []);

  useEffect(() => {
    const safeRepos = Array.isArray(repositories) ? repositories : [];
    if (searchQuery.trim() === "") {
      setSearchResults(safeRepos);
    } else {
      const filteredRepo = safeRepos.filter(
        (repo) =>
          repo &&
          repo.name &&
          repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredRepo);
    }
  }, [searchQuery, repositories]);

  return (
    <>
      <Navbar />
      <section id="dashboard">
        <aside>
          <h3>Suggested Repositories</h3>
          {suggestedRepositories.map((repo) => {
            return (
              <div
                key={repo._id}
                className="repo-card"
                onClick={() => navigate(`/repo/${repo._id}`)}
              >
                <h4>{repo.name}</h4>
                <p>{repo.description || "No description provided."}</p>
              </div>
            );
          })}
        </aside>
        <main>
          <div className="main-header">
            <h2>Your Repositories</h2>
            <button
              className="create-repo-btn"
              onClick={() => navigate("/create")}
            >
              New Repository
            </button>
          </div>
          <div id="search">
            <input
              type="text"
              value={searchQuery}
              placeholder="Search..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {searchResults.map((repo) => {
            return (
              <div
                key={repo._id}
                className="repo-card"
                onClick={() => navigate(`/repo/${repo._id}`)}
              >
                <h4>{repo.name}</h4>
                <p>{repo.description || "No description provided."}</p>
              </div>
            );
          })}
        </main>
        <aside>
          <h3>Upcoming Events</h3>
          <ul>
            <li>
              <p>Tech Conference - Dec 15</p>
            </li>
            <li>
              <p>Developer Meetup - Dec 25</p>
            </li>
            <li>
              <p>React Summit - Jan 5</p>
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
};

export default Dashboard;