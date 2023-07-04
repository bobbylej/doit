import fetch from "node-fetch";
import { convertBodyForRequest } from "./api.js";
import { PROMISE_STATUS } from "../constants/promise.constant.js";
import { SESSION_MODEL_API_KEYS } from "../models/session.model.js";

const defaultApiKeys = {
  [SESSION_MODEL_API_KEYS.JIRA_API_KEY]: process.env.JIRA_API_TOKEN,
  [SESSION_MODEL_API_KEYS.JIRA_HOST]: process.env.JIRA_HOST,
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
    apiToken: session[SESSION_MODEL_API_KEYS.JIRA_API_KEY] || defaultApiKeys[SESSION_MODEL_API_KEYS.JIRA_API_KEY],
  });
  const host = session[SESSION_MODEL_API_KEYS.JIRA_HOST] || defaultApiKeys[SESSION_MODEL_API_KEYS.JIRA_HOST];
  const url = request.query
    ? `${request.url}?${new URLSearchParams(request.query)}`
    : request.url;
  const response = await fetch(`https://${host}${url}`, {
    headers,
    method: request.method,
    body: request.body && convertBodyForRequest(request.body),
  });
  try {
    const responseBody = response.status === 204 ? { ok: true } : await response.json();
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
