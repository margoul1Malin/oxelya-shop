import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions Légales | Margoul1 Store',
  description: 'Mentions légales et informations sur l\'éditeur du site Margoul1 Store.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1 className="text-3xl font-bold text-white mb-8">Mentions Légales</h1>
      
      <div className="space-y-8 text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Informations légales</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium text-blue-400 mb-2">Éditeur du site</h3>
              <p>
                <strong>Raison sociale :</strong> Margoul1 Store<br />
                <strong>Forme juridique :</strong> Micro-entreprise<br />
                <strong>Adresse :</strong> France<br />
                <strong>Email :</strong> contact@margoul1.dev<br />
                <strong>Numéro SIRET :</strong> En cours d'obtention
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-medium text-blue-400 mb-2">Directeur de publication</h3>
              <p>
                <strong>Nom :</strong> Margoul1<br />
                <strong>Email :</strong> contact@margoul1.dev
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Hébergement</h2>
          <div>
            <h3 className="text-xl font-medium text-blue-400 mb-2">Hébergeur du site</h3>
            <p>
              <strong>Nom :</strong> Vercel Inc.<br />
              <strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis<br />
              <strong>Site web :</strong> <a href="https://vercel.com" className="text-blue-400 hover:text-blue-300">https://vercel.com</a>
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Propriété intellectuelle</h2>
          <p>
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur 
            et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour 
            les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
          <p className="mt-4">
            La reproduction de tout ou partie de ce site sur un support électronique quel qu'il soit est 
            formellement interdite sauf autorisation expresse du directeur de la publication.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Responsabilité</h2>
          <p>
            Les informations contenues sur ce site sont aussi précises que possible et le site remis à jour 
            à différentes périodes de l'année, mais peut toutefois contenir des inexactitudes ou des omissions.
          </p>
          <p className="mt-4">
            Si vous constatez une lacune, erreur ou ce qui parait être un dysfonctionnement, merci de bien 
            vouloir le signaler par email, à l'adresse contact@margoul1.dev, en décrivant le problème de 
            la manière la plus précise possible.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. Confidentialité</h2>
          <p>
            Ce site ne recueille aucune information personnelle à votre insu. Pour connaître les informations 
            personnelles recueillies et leur traitement, veuillez consulter notre 
            <a href="/politique-de-confidentialite" className="text-blue-400 hover:text-blue-300 ml-1">
              Politique de Confidentialité
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">6. Droit applicable et juridiction</h2>
          <p>
            Tout litige en relation avec l'utilisation du site 
            <span className="text-blue-400"> margoul1store.vercel.app </span>
            est soumis au droit français. Il est fait attribution exclusive de juridiction aux tribunaux 
            compétents de France.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">7. Liens hypertextes</h2>
          <p>
            Les sites internet qui proposent un lien vers notre site sont tenus de demander l'autorisation 
            préalable de l'éditeur. Dans tous les cas, les liens proposés ne peuvent renvoyer qu'à la 
            page d'accueil, ils doivent être présentés de manière non équivoque afin d'éviter :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li>tout risque de confusion entre le site citant et le propriétaire du site</li>
            <li>ainsi que toute présentation tendancieuse, ou contraire aux lois en vigueur</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">8. Force majeure</h2>
          <p>
            L'éditeur ne pourra être tenu responsable de dommages matériels liés à l'utilisation du site. 
            De plus, l'utilisateur du site s'engage à accéder au site en utilisant un matériel récent, 
            ne contenant pas de virus et avec un navigateur de dernière génération mis à jour.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">9. Contact</h2>
          <p>
            Pour toute question relative aux présentes mentions légales, vous pouvez nous contacter :
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li>Par email : <a href="mailto:contact@margoul1.dev" className="text-blue-400 hover:text-blue-300">contact@margoul1.dev</a></li>
            <li>Via notre <a href="/contact" className="text-blue-400 hover:text-blue-300">formulaire de contact</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
} 