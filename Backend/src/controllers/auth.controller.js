import { findUserByEmail, createUser, findUserByIdAndUpdate } from "../models/User.model.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  // Ensure password is treated as a string (clients might send numeric-only passwords as numbers)
  const pwd = typeof password === 'string' ? password : String(password ?? '');
  const trimmedPwd = pwd.trim();

  try {
    if (!fullName || !email || !pwd) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (pwd.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // check if email is valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    // 123456 => $dnjasdkasj_?dmsakmk
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPwd, salt);

    const newUser = await createUser({ fullName, email, password: hashedPassword });

    // debug: show incoming param and returned DB row to trace missing name
    console.log('signup: received fullName param =', fullName);
    console.log('signup: createUser returned =', newUser);

    if (newUser) {
      generateToken(newUser.id, res);

      res.status(201).json({
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      // todo: send a welcome email to user
      try {
        await sendWelcomeEmail(newUser.email, newUser.fullName, ENV.CLIENT_URL);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }

    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.log('Error in signup controller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const pwd = typeof password === 'string' ? password : String(password ?? '');
  const trimmedPwd = pwd.trim();

  if (!email || !pwd) {
    return res.status(400).json({ message: 'Email and password are required' });
  }
  
  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: 'Invalid credentials...by email' });

    // never tell the client which one is incorrect: password or email

    const isPasswordValid = await bcrypt.compare(trimmedPwd, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials...by password' });

    generateToken(user.id, res);

    res.status(200).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });

  } catch (error){
    console.log('Error in login controller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = (_, res) => {
  res.cookie("jwt", "", { maxAge: 0});
  res.status(200).json({ message: "Logged out successfully"})
}

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      if(!profilePic) return res.status(400).json({ message: 'Profile picture URL is required' });

      const userId = req.user.id;

      const uploadResponse = await cloudinary.uploader.upload(profilePic)

      const updatedUser = await findUserByIdAndUpdate(
        userId,
        {profilePic:uploadResponse.secure_url},
        {new:true}
      );

      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("Error in update profile:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
}