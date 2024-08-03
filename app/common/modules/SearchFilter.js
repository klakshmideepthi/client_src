/*
 * Usage:
 *  -- Search for {{searchTxt}} in the 'name' field of assets array (ignore case)
 * ng-repeat="asset in assets.assets | atmsearch : assets.searchTxt : 'name'"
 * --  Search for {{searchTxt}} in the 'name' OR 'serialNumber' fields of assets array (ignore case)
 * ng-repeat="asset in assets.assets | atmsearch : assets.searchTxt : ['name', 'serialNumber']"
 * --  Search for {{searchTxt}} in the 'name' AND 'serialNumber' fields of assets array  (ignore case)
 * ng-repeat="asset in assets.assets | atmsearch : assets.searchTxt : ['name', 'serialNumber'] : {matchAll: true}"
 * --  Search for {{searchTxt}} in the 'name' AND 'serialNumber' fields of assets array (case sensitive)
 * ng-repeat="asset in assets.assets | atmsearch : assets.searchTxt : ['name', 'serialNumber'] : {matchAll: true. caseSensitive: true}"
*/
export default function () {
  return function (input, searchStr, fields, options) {
    const caseSensitive = options && options.hasOwnProperty('caseSensitive') ? options.caseSensitive : false
    const matchAll = options && options.hasOwnProperty('matchAll') ? options.matchAll : false
    if (!searchStr || searchStr.length === 0) {
      return input
    }
    if (!input || !input.length) {
      return input
    }
    const out = []
    if (!caseSensitive) {
      searchStr = searchStr.toLowerCase()
    }
    for (var i = 0; i < input.length; i++) {
      var matched = false
      var inp
      if (!angular.isArray(fields)) {
        inp = input[i][fields]
        if (inp) {
          inp = getString(inp)
        }
        if (!caseSensitive && inp) {
          inp = toLowerCase()
        }
        if (inp && indexOf(searchStr) >= 0) {
          out.push(input[i])
          continue
        }
      } else {
        var matched = true
        if (!matchAll) {
          matched = false
        }
        for (var j = 0; j < fields.length; j++) {
          inp = input[i][fields[j]]
          if (!inp) {
            matched = false
            if (matchAll) {
              break
            } else {
              continue
            }
          }
          inp = getString(inp)
          if (!caseSensitive) {
            inp = inp.toLowerCase()
          }
          if (inp.indexOf(searchStr) >= 0) {
            matched = true
            if (!matchAll) {
              break
            }
          } else {
            matched = false
            if (matchAll) {
              break
            }
          }
        }
        if (matched) {
          out.push(input[i])
        }
      }
    }
    return out
  }
}
const getString = function (obj) {
  if (typeof obj === 'string') {
    return obj
  }
  const m = moment(obj)
  if (m.isValid()) {
    return m.format('DD-MMM-YYYY')
  }
  return obj.toString()
}
