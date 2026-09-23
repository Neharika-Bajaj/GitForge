import fs from "fs/promises";
import path from "path";

export async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".NB-Git");
    const commitsPath = path.join(repoPath, "commits");
    const configPath = path.join(repoPath, "config.json");
    const authPath = path.join(repoPath, "auth.json");

    try {
        const config = JSON.parse(
            await fs.readFile(configPath, "utf-8")
        );

        if (!config.repositoryId) {
            console.log(
                "This local repository is not connected to a GitForge repository."
            );
            return;
        }

        const serverUrl =
            config.serverUrl || process.env.SERVER_URL;

        if (!serverUrl) {
            console.log("SERVER_URL is not configured.");
            return;
        }

        let token;

        try {
            const auth = JSON.parse(
                await fs.readFile(authPath, "utf-8")
            );
            token = auth.token;
        } catch {
            token = process.env.GITFORGE_TOKEN;
        }

        if (!token) {
            console.log(
                "You are not logged in. Please run: node index.js login"
            );
            return;
        }

        const res = await fetch(
            `${serverUrl}/repo/${config.repositoryId}/pull`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await res.json();

        if (!res.ok) {
            console.log(
                data.message || data.error || "Pull failed"
            );
            return;
        }

        for (const commit of data.commits) {
            const commitDir = path.join(
                commitsPath,
                commit.commitId
            );

            await fs.mkdir(commitDir, {
                recursive: true,
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

            await fs.writeFile(
                path.join(commitDir, "commit.json"),
                JSON.stringify(
                    {
                        commitID: commit.commitId,
                        message: commit.message,
                        timestamp: commit.timestamp,
                    },
                    null,
                    2
                )
            );
        }

        console.log("Pull successful");

    } catch (err) {
        console.error("Pull failed:", err);
    }
}