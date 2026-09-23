import mongoose from "mongoose";
import Commit from "../models/commitModel.js";
import Repository from "../models/repoModel.js";

export async function pullFromRepo(req, res) {
    const { repoId } = req.params;

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

        // Only the repository owner can pull commits for now.
        if (
            repository.owner.toString() !==
            req.user.id.toString()
        ) {
            return res.status(403).json({
                error: "You are not authorized to pull this repository",
            });
        }

        const commits = await Commit.find({
            repo: repoId,
        }).sort({
            timestamp: 1,
        });

        return res.status(200).json({
            commits,
        });

    } catch (err) {
        console.error("Pull DB error:", err);

        return res.status(500).json({
            message: "Pull failed",
        });
    }
}