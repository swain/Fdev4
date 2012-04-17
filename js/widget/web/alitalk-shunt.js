/*
 * �������� 3.1 �������������alitak�����
 * @create 20110227 raywu
 *++++++++++++++++++++
 * @use
 *		html
 * <a href="#" data-shunt="{ruleId:'ALITALK_INCALL_ROLE_CTP01',positionId:'Top_Banner'}">333</a>
 * <a href="#" data-shunt="{}">333</a>
 * @update Denis ʹ��eval���˴�����Ҫ��ȫУ�� ---- 2011.11.07
 * @update Raywu ����free��Ա����ţ���� ---- 2012.02.01
 */
("shunt" in FE.util.alitalk) ||
(function($, Util){
    var defaults = {
        attr: 'shunt', //�����ǳ�������
        aliTalkId: 'aliservice29', // Ĭ�Ϸ���ʧ�ܺ�ʹ��talkid
        ruleId: 'ALITALK_INCALL_ROLE_CTP01', // Ĭ�Ϸ���ruleid
        positionId: 'Top_Banner', // Ĭ�Ϸ���positionid
        shuntUrl: 'http://athena.china.alibaba.com/athena/aliTalkInCall.json' //����������url��ֻ�豣֤��ָ��3Ҫ��,memberId��ruleId��positionId�����ظ�ʽ������һ�£�
        //onClickBegin: null,
        //onClickEnd: null
    }, shunt = function(els, options){
        if ($.isPlainObject(els)) {
            $.extendIf(options, defaults);
            els = $('a[data-' + options.attr + ']');
        }
        else {
            options = options || {};
            $.extendIf(options, defaults);
            els = $(els);
        }
        if (els.length) {
            els.each(function(){
                var el = $(this),
					dataStr = el.attr(options.attr) || el.data(options.attr) || '{}';
				//��Ҫ���attr��dataȡ�����Ϊobject������
				dataStr = $.extendIf(eval('(' + ((typeof dataStr === 'string')?dataStr:'{}') + ')'), options);
                el.data('alitalkShunt', dataStr);
            }).bind('click', onClickHandler);
        }
    };
    function onClickHandler(event){
        var t=this,
			data = $(t).data('alitalkShunt'),
			talkObjId = {};
        event.preventDefault();
        
        //����¼�����ǰ
        if (data.onClickBegin) {
            if (!data.onClickBegin.call(t, event)) {
                return;
            }
        }
        talkObjId.id = data.aliTalkId;
        $.ajax(data.shuntUrl, {
            dataType: 'jsonp',
            data: {
                memberId: Util.loginId,
                ruleId: data.ruleId,
                positionId: data.positionId
            },
            success: function(o){
                if (o.success && o.aliTalkId ) {
					/*
					 * ���ؽ��������resultTypeĿǰ��Ȼֻ���������ͣ������Ժ�����չ���ܣ���ʱ��switch
					 * ���ؽ����������Ϊ��ʷԭ����ʱ������aliTalkId�ֶ��С�����
					*/
					switch(o.resultType){
						case 'aliYUrl':
							Util.goTo(o.aliTalkId,'_blank');
							break;
						case 'alitalkId':
						default :
							talkObjId.id = o.aliTalkId;
							Util.alitalk(talkObjId);
							break;
					}
                }else{
					Util.alitalk(talkObjId);
				}
            },
            error: function(){
                Util.alitalk(talkObjId);
            }
        });
        //����¼�������
        if (data.onClickEnd) {
            data.onClickEnd.call(t, event);
        }
    }
    /*
     * ��̬����������
     */
    Util.alitalk.shunt = shunt;
    $.add('web-alitak-shunt');
})(jQuery, FE.util);
