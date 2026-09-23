import express from "express";

import {
    createRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoriesForCurrentUser,
    fetchRepositoryByName,
    updateRepositoryById,
    toggleVisibilityById,
    deleteRepositoryById,
    fetchRepositoryCommits
} from "../controllers/repoController.js";

import { pushToRepo } from "../controllers/pushDB.js";
import { pullFromRepo } from "../controllers/pullDB.js";
import { revertFromRepo } from "../controllers/revertDB.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

export const repoRouter = express.Router();

repoRouter.post(
    "/repo/create",
    authMiddleware,
    createRepository
);

repoRouter.post(
    "/repo/:repoId/push",
    authMiddleware,
    pushToRepo
);

repoRouter.get(
    "/repo/:repoId/pull",
    authMiddleware,
    pullFromRepo
);

repoRouter.get(
    "/repo/:repoId/revert/:commitID",
    authMiddleware,
    revertFromRepo
);

repoRouter.get(
    "/repo/all",
    getAllRepositories
);

repoRouter.get(
    "/repo/user",
    authMiddleware,
    fetchRepositoriesForCurrentUser
);

repoRouter.get(
    "/repo/name/:name",
    fetchRepositoryByName
);

repoRouter.get(
    "/repo/:id/commits",
    fetchRepositoryCommits
);

repoRouter.get(
    "/repo/:id",
    fetchRepositoryById
);

repoRouter.put(
    "/repo/update/:id",
    authMiddleware,
    updateRepositoryById
);

repoRouter.patch(
    "/repo/toggle/:id",
    authMiddleware,
    toggleVisibilityById
);

repoRouter.delete(
    "/repo/delete/:id",
    authMiddleware,
    deleteRepositoryById
);