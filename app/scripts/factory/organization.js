define(function(require, exports, module) {
	var OrganizationService = require('OrganizationService');
	var ArticleService = require("ArticleService");
	var EventService = require("EventService");
	var ProposalService = require("ProposalService");
	var WechatAuthService = require("WechatAuthService");
	var HomePageService = require("HomePageService");
	var MXZService = require('MXZService');

	var WalletService = require("WalletService");
	var Helper = require("helper");
	var template = require('template');

	var advertisementAuth = require("scripts/public/advertisementAuth");

	var Organization = function(id, options) {
		options = $.extend({}, options);
		this.id = id;
		this.info = options.info;
		this.advertisementAuth = advertisementAuth.indexOfAttr("id", id) > -1;
	};

	Organization.prototype.reload = function() {
		var organization = this;
		return OrganizationService.get(organization.id).done(function(data) {
			organization.info = data.result;
		});
	};

	Organization.prototype.getExtend = function(refresh) {
		var organization = this;
		if (refresh || !organization.extend) {
			return OrganizationService.getExtendInfo(organization.id).done(function(data) {
				organization.extend = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.getConfig = function(refresh) {
		var organization = this;
		if (refresh || !organization.config) {
			return OrganizationService.config.get(organization.id).done(function(data) {
				organization.config = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.getWechat = function(refresh) {
		var organization = this;
		if (refresh || !organization.wechat) {
			return OrganizationService.wechat(organization.id).done(function(data) {
				organization.wechat = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};
	Organization.prototype.getHomepages = function(refresh) {
		var organization = this;
		if (refresh || !organization.homepages) {
			return HomePageService.getList(organization.id, 0, 0).done(function(data) {
				organization.homepages = data.result.data;
			});
		} else {
			return resolveDeferredObject();
		}
	};
	// 活动分类
	Organization.prototype.getEventCategories = function(refresh) {
		var organization = this;
		if (refresh || !organization.eventCategories) {
			return EventService.category.list(organization.id).done(function(data) {
				organization.eventCategories = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};
	// 文章分类
	Organization.prototype.getArticleCategories = function(refresh) {
		var organization = this;
		if (refresh || !organization.articleCategories) {
			return ArticleService.category.list(organization.id).done(function(data) {
				organization.articleCategories = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};
	// 提案分类
	Organization.prototype.getProposalCategories = function(refresh) {
		var organization = this;
		if (refresh || !organization.proposalCategories) {
			return ProposalService.category.list(organization.id).done(function(data) {
				organization.proposalCategories = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};
	// 组织风采分类
	Organization.prototype.getExhibitionCategories = function(refresh) {
		var organization = this;
		if (refresh || !organization.exhibitionCategories) {
			return OrganizationService.category.getList(organization.id).done(function(data) {
				organization.exhibitionCategories = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};


	Organization.prototype.getRelatedOrganizations = function(refresh) {
		var organization = this;
		if (refresh || !organization.relatedOrganizations) {
			return OrganizationService.relation.getList(organization.id).done(function(data) {
				organization.relatedOrganizations = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	// 获取萌小助教务系统功能的绑定学校的列表
	Organization.prototype.getRelatedMXZSchools = function(refresh) {
		var organization = this;
		if (refresh || !organization.relatedMXZSchools) {
			return MXZService.school.getList(organization.id).done(function(data) {
				organization.relatedMXZSchools = data.result;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.getWalletAccounts = function(refresh) {
		var organization = this;
		if (refresh || !organization.walletAccounts) {
			return WalletService.account.getList(organization.id).done(function(data) {
				organization.walletAccounts = data.result.data;
			});
		} else {
			return resolveDeferredObject();
		}
	};

	Organization.prototype.authWechat = function() {
		var organization = this;
		organization.getWechat().done(function() {
			var wechat = organization.wechat;
			if (wechat && wechat.id) {
				WechatAuthService.isAuthorizer(wechat.id).done(function(data) {
					if (data && data.result === false) {
						require.async('scripts/lib/AuthWechatGuide', function(AuthWechatGuide) {
							AuthWechatGuide({});
						});
					}
				}).fail(function(error) {
					// not handle this error
				});
			}
		}).fail(function(error) {
			// not handle this error
		});
	};

	Organization.prototype.configUpdate = function(data) {
		return OrganizationService.config.update(this.id, data);
	};


	module.exports = function(id, options) {
		return new Organization(id, options);
	};


	// 返回一个拒绝的Deferred对象
	function resolveDeferredObject() {
		var defer = $.Deferred();
		defer.resolve();
		return defer.promise();
	}
});