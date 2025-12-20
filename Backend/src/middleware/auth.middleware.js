import jwt from 'jsonwebtoken';
import { findUserById } from '../models/User.model.js';
import { ENV } from '../lib/env.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded) return res.status(401).json({ message: 'Unauthorized: Invalid token' });

        const user = await findUserById(decoded.userId);
        if(!user) return res.status(401).json({ message: 'Unauthorized: User not found' });

        // remove sensitive fields before attaching to request
        if (user.password) delete user.password;

        req.user = user;
        next();

    } catch (error) {
        console.log("Error in protectRoute middleware:", error);
        res.status(500).json({ message: 'Unauthorized: Token verification failed' });
    }
}