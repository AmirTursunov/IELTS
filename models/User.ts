import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  avatar?: string;
  testHistory: {
    testId: string;
    testType: "reading" | "listening" | "speaking" | "writing";
    score: number;
    bandScore: number;
    completedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Default query larda password qaytmaydi
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    avatar: String,
    testHistory: [
      {
        testId: { type: String, required: true },
        testType: {
          type: String,
          enum: ["reading", "listening", "speaking", "writing"],
        },
        score: Number,
        bandScore: Number,
        completedAt: {
          type: Date,
          default: Date.now,
          expires: 60,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Password hash qilish (save qilishdan oldin)
UserSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

// Password solishtirish method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
