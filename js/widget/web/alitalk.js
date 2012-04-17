/*
 * �������� 3.4
 * @author Denis 2011.02
 * @update Denis 2011.03.02 �����ӿ�֧��JSONP
 * @update Denis 2011.03.23 �޸�DOMReady����£�FF��ֵisInstalled����; �����������ͨ��iframe���У����ı�window.location; ȥ��onClickBegin
 * @update Denis 2011.06.23 ���Ѿ���ʼ�����ı�ǩ�����ظ���ʼ��
 * @update Denis 2011.09.22 �Ż�getAlitalk��Ĭ�Ͻӿڣ�������memberId����ȡonRemote����ΪĬ�Ϻ������Ż���Ĭ���İ��Ľ��������
 * @update Denis 2011.11.04 �޸�DOM���Ƴ���data��ȡʧ�ܣ�success�ص������޷�����ִ�е�BUG��
 * @update Denis 2011.12.05 �����������
 * @update Denis 2012.01.18 �޸�.data�Զ�����ת�������BUG
 * @update XuTao 2012.02.08 BUG�޸�
 * @update allenm 2012.03.01 û��װ��������ʱ�򣬳��Ե�ǰҳ���ϵ� FE.sys.webww.main.chatTo() ���������ʧ�ܣ�����ת�� webww ҳ��
 * @update Denis 2012.03.12 ���ӷ�������
 * @update Denis 2012.03.30 �޸������������GBK���������
 */
('alitalk' in FE.util) ||
(function($, Util){
    var ie = $.util.ua.ie, $extendIf = $.extendIf, defaults = {
        //�����Ӧ����������Ϊ�Զ��塢��ť��ͼ��
        cls: {
            base: 'alitalk',
            on: 'alitalk-on',
            off: 'alitalk-off',
            mb: 'alitalk-mb'
        },
        attr: 'alitalk',
        //�������ڵ�վ�㣬
        siteID: 'cnalichn',
        //�Ƿ������û�����״̬
        remote: true,
        prop: '',
        //δ��װ��δ��⵽��װ��������ô˷���
        getAlitalk: function(id){
            if( !(FE.sys && FE.sys.webww && FE.sys.webww.main && FE.sys.webww.main.chatTo( id )) ){
                window.open('http://webww.china.alibaba.com/message/my_chat.htm?towimmid=' + id, '_blank');
            }
        },
        onRemote: function(data){
            var element = $(this);
            switch (data.online) {
                case 0:
                case 2:
                case 6:
                default: //������
                    element.html('��������').attr('title', '�Ҳ������ϣ�����������Ϣ��');
                    break;
                case 1: //����
                    element.html('������ϵ').attr('title', '���������ϣ����Ϻ���Ǣ̸');
                    break;
                case 4:
                case 5: //�ֻ�����
                    element.html('���Ҷ���').attr('title', '���ֻ����ߣ����Ϻ���Ǣ̸');
                    break;
            }
        }
    }, version = 0, isInstalled = (function(){
        if (ie) {
            var vers = {
                'aliimx.wangwangx': 6,
                'Ali_Check.InfoCheck': 5
            };
            for (var p in vers) {
                try {
                    new ActiveXObject(p);
                    version = vers[p];
                    return true;
                } 
                catch (e) {
                }
            }
        }
        else 
            if ($.browser.mozilla || $.browser.safari) {
                var res = false;
                $(function(){
                    if (navigator.mimeTypes['application/ww-plugin']) {
                        var plugin = $('<embed>', {
                            type: 'application/ww-plugin',
                            css: {
                                visibility: 'hidden',
                                width: 0,
                                height: 0
                            }
                        });
                        plugin.appendTo(document.body);
                        if ((plugin[0].NPWWVersion && numberify(plugin[0].NPWWVersion()) >= 1.003) || (plugin[0].isInstalled && plugin[0].isInstalled(1))) {
                            version = 6;
                            res = true;
                            //Denis: �ж�alitalk�Ƿ��Ѿ�����Util��DOMReady֮��use���ܣ�Util.alitalk��δ��ֵ
                            if (Util.alitalk) {
                                Util.alitalk.isInstalled = true;
                            }
                        }
                        plugin.remove();
                    }
                });
                return res;
            }
        return false;
    })();
    /**
     * ����ص�����
     * @param {Object} response JSON object
     * @param {Object} elements
     * @param {Object} options
     */
    function success(obj, elements, options){
        if (obj.success) {
            var arr = obj.data;
            elements.each(function(i){
                var element = $(this), data = element.data('alitalk');
                if (data) {
                    //��������״̬
                    data.online = arr[i];
                    element.addClass(data.cls.base);
                    
                    switch (data.online) {
                        case 0:
                        case 2:
                        case 6:
                        default: //������
                            element.addClass(data.cls.off);
                            break;
                        case 1: //����
                            element.addClass(data.cls.on);
                            break;
                        case 4:
                        case 5: //�ֻ�����
                            element.addClass(data.cls.mb);
                            break;
                    }
                    
                    if (data.onRemote) {
                        data.onRemote.call(element[0], data);
                    }
                }
            });
        }
        //����
        if (options.onSuccess) {
            options.onSuccess();
        }
    }
    /**
     * �����������
     */
    function invokeWW(cmd){
        var ifr = $('<iframe>').css('display', 'none').attr('src', cmd).appendTo('body');
        setTimeout(function(){
            ifr.remove();
        }, 200);
    }
    /**
     * ����¼�������
     * @param {Object} event
     */
    function onClickHandler(event){
        var element = $(this), data, feedback, prop, info_id;
        if (event) {
            event.preventDefault();
            data = element.data('alitalk');
        }
        else {
            data = this;
        }
        //��̬ģʽ�� ����Ĭ��״̬Ϊ����
        if (!data.remote) {
            data.online = 1;
        }
        //��û�л�ȡ��״̬
        if (data.online === null) {
            return;
        }
        
        prop = data.prop;
        if (typeof prop === 'function') {
            prop = prop.call(this);
            var match = prop.match(/info_id=([^#]+)/);
            if (match && match.length === 2) {
                info_id = match[1];
            }
        }
        
        feedback = '&url2=http://dmtracking.alibaba.com/others/feedbackfromalitalk.html?online=' + data.online +
        '#info_id=' +
        (data.info_id || info_id || '') +
        '#type=' +
        (data.type || '') +
        '#module_ver=3#refer=' +
        encodeURI(document.URL).replace(/&/g, '$');
        //�����û�id
        switch (version) {
            case 0:
            default:
                data.getAlitalk.call(this, data.id);
                break;
            case 5:
                invokeWW('Alitalk:Send' + (data.online === 4 ? 'Sms' : 'IM') + '?' + data.id + '&siteid=' + data.siteID + '&status=' + data.online + feedback + prop);
                break;
            case 6:
                if (data.online === 4) {
                    invokeWW('aliim:smssendmsg?touid=' + data.siteID + data.id + feedback + prop);
                }
                else {
                    invokeWW('aliim:sendmsg?touid=' + data.siteID + data.id + '&siteid=' + data.siteID + '&fenliu=1&status=' + data.online + feedback + prop);
                }
                break;
                
        }
        if (data.onClickEnd) {
            data.onClickEnd.call(this, event);
        }
    }
    /**
     * ������¼����
     * @param {Object} id
     */
    function login(id){
        var src;
        if (version === 5) {
            src = 'alitalk:';
        }
        else {
            src = 'aliim:login?uid=' + (id || '');
        }
        invokeWW(src);
    }
    /**
     * ת��Ϊ����
     * @param {Object} s
     */
    function numberify(s){
        var c = 0;
        return parseFloat(s.replace(/\./g, function(){
            return (c++ === 0) ? '.' : '';
        }));
    }
    /*
     * ��ʼ��alitalk�ľ�̬����
     * @param {jQuery} $֧�ֵ����б�ʶ
     * @param {object} opts ���ò���
     */
    function alitalk(elements, options){
        if ($.isPlainObject(elements)) {
            options = elements;
            options.online = options.online || 1;
            $extendIf(options, defaults);
            onClickHandler.call(options);
        }
        else {
            options = options || {};
            $extendIf(options, defaults);
            elements = $(elements).filter(function(){
                return !$.data(this, options.attr);
            });
            if (elements.length) {
                //�����ӿ��Ż���֧��JSONP
                var ids = [];
                elements.each(function(i, elem){
                    elem = $(elem);
                    var data = $extendIf(eval('(' + (elem.attr(options.attr) || elem.attr('data-' + options.attr) || '{}') + ')'), options);
                    elem.data('alitalk', data);
                    ids.push(data.siteID + data.id);
                }).bind('click', onClickHandler);
                //�Ӱ��������ȡ����״̬
                if (ids.length && options.remote) {
                    $.ajax('http://amos.im.alisoft.com/mullidstatus.aw', {
                        dataType: 'jsonp',
                        data: 'uids=' + ids.join(';'), 
                        success: function(o){
                            success(o, elements, options);
                        }
                    });
                }
            }
        }
    }
    
    /*
     * ��̬����������
     */
    Util.alitalk = alitalk;
    /*
     * Alitalk�ͻ��˰汾
     */
    Util.alitalk.version = version;
    /*
     * �ͻ����Ƿ�װ��Alitalk
     */
    Util.alitalk.isInstalled = isInstalled;
    /*
     * �Զ�����alitalk�ͻ������
     */
    Util.alitalk.login = login;
    
    $.add('web-alitalk');
})(jQuery, FE.util);
