'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Clock, 
  ArrowRight,
  Search,
  ChevronDown,
  ChevronUp,
  Shield,
  CreditCard,
  Truck,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: "Comment passer une commande ?",
    answer: "Pour passer une commande, ajoutez les produits désirés à votre panier, procédez au checkout, renseignez vos informations de livraison et de paiement, puis confirmez votre commande.",
    category: "Commandes"
  },
  {
    id: 2,
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons les cartes bancaires (Visa, Mastercard, American Express) via Stripe, PayPal, et les paiements en cryptomonnaies pour certains produits.",
    category: "Paiement"
  },
  {
    id: 3,
    question: "Combien de temps prend la livraison ?",
    answer: "La livraison standard prend 2-5 jours ouvrés. La livraison express (24-48h) est disponible moyennant supplément. Vous recevrez un email de confirmation avec le suivi.",
    category: "Livraison"
  },
  {
    id: 4,
    question: "Puis-je retourner un produit ?",
    answer: "Oui, vous disposez de 14 jours après réception pour retourner un produit dans son état d'origine. Les frais de retour sont à votre charge.",
    category: "Retours"
  },
  {
    id: 5,
    question: "Comment suivre ma commande ?",
    answer: "Après expédition, vous recevrez un email avec le numéro de suivi. Vous pouvez aussi consulter l'état de vos commandes dans votre espace client.",
    category: "Commandes"
  },
  {
    id: 6,
    question: "Que faire si mon produit est défectueux ?",
    answer: "Contactez-nous immédiatement avec des photos du défaut. Nous organiserons un échange ou remboursement selon le cas.",
    category: "SAV"
  },
  {
    id: 7,
    question: "Puis-je modifier ma commande ?",
    answer: "Les modifications ne sont possibles que si la commande n'a pas encore été expédiée. Contactez-nous rapidement après votre commande pour toute modification.",
    category: "Commandes"
  },
  {
    id: 8,
    question: "Comment obtenir une facture ?",
    answer: "Les factures sont automatiquement envoyées par email après chaque commande. Vous pouvez aussi les télécharger depuis votre espace client.",
    category: "Facturation"
  }
];

const categories = ["Tous", "Commandes", "Paiement", "Livraison", "Retours", "SAV", "Facturation"];

const categoryIcons: { [key: string]: any } = {
  "Commandes": MessageCircle,
  "Paiement": CreditCard,
  "Livraison": Truck,
  "Retours": RefreshCw,
  "SAV": Shield,
  "Facturation": Mail
};

export default function SupportPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "Tous" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Vous devez être connecté pour envoyer un message');
      router.push('/login');
      return;
    }

    if (!contactForm.subject.trim() || !contactForm.content.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'envoi du message');
      }

      toast.success('Message envoyé avec succès !');
      setContactForm({ subject: '', content: '' });
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-24">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Centre d'Aide
            </h1>
          </div>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions ou contactez notre équipe support
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-blue-400" />
                Questions Fréquentes
              </h2>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher dans les FAQ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Categories */}
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === category
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-4">
                {filteredFAQs.map((faq) => {
                  const IconComponent = categoryIcons[faq.category] || HelpCircle;
                  
                  return (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gray-700/30 rounded-lg border border-gray-600/30"
                    >
                      <button
                        onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-600/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-blue-400 flex-shrink-0" />
                          <span className="text-white font-medium">{faq.question}</span>
                        </div>
                        {expandedFAQ === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {expandedFAQ === faq.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-4 pb-4"
                        >
                          <div className="text-gray-300 leading-relaxed pl-8">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">Aucune FAQ trouvée pour votre recherche</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Contact & Info Sidebar */}
          <div className="space-y-6">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" />
                Nous Contacter
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Sujet *"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    required
                    minLength={3}
                  />
                </div>

                <div>
                  <textarea
                    placeholder="Message *"
                    rows={6}
                    value={contactForm.content}
                    onChange={(e) => setContactForm({...contactForm, content: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                    required
                    minLength={10}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !session}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Envoyer le message
                    </>
                  )}
                </button>

                {!session && (
                  <p className="text-red-400 text-sm mt-4">
                    Vous devez être connecté pour envoyer un message.{' '}
                    <button
                      onClick={() => router.push('/login')}
                      className="text-blue-400 hover:underline"
                    >
                      Se connecter
                    </button>
                  </p>
                )}
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h3 className="text-xl font-bold text-white mb-4">Informations de Contact</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-300">Email</p>
                    <p className="text-white font-medium">contact@margoul1.dev</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-300">Horaires de support</p>
                    <p className="text-white font-medium">24/7</p>
                    <p className="text-gray-400 text-sm">Réponse sous 24h</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50"
            >
              <h3 className="text-xl font-bold text-white mb-4">Liens Utiles</h3>
              
              <div className="space-y-3">
                <a href="/profil/commandes" className="flex items-center justify-between p-2 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all">
                  <span>Mes commandes</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                
                <a href="/profil/parametres" className="flex items-center justify-between p-2 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all">
                  <span>Mon profil</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                
                <a href="/contact" className="flex items-center justify-between p-2 text-gray-300 hover:text-white hover:bg-gray-700/30 rounded-lg transition-all">
                  <span>Contact direct</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 