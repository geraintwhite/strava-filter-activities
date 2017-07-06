var tableFilterPath = 'https://unpkg.com/tablefilter@latest/dist/tablefilter/'
var id = 'strava-filter-activities';

var filtersConfig = {
  base_path: tableFilterPath,
  alternate_rows: true,
  rows_counter: true,
  btn_reset: true,
  loader: true,
  mark_active_columns: true,
  no_results_message: true,
  enable_empty_option: true,
  paging: {
    results_per_page: ['Activities: ', [10, 25, 50, 100]]
  },
  col_0: 'select',
  col_5: 'select',
  col_types: [
    'string', 'date', 'string', 'date', 'number', 'string', 'number'
  ],
  extensions: [{
    name: 'sort',
    images_path: tableFilterPath + 'style/themes/'
  }]
};

var tf = new TableFilter(id, filtersConfig);
tf.init();
