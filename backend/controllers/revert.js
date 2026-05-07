import fs from "fs/promises";
import path from "path";

export async function revertRepo(commitID) {
    const repoPath = path.resolve(process.cwd(), ".NB-Git");
    const projectPath = path.resolve(repoPath, "..");

    try {
        const res = await fetch(
            `http://localhost:3000/repo/revert/${commitID}`
        );

        const data = await res.json();

        if (!data.commit) {
            console.log("Commit not found");
            return;
        }

        for (const file of data.commit.files) {
            const filePath = path.join(projectPath, file.fileName);

            await fs.writeFile(
                filePath,
                Buffer.from(file.content, "base64")
            );
        }

        console.log(
            `Commit ${commitID} reverted successfully`
        );

    } catch (err) {
        console.error("Unable to revert:", err);
    }
}