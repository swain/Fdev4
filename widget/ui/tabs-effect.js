/**
 * @usefor widget tabs extend effect
 * @author wb_hongss.ciic
 * @date 2011.05.4
 * @update 2011.06.03 hongss �޸�F5ˢ�º����Ч����scrolLeft/scrollTop���ָ�����ʼ��״̬������
 */

 ;(function($, undefined){
     
     $.extend($.ui.tabs.prototype.options, {
         effect: 'none',            //����Ч����none(�޶���Ч��)��scroll(����Ч��)��fade(��������Ч��), function()(�Զ��嶯��)��
         speed: 'slow',             //���������ٶȣ�����Ϊ���֣�����λ�����룩
         perItem: 1,                //ÿ�ι�������Ԫ�����������˲���ֻ��effect:scrollʱ��Ч��
         scrollType: 'fill',        //ѭ�������ķ�ʽ����ѡֵ��loop|fill|break�� ��ֵΪloopʱtitleSelector������Ч����ֵΪfillʱ����Ч�����˲���ֻ��effect:scrollʱ��Ч��
         easing: 'swing',           //����Ч����swing|easeInQuad|easeOutQuad
         subLength: null,           //����ʱ��ÿ����Ԫ�صĿ��ߣ��ȣ�Ĭ���Զ����㣻���˲���ֻ��effect:scrollʱ��Ч��
         direction: 'left'          //�������򣬿�ѡֵ��left|right|up|down�����˲���ֻ��effect:scrollʱ��Ч��
     });
     
     $.extend($.ui.tabs.prototype, {
         /**
          * @methed _setBox  box������
          * @param {num} idx
          * ����Ч����none(�޶���Ч��)��scroll(����Ч��)��fade(��������Ч��)��
          *          ��effectΪfunctionʱΪ�Զ���Ч������ʱfunction����һ������idx��thisָ��ǰbox
          */
         _setBox: function(idx, primalIdx) {
             var self = this;
             if ($.isFunction(self.options.effect)){
                 self.options.effect.call(self.boxes[idx], idx);
             } else {
                 switch (self.options.effect){
                     case 'none':
                        self._effectNone(idx);
                        break;
                     case 'scroll':
                        self._effectScroll(idx, primalIdx);
                        break;
                     case 'fade':
                        self._effectFade(idx);
                        break;
                     default:
                        self._effectNone(idx);
                 }
             }
         },
         /**
          * @methed _effectScroll  ����Ч����box����
          * @param {num} idx
          */
         _effectScroll: function(idx, primalIdx) {
             var self = this, options = self.options,
             perLength = self._getPerLength(),
             parent = self._getBoxesParent().parent(),
             direction = options.direction,
             length = self.boxes.length,
             scrollLength, scrollSign,
             tempIdx = idx, tempIndex = self.index;
             
             if (options.scrollType==='loop'){
                 tempIdx = primalIdx;
             }
             scrollLength = (tempIdx-tempIndex) * perLength;
             
             if (direction==='right'||direction==='down') {
                 scrollSign = '-='+scrollLength;
             }else {
                 scrollSign = '+='+scrollLength;
             }
             
             if (self._isHorizontal()) {
                 self._setLoopScrollOffset('scrollLeft', tempIdx, scrollLength);
                 
                 parent.animate({
                     scrollLeft: scrollSign
                 }, options.speed, options.easing, function(){
                     self._lazyScrollImg();
                     self._lazyScrollHtml();
                 });
             } else {
                self._setLoopScrollOffset('scrollTop', tempIdx, scrollLength);
                 
                 parent.animate({
                     scrollTop: scrollSign
                 }, options.speed, options.easing, function(){
                     self._lazyScrollImg();
                     self._lazyScrollHtml();
                 });
             }
         },
         /**
          * @methed
          * @param {Object} idx
          */
         _setLoopScrollOffset: function(scroll, idx, scrollLength){
             if (this.options.scrollType === 'loop') {
                 var index = this.index, 
                 parent = this._getBoxesParent().parent(), 
                 scrollOffset = parent[scroll](),
                 primalSize = this._getPrimalSize();
                 
                 if (idx > index && scrollOffset > primalSize) {
                     parent[scroll](scrollOffset - primalSize);
                 }
                 if (idx < index && scrollOffset < Math.abs(scrollLength)) {
                     parent[scroll](scrollOffset + primalSize);
                 }
             }
         },
         /**
          * @methed _effectFade  ��������Ч����box����
          * @param {num} idx
          */
         _effectFade: function(idx) {
             this.boxes.hide();
             $(this.boxes[idx]).fadeIn(this.options.speed);
         },
         /**
          * @methed _setScrollStyle ���ù���ʱ��Ҫ��STYLE
          */
         _setEffectStyle: function(){
             if (this.options.effect==='scroll'){
                 var initOffset = this._getPerLength() * this.index,
                 parent = this._getBoxesParent().parent();
             
                 if (this._isHorizontal()){
                     this._setOffset('width');
                     parent.scrollLeft(initOffset);
                 } else {
                     this._setOffset('height');
                     parent.scrollTop(initOffset);
                 }
                 
                 this._setSubLength();
                 this._setPerItem();
                 this._setBoxes();
                 
             }
         },
         /**
          * @methed _setOffset ���ÿ��/�߶�
          */
         _setOffset: function(cssName){
             var boxes = this._getPrimalBoxes(),
             parent = this._getBoxesParent(),
             boxesLength = boxes.length * this._getSubLength(),
             teamsLength = this._getTeamCount() * this._getPerLength();
             
             switch (this.options.scrollType){
                 case 'loop':
                    parent.append(boxes.clone(true));
                    parent.css(cssName, boxesLength*2);
                    break;
                 case 'break':
                    parent.css(cssName, boxesLength);
                    break;
                 default:
                    parent.css(cssName, teamsLength);
             }
         },
         /**
          * @methed _getPrimalSize ���ԭʼ��δ����ǰ�ģ������Ԫ�صĿ��/�߶�
          */
         _getPrimalSize: function(){
             var primalSize = this._getPrimalBoxes().length * this._getSubLength();
             this._getPrimalSize = function(){ return primalSize; }
             return primalSize;
         },
         /**
          * @methed _getPrimalBoxes ����ԭʼ��boxes
          */
         _getPrimalBoxes: function(){
             var boxes = this.element.find(this.options.boxSelector);
             this._getPrimalBoxes = function(){ return boxes; }
             return boxes;
         },
         /**
          * @methed _getBoxesParent ����boxes�Ĺ�ͬ����Ԫ��
          */
         _getBoxesParent: function(){
             var boxes = this._getPrimalBoxes(),
             parent = boxes.parent();
             this._getBoxesParent = function() { return parent; }
             return parent;
         },
         /**
          * @methed _getTeamCount ��������
          */
         _getTeamCount: function(){
             var boxes = this._getPrimalBoxes(),
             teamCount = Math.ceil(boxes.length/this.options.perItem);
             this._getTeamCount = function(){ return teamCount; }
             return teamCount;
         },
         /**
          * @methed _setBoxes ��perItem>1ʱ����this.boxesת������Ԫ�ؼ���ɵ�����
          *     ע���˷�����effectType:loopʱ������
          */
         _setBoxes: function(){
             if (this.options.perItem > 1){
                 var perItem = this.options.perItem,
                 boxes = this._getPrimalBoxes(),
                 n = this._getTeamCount(),
                 arrBoxes = [];
                 
                 for (var i=0; i<n; i++){
                     arrBoxes[i]=boxes.slice(i*perItem, (i+1)*perItem);
                 }
                 this.boxes = arrBoxes;
             }
         },
         /**
          * @methed _isHorizontal �ж��Ƿ�Ϊˮƽ����ģ�����true/false
          */
         _isHorizontal: function() {
             var options = this.options;
             //left|right����true��up|down����false��Ĭ��Ϊ'left'
             switch (options.direction) {
                case 'left':
                    return true;
                    break;
                case 'right':
                    return true;
                    break;
                case 'up':
                    return false;
                    break;
                case 'down':
                    return false;
                    break;
                default:
                    options.direction = 'left';
                    return true;
            }
         },
         /**
          * @methed _getLength ������Ԫ�صĸ߶Ȼ���
          */
         _getSubLength: function() {
             var isHorizontal = this._isHorizontal(),
             options = this.options,
             subLength;
             //���������subLength��subLengthΪ������ֱ��ȡ���õ�ֵ�������Զ�ȡ
             if (options.subLength) {
                 subLength = options.subLength;
             } else {
                 //���ˮƽ������ȡouterWidth()�� ����ȡouterHeight()
                 if (isHorizontal){
                     subLength = this.boxes.eq(0).outerWidth();
                 } else {
                     subLength = this.boxes.eq(0).outerHeight();
                 }
             }
             this._getSubLength = function(){ return subLength; }
             return subLength;
         },
         /**
          * @methed _getPerLength ����ÿ�ι����ĸ߶Ȼ���
          */
         _getPerLength: function() {
             var subLength = this._getSubLength(),
             options = this.options,
             perLength;
             perLength = subLength * options.perItem;
             this._getPerLength = function(){ return perLength; }
             return perLength;
         },
         /**
          * @methed _setSubLength ����subLength
          */
         _setSubLength: function(){
             this.subLength = (this.subLength && this._isNumber(this.subLength)) ? this.subLength : null;
         },
         /**
          * @methed _setPerItem ����perItem
          */
         _setPerItem: function() {
             this.perItem = (this._isNumber(this.perItem)) ? this.perItem : 1;
         },
         /**
          * @methed _isNumber  �ж��Ƿ�Ϊ���֣�����true/false
          */
         _isNumber: function(num){
             return (num - 0) == num && num.length > 0;
         }
     });
 })(jQuery);
 