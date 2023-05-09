import fetch from "node-fetch";
import { COLORS } from "../constants/colors.js";
import { CONTENT_TYPE_REQUEST } from "../constants/jira-openai-prompts.js";
import { PROMISE_STATUS } from "../constants/promise.js";
import {
  SLACK_ACTION_DONE_TEXTS,
  SLACK_ACTION_ERROR_TEXTS,
  SLACK_ACTION_GENERATE_REQUESTS,
  SLACK_ACTION_IN_PROGRESS_TEXTS,
  SLACK_ACTION_SUBMIT_REQUESTS,
} from "../constants/slack-actions.js";
import { mapObjectToArray } from "./array.js";
import { prettyPrintJSON } from "./object.js";

export const objectToInteractiveBlock = (object, index) => {
  return {
    type: "input",
    element: {
      type: "plain_text_input",
      multiline: true,
      action_id: `[${index}]`,
      initial_value: prettyPrintJSON(object),
    },
    label: {
      type: "plain_text",
      text: "Requests",
      emoji: true,
    },
  };
};

export const convertContentObjectToSlackMessage = (content) => {
  let requestsIndex = 0;
  const blocks = content.flatMap((item) => {
    if (item.type === CONTENT_TYPE_REQUEST) {
      return objectToInteractiveBlock(item.content, requestsIndex++);
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
  });
};

export const sendSuccessResponseMessage = (payload, attachments) => {
  const text =
    SLACK_ACTION_DONE_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_DONE_TEXTS.length)
    ];
  return sendResponseMessage(payload, { text, attachments });
};

export const sendErrorResponseMessage = (payload, attachments) => {
  const text =
    SLACK_ACTION_ERROR_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_ERROR_TEXTS.length)
    ];
  return sendResponseMessage(payload, { text, attachments }, false);
};

export const sendInProgressResponseMessage = (payload) => {
  const text =
    SLACK_ACTION_IN_PROGRESS_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_IN_PROGRESS_TEXTS.length)
    ];
  return sendResponseMessage(payload, { text });
};

export const convertRequestErrorToSlackAttachment = (error) => {
  return [
    {
      color: COLORS.RED,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Request failed*`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `\`\`\`${prettyPrintJSON(error.request)}\`\`\``,
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
  return [
    {
      color: COLORS.GREEN,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Request succeed*`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `\`\`\`${prettyPrintJSON(response.request)}\`\`\``,
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
