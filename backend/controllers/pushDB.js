import mongoose from "mongoose";
import Commit from "../models/commitModel.js";
import Repository from "../models/repoModel.js";

export async function pushToRepo(req, res) {
    const { repoId } = req.params;
    const { commits } = req.body;

    if (!mongoose.Types.ObjectId.isValid(repoId)) {
        return res.status(400).json({
            error: "Invalid repository ID",
        });
    }

    if (!Array.isArray(commits)) {
        return res.status(400).json({
            error: "Commits must be an array",
        });
    }

    try {
        const repository = await Repository.findById(repoId);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // Only repository owner can push
        if (
            repository.owner.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                error: "You are not authorized to push to this repository",
            });
        }

        for (const commit of commits) {
            if (!commit.commitId) {
                continue;
            }

            const exists = await Commit.findOne({
                commitId: commit.commitId,
            });

            if (!exists) {
                await Commit.create({
                    repo: repoId,
                    author: req.user.id.toString(),
                    commitId: commit.commitId,
                    message: commit.message || "",
                    files: Array.isArray(commit.files)
                        ? commit.files
                        : [],
                    timestamp: commit.timestamp
                        ? new Date(commit.timestamp)
                        : new Date(),
                });
            }
        }

        return res.status(200).json({
            message: "Push successful",
        });

    } catch (err) {
        console.error("Push DB error:", err);

        return res.status(500).json({
            message: "Push failed",
        });
    }
}