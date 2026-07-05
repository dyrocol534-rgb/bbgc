import mongoose from "mongoose";

const AppInstallSchema = new mongoose.Schema({
  deviceType: { type: String, required: true },
  userAgent: { type: String, required: false },
  installedAt: { type: Date, default: Date.now },
});

export default mongoose.models.AppInstall || mongoose.model("AppInstall", AppInstallSchema);
