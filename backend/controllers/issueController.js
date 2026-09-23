import mongoose from "mongoose";
import Repository from "../models/repoModel.js";
import Issue from "../models/issueModel.js";


export async function createIssue(req, res) {
    const { title, description } = req.body;
    const { id: repositoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
        return res.status(400).json({
            error: "Invalid repository ID",
        });
    }

    if (!title || !title.trim()) {
        return res.status(400).json({
            error: "Issue title is required",
        });
    }

    if (!description || !description.trim()) {
        return res.status(400).json({
            error: "Issue description is required",
        });
    }

    try {
        const repository = await Repository.findById(repositoryId);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // Only the repository owner can create issues
        if (repository.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                error: "You are not authorized to create issues in this repository",
            });
        }

        const issue = new Issue({
            title: title.trim(),
            description: description.trim(),
            repository: repositoryId,
        });

        await issue.save();

        await Repository.findByIdAndUpdate(repositoryId, {
            $push: {
                issues: issue._id,
            },
        });

        return res.status(201).json(issue);

    } catch (err) {
        console.error("Error during issue creation:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function updateIssueByID(req, res) {
    const { id } = req.params;
    const { title, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "Invalid issue ID",
        });
    }

    try {
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({
                error: "Issue not found",
            });
        }

        const repository = await Repository.findById(issue.repository);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // Only repository owner can update its issues
        if (repository.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                error: "You are not authorized to modify this issue",
            });
        }

        if (title !== undefined) {
            if (!title.trim()) {
                return res.status(400).json({
                    error: "Issue title cannot be empty",
                });
            }

            issue.title = title.trim();
        }

        if (description !== undefined) {
            if (!description.trim()) {
                return res.status(400).json({
                    error: "Issue description cannot be empty",
                });
            }

            issue.description = description.trim();
        }

        if (status !== undefined) {
            if (!["open", "closed"].includes(status)) {
                return res.status(400).json({
                    error: "Invalid issue status",
                });
            }

            issue.status = status;
        }

        await issue.save();

        return res.status(200).json({
            message: "Issue updated successfully",
            issue,
        });

    } catch (err) {
        console.error("Error during issue update:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function deleteIssueByID(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "Invalid issue ID",
        });
    }

    try {
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({
                error: "Issue not found",
            });
        }

        const repository = await Repository.findById(issue.repository);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // Only repository owner can delete its issues
        if (repository.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                error: "You are not authorized to delete this issue",
            });
        }

        await Issue.findByIdAndDelete(id);

        await Repository.findByIdAndUpdate(repository._id, {
            $pull: {
                issues: issue._id,
            },
        });

        return res.status(200).json({
            message: "Issue deleted successfully",
        });

    } catch (err) {
        console.error("Error during issue deletion:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function getAllIssues(req, res) {
    const { id: repositoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(repositoryId)) {
        return res.status(400).json({
            error: "Invalid repository ID",
        });
    }

    try {
        const repository = await Repository.findById(repositoryId);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        const issues = await Issue.find({
            repository: repositoryId,
        });

        return res.status(200).json(issues);

    } catch (err) {
        console.error("Error fetching issues:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function getIssueByID(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "Invalid issue ID",
        });
    }

    try {
        const issue = await Issue.findById(id);

        if (!issue) {
            return res.status(404).json({
                error: "Issue not found",
            });
        }

        return res.status(200).json(issue);

    } catch (err) {
        console.error("Error fetching issue:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}