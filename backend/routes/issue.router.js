import express from "express";

import {
    createIssue,
    updateIssueByID,
    deleteIssueByID,
    getAllIssues,
    getIssueByID
} from "../controllers/issueController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

export const issueRouter = express.Router();

issueRouter.post(
    "/repo/:id/issue",
    authMiddleware,
    createIssue
);

issueRouter.put(
    "/issue/update/:id",
    authMiddleware,
    updateIssueByID
);

issueRouter.delete(
    "/issue/delete/:id",
    authMiddleware,
    deleteIssueByID
);

issueRouter.get(
    "/repo/:id/issues",
    getAllIssues
);

issueRouter.get(
    "/issue/:id",
    getIssueByID
);