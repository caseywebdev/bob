const {env} = window;

export default {
  css: {
    colors: {
      ansiBlack: '#393f4c',
      ansiBlue: '#a0b1c0',
      ansiBrightBlack: '#788691',
      ansiBrightBlue: '#a0b1c0',
      ansiBrightCyan: '#a6c2c1',
      ansiBrightGreen: '#b2c89d',
      ansiBrightMagenta: '#c2a1bb',
      ansiBrightRed: '#cc777d',
      ansiBrightWhite: '#f2f4f7',
      ansiBrightYellow: '#f0d49c',
      ansiCyan: '#a6c2c1',
      ansiGreen: '#b2c89d',
      ansiMagenta: '#c2a1bb',
      ansiRed: '#cc777d',
      ansiWhite: '#cbd0d7',
      ansiYellow: '#f0d49c',
      blue: '#4579fb',
      bobOrange: '#f60',
      darkGray: '#666',
      green: '#88d86b',
      lightGray: '#ccc',
      orange: '#e79322',
      pink: '#dc3055',
      purple: '#5856d2',
      red: '#dc3d34',
      tealBlue: '#85c7f8',
      yellow: '#f2cb30'
    },
    borderRadius: '3px',
    boxShadow: 'box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25)',
    ellipsis: `
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      word-wrap: normal;
    `
  },
  disk: {
    namespace: 'bob'
  },
  github: {
    clientId: env.GITHUB_CLIENT_ID
  },
  watch: env.WATCH === '1'
};
