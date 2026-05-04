import api from '../../services/api';

export const fetchTaskStats = () =>
  api.get('/tasks/stats');
