import config from "../app-config";

type BetterFetch = (options: {
  path: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  timeout?: number;
  body?: any;
}) => Promise<any>;

const betterFetch: BetterFetch = async ({ path, method, timeout, body }) => {
  try {
    const abortController = new AbortController();
    const signal = abortController.signal;
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout || 7000);

    const res = await fetch(config.serverUrl + path, {
      method: method || "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(!!body && { body: JSON.stringify(body) }),
      signal,
    });

    clearTimeout(timeoutId);

    const statusCode = res.status;
    const data = await res.json();
    data.statusCode = statusCode;

    return data;
  } catch (err) {
    throw err;
  }
};

export default betterFetch;
