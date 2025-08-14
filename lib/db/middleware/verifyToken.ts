import jwt from 'jsonwebtoken';
import User from '../model/User';
import connectDB from '../db';

export default function verifyToken(token: string): Promise<any> {
    return new Promise((resolve, reject) => {
        if (!token) {
            return reject(new Error('No token provided'));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return reject(new Error('JWT Secret not found in environment variables.'));
        }

        jwt.verify(token, secret, async (err, decoded) => {
            if (err) {
                return reject(new Error('Invalid token'));
            }

            if (!decoded || typeof decoded === 'string') {
                return reject(new Error('Invalid token payload'));
            }

            try {
                await connectDB(); // ✅ Ensure DB is connected
                const user = await User.findById(decoded.id);
                if (!user) {
                    return reject(new Error('User not found'));
                }

                resolve(user);
            } catch (error) {
                console.error("💥 Error in verifyToken DB query:", error);
                reject(new Error('Database query failed'));
            }
        });
    });
}
