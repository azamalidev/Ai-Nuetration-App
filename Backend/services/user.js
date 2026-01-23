import UserModel from "../models/user.js";
import passwordHash from "password-hash";
import jwt from "jsonwebtoken";




const UserService = {

  syncDevice: async (body) => {
    try {
      const { client_Device_Id } = body;
      console.log("client_Device_Id", client_Device_Id);

      const user = await UserModel.findOne({ client_Device_Id: client_Device_Id });
      if (!user) {
        return { message: "error", data: "User not found" };
      }


      return { message: "success", data: user };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },
  login: async ({ email, password }) => {
    try {
      const data = await UserModel.findOne({ email });

      if (!data) {
        return { message: "error", data: "Email is wrong" };
      }

      const isVerified = passwordHash.verify(password, data.password);

      if (!isVerified) {
        return { message: "error", data: "Password is wrong" };
      }

      delete data._doc.password;
      const token = await jwt.sign(data._doc, process.env.JWT_SECRET);
      if (token) {
        return { message: "success", data: { token, data } };
      } else {
        return { message: "error", data: "Token is not generated" };
      }
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  UserProfileByDeviceId: async (client_Device_Id) => {
    try {
      const prof = await UserModel.findOne({ client_Device_Id }).select({ password: 0 });
      return prof
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  getNutratious: async () => {
    try {
      const data = await UserModel.find({ role: "NUTRITIONIST" }); // 👈 use .find()
      return { message: "success", data };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  add: async (body) => {
    try {
      const data = await UserModel.findOne({ email: body.email });
      if (data) {
        return { message: "failed", data: "User already exist" };
      }

      const hashedPassword = passwordHash.generate(body.password);
      body.password = hashedPassword;

      const savedData = await UserModel.create(body);
      if (savedData) {
        return { message: "success", data: savedData };
      }
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  UserProfile: async (id) => {
    try {
      const prof = await UserModel.findById(id).select({ password: 0 });
      return prof


    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  update: async (body) => {
    try {
      const _id = body.id
      console.log("sent data", body)
      const updatedUser = await UserModel.findByIdAndUpdate(_id, body, { new: true, runValidators: true }).select({ password: 0 });
      console.log("updated data", updatedUser)
      return updatedUser

    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  delete: async (id) => {
    try {
      const deletedDish = await UserModel.findByIdAndDelete(id);
      if (!deletedDish) {
        return { message: "error", data: "user not found" };
      }
      return { message: "success", data: "user deleted successfully" };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  getAll: async () => {
    try {


      const users = await UserModel.find();
      return { message: "success", data: users };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  addConsultationRequest: async (userId, request) => {
    try {
      const user = await UserModel.findById(userId);
      if (!user) return { message: "error", data: "User not found" };

      user.consultationRequests.push(request);
      await user.save();

      return { message: "success", data: user };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

  // Get single dish by ID
  getById: async (id) => {
    try {
      const user = await UserModel.findById(id);
      if (!user) {
        return { message: "error", data: "user not found" };
      }
      return { message: "success", data: user };
    } catch (error) {
      return { message: "error", data: error.message };
    }
  },

}


export default UserService;
