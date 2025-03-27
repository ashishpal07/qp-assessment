import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET as string;

export const generateToken = (userId: number, role: string) => {
  return jwt.sign({ id: userId, role }, SECRET_KEY, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY);
};
