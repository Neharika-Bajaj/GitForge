import express from "express";
import {body} from "express-validator";
import {
    authMiddleware
} from "../middleware/authMiddleware.js";

import {
    authorizeSelf
} from "../middleware/authorizeMiddleware.js";
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
userRouter.post(
  "/signup",
  [
    body("username")
      .notEmpty()
      .withMessage("Username required"),

    body("email")
      .isEmail()
      .withMessage("Valid email required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  signup
);
userRouter.post("/login",login);
userRouter.get("/userProfile/:id",getUserProfile);
userRouter.put(
    "/updateProfile/:id",
    authMiddleware,
    authorizeSelf,
    updateUserProfile
);

userRouter.delete(
    "/deleteProfile/:id",
    authMiddleware,
    authorizeSelf,
    deleteUserProfile
);