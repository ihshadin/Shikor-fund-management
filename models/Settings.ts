import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  key: string;
  value: unknown;
}

const SettingsSchema = new Schema<ISettings>(
  {
    key:   { type: String, required: true, unique: true },
    value: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  (mongoose.models.Settings as Model<ISettings>) ||
  mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
