define(function(require, exports, module) {
	var template = require('template');
	var Helper = require("helper");
	var PublicService = require("PublicService");

	var config = require("config");

	var Application = require('factory.application');
	window.App = Application;


	var session = store.get("userSession");
	var user = {};
	// 记住登陆状态
	var rememberAccount = true;

	var options = [{
		icon: 'function-1-1',
		title: 'section-func-1-1.png',
		content: '精妙策划，在线发布'
	}, {
		icon: 'function-1-2',
		title: 'section-func-1-2.png',
		content: '文章列表，轻松查找'
	}, {
		icon: 'function-1-3',
		title: 'section-func-1-3.png',
		content: '一键投票，电子调研'
	}, {
		icon: 'function-1-4',
		title: 'section-func-1-4.png',
		content: '活动历史，尽在其中'
	}, {
		icon: 'function-2-1',
		title: 'section-func-2-1.png',
		content: '用户需求，及时反馈'
	}, {
		icon: 'function-2-2',
		title: 'section-func-2-2.png',
		content: '问题建议，随时提交'
	}, {
		icon: 'function-2-3',
		title: 'section-func-2-3.png',
		content: '个性设置，花样随心'
	}, {
		icon: 'function-2-4',
		title: 'section-func-2-4.png',
		content: '组织成员，线上管理'
	}, {
		icon: 'function-3-1',
		title: 'section-func-3-1.png',
		content: '文件音乐，无限上传'
	}, {
		icon: 'function-3-2',
		title: 'section-func-3-2.png',
		content: '社团公告，实时发布'
	}, {
		icon: 'function-3-3',
		title: 'section-func-3-3.png',
		content: '组织介绍，风采展示'
	}, {
		icon: 'function-3-4',
		title: 'section-func-3-4.png',
		content: '智能表单，一键导出'
	}, {
		icon: 'function-4-1',
		title: 'section-func-4-1.png',
		content: '相关组织，内容共享'
	}, {
		icon: 'function-4-2',
		title: 'section-func-4-2.png',
		content: '个人资料，一应俱全'
	}, {
		icon: 'function-4-3',
		title: 'section-func-4-3.png',
		content: '注册登录，瞬间绑定'
	}, {
		icon: 'function-4-4',
		title: 'section-func-4-4.png',
		content: '丢三落四，不再担心'
	}];

	var examples = [{
		image: 'section-4-5.png',
		title: '复旦大学',
		subTitle: 'Fudan University',
		orgId: 1318,
	}, {
		image: 'section-4-4.png',
		title: '浙江大学',
		subTitle: 'Zhejiang University',
		orgId: 1206,
	}, {
		image: 'section-4-3.png',
		title: '西安交通大学',
		subTitle: 'Xi`an Jiaotong University',
		orgId: 1710,
	}, {
		image: 'section-4-6.png',
		title: '北京科技大学',
		subTitle: 'University Of Science and Technology Beijing',
		orgId: 1459,
	}, {
		image: 'section-4-7.png',
		title: '大连理工大学',
		subTitle: 'Dalian University of Technology',
		orgId: 1273,
	}, {
		image: 'section-4-2.png',
		title: '中国矿业大学',
		subTitle: 'China University Of Mining And Technology',
		orgId: 1222,
	}];

	var schools = [{
		logo: 'section-5-2.png'
	}, {
		logo: 'section-5-3.png'
	}, {
		logo: 'section-5-4.png'
	}, {
		logo: 'section-5-5.png'
	}, {
		logo: 'section-5-6.png'
	}, {
		logo: 'section-5-7.png'
	}, {
		logo: 'section-5-8.png'
	}, {
		logo: 'section-5-9.png'
	}, {
		logo: 'section-5-10.png'
	}, {
		logo: 'section-5-11.png'
	}];



	if (session && rememberAccount) {
		$.ajax({
			dataType: "json",
			timeout: 20000,
			cache: false,
			url: '/api-oa/session/get-user',
			data: {
				session: session
			}
		}).done(function(data) {
			if (data.status == "OK") {
				App.setSession(session);
				user = data.result || {};
				render();
			} else {
				createSession();
			}
		}).fail(function(error) {
			createSession();
		});
	} else {
		createSession();
	}


	function createSession() {
		PublicService.createSession().done(function(data) {
			session = data.result;
			App.setSession(session);
			render();
		}).fail(function(error) {
			Helper.alert(error);
		});
	}

	function render() {
		$.each(examples, function(idx, item) {
			item.url = Helper.config.pages.frontRoot + "/index.html#organization/" + item.orgId + "/index";
			item.qrcode = "http://" + window.location.host + "/api-oa/barcode/generate?value=" + encodeURIComponent(item.url) + "&session=" + Application.getSession();
		});
		$('div.front-loading').after(template('app/templates/index/index', {
			user: user,
			rememberAccount: rememberAccount,
			options: options,
			examples: examples,
			schools: schools
		})).remove();

		$('.section1 .inner-section').addClass('first-show');

		(function scrollForNavTabs() {
			var tabs = $('#NavTabs');

			function scroll(container) {
				var y = container.scrollTop();

				if (y >= 554) {
					tabs.addClass('fixed');
					$('.menu-options .option-top').addClass('show');
				} else {
					tabs.removeClass('fixed');
					$('.menu-options .option-top').removeClass('show');
				}
			};

			$(window).scroll(function() {
				scroll($(this));
			});
		})();
	}

	function renderCaptcha() {
		var session = App.getSession();
		$('#CaptchaImage').attr('src', '/api-oa/session/captcha/get?session=' + session + '&date=' + new Date().getTime());
	}

	function renderPasswordCaptcha() {
		var session = App.getSession();
		$('#PwdCaptchaImage').attr('src', '/api-oa/session/captcha/get?session=' + session + '&date=' + new Date().getTime());
	}


	var actions = {
		refreshCaptcha: function() {
			renderCaptcha();
		},
		refreshPasswordCaptcha: function() {
			renderPasswordCaptcha();
		},
		login: function(event) {
			Helper.preventDefault(event);
			var login_btn = this;
			var userName = $.trim($("#LoginForm").find("#userName").val());
			var password = $.trim($("#LoginForm").find("#password").val());
			if (Helper.validation.isEmpty(userName)) {
				Helper.errorToast("手机号不能为空！");
				return;
			}
			if (!Helper.validation.isPhoneNumber(userName)) {
				Helper.errorToast(config.tips.userName);
				return;
			}
			if (!Helper.validation.isPassword(password)) {
				Helper.errorToast(config.tips.password);
				return;
			}

			Helper.begin(login_btn);
			PublicService.login(userName, password).done(function(data) {
				window.location.href = "./guide.html";
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.end(login_btn);
			});
		},
		signup: function(event) {
			Helper.preventDefault(event);
			var btn = this;
			var form = $("#SignupForm");
			var userName = $.trim(form.find("#UserName").val());
			var authCode = $.trim(form.find("#AuthCode").val());
			var password = $.trim(form.find("#Password").val());
			var repassword = $.trim(form.find("#Repassword").val());
			if (Helper.validation.isEmpty(userName)) {
				Helper.errorToast("手机号不能为空！");
				return;
			}
			if (!Helper.validation.isPhoneNumber(userName)) {
				Helper.errorToast(config.tips.userName);
				return;
			}
			if (!Helper.validation.isAuthCode(authCode)) {
				Helper.errorToast(config.tips.authCode);
				return;
			}
			if (!Helper.validation.isPassword(password)) {
				Helper.errorToast(config.tips.password);
				return;
			}
			if (password != repassword) {
				Helper.errorToast("两次密码不一致");
				return;
			}

			Helper.begin(btn);
			PublicService.register(userName, authCode, password).done(function(data) {
				Helper.alert("恭喜你，注册成功！", function() {
					$('.section1 .inner-section .container').removeClass('signup');
					$('.section1 .inner-section .container').addClass('notlogin');
					$('#userName').val(userName);
					$('#password').val(password);
				});
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.end(btn);
			});
		},
		/**
		 * get token
		 */
		getSignupAuthCode: function(event) {
			var btn = this;
			var ipt_userName = $("#SignupForm").find("#UserName");
			var ipt_captcha = $("#SignupForm").find("#Captcha");
			var userName = $.trim(ipt_userName.val());
			var captcha = $.trim(ipt_captcha.val());
			var captchaType = btn.attr("data-captcha-type");

			if (Helper.validation.isEmpty(userName)) {
				Helper.errorToast("手机号不能为空！");
				return;
			}
			if (!Helper.validation.isPhoneNumber(userName)) {
				Helper.errorToast("手机号格式不对！");
				return;
			}
			if (Helper.validation.isEmpty(captcha)) {
				Helper.errorToast("图片字符串不能为空！");
				return;
			}

			Helper.begin(btn);

			var action, message;
			if (captchaType == "message") {
				action = "requestLoginToken";
			} else {
				action = "requestVoiceLoginToken";
			}
			PublicService[action](userName, captcha).done(function(data) {
				var delay = 30;

				function waiting() {
					Helper.process(btn);
					btn.find("#Waiting").text((delay--) + "秒后可重试");
					if (delay == 0) {
						Helper.end(btn);
						return;
					}
					setTimeout(waiting, 1000);
				}
				waiting();
			}).fail(function(error) {
				Helper.alert(error);
				Helper.end(btn);
				renderCaptcha();
			});
		},
		relogin: function() {
			PublicService.logout(session);
			PublicService.createSession().done(function(data) {
				session = data.result;
				Application.setSession(session);
				user = {};

				$('.section1 .inner-section .container').removeClass('logged');
				$('.section1 .inner-section .container').addClass('notlogin');
			});
		},
		retrievePasswordModal: function() {
			Helper.modal({
				template: "app/templates/index/retrievePassword"
			});
			renderPasswordCaptcha();
		},
		getRetrievePasswordAuthCode: function() {
			var btn = this;
			var ipt_userName = $("#RetrievePasswordBox").find("#UserName");
			var ipt_captcha = $("#RetrievePasswordBox").find("#Captcha");
			var userName = $.trim(ipt_userName.val());
			var captcha = $.trim(ipt_captcha.val());
			var captchaType = btn.attr("data-captcha-type");

			if (Helper.validation.isEmpty(userName)) {
				Helper.errorToast("手机号不能为空！");
				return;
			}
			if (!Helper.validation.isPhoneNumber(userName)) {
				Helper.errorToast("手机号格式不对！");
				return;
			}
			if (Helper.validation.isEmpty(captcha)) {
				Helper.errorToast("图片字符串不能为空！");
				return;
			}

			var action, message;
			if (captchaType == "message") {
				action = "requestResetPasswordToken";
			} else {
				action = "requestVoiceResetPasswordToken";
			}

			Helper.begin(btn);
			PublicService[action](userName, captcha).done(function(data) {
				var delay = 30;

				function waiting() {
					Helper.process(btn);
					btn.find("#Waiting").text((delay--) + "秒后可重试");
					if (delay == 0) {
						Helper.end(btn);
						return;
					}
					setTimeout(waiting, 1000);
				}
				waiting();
			}).fail(function(error) {
				Helper.alert(error);
				Helper.end(btn);
				renderPasswordCaptcha();
			});
		},
		retrievePassword: function() {
			var btn = this;
			var form = btn.parents("form");
			var userName = form.find("#UserName").val();
			var authCode = form.find("#AuthCode").val();
			var password = form.find("#Password").val();
			var repassword = form.find("#Repassword").val();
			if (!Helper.validation.isPhoneNumber(userName)) {
				Helper.errorToast(config.tips.userName);
				return;
			}
			if (!Helper.validation.isAuthCode(authCode)) {
				Helper.errorToast(config.tips.authCode);
				return;
			}
			if (!Helper.validation.isPassword(password)) {
				Helper.errorToast(config.tips.password);
				return;
			}
			if (password != repassword) {
				Helper.errorToast("两次密码不一致");
				return;
			}


			Helper.begin(btn);
			PublicService.resetPassword(userName, authCode, password).done(function(data) {
				Helper.alert("恭喜你，修改成功！", function() {
					$("#RetrievePasswordBox").remove();
					$("#userName").val(userName);
					$("#password").val(password);
				});
			}).fail(function(error) {
				Helper.alert(error);
			}).always(function() {
				Helper.end(btn);
			});
		},
		showLogin: function() {
			$('.section2 .inner-section .buttons .btn-enter').addClass('hide');

			$('.section1 .inner-section').removeClass('first-show').removeClass('signup').addClass('enter');

			$('.section1 .inner-section .container').removeClass('signup');
			if (rememberAccount && user.id) {
				$('.section1 .inner-section .container').removeClass('notlogin');
				$('.section1 .inner-section .container').addClass('logged');
			} else {
				$('.section1 .inner-section .container').removeClass('logged');
				$('.section1 .inner-section .container').addClass('notlogin');
			}

		},
		showSignup: function() {
			$("#SignupForm input").val("");
			$('.section1 .inner-section').addClass('signup');

			$('.section1 .inner-section .container').removeClass('notlogin');
			$('.section1 .inner-section .container').removeClass('logged');
			$('.section1 .inner-section .container').addClass('signup');

			renderCaptcha();
		},
		switchTabs: function() {
			var _btn = this;
			index = _btn.attr('data-index');

			var section1_height = $(".section.section1").height();
			var section2_height = $(".section.section2").height();
			var section3_height = $(".section.section3").height();
			var section4_height = $(".section.section4").height();
			var top;
			if (index == 0) {
				top = section1_height + 124;
			} else if (index == 1) {
				top = section1_height + section2_height - 44;
			} else if (index == 2) {
				top = section1_height + section2_height + section3_height - 44;
			} else if (index == 3) {
				top = section1_height + section2_height + section3_height + section4_height - 44;
			}
			$('body').animate({
				scrollTop: top + 'px'
			}, 200);
		},
		backToTop: function() {
			$('body').animate({
				scrollTop: 0
			}, 200);
		}
	};

	Helper.globalEventListener("click", "data-xx-action", actions);
});