/*
 * @ʡ����������������Ƕ༶���������Ӧ��֮һ
 *  �����֧��1~3���������˵���������������������Ӧ�ã����ұ���һ�����ṩ���еļ������ݣ����ݸ�ʽ��������ļ�
 *  ����һ������ʵ������Ϊ��FE.ui.PCA(...)
 * @author Denis<danxia.shidx@alibaba-inc.com>
 * @version 1.0 2011.07.26
 * @update Denis 2012.12.07 �޸�ҳ���϶�ε��ã��¼�����д��BUG
 */
(function($, UI){
    /*
     * @namespace ʵ���������˵������
     * @param {Array} els ��Ӧ��select����
     * @param {object} opts ���ã������ڴ˴��ṩ��������
     */
    var PCA = function(els, opts){
        if (opts.store) {
            this.init(els, opts);
        }
    }, defaults = {
        //Ĭ�ϱ���
        title: ['--��ѡ��--', '--��ѡ��--', '--��ѡ��--'],
        //Ĭ����ʾ����
        showTitle: true,
        //��ʼvalue
        vals: [],
        //��ʼtext
        texts: []
        //onPSelected:function(){},
        //onCSelected:function(){},
        //onASelected:function(){},
    };
    PCA.prototype = {
        //elP: null,
        //elC: null,
        //elA: null,
        //valP: null,
        //valC: null,
        //valA: null,
        //ip: -1,
        //ic: -1,
        /*
         * @namespace ʵ���������˵������
         * @param {Array} els ��Ӧ��select��
         * @param {object} opts ����
         */
        init: function(els, opts){
            var self = this;
            opts = opts || {};
            self.defaults = $.extend({}, defaults, opts);
            for (var i = 0, j = self.defaults.vals.length; i < j; i++) {
                switch (i) {
                    case 0:
                        self.valP = self.defaults.vals[0];
                        break;
                    case 1:
                        self.valC = self.defaults.vals[1];
                        break;
                    case 2:
                        self.valA = self.defaults.vals[2];
                        break;
                }
            }
            for (var i = 0, j = self.defaults.texts.length; i < j; i++) {
                switch (i) {
                    case 0:
                        self.textP = self.defaults.texts[0];
                        break;
                    case 1:
                        self.textC = self.defaults.texts[1];
                        break;
                    case 2:
                        self.textA = self.defaults.texts[2];
                        break;
                }
            }
            for (var i = els.length - 1; i > -1; i--) {
                switch (i) {
                    case 0:
                        self.elP = els[0];
                        //������ڳ������� ��ʡ��������change�¼�
                        if (self.elC || self.defaults.onPSelected) {
                            $(self.elP).bind('change', function(){
                                if (self.elC) {
                                    self.ip = self.defaults.store[0][(self.defaults.store[0][1] ? 1 : 0)].indexOf(this.value);
                                    self.valA = self.textA = null;
                                    self.cityBind.call(self);
                                }
                                if (self.defaults.onPSelected) 
                                    self.defaults.onPSelected.call(this);
                            });
                        }
                        break;
                    case 1:
                        //��¼���������ؼ�
                        self.elC = els[1];
                        //������ڵ������� ������������change�¼�
                        if (self.elA || self.defaults.onCSelected) {
                            $(self.elC).bind('change', function(){
                                if (self.elA) {
                                    self.ic = (self.defaults.store[1][1]) ? self.defaults.store[1][1][self.ip].indexOf(this.value) : self.defaults.store[1][0][self.ip].indexOf(this.value);
                                    self.areaBind.call(self);
                                }
                                if (self.defaults.onCSelected) 
                                    self.defaults.onCSelected.call(this);
                            });
                        }
                        break;
                    case 2:
                        //��¼���������ؼ�
                        self.elA = els[2];
                        if (self.defaults.onASelected) {
                            $(self.elA).bind('change', function(){
                                self.defaults.onASelected.apply(this);
                            });
                        }
                        break;
                }
            }
            self.provinceBind(self.valP, self.textP);
        },
        /*
         * @method �趨ʡ��
         * @param {string} val   Item��ֵ
         * @param {string} text  Item��ֵ
         */
        provinceBind: function(val, text){
            var self = this, v = self.defaults.store[0][1] ? 1 : 0;
            if (text && !val) {
                val = self.defaults.store[0][v][self.defaults.store[0][0].indexOf(text)];
            }
            self.ip = val ? self.defaults.store[0][v].indexOf(val) : -1;
            //self.ip=j;
            //if(!(!self.defaults.showTitle&&j> -1)) j++;
            //�������
            self.elP.options.length = 0;
            if (self.defaults.showTitle) {
                var option = new Option(self.defaults.title[0], '');
                self.elP.options.add(option);
                //�ڲ���ʾ���Ⲣû��ָ��val����� Ĭ��ѡ�е�һ��
            }
            else if (self.ip < 0) {
                self.ip = 0;
            }
            for (var i = 0, j = self.defaults.store[0][0].length; i < j; i++) {
                var option = new Option(self.defaults.store[0][0][i], self.defaults.store[0][v][i]);
                self.elP.options.add(option);
            }
            if (val) {
                self.elP.value = val;
            }
            else {
                self.elP.selectedIndex = 0;
            }
            if (self.elC) {
                self.cityBind(self.valC, self.textC);
            }
        },
        /*
         * @method �趨����
         * @param {string} val Item��ֵ
         */
        cityBind: function(val, text){
            var self = this, v = self.defaults.store[1][1] ? 1 : 0;
            if (text && !val) {
                val = self.defaults.store[1][v][self.ip][self.defaults.store[1][0][self.ip].indexOf(text)];
            }
            self.ic = val && self.ip > -1 ? self.defaults.store[1][v][self.ip].indexOf(val) : -1;
            //self.ic=j;
            //if(!(!self.defaults.showTitle&&j> -1)) j++;
            //�������
            self.elC.options.length = 0;
            if (self.defaults.showTitle) {
                var option = new Option(self.defaults.title[1], '');
                self.elC.options.add(option);
                //�ڲ���ʾ���Ⲣû��ָ��val����� Ĭ��ѡ�е�һ��
            }
            else if (self.ic < 0) {
                self.ic = 0;
            }
            if (self.ip > -1) {
                for (var i = 0, j = self.defaults.store[1][0][self.ip].length; i < j; i++) {
                    var option = new Option(self.defaults.store[1][0][self.ip][i], self.defaults.store[1][v][self.ip][i]);
                    self.elC.options.add(option);
                }
            }
            if (val) {
                self.elC.value = val;
            }
            else {
                self.elC.selectedIndex = 0;
            }
            if (self.elA) {
                self.areaBind(this.valA, this.textA);
            }
        },
        /*
         * @method �趨����
         * @param {string} val Item��ֵ
         */
        areaBind: function(val, text){
            var self = this, v = self.defaults.store[2][1] ? 1 : 0;
            if (text && !val) {
                val = self.defaults.store[2][v][self.ip][self.ic][self.defaults.store[2][0][self.ip][self.ic].indexOf(text)];
            }
            self.ia = (val && self.ip > -1 && self.ic > -1) ? self.defaults.store[2][v][self.ip][self.ic].indexOf(val) : -1;
            //self.ia=j;
            //if(!(!self.defaults.showTitle&&j> -1)) j++;
            //�������
            self.elA.options.length = 0;
            if (self.defaults.showTitle) {
                var option = new Option(self.defaults.title[2], '');
                self.elA.options.add(option);
            }
            else if (self.ia < 0) {
                self.ia = 0;
            }
            if (self.ip > -1 && self.ic > -1) {
                for (var i = 0, j = self.defaults.store[2][0][self.ip][self.ic].length; i < j; i++) {
                    var option = new Option(self.defaults.store[2][0][self.ip][self.ic][i], self.defaults.store[2][v][self.ip][self.ic][i]);
                    self.elA.options.add(option);
                }
            }
            if (val) {
                self.elA.value = val;
            }
            else {
                self.elA.selectedIndex = 0;
            }
        }
    };
    UI.PCA = PCA;
    $.add('web-valid');
})(jQuery, FE.ui);
