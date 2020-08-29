import { createSlice } from '@reduxjs/toolkit';

// トーンとしてはダルトーンを採用
// ref - https://iro-color.com/colorchart/tone/dull-tone.html
export const avatarColors = {
  'purple': '#903E84',
  'red': '#CB4829',
  'green': '#93B447',
  'blue': '#0099CE'
}

export const roomSlice = createSlice({
  name: 'room',
  initialState: {
    userName: '名無しさん',
    thumbnail: '',
    avatarColorName: 'purple',
    platform: {
      product: '',
      name: '',
      version: '',
      isMobile: false
    }
  },
  reducers: {
    setUserName: (state, action) => {
      state.userName = action.payload
    },
    setThumbnail: (state, action) => {
      state.thumbnail = action.payload
    },
    setAvatarColorName: (state, action) => {
      state.avatarColorName = action.payload
    },
    setPlatform: (state, action) => {
      const {product, name, version, isMobile} = action.payload
      state.platform = {product, name, version, isMobile}
    }
  },
});

export const {
  setUserName,
  setThumbnail,
  setAvatarColorName,
  setPlatform,
} = roomSlice.actions;

export const selectUserName = state => state.room.userName
export const selectThumbnail = state => state.room.thumbnail;
export const selectAvatarColorName = state => state.room.avatarColorName;
export const selectAvatarColor = state => {
  const name = state.room.avatarColorName
  return avatarColors[name]
}
export const selectIsMobile = state => !!state.room.platform.isMobile

export default roomSlice.reducer;
