import CONSTANTS from '../../common/modules/Constants'
class AddCatController {
  constructor ($http, $mdDialog, $mdToast, catService, operation, cat) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$mdToast = $mdToast
    this.operation = operation
    this.catService = catService
    if (cat) {
      this.newobj = angular.extend({}, {}, cat)
      this.selectedDepMethod = this.catService.getDepMethod(cat.dep_method)
    } else {
      this.newobj = {}
    }
    this.original = angular.copy(this.newobj)
    this.currentPage = 'cat-form'
  }
  depMethodChanged(item) {
    if (item) {
      this.searchText = item.label;
      this.newobj.dep_method = item.key;
      this.selectedDepMethod = item;
    }
  }
  submitCategory () {
    const url = CONSTANTS.URL_BASE + '/category'
    const cat = this.processDataForSubmission(this.newobj)
    console.log(cat);
    const func = (this.operation === 'add') ? this.$http.post : this.$http.put
    func(url, cat)
      .then(({data}) => {
        const msg = 'Successfull saved category: ' + cat.name
        var id = cat._id
        if (this.operation === 'add') {
          id = data.upsertedId
        }
        this.catService.catUpdated(angular.extend({}, {_id: id}, cat))
        this.catService.updateCategories()
        this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
        this.$mdDialog.hide({})
      })
    .catch((error) => {
      console.log('Error while saving category: ', error)
      const msg = 'Unable to save category: ' + cat.name + '. Error ' + error.message
      this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
    })
  }
  isDirty () {
    var isDirty = false
    angular.forEach(fields, (field) => {
      if (isDirty) {
        return
      }
      const newval = this.newobj ? this.getValue(this.newobj, field) : undefined
      const origval = this.original ? this.getValue(this.original, field) : undefined
      if (this.isEmpty(newval)) {
        if (origval && !this.isEmpty(origval)) {
          isDirty = true
        }
      } else {
        if (!this.original) {
          isDirty = true
        } else {
          if (this.isEmpty(origval)) {
            isDirty = true
          } else {
            if (!angular.equals(newval, origval)) {
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
  findMatchingDepMethods (searchText) {
    console.log('Cat Service: ', this.catService.findMatchingDepMethods(searchText))
    return this.catService.findMatchingDepMethods(searchText)
  }
  getValue (obj, field) {
    if (!obj || !field) {
      return undefined
    }
    const f = field.split('.')
    var val = obj
    for (var i = 0; i < f.length; i++) {
      val = obj[f[i]]
      if (!val) {
        return val
      }
    }
    return val
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
  processDataForSubmission (data) {
    const output = angular.copy(data)
    if (this.selectedMethod) {
      console.log(this.selectedDepMethod.key);
      output.dep_method = this.selectedMethod.key
    }
    return output
  }
}
const fields = [
  'name',
  'description',
  'dep_method',
  'salvage_value',
  'lifetime'
]
export default AddCatController
