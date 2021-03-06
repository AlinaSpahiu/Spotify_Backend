const { Schema } = require("mongoose");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  refreshTokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//remove things that we dont need to get to show to FE
UserSchema.methods.toJSON = function () {
  const data = this;
  const dataObject = data.toObject();

  delete dataObject.password;
  delete dataObject.__v;
  delete dataObject.refreshTokens;
  return dataObject;
};

//check the login
UserSchema.statics.findByCredentials = async (username, password) => {
  const user = await UserModel.findOne({ username });
  const ifMatch = await bcrypt.compare(password, user.password);
  if (!ifMatch) {
    const badLogin = new Error("Your Login Details Are Wrong");
    badLogin.httpStatusCode = 401;
    throw badLogin;
  }
  return user;
};
//save pw to hash the password
UserSchema.pre("save", async function (next) {
  const data = this;
  if (data.isModified("password")) {
    data.password = await bcrypt.hash(data.password, 7);
  }
  next();
});

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;
