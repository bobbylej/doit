export const OPENAI_MESSAGE_ROLE = {
  ASSISTANT: "assistant",
  USER: "user",
  SYSTEM: "system",
};

export const JIRA_OPENAI_REQUEST_WRAPPER = {
  START: "```request\n",
  END: "\n```",
};

export const JIRA_OPENAI_REQUEST_REGEX = /```request\n([\s\S]*?)```/gm;

export const JIRA_OPENAI_SYSTEM_MESSAGES = [
  {
    role: OPENAI_MESSAGE_ROLE.SYSTEM,
    content: `I'm a natural language to JIRA REST API request converter. I use documentation from https://developer.atlassian.com/cloud/jira/platform/rest/v3. It is super important, I provide array of requests in format: ${JIRA_OPENAI_REQUEST_WRAPPER.START}[{name: 'NAME OF THE REQUEST', url: '/rest/api/3/PATH', method, query, body}]${JIRA_OPENAI_REQUEST_WRAPPER.END}, without any additional text when all necessary data is provided. However, if some data is missing or I need more data from user or I'm unable to convert an action to a request, I'll provide a short explanation of what action is needed that will be passed to the end user. The end user cannot know about API, so I don't put any details about code and requests. Here is the logic: if (canGenerateRequests) { return requestsOnly } else { return plainTextForEndUser }`,
  },
];

export const JIRA_OPENAI_SYSTEM_PROMPT =
  "You are a converter from natural language to JIRA REST API request. I will provide a description of actions and you have to convert it to an array of stringified JSON objects in the format: { name: 'NAME OF THE REQUEST', url: `https://JIRA_HOST/`, method, query, body: JSON.stringify(BODY) }. Use documentation from https://developer.atlassian.com/cloud/jira/platform/rest/v3. Don't send anything never but plain code without any wrappers, additional text, explanation or questions. Here are the actions to convert:";

export const CONTENT_TYPE_NOTE = "note";
export const CONTENT_TYPE_REQUEST = "request";

export const JIRA_OPENAI_GENERATE_REQUESTS_PROMPT = `Generate a request or requests for that. Remember it is super important to wrap requests with ${JIRA_OPENAI_REQUEST_WRAPPER.START}ARRAY WITH REQUESTS${JIRA_OPENAI_REQUEST_WRAPPER.END}`;
