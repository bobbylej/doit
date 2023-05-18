export const mergeArraysAlternately = (...arrays) => {
  const merged = [];
  const maxLength = arrays.reduce(
    (maxLength, currentArray) => Math.max(maxLength, currentArray.length),
    0
  );

  for (let i = 0; i < maxLength; i++) {
    arrays.forEach((currentArray) => {
      if (currentArray[i]) {
        merged.push(currentArray[i]);
      }
    });
  }

  return merged;
};

export const mapObjectToArray = (obj, parentKey = '') => {
  return Object.keys(obj).reduce((acc, key) => {
    const path = parentKey ? `${parentKey}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      acc.push(...mapObjectToArray(obj[key], path));
    } else {
      acc.push({ path, key, value: obj[key] });
    }
    return acc;
  }, []);
}

export const splitTextByMaxLength = (text, maxLength) => {
  const splittedText = [];
  for (let i = 0; i < text.length; i += maxLength) {
    splittedText.push(text.slice(i, i + maxLength));
  }
  return splittedText;
}