import CONSTANTS from '../../common/modules/Constants'
import AddCatController from './AddCatController'
class CatsController {
  constructor ($rootScope, $http, $mdDialog, $state, $transitions, $stateParams, $timeout, catService) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$state = $state
    this.catService = catService
    this.IMAGE_BASE_URL = CONSTANTS.IMAGE_BASE_URL
  }
  openAddDialog (ev) {
    // TODO: Right now, clickOutsideToClose and escapeToClose are set to false
    // This is because there is no way to prevent closing the dialog when clicked outside
    // We should prevent closing the dialog if the form is dirty and user clicked outside the dialog
    this.$mdDialog.show({
      multiple: true,
      controller: AddCatController,
      controllerAs: 'catAddCtrl',
      template: require('../partials/AddCategory.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      escapeToClose: false,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {'operation': 'add', 'cat': {}}
    }).then(() => this.$state.reload(), () => {})
  }
  openEditDialog (ev, cat) {
    // TODO: Right now, clickOutsideToClose and escapeToClose are set to false
    // This is because there is no way to prevent closing the dialog when clicked outside
    // We should prevent closing the dialog if the form is dirty and user clicked outside the dialog
    this.$mdDialog.show({
      multiple: true,
      controller: AddCatController,
      controllerAs: 'catAddCtrl',
      template: require('../partials/AddCategory.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      escapeToClose: false,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {'operation': 'edit', 'cat': cat}
    }).then(() => this.$state.reload(), () => {})
  }
  deleteCategory (ev, cat) {
    ev.stopPropagation()
    var confirm = this.$mdDialog.confirm()
          .title('Confirm deletion?')
          .textContent('Are you sure you want to delete ' + cat.name + '?')
          .ariaLabel('Delete')
          .targetEvent(ev)
          .ok('Delete')
          .cancel('Cancel')
    this.$mdDialog.show(confirm).then(() => {
      const url = CONSTANTS.URL_BASE + '/category?category_ID=' + cat._id
      this.$http.delete(url, {})
        .then(({data}) => {
          this.catService.updateCategories()
        },
        () => console.log('Error while deleting of the category: ' + cat._id)
      )
    }, () => console.log('whew! Delete cancelled')
    )
  }
}
export default CatsController
