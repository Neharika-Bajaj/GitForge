import { ADDRGETNETWORKPARAMS } from "dns/promises";
import fs from "fs/promises";
import path from "path";

export async function addRepo(filePath){
    const repoPath= path.resolve(process.cwd(),".NB-Git");
    const stagingPath= path.join(repoPath,"staging");

    try{
        await fs.mkdir(stagingPath, {recursive:true});
        const fileName= path.basename(filePath);
        await fs.copyFile(filePath, path.join(stagingPath, fileName));
        console.log(`File ${fileName} added to the staging area!`);

    }catch(err){
        console.log("Error adding file:",err);
    }
    
}