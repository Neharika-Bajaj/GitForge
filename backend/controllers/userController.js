import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"
import dotenv from "dotenv";
import User from "../models/userModel.js"
import { validationResult } from "express-validator";

dotenv.config();

export async function signup(req, res) {
    const { username, password, email } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array(),
        });
    }

    try {
        const user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({ message: "User already exists!" });

        }
        const existingEmail = await User.findOne({ email });

if (existingEmail) {
   return res.status(400).json({
      message: "Email already exists!"
   });
}

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories: [],
            followedUsers: [],
            starRepos: [],
        }

        const result = await User.create(newUser);

        const token = jwt.sign({ id: result._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });

        res.json({ token, userId: result._id});
    } catch (err) {
        console.error("Error signing up:", err);
        res.status(500).send("Server error");
    }
};

export async function login(req, res) {
    const { email, password } = req.body;
    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" });
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error("Error during login: ", err.message);
        res.status(500).send("Server error!");
    };
};

export async function getAllUsers(req, res) {
    try {
        const users = await User.find().select("-password");
        res.json(users);

    } catch (err) {
        console.error("Error during fetching: ", err.message);
        res.status(500).send("Server error!");
    };
};

export async function getUserProfile(req, res) {
    const currentID = req.params.id;

    try {
        const user = await User.findById(currentID).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.send(user);

    } catch (err) {
        console.error("Error during fetching: ", err.message);
        res.status(500).send("Server error!");
    }
};

export async function updateUserProfile(req, res) {
    const currentID = req.params.id;
    const { email, password } = req.body;

    try {
        let updateFields = { email };
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.password = hashedPassword;
        }

        const result = await User.findByIdAndUpdate(
            currentID,
            { $set: updateFields },
            { new: true }
        ).select("-password");

        if (!result) {
            return res.status(404).json({ message: "User not found" });
        }
        res.send(result);

    } catch (err) {
        console.error("Error while updating: ", err.message);
        res.status(500).send("Server error!");
    }
};

export async function deleteUserProfile(req, res) {
    const currentID = req.params.id;

    try {
        const result = await User.findByIdAndDelete(currentID);

        if (!result) {
            return res.status(404).json({ message: "User not found!" });
        }

        res.json({ message: "User profile deleted!" });
    } catch (err) {
        console.error("Error during updating: ", err.message);
        res.status(500).send("Server error!");
    }

};