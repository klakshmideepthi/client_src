import AddDocsController from '../controllers/AddDocsController'
import CONSTANTS from '../../common/modules/Constants'
angular.module('atm.docs', []).directive('atmDocs', [() => {
  return {
    restrict: 'AE',
    scope: {
      originalDocs: '=',
      originalDocTypes: '=',
      onDocsChanged: '&'
    },
    bindToController: true,
    template: require('../partials/AddDocs.html'),
    controller: AddDocsController,
    controllerAs: 'docsCtrl'
  }
}])
.factory('DocUtils', ['Upload', '$http', '$q', function (Upload, $http, $q) {
  return {
    save: function (assetId, branchId, docs, callback) {
      if (!docs) {
        console.log('No documents to be saved')
        return
      }

      // Initialize a local variable for holding promises
      // Everytime we upload or delete a document, we store that promise into this array
      // When all promises are resolved, we initiate the callback function
      const listOfProms = []
      var i
      // HANDLE DELETED FILES
      angular.forEach(docs.deleted, (value, key) => {
        const deletedFiles = docs.deleted[key]
        for (i = 0; i < deletedFiles.length; i++) {
          const index = deletedFiles[i]
          const file = docs.original[key][index]
          if (file) {
            // TODO: URL for deleeting image....
            const url = CONSTANTS.URL_BASE + '/image/DOCUMENT/' + file.image
            const deleteTask = $http.delete(url, {})
              .then(({data}) => console.log('successfully deleted document ' + file.image),
              ({obj}) => console.log('error while deleting document ' + file.image, obj)
            ).catch((e) => console.error('Exception while deleting file: ', e))
            listOfProms.push(deleteTask)
          }
        }
      })
      // HANDLE NEW FILES TO BE ADDED
      angular.forEach(docs.newFiles, (value, key) => {
        const files = docs.newFiles[key]
        for (i = 0; i < files.length; i++) {
          const file = files[i]
          var url = CONSTANTS.URL_BASE + '/image/ASSET/' + assetId
          var documentType = 'OTH'
          if (key === 'Receipt') {
            documentType = 'REC'
          } else if (key === 'Warranty') {
            documentType = 'WAR'
          } else if (key === 'Insurance') {
            documentType = 'INS'
          } else if (key === 'AMC') {
            documentType = 'AMC'
          }
          if (key !== 'CPI') {
            url = CONSTANTS.URL_BASE + '/asset/' + assetId + '/docs/' + documentType + '/branch'
          }
          console.log('Uploading: ' + file.name + ' URL: ' + url)

          const uploadTask = Upload.upload({
            url: url,
            file: file,
            name: file.name,
            document: documentType,
            method: 'POST'
          })
          .progress((evt) => {
            console.log('progress: ' + parseInt(100.0 * evt.loaded / evt.total, 10) + '% file :' + evt.config.file.name)
          }).success(() => {
            console.log(file.name + ' is uploaded successfully. Response: ')
          })
          .catch(() => console.log('Error while uploading files...'))
          listOfProms.push(uploadTask)
        }
      })
      // Now we have list of all the promises (tasks) in "list_of_promises"
      // When all these tasks are complete, we should call the callback function
      $q.all(listOfProms).then(function () {
        console.log('DocUtils.save: Finished uploading all documents.')
        callback()
      })
    }
  }
}])
