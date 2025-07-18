import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité | Margoul1 Store',
  description: 'Politique de confidentialité et protection des données personnelles conforme au RGPD.',
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-8">Politique de Confidentialité</h1>
      
      <div className="space-y-8 text-gray-300">
        <section>
          <p className="text-lg mb-6">
            Chez Margoul1 Store, nous nous engageons à protéger et respecter votre vie privée. 
            Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles 
            conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Responsable du traitement</h2>
          <p>
            <strong>Responsable :</strong> Margoul1 Store<br />
            <strong>Contact :</strong> contact@margoul1.dev<br />
            <strong>Délégué à la protection des données :</strong> contact@margoul1.dev
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Données collectées</h2>
          
          <h3 className="text-xl font-medium text-blue-400 mb-3">2.1 Données d'identification</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Adresse postale (pour les livraisons)</li>
            <li>Numéro de téléphone</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">2.2 Données de commande</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Historique des achats</li>
            <li>Panier d'achat</li>
            <li>Préférences de livraison</li>
            <li>Méthodes de paiement utilisées</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">2.3 Données techniques</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Adresse IP</li>
            <li>Type de navigateur</li>
            <li>Pages visitées</li>
            <li>Cookies techniques</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Finalités du traitement</h2>
          
          <h3 className="text-xl font-medium text-blue-400 mb-3">3.1 Gestion des commandes</h3>
          <p><strong>Base légale :</strong> Exécution du contrat</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Traitement et livraison des commandes</li>
            <li>Facturation et comptabilité</li>
            <li>Service client et support</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">3.2 Gestion du compte utilisateur</h3>
          <p><strong>Base légale :</strong> Exécution du contrat</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Création et gestion du compte</li>
            <li>Authentification et sécurité</li>
            <li>Historique des commandes</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">3.3 Communication</h3>
          <p><strong>Base légale :</strong> Consentement ou intérêt légitime</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Réponse aux demandes de contact</li>
            <li>Notifications de commande</li>
            <li>Newsletter (avec consentement)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Destinataires des données</h2>
          <p>Vos données personnelles peuvent être transmises aux destinataires suivants :</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Prestataires de paiement :</strong> Stripe, PayPal (pour le traitement sécurisé des paiements)</li>
            <li><strong>Transporteurs :</strong> Pour la livraison des commandes</li>
            <li><strong>Prestataires techniques :</strong> Hébergement et maintenance du site</li>
            <li><strong>Autorités compétentes :</strong> En cas d'obligation légale</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. Durée de conservation</h2>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Données de compte :</strong> Jusqu'à suppression du compte ou 3 ans d'inactivité</li>
            <li><strong>Données de commande :</strong> 10 ans (obligations comptables)</li>
            <li><strong>Données de prospection :</strong> 3 ans après dernier contact</li>
            <li><strong>Cookies :</strong> 13 mois maximum</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">6. Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          
          <div className="space-y-4 mt-4">
            <div>
              <h3 className="text-lg font-medium text-blue-400">Droit d'accès</h3>
              <p>Vous pouvez demander l'accès à vos données personnelles.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-blue-400">Droit de rectification</h3>
              <p>Vous pouvez demander la correction de données inexactes.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-blue-400">Droit à l'effacement</h3>
              <p>Vous pouvez demander la suppression de vos données dans certains cas.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-blue-400">Droit à la limitation</h3>
              <p>Vous pouvez demander la limitation du traitement de vos données.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-blue-400">Droit à la portabilité</h3>
              <p>Vous pouvez récupérer vos données dans un format structuré.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-blue-400">Droit d'opposition</h3>
              <p>Vous pouvez vous opposer au traitement de vos données pour motif légitime.</p>
            </div>
          </div>

          <p className="mt-6">
            Pour exercer ces droits, contactez-nous à : 
            <a href="mailto:contact@margoul1.dev" className="text-blue-400 hover:text-blue-300 ml-1">
              contact@margoul1.dev
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">7. Sécurité des données</h2>
          <p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données :</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Chiffrement des données sensibles</li>
            <li>Accès restreint aux données personnelles</li>
            <li>Mise à jour régulière des systèmes de sécurité</li>
            <li>Formation du personnel à la protection des données</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">8. Cookies</h2>
          <p>Notre site utilise des cookies pour :</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li><strong>Cookies essentiels :</strong> Fonctionnement du site (panier, connexion)</li>
            <li><strong>Cookies de performance :</strong> Amélioration de l'expérience utilisateur</li>
            <li><strong>Cookies d'authentification :</strong> Maintien de votre session</li>
          </ul>
          <p className="mt-4">
            Vous pouvez gérer vos préférences de cookies dans votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">9. Transferts internationaux</h2>
          <p>
            Certains de nos prestataires peuvent être situés en dehors de l'Union européenne. 
            Dans ce cas, nous nous assurons que des garanties appropriées sont en place 
            (décisions d'adéquation, clauses contractuelles types).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">10. Modifications</h2>
          <p>
            Cette politique peut être mise à jour occasionnellement. 
            La version en vigueur est celle publiée sur notre site avec la date de dernière modification.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">11. Contact et réclamations</h2>
          <p>
            Pour toute question concernant cette politique ou vos données personnelles :
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Email : <a href="mailto:contact@margoul1.dev" className="text-blue-400 hover:text-blue-300">contact@margoul1.dev</a></li>
            <li>Formulaire de contact : <a href="/contact" className="text-blue-400 hover:text-blue-300">Nous contacter</a></li>
          </ul>
          
          <p className="mt-6">
            Vous avez également le droit d'introduire une réclamation auprès de la 
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1">
              Commission Nationale de l'Informatique et des Libertés (CNIL)
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
} 