import Commit from "../models/commitModel.js";

export async function pushToRepo(req, res) {
    try {
        const { repo, commits } = req.body;

        for (const commit of commits) {
            const exists = await Commit.findOne({
                commitId: commit.commitId
            });

            if (!exists) {
                await Commit.create({
                    repo,
                    author: "test-user",
                    commitId: commit.commitId,
                    files: commit.files
                });
            }
        }

        res.status(200).json({
            message: "Push successful"
        });

    } catch (err) {
        console.error("Push DB error:", err);
        res.status(500).json({
            message: "Push failed"
        });
    }
}