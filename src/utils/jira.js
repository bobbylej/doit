import fetch from "node-fetch";
import {
  CONTENT_TYPE_NOTE,
  CONTENT_TYPE_REQUEST,
  JIRA_OPENAI_REQUEST_REGEX,
  JIRA_OPENAI_SYSTEM_PROMPT,
} from "../constants/jira-openai-prompts.js";
import { createChatCompletion, createCompletion } from "./openai.js";
import { convertBodyForRequest } from "./api.js";
import { mergeArraysAlternately } from "./array.js";
import { parseJSON, prettyPrintJSON, setValueByPath } from "./object.js";
import { PROMISE_STATUS } from "../constants/promise.js";
import { SESSION_MODEL_API_KEYS } from "../models/session.model.js";

const configuration = {
  username: process.env.JIRA_USERNAME,
  apiToken: process.env.JIRA_API_TOKEN,
  host: process.env.JIRA_HOST,
  apiVersion: process.env.JIRA_API_VERSION,
};

const getJiraHeaders = ({ username, apiToken }) => ({
  Authorization: `Basic ${Buffer.from(`${username}:${apiToken}`).toString(
    "base64"
  )}`,
  Accept: "application/json",
  "Content-Type": "application/json",
});

export const jira = async (request, session) => {
  const headers = getJiraHeaders({
    username: session[SESSION_MODEL_API_KEYS.JIRA_USERNAME],
    apiToken: session[SESSION_MODEL_API_KEYS.JIRA_API_TOKEN],
  });
  const host = session[SESSION_MODEL_API_KEYS.JIRA_HOST];
  const url = request.query
    ? `${request.url}?${new URLSearchParams(request.query)}`
    : request.url;
  const response = await fetch(`https://${host}${url}`, {
    headers,
    method: request.method,
    body: request.body && convertBodyForRequest(request.body),
  });
  try {
    const responseBody = await response.json();
    if (responseBody.errors || responseBody.errorMessages) {
      return Promise.reject({
        request,
        status: response.status,
        error: [
          ...(Object.entries(responseBody.errors) || []),
          ...(responseBody.errorMessages || []),
        ],
      });
    }
    return {
      request,
      response: responseBody,
    };
  } catch (error) {
    return Promise.reject({
      request,
      status: response.status,
      error: [response.statusText],
    });
  }
};

export const bulkJira = async (requests, session) => {
  const responses = await Promise.allSettled(
    requests.map((request) => jira(request, session))
  );
  const areAllFulfilled = responses.reduce(
    (areAllFulfilled, response) =>
      areAllFulfilled && response.status === PROMISE_STATUS.FULFILLED,
    true
  );
  if (!areAllFulfilled) return Promise.reject(responses);
  return responses;
};

export const generateJiraChatRequests = async (messages, session) => {
  const completion = await createChatCompletion(messages, session);
  return completion.data.choices[0].message.content;
};

export const generateJiraRequests = async (actions, session) => {
  const prompt = `${JIRA_OPENAI_SYSTEM_PROMPT} ${JSON.stringify(actions)}`;
  const completion = await createCompletion(prompt, session);
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
  const requests = getRequestsFromText(message).map((requests) => {
    if (Array.isArray(requests)) {
      return requests.map((request) => ({
        type: CONTENT_TYPE_REQUEST,
        content: request,
      }));
    }
    return {
      type: CONTENT_TYPE_REQUEST,
      content: requests,
    };
  });
  const content = mergeArraysAlternately(notes, requests).flat();
  content[0].content = content[0].content.replace(startMarker, "");
  return content;
};

const getRequestsFromText = (message) => {
  const requests = [...message.matchAll(JIRA_OPENAI_REQUEST_REGEX)].map(
    (match) => {
      try {
        return parseJSON(match[1]);
      } catch (error) {
        console.error(match[1], error);
        return null;
      }
    }
  );
  return requests;
};

export const convertSlackStateObject = (state) => {
  return Object.values(state).reduce(
    (request, item) =>
      Object.entries(item).reduce((acc, [path, inputState]) => {
        const value = getValueForInputFromState(inputState);
        setValueByPath(acc, path, value);
        return acc;
      }, request),
    {}
  );
};

export const convertSlackStateObjectToRequests = (state) => {
  return Object.values(convertSlackStateObject(state)).map((value) => {
    return (
      value && {
        ...value,
        request:
          typeof value.request === "string"
            ? parseJSON(value.request)
            : value.request,
      }
    );
  });
};

const getValueForInputFromState = (state) => {
  switch (state.type) {
    case "plain_text_input":
      return state.value;
    case "checkboxes":
      return state.selected_options.map((option) => option.value);
  }
};

export const filterIncludedRequests = (requests) => {
  return requests
    .filter((request) => !!request.include[0])
    .map((request) => ({ name: request.include[0], ...request.request }));
};

export const getRejectedPercentage = (promises) => {
  return (
    promises.filter((promise) => promise.status === PROMISE_STATUS.REJECTED)
      .length / promises.length
  );
};
