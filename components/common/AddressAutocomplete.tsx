import React, { useState, useEffect, useRef } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import { autocomplete, GeoapifyFeature } from '../../services/geoapify';
import { MapPin, Loader2, Search, X } from 'lucide-react';

interface AddressAutocompleteProps {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
  error?: string;
  required?: boolean;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  name,
  label,
  placeholder,
  className = '',
  error,
  required = false
}) => {
  const { control, setValue, clearErrors } = useFormContext();
  const {
    field: { onChange, value, onBlur, ref },
  } = useController({
    name,
    control,
  });

  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const lastRequestRef = useRef<number>(0);

  // Keep local input in sync with field value (e.g. if pre-filled)
  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // DEBOUNCE MECHANISM - fetch suggestions
  useEffect(() => {
    if (!inputValue || inputValue.length < 2 || !showSuggestions) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const requestId = Date.now();
    lastRequestRef.current = requestId;

    // Set loading immediately for better UX
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const result = await autocomplete({ text: inputValue });
        
        // Race condition check - only update if this is still the latest request
        if (lastRequestRef.current !== requestId) return;

        setSuggestions(result.features || []);
      } catch (err) {
        console.error('Geoapify Autocomplete Error:', err);
        setSuggestions([]);
      } finally {
        if (lastRequestRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }, 1000); // 1000ms debounce delay

    return () => clearTimeout(timer);
  }, [inputValue, showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    if (!showSuggestions) setShowSuggestions(true);
  };

  const handleSelect = (feature: GeoapifyFeature) => {
    const props = feature.properties;
    
    // Build street value from address_line1 or street + housenumber
    let streetValue = '';
    if (props.address_line1) {
      streetValue = props.address_line1;
    } else if (props.street) {
      streetValue = props.housenumber 
        ? `${props.street} ${props.housenumber}` 
        : props.street;
    } else {
      streetValue = props.formatted || '';
    }
    
    // Update both local and RHF state
    setInputValue(streetValue);
    onChange(streetValue);
    
    // Auto-fill city field if present
    if (props.city) {
      setValue('city', props.city, { shouldValidate: true });
    }
    
    // Auto-fill postal code field if present
    if (props.postcode) {
      setValue('postalCode', props.postcode, { shouldValidate: true });
    }
    
    setSuggestions([]);
    setShowSuggestions(false);
    clearErrors([name, 'city', 'postalCode']);
  };

  const clearInput = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Helper to get display text for a suggestion
  const getDisplayText = (feature: GeoapifyFeature) => {
    const props = feature.properties;
    // Prefer address_line1 for primary display
    if (props.address_line1) return props.address_line1;
    if (props.street) {
      return props.housenumber ? `${props.street} ${props.housenumber}` : props.street;
    }
    return props.formatted || '';
  };

  // Helper to get secondary text (city, postcode)
  const getSecondaryText = (feature: GeoapifyFeature) => {
    const props = feature.properties;
    // Use address_line2 if available, otherwise build from city/postcode
    if (props.address_line2) return props.address_line2;
    const parts = [props.city, props.postcode].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={onBlur}
          onFocus={() => {
            if (inputValue.length >= 2) setShowSuggestions(true);
          }}
          ref={ref}
          autoComplete="off"
          placeholder={placeholder}
          className={`w-full border-gray-300 rounded-xl p-3 ps-10 pe-10 border focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none ${
            error ? 'border-red-500' : 'hover:border-gray-400'
          }`}
        />
        <div className="absolute inset-y-0 end-0 flex items-center pe-2 gap-1">
          {inputValue && (
            <button 
              type="button" 
              onClick={clearInput}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
          {isLoading && (
            <div className="pe-2">
              <Loader2 className="animate-spin text-secondary" size={18} />
            </div>
          )}
        </div>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}

      {showSuggestions && (suggestions.length > 0 || isLoading) && (
        <div className="absolute z-[9999] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-80 overflow-auto py-2">
          {isLoading && suggestions.length === 0 && (
            <div className="px-4 py-6 text-center">
              <Loader2 className="animate-spin text-secondary mx-auto mb-2" size={24} />
              <p className="text-sm text-gray-500 font-medium">מחפש כתובות...</p>
            </div>
          )}
          
          {!isLoading && suggestions.length === 0 && inputValue.length >= 2 && (
            <div className="px-4 py-4 text-center text-sm text-gray-400">
              לא נמצאו תוצאות
            </div>
          )}

          {suggestions.map((feature, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(feature)}
              className="w-full text-right px-4 py-3 hover:bg-red-50 flex items-start gap-3 transition-colors group border-b last:border-0 border-gray-50 cursor-pointer"
            >
              <div className="mt-1 bg-gray-50 p-2 rounded-lg text-gray-400 group-hover:text-secondary group-hover:bg-white shadow-sm transition-colors">
                <MapPin size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {getDisplayText(feature)}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {getSecondaryText(feature)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
