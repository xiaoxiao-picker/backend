define(function(require, exports, module) {

	$(document.body).on("mouseenter", "[tooltip]", function() {
		var $this = $(this);
		var tips = $this.attr("title");
		if (!tips) return;

		$this.removeAttr("title");
		var pos = $this.attr("tooltip-position") || "top";
		var zIndex = $this.attr("tooltip-zindex") || 500;
		var offset = $this.offset();
		var width = $this.outerWidth();
		var height = $this.outerHeight();

		var position = {
			left: offset.left
		};
		if (pos == "top") {
			position.top = offset.top - 23;

		} else {
			position.top = offset.top + height + 2;
		}
		var html = $([
			'<div class="tooltip ' + pos + '" role="tooltip" style="top:' + position.top + 'px;left:' + position.left + 'px;z-index:' + zIndex + '">',
			'<div class = "tooltip-arrow" ></div>',
			'<div class = "tooltip-inner"></div>',
			'</div > '
		].join(''));
		// 防止tips为脚本，直接执行
		html.find(".tooltip-inner").text(tips);
		$(document.body).append(html);
		html.css("top", offset.top - html.height() - 10);

		var tooltipWidth = html.outerWidth();
		var tooltipLeft = offset.left + width / 2 - tooltipWidth / 2;
		html.css({
			left: tooltipLeft
		});


		$this.one("mouseleave", function() {
			$this.attr("title", tips);
			html.remove();
		});
	});
});