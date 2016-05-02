;(function(){

  /*
   * =============
   * eventHandler
   * =============
   */
  var eventHandler = {
    event: {},
    on: function (eventName, handler) {
      this.event[eventName] = handler;
    },
    fire: function (eventName, args) {
      var fn = this.event[eventName];
      if (fn && fn instanceof Function) {
        fn.apply(this, args);
      }
    }
  };

  /*
   * ================
   * TableComponent
   * ================
   */

  // Model
  function TableModel (data, totalName) {
    this.source = data;
    this.data = this.getData(totalName);
    this.header = this.getHeader();
  }
  TableModel.prototype.getData = function (totalName) {
    var data = this.source;
    var i;
    if (totalName) {
      data = data.map(function (el) {
        var total = 0;
        var i;
        for (i in el.content) {
          total += el.content[i];
        }
        el.content[totalName] = total;
        return el;
      })
    }
    return data;
  };
  TableModel.prototype.getHeader = function () {
    var example = this.data[0].content,
        result = ['姓名'],
        i;
    for (i in example) {
      result.push(i);
    }
    return result;
  };
  TableModel.prototype.sortUp = function (subject) {
    this.data.sort(function (a, b) {
      return a.content[subject] > b.content[subject];
    });
  };
  TableModel.prototype.sortDown = function (subject) {
    this.data.sort(function (a, b) {
      return a.content[subject] < b.content[subject];
    });
  };
  // View
  function TableView () {
    this.template = 
    '<table>'+
      '<thead>'+
        '<tr>'+
        '</tr>'+
      '</thead>'+
      '<tbody>'+
      '</tbody>'+
    '</table>';
  }

  TableView.prototype.render = function () {
    var temp = document.createElement('div');
    var fragment = document.createDocumentFragment();
    temp.innerHTML = this.template;
    Array.from(temp.children).forEach(function (el) {
      fragment.appendChild(el);
    });
    return {
      html: fragment,
      header: fragment.querySelector('thead'),
      body: fragment.querySelector('tbody')
    }
  };

  // Component 
  function TableComponent (option) {
    this.model = option.model;
    this.view = option.view;
    this.header = this.formatHeader(option.sortableHeader);
    var selector = option.selector || 'body';
    this.container = document.querySelector(selector);
    this.initEvent();
  }

  TableComponent.prototype.formatHeader = function (sort) {
    var sort = sort || [];
    var result = {};
    this.model.header.forEach(function (el) {
      var type = sort.indexOf(el) !== -1 ? 'sortable' : 'unsortable';
      result[el] = type;
    });
    return result;
  }

  TableComponent.prototype.render = function () {
    var self = this;
    this._dom = this.view.render();
    var tableHeader = new TableHeaderComponent({view: new TableHeaderView(), container: this._dom.header.querySelector('tr')});
    var tableItem = new TableItemComponent({view: new TableItemView(this.model.header)});
    var subject;
    if (this.container.querySelector('table')) {
      this.container.removeChild(this.container.querySelector('table'));
    }
    this.container.appendChild(this._dom.html);
    for (subject in this.header) {
      tableHeader.render(subject, this.header[subject]);
    }
    this.model.data.forEach(function (el) {
      tableItem.render(self._dom.body, el);
    });
  };

  TableComponent.prototype.initEvent = function () {
    var self = this;
    eventHandler.on('resort', function (subject, type) {
      var sortFn;
      if (type === 'up') {
        sortFn = self.model.sortUp.bind(self.model);
      } else {
        sortFn = self.model.sortDown.bind(self.model);
      }
      sortFn(subject);
      self.render();
    });
  }
  /*
   * ======= TableComponent End =========
   */


  /*
   * ======================
   * TableHeaderComponent
   * ======================
   */

  // View
  function TableHeaderView () {
    this.template = {
      sortable: '<th>{{subject}}<div class="arrow"><div class="up-arrow"></div><div class="down-arrow"></div></div></th>',
      unsortable: '<th>{{subject}}</th>'
    };
  }

  TableHeaderView.prototype.render = function (subject, type) {
    var temp = document.createElement('tr');
    var fragment = document.createDocumentFragment();
    temp.innerHTML = this.template[type].replace('{{subject}}', subject);
    Array.from(temp.children).forEach(function (el) {
      fragment.appendChild(el);
    })
    return {
      html: fragment,
      arrow: fragment.querySelector('.arrow')
    };
  };

  // Component
  function TableHeaderComponent (option) {
    this.view = option.view;
    this.container = option.container;
  }

  TableHeaderComponent.prototype.render = function (data, type) {
    this._dom = this.view.render(data, type);
    this.container.appendChild(this._dom.html);
    if (type === 'sortable') this.initEvent()
  };

  TableHeaderComponent.prototype.initEvent = function () {
    var self = this;
    this._dom.arrow.addEventListener('click', function (e) {
      var subject = e.target.parentElement.parentElement.innerText.trim();
      var type;
      if (e.target.classList.contains('up-arrow')) {
        type = 'up';
      } else if (e.target.classList.contains('down-arrow')) {
        type = 'down';
      } else {
        return;
      }
      eventHandler.fire('resort', [subject, type]);
    })
  }
  /*
   * ============== TableHeaderComponent End =================
   */

  /*
   * ======================
   * TableItemComponent
   * ======================
   */

  // View
  function TableItemView (header) {
    this.header = header;
    this.template = 
    '<tr>'+ 
    header.map(function (el) {
      return '<td>{{' + el + '}}</td>';
    }).join('') + 
    '</tr>';
  }

  TableItemView.prototype.render = function (data) {
    var temp = document.createElement('tbody');
    var fragment = document.createDocumentFragment();
    var template = this.template;
    this.header.forEach(function (el, index) {
      if (index === 0) {
        template = template.replace('{{'+el+'}}', data.name);
      } else {
        template = template.replace('{{' + el + '}}', data.content[el]);
      }
    });

    temp.innerHTML = template;
    Array.from(temp.children).forEach(function (el) {
      fragment.appendChild(el);
    });
    return {
      html: fragment
    };
  };

  // Component
  function TableItemComponent (option) {
    this.view = option.view;
  }

  TableItemComponent.prototype.render = function (container, data) {
    container.appendChild(this.view.render(data).html);
  };
  /*
   * =============== TableItemComponent End ================
   */

  var scoresData = [
  {name:'小明', content: {
    '语文': 80,
    '数学': 90,
    '英语': 70
  }},
  {name:'小红', content: {
    '语文': 90,
    '数学': 60,
    '英语': 90
  }},
  {name:'小亮', content: {
    '语文': 60,
    '数学': 100,
    '英语': 70
  }}
  ];
  
  var table = new TableComponent({
    model: new TableModel(scoresData, '总分'),
    view: new TableView(),
    sortableHeader: ['语文', '数学', '英语', '总分']
  });
  table.render();
})();