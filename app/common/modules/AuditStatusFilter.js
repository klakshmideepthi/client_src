/*
 * Usage:
 * ng-repeat="audit in audsCtrl.audits | atm_audit_status_filter : audsCtrl.filter.filterStatus : 'isCompleted' : {true_label: 'Completed', false_label: 'In Progress, 'all_label: 'All'}"
 */
export default function () {
  return function (input, filter, field, options) {
    if (!input || !input.length) {
      return input
    }
    if (!filter) {
      return input
    }
    const out = []
    for (var i = 0; i < input.length; i++) {
      const value = input[i][field]
      if (!value) {
        if (filter === 'Not Audited') {
          out.push(input[i])
        }
      } else {
        if (value === filter) {
          out.push(input[i])
        }
      }
    }
    return out
  }
}
