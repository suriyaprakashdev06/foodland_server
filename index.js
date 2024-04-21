const express = require("express")
const app = express()
const mongoose = require("mongoose")
var nodemailer = require('nodemailer');
app.use(express.json())
const cors = require("cors")
require("dotenv").config();
app.use(cors())
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { sendEmail } = require('./emailService');
mongoose.set('strictQuery', false);

const mongoUrl = "mongodb+srv://suriya:suriya@cluster0.bwlnj7q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

mongoose.connect(mongoUrl, {
    useNewUrlParser: true,
})
.then(() => {
    console.log("Connected to database");
})
.catch((error) => {
    console.error("Database connection error:", error);
    process.exit(1);
});
require("./userDetails")

const User = mongoose.model("UserInfo")

app.post("/register", async (req, res) => {
  const { id ,name, email, password } = req.body;
  try {
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(409).json({ msg : "User already exists", status: "Conflict" });
    }

    await User.create({
      id,
      name,
      email,
      password,
    });

    return res.status(201).json({ status: "ok", msg: "User registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ status: "error", msg: "Internal Server Error" });
  }
});

app.post("/login-user", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User not found", status: "User Not Found" });
    }

    if (password === user.password) {
      return res.status(200).json({ status: "ok", data: { email: user.email, name: user.name } });
    } else {
      return res.status(401).json({ msg: "Invalid Password", status: "Invalid Password" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ msg: "Internal Server Error", status: "Error" });
  }
});

app.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    const generateOtp = Math.floor(1000 + Math.random() * 9000)
    if (!user) {
      console.log("User Not found");
      return res.status(404).json({ error: "User not found", msg: "Please Enter Valid Email" });
    } else {

      sendEmail(email, generateOtp, user.name);
      return res.status(200).json({ success: true, status: 'ok',msg : "OTP has been sent to registered email" ,OTP: generateOtp });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal Server Error", msg: "Something went wrong" });
  }
});
app.post("/update-password", async (req, res) => {
  const { email, newPass } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log(user.password, newPass);
    user.password = newPass
    await user.save();
    return res.json({ status: 'ok', success: true, msg: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ success: false, msg: "Internal server error." });
  }


});
app.listen(5000, () => {
  console.log("server started");
})
