export const uploadedFiles: { [inputId: string]: File[] } = {};

export const addInputFile = (file: File, inputId: string) => {
  uploadedFiles[inputId] = [...(uploadedFiles[inputId] || []), file];
};

export const removeInputFile = (file: File, inputId: string) => {
  uploadedFiles[inputId] = (uploadedFiles[inputId] || []).filter((f) => f !== file);
};

export const clearInputFiles = (inputId: string) => {
  uploadedFiles[inputId] = [];
};
