$(function () {
	// Helper function for vertically aligning DOM elements
	// http://www.seodenver.com/simple-vertical-align-plugin-for-jquery/
  $.fn.vAlign = function () {
    return this.each(function (i) {
      var ah = $(this).height()
      var ph = $(this).parent().height()
      var mh = (ph - ah) / 2
      $(this).css('margin-top', mh)
    })
  }

  $.fn.stretchFormtasticInputWidthToParent = function () {
    return this.each(function (i) {
      var p_width = $(this).closest('form').innerWidth()
      var p_padding = parseInt($(this).closest('form').css('padding-left'), 10) + parseInt($(this).closest('form').css('padding-right'), 10)
      var this_padding = parseInt($(this).css('padding-left'), 10) + parseInt($(this).css('padding-right'), 10)
      $(this).css('width', p_width - p_padding - this_padding)
    })
  }

  $('form.formtastic li.string input, form.formtastic textarea').stretchFormtasticInputWidthToParent()

	// Vertically center these paragraphs
	// Parent may need a min-height for this to work..
  $('ul.downplayed li div.content p').vAlign()

	// When a sandbox form is submitted..
  $('form.sandbox').submit(function () {
    var error_free = true

		// Cycle through the forms required inputs
 		$(this).find('input.required').each(function () {
			// Remove any existing error styles from the input
   $(this).removeClass('error')

			// Tack the error style on if the input is empty..
   if ($(this).val() == '') {
     $(this).addClass('error')
     $(this).wiggle()
     error_free = false
   }
 })

    return error_free
  })
})

function clippyCopiedCallback (a) {
  $('#api_key_copied').fadeIn().delay(1000).fadeOut()

  // var b = $("#clippy_tooltip_" + a);
  // b.length != 0 && (b.attr("title", "copied!").trigger("tipsy.reload"), setTimeout(function() {
  //   b.attr("title", "copy to clipboard")
  // },
  // 500))
}

// Logging function that accounts for browsers that don't have window.console
log = function () {
  log.history = log.history || []
  log.history.push(arguments)
  if (this.console) {
    console.log(Array.prototype.slice.call(arguments))
  }
}

// Handle browsers that do console incorrectly (IE9 and below, see http://stackoverflow.com/a/5539378/7913)
if (Function.prototype.bind && console && typeof console.log === 'object') {
  [
    'log', 'info', 'warn', 'error', 'assert', 'dir', 'clear', 'profile', 'profileEnd'
  ].forEach(function (method) {
    console[method] = this.bind(console[method], console)
  }, Function.prototype.call)
}

var Docs = {

  shebang: function () {
		// If shebang has an operation nickname in it..
		// e.g. /docs/#!/words/get_search
    var fragments = $.param.fragment().split('/')
    fragments.shift() // get rid of the bang

    switch (fragments.length) {
      case 1:
				// Expand all operations for the resource and scroll to it
        log('shebang resource:' + fragments[0])
        var dom_id = 'resource_' + fragments[0]

        Docs.expandEndpointListForResource(fragments[0])
        $('#' + dom_id).slideto({highlight: false})
        break
      case 2:
				// Refer to the endpoint DOM element, e.g. #words_get_search
        log('shebang endpoint: ' + fragments.join('_'))

        // Expand Resource
        Docs.expandEndpointListForResource(fragments[0])
        $('#' + dom_id).slideto({highlight: false})

        // Expand operation
        var li_dom_id = fragments.join('_')
        var li_content_dom_id = li_dom_id + '_content'

        log('li_dom_id ' + li_dom_id)
        log('li_content_dom_id ' + li_content_dom_id)

        Docs.expandOperation($('#' + li_content_dom_id))
        $('#' + li_dom_id).slideto({highlight: false})
        break
    }
  },

  toggleEndpointListForResource: function (resource) {
    var elem = $('li#resource_' + Docs.escapeResourceName(resource) + ' ul.endpoints')
    if (elem.is(':visible')) {
      Docs.collapseEndpointListForResource(resource)
    } else {
      Docs.expandEndpointListForResource(resource)
    }
  },

	// Expand resource
  expandEndpointListForResource: function (resource) {
    var resource = Docs.escapeResourceName(resource)
    if (resource == '') {
      $('.resource ul.endpoints').slideDown()
      return
    }

    $('li#resource_' + resource).addClass('active')

    var elem = $('li#resource_' + resource + ' ul.endpoints')
    elem.slideDown()
  },

	// Collapse resource and mark as explicitly closed
  collapseEndpointListForResource: function (resource) {
    var resource = Docs.escapeResourceName(resource)
    $('li#resource_' + resource).removeClass('active')

    var elem = $('li#resource_' + resource + ' ul.endpoints')
    elem.slideUp()
  },

  expandOperationsForResource: function (resource) {
		// Make sure the resource container is open..
    Docs.expandEndpointListForResource(resource)

    if (resource == '') {
      $('.resource ul.endpoints li.operation div.content').slideDown()
      return
    }

    $('li#resource_' + Docs.escapeResourceName(resource) + ' li.operation div.content').each(function () {
      Docs.expandOperation($(this))
    })
  },

  collapseOperationsForResource: function (resource) {
		// Make sure the resource container is open..
    Docs.expandEndpointListForResource(resource)

    $('li#resource_' + Docs.escapeResourceName(resource) + ' li.operation div.content').each(function () {
      Docs.collapseOperation($(this))
    })
  },

  escapeResourceName: function (resource) {
    return resource.replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]\^`{|}~]/g, '\\$&')
  },

  expandOperation: function (elem) {
    elem.slideDown()
  },

  collapseOperation: function (elem) {
    elem.slideUp()
  }
}; (function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['content_type'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', self = this

    function program1 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n  '
      stack1 = helpers.each.call(depth0, depth0.produces, {hash: {}, inverse: self.noop, fn: self.program(2, program2, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n'
      return buffer
    }
    function program2 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n	<option value="'
      stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0)
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '">'
      stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0)
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '</option>\n	'
      return buffer
    }

    function program4 (depth0, data) {
      return '\n  <option value="application/json">application/json</option>\n'
    }

    buffer += '<label for="contentType"></label>\n<select name="contentType">\n'
    stack1 = helpers['if'].call(depth0, depth0.produces, {hash: {}, inverse: self.program(4, program4, data), fn: self.program(1, program1, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n</select>\n'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['main'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', escapeExpression = this.escapeExpression, self = this

    function program1 (depth0, data) {
      var buffer = '', stack1, stack2
      buffer += '\n    <div class="info_title">' +
    escapeExpression(((stack1 = ((stack1 = depth0.info), stack1 == null || stack1 === false ? stack1 : stack1.title)), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +
    '</div>\n    <div class="info_description">'
      stack2 = ((stack1 = ((stack1 = depth0.info), stack1 == null || stack1 === false ? stack1 : stack1.description)), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
      if (stack2 || stack2 === 0) { buffer += stack2 }
      buffer += '</div>\n    '
      stack2 = helpers['if'].call(depth0, ((stack1 = depth0.info), stack1 == null || stack1 === false ? stack1 : stack1.termsOfServiceUrl), {hash: {}, inverse: self.noop, fn: self.program(2, program2, data), data: data})
      if (stack2 || stack2 === 0) { buffer += stack2 }
      buffer += '\n    '
      stack2 = helpers['if'].call(depth0, ((stack1 = depth0.info), stack1 == null || stack1 === false ? stack1 : stack1.contact), {hash: {}, inverse: self.noop, fn: self.program(4, program4, data), data: data})
      if (stack2 || stack2 === 0) { buffer += stack2 }
      buffer += '\n    '
      stack2 = helpers['if'].call(depth0, ((stack1 = depth0.info), stack1 == null || stack1 === false ? stack1 : stack1.license), {hash: {}, inverse: self.noop, fn: self.program(6, program6, data), data: data})
      if (stack2 || stack2 === 0) { buffer += stack2 }
      buffer += '\n  '
      return buffer
    }
    function program2 (depth0, data) {
      var buffer = '', stack1
      buffer += '<div class="info_tos"><a href="' +
    escapeExpression(((stack1 = ((stack1 = depth0.info), stack1 == null || stack1 === false ? stack1 : stack1.termsOfServiceUrl)), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +
    '">Terms of service</a></div>'
      return buffer
    }

    function program4 (depth0, data) {
      var buffer = '', stack1
      buffer += "<div class='info_contact'><a href=\"mailto:" +
    escapeExpression(((stack1 = ((stack1 = depth0.info), stack1 == null || stack1 === false ? stack1 : stack1.contact)), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +
    '">Contact the developer</a></div>'
      return buffer
    }

    function program6 (depth0, data) {
      var buffer = '', stack1
      buffer += "<div class='info_license'><a href='" +
    escapeExpression(((stack1 = ((stack1 = depth0.info), stack1 == null || stack1 === false ? stack1 : stack1.licenseUrl)), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +
    "'>" +
    escapeExpression(((stack1 = ((stack1 = depth0.info), stack1 == null || stack1 === false ? stack1 : stack1.license)), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +
    '</a></div>'
      return buffer
    }

    function program8 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n        , <span style="font-variant: small-caps">api version</span>: '
      if (stack1 = helpers.apiVersion) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.apiVersion; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    '\n        '
      return buffer
    }

    buffer += "<div class='info' id='api_info'>\n  "
    stack1 = helpers['if'].call(depth0, depth0.info, {hash: {}, inverse: self.noop, fn: self.program(1, program1, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += "\n</div>\n<div class='container' id='resources_container'>\n    <ul id='resources'>\n    </ul>\n\n    <div class=\"footer\">\n        <br>\n        <br>\n        <h4 style=\"color: #999\">[ <span style=\"font-variant: small-caps\">base url</span>: "
    if (stack1 = helpers.basePath) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.basePath; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '\n        '
    stack1 = helpers['if'].call(depth0, depth0.apiVersion, {hash: {}, inverse: self.noop, fn: self.program(8, program8, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += ']</h4>\n    </div>\n</div>\n'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['operation'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, options, functionType = 'function', escapeExpression = this.escapeExpression, self = this, blockHelperMissing = helpers.blockHelperMissing

    function program1 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n        <h4>Implementation Notes</h4>\n        <p>'
      if (stack1 = helpers.notes) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.notes; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '</p>\n        '
      return buffer
    }

    function program3 (depth0, data) {
      return '\n        <div class="auth">\n        <span class="api-ic ic-error"></span>'
    }

    function program5 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n          <div id="api_information_panel" style="top: 526px; left: 776px; display: none;">\n          '
      stack1 = helpers.each.call(depth0, depth0, {hash: {}, inverse: self.noop, fn: self.program(6, program6, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n          </div>\n        '
      return buffer
    }
    function program6 (depth0, data) {
      var buffer = '', stack1, stack2
      buffer += "\n            <div title='"
      stack2 = ((stack1 = depth0.description), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)
      if (stack2 || stack2 === 0) { buffer += stack2 }
      buffer += "'>" +
    escapeExpression(((stack1 = depth0.scope), typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +
    '</div>\n          '
      return buffer
    }

    function program8 (depth0, data) {
      return '</div>'
    }

    function program10 (depth0, data) {
      return "\n        <div class='access'>\n          <span class=\"api-ic ic-off\" title=\"click to authenticate\"></span>\n        </div>\n        "
    }

    function program12 (depth0, data) {
      return '\n          <h4>Response Class</h4>\n          <p><span class="model-signature" /></p>\n          <br/>\n          <div class="response-content-type" />\n        '
    }

    function program14 (depth0, data) {
      return "\n          <h4>Parameters</h4>\n          <table class='fullwidth'>\n          <thead>\n            <tr>\n            <th style=\"width: 100px; max-width: 100px\">Parameter</th>\n            <th style=\"width: 310px; max-width: 310px\">Value</th>\n            <th style=\"width: 200px; max-width: 200px\">Description</th>\n            <th style=\"width: 100px; max-width: 100px\">Parameter Type</th>\n            <th style=\"width: 220px; max-width: 230px\">Data Type</th>\n            </tr>\n          </thead>\n          <tbody class=\"operation-params\">\n\n          </tbody>\n          </table>\n          "
    }

    function program16 (depth0, data) {
      return "\n          <div style='margin:0;padding:0;display:inline'></div>\n          <h4>Error Status Codes</h4>\n          <table class='fullwidth'>\n            <thead>\n            <tr>\n              <th>HTTP Status Code</th>\n              <th>Reason</th>\n            </tr>\n            </thead>\n            <tbody class=\"operation-status\">\n            \n            </tbody>\n          </table>\n          "
    }

    function program18 (depth0, data) {
      return '\n          '
    }

    function program20 (depth0, data) {
      return "\n          <div class='sandbox_header'>\n            <input class='submit' name='commit' type='button' value='Try it out!' />\n            <a href='#' class='response_hider' style='display:none'>Hide Response</a>\n            <img alt='Throbber' class='response_throbber' src='images/throbber.gif' style='display:none' />\n          </div>\n          "
    }

    buffer += "\n  <ul class='operations' >\n    <li class='"
    if (stack1 = helpers.method) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.method; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    " operation' id='"
    if (stack1 = helpers.parentId) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.parentId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '_'
    if (stack1 = helpers.nickname) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.nickname; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "'>\n      <div class='heading'>\n        <h3>\n          <span class='http_method'>\n          <a href='#!/"
    if (stack1 = helpers.parentId) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.parentId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '/'
    if (stack1 = helpers.nickname) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.nickname; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "' class=\"toggleOperation\">"
    if (stack1 = helpers.method) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.method; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "</a>\n          </span>\n          <span class='path'>\n          <a href='#!/"
    if (stack1 = helpers.parentId) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.parentId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '/'
    if (stack1 = helpers.nickname) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.nickname; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "' class=\"toggleOperation\">"
    if (stack1 = helpers.path) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.path; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "</a>\n          </span>\n        </h3>\n        <ul class='options'>\n          <li>\n          <a href='#!/"
    if (stack1 = helpers.parentId) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.parentId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '/'
    if (stack1 = helpers.nickname) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.nickname; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "' class=\"toggleOperation\">"
    if (stack1 = helpers.summary) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.summary; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += "</a>\n          </li>\n        </ul>\n      </div>\n      <div class='content' id='"
    if (stack1 = helpers.parentId) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.parentId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '_'
    if (stack1 = helpers.nickname) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.nickname; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "_content' style='display:none'>\n        "
    stack1 = helpers['if'].call(depth0, depth0.notes, {hash: {}, inverse: self.noop, fn: self.program(1, program1, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n        '
    options = {hash: {}, inverse: self.noop, fn: self.program(3, program3, data), data: data}
    if (stack1 = helpers.oauth) { stack1 = stack1.call(depth0, options) } else { stack1 = depth0.oauth; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (!helpers.oauth) { stack1 = blockHelperMissing.call(depth0, stack1, options) }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n        '
    stack1 = helpers.each.call(depth0, depth0.oauth, {hash: {}, inverse: self.noop, fn: self.program(5, program5, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n        '
    options = {hash: {}, inverse: self.noop, fn: self.program(8, program8, data), data: data}
    if (stack1 = helpers.oauth) { stack1 = stack1.call(depth0, options) } else { stack1 = depth0.oauth; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (!helpers.oauth) { stack1 = blockHelperMissing.call(depth0, stack1, options) }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n        '
    options = {hash: {}, inverse: self.noop, fn: self.program(10, program10, data), data: data}
    if (stack1 = helpers.oauth) { stack1 = stack1.call(depth0, options) } else { stack1 = depth0.oauth; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (!helpers.oauth) { stack1 = blockHelperMissing.call(depth0, stack1, options) }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n        '
    stack1 = helpers['if'].call(depth0, depth0.type, {hash: {}, inverse: self.noop, fn: self.program(12, program12, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += "\n        <form accept-charset='UTF-8' class='sandbox'>\n          <div style='margin:0;padding:0;display:inline'></div>\n          "
    stack1 = helpers['if'].call(depth0, depth0.parameters, {hash: {}, inverse: self.noop, fn: self.program(14, program14, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n          '
    stack1 = helpers['if'].call(depth0, depth0.responseMessages, {hash: {}, inverse: self.noop, fn: self.program(16, program16, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n          '
    stack1 = helpers['if'].call(depth0, depth0.isReadOnly, {hash: {}, inverse: self.program(20, program20, data), fn: self.program(18, program18, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += "\n        </form>\n        <div class='response' style='display:none'>\n          <h4>Request URL</h4>\n          <div class='block request_url'></div>\n          <h4>Response Body</h4>\n          <div class='block response_body'></div>\n          <h4>Response Code</h4>\n          <div class='block response_code'></div>\n          <h4>Response Headers</h4>\n          <div class='block response_headers'></div>\n        </div>\n      </div>\n    </li>\n  </ul>\n"
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['param'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', escapeExpression = this.escapeExpression, self = this

    function program1 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n		'
      stack1 = helpers['if'].call(depth0, depth0.isFile, {hash: {}, inverse: self.program(4, program4, data), fn: self.program(2, program2, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n	'
      return buffer
    }
    function program2 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n			<input type=\"file\" name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'/>\n			<div class=\"parameter-content-type\" />\n		"
      return buffer
    }

    function program4 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n			'
      stack1 = helpers['if'].call(depth0, depth0.defaultValue, {hash: {}, inverse: self.program(7, program7, data), fn: self.program(5, program5, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n		'
      return buffer
    }
    function program5 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n				<textarea class='body-textarea' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'>"
      if (stack1 = helpers.defaultValue) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.defaultValue; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    '</textarea>\n			'
      return buffer
    }

    function program7 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n				<textarea class='body-textarea' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'></textarea>\n				<br />\n				<div class=\"parameter-content-type\" />\n			"
      return buffer
    }

    function program9 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n		'
      stack1 = helpers['if'].call(depth0, depth0.defaultValue, {hash: {}, inverse: self.program(12, program12, data), fn: self.program(10, program10, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n	'
      return buffer
    }
    function program10 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n			<input class='parameter' minlength='0' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "' placeholder='' type='text' value='"
      if (stack1 = helpers.defaultValue) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.defaultValue; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'/>\n		"
      return buffer
    }

    function program12 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n			<input class='parameter' minlength='0' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "' placeholder='' type='text' value=''/>\n		"
      return buffer
    }

    buffer += "<td class='code'>"
    if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '</td>\n<td>\n\n	'
    stack1 = helpers['if'].call(depth0, depth0.isBody, {hash: {}, inverse: self.program(9, program9, data), fn: self.program(1, program1, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n\n</td>\n<td>'
    if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '</td>\n<td>'
    if (stack1 = helpers.paramType) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.paramType; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '</td>\n<td>\n	<span class="model-signature"></span>\n</td>\n'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['param_list'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, stack2, options, self = this, helperMissing = helpers.helperMissing, functionType = 'function', escapeExpression = this.escapeExpression

    function program1 (depth0, data) {
      return " multiple='multiple'"
    }

    function program3 (depth0, data) {
      return '\n    '
    }

    function program5 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n      '
      stack1 = helpers['if'].call(depth0, depth0.defaultValue, {hash: {}, inverse: self.program(8, program8, data), fn: self.program(6, program6, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n    '
      return buffer
    }
    function program6 (depth0, data) {
      return '\n      '
    }

    function program8 (depth0, data) {
      var buffer = '', stack1, stack2, options
      buffer += '\n        '
      options = {hash: {}, inverse: self.program(11, program11, data), fn: self.program(9, program9, data), data: data}
      stack2 = ((stack1 = helpers.isArray || depth0.isArray), stack1 ? stack1.call(depth0, depth0, options) : helperMissing.call(depth0, 'isArray', depth0, options))
      if (stack2 || stack2 === 0) { buffer += stack2 }
      buffer += '\n      '
      return buffer
    }
    function program9 (depth0, data) {
      return '\n        '
    }

    function program11 (depth0, data) {
      return "\n          <option selected=\"\" value=''></option>\n        "
    }

    function program13 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n      '
      stack1 = helpers['if'].call(depth0, depth0.isDefault, {hash: {}, inverse: self.program(16, program16, data), fn: self.program(14, program14, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n    '
      return buffer
    }
    function program14 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n        <option selected=\"\" value='"
      if (stack1 = helpers.value) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'>"
      if (stack1 = helpers.value) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    ' (default)</option>\n      '
      return buffer
    }

    function program16 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n        <option value='"
      if (stack1 = helpers.value) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'>"
      if (stack1 = helpers.value) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.value; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    '</option>\n      '
      return buffer
    }

    buffer += "<td class='code'>"
    if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '</td>\n<td>\n  <select '
    options = {hash: {}, inverse: self.noop, fn: self.program(1, program1, data), data: data}
    stack2 = ((stack1 = helpers.isArray || depth0.isArray), stack1 ? stack1.call(depth0, depth0, options) : helperMissing.call(depth0, 'isArray', depth0, options))
    if (stack2 || stack2 === 0) { buffer += stack2 }
    buffer += " class='parameter' name='"
    if (stack2 = helpers.name) { stack2 = stack2.call(depth0, {hash: {}, data: data}) } else { stack2 = depth0.name; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2 }
    buffer += escapeExpression(stack2) +
    "'>\n    "
    stack2 = helpers['if'].call(depth0, depth0.required, {hash: {}, inverse: self.program(5, program5, data), fn: self.program(3, program3, data), data: data})
    if (stack2 || stack2 === 0) { buffer += stack2 }
    buffer += '\n    '
    stack2 = helpers.each.call(depth0, ((stack1 = depth0.allowableValues), stack1 == null || stack1 === false ? stack1 : stack1.descriptiveValues), {hash: {}, inverse: self.noop, fn: self.program(13, program13, data), data: data})
    if (stack2 || stack2 === 0) { buffer += stack2 }
    buffer += '\n  </select>\n</td>\n<td>'
    if (stack2 = helpers.description) { stack2 = stack2.call(depth0, {hash: {}, data: data}) } else { stack2 = depth0.description; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2 }
    if (stack2 || stack2 === 0) { buffer += stack2 }
    buffer += '</td>\n<td>'
    if (stack2 = helpers.paramType) { stack2 = stack2.call(depth0, {hash: {}, data: data}) } else { stack2 = depth0.paramType; stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2 }
    if (stack2 || stack2 === 0) { buffer += stack2 }
    buffer += '</td>\n<td><span class="model-signature"></span></td>'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['param_readonly'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', escapeExpression = this.escapeExpression, self = this

    function program1 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n        <textarea class='body-textarea' readonly='readonly' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'>"
      if (stack1 = helpers.defaultValue) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.defaultValue; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    '</textarea>\n    '
      return buffer
    }

    function program3 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n        '
      stack1 = helpers['if'].call(depth0, depth0.defaultValue, {hash: {}, inverse: self.program(6, program6, data), fn: self.program(4, program4, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n    '
      return buffer
    }
    function program4 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n            '
      if (stack1 = helpers.defaultValue) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.defaultValue; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    '\n        '
      return buffer
    }

    function program6 (depth0, data) {
      return '\n            (empty)\n        '
    }

    buffer += "<td class='code'>"
    if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '</td>\n<td>\n    '
    stack1 = helpers['if'].call(depth0, depth0.isBody, {hash: {}, inverse: self.program(3, program3, data), fn: self.program(1, program1, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n</td>\n<td>'
    if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '</td>\n<td>'
    if (stack1 = helpers.paramType) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.paramType; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '</td>\n<td><span class="model-signature"></span></td>\n'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['param_readonly_required'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', escapeExpression = this.escapeExpression, self = this

    function program1 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n        <textarea class='body-textarea'  readonly='readonly' placeholder='(required)' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'>"
      if (stack1 = helpers.defaultValue) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.defaultValue; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    '</textarea>\n    '
      return buffer
    }

    function program3 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n        '
      stack1 = helpers['if'].call(depth0, depth0.defaultValue, {hash: {}, inverse: self.program(6, program6, data), fn: self.program(4, program4, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n    '
      return buffer
    }
    function program4 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n            '
      if (stack1 = helpers.defaultValue) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.defaultValue; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    '\n        '
      return buffer
    }

    function program6 (depth0, data) {
      return '\n            (empty)\n        '
    }

    buffer += "<td class='code required'>"
    if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '</td>\n<td>\n    '
    stack1 = helpers['if'].call(depth0, depth0.isBody, {hash: {}, inverse: self.program(3, program3, data), fn: self.program(1, program1, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n</td>\n<td>'
    if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '</td>\n<td>'
    if (stack1 = helpers.paramType) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.paramType; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '</td>\n<td><span class="model-signature"></span></td>\n'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['param_required'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', escapeExpression = this.escapeExpression, self = this

    function program1 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n		'
      stack1 = helpers['if'].call(depth0, depth0.isFile, {hash: {}, inverse: self.program(4, program4, data), fn: self.program(2, program2, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n	'
      return buffer
    }
    function program2 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n			<input type=\"file\" name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'/>\n		"
      return buffer
    }

    function program4 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n			'
      stack1 = helpers['if'].call(depth0, depth0.defaultValue, {hash: {}, inverse: self.program(7, program7, data), fn: self.program(5, program5, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n		'
      return buffer
    }
    function program5 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n				<textarea class='body-textarea' placeholder='(required)' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'>"
      if (stack1 = helpers.defaultValue) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.defaultValue; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    '</textarea>\n			'
      return buffer
    }

    function program7 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n				<textarea class='body-textarea' placeholder='(required)' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'></textarea>\n				<br />\n				<div class=\"parameter-content-type\" />\n			"
      return buffer
    }

    function program9 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n		'
      stack1 = helpers['if'].call(depth0, depth0.isFile, {hash: {}, inverse: self.program(12, program12, data), fn: self.program(10, program10, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n	'
      return buffer
    }
    function program10 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n			<input class='parameter' class='required' type='file' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'/>\n		"
      return buffer
    }

    function program12 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n			'
      stack1 = helpers['if'].call(depth0, depth0.defaultValue, {hash: {}, inverse: self.program(15, program15, data), fn: self.program(13, program13, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n		'
      return buffer
    }
    function program13 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n				<input class='parameter required' minlength='1' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "' placeholder='(required)' type='text' value='"
      if (stack1 = helpers.defaultValue) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.defaultValue; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "'/>\n			"
      return buffer
    }

    function program15 (depth0, data) {
      var buffer = '', stack1
      buffer += "\n				<input class='parameter required' minlength='1' name='"
      if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
      buffer += escapeExpression(stack1) +
    "' placeholder='(required)' type='text' value=''/>\n			"
      return buffer
    }

    buffer += "<td class='code required'>"
    if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '</td>\n<td>\n	'
    stack1 = helpers['if'].call(depth0, depth0.isBody, {hash: {}, inverse: self.program(9, program9, data), fn: self.program(1, program1, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n</td>\n<td>\n	<strong>'
    if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '</strong>\n</td>\n<td>'
    if (stack1 = helpers.paramType) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.paramType; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '</td>\n<td><span class="model-signature"></span></td>\n'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['parameter_content_type'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', self = this

    function program1 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n  '
      stack1 = helpers.each.call(depth0, depth0.consumes, {hash: {}, inverse: self.noop, fn: self.program(2, program2, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n'
      return buffer
    }
    function program2 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n  <option value="'
      stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0)
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '">'
      stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0)
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '</option>\n  '
      return buffer
    }

    function program4 (depth0, data) {
      return '\n  <option value="application/json">application/json</option>\n'
    }

    buffer += '<label for="parameterContentType"></label>\n<select name="parameterContentType">\n'
    stack1 = helpers['if'].call(depth0, depth0.consumes, {hash: {}, inverse: self.program(4, program4, data), fn: self.program(1, program1, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n</select>\n'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['resource'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, options, functionType = 'function', escapeExpression = this.escapeExpression, self = this, blockHelperMissing = helpers.blockHelperMissing

    function program1 (depth0, data) {
      return ' : '
    }

    buffer += "<div class='heading'>\n  <h2>\n    <a href='#!/"
    if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "' onclick=\"Docs.toggleEndpointListForResource('"
    if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "');\">"
    if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '</a> '
    options = {hash: {}, inverse: self.noop, fn: self.program(1, program1, data), data: data}
    if (stack1 = helpers.description) { stack1 = stack1.call(depth0, options) } else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (!helpers.description) { stack1 = blockHelperMissing.call(depth0, stack1, options) }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    if (stack1 = helpers.description) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.description; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += "\n  </h2>\n  <ul class='options'>\n    <li>\n      <a href='#!/"
    if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "' id='endpointListTogger_"
    if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "'\n         onclick=\"Docs.toggleEndpointListForResource('"
    if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "');\">Show/Hide</a>\n    </li>\n    <li>\n      <a href='#' onclick=\"Docs.collapseOperationsForResource('"
    if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "'); return false;\">\n        List Operations\n      </a>\n    </li>\n    <li>\n      <a href='#' onclick=\"Docs.expandOperationsForResource('"
    if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "'); return false;\">\n        Expand Operations\n      </a>\n    </li>\n    <li>\n      <a href='"
    if (stack1 = helpers.url) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.url; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "'>Raw</a>\n    </li>\n  </ul>\n</div>\n<ul class='endpoints' id='"
    if (stack1 = helpers.id) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    "_endpoint_list' style='display:none'>\n\n</ul>\n"
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['response_content_type'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', self = this

    function program1 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n  '
      stack1 = helpers.each.call(depth0, depth0.produces, {hash: {}, inverse: self.noop, fn: self.program(2, program2, data), data: data})
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '\n'
      return buffer
    }
    function program2 (depth0, data) {
      var buffer = '', stack1
      buffer += '\n  <option value="'
      stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0)
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '">'
      stack1 = (typeof depth0 === functionType ? depth0.apply(depth0) : depth0)
      if (stack1 || stack1 === 0) { buffer += stack1 }
      buffer += '</option>\n  '
      return buffer
    }

    function program4 (depth0, data) {
      return '\n  <option value="application/json">application/json</option>\n'
    }

    buffer += '<label for="responseContentType"></label>\n<select name="responseContentType">\n'
    stack1 = helpers['if'].call(depth0, depth0.produces, {hash: {}, inverse: self.program(4, program4, data), fn: self.program(1, program1, data), data: data})
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n</select>\n'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['signature'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', escapeExpression = this.escapeExpression

    buffer += '<div>\n<ul class="signature-nav">\n    <li><a class="description-link" href="#">Model</a></li>\n    <li><a class="snippet-link" href="#">Model Schema</a></li>\n</ul>\n<div>\n\n<div class="signature-container">\n    <div class="description">\n        '
    if (stack1 = helpers.signature) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.signature; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '\n    </div>\n\n    <div class="snippet">\n        <pre><code>'
    if (stack1 = helpers.sampleJSON) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.sampleJSON; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '</code></pre>\n        <small class="notice"></small>\n    </div>\n</div>\n\n'
    return buffer
  })
})();

(function () {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {}
  templates['status_code'] = template(function (Handlebars, depth0, helpers, partials, data) {
    this.compilerInfo = [4, '>= 1.0.0']
    helpers = this.merge(helpers, Handlebars.helpers); data = data || {}
    var buffer = '', stack1, functionType = 'function', escapeExpression = this.escapeExpression

    buffer += "<td width='15%' class='code'>"
    if (stack1 = helpers.code) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.code; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    buffer += escapeExpression(stack1) +
    '</td>\n<td>'
    if (stack1 = helpers.message) { stack1 = stack1.call(depth0, {hash: {}, data: data}) } else { stack1 = depth0.message; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1 }
    if (stack1 || stack1 === 0) { buffer += stack1 }
    buffer += '</td>\n'
    return buffer
  })
})();

// Generated by CoffeeScript 1.5.0
(function () {
  var ContentTypeView, HeaderView, MainView, OperationView, ParameterContentTypeView, ParameterView, ResourceView, ResponseContentTypeView, SignatureView, StatusCodeView, SwaggerUi,
    __hasProp = {}.hasOwnProperty,
    __extends = function (child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key] } function ctor () { this.constructor = child } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child }

  SwaggerUi = (function (_super) {
    __extends(SwaggerUi, _super)

    function SwaggerUi () {
      SwaggerUi.__super__.constructor.apply(this, arguments)
    }

    SwaggerUi.prototype.dom_id = 'swagger_ui'

    SwaggerUi.prototype.options = null

    SwaggerUi.prototype.api = null

    SwaggerUi.prototype.headerView = null

    SwaggerUi.prototype.mainView = null

    SwaggerUi.prototype.initialize = function (options) {
      var _this = this
      if (options == null) {
        options = {}
      }
      if (options.dom_id != null) {
        this.dom_id = options.dom_id
        delete options.dom_id
      }
      if ($('#' + this.dom_id) == null) {
        $('body').append('<div id="' + this.dom_id + '"></div>')
      }
      this.options = options
      this.options.success = function () {
        return _this.render()
      }
      this.options.progress = function (d) {
        return _this.showMessage(d)
      }
      this.options.failure = function (d) {
        return _this.onLoadFailure(d)
      }
      this.headerView = new HeaderView({
        el: $('#header')
      })
      return this.headerView.on('update-swagger-ui', function (data) {
        return _this.updateSwaggerUi(data)
      })
    }

    SwaggerUi.prototype.updateSwaggerUi = function (data) {
      this.options.url = data.url
      return this.load()
    }

    SwaggerUi.prototype.load = function () {
      var url, _ref
      if ((_ref = this.mainView) != null) {
        _ref.clear()
      }
      url = this.options.url
      if (url.indexOf('http') !== 0) {
        url = this.buildUrl(window.location.href.toString(), url)
      }
      this.options.url = url
      this.headerView.update(url)
      this.api = new SwaggerApi(this.options)
      this.api.build()
      return this.api
    }

    SwaggerUi.prototype.render = function () {
      var _this = this
      this.showMessage('Finished Loading Resource Information. Rendering Swagger UI...')
      this.mainView = new MainView({
        model: this.api,
        el: $('#' + this.dom_id)
      }).render()
      this.showMessage()
      switch (this.options.docExpansion) {
        case 'full':
          Docs.expandOperationsForResource('')
          break
        case 'list':
          Docs.collapseOperationsForResource('')
      }
      if (this.options.onComplete) {
        this.options.onComplete(this.api, this)
      }
      return setTimeout(function () {
        return Docs.shebang()
      }, 400)
    }

    SwaggerUi.prototype.buildUrl = function (base, url) {
      var endOfPath, parts
      log('base is ' + base)
      if (url.indexOf('/') === 0) {
        parts = base.split('/')
        base = parts[0] + '//' + parts[2]
        return base + url
      } else {
        endOfPath = base.length
        if (base.indexOf('?') > -1) {
          endOfPath = Math.min(endOfPath, base.indexOf('?'))
        }
        if (base.indexOf('#') > -1) {
          endOfPath = Math.min(endOfPath, base.indexOf('#'))
        }
        base = base.substring(0, endOfPath)
        if (base.indexOf('/', base.length - 1) !== -1) {
          return base + url
        }
        return base + '/' + url
      }
    }

    SwaggerUi.prototype.showMessage = function (data) {
      if (data == null) {
        data = ''
      }
      $('#message-bar').removeClass('message-fail')
      $('#message-bar').addClass('message-success')
      return $('#message-bar').html(data)
    }

    SwaggerUi.prototype.onLoadFailure = function (data) {
      var val
      if (data == null) {
        data = ''
      }
      $('#message-bar').removeClass('message-success')
      $('#message-bar').addClass('message-fail')
      val = $('#message-bar').html(data)
      if (this.options.onFailure != null) {
        this.options.onFailure(data)
      }
      return val
    }

    return SwaggerUi
  })(Backbone.Router)

  window.SwaggerUi = SwaggerUi

  HeaderView = (function (_super) {
    __extends(HeaderView, _super)

    function HeaderView () {
      HeaderView.__super__.constructor.apply(this, arguments)
    }

    HeaderView.prototype.events = {
      'click #show-pet-store-icon': 'showPetStore',
      'click #show-wordnik-dev-icon': 'showWordnikDev',
      'click #explore': 'showCustom',
      'keyup #input_baseUrl': 'showCustomOnKeyup',
      'keyup #input_apiKey': 'showCustomOnKeyup'
    }

    HeaderView.prototype.initialize = function () {}

    HeaderView.prototype.showPetStore = function (e) {
      return this.trigger('update-swagger-ui', {
        url: 'http://petstore.swagger.wordnik.com/api/api-docs'
      })
    }

    HeaderView.prototype.showWordnikDev = function (e) {
      return this.trigger('update-swagger-ui', {
        url: 'http://api.wordnik.com/v4/resources.json'
      })
    }

    HeaderView.prototype.showCustomOnKeyup = function (e) {
      if (e.keyCode === 13) {
        return this.showCustom()
      }
    }

    HeaderView.prototype.showCustom = function (e) {
      if (e != null) {
        e.preventDefault()
      }
      return this.trigger('update-swagger-ui', {
        url: $('#input_baseUrl').val(),
        apiKey: $('#input_apiKey').val()
      })
    }

    HeaderView.prototype.update = function (url, apiKey, trigger) {
      if (trigger == null) {
        trigger = false
      }
      $('#input_baseUrl').val(url)
      if (trigger) {
        return this.trigger('update-swagger-ui', {
          url: url
        })
      }
    }

    return HeaderView
  })(Backbone.View)

  MainView = (function (_super) {
    __extends(MainView, _super)

    function MainView () {
      MainView.__super__.constructor.apply(this, arguments)
    }

    MainView.prototype.initialize = function () {}

    MainView.prototype.render = function () {
      var counter, id, resource, resources, _i, _len, _ref
      $(this.el).html(Handlebars.templates.main(this.model))
      resources = {}
      counter = 0
      _ref = this.model.apisArray
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        resource = _ref[_i]
        id = resource.name
        while (typeof resources[id] !== 'undefined') {
          id = id + '_' + counter
          counter += 1
        }
        resource.id = id
        resources[id] = resource
        this.addResource(resource)
      }
      return this
    }

    MainView.prototype.addResource = function (resource) {
      var resourceView
      resourceView = new ResourceView({
        model: resource,
        tagName: 'li',
        id: 'resource_' + resource.id,
        className: 'resource'
      })
      return $('#resources').append(resourceView.render().el)
    }

    MainView.prototype.clear = function () {
      return $(this.el).html('')
    }

    return MainView
  })(Backbone.View)

  ResourceView = (function (_super) {
    __extends(ResourceView, _super)

    function ResourceView () {
      ResourceView.__super__.constructor.apply(this, arguments)
    }

    ResourceView.prototype.initialize = function () {}

    ResourceView.prototype.render = function () {
      var counter, id, methods, operation, _i, _len, _ref
      $(this.el).html(Handlebars.templates.resource(this.model))
      methods = {}
      _ref = this.model.operationsArray
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        operation = _ref[_i]
        counter = 0
        id = operation.nickname
        while (typeof methods[id] !== 'undefined') {
          id = id + '_' + counter
          counter += 1
        }
        methods[id] = operation
        operation.nickname = id
        operation.parentId = this.model.id
        this.addOperation(operation)
      }
      return this
    }

    ResourceView.prototype.addOperation = function (operation) {
      var operationView
      operation.number = this.number
      operationView = new OperationView({
        model: operation,
        tagName: 'li',
        className: 'endpoint'
      })
      $('.endpoints', $(this.el)).append(operationView.render().el)
      return this.number++
    }

    return ResourceView
  })(Backbone.View)

  OperationView = (function (_super) {
    __extends(OperationView, _super)

    function OperationView () {
      OperationView.__super__.constructor.apply(this, arguments)
    }

    OperationView.prototype.invocationUrl = null

    OperationView.prototype.events = {
      'submit .sandbox': 'submitOperation',
      'click .submit': 'submitOperation',
      'click .response_hider': 'hideResponse',
      'click .toggleOperation': 'toggleOperationContent',
      'mouseenter .api-ic': 'mouseEnter',
      'mouseout .api-ic': 'mouseExit'
    }

    OperationView.prototype.initialize = function () {}

    OperationView.prototype.mouseEnter = function (e) {
      var elem, hgh, pos, scMaxX, scMaxY, scX, scY, wd, x, y
      elem = $(e.currentTarget.parentNode).find('#api_information_panel')
      x = event.pageX
      y = event.pageY
      scX = $(window).scrollLeft()
      scY = $(window).scrollTop()
      scMaxX = scX + $(window).width()
      scMaxY = scY + $(window).height()
      wd = elem.width()
      hgh = elem.height()
      if (x + wd > scMaxX) {
        x = scMaxX - wd
      }
      if (x < scX) {
        x = scX
      }
      if (y + hgh > scMaxY) {
        y = scMaxY - hgh
      }
      if (y < scY) {
        y = scY
      }
      pos = {}
      pos.top = y
      pos.left = x
      elem.css(pos)
      return $(e.currentTarget.parentNode).find('#api_information_panel').show()
    }

    OperationView.prototype.mouseExit = function (e) {
      return $(e.currentTarget.parentNode).find('#api_information_panel').hide()
    }

    OperationView.prototype.render = function () {
      var contentTypeModel, isMethodSubmissionSupported, k, o, param, responseContentTypeView, responseSignatureView, signatureModel, statusCode, type, v, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3
      isMethodSubmissionSupported = true
      if (!isMethodSubmissionSupported) {
        this.model.isReadOnly = true
      }
      this.model.oauth = null
      if (this.model.authorizations) {
        _ref = this.model.authorizations
        for (k in _ref) {
          v = _ref[k]
          if (k === 'oauth2') {
            if (this.model.oauth === null) {
              this.model.oauth = {}
            }
            if (this.model.oauth.scopes === void 0) {
              this.model.oauth.scopes = []
            }
            for (_i = 0, _len = v.length; _i < _len; _i++) {
              o = v[_i]
              this.model.oauth.scopes.push(o)
            }
          }
        }
      }
      $(this.el).html(Handlebars.templates.operation(this.model))
      if (this.model.responseClassSignature && this.model.responseClassSignature !== 'string') {
        signatureModel = {
          sampleJSON: this.model.responseSampleJSON,
          isParam: false,
          signature: this.model.responseClassSignature
        }
        responseSignatureView = new SignatureView({
          model: signatureModel,
          tagName: 'div'
        })
        $('.model-signature', $(this.el)).append(responseSignatureView.render().el)
      } else {
        $('.model-signature', $(this.el)).html(this.model.type)
      }
      contentTypeModel = {
        isParam: false
      }
      contentTypeModel.consumes = this.model.consumes
      contentTypeModel.produces = this.model.produces
      _ref1 = this.model.parameters
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        param = _ref1[_j]
        type = param.type || param.dataType
        if (type.toLowerCase() === 'file') {
          if (!contentTypeModel.consumes) {
            log('set content type ')
            contentTypeModel.consumes = 'multipart/form-data'
          }
        }
      }
      responseContentTypeView = new ResponseContentTypeView({
        model: contentTypeModel
      })
      $('.response-content-type', $(this.el)).append(responseContentTypeView.render().el)
      _ref2 = this.model.parameters
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        param = _ref2[_k]
        this.addParameter(param, contentTypeModel.consumes)
      }
      _ref3 = this.model.responseMessages
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        statusCode = _ref3[_l]
        this.addStatusCode(statusCode)
      }
      return this
    }

    OperationView.prototype.addParameter = function (param, consumes) {
      var paramView
      param.consumes = consumes
      paramView = new ParameterView({
        model: param,
        tagName: 'tr',
        readOnly: this.model.isReadOnly
      })
      return $('.operation-params', $(this.el)).append(paramView.render().el)
    }

    OperationView.prototype.addStatusCode = function (statusCode) {
      var statusCodeView
      statusCodeView = new StatusCodeView({
        model: statusCode,
        tagName: 'tr'
      })
      return $('.operation-status', $(this.el)).append(statusCodeView.render().el)
    }

    OperationView.prototype.submitOperation = function (e) {
      var error_free, form, isFileUpload, map, o, opts, val, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2
      if (e != null) {
        e.preventDefault()
      }
      form = $('.sandbox', $(this.el))
      error_free = true
      form.find('input.required').each(function () {
        var _this = this
        $(this).removeClass('error')
        if (jQuery.trim($(this).val()) === '') {
          $(this).addClass('error')
          $(this).wiggle({
            callback: function () {
              return $(_this).focus()
            }
          })
          return error_free = false
        }
      })
      if (error_free) {
        map = {}
        opts = {
          parent: this
        }
        isFileUpload = false
        _ref = form.find('input')
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          o = _ref[_i]
          if ((o.value != null) && jQuery.trim(o.value).length > 0) {
            map[o.name] = o.value
          }
          if (o.type === 'file') {
            isFileUpload = true
          }
        }
        _ref1 = form.find('textarea')
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          o = _ref1[_j]
          if ((o.value != null) && jQuery.trim(o.value).length > 0) {
            map['body'] = o.value
          }
        }
        _ref2 = form.find('select')
        for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
          o = _ref2[_k]
          val = this.getSelectedValue(o)
          if ((val != null) && jQuery.trim(val).length > 0) {
            map[o.name] = val
          }
        }
        opts.responseContentType = $('div select[name=responseContentType]', $(this.el)).val()
        opts.requestContentType = $('div select[name=parameterContentType]', $(this.el)).val()
        $('.response_throbber', $(this.el)).show()
        if (isFileUpload) {
          return this.handleFileUpload(map, form)
        } else {
          return this.model['do'](map, opts, this.showCompleteStatus, this.showErrorStatus, this)
        }
      }
    }

    OperationView.prototype.success = function (response, parent) {
      return parent.showCompleteStatus(response)
    }

    OperationView.prototype.handleFileUpload = function (map, form) {
      var bodyParam, el, headerParams, o, obj, param, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3,
        _this = this
      log("it's a file upload")
      _ref = form.serializeArray()
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        o = _ref[_i]
        if ((o.value != null) && jQuery.trim(o.value).length > 0) {
          map[o.name] = o.value
        }
      }
      bodyParam = new FormData()
      _ref1 = this.model.parameters
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        param = _ref1[_j]
        if (param.paramType === 'form') {
          if (map[param.name] !== void 0) {
            bodyParam.append(param.name, map[param.name])
          }
        }
      }
      headerParams = {}
      _ref2 = this.model.parameters
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        param = _ref2[_k]
        if (param.paramType === 'header') {
          headerParams[param.name] = map[param.name]
        }
      }
      log(headerParams)
      _ref3 = form.find('input[type~="file"]')
      for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
        el = _ref3[_l]
        bodyParam.append($(el).attr('name'), el.files[0])
      }
      log(bodyParam)
      this.invocationUrl = this.model.supportHeaderParams() ? (headerParams = this.model.getHeaderParams(map), this.model.urlify(map, false)) : this.model.urlify(map, true)
      $('.request_url', $(this.el)).html('<pre>' + this.invocationUrl + '</pre>')
      obj = {
        type: this.model.method,
        url: this.invocationUrl,
        headers: headerParams,
        data: bodyParam,
        dataType: 'json',
        contentType: false,
        processData: false,
        error: function (data, textStatus, error) {
          return _this.showErrorStatus(_this.wrap(data), _this)
        },
        success: function (data) {
          return _this.showResponse(data, _this)
        },
        complete: function (data) {
          return _this.showCompleteStatus(_this.wrap(data), _this)
        }
      }
      if (window.authorizations) {
        window.authorizations.apply(obj)
      }
      jQuery.ajax(obj)
      return false
    }

    OperationView.prototype.wrap = function (data) {
      var h, headerArray, headers, i, o, _i, _len
      headers = {}
      headerArray = data.getAllResponseHeaders().split('\r')
      for (_i = 0, _len = headerArray.length; _i < _len; _i++) {
        i = headerArray[_i]
        h = i.split(':')
        if (h[0] !== void 0 && h[1] !== void 0) {
          headers[h[0].trim()] = h[1].trim()
        }
      }
      o = {}
      o.content = {}
      o.content.data = data.responseText
      o.headers = headers
      o.request = {}
      o.request.url = this.invocationUrl
      o.status = data.status
      return o
    }

    OperationView.prototype.getSelectedValue = function (select) {
      var opt, options, _i, _len, _ref
      if (!select.multiple) {
        return select.value
      } else {
        options = []
        _ref = select.options
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          opt = _ref[_i]
          if (opt.selected) {
            options.push(opt.value)
          }
        }
        if (options.length > 0) {
          return options.join(',')
        } else {
          return null
        }
      }
    }

    OperationView.prototype.hideResponse = function (e) {
      if (e != null) {
        e.preventDefault()
      }
      $('.response', $(this.el)).slideUp()
      return $('.response_hider', $(this.el)).fadeOut()
    }

    OperationView.prototype.showResponse = function (response) {
      var prettyJson
      prettyJson = JSON.stringify(response, null, '\t').replace(/\n/g, '<br>')
      return $('.response_body', $(this.el)).html(escape(prettyJson))
    }

    OperationView.prototype.showErrorStatus = function (data, parent) {
      return parent.showStatus(data)
    }

    OperationView.prototype.showCompleteStatus = function (data, parent) {
      return parent.showStatus(data)
    }

    OperationView.prototype.formatXml = function (xml) {
      var contexp, formatted, indent, lastType, lines, ln, pad, reg, transitions, wsexp, _fn, _i, _len
      reg = /(>)(<)(\/*)/g
      wsexp = /[ ]*(.*)[ ]+\n/g
      contexp = /(<.+>)(.+\n)/g
      xml = xml.replace(reg, '$1\n$2$3').replace(wsexp, '$1\n').replace(contexp, '$1\n$2')
      pad = 0
      formatted = ''
      lines = xml.split('\n')
      indent = 0
      lastType = 'other'
      transitions = {
        'single->single': 0,
        'single->closing': -1,
        'single->opening': 0,
        'single->other': 0,
        'closing->single': 0,
        'closing->closing': -1,
        'closing->opening': 0,
        'closing->other': 0,
        'opening->single': 1,
        'opening->closing': 0,
        'opening->opening': 1,
        'opening->other': 1,
        'other->single': 0,
        'other->closing': -1,
        'other->opening': 0,
        'other->other': 0
      }
      _fn = function (ln) {
        var fromTo, j, key, padding, type, types, value
        types = {
          single: Boolean(ln.match(/<.+\/>/)),
          closing: Boolean(ln.match(/<\/.+>/)),
          opening: Boolean(ln.match(/<[^!?].*>/))
        }
        type = ((function () {
          var _results
          _results = []
          for (key in types) {
            value = types[key]
            if (value) {
              _results.push(key)
            }
          }
          return _results
        })())[0]
        type = type === void 0 ? 'other' : type
        fromTo = lastType + '->' + type
        lastType = type
        padding = ''
        indent += transitions[fromTo]
        padding = ((function () {
          var _j, _ref, _results
          _results = []
          for (j = _j = 0, _ref = indent; _ref >= 0 ? _j < _ref : _j > _ref; j = _ref >= 0 ? ++_j : --_j) {
            _results.push('  ')
          }
          return _results
        })()).join('')
        if (fromTo === 'opening->closing') {
          return formatted = formatted.substr(0, formatted.length - 1) + ln + '\n'
        } else {
          return formatted += padding + ln + '\n'
        }
      }
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        ln = lines[_i]
        _fn(ln)
      }
      return formatted
    }

    OperationView.prototype.showStatus = function (response) {
      var code, content, contentType, headers, pre, response_body, url
      if (response.content === void 0) {
        content = response.data
        url = response.url
      } else {
        content = response.content.data
        url = response.request.url
      }
      headers = response.headers
      contentType = headers && headers['Content-Type'] ? headers['Content-Type'].split(';')[0].trim() : null
      if (!content) {
        code = $('<code />').text('no content')
        pre = $('<pre class="json" />').append(code)
      } else if (contentType === 'application/json' || /\+json$/.test(contentType)) {
        code = $('<code />').text(JSON.stringify(JSON.parse(content), null, '  '))
        pre = $('<pre class="json" />').append(code)
      } else if (contentType === 'application/xml' || /\+xml$/.test(contentType)) {
        code = $('<code />').text(this.formatXml(content))
        pre = $('<pre class="xml" />').append(code)
      } else if (contentType === 'text/html') {
        code = $('<code />').html(content)
        pre = $('<pre class="xml" />').append(code)
      } else if (/^image\//.test(contentType)) {
        pre = $('<img>').attr('src', url)
      } else {
        code = $('<code />').text(content)
        pre = $('<pre class="json" />').append(code)
      }
      response_body = pre
      $('.request_url', $(this.el)).html('<pre>' + url + '</pre>')
      $('.response_code', $(this.el)).html('<pre>' + response.status + '</pre>')
      $('.response_body', $(this.el)).html(response_body)
      $('.response_headers', $(this.el)).html('<pre>' + JSON.stringify(response.headers, null, '  ').replace(/\n/g, '<br>') + '</pre>')
      $('.response', $(this.el)).slideDown()
      $('.response_hider', $(this.el)).show()
      $('.response_throbber', $(this.el)).hide()
      return hljs.highlightBlock($('.response_body', $(this.el))[0])
    }

    OperationView.prototype.toggleOperationContent = function () {
      var elem
      elem = $('#' + Docs.escapeResourceName(this.model.parentId) + '_' + this.model.nickname + '_content')
      if (elem.is(':visible')) {
        return Docs.collapseOperation(elem)
      } else {
        return Docs.expandOperation(elem)
      }
    }

    return OperationView
  })(Backbone.View)

  StatusCodeView = (function (_super) {
    __extends(StatusCodeView, _super)

    function StatusCodeView () {
      StatusCodeView.__super__.constructor.apply(this, arguments)
    }

    StatusCodeView.prototype.initialize = function () {}

    StatusCodeView.prototype.render = function () {
      var template
      template = this.template()
      $(this.el).html(template(this.model))
      return this
    }

    StatusCodeView.prototype.template = function () {
      return Handlebars.templates.status_code
    }

    return StatusCodeView
  })(Backbone.View)

  ParameterView = (function (_super) {
    __extends(ParameterView, _super)

    function ParameterView () {
      ParameterView.__super__.constructor.apply(this, arguments)
    }

    ParameterView.prototype.initialize = function () {
      return Handlebars.registerHelper('isArray', function (param, opts) {
        if (param.type.toLowerCase() === 'array' || param.allowMultiple) {
          return opts.fn(this)
        } else {
          return opts.inverse(this)
        }
      })
    }

    ParameterView.prototype.render = function () {
      var contentTypeModel, isParam, parameterContentTypeView, responseContentTypeView, signatureModel, signatureView, template, type
      type = this.model.type || this.model.dataType
      if (this.model.paramType === 'body') {
        this.model.isBody = true
      }
      if (type.toLowerCase() === 'file') {
        this.model.isFile = true
      }
      template = this.template()
      $(this.el).html(template(this.model))
      signatureModel = {
        sampleJSON: this.model.sampleJSON,
        isParam: true,
        signature: this.model.signature
      }
      if (this.model.sampleJSON) {
        signatureView = new SignatureView({
          model: signatureModel,
          tagName: 'div'
        })
        $('.model-signature', $(this.el)).append(signatureView.render().el)
      } else {
        $('.model-signature', $(this.el)).html(this.model.signature)
      }
      isParam = false
      if (this.model.isBody) {
        isParam = true
      }
      contentTypeModel = {
        isParam: isParam
      }
      contentTypeModel.consumes = this.model.consumes
      if (isParam) {
        parameterContentTypeView = new ParameterContentTypeView({
          model: contentTypeModel
        })
        $('.parameter-content-type', $(this.el)).append(parameterContentTypeView.render().el)
      } else {
        responseContentTypeView = new ResponseContentTypeView({
          model: contentTypeModel
        })
        $('.response-content-type', $(this.el)).append(responseContentTypeView.render().el)
      }
      return this
    }

    ParameterView.prototype.template = function () {
      if (this.model.isList) {
        return Handlebars.templates.param_list
      } else {
        if (this.options.readOnly) {
          if (this.model.required) {
            return Handlebars.templates.param_readonly_required
          } else {
            return Handlebars.templates.param_readonly
          }
        } else {
          if (this.model.required) {
            return Handlebars.templates.param_required
          } else {
            return Handlebars.templates.param
          }
        }
      }
    }

    return ParameterView
  })(Backbone.View)

  SignatureView = (function (_super) {
    __extends(SignatureView, _super)

    function SignatureView () {
      SignatureView.__super__.constructor.apply(this, arguments)
    }

    SignatureView.prototype.events = {
      'click a.description-link': 'switchToDescription',
      'click a.snippet-link': 'switchToSnippet',
      'mousedown .snippet': 'snippetToTextArea'
    }

    SignatureView.prototype.initialize = function () {}

    SignatureView.prototype.render = function () {
      var template
      template = this.template()
      $(this.el).html(template(this.model))
      this.switchToDescription()
      this.isParam = this.model.isParam
      if (this.isParam) {
        $('.notice', $(this.el)).text('Click to set as parameter value')
      }
      return this
    }

    SignatureView.prototype.template = function () {
      return Handlebars.templates.signature
    }

    SignatureView.prototype.switchToDescription = function (e) {
      if (e != null) {
        e.preventDefault()
      }
      $('.snippet', $(this.el)).hide()
      $('.description', $(this.el)).show()
      $('.description-link', $(this.el)).addClass('selected')
      return $('.snippet-link', $(this.el)).removeClass('selected')
    }

    SignatureView.prototype.switchToSnippet = function (e) {
      if (e != null) {
        e.preventDefault()
      }
      $('.description', $(this.el)).hide()
      $('.snippet', $(this.el)).show()
      $('.snippet-link', $(this.el)).addClass('selected')
      return $('.description-link', $(this.el)).removeClass('selected')
    }

    SignatureView.prototype.snippetToTextArea = function (e) {
      var textArea
      if (this.isParam) {
        if (e != null) {
          e.preventDefault()
        }
        textArea = $('textarea', $(this.el.parentNode.parentNode.parentNode))
        if ($.trim(textArea.val()) === '') {
          return textArea.val(this.model.sampleJSON)
        }
      }
    }

    return SignatureView
  })(Backbone.View)

  ContentTypeView = (function (_super) {
    __extends(ContentTypeView, _super)

    function ContentTypeView () {
      ContentTypeView.__super__.constructor.apply(this, arguments)
    }

    ContentTypeView.prototype.initialize = function () {}

    ContentTypeView.prototype.render = function () {
      var template
      template = this.template()
      $(this.el).html(template(this.model))
      $('label[for=contentType]', $(this.el)).text('Response Content Type')
      return this
    }

    ContentTypeView.prototype.template = function () {
      return Handlebars.templates.content_type
    }

    return ContentTypeView
  })(Backbone.View)

  ResponseContentTypeView = (function (_super) {
    __extends(ResponseContentTypeView, _super)

    function ResponseContentTypeView () {
      ResponseContentTypeView.__super__.constructor.apply(this, arguments)
    }

    ResponseContentTypeView.prototype.initialize = function () {}

    ResponseContentTypeView.prototype.render = function () {
      var template
      template = this.template()
      $(this.el).html(template(this.model))
      $('label[for=responseContentType]', $(this.el)).text('Response Content Type')
      return this
    }

    ResponseContentTypeView.prototype.template = function () {
      return Handlebars.templates.response_content_type
    }

    return ResponseContentTypeView
  })(Backbone.View)

  ParameterContentTypeView = (function (_super) {
    __extends(ParameterContentTypeView, _super)

    function ParameterContentTypeView () {
      ParameterContentTypeView.__super__.constructor.apply(this, arguments)
    }

    ParameterContentTypeView.prototype.initialize = function () {}

    ParameterContentTypeView.prototype.render = function () {
      var template
      template = this.template()
      $(this.el).html(template(this.model))
      $('label[for=parameterContentType]', $(this.el)).text('Parameter content type:')
      return this
    }

    ParameterContentTypeView.prototype.template = function () {
      return Handlebars.templates.parameter_content_type
    }

    return ParameterContentTypeView
  })(Backbone.View)
}).call(this)
