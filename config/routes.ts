export default [
  { path: '/user', layout: false, routes: [{ path: '/user/login', component: './User/Login' },
      {path: '/user/register', component: './User/Register'}] },
  { path: '/', redirect: '/add_chart' },
  { path: '/add_chart', name: '智能分析', icon: 'barChart', component: './AddChart' },
  { path: '/add_chart_async', name: '智能分析（异步）', icon: 'barChart', component: './AddChartAsync' },
  { path: '/team', name: '队伍大厅', icon: 'TeamOutlined', component: './Team' },
  { path: '/team_my_joined', name: '已加队伍', icon: 'TeamOutlined', component: './TeamMyJoined' },
  { path: '/my_chart', name: '我的图表', icon: 'pieChart', component: './MyChart' },
  {
    path: '/admin',
    icon: 'crown',
    access: 'canAdmin',
    routes: [
      { path: '/admin', name: '管理页面', redirect: '/admin/sub-page' },
      { path: '/admin/sub-page', name: '管理页面2', component: './Admin' },
    ],
  },
  { path: '/', redirect: '/welcome' },
  { path: '*', layout: false, component: './404' },
];
