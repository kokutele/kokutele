import { createSlice } from '@reduxjs/toolkit';

export const roomSlice = createSlice({
  name: 'room',
  initialState: {
    userName: '名無しさん',
    thumbnail: '',
  },
  reducers: {
    setUserName: (state, action) => {
      state.userName = action.payload
    },
    setThumbnail: (state, action) => {
      state.thumbnail = action.payload
    },
  },
});

export const {
  setUserName,
  setThumbnail,
} = roomSlice.actions;

export const selectUserName = state => state.room.userName
export const selectThumbnail = state => state.room.thumbnail;

export default roomSlice.reducer;
