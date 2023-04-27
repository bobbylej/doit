import fetch from "node-fetch";

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