import CONSTANTS from '../../common/modules/Constants'

class BranchService {
  constructor ($http, $q, usersService, accessService) {
    'ngInject'
    this.$http = $http
    this.$q = $q
    this.usersService = usersService
    this.branches = []
    this.accessibleBranchIds = accessService.accessControl['branches']
    this.accessibleBranches = []
    this.branchAssetsPromise = {}
    this.assets = {}
    this.promise = this.fetchBranches(true)
  }
  fetchBranches (getAssets) {
    this.branches = []
    this.accessibleBranches = []
    var url = CONSTANTS.URL_BASE + '/branches'
    const httpPromise = this.$http.get(url, {})
      .then(({data}) => {
        this.branches = data
        for (var i = 0; i < data.length; i++) {
          if (!this.accessibleBranchIds || this.accessibleBranchIds.contains(data[i]._id)) {
            this.accessibleBranches[i] = data[i]
          }
        }
        if (getAssets) {
          this.fetchAllBranchAssets()
        }
      },
      () => {
        console.log('Error while fetching all branches')
      }
    )
    return httpPromise
  }
  fetchBranchAssets (branchId) {
    const prom = this.$http.get(CONSTANTS.URL_BASE + '/assets?BRANCH_ID=' + branchId)
      .then(({data}) => {
        var totalVal = 0
        angular.forEach(data, (a) => { totalVal += a.cost })
        this.assets[branchId] = {assets: this.processAssetData(data), numAssets: data.length, totalVal: totalVal}
      }, () => {
        console.log('Error while fetching branch assets for branch: ' + branchId)
      }
    )
    this.branchAssetsPromise[branchId] = prom
    return prom
  }
  fetchAllBranchAssets () {
    if (!this.branches || this.branches.length === 0) {
      return []
    }

    const listOfPromises = []
    // First fetch the current branch. Fetch the remaining branches later.
    var currentBranch
    if (this.usersService.currentUser && this.usersService.currentUser.branch) {
      currentBranch = this.usersService.currentUser.branch
      listOfPromises.push(this.fetchBranchAssets(currentBranch))
    }
    for (var i = 0; i < this.branches.length; i++) {
      const branch = this.branches[i]
      if (branch._id !== currentBranch) {
        listOfPromises.push(this.fetchBranchAssets(branch._id))
      }
    }
    return listOfPromises
  }
  findMatchingLocations (searchText) {
    if (!searchText) {
      return this.accessibleBranches
    }
    const arr = []
    for (var i = 0; i < this.accessibleBranches.length; i++) {
      if (this.branches[i].name.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
        arr.push(this.branches[i])
      }
    }
    return arr
  }
  getBranchAssetDataPromise (branchId) {
    return this.branchAssetsPromise[branchId]
  }
  getBranchAssetData (branchId) {
    return this.assets[branchId]
  }
  getBranches () {
    return this.branches
  }
  getBranchById (branchId) {
    for (var i = 0; i < this.branches.length; i++) {
      if (this.branches[i]._id === branchId) {
        return this.branches[i]
      }
    }
    return null
  }
  getBranchNameById (branchId) {
    const b = this.getBranchById(branchId)
    return b ? b.name : 'Unknown Branch'
  }
  updateBranches () {
    this.fetchBranches(false)
  }
  processAssetData (data) {
    if (!data) {
      return data
    }
    for (var i = 0; i < data.length; i++) {
      data[i]._index = i
      data[i].quantityExpected = (data[i].quantityAvailable ? data[i].quantityAvailable : 0) + (data[i].quantityUsed ? data[i].quantityUsed : 0)
    }
    return data
  }
}
export default BranchService
