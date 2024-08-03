import CONSTANTS from '../../common/modules/Constants'
class MoveAssetController {
  constructor ($http, $rootScope, $mdDialog, $mdToast, asset, workflowService, branchService) {
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$mdToast = $mdToast
    this.workflowService = workflowService
    this.branchService = branchService
    this.asset = asset
    this.quantity = 1
    this.isDemo = $rootScope.isDemo
    this.fetchBranches()
  }
  fetchBranches () {
    var url = CONSTANTS.URL_BASE + '/branches'
    this.$http.get(url, {})
    .then(
      ({data}) => { this.branches = data },
      () => console.log('Unable to fetch branches')
    )
    .catch(() => console.log('Error while fetching branches'))
  }
  moveAsset () {
    if (this.isDemo) {
      const workflow = {type: this.workflowService.WORKFLOW_TYPES['MOVE_ASSET']}
      const that = this
      workflow.data = {
        assetId: that.asset._id,
        assetName: that.asset.name,
        quantity: that.quantity,
        fromBranchName: that.branchService.getBranchNameById(that.asset.branch),
        fromBranchId: that.asset.branch,
        toBranchId: that.selectedBranch._id,
        toBranchName: that.selectedBranch.name
      }
      workflow.title = this.title
      workflow.description = this.description
      this.workflowService.addWorkflow(workflow)
      const msg = 'Successfully created a new request with ID: ' + workflow.key
      this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
      this.$mdDialog.hide({})
    } else {
      const url = CONSTANTS.URL_BASE + '/asset/move?ASSET_ID=' + this.asset._id + '&QUANTITY=' + this.quantity + '&BRANCH_FROM=' + this.asset.branch + '&BRANCH_TO=' + this.selectedBranch._id
      this.$http.put(url, {})
      .then(() => {
        const msg = 'Successfully moved ' + this.quantity + ' of ' + this.asset.name + ' from ' + this.asset.branch + ' to ' + this.selectedBranch._id
        this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
        this.$mdDialog.hide({})
        console.log(msg)
      }, (obj) => {
        const msg = 'Unable to move asset: ' + this.asset.name + '. Error ' + obj.statusText
        this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
      })
    }
  }
  cancel () {
    this.$mdDialog.cancel()
  }
}
export default MoveAssetController
