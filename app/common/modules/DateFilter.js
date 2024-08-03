/*
 * Usage:
 * ng-repeat="audit in audsCtrl.audits | atm_date_filter : audsCtrl.filter.fromDate : audsCtrl.filter.toDate : 'endDate'
 */
export default function () {
  return function (input, fromDate, endDate, field, options) {
    if (!input || !input.length) {
      return input
    }
    if (!fromDate && !endDate) {
      return input
    }
    var fd = moment(fromDate)
    if (!fd.isValid()) {
      fd = null
    }
    var ed = moment(endDate)
    if (!ed.isValid()) {
      ed = null
    }
    if (!fd && !ed) {
      return input
    }
    const out = []
    for (var i = 0; i < input.length; i++) {
      var d = moment(input[i][field])
      if (!d || !d.isValid()) {
        continue
      }
      if (fd && d.isBefore(fd)) {
        continue
      }
      if (ed && d.isAfter(ed)) {
        continue
      }
      out.push(input[i])
    }
    return out
  }
}
