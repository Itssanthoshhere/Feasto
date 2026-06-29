import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  target: string;
  message: string;
  createdAt: Date;
  read: boolean;
}

const NotificationSchema = new Schema<INotification>({
  target: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
  "adminnotifications",
);
