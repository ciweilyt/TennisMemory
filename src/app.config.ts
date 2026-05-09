export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/record/index',
    'pages/stats/index',
    'pages/social/index',
    'pages/mine/index',
    'pages/match-detail/index',
    'pages/player-profile/index',
    'pages/player-add/index',
    'pages/live-match/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#1A6B4C',
    navigationBarTitleText: '网球记忆',
    navigationBarTextStyle: 'white'
  },
  lazyCodeLoading: 'requiredComponents',
  tabBar: {
    color: '#86909C',
    selectedColor: '#1A6B4C',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '日记'
      },
      {
        pagePath: 'pages/record/index',
        text: '记录'
      },
      {
        pagePath: 'pages/stats/index',
        text: '统计'
      },
      {
        pagePath: 'pages/social/index',
        text: '社交'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
