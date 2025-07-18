import Link from "next/link";
import { FiMail, FiPaperclip, FiUser } from "react-icons/fi";

export default function Footer() {


  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Oxelya Shop</h3>
            <p className="text-gray-400">
              Votre destination pour des produits exceptionnels.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white">Accueil</Link></li>
              <li><Link href="/produits" className="text-gray-400 hover:text-white">Produits</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white">Categories</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <ul className="text-gray-400 space-y-2">
              <li><Link href="mailto:contact@margoul1.dev" className="text-gray-400 hover:text-white"><FiMail className="inline-block mr-2" />contact@margoul1.dev</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white"><FiPaperclip className="inline-block mr-2" />Contact</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white"><FiUser className="inline-block mr-2" />Support</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <div className="flex justify-center gap-4">
          <Link href="/mentions-legales" className="text-gray-400 hover:text-white text-center">Mentions légales</Link>
          <Link href="/politique-de-confidentialite" className="text-gray-400 hover:text-white text-center">Politique de confidentialité</Link>
          <Link href="/conditions-generales-de-vente" className="text-gray-400 hover:text-white text-center">Conditions générales de vente</Link> 
          </div>
          <p className="text-gray-400">© 2024 Oxelya Shop. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
} 