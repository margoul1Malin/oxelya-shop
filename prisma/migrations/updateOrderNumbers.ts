import { PrismaClient } from '@prisma/client';
import { MongoClient, ObjectId } from 'mongodb';

async function updateOrderNumbers() {
  const uri = process.env.DATABASE_URL!;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("techstore");
    const orders = database.collection("Order");

    // Supprimer l'index s'il existe
    try {
      await orders.dropIndex("Order_orderNumber_key");
    } catch (e) {
      console.log('Index non trouvé ou déjà supprimé');
    }

    // Mettre à jour toutes les commandes
    const cursor = orders.find({});
    let count = 0;

    for await (const order of cursor) {
      await orders.updateOne(
        { _id: order._id },
        { 
          $set: { 
            orderNumber: `ORD-${order._id.toString().slice(-6).toUpperCase()}` 
          } 
        }
      );
      count++;
    }

    console.log(`${count} commandes mises à jour`);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await client.close();
  }
}

updateOrderNumbers(); 