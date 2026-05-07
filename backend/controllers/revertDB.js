import Commit from "../models/commitModel.js";

export async function revertFromRepo(req, res) {
    try {
        const { commitID } = req.params;

        const commit = await Commit.findOne({
            commitId: commitID
        });

        if (!commit) {
            return res.status(404).json({
                message: "Commit not found"
            });
        }

        res.status(200).json({
            commit
        });

    } catch (err) {
        res.status(500).json({
            message: "Revert failed",
            error: err.message
        });
    }
}