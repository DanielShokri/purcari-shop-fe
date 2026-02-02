import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, ArrowRight } from "lucide-react";

const ForgotPasswordForm: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md text-center"
    >
      <div className="mb-6">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <KeyRound size={32} className="text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">שחזור סיסמה</h1>
        <p className="text-gray-500">פיצ'ר זה יהיה זמין בקרוב</p>
      </div>

      <Link
        to="/login"
        className="inline-flex items-center gap-2 text-secondary font-bold hover:underline"
      >
        <ArrowRight size={18} />
        חזרה להתחברות
      </Link>
    </motion.div>
  );
};

export default ForgotPasswordForm;
