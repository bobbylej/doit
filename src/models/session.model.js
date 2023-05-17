import mongoose from "mongoose";
import encrypt from "mongoose-encryption";

export const SESSION_MODEL_API_KEYS = {
  OPENAI_API_KEY: "openAIAPIKey",
  OPENAI_ORGANIZATION_ID: "openAIAPIOrganization",
  JIRA_API_KEY: "jiraAPIKey",
  JIRA_HOST: "jiraHost",
  JIRA_USERNAME: "jiraUsername",
}

const SessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    expires: { type: Number, index: true, required: true },
    [SESSION_MODEL_API_KEYS.OPENAI_API_KEY]: { type: String, required: true },
    [SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID]: { type: String },
    [SESSION_MODEL_API_KEYS.JIRA_API_KEY]: { type: String, required: true },
    [SESSION_MODEL_API_KEYS.JIRA_HOST]: { type: String, required: true },
    [SESSION_MODEL_API_KEYS.JIRA_USERNAME]: { type: String, required: true },
    messages: { type: Array, default: [] },
  },
  {
    capped: { size: 1024 },
    bufferCommands: false,
  }
);

SessionSchema.plugin(encrypt, {
  encryptionKey: process.env.MONGODB_ENCRYPTION_KEY,
  signingKey: process.env.MONGODB_SIGNING_KEY,
  excludeFromEncryption: ["userId", "expires"],
});

SessionSchema.pre("save", (next) => {
  Session.deleteMany({ expires: { $lt: Date.now() } })
    .then((data) => {
      console.log("Removed expired sessions.", data);
    })
    .catch((error) => {
      console.error("Remove expired sessions failed.", error);
    });

  next();
});

export const Session = mongoose.model(
  process.env.MONGODB_SESSIONS_COLLECTION,
  SessionSchema
);
