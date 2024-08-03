import CONSTANTS from '../../common/modules/Constants'
class WorkflowFilterController {
  constructor ($http, $stateParams, $state, $filter, workflowService, usersService) {
    'ngInject'
    this.$http = $http
    this.$state = $state
    this.$filter = $filter
    this.usersService = usersService
    this.currentUser = usersService.currentUser
    this.docTypes = CONSTANTS.WORKFLOW_DOC_TYPES
    this.workflowService = workflowService
    this.defaultFilter = {}
    this.filter = Object.assign({}, this.defaultFilter)
    this.workflowStates = workflowService.getWorkflowStates()
    this.propChoices = {
      'status': ['open', 'closed']
    }
    this.workflowTypes = Object.values(this.workflowService.WORKFLOW_TYPES)
    this.propChoices.state = []
    this.propChoices.type = []
    angular.forEach(this.workflowStates, (value, key) => this.propChoices.state.push(key))
    angular.forEach(this.workflowService.WORKFLOW_TYPES, (value, key) => this.propChoices.type.push(key))
    this.prefilters = [
      {label: 'Open Items by me', creatorId: this.currentUser._id, status: ['open']},
      {label: 'Closed Items by me', creatorId: this.currentUser._id, status: ['closed']},
      {label: 'Open Items assigned to me', assigneeId: this.currentUser._id, status: ['open']},
      {label: 'Closed Items assigned to me', assigneeId: this.currentUser._id, status: ['closed']}
    ]
    // this.selectedFilter = this.prefilters[0]
    this.orderChanged = this.orderChanged.bind(this)
  }
  ifStateIncludes (str) {
    return this.$state.includes(str)
  }
  viewNextWorkflow (workflow) {
    if (this.nextWorkflowExists(workflow)) {
      this.$state.go('root.workflows.view', {wf_id: this.workflows[workflow._index + 1]._id})
    }
  }
  nextWorkflowExists (workflow) {
    return workflow && (workflow._index < (this.workflows.length - 1))
  }
  viewPrevWorkflow (workflow) {
    if (this.prevWorkflowExists(workflow)) {
      this.$state.go('root.workflows.view', {wf_id: this.workflows[workflow._index - 1]._id})
    }
  }
  prevWorkflowExists (workflow) {
    return workflow && workflow._index > 0
  }
  setPreFilter (filter) {
    this.filter = Object.assign({}, this.defaultFilter, filter || {})
    this.selectedFilter = filter
    this.filterChanged(filter)
  }
  toggleCheckbox (prop, value) {
    if (!this.filter[prop]) {
      const t = this.propChoices[prop].indexOf(value)
      if (t >= 0) {
        this.filter[prop] = Object.assign([], this.propChoices[prop])
        this.filter[prop].splice(t, 1)
      }
      this.filterChanged(this.filter)
      return
    }
    const idx = this.filter[prop].indexOf(value)
    if (idx >= 0) {
      this.filter[prop].splice(idx, 1)
    } else {
      this.filter[prop].push(value)
    }
    if (!this.filter[prop].length) {
      delete this.filter[prop]
    }
    this.filterChanged(this.filter)
  }
  onChange (field) {
    if (this.filter[field]) {
      this.filter[field + 'Id'] = this.filter[field]._id
    } else {
      delete this.filter[field + 'Id']
    }
    this.filterChanged(this.filter)
  }
  orderChanged (order) {
    this.filter.order = order
    this.filterChanged(this.filter)
  }
  openMenu (menu, ev) {
    menu.open(ev)
  }
  filterChanged (filter = this.filter) {
    this.filteredWorkflows = this.workflowService.getWorkflows()
    if (filter) {
      this.filteredWorkflows = this.$filter('filter')(this.filteredWorkflows, {creatorId: filter.creatorId})
      this.filteredWorkflows = this.$filter('filter')(this.filteredWorkflows, {assigneeId: filter.assigneeId})
      this.filteredWorkflows = this.$filter('atm_tag_search')(this.filteredWorkflows, filter.status, 'status')
      this.filteredWorkflows = this.$filter('atm_tag_search')(this.filteredWorkflows, filter.state, 'state.key')
      this.filteredWorkflows = this.$filter('atm_tag_search')(this.filteredWorkflows, filter.type, 'type.key')
      this.filteredWorkflows = this.$filter('filter')(this.filteredWorkflows, {closedById: filter.closedById})
      this.filteredWorkflows = this.$filter('orderBy')(this.filteredWorkflows, filter.order)
    }
  }
}
export default WorkflowFilterController
