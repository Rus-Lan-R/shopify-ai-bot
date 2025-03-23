export const formDataToObject = (formData: FormData): Record<string, any> => {
  const object: Record<string, unknown> = {};
  for (const key of formData.keys()) {
    object[key] = formData.get(key);
  }
  return object;
};

export const firstLetterUpperCase = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};
