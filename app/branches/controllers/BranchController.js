import CONSTANTS from '../../common/modules/Constants'
import AddBranchController from './AddBranchController'
class BranchController {
  constructor ($http, $stateParams, $state, $mdDialog, $mdToast, NgMap, branchService, accessService) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$state = $state
    this.$mdToast = $mdToast
    this.branch_id = $stateParams.branch_id
    this.branchService = branchService
    this.googleMapsUrl = 'https://maps.googleapis.com/maps/api/js?key=' + CONSTANTS.GOOGLE_API_KEY + '&libraries=places'
    NgMap.getMap().then((map) => {
      this.map = map
      this.markers = []
      angular.forEach(this.branchService.getBranches(), (branch) => {
        branch.geoLocation && this.markers.push({pos: [branch.geoLocation.latitude, branch.geoLocation.longitude], branch: branch})
      })
    })
    this.fetchBranch()
    this.fetchAssets()
    this.accessControl = accessService.getAccessControl()
  }
  fetchBranch () {
    const url = CONSTANTS.URL_BASE + '/branch?BRANCH_ID=' + this.branch_id
    this.$http.get(url, {})
      .then(({data}) => {
        this.branch = data
      },
      () => console.log('Error while fetching asset: ' + this.branch_id)
    )
  }
  fetchAssets (branch) {
    this.assets = []
    var url = CONSTANTS.URL_BASE + '/assets?BRANCH_ID=' + this.branch_id
    this.$http.get(url, {})
      .then(({data}) => {
        this.assets = data
        angular.forEach(this.assets, (asset) => {
          if (asset.images) {
            angular.forEach(asset.images, (image) => {
              if (image.type === 'IMAGE') {
                asset.image = image.imageId
              }
            })
          }
        })
      },
      () => console.log('Error while fetching all assets for branch: ' + this.branch_id)
    )
  }
  openEditDialog (ev) {
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
      locals: {'operation': 'edit', 'branch': this.branch}
    }).then(() => this.$state.reload(), () => {})
  }
  deleteBranch (ev) {
    // TODO: Looks like deleting a branch is not supported? It is giving 400 bad request error
    var confirm = this.$mdDialog.confirm()
          .title('Confirm deletion?')
          .textContent('Are you sure you want to delete ' + this.branch.name + '?')
          .ariaLabel('Delete')
          .targetEvent(ev)
          .ok('Delete')
          .cancel('Cancel')
    this.$mdDialog.show(confirm).then(() => {
      const url = CONSTANTS.URL_BASE + '/branch?BRANCH_ID=' + this.branch._id
      this.$http.delete(url, {})
        .then(({data}) => {
          this.branchService.updateBranches()
          this.$state.go('root.branches')
        },
        () => console.log('Error while deleting of the branch: ' + this.branch._id)
      )
    }, () => console.log('whew! Delete cancelled')
    )
  }
  openMapDialog (ev, brCtrl, branch) {
    brCtrl.$mdDialog.show({
      controller: OpenGoogleMapController,
      controllerAs: 'branch',
      template: '<md-dialog><md-dialog-content>' +
        "<md-toolbar style='min-height: 40px; height: 40px'>" +
          "<div class='md-toolbar-tools' style='background-color: #EC725D'>" +
            '{{branch.branch.name}}' +
          '</div>' +
        '</md-toolbar>' +
        "<div style='padding: 10px 10px 10px 10px'>" +
          "<div map-lazy-load='https://maps.google.com/maps/api/js'" +
            "map-lazy-load-params='" + brCtrl.googleMapsUrl + "'>" +
            "<input places-auto-complete types='[\'geocode\']' on-place-changed='branch.searchPlaceChanged()' />" +
            "<ng-map id='big-map' zoom='11' " +
              " style='width: 500px; height: 400px'" +
              " default-style='false'" +
              "center='{{[branch.branch.geoLocation.latitude, branch.branch.geoLocation.longitude]}}'>" +
              '<marker ' +
                "position='{{[branch.branch.geoLocation.latitude, branch.branch.geoLocation.longitude]}}' " +
                "title='{{branch.branch.name}}' " +
                "icon='/images/bank_small.jpg'></marker>" +
            '</ng-map>' +
          '</div>' +
        '</div>' +
      '</md-dialog-content></md-dialog>',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {branch: branch}
    })
  }
}
export default BranchController
class OpenGoogleMapController {
  constructor (branch, NgMap, branchService, $timeout) {
    this.branch = branch
    NgMap.getMap('big-map').then((map) => {
      this.map = map
      // this.map = NgMap.initMap("map");
      var center = this.map.getCenter()
      console.log('Center: ', {lat: center.lat(), long: center.lng()})
      $timeout(() => {
        google.maps.event.trigger(this.map, 'resize')
        $timeout(() => this.map.setCenter(center), 1000)
      }, 0)
    })
  }
  searchPlaceChanged () {
    var place = this.map.getPlace()
    console.log('Place: ', place)
  }
}
