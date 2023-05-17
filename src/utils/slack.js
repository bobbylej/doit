import fetch from "node-fetch";
import { COLORS } from "../constants/colors.js";
import { CONTENT_TYPE_REQUEST } from "../constants/jira-openai-prompts.js";
import { PROMISE_STATUS } from "../constants/promise.js";
import {
  SLACK_ACTION_API_KEYS_REQUIRED_TEXTS,
  SLACK_ACTION_DONE_TEXTS,
  SLACK_ACTION_ERROR_TEXTS,
  SLACK_ACTION_GENERATE_REQUESTS,
  SLACK_ACTION_IN_PROGRESS_TEXTS,
  SLACK_ACTION_NOTHING_TO_DO_TEXTS,
  SLACK_ACTION_PARTLY_ERROR_TEXTS,
  SLACK_ACTION_PICK_ACTIONS_TEXTS,
  SLACK_ACTION_PROVIDE_API_KEYS,
  SLACK_ACTION_SUBMIT_REQUESTS,
  SLACK_ACTION_WHAT_TO_DO_TEXTS,
} from "../constants/slack-actions.js";
import { prettyPrintJSON } from "./object.js";
import {
  JIRA_API_KEYS_LINK,
  OPENAI_API_KEYS_LINK,
  OPENAI_ORGANIZATION_ID_LINK,
} from "../constants/links.js";
import { SESSION_MODEL_API_KEYS } from "../models/session.model.js";

export const requestToInteractiveBlock = (request, index) => {
  const { name, ...requestDetails } = request;
  const includeActionCheckboxOptions = [
    {
      text: {
        type: "mrkdwn",
        text: `*${name || "Request"}*`,
      },
      value: name || "Requests",
    },
  ];
  return [
    {
      type: "divider",
    },
    {
      type: "actions",
      elements: [
        {
          type: "checkboxes",
          action_id: `[${index}].include`,
          options: includeActionCheckboxOptions,
          initial_options: includeActionCheckboxOptions,
        },
      ],
    },
    {
      type: "input",
      element: {
        type: "plain_text_input",
        multiline: true,
        action_id: `[${index}].request`,
        initial_value: prettyPrintJSON(requestDetails),
      },
      label: {
        type: "plain_text",
        text: " ",
        emoji: true,
      },
    },
  ];
};

export const convertContentObjectToSlackMessage = (content) => {
  let requestsIndex = 0;
  const blocks = content.flatMap((item) => {
    if (item.type === CONTENT_TYPE_REQUEST) {
      return requestToInteractiveBlock(item.content, requestsIndex++);
    }
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: item.content,
        },
      },
    ];
  });
  const submitSection = generateSubmitRequestsSection(content);
  return {
    blocks: [...blocks, ...submitSection],
  };
};

export const generateSubmitRequestsSection = (content) => {
  const hasAnyRequest = countRequestsInContentObject(content) > 0;
  const hasMultipleRequests = countRequestsInContentObject(content) > 1;
  return hasAnyRequest
    ? [
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `_Need changes in requests? Edit in field(s) or tell me to do it for you._`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: `Confirm and run ${
                hasMultipleRequests ? "actions" : "action"
              }`,
              emoji: true,
            },
            value: "submit_requests",
            action_id: SLACK_ACTION_SUBMIT_REQUESTS,
            style: "primary",
          },
        },
      ]
    : [
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `_Should I generate a request or do you want to share more details?_`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: `Generate request`,
              emoji: true,
            },
            value: "generate_requests",
            action_id: SLACK_ACTION_GENERATE_REQUESTS,
            style: "primary",
          },
        },
      ];
};

export const countRequestsInContentObject = (content) => {
  return content.reduce(
    (counter, item) =>
      item.type === CONTENT_TYPE_REQUEST ? counter + 1 : counter,
    0
  );
};

export const convertUserInputToSlackMessage = (text) => {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `_User: \`${text}\`_`,
        },
      },
    ],
  };
};

export const mergeSlackMessages = (...messages) => {
  return messages.reduce(
    (finalMessage, message) => ({
      ...finalMessage,
      ...message,
      blocks: [
        ...(finalMessage.blocks || []),
        { type: "divider" },
        ...(message.blocks || []),
      ],
      attachments: [
        ...(finalMessage.attachments || []),
        ...(message.attachments || []),
      ],
    }),
    {}
  );
};

export const sendResponseMessage = (payload, body, replaceOriginal = true) => {
  const responseUrl = payload.response_url;
  return fetch(responseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replace_original: replaceOriginal,
      ...body,
    }),
  }).then(async (response) =>
    response.ok ? response.text() : Promise.reject(await response.text())
  );
};

export const sendNotifyResponseMessage = (
  payload,
  { text, blocks, attachments },
  replaceOriginal = true
) => {
  const topBlocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text,
      },
    },
  ];
  return sendResponseMessage(
    payload,
    {
      blocks: [...topBlocks, ...(blocks || [])],
      attachments,
    },
    replaceOriginal
  );
};

export const sendSuccessResponseMessage = (
  payload,
  { blocks, attachments } = {}
) => {
  const text =
    SLACK_ACTION_DONE_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_DONE_TEXTS.length)
    ];
  return sendNotifyResponseMessage(payload, { text, blocks, attachments });
};

export const sendErrorResponseMessage = (
  payload,
  { blocks, attachments } = {}
) => {
  const text =
    SLACK_ACTION_ERROR_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_ERROR_TEXTS.length)
    ];
  return sendNotifyResponseMessage(
    payload,
    { text, blocks, attachments },
    false
  );
};

export const sendPartlyErrorResponseMessage = (
  payload,
  { blocks, attachments } = {}
) => {
  const text =
    SLACK_ACTION_PARTLY_ERROR_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_PARTLY_ERROR_TEXTS.length)
    ];
  return sendNotifyResponseMessage(
    payload,
    { text, blocks, attachments },
    false
  );
};

export const sendInProgressResponseMessage = (payload) => {
  const text =
    SLACK_ACTION_IN_PROGRESS_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_IN_PROGRESS_TEXTS.length)
    ];
  return sendNotifyResponseMessage(payload, { text });
};

export const sendNothingToDoResponseMessage = (payload) => {
  const nothingToDoText =
    SLACK_ACTION_NOTHING_TO_DO_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_NOTHING_TO_DO_TEXTS.length)
    ];
  const pickActionsText =
    SLACK_ACTION_PICK_ACTIONS_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_PICK_ACTIONS_TEXTS.length)
    ];
  const text = `${nothingToDoText}\n${pickActionsText}`;
  return sendNotifyResponseMessage(payload, { text }, false);
};

export const convertRequestErrorToSlackAttachment = (error) => {
  const { name, ...request } = error.request;
  return [
    {
      color: COLORS.RED,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `FAILED - *${name || "Request"}*`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `\`\`\`${prettyPrintJSON(request)}\`\`\``,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Error:\n\`\`\`${prettyPrintJSON(error.error)}\`\`\``,
          },
        },
      ],
    },
  ];
};

export const convertRequestSuccessToSlackAttachment = (response) => {
  const { name, ...request } = response.request;
  return [
    {
      color: COLORS.GREEN,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `SUCCEED - *${name || "Request"}*`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `\`\`\`${prettyPrintJSON(request)}\`\`\``,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Response:\n\`\`\`${prettyPrintJSON(
              response.response
            )}\`\`\``,
          },
        },
      ],
    },
  ];
};

export const convertResponsesToSlackAttachments = (responses) => {
  if (Array.isArray(responses)) {
    return responses.flatMap((response) => {
      switch (response.status) {
        case PROMISE_STATUS.FULFILLED:
          return convertRequestSuccessToSlackAttachment(response.value);
        case PROMISE_STATUS.REJECTED:
          return (
            response.reason?.request &&
            convertRequestErrorToSlackAttachment(response.reason)
          );
      }
    });
  }
};

export const generateProvideAPIKeysMessage = () => {
  const generateInput = ({ actionId, label, placeholder, helpText }) => {
    return [
      {
        type: "input",
        element: {
          type: "plain_text_input",
          action_id: actionId,
          placeholder: {
            type: "plain_text",
            text: placeholder,
            emoji: true,
          },
        },
        label: {
          type: "plain_text",
          text: label,
          emoji: true,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: helpText,
          },
        ],
      },
    ];
  };

  return {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Please provide data for OpenAI and JIRA.",
          emoji: true,
        },
      },
      ...generateInput({
        actionId: SESSION_MODEL_API_KEYS.OPENAI_API_KEY,
        label: "OpenAI API Key*",
        placeholder: "Provide OpenAI API Key (required)",
        helpText: `To create API key for OpenAI please visit ${OPENAI_API_KEYS_LINK}.`,
      }),
      ...generateInput({
        actionId: SESSION_MODEL_API_KEYS.OPENAI_ORGANIZATION_ID,
        label: "OpenAI Organization ID",
        placeholder: "Provide OpenAI Organization ID",
        helpText: `To get Organization ID for OpenAI please visit ${OPENAI_ORGANIZATION_ID_LINK}.`,
      }),
      ...generateInput({
        actionId: SESSION_MODEL_API_KEYS.JIRA_API_KEY,
        label: "JIRA API Key*",
        placeholder: "Provide JIRA API Key (required)",
        helpText: `To get API key for JIRA please visit ${JIRA_API_KEYS_LINK}.`,
      }),
      ...generateInput({
        actionId: SESSION_MODEL_API_KEYS.JIRA_HOST,
        label: "JIRA Host*",
        placeholder: "Provide JIRA Host (required)",
        helpText: `Provide it in format: _your-organization.atlassian.net_.`,
      }),
      ...generateInput({
        actionId: SESSION_MODEL_API_KEYS.JIRA_USERNAME,
        label: "JIRA Username*",
        placeholder: "Provide JIRA Username (required)",
        helpText: `That is your email used in JIRA.`,
      }),
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `_Your API Keys will be stored encrypted for maximum 24 hours since your last message._`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: `Confirm and store API keys`,
            emoji: true,
          },
          value: "provide_api_keys",
          action_id: SLACK_ACTION_PROVIDE_API_KEYS,
          style: "primary",
        },
      },
    ],
  };
};

export const sendWhatToDoMessage = (payload) => {
  const text =
    SLACK_ACTION_WHAT_TO_DO_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_WHAT_TO_DO_TEXTS.length)
    ];
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text,
      },
    },
  ];
  return sendSuccessResponseMessage(payload, { blocks });
};

export const sendAPIKeysRequiredResponseMessage = (payload, attachments) => {
  const text =
    SLACK_ACTION_API_KEYS_REQUIRED_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_API_KEYS_REQUIRED_TEXTS.length)
    ];
  return sendNotifyResponseMessage(payload, { text, attachments }, false);
};
