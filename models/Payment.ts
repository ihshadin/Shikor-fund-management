import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPayment extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  year: number;
  months: string[];
  amount: number;
  method: 'Bkash' | 'Bank' | 'ToMember';
  recipientName?: string;
  date: string;
  transactionId?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedByName?: string;
  reviewedBy?: mongoose.Types.ObjectId;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name:          { type: String, required: true },
    year:          { type: Number, required: true },
    months:        { type: [String], required: true },
    amount:        { type: Number, required: true, min: 1 },
    method:        { type: String, enum: ['Bkash', 'Bank', 'ToMember'], required: true },
    recipientName: { type: String, default: '' },
    date:          { type: String, required: true },
    transactionId: { type: String, default: '' },
    status:        { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    approvedByName:{ type: String, default: '' },
    reviewedBy:    { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ year: 1, months: 1 });

const Payment: Model<IPayment> =
  (mongoose.models.Payment as Model<IPayment>) ||
  mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
