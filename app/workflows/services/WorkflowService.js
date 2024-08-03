import CONSTANTS from '../../common/modules/Constants'
import {Lorem} from 'Faker'
const WORKFLOW_TYPES = {
  'NEW_ASSET': {
    key: 'NEW_ASSET',
    label: 'New Asset Request',
    prefix: 'AST',
    getTitle: (creator) => 'New asset request by ' + creator.name
  },
  'MOVE_ASSET': {
    key: 'MOVE_ASSET',
    label: 'Asset Move Request',
    prefix: 'MOV',
    data: {
      assetName: {title: 'Asset'},
      quantity: {title: 'Quantitiy'},
      fromBranchName: {title: 'From Branch'},
      toBranchName: {title: 'To Branch'}
    },
    getTitle: (creator, {fromBranchName, toBranchName}) => 'Move Request by ' + creator.name + ' from ' + fromBranchName + ' to ' + toBranchName
  }
}
const WORKFLOW_STATES =
  {
    'OPEN': {key: 'OPEN', stage: 0, label: 'Opened', isOpen: true, style: {'color': '#4a6785', 'background-color': '#ffffff', 'border': '1px solid #e4e8ed'}},
    'ASSIGNED': {key: 'ASSIGNED', stage: 10, label: 'Assigned', isOpen: true, style: {'color': '#594300', 'background-color': '#ffd351', 'border': '1px solid #ffe28c'}},
    'NEED_MORE_INFO': {key: 'NEED_MORE_INFO', stage: 20, label: 'Need More Information', isOpen: true, style: {'color': '#594300', 'background-color': '#ffd351', 'border': '1px solid #ffe28c'}},
    'APPROVED': {key: 'APPROVED', stage: 30, label: 'Approved', isOpen: true, style: {'color': '#594300', 'background-color': '#ffd351', 'border': '1px solid #ffe28c'}},
    'SHIPPED': {key: 'SHIPPED', stage: 40, label: 'Shipped', isOpen: true, style: {'color': '#594300', 'background-color': '#ffd351', 'border': '1px solid #ffe28c'}},
    'REJECTED': {key: 'REJECTED', stage: 50, label: 'Rejected', isOpen: false, style: {'color': '#ffffff', 'background-color': '#14892c', 'border': '1px solid #14892c'}},
    'COMPLETED': {key: 'COMPLETED', stage: 60, label: 'Completed', isOpen: false, style: {'color': '#ffffff', 'background-color': '#14892c', 'border': '1px solid #14892c'}}
  }
class WorkflowService {
  constructor ($q, $http, $mdToast, usersService, branchService) {
    this.$http = $http
    this.$mdToast = $mdToast
    this.usersService = usersService
    this.workflows = []
    this.WORKFLOW_TYPES = WORKFLOW_TYPES
    const keys = Object.keys(WORKFLOW_STATES)
    const types = Object.values(WORKFLOW_TYPES)
    $q.all([usersService.promise1, usersService.promise2, branchService.promise]).then(() => {
      const startDate = moment().subtract(1, 'year')
      const users = usersService.getUsers()
      const branches = branchService.branches
      for (var i = 0; i < 100; i++) {
        const workflow = {}
        const k = Math.floor(Math.random() * (keys.length - 1))
        const creator = users[Math.floor(Math.random() * users.length)]
        workflow.type = types[Math.floor(Math.random() * types.length)]
        const fromBranch = branches[Math.floor(Math.random() * branches.length)]
        const toBranch = branches[Math.floor(Math.random() * branches.length)]
        workflow.data = {
          fromBranchId: fromBranch._id,
          fromBranchName: fromBranch.name,
          toBranchId: toBranch._id,
          toBranchName: toBranch.name,
          assetName: Lorem.sentence(),
          quantity: Math.floor(Math.random() * 100)
        }
        workflow.title = workflow.type.getTitle(creator, {fromBranchName: fromBranch.name, toBranchName: toBranch.name})
        workflow.description = Lorem.paragraph()
        var d = this.getRandomDate(startDate)
        this.addWorkflow(workflow, creator, d)
        for (var j = 1; j <= k; j++) {
          const key = keys[j]
          var comment = Lorem.paragraph()
          var assignee
          const newflow = Object.assign(workflow, {state: WORKFLOW_STATES[key]})
          if (key === 'ASSIGNED') {
            assignee = users[Math.floor(Math.random() * users.length)]
            newflow.assigneeId = assignee._id
            newflow.assigneeName = assignee.name
          }
          d = this.getRandomDate(d)
          this.updateWorkflow(workflow, newflow, comment, users[Math.floor(Math.random() * users.length)], d)
        }
        for (var l = 0; l < 4; l++) {
          const lock = i * 100 + j * k + l
          const title = Lorem.sentence()
          this.addDocument(workflow, 'https://loremflickr.com/320/240/?lock=' + lock, title, users[Math.floor(Math.random() * users.length)], this.getRandomDate(startDate))
        }
      }
    })
  }
  addDocument (workflow, url, title, user, date = moment()) {
    if (!user) {
      user = this.usersService.currentUser
    }
    if (!url) {
      // TODO: Replace with proper document upload
      url = 'https://loremflickr.com/320/240/?lock='
    }
    if (!workflow.docs) {
      workflow.docs = []
    }
    workflow.docs.push({url: url, title: title, userId: user._id, userName: user.name, date: date})
  }
  getWorkflowStates () {
    return WORKFLOW_STATES
  }
  addWorkflow (workflow, user = this.usersService.currentUser, date = moment()) {
    workflow._index = this.workflows.length
    workflow.key = workflow.type.prefix + '-' + ('0000000000' + workflow._index).substr(('0000000000' + workflow._index).length - 5)
    workflow._id = workflow._index + ''
    workflow.createdAt = date
    workflow.lastChangedAt = date
    workflow.state = WORKFLOW_STATES.OPEN
    workflow.status = 'Open'
    workflow.creatorId = user._id
    workflow.creatorName = user.name
    this.workflows.push(workflow)
  }
  getWorkflows () {
    return this.workflows
  }
  getWorkflow (_id) {
    for (var i = 0; i < this.workflows.length; i++) {
      if (this.workflows[i]._id === _id) {
        return this.workflows[i]
      }
    }
    return null
  }
  getWorkflowsCreatedBy (userId) {
    const output = []
    for (var i = 0; i < this.workflows.length; i++) {
      if (this.workflows[i].creator === userId) {
        output.push(this.workflows[i])
      }
    }
    return output
  }
  getWorkflowsAssignedTo (userId) {
    const output = []
    for (var i = 0; i < this.workflows.length; i++) {
      if (this.workflows[i].assignedTo === userId) {
        output.push(this.workflows[i])
      }
    }
    return output
  }
  getWorkflowsByAssetId (assetId) {
    const output = []
    for (var i = 0; i < this.workflows.length; i++) {
      if (this.workflows[i].data && this.workflows[i].data.assetId === assetId) {
        output.push(this.workflows[i])
      }
    }
    return output
  }

  updateWorkflow (workflow, newflow, comment, user = this.usersService.currentUser, date = moment()) {
    workflow.lastChangedAt = date
    if (!workflow.history) {
      workflow.history = []
    }
    const from = {}
    const to = {}
    angular.forEach(['title', 'description', 'state', 'assigneeId', 'assigneeName'], (value) => {
      if (!Object.is(workflow[value], newflow[value])) {
        from[value] = workflow[value]
        to[value] = newflow[value]
      }
    })
    workflow.history.push({
      userId: user._id,
      userName: user.name,
      from: from,
      to: to,
      date: date,
      comment: comment
    })
    const oldState = workflow.state
    workflow = Object.assign(workflow, newflow)
    workflow.lastChangedAt = date
    workflow.status = workflow.state.isOpen ? 'open' : 'closed'
    if (workflow.isOpen) {
      delete workflow.closedAt
      delete workflow.closedById
      delete workflow.closedByName
    } else {
      workflow.closedAt = date
      workflow.closedById = user ? user._id : workflow.assigneeId
      workflow.closedByName = user ? user.name : workflow.assigneeName
    }
    if (oldState !== WORKFLOW_STATES.COMPLETED && workflow.state === WORKFLOW_STATES.COMPLETED) {
      if (workflow.type === WORKFLOW_TYPES.MOVE_ASSET) {
        this.completeMoveAsset(workflow)
      }
    }
  }
  completeMoveAsset (workflow) {
    const data = workflow.data
    if (!data.assetId) {
      this.updateWorkflow(workflow, {}, 'Failed to complete asset move. No Asset ID found to move -- added automatically')
      return
    }
    if (!data.quantity) {
      this.updateWorkflow(workflow, {}, 'Failed to complete asset move. No quantity found to move -- added automatically')
      return
    }
    if (!data.fromBranchId) {
      this.updateWorkflow(workflow, {}, 'Failed to complete asset move. No source branch found to move the asset -- added automatically')
      return
    }
    if (!data.toBranchId) {
      this.updateWorkflow(workflow, {}, 'Failed to complete asset move. No target branch found to move the asset -- added automatically')
      return
    }
    const url = CONSTANTS.URL_BASE + '/asset/move?ASSET_ID=' + data.assetId + '&QUANTITY=' + data.quantity + '&BRANCH_FROM=' + data.fromBranchId + '&BRANCH_TO=' + data.toBranchId
    this.$http.put(url, {})
    .then(() => {
      const msg = 'Successfully moved ' + data.quantity + ' of ' + data.assetName + ' from ' + data.fromBranchName + ' to ' + data.toBranchName
      this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
      this.updateWorkflow(workflow, {}, msg + ' -- added automatically')
    }, (obj) => {
      const msg = 'Unable to move asset: ' + data.assetName + '. Error ' + obj.statusText
      this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
      this.updateWorkflow(workflow, {}, msg + ' -- added automatically')
    })
  }
  getRandomDate (from) {
    const end = moment().valueOf()
    const start = from.valueOf()
    const t = start + Math.floor((Math.random() * (end - start)))
    return moment(t)
  }
}
export default WorkflowService
