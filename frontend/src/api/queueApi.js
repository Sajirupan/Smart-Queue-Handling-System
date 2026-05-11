import api from './axios';

export const generateToken = async (data) => {
  const res = await api.post('/queue/generate', data);
  return res.data;
};

export const getActiveQueue = async () => {
  const res = await api.get('/queue/active');
  return res.data;
};
