import React from 'react';
import { motion } from 'framer-motion';
import { History, Grape, Award, Map } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    { label: 'שנות היסטוריה', value: '197+', icon: <History className="text-accent" /> },
    { label: 'זני ענבים', value: '15+', icon: <Grape className="text-accent" /> },
    { label: 'פרסים בינלאומיים', value: '430+', icon: <Award className="text-accent" /> },
    { label: 'מדינות ייצוא', value: '40+', icon: <Map className="text-accent" /> },
  ];

  return (
    <section className="py-16 bg-secondary text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-white/10 p-3 rounded-2xl">
                  {React.cloneElement(stat.icon as React.ReactElement, { size: 32 })}
                </div>
              </div>
              <div className="text-3xl md:text-5xl font-bold mb-2">{stat.value}</div>
              <div className="text-sm md:text-base text-white/70">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
