/*
 * jQuery UI Dialog 1.0
 *
 * Copyright 2011, AUTHORS.txt (http://jqueryui.com/about)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * http://docs.jquery.com/UI/Sortables
 *
 * overwrite by Denis 2011.01.30
 * example:
 * 		[var dialog1 = ]$('#pop1').dialog({
 * 			center: false,
 * 			modal: false
 * 		});
 * 		dialog1.dialog('close');
 * 		$('#pop1').dialog('close');
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 * @Author Denis
 * @Update Lizhen.tanglz 2011.03.22 �޸�IE6�¶��ĵ������޷��ڸ���ȫ��BUG
 * @Update Denis 2011.06.16 �޸���������¼�ʧЧ��BUG
 * @Update Denis 2011.06.20 �޸���IE���¼�Ŀ����HTMLʱʧЧ��BUG
 */
('dialog' in jQuery.fn) ||
(function($, undefined){
    var ie6 = $.util.ua.ie6, zIndex = 1000;
    $.widget('ui.dialog', {
        options: {
            // z-index for the dialog & overlay
            //zIndex: 1000,
            fixed: false,
            center: false,
            //bgiframe: false,
            // styles for the overlay
            modalCSS: {
                backgroundColor: '#000',
                opacity: 0.3
            },
            // styles for the content
            css: {
                left: 0,
                top: 0
            },
            // fadeIn time in millis; set to 0 to disable fadeIn on block
            fadeIn: false,
            // fadeOut time in millis; set to 0 to disable fadeOut on unblock
            fadeOut: false,
            // disable if you don't want to show the overlay
            modal: true,
            draggable: false,
            // �Զ��ر�ʱ��
            timeout: 0
            // if true, focus will be placed in the first available input field when
            // page blocking
            // focusInput: true,
            //open: $.noop,
            //after: $.noop
        },
        _create: function(){
            //noformat
            var self = this,
				o = self.options,
				elem = self.widget(), 
				contentLyr;
			//format
            //init content positon
            self.position = {
                left: o.css.left,
                top: o.css.top
            };
            
            //save current dialog
            if (elem[0].style) {
                self.elementDisplay = elem[0].style.display;
                self.elementPosition = elem[0].style.position;
            }
            self.elementParent = elem.parent();
            
            if (ie6) {
                $('input:checkbox,input:radio', elem).each(function(){
                    this.defaultChecked = this.checked;
                });
            }
            
            //prepare for content
            //noformat
            contentLyr = (self.contentLyr = $('<div>', {
                'class': 'ui-dialog',
                css: $.extend({
                    display: 'none',
                    position: (!ie6 && o.fixed) ? 'fixed' : 'absolute'
                }, o.css||{})
            })
			.appendTo('body')
			.append(elem.show()));
			//format
            //prepare for overlay
            if (o.modal) {
                //�������ֲ�
                $.ui.dialog.overlay.create(self);
                // prevent tabbing out of modal dialogs
                //Ϊ�����������z-index Ϊ�˴���modal��z-index
                contentLyr.css('z-index', zIndex++).bind('keydown.ui-dialog', function(event){
                    if (event.keyCode !== $.ui.keyCode.TAB) {
                        return;
                    }
                    var tabbables = $(':tabbable', this), first = tabbables.filter(':first'), last = tabbables.filter(':last');
                    
                    if (event.target == last[0] && !event.shiftKey) {
                        first.focus(1);
                        return false;
                    }
                    else if (event.target === first[0] && event.shiftKey) {
                        last.focus(1);
                        return false;
                    }
                });
                //format    
            }
            else {
                contentLyr.css('z-index', zIndex++);
                if (o.bgiframe) {
                    contentLyr.bgiframe();
                }
            }
            //popup
            if (ie6) {
                //$('html,body').css('height', '100%');
                //bind window event
                if (o.fixed) {
                    $(window).bind('scroll.ui-dialog', $.proxy(function(event){
                        this._offsetContent();
                    }, self));
                }
            }
            if (o.fadeIn) {
                self.isAnimated = true;
                contentLyr.fadeIn(o.fadeIn, function(){
                    self.isAnimated = false;
                    self._trigger('open');
                });
            }
            else {
                contentLyr.show();
                self._trigger('open');
            }
            
            if (o.center) {
                self._center();
                //bingd window event
                if (o.fixed) {
                    $(window).bind('resize.ui-dialog', $.proxy(self, '_center'));
                }
            }
            else {
                self._offsetContent();
            }
            if (o.draggable && $.fn.draggable) {
                self._makeDraggable();
            }
            
            if (o.timeout) {
                self.timeout = setTimeout($.proxy(self, 'close'), (o.fadeIn || 0) + o.timeout);
            }
        },
        destroy: function(){
            //noformat
            var self = this,
				o = self.options, 
				elem = self.widget(), 
				contentLyr = self.contentLyr,
				elementParent = self.elementParent, 
				elementPosition = self.elementPosition, 
				elementDisplay = self.elementDisplay;
            //format
            if (elementParent.length) {
                //�޸�IE��checkbox��radio append��BUG
                if (ie6) {
                    $('input:checkbox,input:radio', contentLyr).each(function(){
                        this.defaultChecked = this.checked;
                    });
                }
                elem.css({
                    position: elementPosition || '',
                    display: elementDisplay || ''
                });
                //�Ż�ԭ��
                elementParent.append(elem);
                
                //����ڴ������IE�»��в���
                self.elementParent = self.elementPosition = self.elementDisplay = null;
            }
            //����Ĭ�ϵ�destroy������������Ϊ����element remove֮ǰ
            $.Widget.prototype.destroy.apply(self, arguments);
            $(window).unbind('.ui-dialog');
            contentLyr.unbind('.ui-dialog').remove();
            self._trigger('close');
            self.contentLyr = null;
            self.isAnimated = false;
        },
        /**
         * ��ק����
         */
        _makeDraggable: function(){
            var self = this, o = self.options;//, doc = $(document), heightBeforeDrag;
            function filteredUi(ui){
                return {
                    position: ui.position,
                    offset: ui.offset
                };
            }
            
            self.contentLyr.draggable({
                //cancel: ".ui-dialog-content, .ui-dialog-titlebar-close",
                handle: o.handle || false,
                containment: "document",
                start: function(event, ui){
                    //heightBeforeDrag = options.height === "auto" ? "auto" : $(this).height();
                    //$(this).height($(this).height()).addClass("ui-dialog-dragging");
                    self._trigger("dragStart", event, filteredUi(ui));
                },
                drag: function(event, ui){
                    self._trigger("drag", event, filteredUi(ui));
                },
                stop: function(event, ui){
                    //options.position = [ui.position.left - doc.scrollLeft(), ui.position.top - doc.scrollTop()];
                    //$(this).removeClass("ui-dialog-dragging").height(heightBeforeDrag);
                    self._trigger("dragStop", event, filteredUi(ui));
                    //$.ui.dialog.overlay.resize();
                }
            });
        },
        
        close: function(){
            var self = this;
            if (self.isAnimated) {
                $.log('close: another dialog is closing!');
                return;
            }
            var o = self.options, contentLyr = self.contentLyr, bgiframe;
            
            if (!self._trigger('beforeClose')) {
                return;
            };
            if (self.timeout) {
                clearTimeout(self.timeout);
                self.timeout = null;
            }
            if (o.modal) {
                $.ui.dialog.overlay.close(self);
            }
            ie6 && contentLyr.bgiframe('close');
            if (o.fadeOut) {
                self.isAnimated = true;
                contentLyr.fadeOut(o.fadeOut, $.proxy(self, 'destroy'));
            }
            else {
                self.destroy();
            }
        },
        _setOption: function(key, value){
			var self = this;
            switch (key) {
                case 'zIndex':
                    //reset global zIndex
                    zIndex = value;
                    break;
                case 'css':
                case 'modalCSS':
                    $.extend(self.options.key, value);
                    break;
                case "draggable":
                    var isDraggable = self.contentLyr.is(":data(draggable)");
                    if (isDraggable && !value) {
                        self.contentLyr.draggable("destroy");
                    }
                    
                    if (!isDraggable && value) {
                        self._makeDraggable();
                    }
                    break;
                    
            }
            
        },
        _offsetContent: function(){
            //noformat
            var self = this,
				o = self.options, 
				win = $(window),
				position = self.position, 
				top = ((!ie6 && o.fixed) ? 0 : win.scrollTop()) + position.top;
			//format
            self.contentLyr.css({
                left: ((!ie6 && o.fixed) ? 0 : win.scrollLeft()) + position.left,
                top: top < 0 ? 0 : top
            });
        },
        _center: function(){
            var self = this, o = self.options, win = $(window), contentLyr = self.contentLyr;
            $.extend(self.position, {
                left: (win.width() - contentLyr.width()) / 2,
                top: (win.height() - contentLyr.height()) / 2
            });
            self._offsetContent();
        }
    });
    //put overlay in the dialog namespace but it is singlton
    $.extend($.ui.dialog, {
        version: '1.0',
        overlay: function(dialog){
            $.ui.dialog.overlay.create(dialog);
        }
    });
    $.extend($.ui.dialog.overlay, {
        dialogs: [],
        maxZ: 0,
        create: function(dialog){
            var self = this, o = dialog.options, modal = self.modal, doc = $(document), body = $(document.body);
            //ҳ����ֻ�������һ��modal�Ի����µĶԻ����ǰ���������ϵĶԻ���
            //update: ������modal���͵ĶԻ�����ڣ�ֻ��modal����ֻ��һ�㣬��zIndex����ʵ�ʱ仯
            self.dialogs.push(dialog);
            
            //�������ֻ��ߴ���һ��
            if (modal) {
                modal.css('z-index', (dialog.zIndex = self.maxZ = zIndex++));
                ie6 && o.bgiframe && modal.bgiframe('close');
            }
            else {
                doc.bind('keydown.ui-dialog-overlay,keypress.ui-dialog-overlay', function(event){
                    // stop events if the z-index of the target is < the z-index of the overlay
                    // we cannot return true when we don't want to cancel the event (#3523)
                    // 2011.06.16 Denis ����contains�ж�
					// 2011.06.20 Denis ���Ӷ�HTML�Ĺ���
                    if (event.target.nodeName !== 'HTML' && !$.contains(dialog.contentLyr[0], event.target) && $(event.target).zIndex() < $.ui.dialog.overlay.maxZ) {
                        return false;
                    }
                });
                modal = (self.modal = $('<div>', {
                    'class': 'ui-dialog-overlay',
                    css: $.extend(o.modalCSS, {
                        display: 'none',
                        zIndex: (dialog.zIndex = self.maxZ = zIndex++),
                        left: 0,
                        top: 0
                    }, (ie6 ? {
                        position: 'absolute',
                        width: body.width(),
                        height: doc.height()
                    } : {
                        position: 'fixed',
                        width: '100%',
                        height: '100%'
                    }))
                }).attr('tabindex', '-1').appendTo(body));
                //IE6�����ô��ڴ�С��Ҫ����modal��С
                if (ie6) {
                    $(window).bind('resize.ui-dialog-overlay', function(){
                        modal.css({
                            width: body.width(),
                            height: doc.height()
                        });
                    });
                }
                if (o.fadeIn) {
                    modal.fadeIn(o.fadeIn, function(){
                        if (o.bgiframe) {
                            modal.bgiframe();
                        }
                    });
                }
                else {
                    modal.show();
                    if (o.bgiframe) {
                        modal.bgiframe();
                    }
                }
            }
        },
        close: function(dialog){
            var self = this, o = dialog.options, dialogs = self.dialogs, i = dialogs.indexOf(dialog), len = dialogs.length;
            //�رյ�dialog�Ƿ��ڶ���ĩβ
            if (i === len - 1) {
                dialogs.pop();
                //�Ƿ����һ��ռ��modal��dialog
                if (len > 1) {
                    self.modal.css('z-index', (self.maxZ = dialogs[len - 2].zIndex));
                }
                else {
                    //ie6�����ָ��㵼��ҳ������
                    //����modal������ֹ�ڹرչ�����ͬʱ��create�Ķ���
                    //��������ԭ������ȡ��overlay�Ĺرն������̡�
                    self._destroy();
                }
            }
            else {
                dialogs.splice(i, 1);
            }
        },
        _destroy: function(){
            var self = this;
            //��ȥ���¼�
            $(document).unbind('.ui-dialog-overlay');
            if (ie6) {
                $(window).unbind('.ui-dialog-overlay');
            }
            self.modal.remove();
            self.modal = null;
        }
    });
    $.add('ui-dialog');
})(jQuery);
