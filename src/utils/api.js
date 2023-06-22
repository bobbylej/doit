import { PROMISE_STATUS } from "../constants/promise.constant.js";

export const convertBodyForRequest = (body) => {
  if (typeof body === "string") {
    return body;
  }
  return JSON.stringify(body);
};

export const getRejectedPercentage = (promises) => {
  return (
    promises.filter((promise) => promise.status === PROMISE_STATUS.REJECTED)
      .length / promises.length
  );
};
