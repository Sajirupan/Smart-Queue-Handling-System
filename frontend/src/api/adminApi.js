import api from './axios';

export const getAllUsers = async () => {
  const res = await api.get('/admin/users');
  return res.data;
};

export const updateUserStatus = async (id, status) => {
  const res = await api.put(`/admin/users/${id}/status`, { status });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};
