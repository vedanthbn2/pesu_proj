import mongoose, { Schema, Document } from 'mongoose';

export interface IRecyclingRequest extends Document {
  userId: string;
  userEmail: string;
  fullName?: string;
  recycleItem: string;
  recycleItemFromForm?: string;
  category?: string;
  preferredContactNumber?: string;
  alternateContactNumber?: string;
  pickupDate: string;
  pickupTime: string;
  deviceCondition?: string;
  status: string;
  assignedReceiver: string;
  receiverEmail: string;
  receiverPhone: string;
  receiverName: string;
  address?: string;
  createdAt: Date;
  collectionNotes?: string;
  collectionProof?: string;
  specialInstructions?: string;
  userIdToShow?: string;
}

const RecyclingRequestSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    userEmail: { type: String, required: true },
    fullName: { type: String },
    recycleItem: { type: String, required: true },
    recycleItemFromForm: { type: String },
    category: { type: String },
    preferredContactNumber: { type: String },
    alternateContactNumber: { type: String },
    pickupDate: { type: String, required: true },
    pickupTime: { type: String, required: true },
    deviceCondition: { type: String },
    status: { type: String, required: true },
    assignedReceiver: { type: String, required: true },
    receiverEmail: { type: String, required: true },
    receiverPhone: { type: String, required: true },
    receiverName: { type: String, required: true },
    address: { type: String },
    createdAt: { type: Date, default: Date.now },
    collectionNotes: { type: String },
    collectionProof: { type: String },
    specialInstructions: { type: String },
    userIdToShow: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.RecyclingRequest || mongoose.model<IRecyclingRequest>('RecyclingRequest', RecyclingRequestSchema);
