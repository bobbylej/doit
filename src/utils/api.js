export const convertBodyForRequest = (body) => {
  if (typeof body === "string") {
    return body;
  }
  return JSON.stringify(body);
};
