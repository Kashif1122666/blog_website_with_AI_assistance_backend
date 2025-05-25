import User from '../models/userSchema.js';
import validator from 'validator'
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

    const passwordIsValid = validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  });
    if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

    if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
    if (!passwordIsValid) {
    return res.status(400).json({
      message: 'Password must be at least 8 characters long and contain at least one letter and one number',
    });
  }
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }

}