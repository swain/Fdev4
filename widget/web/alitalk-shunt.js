/*
 * �������� 3.0 �������������alitak�����
 * @create 20110227 raywu
 *++++++++++++++++++++
 * @use
 *		html
 * <a href="#" data-shunt="{ruleId:'ALITALK_INCALL_ROLE_CTP01',positionId:'Top_Banner',aliTalkId:'wuleijun990'}">333</a>
 * <a href="#" data-shunt="{}">333</a>
 */
("shunt" in FE.util.alitalk) ||
(function($, Util){
    var defaults = {
        attr: "shunt", //�����ǳ�������
        aliTalkId: 'aliservice29', // Ĭ�Ϸ���ʧ�ܺ�ʹ��talkid
        ruleId: 'ALITALK_INCALL_ROLE_CTP01', // Ĭ�Ϸ���ruleid
        positionId: 'Top_Banner', // Ĭ�Ϸ���positionid
        shuntUrl: "http://athena.china.alibaba.com/athena/aliTalkInCall.json", //����������url��ֻ�豣֤��ָ��3Ҫ��,memberId��ruleId��positionId�����ظ�ʽ������һ�£�
        onClickBegin: null,
        onClickEnd: null
    }, shunt = function(els, options){
        if ($.isPlainObject(els)) {
            $.extendIf(options, defaults);
            els = $("a[data-" + options.attr + "]");
        }
        else {
            options = options || {};
            $.extendIf(options, defaults);
            els = (els) ? $(els) : $("a[data-" + options.attr + "]");
        }
        if (els.length) {
            els.each(function(){
                var el = $(this);
                var data = $.extendIf(parseObj(el.attr(options.attr) || el.data(options.attr) || {}), options);
                el.data("shunt", data);
            }).bind("click", onClickHandler);
        }
    };
    /*�ַ���ת���󷽷�������ʹ��evel������ͬʱ�Խڵ�����"{}"��ȡ����Ϊobject�ͷ�string�����޸���ͬʱ����Ƿ��ַ������ؿն���*/
    function parseObj(data){
        try {
            return (typeof data === "object") ? data : (new Function("return " + data))();
        } 
        catch (e) {
            return {};
        }
    }
    function onClickHandler(event){
        var element = $(this), data, talkObjId = {};
        if (event) {
            event.preventDefault();
            data = element.data("shunt");
        }
        else {
            data = this;
        }
        //����¼�����ǰ
        if (data.onClickBegin) {
            if (!data.onClickBegin.call(this, event)) {
                return;
            }
        }
        talkObjId.id = data.aliTalkId;
        $.ajax(data.shuntUrl, {
            dataType: "jsonp",
            data: {
                memberId: Util.loginId,
                ruleId: data.ruleId,
                positionId: data.positionId
            },
            success: function(o){
                if (o.success && o.aliTalkId) {
                    talkObjId.id = o.aliTalkId;
                }
                FE.util.alitalk(talkObjId);
            },
            error: function(){
                FE.util.alitalk(talkObjId);
            }
        });
        //����¼�������
        if (data.onClickEnd) {
            data.onClickEnd.call(this, event);
        }
    }
    /*
     * ��̬����������
     */
    Util.alitalk.shunt = shunt;
    $.add('web-alitak-shunt');
})(jQuery, FE.util);
