import Task from './task.model.js';

export const createTask = async (data) => {
  return await Task.create(data);
};

export const getAllTasks = async () => {
  return await Task.find().sort({ createdAt: -1 });
};
``