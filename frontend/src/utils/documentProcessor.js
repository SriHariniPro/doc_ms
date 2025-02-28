export const processDocument = async (file) => {
  try {
    const buffer = await file.arrayBuffer();
    let text = '';

    if (file.type === 'application/pdf') {
      const { default: pdfParse } = await import('pdf-parse');
      const data = await pdfParse(new Uint8Array(buffer));
      text = data.text;
    } 
    else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const { default: mammoth } = await import('mammoth');
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      text = result.value;
    }
    else if (file.type === 'text/plain') {
      text = await file.text();
    }
    else {
      throw new Error('Unsupported file type');
    }

    return text.trim();
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
}; 
