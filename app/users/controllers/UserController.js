import CONSTANTS from '../../common/modules/Constants'
import AddUserController from './AddUserController'
class UserController {
  constructor ($http, $stateParams, $state, $mdDialog, $mdToast, $rootScope, branchService) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$state = $state
    this.$mdToast = $mdToast
    this.$rootScope = $rootScope
    this.branchService = branchService
    this.user_id = $stateParams.user_id
    this.fetchUser()
  }
  fetchUser () {
    if (this.user_id) {
      this.fetchUserInternal(this.user_id)
    } else if (this.$rootScope.currentUser) {
      this.fetchUserInternal(this.$rootScope.currentUser._id)
    } else {
      this.$rootScope.$on('currentUserInfoLoaded', () => this.fetchUserInternal(this.$rootScope.currentUser._id))
    }
  }
  fetchUserInternal (user_id) {
    const url = CONSTANTS.URL_BASE + '/user?USER_ID=' + user_id
    this.$http.get(url, {})
      .then(({data}) => {
        this.user = data
        this.user.branch_name = this.branchService.getBranchNameById(this.user.branch)
      },
      () => console.log('Error while fetching user: ' + user_id)
    )
  }
  canEdit () {
    if (!this.user) {
      return false
    }
    if (this.$rootScope.currentUser && this.$rootScope.currentUser.role === 'SU') {
      return true
    }
    if (this.isCurrentUser()) {
      return true
    }
    return false
  }
  canDelete () {
    if (!this.user) {
      return false
    }
    if (this.user.role !== 'SU') {
      return false
    }
    if (this.isCurrentUser()) {
      return false
    }
    return true
  }
  isCurrentUser () {
    if (!this.user_id) {
      return true
    }
    if (this.$rootScope.currentUser && this.$rootScope.currentUser._id === this.user_id) {
      return true
    }
    return false
  }
  openEditDialog (ev) {
    // TODO: Right now, clickOutsideToClose and escapeToClose are set to false
    // This is because there is no way to prevent closing the dialog when clicked outside
    // We should prevent closing the dialog if the form is dirty and user clicked outside the dialog
    this.$mdDialog.show({
      multiple: true,
      controller: AddUserController,
      controllerAs: 'uaCtrl',
      template: require('../partials/AddUser.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      escapeToClose: false,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {'operation': 'edit', 'user': this.user}
    }).then(() => this.$state.reload(), () => {})
  }
  deleteUser (ev) {
    // TODO: Looks like deleting a user is not supported? It is giving 400 bad request error
    var confirm = this.$mdDialog.confirm()
          .title('Confirm deletion?')
          .textContent('Are you sure you want to user ' + this.user.name + '?')
          .ariaLabel('Delete')
          .targetEvent(ev)
          .ok('Delete')
          .cancel('Cancel')
    this.$mdDialog.show(confirm).then(() => {
      const url = CONSTANTS.URL_BASE + '/user?USER_ID=' + this.user._id
      this.$http.delete(url, {})
        .then(({data}) => {
          this.$state.go('root.users')
        },
        () => console.log('Error while deleting of the user: ' + this.user._id)
      )
    }, () => console.log('whew! Delete cancelled')
    )
  }
}
export default UserController
