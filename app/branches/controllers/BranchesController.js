import CONSTANTS from '../../common/modules/Constants'
import AddBranchController from './AddBranchController'
class BranchesController {
  constructor ($rootScope, $http, $mdDialog, $state, $transitions, $stateParams, $timeout, accessService) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$state = $state
    this.IMAGE_BASE_URL = CONSTANTS.IMAGE_BASE_URL
    this.processParams($stateParams)
    this.fetchAllBranches()
    $transitions.onStart({to: 'root.branches'}, (trans) => {
      if (trans.from().name !== 'root.branches') {
        return $state.go('root.branches', $rootScope.branchesParams)
      }
      return true
    })
    $transitions.onStart({from: 'root.branches'}, (trans) => {
      $timeout(() => $rootScope.branchesParams = this.createParams(), 10)
      return true
    })
    this.accessControl = accessService.getAccessControl()
  }
  fetchAllBranches () {
    this.branches = []
    var url = CONSTANTS.URL_BASE + '/branches'
    this.$http.get(url, {})
      .then(({data}) => {
        this.branches = data
      },
      () => console.log('Error while fetching all branches')
    )
  }
  openAddDialog (ev) {
    // TODO: Right now, clickOutsideToClose and escapeToClose are set to false
    // This is because there is no way to prevent closing the dialog when clicked outside
    // We should prevent closing the dialog if the form is dirty and user clicked outside the dialog
    this.$mdDialog.show({
      multiple: true,
      controller: AddBranchController,
      controllerAs: 'baCtrl',
      template: require('../partials/AddBranch.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      escapeToClose: false,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {'operation': 'add', 'branch': {}}
    }).then(() => this.$state.reload(), () => {})
  }
  processParams (params) {
    if (!params) {
      return
    }
    this.searchTxt = params.searchTxt
  }
  createParams () {
    const obj = {}
    obj.searchTxt = this.searchTxt
    return obj
  }
}
export default BranchesController
