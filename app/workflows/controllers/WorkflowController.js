import CONSTANTS from '../../common/modules/Constants'
class WorkflowController {
  constructor ($http, $stateParams, $state, workflowService, usersService) {
    'ngInject'
    this.$http = $http
    this.$state = $state
    this.usersService = usersService
    this.docTypes = CONSTANTS.WORKFLOW_DOC_TYPES
    this.wf_id = $stateParams.wf_id
    this.workflowService = workflowService
    this.WORKFLOW_STATES = workflowService.getWorkflowStates()
    this.WORKFLOW_STATES_ARRAY = Object.values(this.WORKFLOW_STATES)
    this.workflows = workflowService.getWorkflows()
    if (this.wf_id) {
      this.selectedWf = workflowService.getWorkflow(this.wf_id)
    }
    this.query = {order: '-lastChangedAt'}
    this.defaultFilter = {}
    this.filter = Object.assign({}, this.defaultFilter)
    this.currentUser = usersService.getCurrentUser()
    this.users = usersService.getUsers()
    this.workflowStates = workflowService.getWorkflowStates()
    this.propChoices = {
      'status': ['open', 'closed']
    }
    this.propChoices.state = []
    angular.forEach(this.workflowStates, (value, key) => this.propChoices.state.push(key))
    this.prefilters = [
      {label: 'Open Items by me', creatorId: this.currentUser._id, status: ['open']},
      {label: 'Closed Items by me', closedById: this.currentUser._id, status: ['closed']},
      {label: 'Open Items assigned to me', assigneeId: this.currentUser._id, status: ['open']},
      {label: 'Closed Items assigned to me', closedById: this.currentUser._id, status: ['closed']}
    ]
    this.selectedFilter = this.prefilters[0]
  }
  startEditing () {
    this.editing = true
    this.newflow = Object.assign({}, this.selectedWf)
    this.docs = {newfiles: []}
    if (this.selectedWf.assigneeId) {
      this.newflow.assignee = this.usersService.getUserById(this.selectedWf.assigneeId)
    }
  }
  docsChanged (docs) {
    this.docs = docs
  }
  onEditFlowSave () {
    if (this.newflow.assignee) {
      this.newflow.assigneeId = this.newflow.assignee._id
      this.newflow.assigneeName = this.newflow.assignee.name
      delete this.newflow.assignee
    }
    this.workflowService.updateWorkflow(this.selectedWf, this.newflow, this.newflow.comment)
    angular.forEach(this.docs.newFiles, (value, key) => {
      // TODO: Fix this when the server URL is ready.
      this.workflowService.addDocument(this.selectedWf)
    })
    this.editing = false
  }
  onEditFlowCancel () {
    this.editing = false
  }
  viewWorkflow (workflow) {
    this.$state.go('root.workflows.view', {wf_id: workflow._id})
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
  }
  toggleCheckbox (prop, value) {
    if (!this.filter[prop]) {
      const t = this.propChoices[prop].indexOf(value)
      if (t >= 0) {
        this.filter[prop] = Object.assign([], this.propChoices[prop])
        this.filter[prop].splice(t, 1)
      }
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
  }
  openMenu (menu, ev) {
    menu.open(ev)
  }
}
export default WorkflowController
