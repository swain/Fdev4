/**
 * masthead�ؼ��ֲ�ȫ���
 * @version 2012.01.16 1.0
 * @author Denis
 * @requires ui-autocomplete
 * @update Denis 2012.02.28 �ṩĬ�ϵ�urlĿ��
 */
('Suggestion' in FE.ui) ||
(function($, UI){
    /**
     * �Զ��Ƽ�Class
     * @param {Object} el
     * @param {Object} configs
     */
    function Suggestion(el, configs){
        var self = this;
        self.element = $(el).eq(0);
        if(!self.element.length){
            return;
        }
        self.options = configs || {};
        self._init();
    }
    Suggestion.prototype = {
        _init: function(){
            var self = this, o = self.options, keywords = self.element, data;
            keywords.autocomplete({
                source: function(request, response){
                    self.ajax && self.ajax.abort();
                    self.ajax = $.ajax({
                        url: o.url || 'http://suggest.china.alibaba.com/bin/suggest',
                        dataType: 'script',
                        data: $.paramSpecial({
                            type: o.type,
                            q: request.term
                        }),
                        success: function(){
                            var data = window['_suggest_result_'], result = data.result || {}, i = 0, city; //category = data.category;
                            if (data.pCity) {
                                city = data.pCity[0][1] + data.pCity[0][2];
                                result.splice(0, 0, data.pCity[0]);
                            }
                            
                            // DW data collect (exposure)
//                            if ('undefined' !== typeof baseClick) {
//                                var param = '?sectionexp=' + tracelogType + '_' +
//                                'search_suggest_show_' +
//                                (!!(data.pCity) ? (encodeURIComponent(city)) + '_' : '') +
//                                encodeURIComponent(request.term);
//                                baseClick('http://stat.china.alibaba.com/sectionexp.html', param);
//                            }
                            var items = $.map(result, function(item){
                                var label = item[0].replace('_', '<em>').replace('%', '</em>'), value = item[0].replace(/[_%]/g, '').trim(), desc = !!item[2] ? (item[1] + item[2]) : item[1];
                                
                                return {
                                    label: label,
                                    desc: desc,
                                    value: value,
                                    index: i++
                                };
                            });
                            //                            if($categoryId.length && category){
                            //                                $.each(category, function(i, ca){
                            //                                   ca.category = true;
                            //                                   ca.label = request.term,
                            //                                   items.unshift(ca);
                            //                                });
                            //                            }
                            response(items);
                        }
                    });
                },
                select: function(e, ui){
                    // DW data collect (click)
//                    if ('undefined' !== typeof baseClick) {
//                        var url = 'http://stat.china.alibaba.com/search/queryreport.html', param = '?' + tracelogType + '_suggest_' +
//                        encodeURIComponent(this.value) +
//                        '_' +
//                        (/^\d+$/.test(ui.item.desc) ? (encodeURIComponent(ui.item.desc)) + '_' : '') +
//                        encodeURIComponent(ui.item.value) +
//                        '_' +
//                        ui.item.index;
//                        baseClick(url, param);
//                    }
                    
                    //                    if($categoryId.length && ui.item.category){
                    //                        $categoryId.val(ui.item.id);
                    //                    }else{
                    //                        $categoryId.val('');
                    //                    }
                    
                    // select the value to the input
                    //this.value = '';
                    keywords.val(ui.item.value);
                    o.onSelected && o.onSelected.call(self, e, ui);
                },
                open: function(event, ui){
                    // resize the width of menu
                    ui.menu.element.width(keywords.width() + o.widthfix);
                },
                //                change: function() {
                //                    return type;
                //                },
                minLength: 1,
                appendTo: o.appendTo,
                position: o.position
            });
            data = keywords.data("autocomplete");
            //��Ⱦȡ�ص�����
            data._renderItem = function(ul, item){
                return $('<li>').data("item.autocomplete", item).html(function(){
                    //                    if ($categoryId.length && item.category) {
                    //                        return '<a><span class="suggest-key">' + item.label + '</span><span class="suggest-category">��<em>��' + item.name + '��</em>������</span></a>';
                    //                    } else {
                    if (/^\d+$/.test(item.desc)) {
                        return '<span class="suggest-key">' + item.label + '</span><span class="suggest-result">Լ' + item.desc + "�����</span>";
                    } else {
                        return '<span class="suggest-key">' + item.label + '</span><span class="suggest-city">��<em>��' + item.desc + '��</em>����</span>';
                    }
                    //}
                }).appendTo(ul);
            };
            //��menu���Ӷ������ʽ
            data.menu.element.addClass('web-suggestion');
        },
        /**
         * ��������
         * @param {Object} o
         */
        setOptions: function(o){
            $.extend(this.options, o);
            return this;
        },
        /**
         * �������
         */
        enable: function(){
            this.element.autocomplete('enable');
        },
        /**
         * �������
         */
        disable: function(){
            this.element.autocomplete('disable');
        }
    };
    UI.Suggestion = Suggestion;
})(jQuery, FE.ui);
