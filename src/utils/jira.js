import fetch from "node-fetch";
import {
  CONTENT_TYPE_NOTE,
  CONTENT_TYPE_REQUEST,
  JIRA_OPENAI_REQUEST_REGEX,
  JIRA_OPENAI_SYSTEM_MESSAGES,
  JIRA_OPENAI_SYSTEM_PROMPT,
} from "../constants/jira-openai-prompts.js";
import { createChatCompletion, createCompletion } from "./openai.js";
import { convertBodyForRequest } from "./api.js";
import { mergeArraysAlternately } from "./array.js";
import { setValueByPath } from "./object.js";

const configuration = {
  username: process.env.JIRA_USERNAME,
  apiToken: process.env.JIRA_API_TOKEN,
  host: process.env.JIRA_HOST,
  apiVersion: process.env.JIRA_API_VERSION,
};

const apiUrl = `/rest/api/${configuration.apiVersion}`;

const headers = {
  Authorization: `Basic ${Buffer.from(
    `${configuration.username}:${configuration.apiToken}`
  ).toString("base64")}`,
  Accept: "application/json",
  "Content-Type": "application/json",
};

const messages = [...JIRA_OPENAI_SYSTEM_MESSAGES];

export const jira = (url, request, query) => {
  const finalUrl = query ? `${url}?${new URLSearchParams(query)}` : url;
  const { body, ...options } = request;
  return fetch(`https://${configuration.host}${finalUrl}`, {
    headers,
    ...options,
    body: convertBodyForRequest(body),
  });
};

export const bulkJira = (requests) => {
  return Promise.all(
    requests.map(({ url, method, body, query }) =>
      jira(url, { method, body }, query)
        .then((response) => response.json())
        .then((response) => {
          if (response.errors)
            return Promise.reject({
              request: {
                url,
                method,
                body,
                query,
              },
              error: response.errors,
            });
          return response;
        })
    )
  );
};

export const pushJiraResponsesMessage = (responses) => {
  pushMessages([
    {
      role: "user",
      content: `Here are responses for last requests: ${JSON.stringify(
        responses
      )}`,
    },
  ]);
};

export const getCreateIssueMetaData = () => {
  return jira(`${apiUrl}/issue/createmeta`, { method: "GET" });
};

export const pushMessages = (newMessages) => {
  messages.push(...newMessages);
};

export const generateJiraChatRequests = async (actions) => {
  pushMessages([{ role: "user", content: actions }]);
  const completion = await createChatCompletion(messages);
  pushMessages([completion.data.choices[0].message]);
  return completion.data.choices[0].message.content;
};

export const generateJiraRequests = async (actions) => {
  const prompt = `${JIRA_OPENAI_SYSTEM_PROMPT} ${actions}`;
  const completion = await createCompletion(prompt);
  return completion.data.choices[0].text;
};

export const convertTextMessageWithRequests = (message) => {
  const startMarker = "//--START--//\n";
  const requestMarker = "//--REQUEST--//";
  message = `${startMarker}${message}`;
  const notes = message
    .replace(JIRA_OPENAI_REQUEST_REGEX, requestMarker)
    .split(requestMarker)
    .map((note) => ({ type: CONTENT_TYPE_NOTE, content: note }));
  const requests = getRequestsFromText(message).map((request) => ({
    type: CONTENT_TYPE_REQUEST,
    content: request,
  }));
  const content = mergeArraysAlternately(notes, requests);
  content[0].content = content[0].content.replace(startMarker, "");
  return content;
};

const getRequestsFromText = (message) => {
  const requests = [...message.matchAll(JIRA_OPENAI_REQUEST_REGEX)]
    .map((match) => JSON.parse(match[1]))
    .flat(1);
  return requests;
};

export const convertSlackStateObjectToRequests = (state) => {
  return Object.values(
    Object.values(state).reduce(
      (request, item) =>
        Object.entries(item).reduce((acc, [path, { value }]) => {
          setValueByPath(acc, path, value);
          return acc;
        }, request),
      {}
    )
  );
};

export const convertJiraErrorToSlackMessage = (error) => {
  return `For request:\n\`\`\`${JSON.stringify(
    error.request
  )}\`\`\`\n\nWe got such error:\n\`\`\`${JSON.stringify(error.error)}\`\`\``;
};
