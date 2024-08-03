let AssetTableDirective = () => {
  return {
    template: template,
    restrict: 'AE',
    scope: {
      data: '=',
      assetFilter: '=',
      branchFilter: '=',
      dateFilter: '='
    }
  }
}
export default AssetTableDirective

const template = '<md-table-container>' +
  '<table md-table>' +
    "<thead md-head md-order='query.order'>" +
      '<tr md-row>' +
        "<th style='width: 20px; padding: 0 20px 0 20px; border: 1px solid #dcdcdc' md-column md-order-by='_index'>#</th>" +
        "<th style='padding: 0 20px 0 20px; width: 200px; border: 1px solid #dcdcdc' md-column md-order-by='_id.name'>Asset</th>" +
        "<th style='padding: 0 20px 0 20px; width: 200px; border: 1px solid #dcdcdc' md-column md-order-by='branch'>Branch</th>" +
        "<th style='padding: 0 20px 0 20px;  width: 100px; border: 1px solid #dcdcdc' md-column mdNumeric md-numeric md-order-by='total'>Total</th>" +
        "<th style='padding: 0 20px 0 20px;  width: 100px; border: 1px solid #dcdcdc' md-column mdNumeric md-numeric md-order-by='totalQuantityAvailable'>Available</th>" +
        "<th style='padding: 0 20px 0 20px;  width: 100px; border: 1px solid #dcdcdc' md-column mdNumeric md-order-by='totalQuantityUsed'>Used</th>" +
        "<th style='padding: 0 20px 0 20px;  width: 100px; border: 1px solid #dcdcdc' md-column md-order-by='date'>Month</th>" +
        "<th style='padding: 0 20px 0 20px;  width: 100px; border: 1px solid #dcdcdc' md-column md-order-by='snums'>Serial #</th>" +
        "<th style='padding: 0 20px 0 20px; border: 1px solid #dcdcdc' md-column mdNumeric md-order-by='totalValue'>Total Value</th>" +
      '</tr>' +
    '</thead>' +
    '<tbody md-tbody>' +
      "<tr style='height: 32px' md-row ng-repeat='item in data" +
        '| filter: {name: assetFilter.name}' +
        '| filter: {branch: branchFilter.name}' +
        '| filter: {date: dateFilter.date}' +
        "| orderBy: query.order'>" +
        "<td style='width: 20px; padding: 10px 20px 10px 20px; border: 1px solid #dcdcdc' md-cell>{{item._index}}</td>" +
        "<td style='padding: 10px 20px 10px 20px; border: 1px solid #dcdcdc' md-cell>{{item._id.name}}</td>" +
        "<td style='padding: 10px 20px 10px 20px; border: 1px solid #dcdcdc' md-cell>{{item.branch}}</td>" +
        "<td style='white-space: nowrap; padding: 10px 20px 10px 20px; border: 1px solid #dcdcdc' md-cell>{{item.total}}</td>" +
        "<td style='white-space: nowrap; padding: 10px 20px 10px 20px; border: 1px solid #dcdcdc' md-cell>{{item.totalQuantityAvailable}}</td>" +
        "<td style='white-space: nowrap; padding: 10px 20px 10px 20px;  border: 1px solid #dcdcdc' md-cell>{{item.totalQuantityUsed}}</td>" +
        "<td style='white-space: nowrap; padding: 10px 20px 10px 20px;  border: 1px solid #dcdcdc' md-cell>{{item.date | date:'MMM-yyyy'}}</td>" +
        "<td style='padding: 10px 20px 10px 20px; border: 1px solid #dcdcdc' md-cell>{{item.snums}}</td>" +
        "<td style='white-space: nowrap; padding: 10px 20px 10px 20px;  border: 1px solid #dcdcdc' md-cell>{{item.totalValue | currency}}</td>" +
      '</tr>' +
    '</tbody>' +
  '</table>' +
'</md-table-container>'
