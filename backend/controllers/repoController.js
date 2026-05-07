import mongoose from "mongoose";
import Repository from "../models/repoModel.js";
import User from "../models/userModel.js";
import Issue from "../models/issueModel.js";

export async function createRepository(req,res){
    const {owner, name, issues,content, description,visibility} = req.body;

    try{
        if(!name){
            return res.status(400).json({error: "Repository name is required!"});
        }

        if(!mongoose.Types.ObjectId.isValid(owner)){
            return res.status(400).json({error: "User not found"});
        }

        const newRepository = new Repository({
            name,
            description,
            visibility,
            owner,
            content,
            issues,
        });

        const result = await newRepository.save();

        res.status(200).json({
            message:"Repository created!",
            repositoryID: result._id,
        });


    }catch(err){
        console.error("Error during repository creation: ",err.message);
       res.status(500).json({ error: "server error" });
    }
};

export async function getAllRepositories(req,res){
    try{

        const repositories = await Repository.find({})
        .populate("owner")
        .populate("issues");

        res.status(200).json(repositories);

    }catch(err){
        console.error("Error fetching the repositories: ",err);
        res.status(500).json({ error: "server error" });
    }
};

export async function fetchRepositoryById(req,res){
    const {id}= req.params;
    try{
        const repository = await Repository.find({_id: id })
        .populate("owner")
        .populate("issues");

        
        if (repository.length === 0) {
            return res.status(404).json({
                message: "No repositories found"
            });
        }

        res.status(200).json(repository);

    }catch(err){
        console.error("Error fetching the repository: ", err);
        res.status(500).json({ error: "server error" });
    }
};

export async function fetchRepositoryByName(req,res){
    const {name}= req.params;

    try{
        const repository = await Repository.find({name})
        .populate("owner")
        .populate("issues");

        if(repository.length == 0){
            res.status(404).json({message: "No repositories found"});
        }

        res.status(200).json(repository);

    }catch(err){
        console.error("Error fetching the repository");
        res.status(500).json({ error: "server error" });
    }
};

export async function fetchRepositoriesForCurrentUser(req,res){
   console.log(req.params);
  const { userID } = req.params;

    try{

        const repositories= await Repository.find({owner: userID});

        if(!repositories || repositories.length==0){
            return res.status(404).json({error: "User repositories not found!"});
        }

        res.json({message:"Repositories found!", repositories});

    }catch(err){
        console.error("Error during fetching user repositories: ", err);
        res.status(500).json({ error: "server error" });
    }
};

export async function updateRepositoryById(req,res){
    const {id} = req.params;
    const{content, description} = req.body;

    try{
        const repository = await Repository.findById(id);
        if(!repository){
            return res.status(404).json({error: "User repositories not found!"});
        }

        repository.content.push(content);
        repository.description= description;

        const updatedRepository = await repository.save();

        res.json({
            message:"Repository updated successfully",
            repository:updatedRepository,
        });

    }catch(err){
        console.error("Error during updating repositories: ", err);
        res.status(500).json({ error: "server error" });
    }
};

export async function toggleVisibilityById(req,res){
   const {id}= req.params;
   try{

    const repository= await Repository.findById(id);

    if(!repository){
        return res.status(404).json({error: "Repository not found"});
    }

    repository.visibility = !repository.visibility;

     const updatedRepository = await repository.save();

        res.json({
            message:"Repository visibility toggled successfully",
            repository:updatedRepository,
        });

   }catch(err){
    console.error("Error during toggling visibility : ", err);
        res.status(500).json({ error: "server error" });
   }
};

export async function deleteRepositoryById(req,res){
    const {id}= req.params;
    try{

      const repository= await Repository.findByIdAndDelete(id);
      if(!repository){
        return res.status(404).json({error:"Repository not found"});
      }  

      res.json({message:"Repository deleted successfully!"});

    }catch(err){
    console.error("Error during toggling visibility : ", err);
        res.status(500).json({ error: "server error" });
   }
};

