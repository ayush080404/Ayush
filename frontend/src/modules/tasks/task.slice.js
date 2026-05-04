import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskApi from './task.api';

export const getTasks = createAsyncThunk(
  'tasks/get',
  async () => {
    const res = await taskApi.fetchTasks();
    return res.data;
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: { list: [] },
  extraReducers: (builder) => {
    builder.addCase(getTasks.fulfilled, (state, action) => {
      state.list = action.payload;
    });
  },
});

export default taskSlice.reducer;
``