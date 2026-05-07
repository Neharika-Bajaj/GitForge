import fs from "fs/promises"; //fs:file system
import path from "path";

export async function initRepo(){
    const repoPath= path.resolve(process.cwd(), ".NB-Git"); //creates a hidden folder, cwd: current working directory
    const commitsPath= path.join(repoPath,"commits");//commits is inside NB-Git so it is also indirectly hidden

    try{

        await fs.mkdir(repoPath,{recursive:true}); //recursive allows nesting of folders
        await fs.mkdir(commitsPath, {recursive:true});
        await fs.writeFile(
            path.join(repoPath, "config.json"),
            JSON.stringify({bucket: process.env.S3_BUCKET})
        );

        console.log("Repository initialized");


    }catch(err){
        console.log("Error initializing repository :", err);
    }

}