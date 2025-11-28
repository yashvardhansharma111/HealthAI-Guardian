import User from "../models/user.model";

async function findByEmail(email: string) {
  return User.findOne({ email });
}

async function createUser(data: any) {
  return User.create(data);
}

export default { findByEmail, createUser };
