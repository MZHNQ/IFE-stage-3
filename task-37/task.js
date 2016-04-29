(function(){
  function AlertView () {
    this.template = 
      '<div class="alert-cover">'+
        '<div class="alert">'+
          '<div class="alert-title-bar">ALERT</div>'+
          '<div class="alert-message">{{message}}</div>'+
          '<div class="btn-bar">'+
            '<button class="confirm-btn">confirm</button>'+
            '<button class="cancel-btn">cancel</button>'+
          '</div>'+
        '</div>'+
      '</div>';
  }

  AlertView.prototype.render = function (message) {
    var temp = document.createElement('div');
    temp.innerHTML = this.template.replace('{{message}}', message);
    return {
      html: temp.querySelector('.alert-cover'),
      confirmBtn: temp.querySelector('.confirm-btn'),
      cancelBtn: temp.querySelector('.cancel-btn')
    };
  };
  
  function AlertComponent (view) {
    this.view = view;
  };

  AlertComponent.prototype.alert = function (message) {
    message = message || '';
    this._dom = this.view.render(message);
    document.body.appendChild(this._dom.html);
    this.initEvent();
  };

  AlertComponent.prototype.destroy = function () {
    document.body.removeChild(this._dom.html);
  };

  AlertComponent.prototype.initEvent = function () {
    var self = this;
    this._dom.confirmBtn.addEventListener('click', this.destroy.bind(this));
    this._dom.cancelBtn.addEventListener('click', this.destroy.bind(this));
    this._dom.html.addEventListener('click', function (e) {
      if (!e.target.classList.contains('alert-cover')) return;
      self.destroy();
    });
    this._dom.html.onmousewheel = function () {return false;};  // 阻止页面滚动
  };

  var alert = new AlertComponent(new AlertView);
  window.oAlert = alert.alert.bind(alert);
})()