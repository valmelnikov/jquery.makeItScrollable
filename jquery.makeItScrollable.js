(function($){
	$.fn.makeItScrollable = function(options){
		var $aim = $(this);
		var defaultOptions = {
			contentWrapperClass: 'makeItScrollable_content',
			scrollLineClass: 'scroll_line',
			scrollerClass: 'scroller',
			vertMargin: 5,
			stepSize: [1, 'units'],
			containerHeight: [3, 'units'],
			containerElementaryUnit: 'li',
			useButtons: null
		};
		
		options = $.extend(defaultOptions, options || {});
		$existingScroll = $aim.children('.' + options.scrollLineClass);
		
		// Process step size
		if(options.stepSize[0] && options.stepSize[1] == 'units'){
			options.stepSize = $aim.find(options.containerElementaryUnit).outerHeight() * options.stepSize[0];
		} else if(options.stepSize[0] && options.stepSize[1] == 'px'){
			options.stepSize = options.stepSize[0];
		}
		
		//Wrap container contents
		if(! $existingScroll.length){
			$aim.children().wrapAll("<div class='" + options.contentWrapperClass + "'>");
		}
		var $wrapper = $aim.children('.' + options.contentWrapperClass);
		
		// Insert and setup scroll bar
		var tpl = "<div class='" + options.scrollLineClass + "'><div class='" + options.scrollerClass + "'></div></div>";
		var $scrollLine = $existingScroll.length ? $existingScroll : $(tpl).appendTo($aim);
		var $scroller = $scrollLine.children('.' + options.scrollerClass);
		resetScrollingCSS();
		// If scrollable content height <= container height do not process
		if($wrapper.innerHeight() <= $aim.innerHeight()){
			$scrollLine.hide();
			return 0;
		}
			
		//console.log($scroller);
		// Event listeners
		if(! $existingScroll.length){
			$scrollLine.click(onScrollLineClick);
			$scroller.mousedown(onScrollerMouseDown).click(function(e){e.stopPropagation()});
			$aim.mousewheel(onScrollMouseWheel);

			if(options.useButtons && $(options.useButtons).length){
				var $keyTarget = $(options.useButtons);
				$keyTarget.keydown(onKeyDown);
			}
		}
		
		function resetScrollingCSS(){
			$aim.css({position: 'relative'});
			if(options.containerHeight[0] && options.containerHeight[1] == 'units' && options.containerElementaryUnit){
				$aim.css({height: $aim.find(options.containerElementaryUnit).outerHeight() * options.containerHeight[0]});
			} else if(options.containerHeight[0] && options.containerHeight[1] == 'px'){
				$aim.css({height: options.containerHeight[0]});
			}
			
			var lineHeight = $aim.innerHeight() - 2 * options.vertMargin;
			var scrollerHeight = $aim.innerHeight() / $wrapper.innerHeight() * lineHeight;

			$wrapper.css({'margin-top' : 0});
			$scrollLine.css({top: options.vertMargin, height: lineHeight}).show();
			$scroller.css({height: scrollerHeight});
		}
		
		function onScrollerMouseDown(e){
			e.preventDefault();
			$(window).mousemove({startY: e.pageY - $(this).position().top}, onScrollerMouseMove);
			$(window).mouseup(onScrollerMouseUp);
		}

		function onScrollerMouseMove(e){
			var delta = (e.pageY - e.data.startY) - $scroller.position().top;
			var cssTop = '';
			var nextEdge = 0;
			if( delta > 0 ){
				nextEdge = $scroller.position().top + delta + $scroller.outerHeight();
				if(nextEdge <= $scrollLine.innerHeight()){
					cssTop = nextEdge - $scroller.outerHeight();
				} else { cssTop = $scrollLine.innerHeight() - $scroller.outerHeight(); }
			} else {
				nextEdge = $scroller.position().top - Math.abs(delta);
				if(nextEdge > 0){
					cssTop = nextEdge;
				} else { cssTop = 0; }
			}
			if(cssTop){
				$scroller.css({top: cssTop});
				onScrollMove();
			}
		}

		function onScrollerMouseUp(e){
			$(window).unbind('mousemove', onScrollerMouseMove);
			$(window).unbind('mouseup', onScrollerMouseUp);
		}

		function getScrollPercent(){
			var result = $scroller.position().top / ($scrollLine.outerHeight() - $scroller.outerHeight());
			result > 0.99 ? result = 1  : 0;
			result < 0.02 ? result = 0 : 0;
			return result;
		}

		function onScrollMouseWheel(event, delta, deltaX, deltaY){
			event.preventDefault();
			scrollByStep(delta);
		}

		function getContentScrollPercent(){
			var marginTop = + $wrapper.css('margin-top').replace('px', '');
			marginTop = Math.abs(marginTop);
			var result = marginTop / ($wrapper.outerHeight() - $aim.innerHeight());
			result > 0.99 ? result = 1  : 0;
			result < 0.02 ? result = 0 : 0;
			return result;
		}

		function scrollByStep(delta){
			delta = delta * options.stepSize;
			var margin = + $wrapper.css('margin-top').replace('px', '') + delta;
			if(margin > 0)
				margin = 0;
			if(margin < ($aim.innerHeight() - $wrapper.outerHeight()) )
				margin = ($aim.innerHeight() - $wrapper.outerHeight());
			$wrapper.css({'margin-top': margin});
			$scroller.css({top: getContentScrollPercent() * ($scrollLine.innerHeight() - $scroller.outerHeight())});
		}

		function onScrollLineClick(e){
			e.offsetY = e.offsetY || e.layerY;
			var topToBe = e.offsetY - $scroller.outerHeight() / 2;
			if(topToBe < 0)
				topToBe = 0;
			if(topToBe > ($(this).innerHeight() - $scroller.outerHeight()))
				topToBe = $(this).innerHeight() - $scroller.outerHeight();
			
			$scroller.css({top: topToBe});
			onScrollMove();
		}

		function onScrollMove(){
			var margin = getScrollPercent() * ($wrapper.outerHeight() - $aim.outerHeight());
			$wrapper.css({'margin-top' : '-' + margin + 'px'});
		}
				
		function onKeyDown(e){
			if(e.keyCode == 40 || e.keyCode == 38){
				e.preventDefault();
				if(e.keyCode == 40){
					scrollByStep(-1);
				} else if(e.keyCode == 38) {
					scrollByStep(1);
				}
			}
		}
		
		return $(this);
	}
})(jQuery);