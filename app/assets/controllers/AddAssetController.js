import CONSTANTS from '../../common/modules/Constants'
class AddAssetController {
  constructor ($http, $mdDialog, $mdToast, $rootScope, $timeout, DocUtils, operation, addtype, asset, docs, branchService, catService) {
    'ngInject'
    this.$http = $http
    this.branchService = branchService
    if (operation === 'edit') {
      this.currentPage = 'asset-form'
    } else {
      if (addtype === 'search') {
        this.currentPage = 'product_search'
        this.fetchProducts()
      } else {
        this.currentPage = 'asset-form'
      }
    }
    this.$mdDialog = $mdDialog
    this.$mdToast = $mdToast
    this.$rootScope = $rootScope
    this.$timeout = $timeout
    this.DocUtils = DocUtils
    this.catService = catService
    this.IMAGE_BASE_URL = CONSTANTS.IMAGE_BASE_URL
    this.operation = operation
    this.docs = docs
    this.today = new Date()
    this.endTypesArray = []
    angular.forEach(endTypes, (value, key) => this.endTypesArray.push(value))
    const defaultObj = {tags: [], quantity: 1, purchaseDate: this.today, insuranceType: endTypes.none, warrantyType: endTypes.none, AMCType: endTypes.none}
    if (asset) {
      this.newobj = angular.extend({}, defaultObj, asset)
      if (this.newobj.insuranceEndDate) {
        this.newobj.insuranceType = endTypes.enddate
      }
      if (this.newobj.insurancePeriod) {
        this.newobj.insuranceType = endTypes.period
      }
      if (this.newobj.AMCEndDate) {
        this.newobj.AMCType = endTypes.enddate
      }
      if (this.newobj.AMCPeriod) {
        this.newobj.AMCType = endTypes.period
      }
      if (this.newobj.warrantyEndDate) {
        this.newobj.warrantyType = endTypes.enddate
      }
      if (this.newobj.warrantyPeriod) {
        this.newobj.warrantyType = endTypes.period
      }
      if (!angular.isArray(this.newobj.tags)) {
        this.newobj.tags = this.newobj.tags.split(',')
      }
    } else {
      this.newobj = defaultObj
    }
    this.original = angular.copy(this.newobj)
    if (this.newobj.category) {
      this.selectedCategory = this.catService.getCategoryById(this.newobj.category)
    }

    this.docChanges = {}
  }
  fetchProducts () {
    const url = CONSTANTS.URL_BASE + '/products'
    this.$http.get(url, {})
      .then(({data}) => {
        this.products = data
      },
      () => console.log('Error while fetching products')
    )
  }
  submitAsset () {
    const url = CONSTANTS.URL_BASE + '/asset'
    const asset = this.processDataForSubmission(this.newobj)
    const func = (this.operation === 'add') ? this.$http.post : this.$http.put
    func(url, asset)
      .then(({data}) => {
        var assetId = this.newobj._id
        if (this.operation === 'add') {
          assetId = data._id
        }
        const msg = 'Successfull saved asset: ' + asset.name
        this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
        this.$mdDialog.hide({})
        // TODO: Post asset is returning a weird response. Need to see why.
        console.log('Asset added. Saving documents assetId: ' + assetId + ' ', this.docChanges)
        this.DocUtils.save(assetId, asset.branch, this.docChanges, () => console.log('Successfully uploaded all the documents as well.'))
        this.branchService.fetchBranchAssets(asset.branch)
      }
    )
    .catch((error) => {
      console.log('Error while saving asset: ', error)
      const msg = 'Unable to save asset: ' + asset.name + '. Error ' + obj.statusText
      this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
    })
  }
  docsChanged (docs) {
    this.docChanges = docs
  }
  isDirty () {
    var isDirty = false
    angular.forEach(fields, (field) => {
      if (isDirty) {
        return
      }
      if (this.isEmpty(this.newobj[field])) {
        if (this.original && !this.isEmpty(this.original[field])) {
          isDirty = true
        }
      } else {
        if (!this.original) {
          isDirty = true
        } else {
          if (this.isEmpty(this.original[field])) {
            isDirty = true
          } else {
            if (!angular.equals(this.newobj[field], this.original[field])) {
              isDirty = true
            }
          }
        }
      }
      if (isDirty) {
        console.log('Filed ' + field + ' is dirty')
      }
    })
    return isDirty
  }
  productSelected (product) {
    this.currentPage = 'asset-form'
    this.original = angular.extend({}, this.original, {name: product.name, productId: product._id, description: product.description})
    this.newobj = angular.extend({}, this.newobj, {name: product.name, productId: product._id, description: product.description})
  }
  cancel () {
    if (this.isDirty()) {
      this.prevPage = this.currentPage
      this.currentPage = 'confirm_close'
    } else {
      this.$mdDialog.cancel()
    }
  }
  closeConfirmed () {
    this.$mdDialog.cancel()
  }
  closeCancelled () {
    this.currentPage = this.prevPage
  }
  isEmpty (obj) {
    if (!obj) {
      return true
    }
    if (angular.isArray(obj)) {
      if (obj.length === 0) {
        return true
      }
      return false
    }
    if (angular.isObject(obj)) {
      if (angular.equals(obj, {})) {
        return true
      }
    }
    return false
  }
  findMatchingCategories (searchText) {
    const cats = this.catService.getCategories()
    if (!searchText) {
      return cats
    }
    const arr = []
    for (var i = 0; i < cats.length; i++) {
      if (cats[i].name.toLowerCase().indexOf(searchText.toLowerCase()) >= 0) {
        arr.push(cats[i])
      }
    }
    return arr
  }
  categoryChanged (cat) {
    // this.selectedCategory = cat
  }
  processDataForSubmission (data) {
    // TODO: UGLY Hacks to create warranty period etc.
    const output = angular.copy(data)
    if (this.selectedCategory) {
      output.category = this.selectedCategory._id
    }
    output.branch = this.$rootScope.currentUser ? this.$rootScope.currentUser.branch : ''
    if (output.quantity < 1) {
      output.quantity = 1
    }
    if (!output.purchaseDate) {
      output.purchaseDate = moment().hours(0).minutes(0).seconds(0).milliseconds(0).toDate()
    }
    if (this.operation === 'add') {
      output.quantityUsed = 0
      output.quantityAvailable = output.quantity
    }
    const details = []
    if (output.insuranceType.key === endTypes.period.key) {
      details.push({
        validityPeriod: output.insuranceYears + ' years ' + output.insuranceMonths + ' months',
        type: 'INS',
        name: output.insuranceProvider
      })
    } else if (output.insuranceType.key === endTypes.enddate.key) {
      details.push({
        validityDate: output.insuranceEndDate,
        type: 'INS',
        name: output.insuranceProvider
      })
    }
    if (output.warrantyType.key === endTypes.period.key) {
      details.push({
        validityPeriod: output.warrantyYears + ' years ' + output.warrantyMonths + ' months',
        type: 'WAR',
        name: output.warrantyProvider
      })
    } else if (output.warrantyType.key === endTypes.enddate.key) {
      details.push({
        validityDate: output.warrantyEndDate,
        type: 'WAR',
        name: output.warrantyProvider
      })
    }
    if (output.AMCType.key === endTypes.period.key) {
      details.push({
        validityPeriod: output.AMCYears + ' years ' + output.AMCMonths + ' months',
        type: 'AMC',
        name: output.AMCProvider
      })
    } else if (output.AMCType.key === endTypes.enddate.key) {
      details.push({
        validityDate: output.AMCEndDate,
        type: 'AMC',
        name: output.AMCProvider
      })
    }
    output.details = details
    return output
  }
}
const fields = [
  'name',
  'category',
  'serialNumber',
  'quantity',
  'cost',
  'retailer',
  'purchaseDate',
  'description',
  'tags',
  'insuranceProvider',
  'insuranceType',
  'insuranceYears',
  'insuranceMonths',
  'insuranceEndDate',
  'warrantyType',
  'warrantyYears',
  'warrantyMonths',
  'warrantyEndDate',
  'AMCType',
  'AMCYears',
  'AMCMonths',
  'AMCEndDate'
]

export default AddAssetController
const endTypes = {
  none: {key: 'none', label: 'Not Taken'},
  lifetime: {key: 'lifetime', label: 'Lifetime'},
  enddate: {key: 'enddate', label: 'End date'},
  period: {key: 'period', label: 'Period (from purchase date)'}
}
