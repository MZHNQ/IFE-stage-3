;(function(){
  var scoresData = [
  {'姓名':'小明', content: {
    '语文': 80,
    '数学': 90,
    '英语': 70
  }},
  {'姓名':'小红', content: {
    '语文': 90,
    '数学': 60,
    '英语': 90
  }},
  {'姓名':'小亮', content: {
    '语文': 60,
    '数学': 100,
    '英语': 70
  }},
  {'姓名':'小周', content: {
    '语文': 80,
    '数学': 90,
    '英语': 60
  }},
  {'姓名':'小吴', content: {
    '语文': 60,
    '数学': 100,
    '英语': 70
  }},
  {'姓名':'小王', content: {
    '语文': 54,
    '数学': 65,
    '英语': 60
  }},
  {'姓名':'小李', content: {
    '语文': 95,
    '数学': 100,
    '英语': 96
  }}
  ];

  createTable(scoresData, {
    selector: '#complete',
    total: '总分',
    sortableHeader: ['总分', '语文', '数学', '英语'],
    freezeHeader: true
  }).render();
  
  createTable(scoresData, {
    selector: '#normal'
  }).render();

  createTable(scoresData, {
    selector: '#width',
    freezeHeader: true
  }).render();

  createTable(scoresData, {
    selector: '#total',
    total: '总分'
  }).render();

  createTable(scoresData, {
    selector: '#sort',
    total: '总分',
    sortBy: '总分'
  }).render();

  createTable(scoresData, {
    selector: '#sortable',
    total: '总分',
    sortableHeader: ['语文', '数学', '英语', '总分']
  }).render();
})();