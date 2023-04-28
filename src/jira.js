import fetch from "node-fetch";
import { JIRA_OPENAI_INIT_MESSAGES, JIRA_OPENAI_SYSTEM_MESSAGES, JIRA_OPENAI_SYSTEM_PROMPT } from "./constants/jira-openai-prompts.js";
import { createChatCompletion, createCompletion } from "./openai.js";

const configuration = {
  username: process.env.JIRA_USERNAME,
  apiToken: process.env.JIRA_API_TOKEN,
  host: process.env.JIRA_HOST,
  apiVersion: process.env.JIRA_API_VERSION,
};

const apiUrl = `https://${configuration.host}/rest/api/${configuration.apiVersion}`;

const headers = {
  Authorization: `Basic ${Buffer.from(
    `${configuration.username}:${configuration.apiToken}`
  ).toString("base64")}`,
  Accept: "application/json",
  'Content-Type': 'application/json',
};

export const jira = (url, request, query) => {
  const finalUrl = query ? `${url}?${new URLSearchParams(query)}` : url;
  return fetch(finalUrl, { headers, ...request })
}

export const getCreateIssueMetaData = () => {
  return jira(`${apiUrl}/issue/createmeta`, { method: "GET" });
}

export const generateJiraChatRequests = async (actions) => {
  const messages = [...JIRA_OPENAI_SYSTEM_MESSAGES, ...JIRA_OPENAI_INIT_MESSAGES, { role: "user", content: actions }];
  const completion = await createChatCompletion(messages);
  return completion.data.choices[0].message.content;
}

export const generateJiraRequests = async (actions) => {
  const prompt = `${JIRA_OPENAI_SYSTEM_PROMPT} ${actions}`;
  const completion = await createCompletion(prompt);
  return completion.data.choices[0].text;
}