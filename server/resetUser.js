import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const resetUser = async () => {
  try {
    let user = await User.findOne({ email: 'test@lifeos.ai' });
    if (user) {
       await User.deleteOne({ email: 'test@lifeos.ai' });
    }
    user = new User({
      name: 'Test User',
      email: 'test@lifeos.ai',
      password: 'password123'
    });
    await user.save();
    console.log('User created successfully. Email: test@lifeos.ai, Password: password123');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetUser();
