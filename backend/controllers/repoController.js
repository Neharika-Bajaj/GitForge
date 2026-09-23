import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import Repository from "../models/repoModel.js";
import User from "../models/userModel.js";
import Commit from "../models/commitModel.js";

export async function createRepository(req, res) {
    const { name, content, description, visibility } = req.body;
    const owner = req.user.id;

    try {
        if (!name || !name.trim()) {
            return res.status(400).json({
                error: "Repository name is required!",
            });
        }

        const trimmedName = name.trim();

        const existingRepo = await Repository.findOne({
            name: trimmedName,
        });

        if (existingRepo) {
            return res.status(400).json({
                error: "Repository already exists",
            });
        }

        const user = await User.findById(owner);

        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        const newRepository = new Repository({
            name: trimmedName,
            description: description || "",
            visibility: visibility ?? true,
            owner,
            content: Array.isArray(content) ? content : [],
            issues: [],
        });

        const result = await newRepository.save();

        await User.findByIdAndUpdate(owner, {
            $push: {
                repositories: result._id,
            },
        });

        return res.status(201).json({
            message: "Repository created!",
            repositoryID: result._id,
        });

    } catch (err) {
        console.error("Error during repository creation:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function getAllRepositories(req, res) {
    try {
        const repositories = await Repository.find({ visibility: true })
            .populate("owner", "-password")
            .populate("issues");

        return res.status(200).json(repositories);

    } catch (err) {
        console.error("Error fetching repositories:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function fetchRepositoryById(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "Invalid repository ID",
        });
    }

    try {
        const repository = await Repository.findById(id)
            .populate("owner", "-password")
            .populate("issues");

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // If repository is private, verify user is the owner
        if (!repository.visibility) {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    error: "Authentication required for private repository",
                });
            }

            const parts = authHeader.split(" ");
            if (parts.length !== 2 || parts[0] !== "Bearer") {
                return res.status(401).json({
                    error: "Invalid authorization header format",
                });
            }

            const token = parts[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                const ownerId = (repository.owner._id || repository.owner).toString();
                if (ownerId !== decoded.id.toString()) {
                    return res.status(403).json({
                        error: "You are not authorized to view this private repository",
                    });
                }
            } catch {
                return res.status(401).json({
                    error: "Invalid or expired token",
                });
            }
        }

        return res.status(200).json(repository);

    } catch (err) {
        console.error("Error fetching repository:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function fetchRepositoryByName(req, res) {
    const { name } = req.params;

    if (!name || !name.trim()) {
        return res.status(400).json({
            error: "Repository name is required",
        });
    }

    try {
        const repository = await Repository.findOne({
            name: name.trim(),
        })
            .populate("owner", "-password")
            .populate("issues");

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        return res.status(200).json(repository);

    } catch (err) {
        console.error("Error fetching repository by name:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function fetchRepositoriesForCurrentUser(req, res) {
    const userID = req.user.id;

    try {
        const repositories = await Repository.find({
            owner: userID,
        })
            .populate("owner", "-password")
            .populate("issues");

        return res.status(200).json({
            repositories,
        });

    } catch (err) {
        console.error(
            "Error fetching current user's repositories:",
            err
        );

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function updateRepositoryById(req, res) {
    const { id } = req.params;
    const { content, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "Invalid repository ID",
        });
    }

    try {
        const repository = await Repository.findById(id);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // Authorization check
        if (repository.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                error: "You are not authorized to modify this repository",
            });
        }

        if (content !== undefined) {
            if (!Array.isArray(content)) {
                return res.status(400).json({
                    error: "Content must be an array",
                });
            }

            repository.content = content;
        }

        if (description !== undefined) {
            repository.description = description;
        }

        const updatedRepository = await repository.save();

        return res.status(200).json({
            message: "Repository updated successfully",
            repository: updatedRepository,
        });

    } catch (err) {
        console.error("Error updating repository:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function toggleVisibilityById(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "Invalid repository ID",
        });
    }

    try {
        const repository = await Repository.findById(id);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // Authorization check
        if (repository.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                error: "You are not authorized to modify this repository",
            });
        }

        repository.visibility = !repository.visibility;

        const updatedRepository = await repository.save();

        return res.status(200).json({
            message: "Repository visibility toggled successfully",
            repository: updatedRepository,
        });

    } catch (err) {
        console.error("Error toggling repository visibility:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function deleteRepositoryById(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "Invalid repository ID",
        });
    }

    try {
        const repository = await Repository.findById(id);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // Authorization check
        if (repository.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({
                error: "You are not authorized to delete this repository",
            });
        }

        await Repository.findByIdAndDelete(id);

        await User.findByIdAndUpdate(repository.owner, {
            $pull: {
                repositories: repository._id,
            },
        });

        return res.status(200).json({
            message: "Repository deleted successfully!",
        });

    } catch (err) {
        console.error("Error deleting repository:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}


export async function fetchRepositoryCommits(req, res) {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
            error: "Invalid repository ID",
        });
    }

    try {
        const repository = await Repository.findById(id);

        if (!repository) {
            return res.status(404).json({
                error: "Repository not found",
            });
        }

        // If repository is private, verify user is the owner
        if (!repository.visibility) {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    error: "Authentication required for private repository",
                });
            }

            const token = authHeader.split(" ")[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                if (repository.owner.toString() !== decoded.id.toString()) {
                    return res.status(403).json({
                        error: "You are not authorized to view commits of this private repository",
                    });
                }
            } catch {
                return res.status(401).json({
                    error: "Invalid or expired token",
                });
            }
        }

        const commits = await Commit.find({
            repo: id,
        }).sort({
            timestamp: -1,
        });

        return res.status(200).json({
            commits,
        });

    } catch (err) {
        console.error("Error fetching repository commits:", err);

        return res.status(500).json({
            error: "Server error",
        });
    }
}