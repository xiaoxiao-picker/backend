define(function(require, exports, module) {
	// demo
	/**
	 * <div class="dropdown-group" dropdown tabindex="-1">
	 *	<button type="button" role="button" class="dropdown-toggle">
	 *	报数
	 *	<span class="fa fa-caret-down"></span>
	 *	</button>
	 *	<ul class="dropdown-menu">
	 *		<li>
	 *			<a href="javascript:void(0);">一</a>
	 *		</li>
	 *		<li>
	 *			<a href="javascript:void(0);">二</a>
	 *		</li>
	 *		<li>
	 *			<a href="javascript:void(0);">三</a>
	 *		</li>
	 *		<li>
	 *			<a href="javascript:void(0);">四</a>
	 *		</li>
	 *	</ul>
	 * </div>
	 */

	var namespace = "dropdown";
	$(document.body).on("click." + namespace, ".dropdown-group", function() {
		var $dropdown = $(this);
		$dropdown.addClass("active");

		$(document.body).one("click." + namespace, function(event) {
			var isDropdownGroup = $(event.target).closest($dropdown).length > 0;
			if (!isDropdownGroup) {
				$dropdown.removeClass("active");
			}
		});
	});

	$(document.body).one("click." + namespace, ".dropdown-group>.dropdown-menu>li", function() {
		$(this).parents(".dropdown-group").removeClass("active");
	});
});