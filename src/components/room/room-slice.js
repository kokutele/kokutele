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
    peerId: '',
    userName: '名無しさん',
    thumbnail: '',
    bgImage: '',
    avatarColorName: 'purple',
    platform: {
      product: '',
      name: '',
      version: '',
      isMobile: false
    },
    transcripts: [],
    lastLocalTranscript: {transcript: '', isFinished: false},
  },
  reducers: {
    setPeerId: (state, action) => {
      state.peerId = action.payload
    },
    setUserName: (state, action) => {
      state.userName = action.payload
    },
    setThumbnail: (state, action) => {
      state.thumbnail = action.payload
    },
    setBgImage: (state, action) => {
      state.bgImage = action.payload
    },
    setAvatarColorName: (state, action) => {
      state.avatarColorName = action.payload
    },
    setPlatform: (state, action) => {
      const {product, name, version, isMobile} = action.payload
      state.platform = {product, name, version, isMobile}
    },
    addTranscripts:( state, action ) => {
      // `payload` would be { peerid, timestamp, userName, thumbnail, transcript, ..... }
      state.transcripts.push(action.payload)
    },
    delTranscripts:( state, action ) => {
      // `payload` would be { peerid, timestamp }
      const { peerid, timestamp } = action.payload
      state.transcripts = state.transcripts.filter( t => (t.peerid !== peerid && t.timestamp !== timestamp) )
    },
    setLastLocalTranscript: (state, action) => {
      const { transcript, isFinal } = action.payload
      state.lastLocalTranscript = {transcript, isFinal }
    }
  },
});

export const {
  setPeerId,
  setUserName,
  setThumbnail,
  setBgImage,
  setAvatarColorName,
  setPlatform,
  addTranscripts,
  delTranscripts,
  setLastLocalTranscript,
} = roomSlice.actions;

export const selectPeerId = state => state.room.peerId
export const selectUserName = state => state.room.userName
export const selectThumbnail = state => state.room.thumbnail;
export const selectBgImage = state => state.room.bgImage;
export const selectAvatarColorName = state => state.room.avatarColorName;
export const selectAvatarColor = state => {
  const name = state.room.avatarColorName
  return avatarColors[name]
}
export const selectIsMobile = state => !!state.room.platform.isMobile
export const selectTranscripts = state => state.room.transcripts
export const selectLastLocalTranscript = state => state.room.lastLocalTranscript

export default roomSlice.reducer;
