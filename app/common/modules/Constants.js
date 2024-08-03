const CONSTANTS = {
  URL_BASE: '/api/v1',
  IMAGE_BASE_URL: '/api/v1/image/',
  GOOGLE_API_KEY: 'AIzaSyBOFy3jZkSN3ROXsIn3QLoPdKq9VhDOh7s',
  WORKFLOW_DOC_TYPES: [{
    'type': 'WF_DOC',
    'hint': 'Add a document (Drag and drop image files here)',
    'ext': "'.png,.bmp,.jpg,.jpeg,.gif'",
    'accept': "'image/*'"
  }],
  DOC_TYPES: [{
    'type': 'CPI',
    'hint': 'Add a picture of your asset (Drag and drop image files here)',
    'ext': "'.png,.bmp,.jpg,.jpeg,.gif'",
    'accept': "'image/*'"
  }, {
    'type': 'Receipt',
    'hint': 'Upload Receipts (Drag and drop image or pdf files here)',
    'ext': "'.png,.bmp,.jpg,.jpeg,.gif,.pdf'",
    'accept': "'image/*, application/pdf'"
  }, {
    'type': 'Warranty',
    'hint': 'Upload Warranty (Drag and drop image or pdf files here)',
    'ext': "'.png,.bmp,.jpg,.jpeg,.gif,.pdf'",
    'accept': "'image/*, application/pdf'"
  }, {
    'type': 'Insurance',
    'hint': 'Upload Insurance (Drag and drop image or pdf files here)',
    'ext': "'.png,.bmp,.jpg,.jpeg,.gif,.pdf'",
    'accept': "'image/*, application/pdf'"
  }, {
    'type': 'AMC',
    'hint': 'Upload AMC (Drag and drop image or pdf files here)',
    'ext': "'.png,.bmp,.jpg,.jpeg,.gif,.pdf'",
    'accept': "'image/*, application/pdf'"
  }, {
    'type': 'Other',
    'hint': 'Upload Other Documents (Drag and drop image or pdf files here)',
    'ext': "'.png,.bmp,.jpg,.jpeg,.gif,.pdf'",
    'accept': "'image/*, application/pdf'"
  }],
  MAX_DOCS_PER_ASSET: 10
}
export default CONSTANTS
