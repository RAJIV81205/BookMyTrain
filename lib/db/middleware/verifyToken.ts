import jwt from 'jsonwebtoken';
import User from '../model/User';

export default function verifyToken(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        if (!token) {
            return reject(new Error('No token provided'));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return reject(new Error('JWT Secret not found in environment variables.'));
        }

        try {
            jwt.verify(token, secret, async (err, decoded) => {
                if (err) {
                    return reject(new Error('Invalid token'));
                }

                if (!decoded || typeof decoded === 'string') {
                    return reject(new Error('Invalid token payload'));
                }

                const user = await User.findById(decoded.id);
                if (!user) {
                    return reject(new Error('User not found'));
                }

                resolve(true);
            });

        } catch (error) {
            reject(new Error('Token verification failed'));
        }


    });
}
