(function(c){c.namespace("FE.sys","FE.util","FE.ui");var d=FE.util,b=c.util.cookie,a=c.support;d.loginId=b("__cn_logon_id__");d.isLogin=(d.loginId?true:false);d.lastLoginId=b("__last_loginid__");d.goTo=function(f,i){var h="_self";i=i||h;if(!c.util.ua.ie){return window.open(f,i)}var g=document.createElement("a"),e=document.body;g.setAttribute("href",f);g.setAttribute("target",i);g.style.display="none";e.appendChild(g);g.click();if(i!==h){setTimeout(function(){try{e.removeChild(g)}catch(j){}},200)}return};if(a.JSON){c.add("util-json")}})(jQuery);