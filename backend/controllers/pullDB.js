import Commit from "../models/commitModel.js";

export async function pullFromRepo(req, res) {
    try {
        const commits = await Commit.find({})
            .sort({ timestamp: 1 });

        res.status(200).json({
            commits
        });
    } catch (err) {
        res.status(500).json({
            message: "Pull failed",
            error: err.message
        });
    }
}