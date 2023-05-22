import {
  CONTENT_TYPE_NOTE,
  CONTENT_TYPE_REQUEST,
  OPENAI_REQUEST_REGEX,
} from "../constants/content.constant.js";
import { mergeArraysAlternately } from "./array.js";
import { parseJSON, setValueByPath } from "./object.js";

export const convertTextMessageWithRequests = (message) => {
  const requestMarker = "//--REQUEST--//";
  const notes = message
    .replace(OPENAI_REQUEST_REGEX, requestMarker)
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
  const isNoteFirst = notes[0]?.content !== "";
  const arrays = isNoteFirst ? [notes, requests] : [requests, notes];
  const content = mergeArraysAlternately(...arrays).flat().filter((item) => !!item.content);
  return content;
};

const getRequestsFromText = (message) => {
  const requests = [...message.matchAll(OPENAI_REQUEST_REGEX)].map(
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