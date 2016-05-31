define(function(require, exports, module) {

	var baseController = require('baseController');
	var template = require('template');
	var bC = new baseController();
	var ResourceService = require('ResourceService');
	var Helper = require("helper");
	var uploader = require("scripts/public/uploader");

	var orgId, session, skip, limit;
	var CurGroupId, CurGroupType, CurGroupCode;
	var CustomGroups, Pictures;

	var controller = function() {
		var controller = this;
		controller.namespace = "image.list";
		controller.actions = {
			/* =================== 分组管理 =================== */
			/**
			 *	图库收起展开
			 */
			packup: function() {
				var subGroup = $(this).parents('li').find('.sub-group');
				if ($(subGroup).hasClass('packup')) {
					$(subGroup).removeClass('packup');
				} else {
					$(subGroup).addClass('packup');
				}
			},
			/**
			 *	显示新建分组弹出框
			 */
			modalForAddGroup: function() {
				groupInputModal('新建分组', 0, '', addGroup);
			},
			/**
			 *	显示重命名分组弹出框
			 */
			modalForRenameGroup: function() {
				var _btn = this,
					groupId = _btn.attr("data-id"),
					groupName = _btn.attr("data-name");

				groupInputModal('重命名分组', groupId, groupName, renameGroup);
			},
			/**
			 *	选择分组
			 */
			selectGroup: function() {
				var _btn = this;
				var groupId = _btn.attr("data-value");
				if (CurGroupId == groupId) return;

				CurGroupId = groupId;
				CurGroupType = _btn.attr("data-type");

				$("#GroupBox .sub-group >li").removeClass('active');
				_btn.addClass('active');

				renderDetailBox();
			},
			/**
			 *	删除分组
			 */
			removeGroup: function() {
				var _btn = this,
					groupId = _btn.attr("data-id");

				Helper.confirm("是否确定删除该分组，删除后分组下的所有图片将移动到 未分组 中。", {}, function() {
					Helper.begin(_btn);
					ResourceService.image.group.remove(groupId).done(function(data) {
						Helper.successToast("删除分组成功！");
						if (CurGroupId == groupId) {
							CurGroupId = 0;
						};
						renderGroups();
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},

			/* =================== 图片管理 =================== */
			/**
			 *	删除一张或多张图片
			 */
			removeImages: function() {
				var _btn = this;
				var selectedImages = $("input[name=imageOption]:checked");

				if (!selectedImages.length) {
					Helper.errorToast("请至少选择一项");
					return;
				};

				var pictureIds = [];
				$.each(selectedImages, function(idx, input) {
					pictureIds.push($(input).attr("data-value"));
				});

				var curGroup = $("#Group_" + CurGroupId + " .group-count");
				var groupCount = +curGroup.text();

				Helper.confirm("是否确定删除选中的" + pictureIds.length + "张图片？", {}, function() {
					Helper.begin(_btn);
					ResourceService.remove(orgId, pictureIds.join(',')).done(function(data) {
						Helper.successToast("删除图片成功！");
						$.each(pictureIds, function(idx, pictureId) {
							$("#Image_" + pictureId).remove();
						});

						//数据重置
						skip -= pictureIds.length;
						groupCount -= pictureIds.length;
						curGroup.text(groupCount);
						if (!groupCount) {
							$("#DetailBox .list-empty").removeClass('hide');
						}
					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
						//按钮回复默认
						$("#OptionBox >.btn").prop('disabled', true);
						$("input[name=AllImage]").prop('checked', false);
					});
				});

			},
			/**
			 *	删除对应图片
			 */
			removeImage: function() {
				var _btn = this;
				var pictureId = _btn.attr("data-id");

				var curGroup = $("#Group_" + CurGroupId + " .group-count");
				var groupCount = +curGroup.text();

				Helper.confirm("是否确定删除该图片？", {}, function() {
					Helper.begin(_btn);
					ResourceService.remove(orgId, pictureId).done(function(data) {
						Helper.successToast("删除图片成功！");
						$("#Image_" + pictureId).remove();
						--skip;
						--groupCount;
						curGroup.text(groupCount);
						if (!groupCount) {
							$("#DetailBox .list-empty").removeClass('hide');
						}

					}).fail(function(error) {
						Helper.alert(error);
					}).always(function() {
						Helper.end(_btn);
					});
				});
			},
			/**
			 *	显示移动分组弹出框(多张图片)
			 */
			modalForMoveImages: function() {
				groupsModal();
			},
			/**
			 *	显示移动分组弹出框(单张图片)
			 */
			modalForMoveImage: function() {
				var _btn = this;
				var pictureId = _btn.attr("data-id");

				groupsModal(pictureId, moveImage);
			},
			/**
			 *	显示重命名图片弹出框
			 */
			modalForRenamePic: function() {
				var _btn = this;
				var pictureId = _btn.attr("data-id");
				var pictureName = _btn.attr("data-name");

				Helper.singleInputModal({
					id: pictureId,
					name: "图片名称",
					value: pictureName,
					title: "重命名图片",
					action: function(modal) {
						var _btn = $(this);
						var pictureId = _btn.attr("data-value");
						var _input = modal.box.find('.input');
						var pictureName = _input.val();

						Helper.begin(_btn);
						ResourceService.update(pictureId, pictureName).done(function(data) {
							Helper.successToast("重命名图片成功！");
							modal.close();
							$("#Image_" + pictureId).find(".title-wrapper .input-text").text(pictureName);
							_btn.attr("data-name", pictureName);
						}).fail(function(error) {
							Helper.alert(error);
						}).always(function() {
							Helper.end(_btn);
						});
					}
				});
			},
			/**
			 *	查看图片
			 */
			checkImage: function() {
				var _btn = this;
				var pictureId = _btn.attr("data-id");
				var curIndex = indexForPictures(pictureId);

				require.async("ImageBrowser", function(ImageBrowser) {
					ImageBrowser(Pictures, {
						currenIndex: curIndex
					});
				});
			},
			/**
			 *	选中图片
			 */
			selectImage: function() {

				var images = $("input[name=imageOption]");
				var selectedImages = $("input[name=imageOption]:checked");
				if (selectedImages.length) {
					$("#OptionBox >.btn").prop('disabled', false);
					//设置是否全选
					if (images.length == selectedImages.length) {
						$("input[name=AllImage]").prop('checked', true);
					} else {
						$("input[name=AllImage]").prop('checked', false);
					}
				} else {
					$("#OptionBox >.btn").prop('disabled', true);
				}
			},
			/**
			 *	全部选中
			 */
			selectAll: function() {
				var _input = this;
				var checked = _input.prop('checked');

				var images = $("input[name=imageOption]");
				if (images.length) {
					images.prop('checked', checked);
					$("#OptionBox >.btn").prop('disabled', !checked);
				};
			},
			/**
			 *	加载更多图片
			 */
			loadMore: function() {
				var _btn = this;
				renderMoreImages(_btn);
			}
		}
	};

	bC.extend(controller);
	controller.prototype.init = function(templateName, fn) {
		tmp = templateName;
		orgId = App.organization.info.id;
		session = App.getSession();
		limit = 12;
		CurGroupId = 0;
		CurGroupType = '';
		CustomGroups = [];
		Pictures = [];
		render(fn);
	};

	function render(callback) {
		Helper.globalRender(template(tmp, {
			orgId: orgId
		}));
		Helper.execute(callback);

		renderGroups();
	};

	/**
	 *	渲染分组列表
	 */
	function renderGroups() {
		CustomGroups = [];

		ResourceService.image.group.getList(orgId).done(function(data) {
			var groups = data.result;

			var systemGroups = [];
			$.each(groups, function(idx, group) {
				if (group.type == "SYSTEM") {
					systemGroups.push(group);
				} else {
					CustomGroups.push(group);
				}
			});
			CustomGroups.sort(function compare(a, b) {
				return a.id - b.id;
			});

			if (!CurGroupId) {
				CurGroupId = CustomGroups[0].id;
				CurGroupType = CustomGroups[0].type;
			};

			$("#GroupBox").html(template("app/templates/resource/image/group-box", {
				systemGroups: systemGroups,
				customGroups: CustomGroups,
				curGroupId: CurGroupId
			}));

			renderDetailBox();
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	/**
	 *	渲染对应分组内容
	 */
	function renderDetailBox() {
		if (CurGroupId) {
			ResourceService.image.group.get(CurGroupId).done(function(data) {
				var group = data.result;

				CurGroupCode = group.code;

				renderBox(group);
			}).fail(function(error) {
				Helper.alert(error);
			});
		} else {
			var group = {
				name: '未分组'
			};
			renderBox(group);
		}

		function renderBox(group) {
			// 系统图库直接取全部
			limit = group.type == "SYSTEM" ? 10000 : 12;
			var boxTemp = CurGroupType == "SYSTEM" ? "app/templates/resource/image/detail-box-system" : "app/templates/resource/image/detail-box-custom";
			$("#DetailBox").html(template(boxTemp, {
				group: group
			}));
			uploadListenser();
			renderImages();
		}

	}

	/**
	 *	渲染对应分组图片列表
	 */
	function renderImages() {
		skip = 0;
		Pictures = [];
		$("#DetailBox .images-wrapper").html(template("app/templates/partial/loading", {}));
		$("#DetailBox .list-empty").addClass('hide');
		$("#DetailBox .more-wrapper").addClass('hide');

		ResourceService.image.getList(orgId, CurGroupId, skip, limit).done(function(data) {
			var pictures = data.result.data;
			var count = data.result.total;
			var hasMore = count > skip + pictures.length;

			Pictures = Pictures.concat(pictures);
			skip = pictures.length;

			var imagesTemp = CurGroupType == "SYSTEM" ? "app/templates/resource/image/images-system" : "app/templates/resource/image/images-custom";
			$("#DetailBox .images-wrapper").html(template(imagesTemp, {
				pictures: pictures,
				count: count,
				skip: skip,
				code: CurGroupCode
			}));

			if (!count) {
				$("#DetailBox .list-empty").removeClass('hide');
			}
			if (hasMore) {
				$("#DetailBox .more-wrapper").removeClass('hide');
			}

		}).fail(function(error) {
			Helper.alert(error);
			$("#DetailBox .images-wrapper").html('<div class="text-gray center">' + error + '</div>');
		});
	}

	/**
	 *	渲染更多图片列表
	 */
	function renderMoreImages(btn) {

		btn && Helper.begin(btn);
		ResourceService.image.getList(orgId, CurGroupId, skip, limit).done(function(data) {
			var pictures = data.result.data;
			var count = data.result.total;
			var hasMore = count > skip + pictures.length;

			Pictures = Pictures.concat(pictures);
			skip += pictures.length;

			var imagesTemp = CurGroupType == "SYSTEM" ? "app/templates/resource/image/images-system" : "app/templates/resource/image/images-custom";
			$("#DetailBox .images-wrapper").append(template(imagesTemp, {
				pictures: pictures,
				count: count,
				skip: skip,
				code: CurGroupCode
			}));

			if (hasMore) {
				$("#DetailBox .more-wrapper").removeClass('hide');
			} else {
				$("#DetailBox .more-wrapper").addClass('hide');
			}

		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			btn && Helper.end(btn);
		});
	}

	/**
	 *	监听图片上传事件
	 */
	function uploadListenser() {
		var $input = $("#Resource_ImageUpload");
		var fileCount;

		var imagesTemp = CurGroupType == "SYSTEM" ? "app/templates/resource/image/images-system" : "app/templates/resource/image/images-custom";
		uploader.image($input, orgId, CurGroupId ? CurGroupId : '', session, {
			height: 23,
			width: 80,
			onDialogClose: function(queueData) {
				fileCount = queueData.filesSelected;
			},
			onUploadStart: function(file) {
				var imagesbox = $("#DetailBox .images-wrapper");

				//设置上传按钮禁用
				$input.uploadify("disable", true);
				$input.uploadify("settings", 'buttonText', '上传中&nbsp;(' + ++file.index + '/' + fileCount + ')');

				//添加一项并显示加载中
				var children = imagesbox.children(".wrapper");
				if (children.length) {
					imagesbox.prepend(template(imagesTemp, {
						pictures: [{
							name: file.name
						}],
						count: 1
					}));
				} else {
					$("#DetailBox .list-empty").addClass('hide');
					imagesbox.html(template(imagesTemp, {
						pictures: [{
							name: file.name
						}],
						count: 1
					}));
				}
				var children = imagesbox.children(".wrapper");
				$(children[0]).find(".img-wrapper").addClass('loading');
			},
			onUploadProgress: function(file, bytesUploaded, bytesTotal, totalBytesUploaded, totalBytesTotal) {

			},
			onUploadSuccess: function(file, data, response) {
				var imagesbox = $("#DetailBox .images-wrapper");
				var children = imagesbox.children(".wrapper");

				data = $.parseJSON(data);
				if (data.status == "OK") {
					ResourceService.get(data.result).done(function(data) {
						Helper.successToast("图片上传成功");
						var picture = data.result;
						Pictures.splice(0, 0, picture);
						$(children[0]).replaceWith(template(imagesTemp, {
							pictures: [picture],
							count: 1
						}));
						skip++;
						//对应分组的图片数
						var curGroup = $("#Group_" + CurGroupId + " .group-count");
						var groupCount = +curGroup.text();
						curGroup.text(++groupCount);
					}).fail(function(error) {
						Helper.alert(error);
					});
				} else {
					$(children[0]).remove();
					Helper.alert(data.message);
				}
			},
			onUploadError: function(file, errorCode, errorMsg, errorString) {
				Helper.alert("图片 " + file.name + " 上传失败：" + errorString);
				var imagesbox = $("#DetailBox .images-wrapper");
				var children = imagesbox.children(".wrapper");
				$(children[0]).remove();
			},
			onQueueComplete: function(queueData) {
				//设置上传按钮可用
				$input.uploadify("disable", false);
				$input.uploadify("settings", 'buttonText', '本地上传');
			}
		});
	};

	/**
	 *	新建分组
	 */
	function addGroup(modal) {
		var _btn = $(this);
		var _input = modal.box.find('.input');
		var groupName = _input.val();

		if (!groupName.length) {
			Helper.errorToast("分组名称不能为空");
			return;
		}

		Helper.begin(_btn);
		ResourceService.image.group.add(orgId, groupName).done(function(data) {
			Helper.successToast("新建分组成功！");
			modal.close();
			renderGroups();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(_btn);
		});
	};

	/**
	 *	重命名分组
	 */
	function renameGroup(modal) {
		var _btn = $(this);
		var groupId = _btn.attr("data-value");
		var _input = modal.box.find('.input');
		var groupName = _input.val();

		if (!groupName.length) {
			Helper.errorToast("分组名称不能为空");
			return;
		}

		Helper.begin(_btn);
		ResourceService.image.group.update(groupId, groupName).done(function(data) {
			Helper.successToast("重命名分组成功！");
			modal.close();
			renderGroups();
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(_btn);
		});
	};


	/**
	 *	设置新建、重命名分组弹出框
	 */
	function groupInputModal(title, groupId, groupName, action) {
		Helper.singleInputModal({
			id: groupId || "",
			name: "分组名称",
			value: groupName || "",
			title: title,
			action: action
		});
	}

	/**
	 *	移动一张或多张图片到分组
	 */
	function moveImages(modal) {
		var _btn = $(this);
		var selectedImages = $("input[name=imageOption]:checked");

		if (!selectedImages.length) {
			Helper.errorToast("请至少选择一项");
			return;
		};

		var pictureIds = [];
		$.each(selectedImages, function(idx, input) {
			pictureIds.push($(input).attr("data-value"));
		});

		var selectedGroupId = $("input[name=group]:checked").attr("data-value");


		var curGroup = $("#Group_" + CurGroupId + " .group-count");
		var groupCount = +curGroup.text();
		var selectGroup = $("#Group_" + selectedGroupId + " .group-count");
		var selectGroupCount = +selectGroup.text();

		Helper.begin(_btn);
		ResourceService.image.move(orgId, pictureIds.join(','), selectedGroupId).done(function(data) {
			Helper.successToast("移动分组成功！");
			modal.close();
			$.each(pictureIds, function(idx, pictureId) {
				$("#Image_" + pictureId).remove();
			});
			//数据重置
			skip -= pictureIds.length;
			groupCount -= pictureIds.length;
			selectGroupCount += pictureIds.length;
			curGroup.text(groupCount);
			selectGroup.text(selectGroupCount);
			if (!groupCount) {
				$("#DetailBox .list-empty").removeClass('hide');
			}
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(_btn);
			//按钮回复默认
			$("#OptionBox >.btn").prop('disabled', true);
			$("input[name=AllImage]").prop('checked', false);
		});
	};

	/**
	 *	移动对应图片到分组
	 */
	function moveImage(modal) {
		var _btn = $(this);
		var pictureId = _btn.attr("data-value");
		var selectedGroupId = $("input[name=group]:checked").attr("data-value");

		var curGroup = $("#Group_" + CurGroupId + " .group-count");
		var groupCount = +curGroup.text();
		var selectGroup = $("#Group_" + selectedGroupId + " .group-count");
		var selectGroupCount = +selectGroup.text();

		Helper.begin(_btn);
		ResourceService.image.move(orgId, pictureId, selectedGroupId).done(function(data) {
			Helper.successToast("移动分组成功！");
			modal.close();

			$("#Image_" + pictureId).remove();
			--skip;
			--groupCount;
			curGroup.text(groupCount);
			selectGroup.text(++selectGroupCount);
			if (!groupCount) {
				$("#DetailBox .list-empty").removeClass('hide');
			}
		}).fail(function(error) {
			Helper.alert(error);
		}).always(function() {
			Helper.end(_btn);
		});
	};

	/**
	 *	分组选择弹出框
	 */
	function groupsModal(pictureId, action) {
		var groups = [];
		$.each(CustomGroups, function(idx, group) {
			if (!CurGroupId && !group.id) {
				return;
			};
			if (group.id != CurGroupId) {
				groups.push(group);
			};
		});

		if (!groups.length) {
			Helper.errorToast('没有可以移动的分组');
			return;
		};

		var options = {
			title: '移动分组',
			customGroups: groups,
			id: pictureId,
			actions: {
				'.btn-move': {
					event: 'click',
					fnc: action || moveImages
				}
			}
		};

		var modal = Helper.modal(options);
		modal.html(template('app/templates/resource/image/groups-modal', options));

	}

	/**
	 *	根据图片id获取当前位置
	 */
	function indexForPictures(pictureId) {
		var index = 0;
		$.each(Pictures, function(idx, picture) {
			if (picture.id == pictureId) {
				index = idx;
				return false;
			};
		});
		return index;
	}

	module.exports = controller;

});