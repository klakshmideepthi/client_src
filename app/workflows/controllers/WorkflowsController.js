class WorkflowsController {
  constructor (workflowService) {
    'ngInject'
    this.workflowService = workflowService
    this.query = {order: '-lastChangedAt'}
  }
}
export default WorkflowsController
