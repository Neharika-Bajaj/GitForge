import fs from "fs/promises";
import path from "path";

export async function initRepo() {
    const repoPath = path.resolve(process.cwd(), ".NB-Git");
    const commitsPath = path.join(repoPath, "commits");
    const stagingPath = path.join(repoPath, "staging");

    try {
        await fs.mkdir(repoPath, { recursive: true });
        await fs.mkdir(commitsPath, { recursive: true });
        await fs.mkdir(stagingPath, { recursive: true });

        const configPath = path.join(repoPath, "config.json");

        const config = {
            vcs: "GitForge",
            version: "1.0",
            initializedAt: new Date().toISOString(),
            repositoryId: null,
            serverUrl: process.env.SERVER_URL || null
        };

        await fs.writeFile(
            configPath,
            JSON.stringify(config, null, 2)
        );

        console.log("GitForge repository initialized successfully.");
        console.log(`Repository path: ${repoPath}`);

    } catch (err) {
        console.error(
            "Error initializing repository:",
            err
        );
    }
}