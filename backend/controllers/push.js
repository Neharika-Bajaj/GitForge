import fs from "fs/promises";
import path from "path";

export async function pushRepo(){
    const repoPath = path.resolve(process.cwd(), ".NB-Git");
    const commitsPath = path.join(repoPath, "commits");

    try {
        const commitDirs = await fs.readdir(commitsPath);

        const commitsData = [];

        for (const commitDir of commitDirs) {
            const commitPath = path.join(commitsPath, commitDir);
            const files = await fs.readdir(commitPath);

            const fileData = [];

            for (const file of files) {
                const filePath = path.join(commitPath, file);
                const fileContent = await fs.readFile(filePath);

                fileData.push({
                    fileName: file,
                    content: fileContent.toString("base64")
                });
            }

            commitsData.push({
                commitId: commitDir,
                files: fileData
            });
        }

        // SEND TO BACKEND
        const res = await fetch("http://localhost:3000/repo/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                repo: "repo1",
                commits: commitsData
            })
        });

        const data = await res.json();
        console.log(data.message);

    } catch(err) {
        console.log("Error pushing:", err);
    }
}