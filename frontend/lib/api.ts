import axios from 'axios';

const API_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const uploadPDF = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const askQuestion = async (question: string) => {
  const response = await api.post('/ask', { question });
  return response.data;
};

export const getSummary = async (documentText: string) => {
  const response = await api.post('/summary', { document_text: documentText });
  return response.data;
};

export const getClauses = async (documentText: string) => {
  const response = await api.post('/clauses', { document_text: documentText });
  return response.data;
};

export const getRisks = async (documentText: string) => {
  const response = await api.post('/risks', { document_text: documentText });
  return response.data;
};