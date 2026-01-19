import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '../../services/api/authApi';
import { LogIn, UserPlus, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState<string | null>(null);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password }).unwrap();
      } else {
        await register({ email: formData.email, password: formData.password, name: formData.name }).unwrap();
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

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם מלא</label>
            <div className="relative">
              <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
                <UserIcon size={18} />
              </span>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                className="w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary" 
                required={!isLogin} 
              />
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
          <div className="relative">
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
              <Mail size={18} />
            </span>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
              className="w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary" 
              required 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
          <div className="relative">
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400">
              <Lock size={18} />
            </span>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              className="w-full border-gray-300 rounded-xl p-3 ps-10 border focus:ring-secondary focus:border-secondary" 
              required 
            />
          </div>
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
