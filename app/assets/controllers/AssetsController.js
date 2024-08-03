import CONSTANTS from '../../common/modules/Constants'
import AddAssetController from './AddAssetController'
class AssetsController {
  constructor ($rootScope, $http, $mdDialog, $state, $stateParams, $transitions, $timeout) {
    'ngInject'
    this.$rootScope = $rootScope
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$state = $state
    this.processParams($stateParams)
    $transitions.onStart({to: 'root.assets'}, (trans) => {
      if (trans.from().name !== 'root.assets') {
        return $state.go('root.assets', $rootScope.assetsParams)
      }
      return true
    })
    $transitions.onStart({from: 'root.assets'}, (trans) => {
      $timeout(() => { $rootScope.assetsParams = this.createParams() }, 10)
      return true
    })
    // TODO: Get the branch from url params if given.
    if ($rootScope.currentUser && $rootScope.currentUser.branch) {
      this.branch = $rootScope.currentUser.branch
      this.fetchAllAssets(this.branch)
      this.fetchTags(this.branch)
    } else {
      $rootScope.$on('currentUserInfoLoaded', () => {
        this.branch = $rootScope.currentUser.branch
        this.fetchAllAssets(this.branch)
        this.fetchTags(this.branch)
      })
    }
  }
  fetchTags (branch) {
    this.alltags = {}
    var url = CONSTANTS.URL_BASE + '/assets/tags?BRANCH_ID=' + branch + '&sort_by=Name&sort_order=ASC'
    this.$http.get(url, {})
      .then(({data}) => {
        for (var i = 0; i < data.length; i++) {
          const tags = data[i].tags
          if (tags && tags.length) {
            for (var j = 0; j < tags.length; j++) {
              const tag = tags[j]
              if (this.alltags.hasOwnProperty(tag)) {
                this.alltags[tag] = this.alltags[tag] + 1
              } else {
                this.alltags[tag] = 1
              }
            }
          }
        }
        this.numTags = Object.keys(this.alltags).length
        this.verifySelectedTags()
      },
      () => console.log('Error while fetching tags for branch: ' + branch)
    )
  }
  fetchAllAssets (branch) {
    this.assets = []
    var url = CONSTANTS.URL_BASE + '/assets?BRANCH_ID=' + branch + '&sort_order=DESC'
    this.$http.get(url, {})
      .then(({data}) => {
        this.assets = data
        angular.forEach(this.assets, (asset) => {
          if (asset.serialNumber) {
            asset.serialNumber = asset.serialNumber.replace(new RegExp(',', 'g'), ', ')
          }
          if (asset.images) {
            angular.forEach(asset.images, (image) => {
              if (image.type === 'IMAGE') {
                asset.image = image.imageId
              }
            })
          }
        })
      },
      () => console.log('Error while fetching all assets for branch: ' + branch)
    )
  }
  openAddDialog (ev, type) {
    // TODO: Right now, clickOutsideToClose and escapeToClose are set to false
    // This is because there is no way to prevent closing the dialog when clicked outside
    // We should prevent closing the dialog if the form is dirty and user clicked outside the dialog
    this.$mdDialog.show({
      multiple: true,
      controller: AddAssetController,
      controllerAs: 'aaCtrl',
      template: require('../partials/AddAssets.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      escapeToClose: false,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {'operation': 'add', 'addtype': type, 'asset': {}, docs: {}}
    }).then(() => this.$state.reload(), () => {})
  }

  toggleTagSelection (tag) {
    if (this.selectedTags && this.selectedTags.hasOwnProperty(tag)) {
      delete this.selectedTags[tag]
      if (angular.equals(this.selectedTags, {})) {
        this.selectedTags = null
      }
    } else {
      if (!this.selectedTags) {
        this.selectedTags = {}
      }
      this.selectedTags[tag] = true
    }
    this.numSelectedTags = this.selectedTags ? Object.keys(this.selectedTags).length : 0
  }
  clearTagSelection (tag) {
    this.selectedTags = null
    this.numSelectedTags = 0
  }
  setOrder (order) {
    this.sortOrderLabel = '(' + order + ')'
    switch (order) { // eslint-disable-line default-case
      case 'A to Z':
        this.sortOrder = ['name']
        break
      case 'Z to A':
        this.sortOrder = ['-name']
        break
      case 'Latest':
        this.sortOrder = ['-createDate']
        break
      case 'Oldest':
        this.sortOrder = ['createDate']
        break
      case 'Price - Low to High':
        this.sortOrder = ['cost']
        break
      case 'Price - High to Low':
        this.sortOrder = ['-cost']
        break
    // TODO: Looks like these fields are not populated by server?
      case 'AMC Expiry':
        this.sortOrder = ['AMCEndDate']
        break
      case 'Insurance Expiry':
        this.sortOrder = ['insuranceEndDate']
        break
      case 'Warranty Expiry':
        this.sortOrder = ['warrantyEndDate']
        break
    }
  };
  readSortOrder (name) {
    switch (name) {
      case 'name':
        this.sortOrderLabel = '(A to Z)'
        break
      case '-name':
        this.sortOrderLabel = '(Z to A)'
        break
      case '-createDate':
        this.sortOrderLabel = '(Latest)'
        break
      case 'createDate':
        this.sortOrderLabel = '(Oldest)'
        break
      case 'cost':
        this.sortOrderLabel = '(Price - Low to High)'
        break
      case '-cost':
        this.sortOrderLabel = '(Price - High to Low)'
        break
      // TODO: Looks like these fields are not populated by server?
      case 'AMCEndDate':
        this.sortOrderLabel = '(AMC Expiry)'
        break
      case 'insuranceEndDate':
        this.sortOrderLabel = '(Insurance Expiry)'
        break
      case 'warrantyEndDate':
        this.sortOrderLabel = '(Warranty Expiry)'
        break
    }
  }
  processParams (params) {
    if (!params) {
      return
    }
    const searchTxt = params.searchTxt
    this.searchTxt = searchTxt
    const tags = {}
    // TODO. Make sure tag is present app.tags before setting in the selectedTags.
    if (params.tags) {
      this.numSelectedTags = 0
      angular.forEach(params.tags.split(','), (tag) => { tags[tag] = true; this.numSelectedTags++ })
      console.log('tags: ', tags)
      this.selectedTags = tags
    }
    this.numSelectedTags = Object.keys(tags).length
    this.verifySelectedTags()
    if (params.sort) {
      this.sortOrder = [params.sort]
      this.readSortOrder(params.sort)
    }
  }
  createParams () {
    const obj = {}
    obj.searchTxt = this.searchTxt
    if (this.selectedTags) {
      const tags = []
      angular.forEach(this.selectedTags, (v, t) => tags.push(t))
      if (tags.length > 0) {
        obj.tags = tags.join(',')
      }
    }
    if (this.sortOrder && this.sortOrder.length) {
      obj.sort = this.sortOrder[0]
    }
    return obj
  }
  verifySelectedTags () {
    if (!this.alltags || !this.selectedTags) {
      return
    }
    angular.forEach(this.selectedTags, (tag) => !this.alltags.hasOwnProperty(tag) && delete this.selectedTag[tag])
    this.numSelectedTags = Object.keys(this.selectedTags).length
  }
}
export default AssetsController
