define(function(require, exports, module) {
    var baseController = require('baseController');
    var bC = new baseController();
    var Helper = require("helper");
    var template = require('template');
    var EventService = require('EventService');
    var RelationService = require("RelationService");
    var Pagination = require('lib.Pagination');

    var orgId, eventId, session, status, skip, limit, page, advAvailable;

    var Controller = function() {
        var _controller = this;
        _controller.namespace = "event.info";
        _controller.actions = {
            showPublishOverlay: function() {
                $(".phone-overlay").removeClass('hide');
            },
            hidePublishOverlay: function() {
                $(".phone-overlay").addClass('hide');
            },
            //活动发布
            publish: function() {
                var _btn = this;
                Helper.confirm("活动发布后即对外开放，确定发布？", {}, function() {
                    eventHandle('PUBLISHED', eventId, _btn, function() {
                        window.location.hash = "events?state=PUBLISHED";
                    });
                });
            }
        };
    };
    bC.extend(Controller);
    /**
     * 初始化变量，渲染模板
     */
    Controller.prototype.init = function(templateName, fn) {
        eventId = Helper.param.hash('eventId');
        orgId = App.organization.info.id;
        session = App.getSession();
        advAvailable = App.organization.config.advAvailable;

        page = 1;
        limit = 8;
        this.render();
    };

    Controller.prototype.render = function() {
        var controller = this;
        if (window.Modernizr && (!window.Modernizr.svg || !window.Modernizr.rgba)) {
            Helper.alert('您当前浏览器版本过低，活动预览效果可能与手机设备有差，建议手机扫描页面左侧二维码查看效果！');
        }
        EventService.load(orgId, eventId).done(function(data) {
            var eventUrl = Helper.config.pages.frontRoot + "/index.html#organization/" + orgId + "/event/" + eventId + "/info";
            var eventInfo = data.result;
            //处理时间格式
            var eventTime,
                startTime = Helper.makedate(eventInfo.startDate, 'MM-dd'),
                endTime = Helper.makedate(eventInfo.endDate, 'MM-dd');
            if (startTime == endTime) {
                eventTime = Helper.makedate(eventInfo.startDate, 'MM-dd hh:mm') + '--' + Helper.makedate(eventInfo.endDate, 'hh:mm');
            } else {
                eventTime = Helper.makedate(eventInfo.startDate, 'MM-dd hh:mm') + '--' + Helper.makedate(eventInfo.endDate, 'MM-dd hh:mm');
            }
            eventInfo.date = eventTime;
            Helper.globalRender(template(controller.templateUrl, {
                eventId: eventId,
                orgId: orgId,
                eventUrl: eventUrl,
                eventQRcode: Helper.generateQRCode(eventUrl, session),
                eventInfo: eventInfo,
                session: session,
                organization: Application.organization
            }));
            Helper.copyClientboard(document.getElementById("CopyUrl"));
            renderTickets();
            renderVotes();
            renderSignList();
        }).fail(function(error) {
            Helper.alert(error);
        }).always(function() {
            Helper.execute(controller.callback);
        });
    };

    function renderTickets() {
        RelationService.getList('EVENT', eventId, 'TICKET').done(function(data) {
            $("#TicketContainer").html(template('app/templates/event/preview/ticket', {
                tickets: data.result
            }));
        }).fail(function(error) {
            Helper.alert(error);
        });
    };

    function renderVotes() {
        RelationService.getList('EVENT', eventId, 'VOTE').done(function(data) {
            $("#VoteContainer").html(template('app/templates/event/preview/vote', {
                votes: data.result
            }));
        }).fail(function(error) {
            Helper.alert(error);
        });
    };

    function renderSignList() {
        skip = (page - 1) * limit;

        EventService.signup.users(eventId, skip, limit).done(function(data) {
            var members = data.result.data;
            var total = data.result.total;
            $("#MemberContainer").html(template('app/templates/event/info/joinedMembers', {
                eventId: eventId,
                orgId: orgId,
                count: total,
                members: members,
                session: session
            }));

            Pagination(total, limit, page, {
            	container: $('.page-container'),
            	theme: 'SIMPLE',
                switchPage: function(pageIndex) {
                    page = pageIndex;
                    renderSignList();
                }
            });

        }).fail(function(error) {
            Helper.alert(error);
        });
    };

    /**
     *	发布、下线、回收站、退回原处
     */
    function eventHandle(state, eventId, btn, successFnc) {
        Helper.begin(btn);
        EventService.changeState(eventId, state).done(function(data) {
            successFnc();
        }).fail(function(error) {
            Helper.alert(error);
        }).always(function() {
            Helper.end(btn);
        });
    };

    module.exports = Controller;
});
