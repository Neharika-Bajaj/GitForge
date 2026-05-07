import express from "express";
import{createRepository, 
    getAllRepositories,
     fetchRepositoryById,
     fetchRepositoriesForCurrentUser,
      fetchRepositoryByName,
       updateRepositoryById,
       toggleVisibilityById,  
       deleteRepositoryById} from "../controllers/repoController.js";
import { pushToRepo } from "../controllers/pushDB.js";
import { pullFromRepo } from "../controllers/pullDB.js";
import { revertFromRepo } from "../controllers/revertDB.js";

export const repoRouter = express.Router();

repoRouter.post("/repo/push", pushToRepo);
repoRouter.get("/repo/pull", pullFromRepo);
repoRouter.get("/repo/revert/:commitID", revertFromRepo);
repoRouter.post("/repo/create",createRepository);
repoRouter.get("/repo/all",getAllRepositories);
repoRouter.get("/repo/user/:userID",fetchRepositoriesForCurrentUser);
repoRouter.get("/repo/name/:name",fetchRepositoryByName);
repoRouter.get("/repo/:id",fetchRepositoryById);
repoRouter.put("/repo/update/:id",updateRepositoryById);
repoRouter.patch("/repo/toggle/:id",toggleVisibilityById);
repoRouter.delete("/repo/delete/:id",deleteRepositoryById);

