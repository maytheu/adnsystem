import { env, prisma } from '@apps/core';
import { AppError } from '@apps/error';
import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

class AuthService {
  login = async (data: { email: string; password: string }) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: { password: true, id: true },
      });
      if (user) return new AppError('User cannot be authenticated', 401);

      const confirmPassword = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!confirmPassword)
        return new AppError('User cannot be authenticated', 401);

      return this.signJwt(`${user.id}`);
    } catch (error) {
      return error;
    }
  };

  signup = async (data: User) => {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: { password: true },
      });
      if (user) return new AppError('Account already created', 400);

      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(user.password, salt);

      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: hashPassword,
          notificationType: data.notificationType,
        },
      });
      //   emit value to wallet service
    //    emit signup notification
      return this.signJwt(newUser.id.toString());
    } catch (error) {
      return error;
    }
  };

  private signJwt = (id: string) => {
    return jwt.sign(id, env.SECRET_KEY, { expiresIn: '1d' });
  };
}

export default new AuthService();
