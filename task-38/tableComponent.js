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

  function getType ( variable ) {
    return Object.prototype.toString.call(variable).match(/\s(.+)\]/)[1].toLowerCase();
  }

  function cloneObject ( src ) {
    if ( src === undefined ) return src;
    var srcType = getType(src);
    var typeList = ['string', 'boolean', 'number'];
    var result;
    for (var i=0, l=typeList.length; i<l; i++) {
      if (srcType === typeList[i]) return src;
    }
    switch ( srcType ) {
      case "array":
        result = [];
        src.forEach(function(el){
            result.push(cloneObject(el));
        });
        break;
      case "date":
        result = new Date(src);
        break;
      case "object":
        result = {};
        for (var name in src) {
            result[name] = cloneObject(src[name]);
        }
        break;
      default:
        result = src;
    }
    return result;
  }

  function freezeElement (element) {
    var parent = element.parentElement;
    var top = offsetTop(element);
    var height = parseInt(getComputedStyle(parent)['height']) - parseInt(getComputedStyle(element)['height']);
    var temp = document.createElement(element.tagName.toLowerCase());
    temp.innerHTML = element.innerHTML;
    var setWidth = function () {
      var width = Array.from(element.querySelectorAll('th')).map(function (el) {
        return getComputedStyle(el)['width'];
      });
      Array.from(temp.querySelectorAll('th')).forEach(function (el, index) {
        el.style.width = width[index];
        if (el.querySelector('.arrow')) {
          el.querySelector('.arrow').style.visibility = 'hidden';
        }
      });
    };
    setWidth();
    window.addEventListener('resize', setWidth);
    temp.style.display = 'none';
    element.parentElement.appendChild(temp);
    var freeze = function () {
      element.style.visibility = 'hidden';
      temp.style.display = 'block';
      temp.style.position = 'fixed';
      temp.style.top = 0;
    };
    var unfreeze = function () {
      temp.style.display = 'none';
      element.style.visibility = "visible";
    };
    window.addEventListener('scroll', function () {
      if (document.body.scrollTop > top && document.body.scrollTop < top + height) {
        freeze();
      } else {
        unfreeze();
      }
    });
  }

  function offsetTop (element) {
    var result = element.offsetTop;
    var container = element.offsetParent;
    while (container) {
      result += container.offsetTop;
      container = container.offsetParent;
    }
    return result;
  }

  /*
   * ================
   * TableComponent
   * ================
   */

  // Model
  function TableModel (data, totalName) {
    this.source = cloneObject(data);
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
        result = [Object.keys(this.data[0])[0]],
        i;
    for (i in example) {
      result.push(i);
    }
    return result;
  };
  TableModel.prototype._sortUp = function (subject) {
    this.data.sort(function (a, b) {
      return a.content[subject] > b.content[subject];
    });
  };
  TableModel.prototype._sortDown = function (subject) {
    this.data.sort(function (a, b) {
      return a.content[subject] < b.content[subject];
    });
  };
  TableModel.prototype.sort = function (subject, direction) {
    if (direction === 'up') {
      this._sortUp(subject);
    } else {
      this._sortDown(subject);
    }
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
  function TableComponent (data,  option) {
    this.model = option.model;
    this.view = option.view;
    this.header = this.formatHeader(option.sortableHeader);
    this.container = document.querySelector(option.selector);
    this.freezeHeader = option.freezeHeader;

    this.states = {
      sortBy: option.sortBy || option.sortableHeader[0],
      sortDirection: option.sortDirection
    };
    
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
  };

  TableComponent.prototype.render = function () {
    if (!this.container) return;
    var self = this;
    this._dom = this.view.render();
    this.model.sort(this.states.sortBy, this.states.sortDirection);
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
    if (this.freezeHeader) {
      freezeElement(this._dom.header);
    }
  };

  TableComponent.prototype.initEvent = function () {
    var self = this;
    eventHandler.on('resort', function (subject, type) {
      var sortFn;
      self.states.sortDirection = type;
      self.states.sortBy = subject;
      self.render();
    });
  };


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
    });
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
    if (type === 'sortable') this.initEvent();
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
      template = template.replace('{{' + el + '}}', data[el] || data.content[el]);
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
  window.createTable = function (data, option) {
    var opt = {
      selector: 'body',
      model: new TableModel(data, option.total),
      view: new TableView(),
      sortableHeader: [],
      freezeHeader: false,
      total: '',
      sortBy: '',
      sortDirection: 'down'
    };
    var i;
    for (i in  option) {
      if (opt.hasOwnProperty(i)) {
        opt[i] = option[i];
      }
    }
    return new TableComponent(data, opt);
  };
})();