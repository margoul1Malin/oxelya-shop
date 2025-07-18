'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, User, Phone, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

interface AddressFormProps {
  onClose: () => void;
  onSubmit: (address: Partial<Address>) => void;
  initialData?: Address | null;
}

interface AddressSuggestion {
  label: string;
  context: string;
  coordinates: [number, number];
  properties: {
    name: string;
    context: string;
    postcode: string;
    city: string;
    citycode: string;
    street?: string;
  };
}

interface ValidationErrors {
  name?: string;
  phone?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

export default function AddressForm({ onClose, onSubmit, initialData }: AddressFormProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  
  // Fonction pour obtenir le numéro en format compact (pour la DB)
  const getCompactPhoneNumber = (value: string): string => {
    return value.replace(/[^\d+]/g, '');
  };

  // Fonction pour formater le numéro à l'affichage
  const formatPhoneForDisplay = (value: string): string => {
    const compact = getCompactPhoneNumber(value);
    
    // Si c'est un numéro français (+33...)
    if (compact.startsWith('+33') && compact.length >= 12) {
      return compact.replace(/(\+33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
    }
    
    // Pour d'autres formats, vous pouvez ajouter d'autres règles
    return compact;
  };

  // Fonction pour nettoyer et formater le numéro de téléphone
  const cleanPhoneNumber = (value: string): string => {
    // Supprimer tous les caractères non numériques sauf le +
    const digitsOnly = value.replace(/[^\d+]/g, '');
    
    // Si le numéro commence par +33, on formate avec des espaces pour l'affichage
    if (digitsOnly.startsWith('+33') && digitsOnly.length >= 12) {
      return digitsOnly.replace(/(\+33)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
    }
    
    return digitsOnly;
  };

  const [address, setAddress] = useState<Address>(() => {
    if (initialData) {
      return {
        ...initialData,
        // Formater le numéro pour l'affichage s'il existe
        phone: initialData.phone ? formatPhoneForDisplay(initialData.phone) : ''
      };
    }
    return {
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'FR',
      phone: '',
      isDefault: false
    };
  });

  // États pour l'autocomplétion
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressQuery, setAddressQuery] = useState(initialData?.street || '');
  const [isSearching, setIsSearching] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // États pour la validation
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Débounce pour l'API
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Fermer les suggestions au clic en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !addressInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validation des champs
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Le nom de l\'adresse est requis';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        return undefined;

      case 'phone':
        if (!value.trim()) return 'Le téléphone est requis';
        // Vérifier le format compact pour la validation
        const compactPhone = getCompactPhoneNumber(value);
        const phoneRegex = /^\+\d{6,15}$/;
        if (!phoneRegex.test(compactPhone)) return 'Format requis : +33 6 43 32 34 12';
        return undefined;

      case 'street':
        if (!value.trim()) return 'L\'adresse est requise';
        if (value.trim().length < 5) return 'L\'adresse doit contenir au moins 5 caractères';
        return undefined;

      case 'city':
        if (!value.trim()) return 'La ville est requise';
        if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)) return 'Seules les lettres, espaces, tirets et apostrophes sont autorisés';
        return undefined;

      case 'zipCode':
        if (!value.trim()) return 'Le code postal est requis';
        if (address.country === 'FR' && !/^\d{5}$/.test(value)) return 'Code postal français invalide (5 chiffres)';
        return undefined;

      case 'country':
        if (!value.trim()) return 'Le pays est requis';
        return undefined;

      default:
        return undefined;
    }
  };

  // Validation en temps réel
  const handleFieldChange = (name: string, value: string) => {
    let processedValue = value;
    
    // Nettoyer et formater le numéro de téléphone
    if (name === 'phone') {
      processedValue = cleanPhoneNumber(value);
    }
    
    setAddress((prev: Address) => ({ ...prev, [name]: processedValue }));
    
    if (touchedFields.has(name)) {
      const error = validateField(name, processedValue);
      setErrors((prev: ValidationErrors) => ({ ...prev, [name]: error }));
    }
  };

  // Marquer un champ comme touché et valider
  const handleFieldBlur = (name: string) => {
    setTouchedFields((prev: Set<string>) => new Set(Array.from(prev).concat([name])));
    const error = validateField(name, address[name as keyof Address] as string);
    setErrors((prev: ValidationErrors) => ({ ...prev, [name]: error }));
  };

  // Recherche d'adresses avec l'API Géoplateforme
  const searchAddresses = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://wxs.ign.fr/essentiels/geoportail/geocodage/rest/0.1/search?q=${encodeURIComponent(query)}&type=StreetAddress&maximumResponses=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        const suggestions = data.results?.map((result: any) => ({
          label: result.address,
          context: result.city + ', ' + result.country,
          coordinates: [result.x, result.y],
          properties: {
            name: result.address,
            context: result.city + ', ' + result.country,
            postcode: result.zipcode,
            city: result.city,
            citycode: result.citycode,
            street: result.street
          }
        })) || [];
        
        setAddressSuggestions(suggestions);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche d\'adresses:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Gérer la saisie dans le champ adresse
  const handleAddressInput = (value: string) => {
    setAddressQuery(value);
    handleFieldChange('street', value);
    setShowSuggestions(true);

    // Débounce de la recherche
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      searchAddresses(value);
    }, 300);

    setSearchTimeout(timeout);
  };

  // Sélectionner une suggestion d'adresse
  const selectAddressSuggestion = (suggestion: AddressSuggestion) => {
    setAddress((prev: Address) => ({
      ...prev,
      street: suggestion.properties.street || suggestion.properties.name,
      city: suggestion.properties.city,
      zipCode: suggestion.properties.postcode,
      country: 'FR'
    }));
    setAddressQuery(suggestion.properties.street || suggestion.properties.name);
    setShowSuggestions(false);
    
    // Nettoyer les erreurs pour les champs auto-remplis
    setErrors((prev: ValidationErrors) => {
      const newErrors = { ...prev };
      delete newErrors.street;
      delete newErrors.city;
      delete newErrors.zipCode;
      return newErrors;
    });
  };

  // Validation complète du formulaire
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    const fields = ['name', 'phone', 'street', 'city', 'zipCode', 'country'];
    
    fields.forEach(field => {
      const error = validateField(field, address[field as keyof Address] as string);
      if (error) newErrors[field as keyof ValidationErrors] = error;
    });

    setErrors(newErrors);
    setTouchedFields(new Set(fields));
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    setIsLoading(true);

    try {
      // Envoyer le numéro en format compact pour la DB
      const cleanedAddress = {
        ...address,
        phone: getCompactPhoneNumber(address.phone) // Utiliser la fonction qui préserve le +
      };
      console.log('Adresse à envoyer:', cleanedAddress);
      await onSubmit(cleanedAddress);
      // Le formulaire sera réinitialisé par le parent après succès
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde de l\'adresse');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    let newValue = type === 'checkbox' ? checked : value;
    
    // Nettoyer et formater le numéro de téléphone
    if (name === 'phone') {
      newValue = cleanPhoneNumber(value);
    }
    
    setAddress((prev: Address) => ({
      ...prev,
      [name]: newValue
    }));

    if (name !== 'isDefault' && name !== 'state') {
      handleFieldChange(name, typeof newValue === 'string' ? newValue : value);
    }
  };

  // Composant pour afficher les erreurs
  const ErrorMessage = ({ error }: { error?: string }) => (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-1 text-red-400 text-sm mt-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Composant pour les champs validés
  const ValidationIcon = ({ fieldName }: { fieldName: string }) => {
    const hasError = errors[fieldName as keyof ValidationErrors];
    const isTouched = touchedFields.has(fieldName);
    const hasValue = address[fieldName as keyof Address]?.toString().trim();

    if (!isTouched || !hasValue) return null;

    return hasError ? (
      <AlertCircle className="w-4 h-4 text-red-400" />
    ) : (
      <CheckCircle className="w-4 h-4 text-green-400" />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">
          {initialData ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 p-1 rounded-lg hover:bg-gray-700/50 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom de l'adresse */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Nom de l'adresse *
          </label>
          <div className="relative">
            <input
              type="text"
              name="name"
              value={address.name}
              onChange={handleChange}
              onBlur={() => handleFieldBlur('name')}
              className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-white border focus:ring-2 outline-none pr-10 transition-all ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('name') && address.name.trim()
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              placeholder="Ex: Domicile, Bureau..."
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ValidationIcon fieldName="name" />
            </div>
          </div>
          <ErrorMessage error={errors.name} />
        </div>

        {/* Téléphone */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Téléphone *
          </label>
          <div className="relative">
            <input
              type="text"
              name="phone"
              value={address.phone}
              onChange={handleChange}
              onBlur={() => handleFieldBlur('phone')}
              className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-white border focus:ring-2 outline-none pr-10 transition-all ${
                errors.phone 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('phone') && address.phone.trim()
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              placeholder="+33 6 43 32 34 12"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ValidationIcon fieldName="phone" />
            </div>
          </div>
          <ErrorMessage error={errors.phone} />
          <p className="text-xs text-gray-500 mt-1">Format: +33 6 43 32 34 12</p>
        </div>

        {/* Adresse avec autocomplétion */}
        <div className="col-span-2 relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Rue *
          </label>
          <div className="relative">
            <input
              ref={addressInputRef}
              type="text"
              value={addressQuery}
              onChange={(e) => handleAddressInput(e.target.value)}
              onBlur={() => handleFieldBlur('street')}
              className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-white border focus:ring-2 outline-none pr-10 transition-all ${
                errors.street 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('street') && address.street.trim()
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              placeholder="Commencez à taper votre adresse..."
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <Loader className="w-4 h-4 animate-spin text-blue-400" />
              ) : (
                <ValidationIcon fieldName="street" />
              )}
            </div>
          </div>
          <ErrorMessage error={errors.street} />

          {/* Suggestions d'adresses */}
          <AnimatePresence>
            {showSuggestions && addressSuggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {addressSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectAddressSuggestion(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-700 flex items-start gap-3 border-b border-gray-700 last:border-b-0 transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">{suggestion.label}</div>
                      <div className="text-gray-400 text-sm">{suggestion.context}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ville *
          </label>
          <div className="relative">
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleChange}
              onBlur={() => handleFieldBlur('city')}
              className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-white border focus:ring-2 outline-none pr-10 transition-all ${
                errors.city 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('city') && address.city.trim()
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              placeholder="Paris"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ValidationIcon fieldName="city" />
            </div>
          </div>
          <ErrorMessage error={errors.city} />
        </div>

        {/* État/Région */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            État/Région
          </label>
          <input
            type="text"
            name="state"
            value={address.state}
            onChange={handleChange}
            className="w-full bg-gray-700 rounded-lg px-4 py-3 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
            placeholder="Île-de-France"
          />
        </div>

        {/* Code postal */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Code postal *
          </label>
          <div className="relative">
            <input
              type="text"
              name="zipCode"
              value={address.zipCode}
              onChange={handleChange}
              onBlur={() => handleFieldBlur('zipCode')}
              className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-white border focus:ring-2 outline-none pr-10 transition-all ${
                errors.zipCode 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('zipCode') && address.zipCode.trim()
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              placeholder="75001"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ValidationIcon fieldName="zipCode" />
            </div>
          </div>
          <ErrorMessage error={errors.zipCode} />
        </div>

        {/* Pays */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Pays *
          </label>
          <div className="relative">
            <select
              name="country"
              value={address.country}
              onChange={handleChange}
              onBlur={() => handleFieldBlur('country')}
              className={`w-full bg-gray-700 rounded-lg px-4 py-3 text-white border focus:ring-2 outline-none pr-10 transition-all ${
                errors.country 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              required
            >
              <option value="">Sélectionnez un pays</option>
              <option value="FR">France</option>
              <option value="BE">Belgique</option>
              <option value="CH">Suisse</option>
              <option value="LU">Luxembourg</option>
              <option value="MC">Monaco</option>
              <option value="CA">Canada</option>
              <option value="US">États-Unis</option>
              <option value="GB">Royaume-Uni</option>
              <option value="DE">Allemagne</option>
              <option value="IT">Italie</option>
              <option value="ES">Espagne</option>
            </select>
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <ValidationIcon fieldName="country" />
            </div>
          </div>
          <ErrorMessage error={errors.country} />
        </div>

        {/* Adresse par défaut */}
        <div className="col-span-2">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="isDefault"
              checked={address.isDefault}
              onChange={handleChange}
              className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm text-gray-300">Définir comme adresse par défaut</span>
          </label>
        </div>

        {/* Boutons */}
        <div className="col-span-2 flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}