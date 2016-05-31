// Generated on 2014-10-21 using
// generator-webapp 0.5.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// If you want to recursively match all subfolders, use:
// 'test/spec/**/*.js'

module.exports = function(grunt) {


	// Time how long tasks take. Can help when optimizing build times
	require('time-grunt')(grunt);

	// Load grunt tasks automatically
	require('load-grunt-tasks')(grunt);

	var style = require('grunt-cmd-transport').style.init(grunt);

	// Configurable paths
	var config = {
		app: 'app',
		dist: 'dist'
	};

	// Define the configuration for all the tasks
	grunt.initConfig({

		// Project settings
		config: config,

		// Watches files for changes and runs tasks based on the changed files
		watch: {
			bower: {
				files: ['bower.json'],
				tasks: ['bowerInstall']
			},
			js: {
				files: ['<%= config.app %>/scripts/**/*.js'],
				tasks: ['jshint'],
				options: {
					livereload: true
				}
			},
			jstest: {
				files: ['test/spec/{,*/}*.js'],
				tasks: ['test:watch']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			},
			sass: {
				files: ['app/styles/**/*.scss', 'app/styles/**/**/*.scss'],
				tasks: ['sass:server', 'autoprefixer']
			},
			styles: {
				files: ['<%= config.app %>/styles/**/*.css'],
				tasks: ['newer:copy:styles', 'autoprefixer']
			},
			livereload: {
				options: {
					livereload: '<%= connect.options.livereload %>'
				},
				files: [
					'<%= config.app %>/{,*/}*.html',
					'.tmp/styles/{,*/}*.css',
					'<%= config.app %>/images/{,*/}*'
				]
			},
			template: {
				files: ['app/templates/**/*.html', 'app/templates/**/**/*.html'],
				tasks: ['tmod:template']
			}
		},

		// The actual grunt server settings
		connect: {
			options: {
				port: 9000,
				open: true,
				livereload: 35729,
				// Change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			livereload: {
				options: {
					middleware: function(connect) {
						return [
							connect.static('.tmp'),
							connect().use('/bower_components', connect.static('./bower_components')),
							connect.static(config.app)
						];
					}
				}
			},
			test: {
				options: {
					open: false,
					port: 9001,
					middleware: function(connect) {
						return [
							connect.static('.tmp'),
							connect.static('test'),
							connect().use('/bower_components', connect.static('./bower_components')),
							connect.static(config.app)
						];
					}
				}
			},
			dist: {
				options: {
					base: '<%= config.dist %>',
					livereload: false
				}
			}
		},

		// Empties folders to start fresh
		clean: {
			dist: {
				files: [{
					dot: true,
					src: [
						'.tmp',
						'<%= config.dist %>/*',
						'!<%= config.dist %>/.git*'
					]
				}]
			},
			server: '.tmp',

			// 项目打包后清除中间文件
			afterbuild: {
				files: [{
					dot: true,
					src: [

						'dist/scripts/factory',
						'dist/scripts/middlewares',
						'dist/scripts/public',
						'dist/scripts/services',
						'dist/scripts/baseConfig.js',
						'dist/scripts/baseController.js',
						'dist/scripts/router.js',
						'dist/sui/vendor',
					]
				}]
			}
		},

		// Make sure code styles are up to par and there are no obvious mistakes
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'!Gruntfile.js',
				'app/plugins/ueditor/ueditor.all.js',
				'!<%= config.app %>/scripts/**/*.js',
				'!<%= config.app %>/scripts/vendor/*',
				'!test/spec/{,*/}*.js'
			]
		},

		// Mocha testing framework configuration options
		mocha: {
			all: {
				options: {
					run: true,
					urls: ['http://<%= connect.test.options.hostname %>:<%= connect.test.options.port %>/home.html']
				}
			}
		},

		// cmd-transport
		transport: {
			options: {
				paths: ['app'],
				debug: false,
				alias: {
					"template": "scripts/public/template",
					"uploadify": "plugins/uploadify/jquery.uploadify",

					"baseController": "scripts/baseController",

					// factory
					"factory.application": "scripts/factory/application",
					"factory.organization": "scripts/factory/organization",
					"factory.user": "scripts/factory/user",
					"factory.guid": "scripts/factory/guid",

					// public
					"ajaxHandler": "scripts/public/ajaxHandler",
					"array": "scripts/public/array",
					"browser": "scripts/public/browser",
					"config": "scripts/public/config",
					"DataFilter": "scripts/public/DataFilter",
					"date": "scripts/public/date",
					"eventListener": "scripts/public/eventListener",
					"formatCurrency": "scripts/public/formatCurrency",
					"generateQRCode": "scripts/public/generateQRCode",
					"helper": "scripts/public/helper",
					"Alert": "scripts/public/Ly.alert",
					"Toast": "scripts/public/Ly.toast",
					"Tooltip": "scripts/public/Ly.tooltip",
					"Modal": "scripts/public/Ly.modal",
					"Dropdown": "scripts/public/Ly.dropdown",
					"router": "scripts/public/router",
					"smartEvent": "scripts/public/smartEvent",
					"validation": "scripts/public/validation",

					"requireUserInfo": "scripts/public/requireUserInfo",
					"NotificationBox": "scripts/public/NotificationBox",
					"observe": "scripts/public/observe",

					// lib/notification
					"systemBox": "scripts/lib/notification/systemBox",
					"memberBox": "scripts/lib/notification/memberBox",
					"feedbackBox": "scripts/lib/notification/feedbackBox",
					"proposalBox": "scripts/lib/notification/proposalBox",
					"otherBox": "scripts/lib/notification/otherBox",

					// lib
					"AdvertSelector": "scripts/lib/AdvertSelector",
					"Applicant": "scripts/lib/Applicant",
					"ATM": "scripts/lib/ATM",
					"Color": "scripts/lib/Color",
					"ColorPicker": "scripts/lib/ColorPicker",
					"ColorImagePicker": "scripts/lib/ColorImagePicker",
					"CommonModal": "scripts/lib/CommonModal",
					"lib.commentBox": "scripts/lib/commentBox",
					"lib.textareaModal": "scripts/lib/textareaModal",
					"dateCompare": "scripts/lib/dateCompare",
					"FormBox": "scripts/lib/FormBox",
					"FormModel": "scripts/lib/FormModel",
					"ueditor": "scripts/lib/ueditor",
					"SchoolSelector": "scripts/lib/SchoolSelector",
					"UserSelector": "scripts/lib/UserSelector",
					"MusicBox": "scripts/lib/MusicBox",
					"ChartBox": "scripts/lib/ChartBox",
					"facebox": "scripts/lib/facebox",
					"linkbox": "scripts/lib/linkbox",
					"ImageSelector": "scripts/lib/ImageSelector",
					"ImageBrowser": "scripts/lib/ImageBrowser",
					"ImageCrop": "scripts/lib/ImageCrop",
					"VoteSelector": "scripts/lib/VoteSelector",
					"TicketSelector": "scripts/lib/TicketSelector",
					"GuideModal": "scripts/lib/GuideModal",
					"KeywordModel": "scripts/lib/KeywordModel",
					"lib.UserModal": "scripts/lib/userModal",
					"lib.MemberModal": "scripts/lib/MemberModal",
					"SignUpTimeBox": "scripts/lib/SignUpTimeBox",
					"TicketTimeBox": "scripts/lib/TicketTimeBox",
					"OrganizationModal": "scripts/lib/OrganizationModal",
					"lib.richEditorModal": "scripts/lib/richEditorModal",
					// 登陆层
					"lib.LoginModal": "scripts/lib/LoginModal",
					"lib.ImageModal": "scripts/lib/ImageModal",
					"lib.CategorySelector": "scripts/lib/CategorySelector",
					"lib.DatetimeGroup": "scripts/lib/datetimeGroup",
					"lib.Pagination": "scripts/lib/Pagination",

					// config
					"config.colors": "scripts/config/colors",
					"config.icons": "scripts/config/icons",
					"config.func-guide": "scripts/config/func-guide",
					"config.bank": "scripts/config/bank",

					// models
					"UserModel": "scripts/models/UserModel",



					// services
					"AdvertisementService": "scripts/services/AdvertisementService",
					"ArticleService": "scripts/services/ArticleService",
					"AutoreplyService": "scripts/services/AutoreplyService",
					"CommentService": "scripts/services/CommentService",
					"EventService": "scripts/services/EventService",
					"ExportService": "scripts/services/ExportService",
					"FeedbackService": "scripts/services/FeedbackService",
					"HomePageService": "scripts/services/HomePageService",
					"LostService": "scripts/services/LostService",
					"MemberApplyService": "scripts/services/MemberApplyService",
					"MemberService": "scripts/services/MemberService",
					"NoticeService": "scripts/services/NoticeService",
					"OrganizationService": "scripts/services/OrganizationService",
					"NotificationService": "scripts/services/NotificationService",
					"ProposalService": "scripts/services/ProposalService",
					"PublicService": "scripts/services/PublicService",
					"QuestionnaireService": "scripts/services/QuestionnaireService",
					"RelationService": "scripts/services/RelationService",
					"ResourceService": "scripts/services/ResourceService",
					"TicketService": "scripts/services/TicketService",
					"UserService": "scripts/services/UserService",
					"VoteService": "scripts/services/VoteService",
					"WechatService": "scripts/services/WechatService",
					"WallService": "scripts/services/WallService",
					"WechatAttentionService": "scripts/services/WechatAttentionService",
					"WechatAuthService": "scripts/services/WechatAuthService",
					"WechatResourceService": "scripts/services/WechatResourceService",
					"WalletService": "scripts/services/WalletService",
					"SchoolService": "scripts/services/SchoolService",
					"TaskService": "scripts/services/TaskService",
					"ReportService": "scripts/services/ReportService",
					"MXZService": "scripts/services/MXZService",
					"LotteryService": "scripts/services/LotteryService",

					// plugins
					"datetimepicker": "plugins/datetimepicker/bootstrap-datetimepicker",
					"hashchange": "plugins/hashchange",
					"ueditor.all": "plugins/ueditor/ueditor.all",
					"ueditor.config": "plugins/ueditor/ueditor.config",
					"select2": "plugins/select2/select2",
					"select2.css": "plugins/select2/select2.css"

				}
			},
			release: {
				files: [{
					expand: true,
					cwd: 'app',
					src: [
						'scripts/**/*.js',
						'!scripts/**/--*.js'
					],
					dest: 'dist'
				}, {
					expand: true,
					src: ['.tmp/**/*.css', 'app/styles/**/*.css', 'bower_components/font-awesome/css/font-awesome.css']
				}]
			}
		},

		// Compiles Sass to CSS and generates necessary files if requested
		sass: {
			options: {
				sourceMap: true,
				includePaths: ['bower_components']
			},
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/styles',
					src: ['*.{scss,sass}'],
					dest: '.tmp/styles',
					ext: '.css'
				}]
			},
			server: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/styles',
					src: ['*.{scss,sass}'],
					dest: '.tmp/styles',
					ext: '.css'
				}]
			}
		},

		// Add vendor prefixed styles
		autoprefixer: {
			options: {
				browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'ie 8', 'ie 9', 'ie 10', 'ie 11']
			},
			dist: {
				files: [{
					expand: true,
					cwd: '.tmp/styles/',
					src: ['**/*.css', '!**/noprefixer.css'],
					dest: '.tmp/styles/'
				}]
			}
		},

		// Automatically inject Bower components into the HTML file
		wiredep: {
			app: {
				ignorePath: /^\/|\.\.\//,
				src: ['<%= config.app %>/home.html'],
				exclude: ['bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js']
			},
			sass: {
				src: ['<%= config.app %>/styles/{,*/}*.{scss,sass}'],
				ignorePath: /(\.\.\/){1,2}bower_components\//
			}
		},

		// Renames files for browser caching purposes
		rev: {
			dist: {
				files: {
					src: [
						'<%= config.dist %>/sui/*.js',
						'<%= config.dist %>/styles/{,*/}*.css'
					]
				}
			}
		},

		// Reads HTML for usemin blocks to enable smart builds that automatically
		// concat, minify and revision files. Creates configurations in memory so
		// additional tasks can operate on them
		useminPrepare: {
			options: {
				dest: '<%= config.dist %>'
			},
			html: '<%= config.app %>/*.html'
		},

		// Performs rewrites based on rev and the useminPrepare configuration
		usemin: {
			options: {
				assetsDirs: [
					'<%= config.dist %>',
					'<%= config.dist %>/images',
					'<%= config.dist %>/styles'
				]
			},
			html: ['<%= config.dist %>/**/*.html'],
			css: ['<%= config.dist %>/styles/**/*.css']
		},

		// The following *-min tasks produce minified files in the dist folder
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/images',
					src: '**/*.{gif,jpeg,jpg,png,svg}',
					dest: '<%= config.dist %>/images'
				}]
			}
		},

		svgmin: {
			dist: {
				files: [{
					expand: true,
					cwd: '<%= config.app %>/images',
					src: '**/*.svg',
					dest: '<%= config.dist %>/images'
				}]
			}
		},

		htmlmin: {
			dist: {
				options: {
					collapseBooleanAttributes: true,
					collapseWhitespace: true,
					conservativeCollapse: true,
					removeAttributeQuotes: true,
					removeCommentsFromCDATA: true,
					removeEmptyAttributes: true,
					removeOptionalTags: true,
					removeRedundantAttributes: true,
					useShortDoctype: true
				},
				files: [{
					expand: true,
					cwd: '<%= config.dist %>',
					src: ['**/*.html', '!plugins/**/*'],
					dest: '<%= config.dist %>'
				}]
			}
		},

		// By default, your `index.html`'s <!-- Usemin block --> will take care
		// of minification. These next options are pre-configured if you do not
		// wish to use the Usemin blocks.
		cssmin: {
			dist: {
				files: {
					'<%= config.dist %>/styles/main.css': ['<%= config.dist %>/styles/main.css'],
					'<%= config.dist %>/styles/vendor.css': ['<%= config.dist %>/styles/vendor.css'],
					'<%= config.dist %>/styles/index.css': ['<%= config.dist %>/styles/index.css']
				}
			}
		},
		uglify: {
			options: {
				banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> build by Picker */\n'
			},
			dist: {
				files: [{
					//'dist/scripts/application.js': 'dist/scripts/application.js',
					//'dist/scripts/guide.js': 'dist/scripts/guide.js',
					'dist/sui/vendor.js': 'dist/sui/vendor.js'
				}, {
					expand: true,
					cwd: 'dist/scripts',
					src: ['**/*.js', '!debug/**/*.js'],
					dest: 'dist/scripts'
				}, {
					expand: true,
					cwd: 'dist/plugins',
					src: '*.js',
					dest: 'dist/plugins'
				}]
			}
		},
		concat: {
			dist: {
				options: {
					include: 'relative',
					css2js: style.css2js,
					noncmd: true
				},
				files: {
					'dist/scripts/index.js': [
						'dist/scripts/index.js',
						'dist/scripts/factory/**/*.js',
						'dist/scripts/middlewares/**/*.js',
						'dist/scripts/public/**/*.js',
						'dist/scripts/services/**/*.js'
					],
					'dist/scripts/guide.js': [
						'dist/scripts/guide.js',
						'dist/scripts/factory/**/*.js',
						'dist/scripts/middlewares/**/*.js',
						'dist/scripts/public/**/*.js',
						'dist/scripts/services/**/*.js'
					],
					'dist/scripts/application.js': [
						'dist/scripts/application.js',
						'dist/scripts/baseController.js',
						'dist/scripts/router.js',
						'dist/scripts/factory/**/*.js',
						'dist/scripts/middlewares/**/*.js',
						'dist/scripts/public/**/*.js',
						'dist/scripts/services/**/*.js'
					],
					'dist/scripts/auth.js': [
						'dist/scripts/auth.js',
						'dist/scripts/factory/**/*.js',
						'dist/scripts/public/**/*.js',
						'dist/scripts/services/**/*.js'
					]
				}
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [{
					expand: true,
					dot: true,
					cwd: '<%= config.app %>',
					dest: '<%= config.dist %>',
					src: [
						'*.{ico,png,txt}',
						'.htaccess',
						'images/{,*/}*.webp',
						'*.html',
						'styles/fonts/{,*/}*.*',
						'sui/**/*.*',
						'test/**/*.*'
					]
				}, {
					expand: true,
					dot: true,
					cwd: 'bower_components/font-awesome/fonts',
					src: ['*.*'],
					dest: '<%= config.dist %>/fonts'
				}, {
					expand: true,
					dot: true,
					cwd: 'app',
					src: 'images/**/*.{png,jpg,gif,svg}',
					dest: 'dist'
				}, {
					expand: true,
					dot: true,
					cwd: 'app',
					src: ['plugins/**/*.*', 'scripts/lib/**/*.*'],
					dest: 'dist'
				}]
			},
			dest: {
				files: [{
					expand: true,
					dot: true,
					cwd: '.tmp/concat',
					dest: 'dist',
					src: '**/*.*'
				}]
			},
			styles: {
				expand: true,
				dot: true,
				cwd: '<%= config.app %>/styles',
				dest: '.tmp/styles/',
				src: '{,*/}*.css'
			},
			debug: {
				expand: true,
				dot: true,
				cwd: 'app/scripts',
				dest: 'dist/scripts/debug',
				src: ["**", "!.cache/**"]
			}
		},

		// Generates a custom Modernizr build that includes only the tests you
		// reference in your app
		modernizr: {
			dist: {
				devFile: 'bower_components/modernizr/modernizr.js',
				outputFile: '<%= config.dist %>/scripts/vendor/modernizr.js',
				// files: {
				// 	src: [
				// 		'<%= config.dist %>/scripts/**/*.js',
				// 		'<%= config.dist %>/styles/**/*.css',
				// 		'!<%= config.dist %>/scripts/vendor/*'
				// 	]
				// },
				uglify: true
			}
		},
		// Automatically inject Bower components into the HTML file
		bowerInstall: {
			app: {
				src: ['<%= config.app %>/home.html'],
				exclude: ['bower_components/bootstrap-sass-official/vendor/assets/javascripts/bootstrap.js']
			},
			sass: {
				src: ['<%= config.app %>/styles/**/*.{scss,sass}']
			}
		},

		// Run some tasks in parallel to speed up build process
		concurrent: {
			server: [
				'sass:server',
				// 'copy:assets',
				'tmod'
			],
			test: [
				'copy:styles'
			],
			dist: [
				'sass',
				'copy:styles',
				'tmod'
				//'imagemin',
				//'svgmin'
			]
		},
		// TmodJs to Compile
		tmod: {
			template: {
				src: [
					'app/templates/**/*.html',
					'!app/templates/**/--*.html'
				],
				dest: 'app/scripts/template.js',
				options: {
					combo: true,
					syntax: 'simple',
					minify: true,
					cache: false
				}
			}
		}
	});


	grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function(target) {
		if (grunt.option('allow-remote')) {
			grunt.config.set('connect.options.hostname', '0.0.0.0');
		}
		if (target === 'dist') {
			return grunt.task.run(['build', 'connect:dist:keepalive']);
		}

		grunt.task.run([
			'clean:server',
			//'wiredep',
			'concurrent:server',
			'autoprefixer',
			'connect:livereload',
			'watch'
		]);
	});

	grunt.registerTask('server', function(target) {
		grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
		grunt.task.run([target ? ('serve:' + target) : 'serve']);
	});

	grunt.registerTask('test', function(target) {
		if (target !== 'watch') {
			grunt.task.run([
				'clean:server',
				'concurrent:test',
				'autoprefixer'
			]);
		}

		grunt.task.run([
			'connect:test',
			'mocha'
		]);
	});

	grunt.registerTask('build', [
		'clean:dist',
		//'wiredep',
		'useminPrepare',
		'concurrent:dist',
		'autoprefixer',
		'copy:dist',
		// 'modernizr',

		'transport',
		'concat',
		'copy:dest',
		'copy:debug',

		'cssmin',
		// 'uglify',

		// 'clean:afterbuild',


		'rev',
		'usemin',
		'htmlmin'
	]);

	grunt.registerTask('default', [
		//'newer:jshint',
		'test',
		'build'
	]);
};