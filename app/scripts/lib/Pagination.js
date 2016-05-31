define(function(require, exports, module) {
	var Helper = require('helper');

	/**
	 *  @param container    分页控件容器
	 *  @param total        数据总数
	 *  @param limit        单页数据个数
	 *  @param totalPage    总页数
	 *  @param currentPage  当前页数
	 *  @param align        排列［left／center／right］
	 *  @param theme        主题［DEFAULT／SIMPLE］
	 */
	var Pagination = function(total, limit, currentPage, options) {
		this.namespace = 'pagination';
		this.container = options.container || $('.panel-footer');
		this.total = total || 0;
		this.limit = limit || 10;
		this.currentPage = currentPage || 1;
		this.totalPage = total % limit == 0 ? total / limit : Math.floor(total / limit) + 1;
		this.options = $.extend({
			align: 'center',
			theme: 'DEFAULT'
		}, options);

		this.render();
		addListener(this);
	};

	Pagination.prototype.render = function() {
		var container = this.container;
		var options = this.options;

		var box_html = options.theme == 'DEFAULT' ? createHTMLByDefault(this) : createHTMLBySimple(this);
		container.html(box_html);
		container.addClass(options.align + ' unselect');
	}

	function createHTMLByDefault(pagination) {
		var container = pagination.container;

		var box_html = '';
		if (pagination.totalPage <= 1) {
			return box_html;
		};

		var pre_button_html = createPreBtnHTML(pagination);
		var next_button_html = createNextBtnHTML(pagination);
		var pages_html = '';

		if (pagination.totalPage <= 9) {
			for (var i = 1; i <= pagination.totalPage; i++) {
				pages_html += createSingleHTML(i, pagination);
			};
		} else {
			var start_page = 0;
			var end_page = 0;

			if (pagination.currentPage >= 5) {
				pages_html += createSingleHTML(1, pagination);
				pages_html += '<li class="disabled"><a href="javascript:void(0);"><i class="fa fa-ellipsis-h"></i></a></li>';
			};

			if (pagination.currentPage < 5) {
				start_page = 1;
				end_page = 7;
			} else if (pagination.totalPage - pagination.currentPage < 4) {
				start_page = pagination.totalPage - 6;
				end_page = pagination.totalPage;
			} else {
				start_page = pagination.currentPage - 2;
				end_page = pagination.currentPage + 2;
			}

			for (var i = start_page; i <= end_page; i++) {
				pages_html += createSingleHTML(i, pagination)
			};

			if (pagination.totalPage - pagination.currentPage >= 4) {
				pages_html += '<li class="disabled"><a href="javascript:void(0);"><i class="fa fa-ellipsis-h"></i></a></li>';
				pages_html += createSingleHTML(pagination.totalPage, pagination);
			};
		}

		var go_page_html = pagination.totalPage >= 10 ? createGoPageHTML(pagination) : '';

		box_html = [
			'<ul class="xx-pagination ' + pagination.options.theme + '">',
			pre_button_html + pages_html + next_button_html,
			go_page_html,
			'</ul>'
		].join('');

		return box_html;
	}

	function createHTMLBySimple(pagination) {
		var container = pagination.container;

		var box_html = '';
		if (pagination.totalPage <= 1) {
			return;
		};

		var pre_button_html = createPreBtnHTML(pagination);
		var next_button_html = createNextBtnHTML(pagination);

		var pages_html = '';
		for (var i = 1; i <= pagination.totalPage; i++) {
			pages_html += '<option ' + (i == pagination.currentPage ? 'selected' : '') + '>' + i + '</option>'
		};
		var select_html = '<li class="center"><select class="form-control page-select">' + pages_html + '</select></li>';

		box_html = [
			'<ul class="xx-pagination ' + pagination.options.theme + '">',
			pre_button_html + select_html + next_button_html,
			'</ul>'
		].join('');

		return box_html;
	}

	// 创建单个页数
	function createSingleHTML(index, pagination) {
		var html = [
			'<li class="page ' + (index == pagination.currentPage ? 'active' : '') + '">',
			'<a href="javascript:void(0);" data-value="' + index + '">',
			'<span>' + index + '</span>',
			'</a>',
			'</li>'
		].join('');

		return html;
	}

	// 创建上一页
	function createPreBtnHTML(pagination) {
		var html = [
			'<li class="page page-pre ' + (pagination.currentPage == 1 ? 'disabled' : '') + '">',
			'<a href="javascript:void(0);" ' + (pagination.currentPage == 1 ? '' : 'data-value="' + (pagination.currentPage - 1) + '"') + '>',
			'<span>上一页</span>',
			'</a>',
			'</li>'
		].join('');

		return html;
	}

	// 创建下一页
	function createNextBtnHTML(pagination) {
		var html = [
			'<li class="page page-next ' + (pagination.currentPage == pagination.totalPage ? 'disabled' : '') + '">',
			'<a href="javascript:void(0);" ' + (pagination.currentPage == pagination.totalPage ? '' : 'data-value="' + (pagination.currentPage + 1) + '"') + '>',
			'<span>下一页</span>',
			'</a>',
			'</li>'
		].join('');

		return html;
	}

	function createGoPageHTML(pagination) {
		var html = [
			'<li class="page-go">',
			'到第&nbsp;<input class="input-go" type="text" name="" value="' + pagination.currentPage + '" placeholder="">&nbsp;页',
			'<button class="btn-go">确定</button>',
			'</li>'
		].join('');

		return html;
	}

	function addListener(pagination) {
		var container = pagination.container;
		var options = pagination.options;

		container.on('click.' + pagination.namespace, '.page >a', function() {
			var btn = $(this);
			var pageIndex = +btn.attr('data-value');

			if (btn.parents('.page').hasClass('disabled')) {
				return;
			}

			changePageIndex(pageIndex);
		});

		container.on('click.' + pagination.namespace, '.btn-go', function() {
			var input = $('.input-go');
			var pageIndex = +input.val();

			changePageIndex(pageIndex);
		});

		container.on('change.' + pagination.namespace, '.page-select', function() {
			var select = $(this);
			var pageIndex = +select.val();

			changePageIndex(pageIndex);
		});

		function changePageIndex(pageIndex) {
			if (pageIndex < 1 || pageIndex > pagination.totalPage) {
				return;
			};
			if (pageIndex == pagination.currentPage) {
				return;
			}

			pagination.currentPage = pageIndex;
			pagination.render();

			options.switchPage && $.isFunction(options.switchPage) && options.switchPage.call(pagination, pageIndex);
		}
	}

	module.exports = function(total, limit, currentPage, options) {
		new Pagination(total, limit, currentPage, options);
	};
});