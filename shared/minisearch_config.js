const NUM_MINISEARCH = 10
const COLS = [
  'tender/title',
  'tender/description',
  'tender/status',
  'tender/value/currency',
  'tender/value/amount',
  'tender/procuringEntity/name',
  'tender/procurementMethodDetails',
  'tender/mainProcurementCategory',
  'tender/tenderPeriod/startDate',
  'tender/tenderPeriod/endDate',
  'tender/tenderPeriod/durationInDays',
  'tender/enquiryPeriod/startDate',
  'tender/enquiryPeriod/endDate',
  'tender/enquiryPeriod/durationInDays',
  'tender/documents/0/url',
]

const MS_CONFIG = {
  fields: ['content'],
  storeFields: COLS.concat(['compressed']),
}
module.exports = { MS_CONFIG, COLS, NUM_MINISEARCH }
