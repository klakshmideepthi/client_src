class AuditsController {
  constructor ($http, $q, $state, $mdDialog, auditService, branchService, usersService) {
    'ngInject'
    this.$http = $http
    this.$q = $q
    this.$state = $state
    this.$mdDialog = $mdDialog
    this.auditService = auditService
    this.branchService = branchService
    this.usersService = usersService
    this.Date = Date
    this.periodTypes = [
      {
        key: 'this_quarter',
        label: 'Quarter To Date',
        startDate: moment().startOf('quarter'),
        endDate: moment()
      },
      {
        key: 'last_quarter',
        label: 'Last Quarter',
        startDate: moment().subtract(1, 'quarters').startOf('quarter'),
        endDate: moment().subtract(1, 'quarters').endOf('quarter')
      },
      {
        key: 'this_month',
        label: 'This Month',
        startDate: moment().startOf('month'),
        endDate: moment()
      },
      {
        key: 'last_month',
        label: 'Last Month',
        startDate: moment().subtract(1, 'month').startOf('month'),
        endDate: moment().subtract(1, 'month').endOf('month')
      },
      {
        key: 'this_year',
        label: 'Year To Date',
        startDate: moment().startOf('year'),
        endDate: moment()
      },
      {
        key: 'custom',
        label: 'Custom'
      }
    ]
    this.clearFilters()
  }
  startNewAudit () {
    this.$state.go('root.audit.add')
  }
  clearFilters () {
    this.filter = {selectedPeriod: this.periodTypes[this.periodTypes.length - 1]}
  }
  viewAudit (audit) {
    this.$state.go('root.audit.view', {audit_id: audit._id, audit: audit})
  }
  onPeriodChange () {
    if (!this.filter.selectedPeriod) {
      this.filter.startDate = null
      this.filter.endDate = null
      return
    }
    if (this.filter.selectedPeriod.startDate) {
      this.filter.startDate = this.filter.selectedPeriod.startDate
    }
    if (this.filter.selectedPeriod.endDate) {
      this.filter.endDate = this.filter.selectedPeriod.endDate
    }
  }
}
export default AuditsController
