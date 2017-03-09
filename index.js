var ich = require('icanhaz')
// TODO Finish linting by fixing vars

function initiateTableFilter (opts) {
  // TODO what if there are multiple tables and clears
  document.querySelector('.clear').addEventListener('click', function () {
    // TODO simplify this/only check once to see if .clears and .matches exist
    if (document.querySelector(this.id + '.matches')) {
      document.querySelector(this.id + '.matches').setAttribute('visibility', 'hidden')
    }
    document.querySelector(this.id + opts.filterDiv).value = ''
    makeTable(opts)
  })
  document.querySelector(opts.filterDiv).addEventListener('keyup', function (e) {
    searchTable(opts, e.target.value)
  })
}

function searchTable (opts, searchTerm) {
  var filteredList = []
  opts.data.forEach(function (object) {
    var stringObject = JSON.stringify(object).toLowerCase()
    if (stringObject.match(searchTerm.toLowerCase())) filteredList.push(object)
  })

  if (document.querySelector('.noMatches')) {
    if (filteredList.length === 0) document.querySelector('.noMatches').setAttribute('visibility', 'inherit')
    else document.querySelector('.noMatches').setAttribute('visibility', 'hidden')
  }
  makeTable(opts, filteredList)
}

function sortThings (opts, sorter, sorted, tableDiv) {
  if (opts.tableDiv !== tableDiv) return
  opts.data.sort(function (a, b) {
    if (a[sorter] < b[sorter]) return -1
    if (a[sorter] > b[sorter]) return 1
    return 0
  })
  if (sorted === 'descending') opts.data.reverse()
  makeTable(opts)
  var header
  var tableHeaders = document.querySelectorAll(tableDiv + ' .tHeader')
  Array.prototype.forEach.call(tableHeaders, function (el) {
    var contents = resolveDataTitle(el.innerText)
    if (contents === sorter) header = el
  })
  header.setAttribute('data-sorted', sorted)
}

function resolveDataTitle (string) {
  var adjusted = string.toLowerCase().replace(/\s/g, '').replace(/\W/g, '')
  return adjusted
}

function initiateTableSorter (options) {
  $(document).on('click', '.tHeader', sendToSort)

  function sendToSort (event) {
    var tableDiv = '#' + $(event.target).closest('div').attr('id')
    var sorted = $(event.target).attr('data-sorted')
    if (sorted) {
      if (sorted === 'descending') sorted = 'ascending'
      else sorted = 'descending'
    } else { sorted = 'ascending' }
    var sorter = resolveDataTitle(event.target.innerHTML)
    var sortInfo = {'sorter': sorter, 'sorted': sorted, 'tableDiv': tableDiv}
    sortThings(options, sorter, sorted, tableDiv)
  }
}

function makeTable (opts, filteredList) {
  opts.templateID = opts.tableDiv + '_template'
  initiateTableSorter(opts)

  if (filteredList) var data = filteredList
  else var data = opts.data
  var tableId = opts.tableDiv.slice(1)
  if (!opts.pagination) table(data, {'tableDiv': '#' + opts.targetDiv})
  var allRows = data.length
  var totalPages = Math.ceil(allRows / opts.pagination)
  var currentPage = 1
  var currentStart = (currentPage * opts.pagination) - opts.pagination
  var currentEnd = currentPage * opts.pagination
  var currentRows = data.slice(currentStart, currentEnd)
  table(currentRows, opts)
  if (opts.data.length > opts.pagination) writePreNext(opts.tableDiv, currentPage, currentPage, totalPages, data, opts.pagination)
}

function setPagClicks (data, tableId, currentPage, pagination, totalPages) {
  $('.pagination-pre-' + tableId).addClass('no-pag')

  $(document).on('click', ('.pagination-next-' + tableId), function () {
    if ($(this).hasClass('no-pag')) return

    currentPage = currentPage + 1
    var nextPage = currentPage + 1
    currentStart = (currentPage * pagination) - pagination
    currentEnd = currentPage * pagination

    if (currentPage >= totalPages) {
      currentRows = data.slice(currentStart, currentEnd)
      table(currentRows, {'tableDiv': '#' + tableId})
      setPreNext('#' + tableId, currentPage, currentPage, totalPages)
      $('.pagination-next-' + tableId).addClass('no-pag')
      $('.pagination-next-' + tableId)
    } else {
      currentRows = data.slice(currentStart, currentEnd)
      table(currentRows, {'tableDiv': '#' + tableId})
      setPreNext('#' + tableId, currentPage, currentPage, totalPages)
    }
  })

  $(document).on('click', ('.pagination-pre-' + tableId), function () {
    if (currentPage > 1) $(this).removeClass('no-pag')
    if ($(this).hasClass('no-pag')) return

    // if ((currentPage) === 2) {
    //   $(".pagination-pre-" + tableId).addClass("no-pag"); console.log("on page one!", currentPage)
    // }

    currentPage = currentPage - 1
    var nextPage = currentPage + 1
    currentStart = (currentPage * pagination) - pagination
    currentEnd = currentPage * pagination

    // currentRows = data.slice(currentStart, currentEnd)
    // table(currentRows, "#" + tableId)
    // setPreNext("#" + tableId, currentPage, currentPage, totalPages)

    if (currentPage === 1) {
      currentRows = data.slice(currentStart, currentEnd)
      table(currentRows, {'tableDiv': '#' + tableId})
      setPreNext('#' + tableId, currentPage, currentPage, totalPages)
      $('.pagination-pre-' + tableId).addClass('no-pag')
    } else {
      currentRows = data.slice(currentStart, currentEnd)
      table(currentRows, {'tableDiv': '#' + tableId})
      setPreNext('#' + tableId, currentPage, currentPage, totalPages)
    }
  })
}

function setPreNext (targetDiv, currentPage, currentPage1, totalPages, data, pagination) {
  var tableId = targetDiv.slice(1)
  $(targetDiv).append("<div id='Pagination' pageno='" + currentPage + "'" + "class='table-pagination'>Showing page "
    + currentPage + ' of ' + totalPages + " <a class='pagination-pre-" + tableId + "'>Previous</a>" +
    " <a class='pagination-next-" + tableId + "'>Next</a></p></div>")
}

function writePreNext (targetDiv, currentPage, currentPage1, totalPages, data, pagination) {
  var tableId = targetDiv.slice(1)
  $(targetDiv).append("<div id='Pagination' pageno='" + currentPage + "'" + "class='table-pagination'>Showing page "
    + currentPage + ' of ' + totalPages + " <a class='pagination-pre-" + tableId + "'>Previous</a>" +
    " <a class='pagination-next-" + tableId + "'>Next</a></p></div>")
  setPagClicks(data, tableId, currentPage, pagination, totalPages)
}

function clearPreNext () {
  $('.table-pagination').attr('display', 'none')
}

function table (data, opts) {
  var templateID = ''
  if (opts.templateID) {
    templateID = opts.templateID.replace('#', '')
  } else {
    templateID = opts.tableDiv.replace('#', '') + '_template'
  }
  var template = $(templateID)
  var tableContents = ich[templateID]({rows: data})
  $(opts.tableDiv).html(tableContents)
}

module.exports.initiateTableFilter = initiateTableFilter
module.exports.searchTable = searchTable
module.exports.sortThings = sortThings
module.exports.resolveDataTitle = resolveDataTitle
module.exports.initiateTableSorter = initiateTableSorter
module.exports.makeTable = makeTable
module.exports.setPagClicks = setPagClicks
module.exports.setPreNext = setPreNext
module.exports.writePreNext = writePreNext
module.exports.clearPreNext = clearPreNext
module.exports.table = table
