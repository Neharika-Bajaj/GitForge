import fs from "fs/promises";
import path from "path";

export async function revertRepo(commitID) {
    if (!commitID || typeof commitID !== "string") {
        console.log("Please specify a valid commit ID to revert.");
        return;
    }

    const repoPath = path.resolve(process.cwd(), ".NB-Git");
    const projectPath = path.resolve(repoPath, "..");
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
            `${serverUrl}/repo/${config.repositoryId}/revert/${commitID}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await res.json();

        if (!res.ok) {
            console.log(
                data.message ||
                data.error ||
                "Unable to restore commit"
            );
            return;
        }

        if (!data.commit) {
            console.log("Commit not found");
            return;
        }

        for (const file of data.commit.files) {
            const targetPath = path.resolve(
                projectPath,
                file.fileName
            );

            // Prevent a malicious filename from escaping
            // the local project directory.
            if (
                !targetPath.startsWith(
                    projectPath + path.sep
                )
            ) {
                console.log(
                    `Skipping unsafe file path: ${file.fileName}`
                );
                continue;
            }

            await fs.mkdir(
                path.dirname(targetPath),
                { recursive: true }
            );

            await fs.writeFile(
                targetPath,
                Buffer.from(file.content, "base64")
            );
        }

        console.log(
            `Commit ${commitID} restored successfully`
        );

    } catch (err) {
        console.error("Unable to restore commit:", err);
    }
}