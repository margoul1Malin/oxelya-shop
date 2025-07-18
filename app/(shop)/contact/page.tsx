'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, MessageCircle } from 'lucide-react';
import ContactForm from '../../../components/contact/ContactForm';

export default function ContactPage() {
  useEffect(() => {
    // Change le titre de la page une fois que le composant est monté
    document.title = "Margoul1 - Contact";
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "contact@oxelya.com",
      description: "Réponse sous 24h"
    },
    {
      icon: Phone,
      title: "Téléphone",
      content: "+33 6 43 32 34 12",
      description: "24/7"
    },
  ];

  return (
    <main className="min-h-screen text-white pt-20 bg-black">
      {/* Hero Section avec arrière-plan animé - hauteur réduite */}
      <section className="relative h-[35vh] flex items-center overflow-hidden">
        {/* Arrière-plan animé avec particules */}
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-black"></div>
          {/* Particules animées */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-500/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-4"
          >
            <MessageCircle className="w-12 h-12 mx-auto text-blue-500 mb-3" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"
          >
            Contactez-nous
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-300 max-w-2xl mx-auto mt-3"
          >
            Une question ? Un problème ? Notre équipe est là pour vous aider.
          </motion.p>
        </div>
      </section>

      {/* Formulaire de contact - maintenant visible directement */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-2">Envoyez-nous un message</h2>
            <p className="text-gray-400">Nous répondrons dans les plus brefs délais</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"></div>
            <div className="relative">
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Informations de contact - déplacé après le formulaire */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Nos Coordonnées</h2>
            <p className="text-gray-400">Plusieurs façons de nous joindre</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-xl bg-gray-800 p-6 hover:bg-gray-700 transition-all duration-300 hover:scale-105"
              >
                <div className="relative z-10">
                  <info.icon className="w-8 h-8 mb-4 text-blue-500 group-hover:text-blue-400 transition-colors" />
                  <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                  <p className="text-blue-400 font-medium">{info.content}</p>
                  <p className="text-gray-400 text-sm mt-1">{info.description}</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section FAQ rapide */}
      <section className="py-16 bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">Questions Fréquentes</h2>
            <p className="text-gray-400">Trouvez rapidement des réponses</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Délai de livraison ?",
                answer: "Livraison sous 2-5 jours ouvrés en France métropolitaine."
              },
              {
                question: "Retours possibles ?",
                answer: "Retours acceptés sous 14 jours pour tout produit non utilisé."
              },
              {
                question: "Support technique ?",
                answer: "Support disponible par email et téléphone du lundi au vendredi."
              },
              {
                question: "Paiement sécurisé ?",
                answer: "Tous nos paiements sont sécurisés par cryptage SSL."
              }
            ].map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 