/**
 * ����ģ���������ࣺӦ������һЩ����ģ�鲢������ҳ���ʼ����ʱ��ͼ��صģ�
 * ��������ҳ��ڵ��ع�ʱ���Ǵ�����ĳЩҳ���¼�ʱ����Ҫ�����ء�������ɵľ���
 * �Դ���ģ���ӳټ��ع��ܵ�ʵ�֣�����ʹ�ò�����վ�����ܡ�
 * @author terence.wangt
 * date:2012.01.30
 
   jEngine��ܽ����ĵ�: http://wd.alibaba-inc.com/doc/page/work/cbu-market/common/jEngine
 */
!(function($){
	
	var Sandbox,
		configs = {
		threshold:250,
		end:0
	};
	
	var _hasBind		= false;
	var _docBody 		= $(window);
	var _viewportHeight = 0;
	var _exposurePool   = [];
	var _manualPool 	= {};

	function LazyModule(sb) {

		Sandbox = sb;
		Sandbox.on("jEngine.lazyLoad", function(msg){LazyModule._handleManualEvent(msg)});
		return LazyModule;
	}
	//��ʵ����
	$.extend(LazyModule,{
	
			/**
			 * @param  els �����ӳټ���ģ���Ԫ�أ�������id��dom��domArray(jquery dom�������) {string|object|array}
			 * @param: event �ӳټ��ص������¼����������ع��¼���dom�¼���manual�¼���{exposure|manual|dom events like: click, mouseover, focus, mouseenter}
			 * @param: cfg (optional)�����ӳټ��صĲ����������Ӧ��threshold��{Object}
			 * @param: callback (optional)�ӳټ��سɹ���Ļص�����{Object}
			*/
			register:function(els, event, cfg, callback){

				var config = $.extend(true, {}, configs, cfg);
				
				if(els){
				
					var doms = $(els);
					if(!doms || doms.length==0 || !event){
						return false;
					}
					
					var self = this;
					if(event === "exposure"){				
						this._handleExposureEvent(doms, config, callback);
					}
					else{				
						var handle = function(e) {
							self._getModule(this, config, callback, event);
							doms.unbind(event, handle);
						};
						doms.bind(event, handle);
					}
				}
				else{
					if(event === "manual"){
						_manualPool[config.key] = [config, callback];
					}
				}
				
				return true;
			 },
			
			/**
			 * �����ع��ӳټ��ص�ģ��
			 */
			_handleExposureEvent:function(doms, cfg, callback){
			
				var els = this._pushToArray(doms, cfg, callback);
				this._uniqueMerge(_exposurePool,els);
								
				if(!_hasBind){
					_viewportHeight = this._getViewportHeight();
					this._bindExposureEvent();
				}
				this._loadModules();
			},
			
			
			/**
			 * ����manual�������ӳټ���ģ��
			 */
			_handleManualEvent:function(msg){
				
				if(msg.moduleId){
					var stack = _manualPool[msg.moduleId];
					if(stack){
						this._getModule(null, stack[0], stack[1]);
						delete _manualPool[msg.moduleId];
					}
				}
			},
			
			/**
			 * ��Ԫ�ؼ���Ӧ��callback��config��push��������
			 */
			_pushToArray:function(els, cfg, fn){
				var arr = [];
				
				if(!els.length){
					return arr;
				}
				for(var i=0;i<els.length;i++){
					arr.push([els[i], cfg, fn]);
				}
				return arr;
			},
			
			/**
			 * �ϲ����飬ȥ���ظ��
			 */
			_uniqueMerge:function(des,a){
				for(var i=0;i<a.length;i++){
					for(var j=0,len=des.length;j<len;j++){
						if(a[i] === des[j]){
							a.splice(i,1);
							break;
						}
					}
				}
				$.merge(des,a);
			},
			

			/**
			 * ���ع��¼���Ԫ����ҳ�����ع�ʱ���¼�����
			 */
			_bindExposureEvent:function(){
				if(_hasBind){
					return;
				}
				
				var self = this;
				_docBody.bind('scroll.lazymodule', function(e){
					self._exposureCall(self._loadModules, self);
				}); 
				_docBody.bind('resize.lazymodule', function(e){
					_viewportHeight = self._getViewportHeight();
					self._exposureCall(self._loadModules, self);
				});
				_hasBind = true;
			},
			
			/**
			 * �Ƴ��ع��¼�
			 */
			_removeEvent:function(){
				if(!_hasBind){
					return;
				}
				_docBody.unbind('scroll.lazymodule');
				_docBody.unbind('resize.lazymodule');
				_hasBind = false;
			},
						
			/**
			 * ���غ���
			 */
			_exposureCall:function(method, context){
				clearTimeout(method.tId);
				method.tId = setTimeout(function(){
					method.call(context);
				},100);
			},
			
			/**
			 * �����ع�ģ��
			 */
			_loadModules:function(){
			
				this._filter(_exposurePool, this._runCallback, this);
				//�������ģ����Ҫ�ӳټ��أ����Ƴ��ع��¼�
				if(_exposurePool.length===0){
					this._removeEvent();
				}
			},
		
			 /**
			 * ������Դ���飬��������������ع�ģ��ִ�м��أ������������Ƴ�
			 */
			_filter:function(array, method, context){
				var item;
				for(var i=0;i<array.length;) {
					item = array[i];
					if($.isArray(item) && this._checkPosition(item)){
						array.splice(i, 1);
						method.call(context,item);
						
						//��ֹͬһģ�鱻�ظ�����
						if(!item[1].keep){
							var moduleId = item[1].key;
							for(var j=0; j<array.length;){
								
								var ele = array[j];
								if(moduleId === ele[1].key ){
									array.splice(j, 1);
								}
								else{
									j++;
								}
							}
						}
					}
					else{
						i++;
					}
				}
			},
			/*
			 * ִ�лص�����
			 */
			_runCallback:function(arr){
				var el,fn,cfg;
			
				el 	= arr[0];
				cfg = arr[1];
				fn 	= arr[2];
				
				this._getModule(el, cfg, fn);
			},
			
			_getModule:function(el, cfg, fn, event){
				
				var self = this;
				var module = cfg.module;
				
				if(module){
					var moduleId = module.moduleId;
					$.add(moduleId, {
							js: module.js,
							css: module.css
					});
					if(fn){
						$.use(moduleId, function(){
							fn(el);
							if(event){
								self._dispatchEvent(el, event);
							}
						});
					}else{
						$.use(moduleId);
					}
				}else{
					if(fn){
						fn(el);
					}
				}
			},
			
			/**
			 * ��ȡ��ǰ�Ӵ��߶�
			 */
			_getViewportHeight:function(){
				return _docBody.height();
			},
			
			/**
			 * �ж�Ԫ���Ƿ��Ѿ����˿��Լ��صĵط�
			 */
			_checkPosition: function(el){
				var ret = false;
				var threshold = el[1].threshold ? el[1].threshold : configs.threshold;
				var currentScrollTop = $(document).scrollTop();
				var benchmark = currentScrollTop + _viewportHeight + threshold;

				var currentOffsetTop = ($(el).css("display")!=='none') ? $(el).offset().top : Number.POSITIVE_INFINITY;
				if(currentOffsetTop <= benchmark){
					ret = true;
				}
				return ret;
			},
			
			_dispatchEvent:function(dom, evt){
				
				try{
					 if( document.createEvent ){
						var evObj = document.createEvent('MouseEvents');
						evObj.initEvent(evt, true, false );
						dom.dispatchEvent(evObj);
					} else if( document.createEventObject ) {
						dom.fireEvent('on'+evt);
					}
					return true;
				}
				catch(e){
					return false;
				}
			},
			end:0
	});
	
	jEngine.Core.LazyModule = LazyModule;
	
})(jQuery);