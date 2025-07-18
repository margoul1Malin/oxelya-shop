import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente | Margoul1 Store',
  description: 'Conditions générales de vente et termes contractuels de Margoul1 Store.',
};

export default function ConditionsGeneralesPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-8">Conditions Générales de Vente</h1>
      
      <div className="space-y-8 text-gray-300">
        <section>
          <p className="text-lg mb-6">
            Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits 
            effectuées par Margoul1 Store. Elles s'appliquent à toute commande passée sur notre site internet.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Informations générales</h2>
          <p>
            <strong>Vendeur :</strong> Margoul1 Store<br />
            <strong>Forme juridique :</strong> Micro-entreprise<br />
            <strong>Adresse :</strong> France<br />
            <strong>Email :</strong> contact@margoul1.dev<br />
            <strong>Numéro SIRET :</strong> En cours d'obtention<br />
            <strong>TVA :</strong> Non assujetti (micro-entreprise)
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Champ d'application</h2>
          <p>
            Ces CGV s'appliquent à toutes les ventes de produits réalisées par Margoul1 Store 
            à des consommateurs au sens du Code de la consommation. Elles régissent les relations 
            contractuelles entre le vendeur et l'acheteur.
          </p>
          <p className="mt-4">
            Le fait de passer commande implique l'adhésion entière et sans réserve aux présentes CGV.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Produits</h2>
          
          <h3 className="text-xl font-medium text-blue-400 mb-3">3.1 Description</h3>
          <p>
            Les produits proposés sont décrits avec la plus grande exactitude possible. 
            Les photographies et descriptifs ont une valeur indicative et n'engagent pas 
            le vendeur quant aux variations de couleur ou d'aspect pouvant résulter de l'affichage.
          </p>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">3.2 Disponibilité</h3>
          <p>
            Nos offres de produits sont valables tant qu'elles sont visibles sur le site, 
            dans la limite des stocks disponibles. En cas d'indisponibilité, nous nous engageons 
            à informer le client dans les meilleurs délais.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Commandes</h2>
          
          <h3 className="text-xl font-medium text-blue-400 mb-3">4.1 Processus de commande</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Sélection des produits et ajout au panier</li>
            <li>Vérification du contenu du panier</li>
            <li>Identification ou création de compte</li>
            <li>Saisie des informations de livraison</li>
            <li>Choix du mode de paiement</li>
            <li>Validation définitive de la commande</li>
          </ol>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">4.2 Confirmation</h3>
          <p>
            Toute commande fait l'objet d'un accusé de réception par email. 
            La vente ne sera considérée comme définitive qu'après encaissement du paiement 
            et confirmation d'expédition.
          </p>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">4.3 Modification/Annulation</h3>
          <p>
            Toute modification ou annulation de commande n'est possible que si la commande 
            n'a pas encore été expédiée. Contactez-nous immédiatement après votre commande 
            pour toute demande de modification.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. Prix</h2>
          
          <h3 className="text-xl font-medium text-blue-400 mb-3">5.1 Prix des produits</h3>
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises (TTC). 
            Ils ne comprennent pas les frais de livraison qui sont facturés en supplément.
          </p>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">5.2 Révision des prix</h3>
          <p>
            Les prix peuvent être modifiés à tout moment mais les produits seront facturés 
            sur la base des tarifs en vigueur au moment de la validation de la commande.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">6. Paiement</h2>
          
          <h3 className="text-xl font-medium text-blue-400 mb-3">6.1 Modalités</h3>
          <p>Le paiement s'effectue :</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Par carte bancaire (Visa, Mastercard, American Express) via Stripe</li>
            <li>Par PayPal</li>
            <li>Par cryptomonnaies (pour certains produits)</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">6.2 Sécurité</h3>
          <p>
            Le paiement en ligne est sécurisé. Nous ne conservons aucune donnée bancaire. 
            Les paiements sont traités par nos prestataires certifiés PCI-DSS.
          </p>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">6.3 Échéance</h3>
          <p>
            Le paiement est exigible immédiatement à la commande. 
            En cas de refus d'autorisation de paiement, la commande sera automatiquement annulée.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">7. Livraison</h2>
          
          <h3 className="text-xl font-medium text-blue-400 mb-3">7.1 Zones de livraison</h3>
          <p>Nous livrons en France métropolitaine et en Union européenne.</p>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">7.2 Délais</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><strong>Livraison standard :</strong> 2 à 5 jours ouvrés</li>
            <li><strong>Livraison express :</strong> 24 à 48 heures</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">7.3 Frais de port</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Livraison standard : 4,90€</li>
            <li>Livraison express : 9,90€</li>
            <li>Gratuite à partir de 50€ d'achat</li>
          </ul>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">7.4 Réception</h3>
          <p>
            En cas d'absence lors de la livraison, un avis de passage sera laissé. 
            Il appartient au destinataire de retirer le colis dans les délais impartis.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">8. Droit de rétractation</h2>
          
          <h3 className="text-xl font-medium text-blue-400 mb-3">8.1 Délai</h3>
          <p>
            Conformément à l'article L221-18 du Code de la consommation, vous disposez d'un délai 
            de 14 jours francs pour exercer votre droit de rétractation sans avoir à justifier 
            de motifs ni à payer de pénalité.
          </p>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">8.2 Modalités</h3>
          <p>
            Pour exercer ce droit, informez-nous de votre décision par email à 
            <a href="mailto:contact@margoul1.dev" className="text-blue-400 hover:text-blue-300">contact@margoul1.dev</a>. 
            Vous devez renvoyer le produit sans délai et au plus tard 14 jours après nous avoir 
            communiqué votre décision.
          </p>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">8.3 Exceptions</h3>
          <p>Le droit de rétractation ne peut être exercé pour :</p>
          <ul className="list-disc list-inside space-y-2 mt-2">
            <li>Les produits personnalisés</li>
            <li>Les produits dématérialisés (logiciels, licences)</li>
            <li>Les produits d'hygiène descellés</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">9. Garanties</h2>
          
          <h3 className="text-xl font-medium text-blue-400 mb-3">9.1 Garantie légale de conformité</h3>
          <p>
            Tous nos produits bénéficient de la garantie légale de conformité (art. L217-4 et suivants 
            du Code de la consommation) et de la garantie contre les vices cachés (art. 1641 et suivants 
            du Code civil).
          </p>

          <h3 className="text-xl font-medium text-blue-400 mb-3 mt-6">9.2 Garantie commerciale</h3>
          <p>
            Certains produits peuvent bénéficier d'une garantie commerciale du fabricant. 
            Les conditions sont précisées dans la fiche produit.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">10. Service après-vente</h2>
          <p>
            Pour toute réclamation ou demande d'assistance, contactez notre service client :
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Email : <a href="mailto:contact@margoul1.dev" className="text-blue-400 hover:text-blue-300">contact@margoul1.dev</a></li>
            <li>Formulaire de contact : <a href="/contact" className="text-blue-400 hover:text-blue-300">Nous contacter</a></li>
            <li>Centre d'aide : <a href="/support" className="text-blue-400 hover:text-blue-300">Support</a></li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">11. Responsabilité</h2>
          <p>
            Notre responsabilité ne saurait être engagée pour tous les inconvénients ou dommages 
            inhérents à l'utilisation du réseau Internet, notamment une rupture de service, 
            une intrusion extérieure ou la présence de virus informatiques.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">12. Propriété intellectuelle</h2>
          <p>
            Tous les éléments du site (textes, images, sons, etc.) sont protégés par le droit 
            d'auteur, des marques ou des brevets. Ils sont la propriété exclusive de Margoul1 Store.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">13. Données personnelles</h2>
          <p>
            Le traitement de vos données personnelles est décrit dans notre 
            <a href="/politique-de-confidentialite" className="text-blue-400 hover:text-blue-300 ml-1">
              Politique de Confidentialité
            </a>, 
            conforme au RGPD.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">14. Médiation</h2>
          <p>
            En cas de litige, vous pouvez recourir à une procédure de médiation conventionnelle 
            ou à tout autre mode alternatif de règlement des différends. 
            Vous pouvez également vous adresser à la plateforme de résolution des litiges 
            mise en ligne par la Commission européenne à l'adresse : 
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 ml-1">
              https://ec.europa.eu/consumers/odr/
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">15. Droit applicable</h2>
          <p>
            Les présentes CGV sont régies par le droit français. 
            En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">16. Modification des CGV</h2>
          <p>
            Margoul1 Store se réserve le droit de modifier les présentes CGV à tout moment. 
            Les CGV applicables sont celles en vigueur à la date de la commande.
          </p>
        </section>
      </div>
    </div>
  );
} 