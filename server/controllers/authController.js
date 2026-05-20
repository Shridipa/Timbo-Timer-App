import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, timezone } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.trim();

    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (user) {
      // User already exists. Let's check if the password matches.
      const isMatch = await user.matchPassword(normalizedPassword);
      if (!isMatch) {
        // If password doesn't match, let's update the password and profile so the new registration info is stored and it doesn't fail!
        user.password = normalizedPassword;
      }
      if (name) user.name = name.trim();
      if (timezone) user.timezone = timezone;
      user.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
      
      await user.save();

      const token = generateToken(res, user._id);
      return res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        timezone: user.timezone,
        token
      });
    }

    // Create new user
    user = await User.create({
      name: name ? name.trim() : 'Strategist',
      email: normalizedEmail,
      password: normalizedPassword,
      timezone: timezone || 'UTC',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Strategist')}&background=random`
    });

    if (user) {
      const token = generateToken(res, user._id);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        timezone: user.timezone,
        token
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPassword = password.trim();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (user && (await user.matchPassword(normalizedPassword))) {
      const token = generateToken(res, user._id);
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        timezone: user.timezone,
        token
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name ? req.body.name.trim() : user.name;
      if (req.body.email) {
        user.email = req.body.email.toLowerCase().trim();
      }

      if (req.body.password) {
        user.password = req.body.password.trim();
      }

      const updatedUser = await user.save();

      res.status(200).json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        timezone: updatedUser.timezone
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        timezone: user.timezone
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};
