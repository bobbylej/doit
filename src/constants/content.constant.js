import { OPENAI_MESSAGE_ROLE } from "./openai.constant.js";

export const CONTENT_TYPE_NOTE = "note";
export const CONTENT_TYPE_REQUEST = "request";

export const OPENAI_REQUEST_WRAPPER = {
  START: "```request\n",
  END: "\n```",
};

export const OPENAI_REQUEST_REGEX = /```request\n([\s\S]*?)```/gm;

export const JIRA_OPENAI_SYSTEM_MESSAGES = [
  {
    role: OPENAI_MESSAGE_ROLE.SYSTEM,
    content: `I'm a natural language to JIRA REST API request converter. I use documentation from https://developer.atlassian.com/cloud/jira/platform/rest/v3. It is super important, I provide array of requests in format: ${OPENAI_REQUEST_WRAPPER.START}[{"name": "NAME OF THE REQUEST", "url": "/rest/api/3/PATH", "method": "METHOD", "query": JSON_OBJECT, "body": JSON_OBJECT}]${OPENAI_REQUEST_WRAPPER.END}, without any additional text when all necessary data is provided. However, if some data is missing or I need more data from user or I'm unable to convert an action to a request, I'll provide a short explanation of what action is needed that will be passed to the end user. The end user cannot know about API, so I don't put any details about code and requests. Here is the logic: if (canGenerateRequests) { return requestsOnly } else { return plainTextForEndUser }`,
  },
];

export const JIRA_OPENAI_INIT_MESSAGES = [
  ...JIRA_OPENAI_SYSTEM_MESSAGES,
  {
    role: "user",
    content: "Create task to store api keys in DB inside PROJECT_KEY project",
  },
  {
    role: "assistant",
    content:
      '```request\n[{\"nname": "Create Task to store API Keys in DB",\n"url": "/rest/api/3/issue",\n"method": "POST",\n"body": {\n"fields": {\n"project": {\n"key": "PROJECT_KEY"\n},\n"summary": "Store API keys in DB",\n"description": {\n"type": "doc",\n"version": 1,\n"content": [\n{\n"type": "paragraph",\n"content": [\n{\n"type": "text",\n"text": "Task to store API keys in a database"\n}\n]\n}\n]\n},\n"issuetype": {\n"name": "Task"\n}\n}\n}\n}]\n```\nThis request will create a new task with the summary "Store API keys in DB" and the description "Task to store API keys in a database".',
  },
  {
    role: "user",
    content:
      'Create filter in PROJECT_KEY project to get all task with "TODO" label',
  },
  {
    role: "assistant",
    content:
      "```request\n[{\n\"name\": \"Create filter for tasks with TODO label\",\n\"url\": \"/rest/api/3/filter\",\n\"method\": \"POST\",\n\"body\": {\n\"jql\": \"project=PROJECT_KEY and labels=TODO\",\n\"name\": \"TODO tasks filter\",\n\"description\": \"Filter to get all tasks with TODO label\",\n\"favourite\": false\n}\n}]\n```\nYou can modify the name and description as per your requirements.",
  },
  { role: "user", content: "Create epic called Server in PROJECT_KEY project" },
  {
    role: "assistant",
    content:
      '```request\n[{\n"name": "Create epic called \'Server\'",\n"url": "/rest/api/3/issue",\n"method": "POST",\n"body": {\n"fields": {\n"project": {\n"key": "PROJECT_KEY"\n},\n"summary": "Server",\n"issuetype": {\n"name": "Epic"\n}\n}\n}\n}]\n```\nThis request will create a new epic with the summary "Server" in the specified project. ',
  },
  {
    role: "user",
    content:
      "Create custom field called Color with options: red, yellow, green inside PROJECT_KEY project",
  },
  {
    role: "assistant",
    content:
      'We gonna need to run multiple requests, one after another. Here is the request to create a custom field called "Color":\n```request\n[{\n"name": "Create custom field called \'Color\'",\n"url": "/rest/api/3/field",\n"method": "POST",\n"body": {\n"name": "Color",\n"description": "Color field with options red, yellow, and green",\n"type": "com.atlassian.jira.plugin.system.customfieldtypes:select",\n"searcherKey": "com.atlassian.jira.plugin.system.customfieldtypes:multiselectsearcher"\n}\n}]\n```\nHere is the request to assign this field to PROJECT_KEY project:\n```request\n[{\n"name": "Assign custom field \'Color\' to PROJECT_KEY project",\n"url": "/rest/api/3/field/{FIELD_ID}/context",\n"method": "POST",\n"body": {\n"name": "PROJECT_KEY project context",\n"projectIds": ["PROJECT_ID"],\n}\n}]\n```\nNote: Replace FIELD_ID with actual ID of the Color field and PROJECT_ID with actual ID of the project. You can take FIELD_ID from the response for request to create the Color field or by this request:\n```request\n[{\n"name": "Get ID of custom field called \'Color\'",\n"url": "/rest/api/3/field",\n"method": "GET"\n}]\n```\nThis request will return a list of all fields in the JIRA instance, including custom fields. You can search for the "Color" field in the response and find its ID. The ID will be a string of letters and numbers, such as "customfield_10000".\nYou can find the ID of your project by running the following request:\n```request\n[{\n"name": "Get ID of \'PROJECT_KEY\' project",\n"url": "/rest/api/3/project",\n"method": "GET"\n}]\n```\nTo add options to this field you have to run this request:\n```request\n[{\n"name": "Add options to \'Color\' field",\n"url": "/rest/api/3/field/{FIELD_ID}/context/{CONTEXT_ID}/option",\n"method": "POST",\n"body": {\n"options": [\n{\n"value": "red"\n},\n{\n"value": "yellow"\n},\n{\n"value": "green"\n}\n],\n}\n}]\n```\nNote: You have to replace FIELD_ID and CONTEXT_ID with actual IDs. You can take CONTEXT_ID from the response for the request to create context for Color field in project or by this request:\n```request\n[{\n"name": "Get list of context for \'Color\' field",\n"url": "/rest/api/3/field/{FIELD_ID}/context",\n"method": "GET"\n}]\n```\nThis requests will help you create a new custom field called "Color" with the options "red", "yellow", and "green" in PROJECT_KEY context. ',
  },
  {
    role: "user",
    content:
      'For request: {"name":"Create task to adjust colors and paddings to designs in footer","url":"/rest/api/3/issue","method":"POST","body":{"fields":{"project":{"key":"PROJECT_KEY"},"summary":"Adjust colors and paddings to designs in footer","description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Task to adjust colors and paddings to designs in footer"}]}]},"issuetype":{"name":"Task"}\n}\n}\n}\nI got response: {"id":"10051","key":"PROJECT_KEY-45","self":"https://bobbylej.atlassian.net/rest/api/3/issue/10051"}\n\nFor request: {"name":"Create task to add common links in footer","url":"/rest/api/3/issue","method":"POST","body":{"fields":{"project":{"key":"PROJECT_KEY"},"summary":"Add common links in footer","description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Task to add common links in footer"}]}]},"issuetype":{"name":"Task"}\n}\n}\n}\nI got response: {"id":"10052","key":"PROJECT_KEY-46","self":"https://bobbylej.atlassian.net/rest/api/3/issue/10052"}\n\nFor request: {"name":"Create task to add newsletter form in footer","url":"/rest/api/3/issue","method":"POST","body":{"fields":{"project":{"key":"PROJECT_KEY"},"summary":"Add newsletter form in footer","description":{"type":"doc","version":1,"content":[{"type":"paragraph","content":[{"type":"text","text":"Task to add newsletter form in footer"}]}]},"issuetype":{"name":"Task"}\n}\n}\n}\nI got response: {"id":"10053","key":"PROJECT_KEY-47","self":"https://your-organization.atlassian.net/rest/api/3/issue/10053"}',
  },
  {
    role: "user",
    content:
      'Delete task to add common links in footer',
  },
  {
    role: "assistant",
    content:
      '```request\n[{\n"name": "Delete task to add common links in footer",\n"url": "/rest/api/3/issue/PROJECT_KEY-46",\n"method": "DELETE"\n}]\n``` ',
  },
];

export const JIRA_OPENAI_GENERATE_REQUESTS_PROMPT = `Generate a request or requests for that. Remember it is super important to wrap requests with ${OPENAI_REQUEST_WRAPPER.START}ARRAY WITH REQUESTS${OPENAI_REQUEST_WRAPPER.END}`;
