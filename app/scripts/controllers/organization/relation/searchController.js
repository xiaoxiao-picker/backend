define(function(require, exports, module) {
    var baseController = require('baseController');
    var template = require('template');
    var bC = new baseController();
    var OrganizationService = require('OrganizationService');
    var Helper = require("helper");
    var Pagination = require('lib.Pagination');

    var tmp, callback, orgId, session, limit, page;

    var Condition, CurrentOrgs, ResultOrgs;

    var Groups = ["管理", "学校官方", "社团联", "学生会", "部门", "学术", "艺术", "体育", "实践", "公益", "其他"];

    var Controller = function() {
        var _controller = this;
        _controller.namespace = "organization.search";
        _controller.actions = {
            // 显示选学校模态框
            showSchools: function() {
                require.async('SchoolSelector', function(SchoolSelector) {
                    SchoolSelector({
                        title: '选择学校',
                        isSearch: true,
                        select: function(school) {
                            var selector = this;
                            $("#SchoolText").val(school.name);
                            $("#SchoolText").attr("data-value", school.id);
                            selector.close();
                        }
                    });
                });
            },
            //根据条件搜索组织列表
            search: function() {
                var _btn = this;

                Condition.orgType = $("#OrgTypeContainer").val(),
                    Condition.schoolId = $("#SchoolText").attr("data-value"),
                    Condition.keyword = $("#OrgText").val();

                page = 1;
                renderResults(_btn);
            },
            //添加组织
            add: function() {
                var _btn = this;
                var relateId = this.attr("data-value");

                Helper.begin(_btn);
                OrganizationService.relation.add(orgId, relateId).done(function(data) {
                    $(_btn).addClass('hide');
                    $(_btn).next('.remark').removeClass('hide');

                    //添加到已关联组织数组中
                    var org = ResultOrgs.objOfAttr('id', relateId);
                    org.relateOrgId = relateId;
                    org.relation = true;
                    CurrentOrgs.push(org);

                }).fail(function(error) {
                    Helper.alert(error);
                }).always(function() {
                    Helper.end(_btn);
                });
            },
            showOrgInfo: function() {
                var _btn = this,
                    orgId = _btn.attr("data-value");

                require.async('OrganizationModal', function(OrganizationModal) {
                    OrganizationModal(orgId, {});
                });
            }
        };
    };

    bC.extend(Controller);
    Controller.prototype.init = function(templateName, fn) {
        var _controller = this;
        tmp = templateName;
        callback = fn;
        orgId = App.organization.info.id;
        session = App.getSession();
        limit = 20;
        page = 1;
        Condition = {};
        render();
    };

    function render() {
        OrganizationService.relation.getList(orgId).done(function(data) {
            CurrentOrgs = data.result;

            $('div.container.auth-container').html(template(tmp, {
                groups: Groups
            }));
        }).fail(function(error) {
            Helper.alert(error);
        }).always(function() {
            Helper.execute(callback);
        });
    }

    function renderResults(btn) {
        skip = (page - 1) * limit;

        if (Condition.orgType == "不限" && Condition.schoolId == '0' && Condition.keyword.length == 0) {
            Helper.errorToast("搜索条件需至少选择一项");
            return;
        }

        var data = {};
        if (Condition.orgType != "不限") {
            data.orgType = Condition.orgType;
        }
        if (Condition.schoolId != '0') {
            data.schoolId = Condition.schoolId;
        }
        if (Condition.keyword.length > 0) {
            data.keyword = Condition.keyword;
        }

        $("#ResultOptions").html(template("app/templates/partial/loading", {}));
        btn && Helper.begin(btn);
        OrganizationService.search(skip, limit, data).done(function(data) {
            var orgs = data.result.data;
            var count = data.result.total;

            trimResults(orgs);

            $("#ResultsContainer").html(template("app/templates/organization/relation/search-orgs", {
                orgs: ResultOrgs,
                count: count
            }));

            Pagination(count, limit, page, {
            	container: $('#ResultsContainer .footer'),
                switchPage: function(pageIndex) {
                    page = pageIndex;
                    renderResults();
                }
            });

            function trimResults(orgs) {
                ResultOrgs = [];
                $(orgs).each(function(index, org) {
                    org.relation = false;
                    if (org.id == orgId) {
                        count--;
                        return;
                    }
                    $(CurrentOrgs).each(function(c_index, curOrg) {
                        if (org.id == curOrg.id) {
                            org.relation = true;
                            return false;
                        }
                    });
                    ResultOrgs.push(org);
                });
            };
        }).fail(function(error) {
            Helper.alert(error);
        }).always(function() {
            btn && Helper.end(btn);
        });
    }



    module.exports = Controller;
});
