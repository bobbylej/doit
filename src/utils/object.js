import JSON5 from "json5";

export const setValueByPath = (obj, path, value) => {
  const keys = path.split(".");
  keys.reduce((acc, key, index) => {
    if (index === keys.length - 1) {
      acc[key] = value;
    } else {
      acc[key] = acc[key] || {};
    }
    return acc[key];
  }, obj);
};

export const parseJSON = (text) => {
  return JSON5.parse(text);
};

export const prettyPrintJSON = (json) => {
  return JSON.stringify(json, null, 2);
}
