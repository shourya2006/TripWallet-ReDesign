import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Document } from 'mongoose';
import { BaseService } from './BaseService';
const User = require('../models/User');

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  token?: string;
}

interface AuthResponse {
  user: IUser;
  token: string;
  refreshToken: string;
}

const SECRET_KEY = process.env.JWT_SECRET || '';
const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET || '';

class AuthService extends BaseService<IUser> {

  constructor() {
    super(User);
  }


  private generateAccessToken(userId: string, email: string): string {
    return jwt.sign({ user_id: userId, email }, SECRET_KEY, { expiresIn: '1d' });
  }


  private generateRefreshToken(userId: string, email: string): string {
    return jwt.sign({ user_id: userId, email }, REFRESH_SECRET_KEY, { expiresIn: '30d' });
  }


  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const existingUser = await this.model.findOne({ email });
    if (existingUser) {
      throw { status: 409, message: 'User Already Exists. Please Login' };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const user = await this.create({
      username,
      email: email.toLowerCase(),
      password: encryptedPassword,
    });

    const token = this.generateAccessToken(String(user._id), email);
    const refreshToken = this.generateRefreshToken(String(user._id), email);

    return { user, token, refreshToken };
  }


  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.model.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw { status: 400, message: 'Invalid Credentials' };
    }

    const token = this.generateAccessToken(String(user._id), email);
    const refreshToken = this.generateRefreshToken(String(user._id), email);

    return { user, token, refreshToken };
  }


  refreshAccessToken(refreshToken: string): { token: string } {
    try {
      const decoded: any = jwt.verify(refreshToken, REFRESH_SECRET_KEY);
      const token = this.generateAccessToken(decoded.user_id, decoded.email);
      return { token };
    } catch (err) {
      throw { status: 403, message: 'Invalid Refresh Token' };
    }
  }


  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw { status: 400, message: 'Invalid current password' };
    }

    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    await this.update(userId, { password: encryptedPassword });
  }
}

export default AuthService;
