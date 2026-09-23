import mongoose from "mongoose";
import Commit from "../models/commitModel.js";
import Repository from "../models/repoModel.js";

export async function revertFromRepo(req, res) {
    const { repoId, commitID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(repoId)) {
        return res.status(400).json({
            error: "Invalid repository ID",
        });
    }

    try {
        const repository = await Repository.findById(repoId);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // Only the repository owner can restore a commit
        if (
            repository.owner.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                error: "You are not authorized to restore this repository",
            });
        }

        const commit = await Commit.findOne({
            commitId: commitID,
            repo: repoId,
        });

        if (!commit) {
            return res.status(404).json({
                error: "Commit not found in this repository",
            });
        }

        return res.status(200).json({
            commit,
        });

    } catch (err) {
        console.error("Error restoring commit:", err);

        return res.status(500).json({
            error: "Restore failed",
        });
    }
}