import CONSTANTS from '../../common/modules/Constants'
class AddBranchController {
  constructor ($http, $mdDialog, $mdToast, Upload, operation, branch, branchService) {
    'ngInject'
    this.$http = $http
    this.$mdDialog = $mdDialog
    this.$mdToast = $mdToast
    this.Upload = Upload
    this.operation = operation
    this.branchService = branchService
    this.IMAGE_BASE_URL = CONSTANTS.IMAGE_BASE_URL
    if (branch) {
      this.newobj = angular.extend({}, {}, branch)
      this.newobj.address = angular.extend({}, {}, branch.address)
    } else {
      this.newobj = {address: {}}
    }
    this.original = angular.copy(this.newobj)
    this.currentPage = 'branch-form'
  }
  submitBranch () {
    const url = CONSTANTS.URL_BASE + '/branch'
    const branch = this.processDataForSubmission(this.newobj)
    const func = (this.operation === 'add') ? this.$http.post : this.$http.put
    func(url, branch)
      .then(({data}) => {
        const msg = 'Successfull saved branch: ' + branch.name
        this.branchService.updateBranches()
        if (this.pic_deleted) {
          // TODO: Branch image delete is not supported by server yet
        }
        if (this.newPic) {
          this.Upload.upload({
            url: CONSTANTS.URL_BASE + '/image/BRANCH/' + branch._id,
            file: this.newPic,
            name: this.newPic.name,
            method: 'POST'
          })
          .progress((evt) => {
            console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total, 10) + '% file :' + evt.config.file.name)
          }).success(() => {
            console.log(this.newPic.name + ' is uploaded successfully. Response: ')
          })
          .catch(() => console.log('Error while uploading files...'))
        }
        this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('success-toast').capsule(false).position('top right'))
        this.$mdDialog.hide({})
        // TODO: Check if the image is deleted/added/changed. and handled it appropriately
      },
      (obj) => {
        // TODO: Provide proper error message
        console.log('Error while saving branch: ', obj)
        const msg = 'Unable to save branch: ' + branch.name + '. Error ' + obj.statusText
        this.$mdToast.show(this.$mdToast.simple().textContent(msg).theme('error-toast').capsule(false).position('top right'))
      }
    )
    .catch((error) => console.error('Error while saving branch: ', error))
  }
  deletePicture () {
    this.pic_deleted = true
    delete this.newPic
    delete this.newobj.image
  }
  isDirty () {
    var isDirty = false
    if (this.newPic) {
      return true
    }
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
    return output
  }
}
const fields = [
  'name',
  'addressaddressLine',
  'address.city',
  'address.state',
  'address.pincode',
  'email'
]
export default AddBranchController
