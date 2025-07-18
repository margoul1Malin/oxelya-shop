import { NextResponse } from 'next/server';
import { verifyAuth } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyAuth();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        order: {
          include: {
            user: true
          }
        },
        user: true
      }
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Facture non trouvée' }, { status: 404 });
    }

    // Vérifier que l'utilisateur peut accéder à cette facture
    if (invoice.userId !== user.id && user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Générer le contenu HTML de la facture
    const htmlContent = generateInvoiceHTML(invoice);

    // Retourner le HTML (pour l'instant, on peut utiliser un service externe pour convertir en PDF)
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="facture-${invoice.invoiceNumber}.html"`
      }
    });

  } catch (error) {
    console.error('Erreur téléchargement facture:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement de la facture' },
      { status: 500 }
    );
  }
}

function generateInvoiceHTML(invoice: any) {
  const currentDate = format(new Date(), 'dd/MM/yyyy', { locale: fr });
  const dueDate = format(new Date(invoice.dueDate), 'dd/MM/yyyy', { locale: fr });
  const invoiceDate = format(new Date(invoice.createdAt), 'dd/MM/yyyy', { locale: fr });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${invoice.invoiceNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: white;
            color: #333;
        }
        .header {
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .company-info {
            float: left;
            width: 50%;
        }
        .invoice-info {
            float: right;
            width: 40%;
            text-align: right;
        }
        .clear {
            clear: both;
        }
        .client-info {
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .total-row {
            font-weight: bold;
            background-color: #f8f9fa;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        .tva-note {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 10px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .legal-info {
            margin-top: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-info">
            <h1>Oxelya Store</h1>
            <p><strong>Auto-entrepreneur</strong></p>
            <p>Théo <strong>MORIO</strong></p>
            <p>Nom commercial: <strong>Oxelya</strong></p>
            <p>Adresse: <strong>32 Rue de Cantelaude</strong></p>
            <p>Code postal: <strong>33380</strong></p>
            <p>Ville: <strong>Marcheprime</strong></p>
            <p>Email: <strong>contact@oxelya.com</strong></p>
            <p>Téléphone: <strong>+33 6 43 32 34 12</strong></p>
        </div>
        <div class="invoice-info">
            <h2>FACTURE</h2>
            <p><strong>Numéro:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoiceDate}</p>
            <p><strong>Échéance:</strong> ${dueDate}</p>
            <p><strong>Statut:</strong> Payée</p>
        </div>
        <div class="clear"></div>
    </div>

    <div class="client-info">
        <h3>Facturé à:</h3>
        <p><strong>${invoice.user.name || 'Client'}</strong></p>
        <p>${invoice.user.email}</p>
        <p>${(() => {
          try {
            const address = JSON.parse(invoice.order.shippingAddress);
            return `${address.name}<br>${address.street}<br>${address.zipCode} ${address.city}<br>${address.country}`;
          } catch {
            return invoice.order.shippingAddress;
          }
        })()}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Quantité</th>
                <th>Prix unitaire HT</th>
                <th>Total HT</th>
            </tr>
        </thead>
        <tbody>
            ${invoice.items.map((item: any) => `
                <tr>
                    <td>${item.label}</td>
                    <td>${item.quantity}</td>
                    <td>${item.unitPrice.toFixed(2)} €</td>
                    <td>${item.totalPrice.toFixed(2)} €</td>
                </tr>
            `).join('')}
        </tbody>
        <tfoot>
            <tr class="total-row">
                <td colspan="3">Total HT</td>
                <td>${invoice.totalHT.toFixed(2)} €</td>
            </tr>
            <tr class="total-row">
                <td colspan="3">TVA (0%)</td>
                <td>0,00 €</td>
            </tr>
            <tr class="total-row">
                <td colspan="3"><strong>Total TTC</strong></td>
                <td><strong>${invoice.totalTTC.toFixed(2)} €</strong></td>
            </tr>
        </tfoot>
    </table>

    <div class="tva-note">
        <strong>Note TVA:</strong> ${invoice.tvaNote || 'TVA non applicable, art. 293 B du CGI'}
    </div>

    <div class="legal-info">
        <h4>Informations légales:</h4>
        <ul>
            <li><strong>Droit de rétractation:</strong> Vous disposez d'un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalité.</li>
            <li><strong>Modalités de paiement:</strong> Carte bancaire, PayPal (bientôt disponible)</li>
            <li><strong>Délais de livraison:</strong> 2-5 jours ouvrés en France métropolitaine</li>
            <li><strong>Frais de livraison:</strong> Inclus dans le prix</li>
        </ul>
    </div>

    <div class="footer">
        <p><strong>Margoul1 Store</strong> - Auto-entrepreneur</p>
        <p>Théo Morio - 32 Rue de Cantelaude, 33380 Marcheprime, France</p>
        <p>Email: contact@oxelya.com - Tél: +33 6 43 32 34 12</p>
        <p>Facture générée automatiquement le ${currentDate}</p>
    </div>
</body>
</html>
  `;
} 