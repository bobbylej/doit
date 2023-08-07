import fetch from "node-fetch";
import { COLORS } from "../constants/colors.constant.js";
import { CONTENT_TYPE_REQUEST } from "../constants/content.constant.js";
import { PROMISE_STATUS } from "../constants/promise.constant.js";
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
  SLACK_TEXT_MAX_LENGTH,
} from "../constants/slack.constant.js";
import { prettyPrintJSON } from "./object.js";
import { splitTextByMaxLength } from "./array.js";
import {
  SESSION_API_KEYS_FIELDS,
  SESSION_API_KEY_PLACEHOLDER_DEFAULT_VALUE,
} from "../constants/session.constant.js";

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

export const sendRandomNotifyTextMessage = (
  payload,
  texts,
  { blocks, attachments } = {},
  replaceOriginal = true
) => {
  const text = texts[Math.floor(Math.random() * texts.length)];
  return sendNotifyResponseMessage(
    payload,
    { text, blocks, attachments },
    replaceOriginal
  );
};

export const sendSuccessResponseMessage = (
  payload,
  { blocks, attachments } = {},
  replaceOriginal = true
) => {
  return sendRandomNotifyTextMessage(
    payload,
    SLACK_ACTION_DONE_TEXTS,
    { blocks, attachments },
    replaceOriginal
  );
};

export const sendErrorResponseMessage = (
  payload,
  { blocks, attachments } = {}
) => {
  return sendRandomNotifyTextMessage(
    payload,
    SLACK_ACTION_ERROR_TEXTS,
    { blocks, attachments },
    false
  );
};

export const sendPartlyErrorResponseMessage = (
  payload,
  { blocks, attachments } = {}
) => {
  return sendRandomNotifyTextMessage(
    payload,
    SLACK_ACTION_PARTLY_ERROR_TEXTS,
    { blocks, attachments },
    false
  );
};

export const sendInProgressResponseMessage = (payload) => {
  return sendRandomNotifyTextMessage(payload, SLACK_ACTION_IN_PROGRESS_TEXTS);
};

export const sendWhatToDoMessage = (payload) => {
  return sendRandomNotifyTextMessage(payload, SLACK_ACTION_WHAT_TO_DO_TEXTS);
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

export const sendAPIKeysRequiredResponseMessage = (payload, attachments) => {
  return sendRandomNotifyTextMessage(
    payload,
    SLACK_ACTION_API_KEYS_REQUIRED_TEXTS,
    { attachments },
    false
  );
};

export const convertRequestToInteractiveBlock = (request, index) => {
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
      return convertRequestToInteractiveBlock(item.content, requestsIndex++);
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
  const countRequestsInContentObject = (content) => {
    return content.reduce(
      (counter, item) =>
        item.type === CONTENT_TYPE_REQUEST ? counter + 1 : counter,
      0
    );
  };

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

export const generateProvideAPIKeysMessage = () => {
  const generatePlaceholderText = ({ placeholder, required }) => {
    return `${placeholder}${
      required
        ? " (required)"
        : `${
            placeholder ? " or " : ""
          }${SESSION_API_KEY_PLACEHOLDER_DEFAULT_VALUE}`
    }`;
  };

  const generateInput = ({ key, label, placeholder, helpText, required }) => {
    return [
      {
        type: "input",
        element: {
          type: "plain_text_input",
          action_id: key,
          placeholder: {
            type: "plain_text",
            text: generatePlaceholderText({ placeholder, required }),
            emoji: true,
          },
        },
        label: {
          type: "plain_text",
          text: `${label}${required ? "*" : ""}`,
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
      ...SESSION_API_KEYS_FIELDS.flatMap(field => generateInput(field)),
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
  const wrapper = {
    start: "```\n",
    end: "\n```",
  };
  const responseTextSplitted = splitTextByMaxLength(
    prettyPrintJSON(response.response),
    SLACK_TEXT_MAX_LENGTH - wrapper.start.length - wrapper.end.length
  );
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
            text: `Response:`,
          },
        },
        ...responseTextSplitted.map((text) => ({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${wrapper.start}${text}${wrapper.end}`,
          },
        })),
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
