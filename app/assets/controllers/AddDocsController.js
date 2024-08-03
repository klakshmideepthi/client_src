import CONSTANTS from '../../common/modules/Constants'
class AddDocsController {
  constructor () {
    'ngInject'
    this.docTypes = this.originalDocTypes || CONSTANTS.DOC_TYPES
    this.IMAGE_BASE_URL = CONSTANTS.IMAGE_BASE_URL
    const original = this.originalDocs ? angular.copy(this.originalDocs) : {}
    this.docs = {original: original, newFiles: {}, deleted: {}}
  }
  findFile (file, array) {
    if (array) {
      for (var i = 0; i < array.length; i++) {
        var f = array[i]
        if (file.name === f.name && file.type === f.type && file.size === f.size) {
          return i
        }
      }
    }
    return -1
  }
  getNumFiles () {
    console.log('This: ', this)
    var numFiles = 0
    angular.forEach(this.docs.original, (value, key) => {
      numFiles += value.length
      if (this.docs.deleted[key]) {
        numFiles -= this.docs.deleted[key].length
      }
    })
    angular.forEach(this.docs.newFiles, (value, key) => {
      numFiles += value.length
    })
    return numFiles
  };

  filesDropped ($files, $event, $rejectedFiles, docType) {
    // TODO: Look at rejected files and give proper errors
    if ($rejectedFiles) {
      for (var i = 0; i < $rejectedFiles.length; i++) {
        console.log('Rejected file: ', $rejectedFiles)
      }
    }

    if (!$files || $files.length === 0) {
      console.log('No valid files dropped')
      return
    }

    var filesToBeAdded = []
    const curFiles = this.docs.newFiles[docType]
    if (!curFiles || curFiles.length === 0) {
      filesToBeAdded = filesToBeAdded.concat($files)
    } else {
      for (i = 0; i < $files.length; i++) {
        const newFile = $files[i]
        const index = this.findFile(newFile, curFiles)
        if (index < 0) {
          filesToBeAdded.push(newFile)
        }
      }
    }
    const numFiles = this.getNumFiles()
    console.log('Files to be added: ' + filesToBeAdded.length + ' Maximum: ' + CONSTANTS.MAX_DOCS_PER_THING +
      ' Current Files: ' + numFiles)
    if ((numFiles + filesToBeAdded.length) > CONSTANTS.MAX_DOCS_PER_ASSET) {
      this.error = 'Maximum ' + CONSTANTS.MAX_DOCS_PER_ASSET + ' documents allowed per asset'
      console.log($scope.error)
      return
    }
    if (filesToBeAdded.length > 0) {
      if (!this.docs.newFiles[docType]) {
        this.docs.newFiles[docType] = []
      }
      this.docs.newFiles[docType] = this.docs.newFiles[docType].concat(filesToBeAdded)
      this.onDocsChanged({docs: this.docs})
    }
  }
  removeFile (file, docType) {
    const files = this.docs.newFiles[docType]
    const index = this.findFile(file, files)
    if (index >= 0) {
      files.splice(index, 1)
      this.onDocsChanged({docs: this.docs})
    }
  }

  removeOriginalFile (file, docType, index) {
    console.log('Deleting original file: ' + index)
    if (!this.docs.deleted[docType]) {
      this.docs.deleted[docType] = []
    }
    this.docs.deleted[docType].push(index)
    this.onDocsChanged({docs: this.docs})
    console.log('Deleted files: ', this.docs.deleted)
  }
}
export default AddDocsController
