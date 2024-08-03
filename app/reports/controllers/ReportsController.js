import CONSTANTS from '../../common/modules/Constants'
var pdfMake = require('../../../../node_modules/pdfmake/build/pdfmake.min.js')
require('imports-loader?this=>window!../../../../node_modules/pdfmake/build/vfs_fonts.js')
class ReportsController {
  constructor ($http, $filter, $rootScope, branchService) {
    'ngInject'
    this.$http = $http
    this.$filter = $filter
    this.branchService = branchService
    this.reportTypes = [
      {key: 'asset_value_asset',
        label: 'Asset Value - by asset',
        pdflabel: 'Asset Value Report',
        url: ({startDate, endDate}) => CONSTANTS.URL_BASE + '/reports/asset/value?START_DATE=' + getDateStr(startDate) + '&END_DATE=' + getDateStr(endDate) + '&GROUP_BY=%24name'
      },
      {key: 'asset_value_branch',
        label: 'Asset Value - by branch',
        url: ({startDate, endDate}) => CONSTANTS.URL_BASE + '/reports/asset/value?START_DATE=' + getDateStr(startDate) + '&END_DATE=' + getDateStr(endDate) + '&GROUP_BY=%24branch'
      }
    ]
    this.groupByTypes = [
      {key: 'asset', label: 'Asset'},
      {key: 'month', label: 'Month'}
    ]
    if ($rootScope.currentUser && $rootScope.currentUser.role === 'SU') {
      this.groupByTypes.push({key: 'branch', label: 'Branch'})
    }
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
    this.selectedReport = this.reportTypes[0]
    this.selectedPeriod = this.periodTypes[this.periodTypes.length - 1]
    this.assetNames = []
    this.months = []
    this.branches = []
  }
  runReport () {
    this.reportData = null
    this.$http.get(this.selectedReport.url(this), {})
      .then(({data}) => {
        this.reportData = data
        const assetNames = {}
        const months = {}
        const branches = {}
        for (var i = 0; i < data.length; i++) {
          const d = data[i]
          d._index = i + 1
          d.name = d._id.name
          d.branch = this.branchService.getBranchById(d._id.branch).name || 'Unknown Branch'
          d.snums = ''
          if (d.serialNumbers) {
            angular.forEach(d.serialNumbers, (value, key) => {
              if (key > 0) {
                d.snums += ', '
              }
              d.snums += value.serialNumber
            })
          }
          if (d.lastSerialNumber && d.lastSerialNumber.indexOf(',') >= 0) {
            d.lastSerialNumber = d.lastSerialNumber.replace(new RegExp(',', 'g'), ', ')
          }
          // d.name = d._id.name
          // d.branch_id = d._id.branch
          const m = moment().month(d._id.month - 1).year(d._id.year).startOf('month')
          const dateStr = m.format('MMM-YYYY')
          d.date = m.valueOf()
          const brData = branches[d.branch] ? branches[d.branch].data : []
          const asData = assetNames[d._id.name] ? assetNames[d._id.name].data : []
          const moData = months[dateStr] ? months[dateStr].data : []
          brData.push(d)
          asData.push(d)
          moData.push(d)
          branches[d.branch] = {name: d.branch, data: brData}
          assetNames[d._id.name] = {name: d._id.name, data: asData}
          months[dateStr] = {name: dateStr, date: d.date, data: moData}
        }
        this.assetNames = Object.values(assetNames).sort(stringCompare)
        this.months = Object.values(months).sort((a, b) => b.date - a.date)
        this.branches = Object.values(branches).sort(stringCompare)
      },
      (error) => console.error('Unable to get report ' + this.selectedReport.label + '. Error: ', error)
    ).catch((error) => console.error('Exception while executing report ' + this.selectedReport.label + '. Error: ', error))
  }
  onPeriodChange () {
    if (this.selectedPeriod.startDate) {
      this.startDate = this.selectedPeriod.startDate
    }
    if (this.selectedPeriod.endDate) {
      this.endDate = this.selectedPeriod.endDate
    }
    this.onInputsChanged()
  }
  onInputsChanged () {
    this.reportData = null
  }
  findMatchingAssets (text) {
    return this.assetNames.filter((o) => o.name.toLowerCase().indexOf(text.toLowerCase()) >= 0)
  }
  findMatchingBranches (text) {
    return this.branches.filter((o) => o.name.toLowerCase().indexOf(text.toLowerCase()) >= 0)
  }
  findMatchingDates (text) {
    return this.months.filter((o) => o.name.toLowerCase().indexOf(text.toLowerCase()) >= 0)
  }

  assetFilterChanged (item) {}
  branchFilterChanged (item) {}
  dateFilterChanged (item) {}
  exportPDF () {
    const dd = this.getPDFJson()
    console.log('Creating pdf.....')
    pdfMake.createPdf(dd).download('AssetReport.pdf')
    console.log('Done Creating PDF')
  }
  getPDFJsonCommon (dd) {
    dd.styles = {
      tableHeader: {bold: true, color: '#666', fontSize: 8, margin: [0, 10]},
      header: {bold: true, color: '#222', fontSize: 12, margin: [0, 10]},
      tocheader: {bold: true, color: '#222', fontSize: 14, margin: [0, 10, 0, 20], decoration: 'underline'}
    }
    var content = []
    dd.content = content
    content.push({text: this.selectedReport.pdflabel, alignment: 'center', fontSize: '30', margin: [0, 200, 0, 20]})
    content.push({text: getTimePeriodLabel(this), alignment: 'center', fontSize: '18', margin: [0, 20, 0, 20]})
    content.push({text: 'Generated at ' + moment().format('LLLL ZZ'), alignment: 'center', fontSize: '10', 'fontStyle': 'italic', italic: 'true', margin: [0, 20, 0, 20]})
    content.push({alignment: 'right', margin: [0, 300, 0, 20], pageBreak: 'after', image: image, fit: [200, 200]})
    return dd
  }
  getPDFJson () {
    var dd = {}
    dd = this.getPDFJsonCommon(dd)
    if (!this.groupBy) {
      return this.getPDFJsonTable(dd, this.reportData, [
        {text: '#', colId: (i, d) => i + 1},
        {text: 'Asset', colId: (i, d) => d._id.name},
        {text: 'Branch', colId: 'branch'},
        {text: 'Total', colId: 'total'},
        {text: 'Available', colId: 'totalQuantityAvailable'},
        {text: 'Used', colId: 'totalQuantityUsed'},
        {text: 'Month', colId: (i, d) => moment(d.date).format('MMM-YYYY')},
        {text: 'Value', colId: (i, d) => d.totalValue ? this.$filter('currency')(d.totalValue) : ''},
        {text: 'Serial #', colId: 'snums', width: 100}
      ])
    }
    if (this.groupBy.key === 'asset') {
      return this.getPDFJsonGroupBy(dd, this.assetNames, [
        {text: '#', colId: (i, d) => i + 1},
        {text: 'Branch', colId: 'branch'},
        {text: 'Total', colId: 'total'},
        {text: 'Available', colId: 'totalQuantityAvailable'},
        {text: 'Used', colId: 'totalQuantityUsed'},
        {text: 'Month', colId: (i, d) => moment(d.date).format('MMM-YYYY')},
        {text: 'Value', colId: (i, d) => d.totalValue ? this.$filter('currency')(d.totalValue) : ''},
        {text: 'Serial #', colId: 'serialNumber', width: 100}
      ])
    } else if (this.groupBy.key === 'branch') {
      return this.getPDFJsonGroupBy(dd, this.branches, [
        {text: '#', colId: (i, d) => i + 1},
        {text: 'Asset', colId: (i, d) => d._id.name},
        {text: 'Total', colId: 'total'},
        {text: 'Available', colId: 'totalQuantityAvailable'},
        {text: 'Used', colId: 'totalQuantityUsed'},
        {text: 'Month', colId: (i, d) => moment(d.date).format('MMM-YYYY')},
        {text: 'Value', colId: (i, d) => d.totalValue ? this.$filter('currency')(d.totalValue) : ''},
        {text: 'Serial #', colId: 'snums', width: 100}
      ])
    } else if (this.groupBy.key === 'month') {
      return this.getPDFJsonGroupBy(dd, this.months, [
        {text: '#', colId: (i, d) => i + 1},
        {text: 'Asset', colId: (i, d) => d._id.name},
        {text: 'Branch', colId: 'branch'},
        {text: 'Total', colId: 'total'},
        {text: 'Available', colId: 'totalQuantityAvailable'},
        {text: 'Used', colId: 'totalQuantityUsed'},
        {text: 'Value', colId: (i, d) => d.totalValue ? this.$filter('currency')(d.totalValue) : ''},
        {text: 'Serial #', colId: 'snums', width: 100}
      ])
    } else {
      return this.getPDFJsonTable(dd, this.reportData, [
        {text: '#', colId: (i, d) => i + 1},
        {text: 'Asset', colId: (i, d) => d._id.name},
        {text: 'Branch', colId: 'branch'},
        {text: 'Total', colId: 'total'},
        {text: 'Available', colId: 'totalQuantityAvailable'},
        {text: 'Used', colId: 'totalQuantityUsed'},
        {text: 'Month', colId: (i, d) => moment(d.date).format('MMM-YYYY')},
        {text: 'Value', colId: (i, d) => d.totalValue ? this.$filter('currency')(d.totalValue) : ''},
        {text: 'Serial #', colId: 'snums', width: 100}
      ])
    }
  }
  getPDFJsonTable (dd, data, columns) {
    const body = []
    const widths = []
    const headerRow = []
    dd.content.push({
      color: '#444',
      fontSize: 10,
      margin: 5,
      table: {margin: 10, headerRows: 1, body: body, widths: widths},
      layout: {hLineColor: '#dcdcdc', vLineColor: '#dcdcdc'}
    })
    for (var i = 0; i < columns.length; i++) {
      widths[i] = columns[i].width ? columns[i].width : 'auto'
      headerRow.push({style: 'tableHeader', text: columns[i].text})
    }
    body.push(headerRow)
    for (i = 0; i < data.length; i++) {
      const d = data[i]
      const row = []
      for (var j = 0; j < columns.length; j++) {
        const col = columns[j]
        row.push(typeof col.colId === 'function' ? col.colId(i, d) : d[col.colId])
      }
      body.push(row)
    }
    return dd
  }
  getPDFJsonGroupBy (dd, group, columns) {
    dd.content.push({toc: {title: {text: 'Table of Contents', style: 'tocheader'}}})
    for (var i = 0; i < group.length; i++) {
      const g = group[i]
      dd.content.push({ text: (i + 1) + '. ' + g.name, style: 'header', pageBreak: 'before', tocItem: true })
      dd = this.getPDFJsonTable(dd, g.data, columns)
    }
    return dd
  }
}
export default ReportsController
function getDateStr (date) {
  return moment(date).format('MM/DD/YYYY')
}
function stringCompare (a, b) {
  var nameA = a.name.toUpperCase()
  var nameB = b.name.toUpperCase()
  if (nameA < nameB) {
    return -1
  }
  if (nameA > nameB) {
    return 1
  }
  return 0
}
function getTimePeriodLabel ({selectedPeriod, startDate, endDate}) {
  var str = 'Generated for '
  if (selectedPeriod && selectedPeriod.key !== 'custom') {
    str += selectedPeriod.label + ' ('
  }
  str += 'from ' + startDate.format('DD-MMM-YYYY') + ' to ' + endDate.format('DD-MMM-YYYY')
  if (selectedPeriod && selectedPeriod.key !== 'custom') {
    str += ')'
  }
  return str
}
const image = 'data:image/png;base64,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'
