export const safeJsonParse = (str: string, defaultValue: any) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return defaultValue;
  }
};
