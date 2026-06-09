import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
import { useLoginMutation } from "../../services/authApi";
import { useToast } from "../context/ToastContext";

// Define schema using Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await login(data).unwrap();
      localStorage.setItem("token", response.token);
      showToast(
        "Welcome Back!",
        response.message || "Logged in successfully.",
        "success"
      );
      navigate("/tasks");
    } catch (err) {
      showToast(
        "Login Failed",
        err.data?.message || err.message || "Invalid credentials.",
        "error"
      );
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0B0F19] text-slate-100 overflow-hidden font-sans px-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md p-8 rounded-3xl glass-panel-dark shadow-2xl transition-all duration-300 hover:shadow-indigo-500/5 hover:border-slate-800">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mb-4 shadow-inner">
            <FiLogIn className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-400 mt-2 text-center">
            Sign in to access your task dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email field */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <FiMail className="w-5 h-5" />
              </span>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full py-3.5 pl-11 pr-4 rounded-2xl bg-slate-900/60 border ${
                  errors.email ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500"
                } focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-sm font-medium transition-all`}
                {...register("email")}
              />
            </div>
            {errors.email && (
              <span className="text-xs font-medium text-red-400 mt-1.5 ml-1 animate-slide-in">
                {errors.email.message}
              </span>
            )}
          </div>

          {/* Password field */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500">
                <FiLock className="w-5 h-5" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`w-full py-3.5 pl-11 pr-12 rounded-2xl bg-slate-900/60 border ${
                  errors.password ? "border-red-500/50 focus:border-red-500" : "border-slate-800 focus:border-indigo-500"
                } focus:outline-none focus:ring-1 focus:ring-indigo-500/30 text-sm font-medium transition-all`}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-indigo-400 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs font-medium text-red-400 mt-1.5 ml-1 animate-slide-in">
                {errors.password.message}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="relative w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 active:scale-[0.98] transition-all duration-150 disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-400">Don't have an account? </span>
          <Link
            to="/register"
            className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
          >
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
