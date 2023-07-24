import { captureError } from "./error-sdk.js";
import { getSession } from "./session.js";

export const handleError = async (error, userId) => {
  console.error(error);
  const session = userId ? await getSession(userId) : null;
  return captureError(error, session ? {
    user: { id: session.userId },
    extra: { messages: session.messages },
  } : null);
};
