define(function(require, exports, module) {

	function getBaseInfo() {
		return [{
			name: '姓名',
			type: 'TEXT',
			value: 'name',
			must: true,
			selected: true,
			required: true
		}, {
			name: '手机',
			type: 'TEXT',
			value: 'phoneNumber',
			must: false,
			selected: false,
			required: true
		}, {
			name: '性别',
			type: 'RADIO',
			value: 'gender',
			must: false,
			selected: false,
			required: true
		}, {
			name: '学校',
			type: 'TEXT',
			value: 'school',
			must: false,
			selected: false,
			required: true
		}, {
			name: '学号',
			type: 'TEXT',
			value: 'studentId',
			must: false,
			selected: false,
			required: true
		}, {
			name: '入学时间',
			type: 'DATE',
			value: 'grade',
			must: false,
			selected: false,
			required: true
		}];
	};

	// 根据传入的基础信息集合获取所有基础信息集合
	function makeBaseInfo(texts, dates, choices) {
		var infos = [].concat(texts, dates, choices);
		var baseInfos = getBaseInfo();

		for (var i = 0, baseInfo; i < baseInfos.length; i++) {
			baseInfo = baseInfos[i];
			for (var j = 0, info; j < infos.length; j++) {
				info = infos[j];
				if (baseInfo.value == info.title) {
					baseInfo.id = info.id || "";
					baseInfo.selected = true;
					if (baseInfo.value == "gender") {
						baseInfo.options = info.options;
					}
					continue;
				}
			};
		};
		return baseInfos;
	};

	// 所需自定义信息，需要剔除基础信息
	function makeElseInfo(texts, dates, choices, images) {
		var infos = [];
		for (var i = 0; i < texts.length; i++) {
			var text = texts[i];
			if (["name", "phoneNumber", "gender", "school", "studentId", "grade"].indexOf(text.title) == -1) {
				infos.push(ElseInfo(text.id, text.title, text.type, text.required, text.rank));
			}
		};

		for (var i = 0; i < dates.length; i++) {
			var date = dates[i];
			if (date.title != "grade") {
				infos.push(ElseInfo(date.id, date.title, "DATE", date.required, date.rank));
			}
		};

		for (var i = 0; i < choices.length; i++) {
			var choice = choices[i];
			var type = choice.type == "SINGLETON" ? "RADIO" : "CHECKBOX";
			if (choice.title != "gender") {
				infos.push(ElseInfo(choice.id, choice.title, type, choice.required, choice.rank, choice.options));
			}
		};

		for (var i = 0; i < images.length; i++) {
			var image = images[i];
			infos.push(ElseInfo(image.id, image.title, "IMAGE", image.required, image.rank));
		};

		// 将信息按 rank 排序
		return infos.sort(function(info1, info2) {
			return info1.rank - info2.rank;
		});
	};

	function ElseInfo(id, title, type, required, rank, options) {
		return {
			id: id,
			title: title,
			type: type,
			required: required,
			rank: rank,
			options: options
		};
	};



	function getRequireInfo(baseInfos, elseInfos, requireId) {
		var infosData = {
			id: requireId,
			texts: [],
			dates: [],
			choices: [],
			images: []
		};
		var info, data;
		for (var i = 0; i < baseInfos.length; i++) {
			info = baseInfos[i];
			data = {
				id: info.id || "",
				title: info.value,
				required: true,
				rank: i + 1
			};
			if (!info.selected) continue;
			if (info.type == "TEXT") {
				data.type = "TEXT";
				infosData.texts.push(data);
			} else if (info.type == "DATE") {
				data.type = "DATE";
				infosData.dates.push(data);
			} else if (info.value == "gender") {
				data.type = "SINGLETON";
				data.options = info.options || [{
					id: "",
					name: "男",
					rank: 1
				}, {
					id: "",
					name: "女",
					rank: 2
				}];
				infosData.choices.push(data);
			}
		}


		for (var i = 0; i < elseInfos.length; i++) {
			info = elseInfos[i];
			data = {
				id: info.id || "",
				title: info.title,
				required: info.required,
				rank: baseInfos.length + i + 1
			};
			if (info.type == "TEXT" || info.type == "TEXTAREA") {
				data.type = info.type;
				infosData.texts.push(data);
			} else if (info.type == "DATE") {
				infosData.dates.push(data);
			} else if (info.type == "IMAGE") {
				infosData.images.push(data);
			} else if (info.type == "RADIO") {
				data.type = "SINGLETON";
				data.options = info.options;
				infosData.choices.push(data);
			} else if (info.type == "CHECKBOX") {
				data.type = "MULTIPLE";
				data.options = info.options;
				infosData.choices.push(data);
			}

		};
		return infosData;
	};



	exports.getRequireInfo = getRequireInfo;

	exports.makeBaseInfo = makeBaseInfo;
	exports.makeElseInfo = makeElseInfo;
});