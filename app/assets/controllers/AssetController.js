import CONSTANTS from '../../common/modules/Constants'
import DocumentsController from './DocumentsController'
import AddAssetController from './AddAssetController'
import MoveAssetController from './MoveAssetController'
import UseAssetController from './UseAssetController'
class AssetController {
  constructor ($http, $stateParams, $state, $mdDialog, $mdToast, auditService, branchService, catService, workflowService) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$state = $state
    this.$mdToast = $mdToast
    this.asset_id = $stateParams.asset_id
    this.auditService = auditService
    this.branchService = branchService
    this.catService = catService
    this.workflowService = workflowService
    this.fetchAsset()
  }
  fetchAsset () {
    const url = CONSTANTS.URL_BASE + '/asset?ASSET_ID=' + this.asset_id
    this.$http.get(url, {})
      .then(({data}) => {
        this.asset = data
        if (this.asset.serialNumber) {
          this.asset.serialNumber = this.asset.serialNumber.replace(new RegExp(',', 'g'), ', ')
        }
        this.asset.branch_name = this.branchService.getBranchNameById(this.asset.branch)
        const cat = this.catService.getCategoryById(this.asset.category)
        this.asset.cat_name = 'Unknown Category'
        if (cat) {
          this.asset.cat_name = cat.name
          this.dep = this.catService.calculateDepreciation(this.asset, cat)
        }
        if (this.asset.images) {
          angular.forEach(this.asset.images, (image) => {
            if (image.type === 'IMAGE') {
              this.asset.image = image.imageId
            }
          })
        }
        this.processExpiryDetails()
        this.fetchProduct(this.asset.productId)
        this.processDocuments()
        // this.fetchDocs();
        this.fetchAvailability()
        this.fetchWorkflows()
        this.fetchActivity()
        this.asset.quantityInTransit = 0
        if (this.workflows) {
          angular.forEach(this.workflows, (wf, key) => {
            if (wf.state.isOpen && wf.data) {
              this.asset.quantityAvailable -= wf.data.quantity
              this.asset.quantityInTransit += wf.data.quantity
            }
          })
        }
        if (this.asset.quantityAvailable < 0) {
          this.asset.quantityAvailable = 0
        }
        this.audits = this.auditService.getAuditsByAsset(this.asset_id, this.asset.branch)
        this.audits_table = {query: {order: '-audit_date'}}
      },
      () => console.log('Error while fetching asset: ' + this.asset_id)
    )
  }
  fetchProduct (productId) {
    if (!productId) {
      return
    }
    const url = CONSTANTS.URL_BASE + '/product?PROD_ID=' + productId
    this.$http.get(url, {})
    .then(({data}) => { this.product = data },
      () => console.log('Error while fetching product: ' + productId)
    )
  }
  // fetchDocs () {
  //   const url = CONSTANTS.URL_BASE + "/document?ASSET_ID=" + this.asset._id
  //   this.$http.get(url, {})
  //   .then(({data}) => {
  //     this.processDocuments(data)
  //   },
  //   () => console.log('Error while fetching documents for ' + this.asset._id)
  //   )
  // }
  fetchAvailability () {
    const url = CONSTANTS.URL_BASE + '/asset/availability?Prod_ID=' + this.asset.productId
    this.$http.get(url, {})
    .then(({data}) => {
      for (var i = 0; i < data.length; i++) {
        data[i]._index = i
        data[i].branch_name = this.branchService.getBranchNameById(data[i]._id)
      }
      this.availability = data
    },
    () => console.log('Error while fetching availability of product: ' + this.asset.productId)
    )
  }
  fetchActivity () {
    var url = CONSTANTS.URL_BASE + '/activity/' + this.asset._id
    this.$http.get(url, {})
      .then(({data}) => {
        // TODO: Ugly hack to convert server side string to client side object
        angular.forEach(data, (value) => {
          const d = value.description
          const fields = d.split(';')
          angular.forEach(fields, (f) => {
            if (!isNaN(parseInt(f.trim()))) {
              value.quantity = parseInt(f)
            } else if (f.indexOf('Moved From') >= 0) {
              value.from = f.split(':')[1]
              value.from_branch = this.branchService.getBranchNameById(value.from.trim())
            } else if (f.indexOf('Moved To') >= 0) {
              value.to = f.split(':')[1]
              value.to_branch = this.branchService.getBranchNameById(value.to.trim())
            }
          })
        })
        this.activity = data
      },
      () => console.log('Error while fetching actvitiy of the asset: ' + this.asset._id)
    )
  }
  fetchWorkflows () {
    this.workflows = this.workflowService.getWorkflowsByAssetId(this.asset_id)
  }
  editAsset (ev) {
    // TODO: Right now, clickOutsideToClose and escapeToClose are set to false
    // This is because there is no way to prevent closing the dialog when clicked outside
    // We should prevent closing the dialog if the form is dirty and user clicked outside the dialog
    this.$mdDialog.show({
      multiple: true,
      controller: AddAssetController,
      controllerAs: 'aaCtrl',
      template: require('../partials/AddAssets.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      escapeToClose: false,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {'operation': 'edit', 'addtype': 'none', 'asset': this.asset, 'docs': this.docs}
    }).then(() => this.$state.reload(), () => {})
    .catch((error) => console.log('Exception while saving edit asset: ', error))
  }
  openMoveAsset (ev) {
    // TODO: Position this dialog just below the button instead of in the center of the window
    this.$mdDialog.show({
      controller: MoveAssetController,
      controllerAs: 'mvCtrl',
      template: require('../partials/MoveAsset.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      escapeToClose: true,
      locals: {'asset': this.asset}
    }).then(() => this.$state.reload(), () => {})
  }
  openUseAsset (ev) {
    if (this.asset.quantityAvailable === 1) {
      const url = CONSTANTS.URL_BASE + '/asset/use?ASSET_ID=' + this.asset._id + '&QUANTITY=' + this.asset.quantityAvailable
      this.$http.put(url, {})
      .then(() => {
        this.branchService.fetchBranchAssets(this.asset.branch)
        const msg = 'Successfully marked ' + this.asset.quantityAvailable + ' of ' + this.asset.name + ' as used'
        this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
        this.$mdDialog.hide({})
        this.$state.reload()
        console.log(msg)
      }, (obj) => {
        const msg = 'Unable to mark asset: ' + this.asset.name + ' as used. Error ' + obj.statusText
        this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
      })
    } else {
      // TODO: Position this dialog just below the button instead of in the center of the window
      this.$mdDialog.show({
        controller: UseAssetController,
        controllerAs: 'uCtrl',
        template: require('../partials/UseAsset.html'),
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        escapeToClose: true,
        locals: {'asset': this.asset}
      }).then(() => this.$state.reload(), () => {})
    }
  }
  deleteAsset (ev) {
    var confirm = this.$mdDialog.confirm()
          .title('Confirm deletion?')
          .textContent('Are you sure you want to delete ' + this.asset.name + '?')
          .ariaLabel('Delete')
          .targetEvent(ev)
          .ok('Delete')
          .cancel('Cancel')
    this.$mdDialog.show(confirm).then(() => {
      const url = CONSTANTS.URL_BASE + '/asset?ASSET_ID=' + this.asset_id
      this.$http.delete(url, {})
        .then(({data}) => {
          this.branchService.fetchBranchAssets(this.asset.branch)
          this.$state.go('root.assets')
        },
        () => console.log('Error while deleting of the asset: ' + this.asset._id)
      )
    }, () => console.log('whew! Delete cancelled')
    )
  }
  openDocuments (ev, docs) {
    if (!docs || !docs.length) {
      return
    }
    this.$mdDialog.show({
      controller: DocumentsController,
      controllerAs: 'dc',
      template: require('../partials/ViewDocuments.html'),
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {'docs': docs}
    })
  }
  openChartDialog (ev, asset) {
    const dep = this.dep
    this.$mdDialog.show({
      controller: DepChartController,
      controllerAs: 'asset',
      template: "<md-dialog><md-dialog-content><md-toolbar><div class='md-toolbar-tools' style='background-color: #EC725D'>Depreciation Chart</div></md-toolbar><div style='width: 500px; height: 300px; padding: 50px 10px 10px 10px'><canvas id='dep' class='chart chart-line' chart-data='asset.dep.chart.data' chart-labels='asset.dep.chart.labels' chart-series='asset.dep.chart.series'></canvas></div></md-dialog-content></md-dialog>",
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: true,
      // Note: Even though it says fullscreen, this gets applied only for xs and sm screens
      // https://github.com/angular/material/issues/5924
      fullscreen: true,
      locals: {'dep': dep}
    })
  }
  processDocuments () {
    const assetImages = []
    const receipts = []
    const warranty = []
    const amc = []
    const insurance = []
    const others = []
    this.docs = {'CPI': assetImages, 'Receipt': receipts, 'Warranty': warranty, 'AMC': amc, 'Insurance': insurance, 'Other': others}
    if (!this.asset.images || this.asset.images.length === 0) {
      return
    }
    for (var i = 0; i < this.asset.images.length; i++) {
      const image = this.asset.images[i]
      // TODO: How to get the filetype to be image or pdf? Hardcoding to image for now.
      if (image.type === 'IMAGE') {
        assetImages.push({image: image.imageId, filename: image.filename, type: image.type, filetype: 'image'})
      } else if (image.type === 'REC') {
        receipts.push({image: image.imageId, filename: image.filename, type: image.type, filetype: 'image'})
      } else if (image.type === 'WAR') {
        warranty.push({image: image.imageId, filename: image.filename, type: image.type, filetype: 'image'})
      } else if (image.type === 'AMC') {
        amc.push({image: image.imageId, filename: image.filename, type: image.type, filetype: 'image'})
      } else if (image.type === 'INS') {
        insurance.push({image: image.imageId, filename: image.filename, type: image.type, filetype: 'image'})
      } else {
        others.push({image: image.imageId, filename: image.filename, type: image.type, filetype: 'image'})
      }
    }
    this.docs = {'CPI': assetImages, 'Receipt': receipts, 'Warranty': warranty, 'AMC': amc, 'Insurance': insurance, 'Other': others}
  }
  // TODO: Another ugly code. Can this be done on server side?
  // processDocuments (docs) {
  //   const asset_images = []
  //   const receipts = []
  //   const warranty = []
  //   const amc = []
  //   const insurance = []
  //   const others = []
  //   this.docs = {'CPI': asset_images, 'Receipt': receipts, 'Warranty': warranty, 'AMC': amc, 'Insurance': insurance, 'Other': others}
  //   if (!docs) {
  //     return
  //   }
  //   if (this.asset.image) {
  //     const image = this.asset.image
  //     asset_images.push({image: image, name: this.asset.name + ' Image', _id: image, 'filetype': 'image'})
  //   }
  //   for (var i = 0; i < docs.length; i ++) {
  //     const doc = docs[i]
  //     if (!doc.image) {
  //       //TODO: This is weird. Why do have items in docs when there is no image or pdf?
  //       continue
  //     }
  //     doc.filetype = 'image'
  //     if (doc.type === 'REC') {
  //       receipts.push(doc)
  //       continue
  //     }
  //     if (doc.type === 'AMC') {
  //       amc.push(doc)
  //       continue
  //     }
  //     if (doc.type === 'WAR') {
  //       warranty.push(doc)
  //       continue
  //     }
  //     if (doc.type === 'INS') {
  //       insurance.push(doc)
  //       continue
  //     }
  //     others.push(doc)
  //   }
  //   this.docs = {'CPI': asset_images, 'Receipt': receipts, 'Warranty': warranty, 'AMC': amc, 'Insurance': insurance, 'Other': others}
  // }
  processExpiryDetails () {
    const details = this.asset.details
    if (!details) {
      return
    }
    for (var i = 0; i < details.length; i++) {
      const det = details[i]
      if (det.image) {
        // This is a document details. will be handled while we are handling documents. Skip this
        continue
      }
      if (det.type === 'WAR') {
        this.processExpiry(det, 'warrantyPeriod', 'warrantyEndDate', 'warrantyExpired', 'warrantyYears', 'warrantyMonths', 'warrantyProvider')
      } else if (det.type === 'INS') {
        this.processExpiry(det, 'insurancePeriod', 'insuranceEndDate', 'insuranceExpired', 'insuranceYears', 'insuranceMonths', 'insuranceProvider')
      } else if (det.type === 'AMC') {
        this.processExpiry(det, 'AMCPeriod', 'AMCEndDate', 'AMCExpired', 'AMCYears', 'AMCMonths', 'AMCProvider')
      }
    }
  }
  // TODO: Very ugly code. Talk to Raji and see if this can be made simpler
  processExpiry (details, period, expiry, isExpired, yearsAttr, monthsAttr, providerAttr) {
    this.asset[providerAttr] = details.name
    var w = details.validityPeriod
    this.asset[period] = w
    const p = details.startDate || this.asset.purchaseDate
    const e = details.endDate
    if (!e && (!w || !p)) {
      return
    }
    var expiryDate
    if (w) {
      w = w.replace('years', '.')
      w = w.replace('year', '.')
      w = w.replace('months', '.')
      w = w.replace('month', '.')
      const m = w.split('.')
      var years = 0
      var months = 0
      if (this.asset[period].indexOf('year') > 0) {
        years = parseInt(m[0].trim())
        if (this.asset[period].indexOf('month') > 0) {
          months = parseInt(m[1].trim())
        }
      } else {
        if (this.asset[period].indexOf('month') > 0) {
          months = parseInt(m[0].trim())
        }
      }
      this.asset[yearsAttr] = years
      this.asset[monthsAttr] = months
      expiryDate = moment(p).add(years, 'years').add(months, 'months')
      this.asset[expiry] = expiryDate.toDate()
    } else {
      expiryDate = moment(e)
    }
    if (expiryDate.isBefore(moment())) {
      this.asset[isExpired] = true
    } else {
      this.asset[isExpired] = false
    }
  }
}
class DepChartController {
  constructor (dep) {
    console.log('Dep: ', dep)
    this.dep = dep
  }
}
export default AssetController
