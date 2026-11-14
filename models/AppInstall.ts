import mongoose from "mongoose";

const AppInstallSchema = new mongoose.Schema({
  deviceType: { type: String, required: true },
  userAgent: { type: String, required: false },
  installedAt: { type: Date, default: Date.now, index: true },
  gameSlug: { type: String, default: null, index: true },
  gameTitle: { type: String, default: null },
  installType: { type: String, enum: ["app", "game"], default: "app", index: true },
});

export default mongoose.models.AppInstall || mongoose.model("AppInstall", AppInstallSchema);
