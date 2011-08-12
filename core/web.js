/**
 * Baseed on gears
 * @Author: Denis 2011.01.31
 * @update: Denis 2011.07.22	�Ż���JSONģ�������
 */
(function($){
    $.namespace('FE.sys', 'FE.util', 'FE.ui');
    
    var FU = FE.util, cookie = $.util.cookie, $support = $.support;
    //PS:__last_loginid__��ie6�²���ȷ����(������cookie������__cn_logon_id__�ֶ�)
    //��ǰ��¼��ID
    FU.loginId = cookie('__cn_logon_id__');
    //��ǰ�Ƿ��е�¼�û�
    FU.isLogin = (FU.loginId ? true : false);
    //��һ�ε�¼��ID
    FU.lastLoginId = cookie('__last_loginid__');
    //��ת����
    /**
     * �¿����ڻ��ߵ�ǰ���ڴ�(Ĭ���¿�����),���IE��referrer��ʧ������
     * @param {String} url
     * @argument {String} �¿�����or��ǰ���� _self|_blank
     */
    FU.goTo = function(url, target){
        var SELF = '_self';
        target = target || SELF;
        if (!$.util.ua.ie) {
            return window.open(url, target);
        }
        var link = document.createElement('a'), body = document.body;
        link.setAttribute('href', url);
        link.setAttribute('target', target);
        link.style.display = 'none';
        body.appendChild(link);
        link.click();
        if (target !== SELF) {
            setTimeout(function(){
                try {
                    body.removeChild(link);
                } 
                catch (e) {
                }
            }, 200);
        }
        return;
    };
    //�ж�������Ƿ�֧��JSON���Ӷ�ע��ģ��
    if ($support.JSON) {
        $.add('util-json');
    }
})(jQuery);
