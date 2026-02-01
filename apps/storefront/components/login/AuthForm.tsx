import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import useToast from '../../store/hooks/useToast';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '../../schemas/validationSchemas';

const AuthForm: React.FC = () => {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const redirect = searchParams.get('redirect');
   const toast = useToast();
   const [isLogin, setIsLogin] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [loginSuccess, setLoginSuccess] = useState(false);
   const [isLoading, setIsLoading] = useState(false);

   const { signIn } = useAuthActions();
   const createUserProfile = useMutation(api.users.createOrUpdateUserProfile);
   const user = useQuery(api.users.get);

  // Redirect when user is confirmed logged in
  useEffect(() => {
    if (loginSuccess && user) {
      navigate(redirect ? `/${redirect}` : '/dashboard');
    }
  }, [loginSuccess, user, navigate, redirect]);

  // Also redirect if user is already logged in when visiting the page
  useEffect(() => {
    if (user && !loginSuccess) {
      navigate(redirect ? `/${redirect}` : '/dashboard');
    }
  }, [user, loginSuccess, navigate, redirect]);

  // Use union type to handle both login and register form types
  type FormData = LoginInput | RegisterInput;
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm<FormData>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema)
  });

  useEffect(() => {
    reset();
    setError(null);
  }, [isLogin, reset]);

   const onSubmit: SubmitHandler<FormData> = async (data) => {
      setError(null);
      setIsLoading(true);
      try {
        if (isLogin) {
          // LOGIN FLOW
          const loginData = data as LoginInput;
           await signIn("password", { 
              email: loginData.email, 
              password: loginData.password, 
              flow: "signIn" 
            });
            
            toast.success("התחברת בהצלחה");
        } else {
          // SIGNUP FLOW
          const registerData = data as RegisterInput;
          
          // Step 1: Sign up with Convex Auth
          await signIn("password", { 
            email: registerData.email, 
            password: registerData.password, 
            name: registerData.name, 
            flow: "signUp" 
          });
          
            // Step 2: Create user profile with phone number
            // Phone is not part of standard Password provider, so we store it separately
            await createUserProfile({
              phone: registerData.phone,
              name: registerData.name,
              email: registerData.email,
            });
            
            toast.success("ברוכים הבאים! החשבון נוצר בהצלחה");
        }
        
        // Set login success flag - useEffect will handle navigation after user state is confirmed
        setLoginSuccess(true);
      } catch (err: any) {
        console.error('Auth error:', err);
        
        // Parse specific error messages from Convex auth
        const errorMessage = err?.message || '';
        let userFriendlyError = '';
        
        if (errorMessage.includes('Invalid password') || errorMessage.includes('הסיסמה')) {
          userFriendlyError = 'הסיסמה לא עומדת בדרישות. הסיסמה חייבת להכיל לפחות 4 תווים.';
        } else if (errorMessage.includes('User does not exist') || errorMessage.includes('Invalid credentials')) {
          userFriendlyError = 'לא קיים משתמש עם כתובת אימייל זו. אנא הרשמו או בדקו את האימייל.';
        } else if (errorMessage.includes('Incorrect password')) {
          userFriendlyError = 'הסיסמה שהוזנה אינה נכונה. אנא נסו שוב.';
        } else if (errorMessage.includes('already exists') || errorMessage.includes('Unique') || errorMessage.includes('constraint')) {
          userFriendlyError = 'כתובת אימייל זו כבר רשומה במערכת. אנא התחברו או אפסו את הסיסמה.';
        } else if (errorMessage.includes('Invalid email') || errorMessage.includes('אימייל')) {
          userFriendlyError = 'כתובת אימייל לא תקינה. אנא בדקו את הפורמט.';
        } else {
          userFriendlyError = isLogin 
            ? 'שגיאה בהתחברות. אנא בדקו את הפרטים ונסו שוב.'
            : 'שגיאה בהרשמה. אנא נסו שוב מאוחר יותר.';
        }
        
         setError(userFriendlyError);
          toast.error(userFriendlyError);
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">{isLogin ? 'ברוכים השבים' : 'הצטרפו אלינו'}</h1>
        <p className="text-gray-500">{isLogin ? 'התחברו לחשבון שלכם כדי לצפות בהזמנות' : 'צרו חשבון כדי לעקוב אחר ההזמנות, לנהל כתובות משלוח ועוד'}</p>
      </div>

      {(error || Object.keys(errors).length > 0) && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 flex flex-col gap-2 text-sm">
          {error && (
            <div className="flex items-center gap-3">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {!error && <div className="flex items-center gap-3"><AlertCircle size={18} /> אנא בדקו את השדות המסומנים</div>}
        </div>
      )}

       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
         {!isLogin && (
           <>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא <span className="text-red-500">*</span></label>
               <div className="relative">
                 <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                   <UserIcon size={18} />
                 </span>
                 <input 
                   type="text" 
                   {...register('name' as const)}
                   className={`w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary ${(errors as any).name ? 'border-red-500' : ''}`} 
                 />
               </div>
               {(errors as any).name && <p className="text-red-500 text-xs mt-1">{(errors as any).name.message}</p>}
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">טלפון נייד <span className="text-red-500">*</span></label>
               <div className="relative">
                 <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                   <Phone size={18} />
                 </span>
                 <input 
                   type="tel" 
                   {...register('phone' as const)}
                   placeholder="050-1234567"
                   dir="ltr"
                   className={`w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary text-left ${(errors as any).phone ? 'border-red-500' : ''}`} 
                 />
               </div>
               {(errors as any).phone && <p className="text-red-500 text-xs mt-1">{(errors as any).phone.message}</p>}
             </div>
           </>
         )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אימייל <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
              <Mail size={18} />
            </span>
            <input 
              type="email" 
              {...register('email')}
              className={`w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary ${errors.email ? 'border-red-500' : ''}`} 
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה <span className="text-red-500">*</span></label>
           <div className="relative">
             <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
               <Lock size={18} />
             </span>
             <input 
               type="password" 
               {...register('password')}
               className={`w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary ${errors.password ? 'border-red-500' : ''}`} 
             />
           </div>
           {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
         </div>

        <button 
          type="submit" 
          disabled={isLoading || loginSuccess}
          className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg cursor-pointer disabled:opacity-70"
        >
          {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
          {isLoading ? 'מעבד...' : loginSuccess ? 'מעביר לחשבון...' : (isLogin ? 'התחברות' : 'הרשמה')}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-gray-500 mb-2">
          {isLogin ? 'עדיין לא רשומים?' : 'כבר יש לכם חשבון?'}
        </p>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-secondary font-bold hover:underline cursor-pointer"
        >
          {isLogin ? 'צרו חשבון עכשיו' : 'התחברו כאן'}
        </button>
      </div>
    </motion.div>
  );
};

export default AuthForm;
