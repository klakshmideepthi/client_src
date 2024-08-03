/*
 * Usage:
 * ng-repeat="audit in audsCtrl.audits | atm_completion_filter : audsCtrl.filter.filterStatus : 'isCompleted' : {true_label: 'Completed', false_label: 'In Progress, 'all_label: 'All'}"
 */
export default function () {
  return function (input, searchStr, field, options) {
    const true_label = options && options.hasOwnProperty('true_label') ? options.true_label : 'Completed'
    const false_label = options && options.hasOwnProperty('false_label') ? options.false_label : 'In Progress'
    const all_label = options && options.hasOwnProperty('all_label') ? options.all_label : 'All'
    if (!searchStr || searchStr.length === 0 || searchStr === all_label) {
      return input
    }
    if (!input || !input.length) {
      return input
    }
    const out = []
    for (var i = 0; i < input.length; i++) {
      if (input[i][field] && searchStr === true_label) {
        out.push(input[i])
      } else if (!input[i][field] && searchStr !== true_label) {
        out.push(input[i])
      }
    }
    return out
  }
}
