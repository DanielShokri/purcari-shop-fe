import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Plus } from 'lucide-react';
import { Address } from '../../types';
import AddressCard from './AddressCard';

interface AddressesTabProps {
  addresses: Address[] | undefined;
  isLoading: boolean;
  onAddNew: () => void;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {[1, 2].map(i => (
      <div key={i} className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
    ))}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="bg-white p-12 rounded-3xl text-center shadow-sm">
    <MapPin size={48} className="mx-auto text-gray-200 mb-4" />
    <p className="text-gray-500">טרם הוספת כתובות למשלוח</p>
  </div>
);

const AddressesTab: React.FC<AddressesTabProps> = ({
  addresses,
  isLoading,
  onAddNew,
  onEdit,
  onDelete,
}) => {
  return (
    <motion.div
      key="addresses"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">הכתובות שלי</h3>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-xl font-bold hover:bg-red-900 transition-colors cursor-pointer"
        >
          <Plus size={18} />
          הוספת כתובת
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : addresses && addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}
    </motion.div>
  );
};

export default AddressesTab;
