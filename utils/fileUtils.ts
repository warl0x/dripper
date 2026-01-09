
export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [mimeTypePart, base64Part] = result.split(';base64,');
      if (!base64Part) {
        reject(new Error("Invalid file format"));
        return;
      }
      const mimeType = mimeTypePart.split(':')[1];
      resolve({ base64: base64Part, mimeType });
    };
    reader.onerror = (error) => reject(error);
  });
};
