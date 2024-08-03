class AuditController {
  constructor ($stateParams, $state, $mdDialog, auditService, branchService) {
    'ngInject'
    this.$state = $state
    this.$mdDialog = $mdDialog
    this.auditService = auditService
    this.branchService = branchService
    this.operation = $stateParams.operation
    if (this.operation === 'add') {
      this.original = {assets: []}
      this.audit = angular.copy(this.original)
      this.audit_id = -1
      if (this.auditService.accessibleBranchIds && this.auditService.accessibleBranchIds.length === 1) {
        this.branchChangeConfirmed(this.branchService.getBranchById(this.auditService.accessibleBranchIds[0]))
      }
    } else {
      this.audit_id = $stateParams.audit_id
      this.original = angular.copy($stateParams.audit)
      this.original.assets = angular.copy($stateParams.audit.assets)
      this.selectedBranch = this.original.branch
      this.audit = angular.copy(this.original)
      this.audit.assets = angular.copy(this.original.assets)
    }
    this.editing = this.operation !== 'view'
    this.auditTypeFilter = ['Not Audited', 'Found', 'Not Found', 'Partial']
    this.auditTypeFilterNoPartial = ['Not Audited', 'Found', 'Not Found']
    this.changedAssets = {}
  }
  findMatchingLocations (searchText) {
    return this.branchService.findMatchingLocations(searchText)
  }
  branchChanged (branch) {
    if (!branch || branch._id === this.audit.branch_id) {
      return
    }
    if (!angular.equals(this.changedAssets, {})) {
      // Reset to the old value first
      this.selectedBranch = this.branchService.getBranchById(this.audit.branch_id)
      this.showConfirm({
        titile: 'Confirm changing the location',
        content: 'All the changes to assets will be lost if you change ' +
        ' the location to ' + branch.label + ' now. Are you sure you want to change the location?',
        okCallback: () => {
          this.selectedBranch = branch
          this.branchChangeConfirmed(branch)
        }
      })
    } else {
      this.branchChangeConfirmed(branch)
    }
  }
  branchChangeConfirmed (branch) {
    this.audit.branch_id = branch._id
    this.audit.branch = branch.name
    this.selectedBranch = branch
    this.branchService.getBranchAssetDataPromise(branch._id).then(() => {
      this.original.assets = angular.copy(this.branchService.assets[branch._id] ? this.branchService.assets[branch._id].assets : [])
      this.audit.assets = angular.copy(this.original.assets)
    })
  }
  startEdit () {
    this.editing = true
  }
  onChange (asset) {
    const index = asset._index
    delete asset.changed
    delete this.changedAssets[index]
    if (!angular.equals(this.original.assets[index], asset)) {
      asset.changed = true
      asset.auditDate = new Date()
      this.changedAssets[index] = true
    }
  }
  undoChange (asset) {
    const index = asset._index
    this.audit.assets[index] = angular.copy(this.original.assets[index])
    this.onChange(this.audit.assets[index])
  }
  close () {
    this.$state.go('root.audits')
  }
  cancel (ev) {
    if (this.audit.title !== this.original.title || this.audit.notes !== this.original.notes ||
     !angular.equals(this.changedAssets, {})) {
      this.showConfirm({
        title: 'Are you sure you want to cancel?',
        content: 'All the changes made will be lost. Are you sure you want to cancel?',
        okCallback: () => {
          if (this.operation === 'add') {
            this.$state.go('root.audits')
          } else {
            this.audit = angular.copy(this.original)
            this.audit.assets = angular.copy(this.original.assets)
            this.changedAssets = {}
          }
          this.editing = false
        }
      })
    } else {
      if (this.operation === 'add') {
        this.$state.go('root.audits')
      } else {
        this.audit = angular.copy(this.original)
        this.audit.assets = angular.copy(this.original.assets)
        this.changedAssets = {}
      }
      this.editing = false
    }
  }
  saveAudit (ev) {
    if (!this.auditForm.$valid) {
      if (!this.audit.title || this.audit.title.length === 0) {
        this.showMessagePopup({
          title: 'Audit Title Missing',
          content: 'Please enter a title for your audit. This field is required to manage your audits effectively.'
        }, ev)
        return
      }
      if (!this.audit.branch || this.audit.branch.length === 0) {
        this.showMessagePopup({
          title: 'Please select a location to audit',
          content: 'Please select a location of your audit'
        }, ev)
        return
      }
      this.showMessagePopup({
        title: 'Errors in the form',
        content: 'Please fix the errors shown in the form'
      }, ev)
      return
    }
    angular.forEach(this.audit.assets, (asset) => delete asset.changed)
    if (this.audit_id === -1) {
      this.auditService.addAudit(this.audit)
      this.$state.go('root.audits')
    } else {
      this.auditService.updateAudit(this.audit)
    }
    this.original = angular.copy(this.audit)
    this.original.assets = angular.copy(this.audit.assets)
    this.editing = false
    this.changedAssets = {}
  }
  showConfirm ({title, content, okLabel, cancelLabel, okCallback, cancelCallback}, ev) {
    const confirm = this.$mdDialog.confirm()
      .title(title)
      .textContent(content)
      .ariaLabel(title)
      .targetEvent(ev)
      .ok(okLabel || 'Yes')
      .cancel(cancelLabel || 'No')
    this.$mdDialog.show(confirm).then(okCallback, cancelCallback)
  }
  showMessagePopup ({title, content}, ev) {
    const popup = this.$mdDialog.alert()
      .title(title)
      .textContent(content)
      .clickOutsideToClose(true)
      .ariaLabel('Alert Dialog Demo')
      .targetEvent(ev)
      .ok('Close')
    this.$mdDialog.show(popup)
  }
}
export default AuditController
