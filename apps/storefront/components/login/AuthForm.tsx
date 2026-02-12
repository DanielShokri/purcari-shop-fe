import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useToast from "../../store/hooks/useToast";
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "../../schemas/validationSchemas";
import { useAuth, SignUpInput, SignInInput } from "../../hooks/useAuth";
import { useAnalytics } from "../../hooks/useAnalytics";

type FormData = LoginInput | RegisterInput;

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);

  const { signIn, signUp, isLoading, error, clearError } = useAuth();
  const { identify } = useAnalytics();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
  });

  useEffect(() => {
    reset();
    clearError();
  }, [isLogin]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    let success = false;

    if (isLogin) {
      const loginData: SignInInput = { email: data.email, password: data.password };
      success = await signIn(loginData);
      if (success) toast.success("התחברת בהצלחה");
    } else {
      const registerData: SignUpInput = {
        email: data.email,
        password: data.password,
        name: (data as RegisterInput).name,
        phone: (data as RegisterInput).phone,
      };
      success = await signUp(registerData);
      if (success) toast.success("ברוכים הבאים! החשבון נוצר בהצלחה");
    }

    if (success) {
      // Link anonymous browsing history to authenticated user
      identify();
      const url = redirect ? `/${redirect}` : "/dashboard";
      navigate(url);
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{isLogin ? "ברוכים השבים" : "הצטרפו אלינו"}</h1>
        <p className="text-gray-500">
          {isLogin ? "התחברו לחשבון שלכם כדי לצפות בהזמנות" : "צרו חשבון כדי לעקוב אחר ההזמנות, לנהל כתובות משלוח ועוד"}
        </p>
      </div>

      {(error || Object.keys(errors).length > 0) && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 flex flex-col gap-2 text-sm">
          {error && (
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {!error && (
            <div className="flex items-center gap-3">
              <AlertCircle size={18} /> אנא בדקו את השדות המסומנים
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם מלא <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  {...register("name" as const)}
                  className={`w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary ${
                    (errors as any).name ? "border-red-500" : ""
                  }`}
                />
              </div>
              {(errors as any).name && (
                <p className="text-red-500 text-xs mt-1">{(errors as any).name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                טלפון נייד <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                  <Phone size={18} />
                </span>
                <input
                  type="tel"
                  {...register("phone" as const)}
                  placeholder="050-1234567"
                  dir="ltr"
                  className={`w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary text-left ${
                    (errors as any).phone ? "border-red-500" : ""
                  }`}
                />
              </div>
              {(errors as any).phone && (
                <p className="text-red-500 text-xs mt-1">{(errors as any).phone.message}</p>
              )}
            </div>
          </>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            אימייל <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
              <Mail size={18} />
            </span>
            <input
              type="email"
              {...register("email")}
              className={`w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary ${
                errors.email ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            סיסמה <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
              <Lock size={18} />
            </span>
            <input
              type="password"
              {...register("password")}
              className={`w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary ${
                errors.password ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg cursor-pointer disabled:opacity-70"
        >
          {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
          {isLoading
            ? "מעביר לחשבון..."
            : isLogin
            ? "התחברות"
            : "הרשמה"}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-gray-500 mb-2">{isLogin ? "עדיין לא רשומים?" : "כבר יש לכם חשבון?"}</p>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-secondary font-bold hover:underline cursor-pointer"
        >
          {isLogin ? "צרו חשבון עכשיו" : "התחברו כאן"}
        </button>
      </div>
    </motion.div>
  );
};

export default AuthForm;
