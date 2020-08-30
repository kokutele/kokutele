import { configureStore } from '@reduxjs/toolkit';
import roomReducer from '../components/room/room-slice'

export default configureStore({
  reducer: {
    room: roomReducer,
  },
});
