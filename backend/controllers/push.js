import fs from "fs/promises";
import path from "path";

export async function pushRepo() {
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

        let auth;

        try {
            auth = JSON.parse(
                await fs.readFile(authPath, "utf-8")
            );
        } catch {
            console.log(
                "You are not logged in. Please run: node index.js login"
            );
            return;
        }

        const token = auth.token;

        if (!token) {
            console.log(
                "Authentication token not found. Please login again."
            );
            return;
        }

        const commitDirs = await fs.readdir(commitsPath);

        const commitsData = [];

        for (const commitDir of commitDirs) {
            const commitPath = path.join(
                commitsPath,
                commitDir
            );

            const metadataPath = path.join(
                commitPath,
                "commit.json"
            );

            const metadata = JSON.parse(
                await fs.readFile(metadataPath, "utf-8")
            );

            const files = await fs.readdir(commitPath);

            const fileData = [];

            for (const file of files) {
                if (file === "commit.json") {
                    continue;
                }

                const filePath = path.join(
                    commitPath,
                    file
                );

                const fileContent = await fs.readFile(
                    filePath
                );

                fileData.push({
                    fileName: file,
                    content: fileContent.toString("base64"),
                });
            }

            commitsData.push({
                commitId: commitDir,
                message: metadata.message,
                timestamp: metadata.timestamp,
                files: fileData,
            });
        }

        const res = await fetch(
            `${serverUrl}/repo/${config.repositoryId}/push`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    commits: commitsData,
                }),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            console.log(
                data.message || data.error || "Push failed"
            );
            return;
        }

        console.log(data.message);

    } catch (err) {
        console.error("Error pushing:", err);
    }
}