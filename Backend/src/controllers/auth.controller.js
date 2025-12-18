import { findUserByEmail, createUser } from "../models/User.model.js";
import bcrypt from 'bcryptjs';
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  // Ensure password is treated as a string (clients might send numeric-only passwords as numbers)
  const pwd = typeof password === 'string' ? password : String(password ?? '');

  try {
    if (!fullName || !email || !pwd) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const trimmedPwd = pwd.trim();
    if (trimmedPwd.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(trimmedPwd, salt);

    const newUser = await createUser({ fullName, email, password: hashedPassword });

    if (newUser) {
      generateToken(newUser.id, res);

      res.status(201).json({
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.log('Error in signup controller:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
