import fs from "fs/promises";
import path from "path";

export async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".NB-Git");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const res = await fetch("http://localhost:3000/repo/pull");
        const data = await res.json();

        for (const commit of data.commits) {
            const commitDir = path.join(
                commitsPath,
                commit.commitId
            );

            await fs.mkdir(commitDir, {
                recursive: true
            });

            for (const file of commit.files) {
                const filePath = path.join(
                    commitDir,
                    file.fileName
                );

                await fs.writeFile(
                    filePath,
                    Buffer.from(file.content, "base64")
                );
            }
        }

        console.log("Pull successful");
    } catch (err) {
        console.error("Pull failed:", err);
    }
}