import CONSTANTS from '../../common/modules/Constants'
class MeController {
  constructor ($rootScope, $http, $mdDialog, branchService, NgMap) {
    'ngInject'
    this.$rootScope = $rootScope
    this.$http = $http
    // TODO: Get these values from server
    this.numAssets = 46000
    this.numAssetsAvg = 125
    this.assetValue = 12000000
    this.assetValueAvg = 103121
    this.purchasesThisYear = 23
    this.purchasesThisYearAvg = 1.34523
    this.branchService = branchService
    this.$mdDialog = $mdDialog
    this.today = moment().hours(0).minutes(0).seconds(0).milliseconds(0)
    this.assetChart = {data: [], labels: []}
    this.notifications = {}
    this.notifsToShow = []
    NgMap.getMap().then((map) => {
      this.map = map
      this.markers = []
      angular.forEach(this.branchService.getBranches(), (branch) => {
        branch.geoLocation && this.markers.push({pos: [branch.geoLocation.latitude, branch.geoLocation.longitude], branch: branch})
      })
    })
    this.googleMapsUrl = 'https://maps.googleapis.com/maps/api/js?key=' + CONSTANTS.GOOGLE_API_KEY
    if ($rootScope.currentUser && $rootScope.currentUser.branch) {
      this.getAssetChartData()
      this.getNotifications()
    } else {
      $rootScope.$on('currentUserInfoLoaded', () => this.getAssetChartData())
      $rootScope.$on('currentUserInfoLoaded', () => this.getNotifications())
    }
  }
  branchSelected (ev, me, p) {
    me.$mdDialog.show({
      controller: BranchPopupController,
      controllerAs: 'branch',
      template: '<md-dialog><md-dialog-content>' +
        "<md-toolbar style='min-height: 40px; height: 40px'>" +
          "<div class='md-toolbar-tools' style='background-color: #EC725D'>" +
            '{{branch.branch.name}}' +
          '</div>' +
        '</md-toolbar>' +
        "<div style='padding: 10px 10px 10px 10px'>" +
          "<div style='font-size: 12px'>" +
            "<label style='font-weight: bold'>Address: </label>" +
            "{{branch.branch.address.addressLine + ', ' + branch.branch.address.city + ', ' + branch.branch.address.state}}" +
          '</div>' +
          "<div style='font-size: 12px'>" +
            "<label style='font-weight: bold'># Assets: </label>" +
            '{{branch.assetData.numAssets}}' +
          '</div>' +
          "<div style='font-size: 12px'>" +
            "<label style='font-weight: bold'>Total Value: </label>" +
            '{{branch.assetData.totalVal | currency}}' +
          '</div>' +
        '</div>' +
      '</md-dialog-content></md-dialog>',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {branch: p.branch, assetData: me.branchService.getBranchAssetData(p.branch._id), promise: me.branchService.getBranchAssetDataPromise(p.branch._id)}
    })
  }
  hasEvents (day) {
    return day.isCurrentMonth && this.notifications.hasOwnProperty(moment(day.date).hours(0).minutes(0).seconds(0).milliseconds(0))
  }
  dateSelected (day) {
    this.selectedDay = day.date
    this.notifsToShow = this.notifications[moment(day.date).hours(0).minutes(0).seconds(0).milliseconds(0)]
  }
  getAssetChartData () {
    const url = CONSTANTS.URL_BASE + '/assets?BRANCH_ID=' + this.$rootScope.currentUser.branch + '&sort_by=Cost&sort_order=ASC'
    this.assetChart = {data: [], labels: []}
    this.$http.get(url, {})
    .then(({data, status, header, config}) => {
      for (var i = 0; i < data.length; i++) {
        this.assetChart.data.push(data[i].cost || 0)
        this.assetChart.labels.push(data[i].name)
      }
    },
    () => {
      console.log('Unable to get the chart data')
    }
  )
  }
  getNotifications () {
    var startDate = moment().subtract(6, 'month').startOf('month').format('YYYY-M-D')
    var endDate = moment().add(6, 'month').startOf('month').format('YYYY-M-D')
    var url = CONSTANTS.URL_BASE + '/reports/asset/Expiring?START_DATE=' + startDate + '&END_DATE=' + endDate + '&BRANCH=' + this.$rootScope.currentUser.branch + '&GROUP_BY=%24name'
    this.notifications = {}
    this.$http.get(url, {})
    .then(({data}) => {
      for (var i = 0; i < data.length; i++) {
        const d = moment(data[i].validityDate).hours(0).minutes(0).seconds(0).milliseconds(0)
        if (!this.notifications.hasOwnProperty(d)) {
          this.notifications[d] = []
        }
        data[i].isPast = d.isBefore(this.today) || d.isSame(this.today)
        this.notifications[d].push(data[i])
      }
      this.dateSelected({date: this.today})
    },
    () => console.log('Error while trying to get notifications...')
  )
  }
}
class BranchPopupController {
  constructor (branch, assetData) {
    this.branch = branch
    this.assetData = assetData
  }
}

export default MeController
