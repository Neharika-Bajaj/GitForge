import mongoose from "mongoose";
import User from "../models/userModel.js"
import Issue from "../models/issueModel.js";


export async function createIssue(req,res){
    const {title, description}= req.body;
    const {id}= req.params;

    try{const issue= new Issue({
        title,
        description,
        repository:id,
    });

    await issue.save();

    res.status(201).json(issue);
}catch(err){
        console.error("Error during issue creation: ",err.message);
        res.status(500).send("Server Error");
    }
};

export async function updateIssueByID(req,res){
    const {id}= req.params;
    const {title, description,status}= req.body;
    try{

        const issue= await Issue.findById(id);
        if(!issue){
            return res.status(404).json({error: "Issue not found!"});
        }

        issue.title= title;
        issue.description= description;
        issue.status= status;

       await  issue.save();

       res.json({message: "Issue updated"},issue);


    }catch(err){
        console.error("Error during issue updation: ",err.message);
        res.status(500).send("Server Error");
    }
};

export async function deleteIssueByID(req,res){
   const {id}= req.params;
   try{

    const issue= await Issue.findByIdAndDelete(id);
    if(!issue){
        return res.status(404).json({error: "Issue not found!"});
    }

    res.json({message: "Issue Deleted"})

   }catch(err){
        console.error("Error during deleting issue: ",err.message);
        res.status(500).send("Server Error");
    }
};

export async function getAllIssues(req,res){
    const {id}= req.params;
    try{
        const issues= Issue.find({repository:id});
        if(!issues){
           return res.status(404).json({error: "Issues not found!"});
        }

        res.status(200).json(issues);

    }catch(err){
        console.error("Error during fetching issues: ",err.message);
        res.status(500).send("Server Error");
    }
};

export async function getIssueByID(req,res){
    const {id}=req.params;
    try{
        const issue = await Issue.findById(id);
        if(!issue){

             return res.status(404).json({error: "Issues not found!"});

        }
        res.json(issue);

    }catch(err){
        console.error("Error during fetching issues: ",err.message);
        res.status(500).send("Server Error");
    }
};