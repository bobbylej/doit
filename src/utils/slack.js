import fetch from "node-fetch";
import { CONTENT_TYPE_REQUEST } from "../constants/jira-openai-prompts.js";
import {
  SLACK_ACTION_DONE_TEXTS,
  SLACK_ACTION_ERROR_TEXTS,
  SLACK_ACTION_SUBMIT_REQUESTS,
} from "../constants/slack-actions.js";
import { mapObjectToArray } from "./array.js";

export const objectToInteractiveBlock = (object, index) => {
  const arrayWithAttributes = mapObjectToArray(object);
  return arrayWithAttributes.map((attribute) => ({
    type: "input",
    element: {
      type: "plain_text_input",
      action_id: `[${index}].${attribute.path}`,
      initial_value: attribute.value,
    },
    label: {
      type: "plain_text",
      text: `${attribute.key} (${attribute.path})`,
    },
  }));
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
  const hasMultipleRequests = countRequestsInContentObject(content) > 1;
  return [
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
          text: `Confirm and run ${hasMultipleRequests ? "actions" : "action"}`,
          emoji: true,
        },
        value: "submit_requests",
        action_id: SLACK_ACTION_SUBMIT_REQUESTS,
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

export const sendResponseMessage = (payload, text, replaceOriginal = true) => {
  const responseUrl = payload.response_url;
  return fetch(responseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      replace_original: replaceOriginal,
      text,
    }),
  });
};

export const sendSuccessResponseMessage = (payload, responses) => {
  const header =
    SLACK_ACTION_DONE_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_DONE_TEXTS.length)
    ];
  const content = `Here are responses:\n\`\`\`${JSON.stringify(responses)}\n\`\`\``;
  const text = `${header}\n\n${content}`;
  return sendResponseMessage(payload, text);
}

export const sendErrorResponseMessage = (payload, error) => {
  const header =
    SLACK_ACTION_ERROR_TEXTS[
      Math.floor(Math.random() * SLACK_ACTION_ERROR_TEXTS.length)
    ];
  const text = `${header}\n\n${error}`;
  return sendResponseMessage(payload, text, false);
}