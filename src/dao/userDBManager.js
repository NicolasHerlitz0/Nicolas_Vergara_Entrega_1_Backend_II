import userModel from "./models/userModel.js";

export class userDBManager {
  constructor() {}

  async getUserByEmail(email) {
    try {
      const user = await userModel.findOne({ email });
      return user;
    } catch (error) {
      throw new Error(`Error getting user by email: ${error.message}`);
    }
  }

  async getUserByID(id) {
    try {
      const user = await userModel.findById(id).populate("cart");
      return user;
    } catch (error) {
      throw new Error(`Error getting user by ID: ${error.message}`);
    }
  }

  async createUser(userData) {
    try {
      const user = await userModel.create(userData);
      return user;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  async updateUser(id, userData) {
    try {
      const user = await userModel.findByIdAndUpdate(id, userData, {
        new: true,
      });
      return user;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  async deleteUser(id) {
    try {
      const user = await userModel.findByIdAndDelete(id);
      return user;
    } catch (error) {
      throw new Error(`Error deleting user: ${error.message}`);
    }
  }

  async getAllUsers() {
    try {
      const users = await userModel.find({}).select(); //('-password');
      return users;
    } catch (error) {
      throw new Error(`Error getting users: ${error.message}`);
    }
  }
}
