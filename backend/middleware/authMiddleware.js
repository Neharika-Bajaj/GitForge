import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Authorization header is missing
        if (!authHeader) {
            return res.status(401).json({
                message: "Authentication required",
            });
        }

        // Expected format:
        // Authorization: Bearer <token>
        const parts = authHeader.split(" ");

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({
                message: "Invalid authorization header format",
            });
        }

        const token = parts[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );

        // The token was created with { id: user._id }
        req.user = {
            id: decoded.id,
        };

        next();

    } catch (err) {
        console.error("Authentication error:", err.message);

        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Token expired",
            });
        }

        return res.status(401).json({
            message: "Invalid token",
        });
    }
};