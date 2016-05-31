define(function(require, exports, module) {
	require('plugins/masonry/masonry.pkgd.js');
	require('plugins/masonry/imagesloaded.pkgd.js');
	require('plugins/masonry/get-style-property.js');

	var Helper = require("helper");
	var baseController = require('baseController');
	var bC = new baseController();
	var template = require('template');
	var VoteService = require('VoteService');

	var orgId, voteId, limit, page, state, Total;
	var RenderedOptions;

	var Controller = function() {
		var _controller = this;
		_controller.namespace = "vote.options";
		_controller.actions = {
			openOptionModal: function() {
				var btn = this;
				var optionId = btn.attr('data-value');

				openOptionModal(optionId);
			},
			approve: function() {
				var btn = this;
				var optionId = btn.attr('data-value');

				updateSignupState(btn, optionId, 'APPROVE', '', function() {
					Helper.successToast('通过该用户的报名');
					renderUnClickedOption();
				});
			},
			refuse: function() {
				var btn = this;
				var optionId = btn.attr('data-value');

				openRefuseModal(btn, optionId, function() {
					Helper.successToast('拒绝该用户的报名');
					renderUnClickedOption();
				});
			},
			ignore: function() {
				var btn = this;
				var optionId = btn.attr('data-value');

				updateSignupState(null, optionId, 'UNCHECKED', '', function() {
					Helper.successToast('暂时跳过该用户的报名');
					renderUnClickedOption();
				});
			},
			loadMore: function() {
				var btn = this;
				renderOptions(btn);
			}
		}
	};


	bC.extend(Controller);
	Controller.prototype.init = function() {

		orgId = App.organization.info.id;
		voteId = Helper.param.hash('voteId');
		limit = +Helper.param.search('limit') || 20;
		page = +Helper.param.search('page') || 1;
		state = Helper.param.search('state') || 'APPROVE';
		Total = -1;

		RenderedOptions = [];
		this.render();
	};

	Controller.prototype.render = function() {
		var callback = this.callback;
		var templateUrl = this.templateUrl;

		if (state == 'UNCHECKED') {
			Helper.globalRender(template(templateUrl, {
				voteId: voteId,
				state: state
			}));
			Helper.execute(callback);
			renderUnClickedOption();
		} else {
			VoteService.signup.count(voteId, 'UNCHECKED').done(function(data) {
				Helper.globalRender(template(templateUrl, {
					voteId: voteId,
					state: state,
					unclickedCount: data.result
				}));
				renderOptions();
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.execute(callback);
			});
		}

	};

	function renderOptions(btn) {
		if (Total == RenderedOptions.length) {
			return;
		};

		var skip = RenderedOptions.length;

		btn && Helper.begin(btn);
		VoteService.signup.getList(voteId, skip, limit, state).done(function(data) {
			var options = data.result.data;
			Total = data.result.total;
			RenderedOptions = RenderedOptions.concat(options);

			$('#Total').text(Total);
			var container = $('.options-box');
			var html = $(template('app/templates/vote/ugc/rows', {
				options: options,
				count: Total
			}));
			container.append(html);
			$('.more-container')[Total <= RenderedOptions.length ? 'addClass' : 'removeClass']('hide');
			if (!container.data("masonry")) {
				container.imagesLoaded(function() {
					container.masonry({
						itemSelector: '.card-box',
						isAnimated: true,
						gutterWidth: 0
					});
				});
			} else {
				container.imagesLoaded(function() {
					container.masonry("appended", html, true);
				});
			}
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			btn && Helper.end(btn);
		});
	}

	function renderUnClickedOption() {
		VoteService.signup.getList(voteId, 0, 1, state).done(function(data) {
			var options = data.result.data;
			Total = data.result.total;
			RenderedOptions = RenderedOptions.concat(options);

			$('#Total').text(Total);
			$('.option-box').html(template('app/templates/vote/ugc/row-unclicked', {
				option: options.length ? options[0] : {},
				count: Total
			}));
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	function updateSignupState(btn, optionId, state, response, success) {
		btn && Helper.begin(btn);
		VoteService.signup.updateState(optionId, state, response).done(function(data) {
			Helper.execute(success);
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			btn && Helper.end(btn);
		});
	};

	function openOptionModal(optionId) {
		var modal = Helper.modal({
			title: '',
			className: 'vote-option-modal'
		});

		VoteService.signup.get(optionId).done(function(data) {
			var option = data.result;
			modal.html(template('app/templates/vote/ugc/option-modal', {
				option: option
			}));

			modal.addAction('.btn-update', 'click', function() {
				openOptionEditor(option);
			});

			modal.addAction('.btn-remove', 'click', function() {
				var btn = $(this);
				var optionId = btn.attr('data-value');

				openRefuseModal(btn, option.id, function() {
					Helper.successToast('删除该用户的报名成功');
					modal.close();

					var index = RenderedOptions.indexOfAttr('id', option.id);
					RenderedOptions.splice(index, 1);
					$('.options-box').masonry('remove', $('#' + option.id)).masonry('layout');
				});
			});
		}).fail(function(error) {
			Helper.alert(error);
		});

	};

	function openRefuseModal(btn, optionId, success) {
		var modal = Helper.modal({
			title: '原因说明',
			className: 'width-500'
		});
		modal.html(template('app/templates/vote/ugc/refuse-modal', {}));

		modal.addAction('input[name=cause]', 'change', function() {
			var input = $(this);
			var value = input.val();
			$('.other')[value == '其他' ? 'removeClass' : 'addClass']('hide');
		});

		modal.addAction('.btn-save', 'click', function() {
			var response = $('input[name=cause]:checked').val();
			if (response == '其他') {
				response = $('.other').val();
			};
			if (Helper.validation.isEmpty(response)) {
				Helper.errorToast('拒绝原因不得为空');
				return;
			};

			updateSignupState(btn, optionId, 'REFUSE', response, function() {
				modal.close();
				Helper.execute(success);
			});
		});
	};

	function openOptionEditor(option) {
		var modal = Helper.modal({
			title: '修改报名信息',
			className: 'vote-option-editor-modal'
		});
		modal.html(template('app/templates/vote/ugc/option-editor-modal', {
			option: option
		}));

		modal.addAction('.btn-save', 'click', function() {
			var name = modal.box.find('.name').val();
			var description = modal.box.find('.description').val();

			if (Helper.validation.isEmpty(name) || Helper.validation.isEmpty(description)) {
				Helper.errorToast('标题或者简介不得为空');
				return;
			};

			VoteService.signup.update(option.id, name, description).done(function() {
				Helper.successToast('修改报名信息成功');
				modal.clear();
			}).fail(function(error) {
				Helper.alert(error);
			});
		});
	}

	module.exports = Controller;
});