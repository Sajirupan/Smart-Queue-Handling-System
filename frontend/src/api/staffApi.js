import api from './axios';

export const getAssignedCounter = async () => {
  const res = await api.get('/staff/counter');
  return res.data;
};

export const callNextCustomer = async (counterId) => {
  const res = await api.post(`/staff/call-next`, { counterId });
  return res.data;
};

export const completeCustomer = async (counterId) => {
  const res = await api.post(`/staff/complete`, { counterId });
  return res.data;
};
