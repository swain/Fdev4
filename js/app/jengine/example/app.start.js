/**
 * ģ����ع����࣬��������ģ���ע�ἰӦ�ó���ĳ�ʼ����ڡ�
 * ģ��ļ��ط�Ϊ���ࣺ
 * 1�� ҳ��loadʱ����Ҫ�����أ�����Ҫ����ִ�г�ʼ����ģ�顣									-- ��������ģ��(NormalModule)
 * 2�� ҳ��loadʱ����Ҫ�����أ�������Ҫ����ִ�г�ʼ�������Ǻ���ͨ���¼������ų�ʼ����ģ�顣 -- �ӳٳ�ʼ��ģ��(LazyInitModule)
 * 3�� ҳ��load��ɺ�ͨ���¼��������ص�ģ�飬Ʃ�� �ع��¼���click�¼���mouseover�¼��ȡ�  -- �ӳټ���ģ��(LazyLoadModule)
 * 
 * ��������ģ�鶼�ڴ�����ͳһ�������ע��ͳ�ʼ���Ĵ����ڴ�������ɡ�
 
 * @author terence.wangt
 * date:2012.02.01
 */
!(function($){
	
	var AppCore,
		configs = {
		lazyurl:Searchweb.Config.LazyModule,
		end:0
	};
	
	function AppStart() {
		return AppStart;
	}
	
	$.extend(AppStart,{
				
			init:function(cfg){
			
				AppCore = jEngine.Core.AppEntity;
				
				this.config = $.extend(true, {}, configs, cfg);
				
				this.firstViewModuleInit();
				this.lazyLoadModuleInit();
				this.lazyInitModuleInit();
			},
			
			/**
			* ���е���ͨģ���ע�ἰ��ʼ�����������ڴ˺����С�
			* Ĭ������£���ͨģ��ע��ʱ�������Զ���ʼ��������ı�Ĭ��ֵ����config�����{init:true}����
			*/
			firstViewModuleInit:function(){
				
				AppCore.register("mod-search-module1", "Searchweb.Business.Module1");
				AppCore.register("mod-search-module2", "Searchweb.Business.Module2", {callback:function(){}});
				AppCore.startAll();
			},
			
			
			/**
			* ���е��ӳټ���ģ���ע�ἰ��ʼ�����������ڴ˺����С�
			* a. Ĭ������£��ӳټ���|��ʼ��ģ��ע��ʱ���Զ�����ģ��ĳ�ʼ������������ı�Ĭ��ֵ����config�����{inti:false}����
			* b. �����Ԫ��ע��Ϊͬһģ��Ĵ���Ԫ��ʱ��application core���Կ���ֻ����һ��ģ�飬����ʱ�Ƴ��¼���
			* c. �뱣��ͳһ��ע�᷽ʽ�������ҵ���߼�����뵽��Ӧģ���У��˴�ֻ������غͳ�ʼ����
			*/
			lazyLoadModuleInit:function(){

				AppCore.lazyRegister("mod-search-lazyload1", "Searchweb.Business.lazyloadModule1", 
					$(".domDetail"), 'exposure',{
					threshold:200,
					module:this.config.lazyurl.lazyModule1
				});
				
				AppCore.lazyRegister("mod-search-lazyload2", "Searchweb.Business.lazyloadModule2", 
				   '#mod-search-lazyload2', 'mouseover',{
					module:this.config.lazyurl.lazyModule2
				});
				
				//����һЩ�첽�����Ľڵ㣬ҳ���ʼ����ʱ�����޷�ע���¼��ġ�����ṩ��һ��ʹ�ô��봥��
				//��ģ��ע�᷽ʽ���ڴ�����ģ������е���Sandbox.notify("jEngine.lazyload", {moduleId:"id***"})���ɴ���ģ�����;
				AppCore.lazyRegister("mod-search-lazyload3", "Searchweb.Business.lazyloadModule1", 
					null, 'manual',{
					module:this.config.lazyurl.lazyModule1
				});
				
				//bigRender�Ż�������ԭ����ο� http://lifesinger.wordpress.com/2011/09/23/bigrender-for-taobao-item/
				 AppCore.lazyRegister("mod-search-bigrender1", "Searchweb.Business.bigRender1", 
					"#mod-search-bigrender1", 'exposure',{
					threshold:200,
					module:this.config.lazyurl.bigRender1
				});
			},
			
			
			/**
			* ���е��ӳٳ�ʼ����ģ���ע�ἰ��ʼ�����������ڴ˺����С�
			* a. Ĭ������£��ӳټ���|��ʼ��ģ��ע��ʱ���Զ�����ģ��ĳ�ʼ������������ı�Ĭ��ֵ����config�����{init:false}����
			* b. �����Ԫ��ע��Ϊͬһģ��Ĵ���Ԫ��ʱ��application core���Կ���ֻ����һ��ģ�飬����ʱ�Ƴ��¼���
			* c. �뱣��ͳһ��ע�᷽ʽ�������ҵ���߼�����뵽��Ӧģ���У��˴�ֻ������غͳ�ʼ����
			*/
			lazyInitModuleInit:function(){
								
				AppCore.lazyRegister("mod-search-lazyinit", "Searchweb.Business.lazyInitModule", '#delayInitBtn', 'click');
				
				//��ʾ���ע���ģ��Ļص������� ��Ҫ����callback������ ���ϣ�����Ƴ������¼��������keep=true������
				AppCore.lazyRegister("mod-search-lazyinit2", null, $('#content img[data-lazyload-src]'), 'exposure',{
					
					keep:true,
					callback:function(el){
						src = $(el).attr('data-lazyload-src');
						if(src){
							$(el).attr('src',src);
							$(el).removeAttr('data-lazyload-src');
						}
					}
				});
			},
			end:0
	});
	
	Searchweb.Business.AppStart = AppStart;
	
	
	//SearchwebӦ�õ���ں���
	 jEngine.Core.Loader.ready(function(){
		Searchweb.Business.AppStart.init();
	});
	
})(jQuery);

