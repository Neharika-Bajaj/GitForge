import fs from "fs/promises";
import path from "path";
import readline from "readline";

export async function loginRepo() {
    const repoPath = path.resolve(process.cwd(), ".NB-Git");
    const authPath = path.join(repoPath, "auth.json");
    const configPath = path.join(repoPath, "config.json");

    try {
        // Check whether a GitForge repository has been initialized
        await fs.access(repoPath);

        let serverUrl = process.env.SERVER_URL;

        try {
            const config = JSON.parse(
                await fs.readFile(configPath, "utf-8")
            );
            if (config.serverUrl) {
                serverUrl = config.serverUrl;
            }
        } catch {
            // config file may not exist or could not be parsed
        }

        if (!serverUrl) {
            console.log("SERVER_URL is not configured.");
            return;
        }

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        const question = (query) =>
            new Promise((resolve) => {
                rl.question(query, resolve);
            });

        const email = await question("Email: ");
        const password = await question("Password: ");

        rl.close();

        const response = await fetch(
            `${serverUrl}/login`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            }
        );

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            data = {
                message: text || "Login failed",
            };
        }

        if (!response.ok) {
            console.log(data.message || "Login failed");
            return;
        }

        await fs.writeFile(
            authPath,
            JSON.stringify(
                {
                    token: data.token,
                    userId: data.userId,
                },
                null,
                2
            )
        );

        console.log("Login successful.");
        console.log(`User ID: ${data.userId}`);

    } catch (err) {
        console.error(
            "Error during login:",
            err
        );
    }
}