import express from "express";
import {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile
} from "../controllers/userController.js";

export const userRouter= express.Router();

userRouter.get("/allUsers",getAllUsers);
userRouter.post("/signup",signup);
userRouter.post("/login",login);
userRouter.get("/userProfile/:id",getUserProfile);
userRouter.put("/updateProfile/:id",updateUserProfile);
userRouter.delete("/deleteProfile/:id",deleteUserProfile);