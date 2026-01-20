import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '../../services/api/authApi';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '../../schemas/validationSchemas';

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [registerUser, { isLoading: isRegistering }] = useRegisterMutation();

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset 
  } = useForm<RegisterInput>({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema)
  });

  useEffect(() => {
    reset();
    setError(null);
  }, [isLogin, reset]);

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    try {
      if (isLogin) {
        await login({ email: data.email, password: data.password }).unwrap();
      } else {
        await registerUser({ email: data.email, password: data.password, name: data.name }).unwrap();
      }
      navigate(redirect ? `/${redirect}` : '/dashboard');
    } catch (err: any) {
      setError(err || 'משהו השתבש, נסה שוב מאוחר יותר');
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
        <p className="text-gray-500">{isLogin ? 'התחברו לחשבון שלכם כדי לצפות בהזמנות' : 'צרו חשבון כדי לעקוב אחר ההזמנות שלכם'}</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא <span className="text-red-500">*</span></label>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                <UserIcon size={18} />
              </span>
              <input 
                type="text" 
                {...register('name')}
                className={`w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary ${errors.name ? 'border-red-500' : ''}`} 
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
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
          disabled={isLoggingIn || isRegistering}
          className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-red-900 transition-colors flex items-center justify-center gap-2 mt-4 shadow-lg"
        >
          {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
          {isLoggingIn || isRegistering ? 'מעבד...' : (isLogin ? 'התחברות' : 'הרשמה')}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-gray-500 mb-2">
          {isLogin ? 'עדיין לא רשומים?' : 'כבר יש לכם חשבון?'}
        </p>
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-secondary font-bold hover:underline"
        >
          {isLogin ? 'צרו חשבון עכשיו' : 'התחברו כאן'}
        </button>
      </div>
    </motion.div>
  );
};

export default AuthForm;
