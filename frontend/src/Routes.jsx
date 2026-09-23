import React, { useEffect } from "react";
import { useNavigate, useRoutes, useLocation } from 'react-router-dom';

import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import CreateRepo from "./components/repo/CreateRepo";
import RepoDetails from "./components/repo/RepoDetails";

import { useAuth } from "./authContext";

const ProjectRoutes = () => {
    const { currentUser, setCurrentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userIdFromStorage = localStorage.getItem("userId");

        if (userIdFromStorage && !currentUser) {
            setCurrentUser(userIdFromStorage);
        }

        if (!userIdFromStorage && !["/auth", "/signup"].includes(location.pathname)) {  //route protection
            navigate("/auth");
        }

        if (userIdFromStorage && ["/auth", "/signup"].includes(location.pathname)) {
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser, location.pathname]);

    let element = useRoutes([    //creates routing table
        {
            path: "/",
            element: <Dashboard />
        },
        {
            path: "/auth",
            element: <Login /> 
        },
        {
            path: "/signup",
            element: <Signup />
        },
        {
            path: "/profile",
            element: <Profile />
        },
        {
            path: "/create",
            element: <CreateRepo />
        },
        {
            path: "/repo/:id",
            element: <RepoDetails />
        }
    ]);
    return element;
}

export default ProjectRoutes;
