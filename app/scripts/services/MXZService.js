define(function(require, exports, module) {
    var globalResponseHandler = require("ajaxHandler");

    exports.school = {
        getAllList: function() {
            return globalResponseHandler({
                url: 'mxz/search'
            }, {
                description: '获取所有学校列表'
            });
        },
        getList: function(orgId) {
            return globalResponseHandler({
                url: 'mxz/school/list',
                data: {
                    orgId: orgId
                }
            }, {
                description: '获取设置的学校列表'
            });
        },
        add: function(orgId, schools) {
            return globalResponseHandler({
                url: 'mxz/school/add',
                type: 'post',
                data: {
                    schoolJson: JSON.stringify({
                        orgId: orgId,
                        schools: schools
                    })
                }
            }, {
                description: '添加学校'
            });
        },
        remove: function(orgId, schoolId) {
            return globalResponseHandler({
                url: 'mxz/school/remove',
                type: 'post',
                data: {
                    orgId: orgId,
                    schoolId: schoolId
                }
            }, {
                description: '删除学校'
            });
        }
    };

});
