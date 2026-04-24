import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  let token = req.headers.authorization;
  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};