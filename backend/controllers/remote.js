import fs from "fs/promises";
import path from "path";

export async function remoteRepo(repositoryId) {
    const repoPath = path.resolve(process.cwd(), ".NB-Git");
    const configPath = path.join(repoPath, "config.json");

    try {
        await fs.access(repoPath);
    } catch {
        console.log("Not a GitForge repository. Please run: node index.js init");
        return;
    }

    try {
        let config = {};
        try {
            config = JSON.parse(await fs.readFile(configPath, "utf-8"));
        } catch {
            config = {
                vcs: "GitForge",
                version: "1.0",
                initializedAt: new Date().toISOString(),
                repositoryId: null,
                serverUrl: process.env.SERVER_URL || null,
            };
        }

        // If no repositoryId is passed, display current remote configuration
        if (!repositoryId) {
            console.log(`Current remote repository ID: ${config.repositoryId || "None (not linked)"}`);
            if (config.serverUrl) {
                console.log(`Server URL: ${config.serverUrl}`);
            }
            return;
        }

        const trimmedId = repositoryId.trim();

        if (!trimmedId) {
            console.log("Please provide a valid repository ID.");
            return;
        }

        // Validate 24-character hexadecimal MongoDB ObjectId
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(trimmedId);
        if (!isValidObjectId) {
            console.log("Warning: Repository ID should be a 24-character hex MongoDB ObjectId.");
        }

        config.repositoryId = trimmedId;

        await fs.writeFile(
            configPath,
            JSON.stringify(config, null, 2)
        );

        console.log(`Repository successfully linked to remote ID: ${trimmedId}`);

    } catch (err) {
        console.error("Error configuring remote repository:", err.message);
    }
}
