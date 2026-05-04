import api from '../../services/api';

export const fetchTasks = () => api.get('/tasks');
export const createTask = (data) => api.post('/tasks', data);
