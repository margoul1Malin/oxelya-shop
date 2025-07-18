'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader, MapPin, User, Phone, Mail, AlertCircle, CheckCircle, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface AddressFormProps {
  onSubmit: (address: any) => void;
  initialAddress?: any;
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
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  zipCode?: string;
  country?: string;
}

export default function AddressForm({ onSubmit, initialAddress }: AddressFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);
  const [formData, setFormData] = useState(initialAddress || {
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'FR',
    phone: '',
  });

  // États pour l'autocomplétion
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressQuery, setAddressQuery] = useState('');
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
        const nameParts = value.trim().split(/\s+/);
        if (!value.trim()) return 'Le nom complet est requis';
        if (nameParts.length < 2) return 'Prénom et nom de famille requis (minimum 2 mots)';
        if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(value)) return 'Seules les lettres, espaces, tirets et apostrophes sont autorisés';
        return undefined;

      case 'email':
        if (!value.trim()) return 'L\'email est requis';
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) return 'Format d\'email invalide';
        return undefined;

      case 'phone':
        if (!value.trim()) return 'Le téléphone est requis';
        // Format international requis : +CodePays Numéro
        const phoneRegex = /^\+\d{1,4}\s\d{6,14}$/;
        if (!phoneRegex.test(value)) return 'Format requis : +33 123456789 (code pays + numéro)';
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
        if (formData.country === 'FR' && !/^\d{5}$/.test(value)) return 'Code postal français invalide (5 chiffres)';
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
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    
    if (touchedFields.has(name)) {
      const error = validateField(name, value);
      setErrors((prev: ValidationErrors) => ({ ...prev, [name]: error }));
    }

    // Mettre à jour l'adresse en temps réel si tous les champs requis sont remplis et valides
    const newFormData = { ...formData, [name]: value };
    const requiredFields = ['name', 'street', 'city', 'zipCode', 'country'];
    const allFieldsFilled = requiredFields.every(field => newFormData[field]?.trim());
    const noErrors = requiredFields.every(field => !validateField(field, newFormData[field]));
    
    if (allFieldsFilled && noErrors) {
      onSubmit(newFormData);
    }
  };

  // Marquer un champ comme touché et valider
  const handleFieldBlur = (name: string) => {
    setTouchedFields((prev: Set<string>) => new Set(Array.from(prev).concat([name])));
    const error = validateField(name, formData[name]);
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
    const newFormData = {
      ...formData,
      street: suggestion.properties.street || suggestion.properties.name,
      city: suggestion.properties.city,
      zipCode: suggestion.properties.postcode,
      country: 'FR'
    };
    
    setFormData(newFormData);
    setAddressQuery(suggestion.properties.street || suggestion.properties.name);
    setShowSuggestions(false);
    
    // Nettoyer les erreurs pour les champs auto-remplis et marquer comme touchés
    setErrors((prev: ValidationErrors) => {
      const newErrors = { ...prev };
      delete newErrors.street;
      delete newErrors.city;
      delete newErrors.zipCode;
      return newErrors;
    });
    setTouchedFields((prev: Set<string>) => new Set(Array.from(prev).concat(['street', 'city', 'zipCode', 'country'])));
    
    // Mettre à jour l'adresse immédiatement
    onSubmit(newFormData);
  };

  // Charger l'adresse par défaut
  const loadDefaultAddress = async () => {
    setLoadingDefault(true);
    try {
      const response = await fetch('/api/user/addresses');
      if (!response.ok) throw new Error('Erreur lors de la récupération des adresses');
      
      const addresses = await response.json();
      const defaultAddress = addresses.find((addr: any) => addr.isDefault);
      
             if (defaultAddress) {
         const newFormData = {
           ...formData,
           name: defaultAddress.name,
           street: defaultAddress.street,
           city: defaultAddress.city,
           state: defaultAddress.state,
           zipCode: defaultAddress.zipCode,
           country: defaultAddress.country,
           phone: defaultAddress.phone
         };
         
         setFormData(newFormData);
        setAddressQuery(defaultAddress.street);
        toast.success('Adresse par défaut chargée');
        
        // Nettoyer les erreurs et marquer tous les champs comme touchés
        setErrors({});
        setTouchedFields(new Set(['name', 'email', 'phone', 'street', 'city', 'zipCode', 'country']));
        
        // Mettre à jour l'adresse immédiatement
        onSubmit(newFormData);
      } else {
        toast.error('Aucune adresse par défaut trouvée');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger l\'adresse par défaut');
    } finally {
      setLoadingDefault(false);
    }
  };

  // Validation complète du formulaire
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    const fields = ['name', 'email', 'phone', 'street', 'city', 'zipCode', 'country'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field as keyof ValidationErrors] = error;
    });

    setErrors(newErrors);
    setTouchedFields(new Set(fields));
    
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    // Mettre à jour l'adresse en temps réel
    onSubmit(formData);
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
    const hasValue = formData[fieldName]?.trim();

    if (!isTouched || !hasValue) return null;

    return hasError ? (
      <AlertCircle className="w-4 h-4 text-red-400" />
    ) : (
      <CheckCircle className="w-4 h-4 text-green-400" />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bouton pour charger l'adresse par défaut */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={loadDefaultAddress}
          disabled={loadingDefault}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 disabled:opacity-50 transition-all border border-blue-600/30"
        >
          {loadingDefault ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Home className="w-4 h-4" />
          )}
          {loadingDefault ? 'Chargement...' : 'Utiliser mon adresse par défaut'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nom complet */}
        <div className="md:col-span-2">
          <label className="block text-gray-300 mb-2 font-medium">
            <User className="w-4 h-4 inline mr-2" />
            Nom complet *
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              onBlur={() => handleFieldBlur('name')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 outline-none text-white pr-10 transition-all ${
                errors.name 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('name') && formData.name.trim()
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              placeholder="Prénom Nom"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ValidationIcon fieldName="name" />
            </div>
          </div>
          <ErrorMessage error={errors.name} />
          <p className="text-xs text-gray-500 mt-1">Format: Prénom Nom (minimum 2 mots, lettres uniquement)</p>
        </div>

        {/* Email */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">
            <Mail className="w-4 h-4 inline mr-2" />
            Email *
          </label>
          <div className="relative">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 outline-none text-white pr-10 transition-all ${
                errors.email 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('email') && formData.email.trim()
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              placeholder="exemple@email.com"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ValidationIcon fieldName="email" />
            </div>
          </div>
          <ErrorMessage error={errors.email} />
        </div>

        {/* Téléphone */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">
            <Phone className="w-4 h-4 inline mr-2" />
            Téléphone *
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
              onBlur={() => handleFieldBlur('phone')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 outline-none text-white pr-10 transition-all ${
                errors.phone 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('phone') && formData.phone.trim()
                    ? 'border-green-500 focus:ring-green-500/50'
                    : 'border-gray-600 focus:ring-blue-500/50'
              }`}
              placeholder="+33 123456789"
              required
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <ValidationIcon fieldName="phone" />
            </div>
          </div>
          <ErrorMessage error={errors.phone} />
          <p className="text-xs text-gray-500 mt-1">Format international: +CodePays Numéro</p>
        </div>

        {/* Adresse avec autocomplétion */}
        <div className="md:col-span-2 relative">
          <label className="block text-gray-300 mb-2 font-medium">
            <MapPin className="w-4 h-4 inline mr-2" />
            Adresse *
          </label>
          <div className="relative">
            <input
              ref={addressInputRef}
              type="text"
              value={addressQuery}
              onChange={(e) => handleAddressInput(e.target.value)}
              onBlur={() => handleFieldBlur('street')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 outline-none text-white pr-10 transition-all ${
                errors.street 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('street') && formData.street.trim()
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
          <label className="block text-gray-300 mb-2 font-medium">Ville *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleFieldChange('city', e.target.value)}
              onBlur={() => handleFieldBlur('city')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 outline-none text-white pr-10 transition-all ${
                errors.city 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('city') && formData.city.trim()
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

        {/* Code postal */}
        <div>
          <label className="block text-gray-300 mb-2 font-medium">Code postal *</label>
          <div className="relative">
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => handleFieldChange('zipCode', e.target.value)}
              onBlur={() => handleFieldBlur('zipCode')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 outline-none text-white pr-10 transition-all ${
                errors.zipCode 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : touchedFields.has('zipCode') && formData.zipCode.trim()
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
        <div className="md:col-span-2">
          <label className="block text-gray-300 mb-2 font-medium">Pays *</label>
          <div className="relative">
            <select
              value={formData.country}
              onChange={(e) => handleFieldChange('country', e.target.value)}
              onBlur={() => handleFieldBlur('country')}
              className={`w-full px-4 py-3 bg-gray-700 border rounded-lg focus:ring-2 outline-none text-white pr-10 transition-all ${
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
      </div>


    </form>
  );
} 