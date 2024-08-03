import CONSTANTS from '../../common/modules/Constants'
class AuditDemo {
  constructor ($http, $q, $rootScope, $anchorScroll, $timeout, branchService, usersService, accessService) {
    'ngInject'
    this.$http = $http
    this.$q = $q
    this.$rootScope = $rootScope
    this.$anchorScroll = $anchorScroll
    this.$timeout = $timeout
    this.branchService = branchService
    this.usersService = usersService
    this.accessibleBranchIds = accessService.accessControl['branches']
    this.demo = false
    if (this.demo) {
      this.audits_defer = $q.defer()
      this.audits_promise = this.audits_defer.promise
      this.audits = this.processAuditData(this.populateRandomAudits(this.usersService.users, this.branchService.branches, this.branchService.assets))
      this.audits_defer.resolve()
    } else {
      this.audits_promise = this.fetchAudits()
    }
  }
  fetchAudits () {
    if (this.accessibleBranchIds) {
      this.audits = []
      const def = this.$q.defer()
      const prom = def.promise
      const listOfProms = []
      for (var i = 0; i < this.accessibleBranchIds.length; i++) {
        const branchId = this.accessibleBranchIds[i]
        listOfProms.push(this.$http.get(CONSTANTS.URL_BASE + '/audits?BRANCH_ID=' + branchId, {})
          .then(({data}) => {
            this.audits = this.audits.concat(data)
          },
          () => console.log('Error while fetching audits for branch: ' + branchId)
        ))
      }
      this.$q.all(listOfProms).then(() => {
        def.resolve()
        this.audits && angular.forEach(this.audits, (value, key) => { value._index = key })
      },
      () => {
        def.resolve()
        this.audits && angular.forEach(this.audits, (value, key) => { value._index = key })
      })
      return prom
    } else {
      return this.$http.get(CONSTANTS.URL_BASE + '/audits', {})
        .then(({data}) => {
          this.audits = data
          this.audits && angular.forEach(this.audits, (value, key) => { value._index = key })
        },
        () => console.log('Error while fetching all audits')
      )
    }
  }
  getAuditsByAsset (assetId, branchId) {
    const out = []
    if (!this.audits) {
      return out
    }
    for (var i = 0; i < this.audits.length; i++) {
      const audit = this.audits[i]
      if (audit.branch_id !== branchId) {
        continue
      }
      if (audit.assets) {
        for (var j = 0; j < audit.assets.length; j++) {
          const asset = audit.assets[j]
          if (asset._id === assetId && asset.audit_status) {
            out.push(angular.extend({}, asset, {
              audit_id: audit._id,
              audit_user: audit.user.name,
              audit_title: audit.title
            }))
            break
          }
        }
      }
    }
    return out
  }
  updateAudit (audit) {
    this.processOneAudit(audit)
    if (this.demo) {
      this.audits[audit._index] = angular.copy(audit)
      this.audits[audit._index].assets = angular.copy(audit.assets)
    } else {
      this.$http.put(CONSTANTS.URL_BASE + '/audit', audit)
        .then(({data}) => {
          this.$http.get(CONSTANTS.URL_BASE + '/audit?AUDIT_ID=' + audit._id, {})
            .then(({data}) => {
              this.audits[audit._index] = angular.copy(data)
              this.audits[audit._index].assets = angular.copy(data.assets)
              this.audits[audit._index]._index = audit._index
            },
            () => console.log('Successfully updated audit. But error while refetching it')
          )
        },
        () => console.log('Error while updating audit: ', audit)
      )
    }
  }
  addAudit (audit) {
    var newAudit = angular.copy(audit)
    newAudit.assets = angular.copy(audit.assets)
    this.processOneAudit(newAudit)
    if (this.demo) {
      newAudit._index = this.audits.length
      newAudit._id = newAudit._index
      newAudit.user = this.$rootScope.currentUser
      newAudit.userId = this.$rootScope.currentUser._id
      newAudit.userName = this.$rootScope.currentUser.name
      this.audits.push(newAudit)
      this.$timeout(() => {
        this.$anchorScroll('row' + newAudit._id)
      })
    } else {
      newAudit.userId = this.$rootScope.currentUser._id
      newAudit.userName = this.$rootScope.currentUser.name
      angular.forEach(newAudit.assets, (asset) => {
        asset.assetId = asset._id
        asset.quantity = asset.quantityExpected
        delete asset.AMCType
        delete asset.audits
        delete asset.createDate
        delete asset.description
        delete asset.details
        delete asset.images
        delete asset.insuranceType
        delete asset.modDate
        delete asset.purchaseDate
        delete asset.tags
        delete asset.warrantyType
        delete asset.geoLocation
        delete asset.retailer
        delete asset.tags
        delete asset.serialNumber
        delete asset._id
      })
      this.$http.post(CONSTANTS.URL_BASE + '/audit', newAudit)
        .then(({data}) => {
          if (data.error) {
            console.log(data.error)
          } else {
            this.audits_promise = this.fetchAudits()
          }
        },
        () => console.log('Error while adding audit: ', newAudit)
      )
    }
  }
  processAssetData (data) {
    if (!data) {
      return data
    }
    for (var i = 0; i < data.length; i++) {
      data[i]._index = i
    }
    return data
  }
  populateRandomAudits (users, branches, allAssets) {
    if (!users || !branches || !allAssets) {
      return []
    }
    const curTime = (new Date()).getTime()
    const audits = []
    for (var i = 0; i < 200; i++) {
      var branchIdx = Math.floor(Math.random() * (branches.length))
      var branch = branches[branchIdx].name
      var user = users[Math.floor(Math.random() * (users.length))]
      const audit = {
        'branch_id': branches[branchIdx]._id,
        title: branch + ' audit by ' + user.name,
        notes: branch + ' audit by ' + user.name,
        userId: user._id,
        userName: user.name,
        branch: branch
      }
      const assets = allAssets[branches[branchIdx]._id]
      const auditAssets = []
      if (assets) {
        for (var j = 0; j < assets.assets.length; j++) {
          const auditAsset = angular.copy(assets.assets[j])
          auditAsset._index = j
          var auditStatus = Math.floor(Math.random() * 3)
          if (auditStatus === 1) {
            auditAsset.auditStatus = 'Found'
            auditAsset.auditDate = curTime - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
            auditAsset.auditComment = 'Random Comment added here....'
          }
          if (auditStatus === 2) {
            auditAsset.auditStatus = 'Not Found'
            auditAsset.auditDate = curTime - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
            auditAsset.auditComment = 'Random Comment added here....'
          }
          auditAssets.push(auditAsset)
        }
      }
      audit.assets = auditAssets
      audits.push(audit)
    }
    return audits
  }
  processAuditData (audits) {
    for (var i = 0; i < audits.length; i++) {
      audits[i]._index = i
      audits[i]._id = i
      this.processOneAudit(audits[i])
    }
    return audits
  }
  processOneAudit (audit) {
    var numNotFound = 0
    var numFound = 0
    var numAudited = 0
    var numNotAudited = 0
    var startDate = (new Date()).getTime()
    var endDate = 0
    var numAssets = 0
    if (audit.assets) {
      angular.forEach(audit.assets, function (value, key) {
        numAssets += value.quantityExpected ? value.quantityExpected : 1
        if (value.auditStatus === 'Partial') {
          numNotFound += value.quantity > value.auditQuantity ? (value.quantityExpected - value.auditQuantity) : 0
          numFound += value.quantity > value.auditQuantity ? value.auditQuantity : value.quantityExpected
        } else if (value.auditStatus !== 'Not Audited') {
          value.auditQuantity = value.auditStatus === 'Found' ? value.quantityExpected : 0
          numNotFound += value.auditStatus === 'Not Found' ? value.quantityExpected : 0
          numFound += value.auditStatus === 'Found' ? value.quantityExpected : 0
        }
        if (!value.auditStatus) {
          value.auditStatus = 'Not Audited'
        }
        numAudited += (value.auditStatus === 'Not Audited') ? 0 : value.quantityExpected
        numNotAudited += (value.auditStatus === 'Not Audited') ? value.quantityExpected : 0
        startDate = value.auditDate < startDate ? value.auditDate : startDate
        endDate = value.auditDate > endDate ? value.auditDate : endDate
      })
    }
    if (endDate === 0) {
      endDate = startDate
    }
    audit.numAssets = numAssets
    audit.numNotFound = numNotFound
    audit.numFound = numFound
    audit.numAudited = numAudited
    audit.numNotAudited = numNotAudited
    audit.isCompleted = (numNotAudited === 0)
    // Following are caluclated by server. So, delete them for now. Proper clean up to be done later
    delete audit.numNotFound
    delete audit.numFound
    delete audit.numAudited
    delete audit.numNotFound
    delete audit.isCompleted
    delete audit.numNotAudited
    audit.startDate = startDate
    audit.endDate = endDate
    audit.complete = audit.numAssets ? Math.floor((numAudited * 100) / audit.numAssets) : 100
    return audit
  }
}
export default AuditDemo
