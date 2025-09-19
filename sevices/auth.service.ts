import { UserModel } from "../mongodb/db";

export const createUser = async (email: string, password: string) => {
  await UserModel.create({
    email,
    password,
  });
};

export const findUserByEmail = async (email: string) => {
  const user = await UserModel.findOne({
    email,
  });
  return user;
};
