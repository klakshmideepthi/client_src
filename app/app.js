import angular from 'angular'
import 'angular-cookies'
import 'angular-messages'
import 'angular-material'
import 'angular-material-data-table'
import 'angular-material-data-table/dist/md-data-table.min.css'
import 'ng-material-datetimepicker'
import 'ng-material-datetimepicker/dist/material-datetimepicker.min.css'
import '@uirouter/core'
import '@uirouter/angularjs'
import 'angular-chart.js'
import 'ng-currency'
import 'ng-file-upload'
import 'angular-password'
import 'ngmap'
import 'angular-moment'
// TODO: This should be done dynamically using browser's locale settings.
// For now, hard coded to india locale.
import 'angular-i18n/angular-locale_en-in.js'
import '../../node_modules/angular-material/angular-material.min.css'
import '../../node_modules/font-awesome/css/font-awesome.min.css'
import './calendar/CalendarModule.js'
import './calendar/calendar.css'
import '../style/app.css'
import CONSTANTS from './common/modules/Constants'
import MeController from './me/controllers/MeController'
import AssetsController from './assets/controllers/AssetsController'
import AssetController from './assets/controllers/AssetController'
import BranchesController from './branches/controllers/BranchesController'
import BranchController from './branches/controllers/BranchController'
import BranchService from './branches/services/BranchService.js'
import UsersService from './users/services/UsersService.js'
import UsersController from './users/controllers/UsersController'
import UserController from './users/controllers/UserController'
import AccessService from './users/services/AccessService'
import WorkflowService from './workflows/services/WorkflowService'
import ReportsController from './reports/controllers/ReportsController'
import AssetTableDirective from './reports/controllers/AssetTableDirective'
import AuditsController from './audits/controllers/AuditsController'
import AuditController from './audits/controllers/AuditController'
import CatsController from './categories/controllers/CatsController'
import CatService from './categories/services/CatService'
import WorkflowsController from './workflows/controllers/WorkflowsController'
import WorkflowController from './workflows/controllers/WorkflowController'
import WorkflowFilterController from './workflows/controllers/WorkflowFilterController'
import SearchFilter from './common/modules/SearchFilter'
import DateFilter from './common/modules/DateFilter'
import CompletionStatusFilter from './common/modules/CompletionStatusFilter'
import AuditStatusFilter from './common/modules/AuditStatusFilter'
import AuditDemo from './audits/modules/AuditDemo'
import TagSearchFilter from './common/modules/TagSearchFilter'
import './assets/modules/DocsModule'
let app = () => {
  return {
    template: require('./app.html'),
    controller: 'AppCtrl',
    controllerAs: 'app'
  }
}
class AppCtrl {
  constructor ($mdSidenav, $rootScope, $transitions, $state, $http, $cookies, $window, $timeout, usersService, branchService, catService, accessService, workflowService) {
    'ngInject'
    this.$mdSidenav = $mdSidenav
    this.$state = $state
    this.$rootScope = $rootScope
    this.$http = $http
    this.$cookies = $cookies
    this.$window = $window
    this.$timeout = $timeout
    this.usersService = usersService
    this.branchService = branchService
    this.workflowService = workflowService
    this.catService = catService
    this.accessControl = accessService.getAccessControl()
    this.tabs = [
      {sref: 'root.assets', name: 'assets', title: 'Assets'},
      {sref: 'root.branches', name: 'branches', title: 'Branches'},
      {sref: 'root.reports', name: 'reports', title: 'Reports'},
      {sref: 'root.audits', name: 'audits', title: 'Audits'}
    ]
    $rootScope.isDemo = (isDemo.trim() === 'true')
    if ($rootScope.isDemo) {
      this.tabs.push({sref: 'root.workflows.all', name: 'workflows', title: 'Requests'})
    }
    this.$rootScope.IMAGE_BASE_URL = CONSTANTS.IMAGE_BASE_URL
    $transitions.onSuccess({},
      (transition) => { this.$rootScope.pageTitle = transition.to().data ? transition.to().data.pageTitle : undefined })
  }
  toggleLeftNav () {
    this.$mdSidenav('left').toggle()
  }
  ifStateIncludes (stateId) {
    return this.$state.includes(stateId)
  }
  goto (state) {
    this.$state.go(state)
  }
  openMenu ($mdMenu, $event) {
    $mdMenu.open($event)
  }
  getBranchNameById (branchId) {
    return this.branchService.getBranchNameById(branchId)
  }
  getCategoryNameById (catId) {
    return this.catService.getCategoryNameById(catId)
  }
  logout () {
    this.$http.post('/logout', {}, {})
    .then(() => {
      this.$cookies.remove('connect.sid')
      console.log('***********LOGGING OUT !!!!!!')
      this.$timeout(() => { this.$window.location.href = '/login.html' }, 100)
    })
    .catch(() => alert('Unable to logout'))
  }
}

const MODULE_NAME = 'app'

angular.module(MODULE_NAME, ['ngCookies', 'ngMaterial', 'ngMessages', 'ngPassword', 'ui.router', 'chart.js', 'md.data.table', 'ng-currency', 'ngFileUpload', 'ngMaterialDatePicker', 'ngMap', 'angularMoment', 'infore.calendar', 'atm.docs'])
  .directive('app', app)
  .directive('assetTable', AssetTableDirective)
  .filter('atmsearch', SearchFilter)
  .filter('atm_tag_search', TagSearchFilter)
  .filter('atm_status_filter', CompletionStatusFilter)
  .filter('atm_date_filter', DateFilter)
  .filter('atm_audit_status_filter', AuditStatusFilter)
  .filter('numKeys', function () {
    return function (json) {
      if (!json) return 0
      var keys = Object.keys(json)
      return keys.length
    }
  })
  .service('auditService', AuditDemo)
  .service('usersService', UsersService)
  .service('branchService', BranchService)
  .service('catService', CatService)
  .service('accessService', AccessService)
  .service('workflowService', WorkflowService)
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.defaults.useXDomain = true
    delete $httpProvider.defaults.headers.common['X-Requested-With']
  }])
  .config(['$mdDateLocaleProvider', function ($mdDateLocaleProvider) {
    $mdDateLocaleProvider.formatDate = function (date) {
      return moment(date).format('DD-MMM-YYYY')
    }
  }])
  .config(['ChartJsProvider', function (ChartJsProvider) {
    ChartJsProvider.setOptions({
      tooltips: {
        backgroundColor: '#ffffff',
        titleFontFamily: 'Roboto',
        titleFontColor: '#000000',
        bodyFontColor: '#000000',
        bodyFontSize: 16
      }
    })
  }])
  .run(['$templateCache', function ($templateCache) {
    $templateCache.put('TopNav.html', require('./common/partials/TopNav.html'))
  }])
  .run(['$rootScope', '$http', '$q', '$window', '$location', '$cookies',
    function ($rootScope, $http, $q, $window, $location, $cookies) {
      $rootScope.login_verify_in_progress = true
      /* eslint no-shadow:0, no-unused-vars:0 */
      var verifyLogin = function ($http, $q, $cookies) {
        $cookies.remove('ATM_REDIRECT_URL')
        var isLoginUrl = $location.url().indexOf('/login.html') >= 0
        var defer = $q.defer()
        $http({
          url: '/currentUser',
          method: 'GET'
        }).then(function ({data, status, headers, config}) {
          $rootScope.login_verify_in_progress = false
          $rootScope.loginVerified = true
          $rootScope.currentUser = data
          // Inform the top-nav-controller to display user data
          // No need to do $broadcast to every $scope, which will affect performance
          // $emit dispatches event upwards (only within other $rootScope listeners)
          // Ref: http://stackoverflow.com/a/28156845/654825
          $rootScope.$emit('currentUserInfoLoaded')
          // $http.post('/api/v1/user/activity', {}, {});
          defer.resolve('done')
        }, function ({data, status, headers, config}) {
          $rootScope.login_verify_in_progress = false
          if (status === 401) {
            if (!isLoginUrl) {
              var redirectUrl = $location.url()
              // In AngularJS, $location.url() does not return the leading dash.
              redirectUrl = '#!' + redirectUrl
              $cookies.put('ATM_REDIRECT_URL', redirectUrl)
              $window.location.href = '/login.html'
            }
            defer.resolve('done')
          } else {
            defer.reject()
          }
        })

        return defer.promise
      }
      return verifyLogin($http, $q, $cookies)
    }
  ])
  .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('', '/me')
    $urlRouterProvider.when('/workflows', '/workflows/all')
    $urlRouterProvider.otherwise('/me')
    $stateProvider
    .state('root', {
      abstract: true,
      url: '/',
      views: {
        '@': {
          template: require('./common/partials/RootContainer.html')
        }
      },
      resolve: {
        userPromise1: (usersService) => usersService.promise1,
        userPromise2: (usersService) => usersService.promise2,
        branchPromise: (branchService) => branchService.promise,
        catPromise: (catService) => catService.promise
      }
    })
    .state('root.me', {
      url: 'me',
      sticky: true,
      views: {
        'dashboard': {
          template: require('./me/partials/Me.html'),
          controller: MeController,
          controllerAs: 'me'
        }
      },
      data: {pageTitle: 'Dashboard - VirtVault'}
    })
    .state('root.assets', {
      url: 'assets?searchTxt&tags&sort',
      sticky: true,
      views: {
        'assets': {
          template: require('./assets/partials/ViewAllAssets.html'),
          controller: AssetsController,
          controllerAs: 'assets'
        }
      },
      data: {pageTitle: 'Assets - VirtVault'}
    })
    .state('root.asset', {
      url: 'asset/:asset_id',
      sticky: true,
      views: {
        'asset@root': {
          template: require('./assets/partials/ViewAsset.html'),
          controller: AssetController,
          controllerAs: 'asset'
        }
      },
      data: {pageTitle: 'Assets - VirtVault'}
    })
    .state('root.branches', {
      url: 'branches?searchTxt',
      sticky: true,
      views: {
        'branches@root': {
          template: require('./branches/partials/ViewAllBranches.html'),
          controller: BranchesController,
          controllerAs: 'bCtrl'
        }
      },
      data: {pageTitle: 'Branches - VirtVault'}
    })
    .state('root.branch', {
      url: 'branch/:branch_id',
      sticky: true,
      views: {
        'branch@root': {
          template: require('./branches/partials/ViewBranch.html'),
          controller: BranchController,
          controllerAs: 'brCtrl'
        }
      },
      data: {pageTitle: 'Branches - VirtVault'}
    })
    .state('root.users', {
      url: 'users',
      sticky: true,
      views: {
        'users@root': {
          template: require('./users/partials/ViewAllUsers.html'),
          controller: UsersController,
          controllerAs: 'usersCtrl'
        }
      },
      data: {pageTitle: 'Users - VirtVault'}
    })
    .state('root.user', {
      url: 'user/:user_id?',
      sticky: true,
      views: {
        'user@root': {
          template: require('./users/partials/ViewUser.html'),
          controller: UserController,
          controllerAs: 'uCtrl'
        }
      },
      data: {pageTitle: 'User Profile - VirtVault'},
      params: {user_id: null}
    })
    .state('root.reports', {
      url: 'reports',
      sticky: true,
      views: {
        'reports@root': {
          template: require('./reports/partials/ReportsMain.html'),
          controller: ReportsController,
          controllerAs: 'rCtrl'
        }
      },
      data: {pageTitle: 'Reports - VirtVault'}
    })
    .state('root.audits', {
      url: 'audits',
      sticky: true,
      views: {
        'audits@root': {
          template: require('./audits/partials/ViewAllAudits.html'),
          controller: AuditsController,
          controllerAs: 'audsCtrl'
        }
      },
      data: {pageTitle: 'Audits - VirtVault'}
    })
    .state('root.audit', {
      url: 'audit',
      sticky: true,
      views: {
        'audit@root': {
          template: require('./audits/partials/AuditContainer.html')
        }
      },
      data: {pageTitle: 'Audits - VirtVault'}
    })
    .state('root.audit.add', {
      url: '/add',
      params: {
        operation: 'add'
      },
      views: {
        'add@root.audit': {
          template: require('./audits/partials/AddEditViewAudit.html'),
          controller: AuditController,
          controllerAs: 'audCtrl'
        }
      },
      data: {pageTitle: 'Audits - VirtVault'}
    })
    .state('root.audit.view', {
      url: '/view/:audit_id',
      params: {
        operation: 'view',
        audit: null
      },
      views: {
        'view@root.audit': {
          template: require('./audits/partials/AddEditViewAudit.html'),
          controller: AuditController,
          controllerAs: 'audCtrl'
        }
      },
      data: {pageTitle: 'Audits - VirtVault'}
    })
    .state('root.cats', {
      url: 'cats',
      sticky: true,
      views: {
        'cats@root': {
          template: require('./categories/partials/ViewAllCats.html'),
          controller: CatsController,
          controllerAs: 'catsCtrl'
        }
      },
      data: {pageTitle: 'Categories - VirtVault'}
    })
    .state('root.workflows', {
      url: 'workflows',
      abstract: true,
      views: {
        'workflows@root': {
          template: require('./workflows/partials/WorkflowFilter.html'),
          controller: WorkflowFilterController,
          controllerAs: 'wfFilterCtrl'
        }
      },
      data: {pageTitle: 'Workflows - VirtVault'}
    })
    .state('root.workflows.all', {
      url: '/all',
      views: {
        'all@root.workflows': {
          template: require('./workflows/partials/ViewAllWorkflows.html'),
          controller: WorkflowsController,
          controllerAs: 'wfsCtrl'
        }
      },
      data: {pageTitle: 'Requests - VirtVault'}
    })
    .state('root.workflows.workflow', {
      url: '/workflow/:wf_id',
      params: {
        operation: 'view',
        selectedWf: null
      },
      views: {
        'workflow@root.workflows': {
          template: require('./workflows/partials/ViewWorkflow.html'),
          controller: WorkflowController,
          controllerAs: 'wfCtrl'
        }
      },
      data: {pageTitle: 'Requests - VirtVault'}
    })
  }]
  )
  .controller('AppCtrl', AppCtrl)

export default MODULE_NAME
