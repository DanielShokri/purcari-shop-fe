import React from 'react';
import { useGetMyOrdersQuery } from '../services/api/ordersApi';
import { useGetCurrentUserQuery, useLogoutMutation } from '../services/api/authApi';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Package, Clock, ChevronLeft, User as UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: user, isLoading: isUserLoading } = useGetCurrentUserQuery();
  const { data: orders, isLoading: isOrdersLoading } = useGetMyOrdersQuery(undefined, {
    skip: !user
  });
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    await logout().unwrap();
    navigate('/login');
  };

  if (isUserLoading) return <div className="min-h-screen flex items-center justify-center">טוען...</div>;
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-3xl shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-gray-100 p-4 rounded-full text-secondary">
              <UserIcon size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-500 hover:text-red-600 font-medium transition-colors border border-gray-200 px-4 py-2 rounded-xl"
          >
            <LogOut size={18} />
            התנתקות
          </button>
        </div>

        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Package className="text-secondary" />
          ההזמנות שלי
        </h2>

        {isOrdersLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div 
                key={order.$id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl text-gray-400">
                    <Clock size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">הזמנה #{order.$id.slice(-6).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">{new Date(order.$createdAt).toLocaleDateString('he-IL')}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-center md:text-right">
                    <p className="text-xs text-gray-500 mb-1">סה"כ</p>
                    <p className="font-bold text-secondary">₪{order.total}</p>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-xs text-gray-500 mb-1">סטטוס</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.status === 'pending' ? 'בהמתנה' : 
                       order.status === 'processing' ? 'בטיפול' :
                       order.status === 'shipped' ? 'נשלח' :
                       order.status === 'completed' ? 'הושלם' : 'בוטל'}
                    </span>
                  </div>
                  <Link 
                    to={`/order-confirmation/${order.$id}`} 
                    className="p-2 bg-gray-50 rounded-full text-gray-400 hover:text-secondary hover:bg-red-50 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 mb-6">עדיין לא ביצעת הזמנות</p>
            <Link to="/products" className="bg-secondary text-white px-8 py-3 rounded-full font-bold">
              עבור לחנות
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
