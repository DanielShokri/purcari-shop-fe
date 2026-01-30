import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation, useGetCurrentUserQuery } from '../../services/api/authApi';
import { useToast, useAppDispatch } from '../../store/hooks';
import { syncCartOnLogin } from '../../store/slices/cartSlice';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '../../schemas/validationSchemas';

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const toast = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();
  const { data: user, isLoading: isCheckingUser } = useGetCurrentUserQuery();

  // Redirect when user is confirmed logged in
  useEffect(() => {
    if (loginSuccess && user && !isCheckingUser) {
      navigate(redirect ? `/${redirect}` : '/dashboard');
    }
  }, [loginSuccess, user, isCheckingUser, navigate, redirect]);

  // Also redirect if user is already logged in when visiting the page
  useEffect(() => {
    if (user && !isCheckingUser && !loginSuccess) {
      navigate(redirect ? `/${redirect}` : '/dashboard');
    }
  }, [user, isCheckingUser, loginSuccess, navigate, redirect]);

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
    try {
      if (isLogin) {
        const loginData = data as LoginInput;
        await login({ email: loginData.email, password: loginData.password }).unwrap();
        toast.success('התחברת בהצלחה');
      } else {
        const registerData = data as RegisterInput;
        await registerUser({ email: registerData.email, password: registerData.password, name: registerData.name, phone: registerData.phone }).unwrap();
        toast.success('ברוכים הבאים! החשבון נוצר בהצלחה');
      }
      // Sync cart with cloud after login/register
      dispatch(syncCartOnLogin());
      // Set login success flag - the useEffect will handle navigation after user state is confirmed
      setLoginSuccess(true);
    } catch (err: any) {
      setError(err || 'משהו השתבש, נסה שוב מאוחר יותר');
      toast.error(isLogin ? 'שגיאה בהתחברות' : 'שגיאה בהרשמה');
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
          disabled={isLoggingIn || isRegistering || loginSuccess}
          className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg cursor-pointer disabled:opacity-70"
        >
          {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
          {isLoggingIn || isRegistering ? 'מעבד...' : loginSuccess ? 'מעביר לחשבון...' : (isLogin ? 'התחברות' : 'הרשמה')}
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
