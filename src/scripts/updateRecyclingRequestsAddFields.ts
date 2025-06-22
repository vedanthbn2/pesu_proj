import mongoose from 'mongoose';
import RecyclingRequest from '../models/RecyclingRequest';

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db-name');

    console.log('Connected to MongoDB');

    const result = await RecyclingRequest.updateMany(
      {
        $or: [
          { collectionNotes: { $exists: false } },
          { collectionProof: { $exists: false } },
        ],
      },
      {
        $set: {
          collectionNotes: '',
          collectionProof: '',
        },
      }
    );

    console.log(`Migration completed. Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
