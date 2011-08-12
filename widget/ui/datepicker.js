/*
 * jQuery UI Datepicker @VERSION
 *
 * Depends:
 *	jquery.ui.core.js
 */
('datepicker' in jQuery.fn) ||
(function($, undefined){
    //popup:trueʱ ����֮ǰ��ʵ���͹��õ�picker
    var inst, datepicker;
    $.widget('ui.datepicker', {
        options: {
            date: new Date(),
            startDay: 0,
            pages: 1,
            closable: false,
            rangeSelect: false,
            minDate: false,
            maxDate: false,
            range: {
                start: null,
                end: null
            },
            navigator: true,
            popup: true,
            bgiframe: false,
            showTime: false,
            triggerType: 'click'
        },
        /**
         * �������캯��
         * @method 	_init
         * @param { string }	selector
         * @param { string }	config
         * @private
         */
        _create: function(){
            var self = this, o = self.options, elem = this.element;
            
            
            if (o.popup) {
                self.activator = elem;
                self._buildEvent();
            }
            else {
                self.render();
            }
            
            
            return self;
        },
        _destroy: function(){
            this.hide(null, true);
        },
        
        render: function(){
            var self = this, o = self.options, elem = this.element, i, _prev, _next, _oym;
            if (!self.con) {
                if (o.popup) {
                    //popup:true�� ����һ������Ԫ�أ�������ֶ��������������
                    if (inst && inst !== self) {
                        inst.hide(null, true);
                    }
                    inst = self;
                    self.con = (datepicker ||
                    (datepicker = $('<div>', {
                        css: {
                            'position': 'absolute',
                            'background': '#FFF',
                            'display': 'none'
                        }
                    }))).css('display', 'none').appendTo('body');
                }
                else {
                    self.con = elem;
                }
            }
            self._buildParam();
            self._handleDate();
            self.ca = [];
            
            self.con.addClass('ui-datepicker fd-clr ui-datepicker-multi' + o.pages).empty();
            
            if (o.bgiframe) {
                self.con.bgiframe();
            }
            
            for (i = 0, _oym = [self.year, self.month]; i < o.pages; i++) {
                if (i === 0) {
                    _prev = true;
                }
                else {
                    _prev = false;
                    _oym = self._computeNextMonth(_oym);
                }
                _next = i == (o.pages - 1);
                self.ca.push(new $.ui.datepicker.Page({
                    year: _oym[0],
                    month: _oym[1],
                    prevArrow: _prev,
                    nextArrow: _next,
                    showTime: o.showTime
                }, self));
                
                
                self.ca[i].render();
            }
            
            return self;
            
        },
        /**
         * �������������¼�
         * @method _buildEvent
         * @private
         */
        _buildEvent: function(){
            var self = this, o = self.options;
            //�������
            self.activator.bind(o.triggerType + '.ui-datepicker', function(e){
                e.preventDefault();
                if (e.type === 'focus') {
                    self.show(e);
                }
                else {
                    self.toggle(e);
                }
            });
            return self;
        },
        /**
         * �ı������Ƿ���ʾ��״̬
         * @mathod toggle
         */
        toggle: function(e){
            var self = this;
            if (self.con) {
                self.hide(e);
            }
            else {
                self.show(e);
            }
        },
        /**
         * ��ʾ����
         * @method show
         */
        show: function(e){
            //noformat
            var self = this;
			if (self.con){
				return;
			}
			if(!self._trigger('beforeShow',e)){
				return;
			}
			self.render();
			var o = self.options,
            	offset = self.activator.offset(),
				_x = offset.left, 
				height = self.activator.outerHeight(), 
				_y = offset.top + height;
			//format
            self.con.css({
                left: _x,
                top: _y
            }).fadeIn(150, function(){
                if (o.popup) {
                    //noformat
                    $(document)
    				.unbind('click.ui-datepicker')
    				.bind('click.ui-datepicker', function(e){
                        //TODO e.target����Ľڵ㣬��䲻�ò��ӣ���Ȼ���߼��ϲ�����������
                        var target = $(e.target);
                        //���ڼ���ڵ���
                        if (target[0] === self.activator[0]) {
                            return;
                        }
                        self.hide(e);
                    });
    				//format
                    self.con.bind('click.ui-datepicker', function(e){
                        e.stopPropagation();
                    });
                }
                
            });
            
            return self;
        },
        
        /**
         * ��������
         * @method hide
         */
        hide: function(e, fast){
            var self = this;
            if (!self.con) {
                return;
            }
            var o = self.options;
            if (o.popup) {
                $(document).unbind('click.ui-datepicker');
            }
            function handler(){
                self.con.remove();
                $.extend(self, {
                    con: null,
                    ca: []
                });
            }
            if (fast) {
                handler();
            }
            else {
                self.con.fadeOut(150, handler);
            }
            return self;
        },
        setOption: function(key, value){
            var self = this, o = self.options;
            switch (key) {
                case 'startDay':
                    o.startDay = (7 - o.startDay) % 7;
                    break;
                default:
                    self._setOption(key, value);
                    break;
            }
            
        },
        /**
         * ���������б�
         * @method _buildParam
         * @private
         */
        _buildParam: function(){
            var self = this, o = self.options;
            
            if (o.minDate && o.date < o.minDate) {
                o.date.setFullYear(o.minDate.getFullYear());
                o.date.setMonth(o.minDate.getMonth());
                o.date.setDate(o.minDate.getDate());
            }
            if (o.maxDate && o.date > o.maxDate) {
                o.date.setFullYear(o.maxDate.getFullYear());
                o.date.setMonth(o.maxDate.getMonth());
                o.date.setDate(o.maxDate.getDate());
            }
            
            self.selected = o.selected || o.date;
            
            if (o.startDay) {
                self.startDay = (7 - o.startDay) % 7;
            }
            
            return self;
        },
        /**
         * ��������
         * @method _handleDate
         * @private
         */
        _handleDate: function(){
            var self = this, date = self.options.date;
            self.weekday = date.getDay() + 1;//���ڼ� //ָ�����������ڼ�
            self.day = date.getDate();//����
            self.month = date.getMonth();//�·�
            self.year = date.getFullYear();//���
            return self;
        },
        
        //get����
        _getHeadStr: function(year, month){
            return year.toString() + '��' + (Number(month) + 1).toString() + '��';
        },
        
        //�¼�
        _monthAdd: function(){
            var self = this;
            if (self.month == 11) {
                self.year++;
                self.month = 0;
            }
            else {
                self.month++;
            }
            self.options.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/' + self.day.toString());
            return self;
        },
        
        //�¼�
        _monthMinus: function(){
            var self = this;
            if (self.month === 0) {
                self.year--;
                self.month = 11;
            }
            else {
                self.month--;
            }
            self.options.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/' + self.day.toString());
            return self;
        },
        
        //������һ���µ�����,[2009,11],��:fullYear����:��0��ʼ����
        _computeNextMonth: function(a){
            var _year = a[0], _month = a[1];
            if (_month == 11) {
                _year++;
                _month = 0;
            }
            else {
                _month++;
            }
            return [_year, _month];
        },
        
        //�������ڵ�ƫ����
        _handleOffset: function(){
            var self = this, o = self.options, data = ['��', 'һ', '��', '��', '��', '��', '��'], temp = '<span>{day}</span>', offset = o.startDay, day_html = '', a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day: data[(i - offset + 7) % 7]
                };
            }
            $.each(a, function(i, item){
                day_html += $.util.substitute(temp, item);
            });
            
            return {
                day_html: day_html
            };
        },
        
        //������ʼ����,d:Date����
        _handleRange: function(d){
            var self = this, o = self.options, t;
            if ((o.range.start === null && o.range.end === null) || (o.range.start !== null && o.range.end !== null)) {
                o.range.start = d;
                o.range.end = null;
                self.render();
            }
            else if (o.range.start !== null && o.range.end === null) {
                o.range.end = d;
                if (o.range.start.getTime() > o.range.end.getTime()) {
                    t = o.range.start;
                    o.range.start = o.range.end;
                    o.range.end = t;
                }
                self._trigger('rangeSelect', null, o.range);
                self.render();
            }
            return self;
        }
    });
    $.extend($.ui.datepicker, {
        Page: function(config, father){
            /**
             * ������������
             * @constructor S.Calendar.Page
             * @param {object} config ,�����б���Ҫָ�����������������
             * @param {object} father,ָ��Y.Calendarʵ����ָ�룬��Ҫ������Ĳ���
             * @return ��������ʵ��
             */
            //����
            this.father = father;
            this.month = Number(config.month);
            this.year = Number(config.year);
            this.prevArrow = config.prevArrow;
            this.nextArrow = config.nextArrow;
            this.node = null;
            this.timmer = null;//ʱ��ѡ���ʵ��
            this.id = '';
            /*
             '<span>��</span>',
             '<span>һ</span>',
             '<span>��</span>',
             '<span>��</span>',
             '<span>��</span>',
             '<span>��</span>',
             '<span>��</span>',
             */
            /*
             <a href="" class="ui-datepicker-null">1</a>
             <a href="" class="ui-datepicker-disabled">3</a>
             <a href="" class="ui-datepicker-selected">1</a>
             <a href="" class="ui-datepicker-today">1</a>
             <a href="">1</a>
             */
            this.html = ['<div class="box" id="{id}"><div class="hd"><a href="javascript:void(0);" class="prev {prev}"><</a><a href="javascript:void(0);" class="title">{title}</a><a href="javascript:void(0);" class="next {next}">></a></div><div class="bd"><div class="whd">', father._handleOffset().day_html, '</div><div class="dbd fd-clr">{ds}</div></div><div class="setime fd-hide"></div><div class="ft {showtime}"><div class="time">ʱ�䣺00:00 &hearts;</div></div><div class="selectime fd-hide"></div></div>'].join("");
            this.nav_html = '<p>��<select value="{the_month}"><option class="m1" value="1">01</option><option class="m2" value="2">02</option><option class="m3" value="3">03</option><option class="m4" value="4">04</option><option class="m5" value="5">05</option><option class="m6" value="6">06</option><option class="m7" value="7">07</option><option class="m8" value="8">08</option><option class="m9" value="9">09</option><option class="m10" value="10">10</option><option class="m11" value="11">11</option><option class="m12" value="12">12</option></select></p><p>��<input type="text" value="{the_year}" onfocus="this.select()"/></p><p><button class="ok">ȷ��</button><button class="cancel">ȡ��</button></p>';
        }
    });
    $.extend($.ui.datepicker.Page.prototype, {
        /**
         * ���õ����ݸ�ʽ����֤
         */
        Verify: function(){
            var isDay = function(n){
                if (!/^\d+$/i.test(n)) {
                    return false;
                }
                n = Number(n);
                return !(n < 1 || n > 31);
            }, isYear = function(n){
                if (!/^\d+$/i.test(n)) {
                    return false;
                }
                n = Number(n);
                return !(n < 100 || n > 10000);
            }, isMonth = function(n){
                if (!/^\d+$/i.test(n)) {
                    return false;
                }
                n = Number(n);
                return !(n < 1 || n > 12);
            };
            
            return {
                isDay: isDay,
                isYear: isYear,
                isMonth: isMonth
            };
        },
        /**
         * ��Ⱦ��������UI
         */
        _renderUI: function(){
            var cc = this, opts = cc.father.options, _o = {}, ft;
            cc.HTML = '';
            _o.prev = '';
            _o.next = '';
            _o.title = '';
            _o.ds = '';
            if (!cc.prevArrow) {
                _o.prev = 'fd-hide';
            }
            if (!cc.nextArrow) {
                _o.next = 'fd-hide';
            }
            if (!opts.showtime) {
                _o.showtime = 'fd-hide';
            }
            _o.id = cc.id = 'ui-datepiker-' + $.guid++;
            _o.title = cc.father._getHeadStr(cc.year, cc.month);
            cc.createDS();
            _o.ds = cc.ds;
            cc.father.con.append($.util.substitute(cc.html, _o));
            cc.node = $('#' + cc.id);
            if (opts.showTime) {
                ft = $('div.ft', cc.node);
                ft.removeClass('fd-hide');
                cc.timmer = new $.ui.datepicker.TimeSelector(ft, cc.father);
            }
            return this;
        },
        /**
         * �������������¼�
         */
        _buildEvent: function(){
            var cc = this, i, con = $('#' + cc.id);
            $('div,a,input', con).unbind('.ui-datepicker');
            $('div.dbd', con).bind('mousedown.ui-datepicker', function(e){
                //e.preventDefault();
                var target = $(e.target);
                if (target.hasClass('null')) {
                    return;
                }
                if (target.hasClass('disabled')) {
                    return;
                }
                //���������30�ջ���31�գ�����2�·ݾͻ������
                var o = cc.father.options, selectedd = Number(target.html()), d = new Date('2011/01/01');
                d.setDate(selectedd);
                d.setYear(cc.year);
                d.setMonth(cc.month);
                //datetime��date
                o.date = o.dt_date = d;
                cc.father._trigger('select', e, {
                    date: d
                });
                
                if (o.popup && o.closable) {
                    cc.father.hide(e);
                }
                if (o.rangeSelect) {
                    cc.father._handleRange(d);
                }
                cc.father.selected = d;
                cc.father.render();
            });
            //��ǰ
            $('a.prev', con).bind('click.ui-datepicker', function(e){
                e.preventDefault();
                cc.father._monthMinus().render();
                cc.father._trigger('monthChange', e, {
                    date: new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                });
                
            });
            //���
            $('a.next', con).bind('click.ui-datepicker', function(e){
                e.preventDefault();
                cc.father._monthAdd().render();
                cc.father._trigger('monthChange', e, {
                    date: new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                });
            });
            if (cc.father.options.navigator) {
                $('a.title', con).bind('click.ui-datepicker', function(e){
                    try {
                        cc.timmer.hidePopup();
                        e.preventDefault();
                    } 
                    catch (exp) {
                    }
                    var target = $(e.target), setime_node = $('div.setime', con);
                    setime_node.empty();
                    var in_str = $.util.substitute(cc.nav_html, {
                        the_month: cc.month + 1,
                        the_year: cc.year
                    });
                    setime_node.html(in_str);
                    setime_node.removeClass('fd-hide');
                    $('input', con).bind('keydown.ui-datepicker', function(e){
                        var target = $(e.target);
                        if (e.keyCode === $.ui.keyCode.UP) {//up
                            target.val(Number(target.val()) + 1);
                            target[0].select();
                        }
                        if (e.keyCode === $.ui.keyCode.DOWN) {//down
                            target.val(Number(target.val()) - 1);
                            target[0].select();
                        }
                        if (e.keyCode === $.ui.keyCode.ENTER) {//enter
                            var _month = $('div.setime select', con).val(), _year = $('div.setime input', con).val();
                            $('div.setime', con).addClass('fd-hide');
                            if (!cc.Verify().isYear(_year)) {
                                return;
                            }
                            if (!cc.Verify().isMonth(_month)) {
                                return;
                            }
                            cc.father.render({
                                date: new Date(_year + '/' + _month + '/01')
                            });
                            cc.father._trigger('monthChange', e, {
                                date: new Date(_year + '/' + _month + '/01')
                            });
                        }
                    });
                });
                $('div.setime', con).bind('click.ui-datepicker', function(e){
                    e.preventDefault();
                    var target = $(e.target);
                    if (target.hasClass('ok')) {
                        var _month = $('div.setime select', con).val(), _year = $('div.setime input', con).val();
                        $('div.setime', con).addClass('fd-hide');
                        if (!cc.Verify().isYear(_year)) {
                            return;
                        }
                        if (!cc.Verify().isMonth(_month)) {
                            return;
                        }
                        var o = cc.father.options;
                        o.date = new Date(_year + '/' + _month + '/01');
                        cc.father.render();
                        cc.father._trigger('monthChange', e, {
                            date: new Date(_year + '/' + _month + '/01')
                        });
                    }
                    else if (target.hasClass('cancel')) {
                        $('div.setime', con).addClass('fd-hide');
                    }
                });
            }
            return cc;
        },
        /**
         * �õ���ǰ��������node����
         */
        _getNode: function(){
            var cc = this;
            return cc.node;
        },
        /**
         * �õ�ĳ���ж�����,��Ҫ���������ж�����
         */
        _getNumOfDays: function(year, month){
            return 32 - new Date(year, month - 1, 32).getDate();
        },
        /**
         * �������ڵ�html
         */
        createDS: function(){
            //noformat
            var cc = this, 
				opts = cc.father.options,
				s = '', 
				startweekday = (new Date(cc.year + '/' + (cc.month + 1) + '/01').getDay() + opts.startDay + 7) % 7,//���µ�һ�������ڼ�
 				k = cc._getNumOfDays(cc.year, cc.month + 1) + startweekday, 
				i, 
				_td_s;
			//format
            
            for (i = 0; i < k; i++) {
                //prepare data {{
                if ($.browser.webkit && /532/.test($.browser.version)) {//hack for chrome
                    _td_s = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                }
                else {
                    _td_s = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 2 - startweekday).toString());
                }
                var _td_e = new Date(cc.year + '/' + Number(cc.month + 1) + '/' + (i + 1 - startweekday).toString());
                //prepare data }}
                if (i < startweekday) {//null
                    s += '<a href="javascript:void(0);" class="null">0</a>';
                }
                else if (opts.minDate instanceof Date &&
                new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 2 - startweekday)).getTime() < (opts.minDate.getTime() + 1)) {//disabled
                    s += '<a href="javascript:void(0);" class="disabled">' + (i - startweekday + 1) + '</a>';
                    
                }
                else if (opts.maxDate instanceof Date &&
                new Date(cc.year + '/' + (cc.month + 1) + '/' + (i + 1 - startweekday)).getTime() > opts.maxDate.getTime()) {//disabled
                    s += '<a href="javascript:void(0);" class="disabled">' + (i - startweekday + 1) + '</a>';
                    
                    
                }
                else if ((opts.range.start !== null && opts.range.end !== null) && //����ѡ��Χ
                (_td_s.getTime() >= opts.range.start.getTime() && _td_e.getTime() < opts.range.end.getTime())) {
                
                    if (i == (startweekday + (new Date()).getDate() - 1) &&
                    (new Date()).getFullYear() == cc.year &&
                    (new Date()).getMonth() == cc.month) {//���첢��ѡ��
                        s += '<a href="javascript:void(0);" class="range today">' + (i - startweekday + 1) + '</a>';
                    }
                    else {
                        s += '<a href="javascript:void(0);" class="range">' + (i - startweekday + 1) + '</a>';
                    }
                    
                }
                else if (i == (startweekday + (new Date()).getDate() - 1) &&
                (new Date()).getFullYear() == cc.year &&
                (new Date()).getMonth() == cc.month) {//today
                    s += '<a href="javascript:void(0);" class="today">' + (i - startweekday + 1) + '</a>';
                    
                }
                else if (i == (startweekday + cc.father.selected.getDate() - 1) &&
                cc.month == cc.father.selected.getMonth() &&
                cc.year == cc.father.selected.getFullYear()) {//selected
                    s += '<a href="javascript:void(0);" class="selected">' + (i - startweekday + 1) + '</a>';
                }
                else {//other
                    s += '<a href="javascript:void(0);">' + (i - startweekday + 1) + '</a>';
                }
            }
            if (k % 7 !== 0) {
                for (i = 0; i < (7 - k % 7); i++) {
                    s += '<a href="javascript:void(0);" class="null">0</a>';
                }
            }
            cc.ds = s;
            return this;
        },
        /**
         * ��Ⱦ
         */
        render: function(){
            var self = this;
            self._renderUI();
            self._buildEvent();
            return self;
        }
    });
    $.add('ui-datepicker');
})(jQuery);
