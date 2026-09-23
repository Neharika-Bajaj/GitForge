export const authorizeSelf = (req, res, next) => {
    const requestedUserId = req.params.id;
    const authenticatedUserId = req.user?.id;

    if (!authenticatedUserId) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    if (requestedUserId !== authenticatedUserId.toString()) {
        return res.status(403).json({
            message: "You are not authorized to perform this action",
        });
    }

    next();
};