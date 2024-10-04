import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const AuthMiddleware = async (req, res, next) => {
    const { authorization } = req.headers;

    console.log('Authorization Header:', authorization);

    if (!authorization) {
        return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authorization.split(' ')[1];

    try {
        const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        console.log('User ID from token:', _id);
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        req.userId = _id;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please log in again.', errorType: 'TokenExpiredError' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token. Request is not authorized.', errorType: 'JsonWebTokenError' });
        }
        res.status(500).json({ error: error.message, errorType: 'Other' });
    }
};


export default AuthMiddleware;