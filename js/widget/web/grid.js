/**
 * Grid
 * @Author: ding.shengd 2011.09.27
 */
('Grid' in FE.ui) ||
(function($, UI, undefined){
   
	GridColModel = function(attrs){
		this.defaults = attrs.defaults;
		this.columns = attrs.columns;
		for(key in this.columns){
			if(!this.columns[key].width)
				this.columns[key].width = this.defaults.width;
			if( typeof this.columns[key].sortable == "undefined" || this.columns[key].sortable == null )
				this.columns[key].sortable = this.defaults.sortable;
		}
	}
	GridColModel.prototype = {
		push:function(o){
			this.columns.push(o);
		},
		get:function(){
			return this.columns;
		},
		_getSchemaBykey:function(keyId){
			var o = [];
			var i = 0;
			while(this.columns[i]){
				o[i] = this.columns[i][keyId];
				i++;
			}
			return o;
		},
		/**
		*  return {Array} [sex,age,birthday,name]
		*/
		getIdSchema:function(){
			return this._getSchemaBykey('id');
		},
		/**
		*  return {Object} {sex:{id:'sex',header: '�Ա�', dataIndex: 'sex',renderer:onRender},age:{id: 'age', header: '����', dataIndex: 'age'}}
		*/
		getIdColModelMap:function(){
			var o = {};
			for(key in this.columns){
				 o[this.columns[key].id] = this.columns[key];
			}
			return o;
		},
		/**
		*  return {Array} [sex,age,birthday,name]
		*/
		getDataIndexSchema:function(){
			return this._getSchemaBykey('dataIndex');
		}
	}
  
 /**
 * grid 
 * @class grid
 * @namespace FE.ui
 * @constructor
 * @param {String} id  grid������Id
 * @param {Object} attrs  �������� eg��{hasPagebar:true,limit:10}
 */
  
Grid = function(id,attrs) {
	this.id = id;
	this.attributes = attrs;
	
	/**
	*@field {Number} width  ���
	*/
	this.width =( this.attributes && this.attributes.width)?this.attributes.width:'100%';
	/**
	*@field {Number} height  �߶�,Ĭ�ϸ߶�Ϊ�����б�������Զ�����
	*/
	this.height =( this.attributes && this.attributes.height)?this.attributes.height:false;
	/**
	*@field {Number} limit  ��ҳ�� Ĭ��:10
	*/	
	this.limit = ( this.attributes && this.attributes.limit)?this.attributes.limit:10;
		/**
	*@field {Number} toPageNum  ��ʼ��ʾ�ڼ�ҳ��Ĭ���ǵ�һҳ Ĭ��:10
	*/	
	this.toPageNum = ( this.attributes && this.attributes.toPageNum)?this.attributes.toPageNum:1;
	/**
	*@field {Boolean} checkbox  �Ƿ���checkbox ,Ĭ��:false
	*/
	this.checkbox = ( this.attributes && this.attributes.checkbox)?this.attributes.checkbox:false;
	/**
	*@field {Boolean} hasPages  �Ƿ����ܹ�����ҳ ,Ĭ��:false
	*/
	this.hasPages = ( this.attributes && this.attributes.hasPages)?this.attributes.hasPages:false;
	/**
	*@field {Boolean} hasPagebar  �Ƿ��з�ҳ�� ,Ĭ��:true
	*/
	this.hasPagebar =( this.attributes && !(typeof this.attributes.hasPagebar == "undefined"|| this.attributes.hasPagebar ==null) && !this.attributes.hasPagebar)?this.attributes.hasPagebar:true;
	/**
	*@field {Boolean} isRowAuto  �Ƿ�������ݵ���Ŀ��ʾ������ ,Ĭ��:true
	*/
	this.isRowAuto =( this.attributes && !(typeof this.attributes.isRowAuto == "undefined"|| this.attributes.isRowAuto ==null) && !this.attributes.isRowAuto)?this.attributes.isRowAuto:true;
	/**
	*@field {Boolean} hasTips  �Ƿ���tips ,Ĭ��:true
	*/
	//this.hasTips =( this.attributes && !(typeof this.attributes.hasTips == "undefined"|| this.attributes.hasTips ==null) && !this.attributes.hasTips)?this.attributes.hasTips:true;
	
	/**
	*@field {String} defaultSort  Ĭ������ ,Ĭ��:false
	*/
	this.defaultSort =( this.attributes && this.attributes.defaultSort)?this.attributes.defaultSort:'';
	/**
	*@field {String} dir  ����˳�� ,Ĭ��:desc,asc
	*/
	this.dir =( this.attributes && this.attributes.dir)?this.attributes.dir:'desc';
	/**
	*@field {Boolean} 	  �Ƿ���Զ�ѡ ,Ĭ��:false
	*/
	this.multiSelect = ( this.attributes && this.attributes.multiSelect)?this.attributes.multiSelect:false;

	this.store = null;
	this.schema = null;
	this.colModel=null;
	
	/**
	*@field {Number} start ����̨��������ʱ���������ڷ�ҳ  ,Ĭ��0
	*/
	this.start = 0 ;

	/**
	*@field {Number} currentPage ��ǰҳ��Ĭ�ϵ�һҳ
	*/
	this.currentPage= 1;
	/**
	*@field {Number} totalCount  ȫ����������
	*/
	this.totalCount = 0;
	
	this._events = {};
	this.selectDatas = {};
	
}
Grid.prototype = {
	/**
	 * ��ʼ��Grid
	 * 
	 * @param {String} sUrl �����ַ
	 * @param {Object} oColModel ��ģ�� ���磺[	{
							header: '�ʼ�״̬',
							width: 80,
							dataIndex:'type',
							sortable: true
						},{
							header:'customerAddress',
							dataIndex: 'customerAddress',
							width: 68,
							sortable: true
							
						}]
	 * @param {Object} oSchema ����ģ�� ���磺['type','customerAddress']
	 */
	init:function(sUrl,oColModel,oSchema){
		var o = this;
		this.url = sUrl;
		this.schema = oSchema;
		if(this.checkbox){
			oColModel.push({id: 'checkbox',renderer:o._renderCheckBox});
			
			this.checkAll = $('#'+this.id+' input.xui-simpleGrid-hd-checkbox').eq(0);
			this.checkAll.bind('click',function(){
								if(o.checkAll.attr('checked')){
									o.selectAll();
								}else{
									o.cleanRow();
								}
			})

		}
		//��ģ��
		this.colModel = oColModel.get();
		//��ģ���е�id����
		this.idSchema = oColModel.getIdSchema();
		//��ģ���е�dataIndex����
		this.dataIndexSchema = oColModel.getDataIndexSchema();
		
		this.colModelMap = oColModel.getIdColModelMap();
		
		//ȫ���еĶ�������
		this.rowDoms = $('#'+this.id+' div.xui-simpleGrid-row'); //xui.util.Dom.getElementsByClassName('xui-simpleGrid-row','div',this.id);
		this._addRowDomsEvents();
		
		this.getHdDoms();
		this._addHdDomsEvents();
		this._renderHead();
		
		this.firstBtnDom = $('#'+this.id+' button.xui-pagebar-btn-first').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-first','button',this.id)[0];
		this.prevBtnDom = $('#'+this.id+' button.xui-pagebar-btn-prev').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-prev','button',this.id)[0];
		this.lastBtnDom = $('#'+this.id+' button.xui-pagebar-btn-last').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-last','button',this.id)[0];
		this.nextBtnDom = $('#'+this.id+' button.xui-pagebar-btn-next').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-next','button',this.id)[0];

		this.numberBtnDom = $('#'+this.id+' input.xui-pagebar-btn-number').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-number','input',this.id)[0];
		this.numberStartDom = $('#'+this.id+' span.xui-pagebar-start').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-start','span',this.id)[0];
		this.numberEndDom = $('#'+this.id+' span.xui-pagebar-end').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-end','span',this.id)[0];
		this.numberTotalDom = $('#'+this.id+' span.xui-pagebar-total').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-total','span',this.id)[0];
		this.numberGoDom = $('#'+this.id+' button.xui-pagebar-btn-go').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-btn-go','button',this.id)[0];
		
		this.numberTotalPages = $('#'+this.id+' span.xui-pagebar-pages').eq(0);//xui.util.Dom.getElementsByClassName('xui-pagebar-pages','span',this.id)[0];
		
		if(this.hasPagebar)
			this._initPageBar();
		this.toPage(this.toPageNum);
		
		
		//$(o).triggerHandler("oninit", [o,2,3]);
	},
	_renderCheckBox:function(v,os,rowIndex,g){
		var checked = v?'checked':'';
		//���checkbox�����¼���������Ⱦ�ͻ����¼�������ֻ��Ҫ���¸�checkbox��ֵ�Ϳ�����
		var cbDom = $('#xui-simpleGrid-'+g.id+'-'+rowIndex).get(0);
		if(cbDom){
			cbDom.checked = checked;
		}else{
			return '<input id="xui-simpleGrid-'+g.id+'-'+rowIndex+'" name="" class="xui-simpleGrid-row-checkbox" type="checkbox" value="" '+checked+' />';
		}
	},
	/**
	* 	 @return {Object} {sex:	HTMLElement , age:HTMLElement} 
	*/
	getHdDoms:function(){
		var o =this;
		if(! this.hdDoms){
			this.hdDoms = {};
			//var hdBodyDom = xui.util.Dom.getElementsByClassName('xui-simpleGrid-header','div',this.id)[0];
			//for(key in this.idSchema){
				//����
				//this.hdDoms[this.idSchema[key]] = $('#'+this.id+' .xui-simpleGrid-header td.xui-simpleGrid-hd-'+this.idSchema[key]).eq(0);
			//}
			
			$.each(this.idSchema,function(key,value) {
				o.hdDoms[value] = $('#'+o.id+' .xui-simpleGrid-header td.xui-simpleGrid-hd-'+o.idSchema[key]).eq(0);
			});
		}
		return this.hdDoms;
	},
	/**��Ⱦͷ��
	*
	*
	*/
	_renderHead:function(){
		for(key in this.hdDoms){
			if(key != 'checkbox'&&key != 'undefined'){
				if(typeof this.hdDoms[key] != "undefined"){
					var hdDomDiv = $('div.xui-simpleGrid-hd-inner', this.hdDoms[key]).get(0);
					var hdInnerHTML = this.colModelMap[key].header ;
					hdDomDiv.innerHTML =hdInnerHTML +'<button  class="xui-simpleGrid-sort" ></button>';
				}
			}
		}
	
	},
	//��Ĭ��ͷ���¼�
	_addHdDomsEvents:function(){
		var o =this;
		for(key in this.colModelMap){
			if(this.colModelMap[key].sortable  == true){
				if(this.hdDoms[key]){
					this.hdDoms[key].addClass('xui-simpleGrid-sort-default');
					this.hdDoms[key].bind('click',{hdId: key},function(event){
						var hdId = 	event.data.hdId;	
						o.sort(hdId);
					})
				}
			}
		}
	},
	_addCheckBoxEvent:function(){
		var o =this;
		
		$.each(o.rowDoms,function(key,value) {
			if($('#xui-simpleGrid-'+o.id+'-'+key).get(0)){
				var p = $('#xui-simpleGrid-'+o.id+'-'+key).parent();
				p.bind('click',function(event){ event.stopPropagation();});
				p.parent().bind('click',function(event){ event.stopPropagation();});
			}
				
			$('#xui-simpleGrid-'+o.id+'-'+key).bind('click',{rowIndex:key,obj:o},function(event){
				var rowIndex = event.data.rowIndex;	

				var o = event.data.obj;	
				$(o).triggerHandler("checkboxclick", [o.rowDatas[rowIndex]]);
				
				if($('#xui-simpleGrid-'+o.id+'-'+rowIndex).attr('checked')){
					o.selectRowByIndex(rowIndex);
				}else{
					o.unselectRowByIndex(rowIndex);
				}
				//ȡ��ð�ݣ���ֹ����click�¼�
				//return false;
				 event.stopPropagation();

			});
		
		});
	},

	//��Ĭ�����¼�
	_addRowDomsEvents:function(){
		var o =this;
		$.each(o.rowDoms,function(key,value) {
			o.rowDoms.eq(key).bind({
					click:function(event){
						var rowIndex = event.data.rowIndex;	
						if(o._isInDatasRow(rowIndex)){
							if(!o.multiSelect){
								o.cleanRow();
							}
							//��ѡģʽ������ʱ�򣬵�����ѡ�У��ٵ�����ѡ��
							if(o.multiSelect){
								if($('#xui-simpleGrid-'+o.id+'-'+rowIndex).attr('checked')){
									o.unselectRowByIndex(rowIndex);
								}else{
									
									o.selectRowByIndex(rowIndex);
								}
							}else{
								o.selectRowByIndex(rowIndex);
							}
							if(o.rowDatas){
								$(o).triggerHandler("rowclick", [o.rowDatas[rowIndex]]);
							}
						}
					
					}				
			},{rowIndex:key});
			
			o.rowDoms.eq(key).bind('dblclick mouseenter mouseleave',{rowIndex:key},function(event){
					var rowIndex = event.data.rowIndex;	
					var type = event.type;
					if(o._isInDatasRow(rowIndex)){
						
							switch (type){
								case 'dblclick':
									if(o.rowDatas){
										$(o).triggerHandler('rowdblclick',[o.rowDatas[rowIndex]]);
									}
									break;
								case 'mouseenter':
									o.hoverRowByIndex(rowIndex);
									if(o.rowDatas){
										$(o).triggerHandler('rowmouseover',[o.rowDatas[rowIndex]]);
									}
									break;
								case 'mouseleave':
									o.unhoverRowByindex(rowIndex);
									if(o.rowDatas){
										$(o).triggerHandler('rowmouseout',[o.rowDatas[rowIndex]]);
									}
									break;
								
							
						}
					}
			});
		});
	},
	_initPageBar:function(){
		var o =this;
		this.firstBtnDom.bind('click',function(){
			o.toFirstPage();
			});
		this.prevBtnDom.bind('click',function(){
			o.toPrevPage();
			});
		this.lastBtnDom.bind('click',function(){
			o.toLastPage();
			});
		this.nextBtnDom.bind('click',function(){
			o.toNextPage();
			});
		this.numberGoDom.bind('click',function(){
			o.toNumberBtnPage();
			});
		//�س��¼�
		this.numberBtnDom.bind('keydown',function(event){
			if(event.keyCode == 13){
				o.toNumberBtnPage();
			}
			});
	},
	//�жϴ�row�Ƿ�����������
	_isInDatasRow:function(rowIndex){
		return (this.rowDatas && this.rowDatas[rowIndex])?true:false;
	},
	
	/**
	 * �����л�
	 * 
	 * @param {String} hdId �е�ID
	 * @param {String} dir ����ʽ 'desc'��'asc'
	 */	
	_dirSwitch:function(hdId,dir){
		
		if(this.currentHdId){
			this.hdDoms[this.currentHdId].removeClass('xui-simpleGrid-sort-asc xui-simpleGrid-sort-desc');
			this.hdDoms[this.currentHdId].addClass('xui-simpleGrid-sort-default');
	
		}
		//�л������ֶ�ʱ��ʼ����˳��Ϊ����ѯ�̹����������룩by eric.yangl
		if(this.currentHdId!=hdId){
			if(this.dir && this.dir == 'desc'){
				this.dir = 'asc';
			}
		}
		//ǿ���ƶ�����ʽ
		if(dir && dir == 'desc'){
			this.dir = 'asc';
		}else if(dir && dir == 'asc'){
			this.dir = 'desc';
		}
		
		if(this.dir == 'desc'){
			this.dir = 'asc';
			this.hdDoms[hdId].removeClass('xui-simpleGrid-sort-default xui-simpleGrid-sort-asc');
			this.hdDoms[hdId].addClass('xui-simpleGrid-sort-asc');
		}
		else if(this.dir == 'asc'){
			this.dir = 'desc';
			this.hdDoms[hdId].removeClass('xui-simpleGrid-sort-default xui-simpleGrid-sort-asc');
			this.hdDoms[hdId].addClass('xui-simpleGrid-sort-desc');
		}
		//��ǰ�����hdId
		this.currentHdId = hdId;
	},
	/**
	 * ָ��������	
	 * 
	 * @param {String} hdId �е�ID
	 * @param {String} dir ����ʽ 'desc'��'asc',
	 * @param {String} beFirst �����Ƿ�ص���һҳ��Ĭ��Ϊfalse
	 */	
	sort:function(hdId,dir,beFirst){
		var o = this;
		this.defaultSort = hdId;
		this._dirSwitch(hdId,dir);
		if(beFirst && beFirst == true){
			this.reload()
		}else{
			this.load();
		}
		
		$(o).triggerHandler('sort',[hdId]);
	},
	/**
	* * ����dataSource��baseParams,�����ص�һҳ
	*/
	reload:function(oParams){
		if(oParams)
			this.setParams(oParams);
		this.toFirstPage();
	},
	/**
	*
	*/
	load:function(){
		this.toPage(this.currentPage);
	},
	/**
	*ѡ��ȫ����
	*/
	selectAll:function(){
		var l = this.rowDoms.length;
		for(var i = 0 ;i<l;i++){
			this.selectRowByIndex(i);
		}
/*		for(key in  this.rowDoms){
			this.selectRowByIndex(key);
		}*/
		if(this.checkbox){
			//this.checkAll.checked = true;
			this.checkAll.attr('checked',true);
		}
	},
	/**
	 * ѡ��ָ����	//�����ʾ�����ݱ�limit�٣���Щ�е��¼���Ҫ���⴦��
	 * 
	 * @param {Number} rowIndex �к�
	 */	
	selectRowByIndex:function(rowIndex){
		var o =this;
		if ( this.rowDatas && ! (rowIndex>(this.rowDatas.length-1))){
			
			this.rowDoms.eq(rowIndex).addClass('xui-simpleGrid-row-selected');
			this.selectRowIndex = rowIndex;
			
			$(o).triggerHandler('rowselect',[this.rowDatas[rowIndex]]);
			//����ѡ�е�����
			this._registerSelectData(rowIndex);
			//�������checkbox��Ҫ����
			if(this.checkbox){
				if($('#xui-simpleGrid-'+this.id+'-'+rowIndex).get(0)){
					$('#xui-simpleGrid-'+this.id+'-'+rowIndex).attr('checked',true);
				}
			}
		}
	},
	/**
	*�õ�ѡ�к���к�
	*/
	getSelectRowIndex:function(){
		if(this.selectRowIndex)
			return this.selectRowIndex;
	},
	/**
	*�õ�����ƶ���ȥ���к�
	*/
	getMouseoverRowIndex:function(){
		if(this.mousoverRowIndex)
			return this.mousoverRowIndex;
	},
	/**
	*ȡ��ѡ�����
	*/
	unselectRowByIndex:function(rowIndex){
		var o =this;
		if ( this.rowDatas && ! (rowIndex>(this.rowDatas.length-1))){
			this.rowDoms.eq(rowIndex).removeClass('xui-simpleGrid-row-selected');
			$(o).triggerHandler('unrowselect',[this.rowDatas[rowIndex]]);
			this._unRegisterSelectData(rowIndex);
			if(this.checkbox){
				if($('#xui-simpleGrid-'+this.id+'-'+rowIndex).get(0)){
					$('#xui-simpleGrid-'+this.id+'-'+rowIndex).attr('checked',false);
				}
			}

		}
			
	},
	/**
	*���ȫ��ѡ��
	*/
	cleanRow:function(){
		//for(key in  this.rowDoms){
			//this.unselectRowByIndex(key);
			//xui.util.Dom.removeClass(this.rowDoms[key],'xui-simpleGrid-row-selected');
			
		//}
		var l = this.rowDoms.length;
		for(var i = 0 ;i<l;i++){
			this.unselectRowByIndex(i);
		}
		if(this.checkbox){
			this.checkAll.attr('checked',false);
		}
	},
	hoverRowByIndex:function(rowIndex){
		this.mousoverRowIndex = rowIndex;
		this.rowDoms.eq(rowIndex).addClass('xui-simpleGrid-row-hover');
	},
	unhoverRowByindex:function(rowIndex){
		this.mousoverRowIndex = null;
		this.rowDoms.eq(rowIndex).removeClass('xui-simpleGrid-row-hover');
	},
	/**
	 * ����dataSource�Ĳ���
	 * @param {Object} oParames ���磺{stateType: 'abc',sType:1}�ᴫ��Щ������ֵ����̨
	 */
	setParams:function(oParams){
		if(oParams){
			for(var k in oParams){
				oParams[k] = encodeURIComponent(oParams[k]);
			}
			this.params= oParams;
		}
	},
	_getParamsString:function(){
		var str = '';
		for(k in this.params){
			if(k == 'defaultSort'){
				this.defaultSort = this.params[k];
			}else if(k == 'dir'){
				this.dir = this.params[k];
			}else if(k == 'limit'){
				this.limit = this.params[k];
			}else{
				str +=  '&'+k +'='+this.params[k]+'';
			}
		}
		return str;
	},

	toPage:function(pageNumber){
		this.cleanRow();
		var start = (pageNumber-1)*this.limit;
		
		//��������id���ڣ���Ϊ�п��������id����scheme���У���id��û�У���ô�Ͳ���Ҫ��ʵ�������ʽ��
		if(this.colModelMap[this.defaultSort])
			this._dirSwitch(this.defaultSort,this.dir);
		
		this._getData(start);
		
		this.currentPage = parseInt(pageNumber,10);
	},
	//�Ƿ�������һ���͵�һ����ť
	_isHiddenPreButton:function(isHidden){
		if(this.firstBtnDom.get(0)){
			this.firstBtnDom.attr('disabled',isHidden);
		}
		if(this.prevBtnDom.get(0)){
			this.prevBtnDom.attr('disabled',isHidden);
		}
		if(isHidden){
			this.firstBtnDom.addClass('xui-pagebar-btn-first-disabled');
			this.prevBtnDom.addClass('xui-pagebar-btn-prev-disabled');
		}else{
			this.firstBtnDom.removeClass('xui-pagebar-btn-first-disabled');
			this.firstBtnDom.addClass('xui-pagebar-btn-first');
			this.prevBtnDom.removeClass('xui-pagebar-btn-prev-disabled');
			this.prevBtnDom.addClass('xui-pagebar-btn-prev');
		}
	},
	//�Ƿ�������һ�������һ����ť
	_isHiddenNextButton:function(isHidden){
		if(this.lastBtnDom.get(0)){
			this.lastBtnDom.attr('disabled',isHidden);
		}
		if(this.nextBtnDom.get(0)){
			this.nextBtnDom.attr('disabled',isHidden);
		}
		if(isHidden){
			this.lastBtnDom.addClass('xui-pagebar-btn-last-disabled');
			this.nextBtnDom.addClass('xui-pagebar-btn-next-disabled');
		}else{
			this.lastBtnDom.removeClass('xui-pagebar-btn-last-disabled');
			this.lastBtnDom.addClass('xui-pagebar-btn-last');
			this.nextBtnDom.removeClass('xui-pagebar-btn-next-disabled');
			this.nextBtnDom.addClass('xui-pagebar-btn-next');
		}
	},
	_rendPageBar:function(){
		var start = (this.currentPage-1)*this.limit;
		if( this.isFirstPage(this.currentPage) && this.isLastPage(this.currentPage)){
			this._isHiddenPreButton(true);
			this._isHiddenNextButton(true);
		}else if(this.isFirstPage(this.currentPage)){
			this._isHiddenPreButton(true);
			this._isHiddenNextButton(false);
			
		}else if(this.isLastPage(this.currentPage)){
			this._isHiddenNextButton(true);
			
			this._isHiddenPreButton(false);
		}else{
			this._isHiddenPreButton(false);
			this._isHiddenNextButton(false);
		}
		if(this.hasPagebar){
			if(this.numberBtnDom.get(0)){
				this.numberBtnDom.attr('value', this.currentPage);
			}
			if(this.numberStartDom.get(0)){
				if(this.totalCount == 0){
					this.numberStartDom.html('0');
				}else{
					this.numberStartDom.html(start+1);
				}
			}
			if(this.numberEndDom.get(0)){
				//���ÿҳ��ĿС�����������������һҳ
				if( this.limit>this.totalCount || (this.isLastPage()) )
					this.numberEndDom.html(this.totalCount);
				else {
					this.numberEndDom.html(start+this.limit);
				}
			}
			//�Ƿ�����ҳ����ʾ
			if(this.hasPages && this.numberTotalPages.get(0)){
				var lastPage = Math.ceil(this.totalCount/this.limit);
				this.numberTotalPages.html( lastPage);
				
			}

		}
	},
	_initSore:function(){
		
	},
	/**
	*
	*/
	_getData:function(start){
		var defaultParms= 'start='+start+'&sort='+(this.defaultSort?this.defaultSort:'')+'&dir='+(this.dir?this.dir:'')+'&limit='+(this.limit?this.limit:'');
		var parms = ''
		if(this.params){
			parms = this._getParamsString();
		}
		var o = this;
		try{
            $.ajax({
                type: "POST",
                dataType: 'json',
                url: this.url,
                data: defaultParms + parms,
                success: function(res) {
                    o.store = res;
                    
                    if (res.isSuccess === false) {
                        $(o).triggerHandler('dserror', [res.message]);
                    } else {
                        o._rendData(res);
                    }
                    
                },
                error: function() {
                    $(o).triggerHandler('ajaxerror');
                }
            });
		}catch(e){};
	},
	/**
	*�������ݵ���Ŀ��ʾ������
	*/
	_cleanRow:function(l){
		var rowdomsL = this.rowDoms.length;
		for(var i = 0 ;i<rowdomsL;i++){
			this.rowDoms.eq(i).css('display' ,(i>=l)? 'none':'block'); 
		}
	},
	_rendData:function(o){
		this.rowDatas = o.data;
		this.totalCount = o.totalCount;
		if(this.hasPagebar && this.numberTotalDom.get(0)){
			this.numberTotalDom.html( this.totalCount);
		}
		//���û�����ݣ��ص�ǰһҳ
		var l = this.rowDatas.length;

		this.dataRowDoms = this.rowDoms;
		
		//�������ݵ���������this.limit�����ݣ�ֻ����Ⱦthis.limit������
		l = (l>this.limit)? this.limit : l;
		
		//�������ݵ���Ŀ��ʾ������
		if(this.isRowAuto)
			this._cleanRow(l);
		
		for(var i = 0; i<l;i++){
			this.setRowData(i,this.rowDatas[i]);
		}
		//������ݱ�ÿҳ�������٣�����Ҫɾ����ǰһҳδ�����ǵ�����
		if(this.limit>l){
			this.dataRowDoms = this.rowDoms.slice(0,l);
			for(var j = l;j<this.limit;j++){
				this.cleanRowData(j);
			}
		}
		//��checkbox�¼�
		if(this.checkbox){
			this._addCheckBoxEvent();
		}
		if(this.hasPagebar)
			this._rendPageBar();
		
		var o = this;
		$(o).triggerHandler('dsload',[o]);
		
		if(l==0){
			this.toPrevPage();
			return ;
		}
	},
	/**
	 * ����һ�����������
	 * 
	 * @param {Number} rowIndex �к�
	 * @param {Object} {sex:"1",age:"2222123",birthday:"2008-10-11",name:"1111",status:"1"}
	 */	
	setRowData:function(rowIndex,rowData){
		//��������
		for(var p in rowData){
            this.rowDatas[rowIndex][p] = rowData[p];
    	}
		
		var l = this.idSchema.length;
		for(var i = 0 ;i<l ;i++){
			//����id�õ�dataIndex��Ȼ���ȡ��Ӧ��ֵ,�п���û��dataIndex,
			var v = '';
			if(this.colModelMap[this.idSchema[i]].dataIndex ){
				 v = this.rowDatas[rowIndex][ this.colModelMap[this.idSchema[i]].dataIndex ];
			}
			//������checkboxѡ�е�ʱ��ʱ��
			if(this.checkbox && this.idSchema[i] == 'checkbox'){
				if($('#xui-simpleGrid-'+this.id+'-'+rowIndex).get(0)){
					v = $('#xui-simpleGrid-'+this.id+'-'+rowIndex).attr('checked');
				}
			}
			this.setCellData(rowIndex,this.idSchema[i],v);
		}
	},
	/**���row���������
	*
	* @param {Number} rowIndex �к�
	*/
	cleanRowData:function(rowIndex){
		if(this.idSchema.length){
			 for(var i=0; i<this.idSchema.length; i++){
				this.cleanCellData(rowIndex,this.idSchema[i]);
			 }
		}else{
			for(key in this.idSchema){
				this.cleanCellData(rowIndex,this.idSchema[key]);
			}
		}
	},
	/**
	 * ����cell���������
	 * 
	 * @param {Number} rowIndex �к�
	 * @param {String} colId �е�id
	 * @param {String} v Ҫ���õ�ֵ
	 */	
	setCellData:function(rowIndex,colId,v){
		
		if(this.getCellTextDomByIndex(rowIndex,colId).get(0)){
			//����Ⱦ�������У���Ҫ������Ⱦ��������Ⱦ��Ԫ��
			if(this.colModelMap[colId].renderer){
				
			//var h,h1;
			//h = (h1 = a())?h1:false;
				//if(this.colModelMap[colId].renderer(v,this.rowDatas[rowIndex],rowIndex,this))
				try{
					var h = this.colModelMap[colId].renderer(v,this.rowDatas[rowIndex],rowIndex,this);
					if(h)
						this.getCellTextDomByIndex(rowIndex,colId).html(h);
				}catch(e){}
			}else{
				var fv = jQuery.util.escapeHTML(v);
				this.getCellTextDomByIndex(rowIndex,colId).html((typeof fv == "undefined"|| fv ==null) ? '' : fv);
				this.getCellTextDomByIndex(rowIndex,colId).attr('title', v);
			}
			if(this.colModelMap[colId].align)
				this.getCellTextDomByIndex(rowIndex,colId).css('textAlign' ,this.colModelMap[colId].align);
		}
		

	},
	/**���cell���������
	*
	* @param {Number} rowIndex �к�
	* @param {String} colId �е�id
	**/
	cleanCellData:function(rowIndex,colId){
		if(this.getCellTextDomByIndex(rowIndex,colId))
			this.getCellTextDomByIndex(rowIndex,colId).empty();
	},
	/**
	 * ��ȡ���ص����ݶ���
	 * 
	 * @return {Object}
	 */
	getStore:function(){
		return this.store;
	},
	/**
	 * �����кŵõ��е�jquery����
	 * 
	 * @param {Number} rowIndex �к�
	 * @return {Object} jquery 
	 */	
	getRowDomByIndex:function(rowIndex){
		return this.rowDoms.eq(rowIndex);
	},
	/**
	 * �����кź��е�id�õ�һ���jquery����
	 * 
	 * @param {Number} rowIndex �к�
	 * @param {String} colId �е�id
	 * @return {Object} HTMLElement 
	 */	
	getCellDomByIndex:function(rowIndex,colId){
		var rowDom = this.getRowDomByIndex(rowIndex);
		var cellDom =  $('td.xui-simpleGrid-col-'+colId,rowDom).eq(0);
		return cellDom;
	},
	/**
	 * �����кź��е�id�õ�һ���text jquery����
	 * 
	 * @param {Number} rowIndex �к�
	 * @param {String} colId �е�id
	 * @return {Object} HTMLElement 
	 */	
	getCellTextDomByIndex:function(rowIndex,colId){
		var cellDom =  this.getCellDomByIndex(rowIndex,colId);

		var cellTextDom = cellDom.children().eq(0);
		return cellTextDom;
	},
	getSelect:function(){
		var o = [];
		var i = 0;
		for(key in this.selectDatas){
			o[i] = this.selectDatas[key];
			i++;
		}
		return o;
	},
	_registerSelectData : function(rowIndex){
        this.selectDatas['rowIndex'+rowIndex] = this.rowDatas[rowIndex];
  	},
	_unRegisterSelectData:function(rowIndex){
		 delete this.selectDatas['rowIndex'+rowIndex];
	},
	/**��������ת����������*/
	_tranData:function(){
		
	},
	toNextPage:function(o){
		var page = this.currentPage+1;
		this.toPage(page);
	},
	toPrevPage:function(){
		var page =this.currentPage-1;
		if(page < 1){
			return ;
		}
		this.toPage(page);
	},
	toFirstPage:function(){
		this.toPage(1);
	},
	toLastPage:function(){
		var lastPage = Math.ceil(this.totalCount/this.limit);
		this.toPage(lastPage);
	},
	toNumberBtnPage:function(){
		var num = jQuery.trim(this.numberBtnDom.attr('value'));
		var lastPage = Math.ceil(this.totalCount/this.limit);
		if(num>0 && num<=lastPage)
			this.toPage(num);
	},
	isFirstPage:function(){
		return (this.currentPage ==1)?true:false;
	},
	isLastPage:function(){
		//����ܹ���0�����ݣ����һҳҲ��1
		var lastPage = Math.ceil(this.totalCount/this.limit);		
		lastPage = (lastPage == 0) ? 1: lastPage;
		return (this.currentPage ==lastPage)?true:false;
	},
	/**
	*��ȡ��ǰҳ��
	*@return {Number}  
	*/
	getCurrentPage:function(){
		return this.currentPage;
	},
	/**
	*��ȡ��������
	*@return {Number}  
	*/
	getTotalCount:function(){
		return this.totalCount;
	},
	/**
	*��ȡ��ǰҳ������
	*@return {Number}  
	*/
	getPageCount:function(){
		return (this.rowDatas)? (this.rowDatas.length) :0;
	}
	
}   
   

    UI.Grid = Grid;
	UI.Grid.GridColModel =GridColModel;
    $.add('web-grid');
})(jQuery, FE.ui);
