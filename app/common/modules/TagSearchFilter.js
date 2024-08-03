export default function () {
  return function (input, selectedTags, field, options) {
    const out = []
    if (!input) {
      return input
    }
    if (!selectedTags) {
      return input
    }
    var tags = angular.isArray(selectedTags) ? selectedTags : Object.keys(selectedTags)
    // Clone tags so as not to distrub the original selectedTags
    tags = Object.assign([], tags)
    if (tags.length === 0) {
      return input
    }
    if (!field) {
      return input
    }
    for (var i = 0; i < input.length; i++) {
      var inp = input[i]
      const fs = field.split('.')
      for (var j = 0; j < fs.length; j++) {
        if (!inp) {
          break
        }
        inp = inp[fs[j]]
      }
      if (!inp) {
        continue
      }
      var match = false
      const arr = angular.isArray(inp) ? inp : inp.split(',')
      if (!options || !options.caseSensitive) {
        angular.forEach(arr, (t, i) => arr[i] = t.toLowerCase())
      }

      for (var j = 0; j < tags.length; j++) {
        if (!options || !options.caseSensitive) {
          tags[j] = tags[j].toLowerCase()
        }
        if (arr.indexOf(tags[j]) >= 0) {
          match = true
          break
        }
      }
      match && out.push(input[i])
    }
    return out
  }
}
