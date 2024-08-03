import CONSTANTS from '../../common/modules/Constants'
import AddUserController from './AddUserController'
class UsersController {
  constructor ($http, $mdDialog, $rootScope, branchService, accessService) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.branchService = branchService
    this.accessControl = accessService.getAccessControl()
    this.IMAGE_BASE_URL = CONSTANTS.IMAGE_BASE_URL
    this.fetchAllUsers()
  }
  fetchAllUsers () {
    this.users = []
    var url = CONSTANTS.URL_BASE + '/users'
    // TODO: Looks like there is no way to get all the users
    this.$http.get(url, {})
      .then(({data}) => {
        this.users = data
        for (var i = 0; i < this.users.length; i++) {
          this.users[i].branch_name = this.branchService.getBranchNameById(this.users[i].branch)
        }
      },
      () => console.log('Error while fetching all users')
    )
  }
  openAddDialog (ev) {
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
      locals: {'operation': 'add', 'user': {}}
    })
  }
}
export default UsersController
