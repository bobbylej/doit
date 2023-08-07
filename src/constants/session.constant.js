import { SESSION_MODEL_API_KEYS } from "../models/session.model.js";
import { JIRA_API_KEYS_LINK, OPENAI_API_KEYS_LINK, OPENAI_ORGANIZATION_ID_LINK } from "./links.constant.js";

export const SESSION_MAX_AGE = 24 * 60 * 60 * 1000;

export const SESSION_API_KEY_PLACEHOLDER_DEFAULT_VALUE = "leave empty to use default value";

export const SESSION_API_KEYS_FIELDS = [
  {
    key: SESSION_MODEL_API_KEYS.OPENAI_API_KEY,
    label: "OpenAI API Key",
    placeholder: "Provide OpenAI API Key",
    helpText: `To create API key for OpenAI please visit ${OPENAI_API_KEYS_LINK}.`,
    required: !process.env.OPENAI_API_KEY
  },
  {
    key: SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID,
    label: "OpenAI Organization ID",
    placeholder: "Provide OpenAI Organization ID",
    helpText: `To get Organization ID for OpenAI please visit ${OPENAI_ORGANIZATION_ID_LINK}.`,
    required: false
  },
  {
    key: SESSION_MODEL_API_KEYS.JIRA_API_KEY,
    label: "JIRA API Token",
    placeholder: "Provide JIRA API Token",
    helpText: `To get API key for JIRA please visit ${JIRA_API_KEYS_LINK}.`,
    required: !process.env.JIRA_API_TOKEN
  },
  {
    key: SESSION_MODEL_API_KEYS.JIRA_HOST,
    label: "JIRA Host",
    placeholder: "Provide JIRA Host",
    helpText: `Provide it in format: _your-organization.atlassian.net_.`,
    required: !process.env.JIRA_HOST
  },
  {
    key: SESSION_MODEL_API_KEYS.JIRA_USERNAME,
    label: "JIRA Username",
    placeholder: "Provide JIRA Username",
    helpText: `That is your email used in JIRA.`,
    required: true
  },
];