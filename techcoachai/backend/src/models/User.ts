// Import dependencies
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define the TypeScript interface for a User document
export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Method definition for comparing passwords
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the Mongoose schema for the User model
const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      // Regex validation for email format
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email',
      ],
      unique: true, // Ensure email is unique
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6, // Enforce minimum password length
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      minlength: 3,
      maxlength: 50,
    },
    avatar: {
      type: String, // Optional field for avatar URL
    },
    isVerified: {
      type: Boolean,
      default: false, // Defaults to false
    },
  },
  // Schema options
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Middleware: Hash password before saving the user document
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Generate salt and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Proceed with saving
});

// Method: Compare provided password with the stored hashed password
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // Use bcrypt's compare function for secure comparison
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create the Mongoose model from the schema
const User = mongoose.model<IUser>('User', UserSchema);

// Export the User model
export default User;