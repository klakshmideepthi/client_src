import angular from 'angular'
import 'angular-material'
import 'angular-cookies'
import 'angular-messages'
import 'headroom.js/dist/headroom.js'
import 'headroom.js/dist/angular.headroom.js'
import '../../node_modules/angular-material/angular-material.min.css'
import '../../node_modules/font-awesome/css/font-awesome.min.css'
import '../style/login.css'

let login = () => {
  return {
    template: require('./login.html'),
    controller: 'LoginController',
    controllerAs: 'loginCtrl'
  }
}

class LoginController {
  constructor ($mdDialog) {
    'ngInject'
    this.$mdDialog = $mdDialog
  }
  openLoginDialog (ev) {
    console.log('Hello')
    // TODO: Right now, clickOutsideToClose and escapeToClose are set to false
    // This is because there is no way to prevent closing the dialog when clicked outside
    // We should prevent closing the dialog if the form is dirty and user clicked outside the dialog
    this.$mdDialog.show({
      multiple: true,
      controller: LoginFormController,
      controllerAs: 'lCtrl',
      template: require('./LoginForm.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      escapeToClose: false,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true
    })
  }
}
const MODULE_NAME = 'login'

angular.module(MODULE_NAME, ['ngMaterial', 'ngCookies', 'ngMessages', 'headroom'])
  .directive('login', login)
  .controller('LoginController', LoginController)
export default MODULE_NAME

class LoginFormController {
  constructor ($http, $mdDialog, $cookies, $window, $location) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$cookies = $cookies
    this.$window = $window
    this.$location = $location
    this.submit_in_progrss = false
    this.data = {email: '', password: ''}
  }
  tryLogin () {
    this.submit_in_progrss = true
    this.loginErrorMsg = ''
    this.$http.post('/login', this.data)
      .then(({data}) => {
        if (data && data._id && !data.error) {
          var redirectUrl = this.$cookies.get('ATM_REDIRECT_URL')
          console.log('Redirect URL: ' + redirectUrl)
          this.$cookies.remove('ATM_REDIRECT_URL')
          if (redirectUrl) {
            this.$window.location.href = '/app.html' + redirectUrl
          } else {
            this.$window.location.href = '/app.html'
          }
        } else {
          this.data.password = ''
          this.login_error = true
          this.submit_in_progrss = false
          if (data.error.message === 'LOGIN_UNKNOWN_PASSWORD') {
            this.loginErrorMsg = 'Invalid email or password'
          } else {
            this.loginErrorMsg = data.error.message
          }
        }
      },
      (response) => {
        this.data.password = ''
        this.login_error = true
        this.submit_in_progrss = false
        this.loginErrorMsg = 'Unable to login. Error: ' + response.statusText
      }
    )
  }
  cancel () {
    this.$mdDialog.cancel()
  }
}
