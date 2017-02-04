// JavaScript code for the app.
// The code is inside a closure to avoid polluting the global scope.
;(function()
{

// Timer that fetches data.
var mUpdateTimer = null

function main()
{
  $(function()
  {
    // When document has loaded we attach FastClick to
    // eliminate the 300 ms delay on click events.
    FastClick.attach(document.body)

    // Event listener for Back button.
    $('.app-back').on('click', function() { history.back() })

    // Call device ready directly (this app can work without Cordova).
    onDeviceReady()
  })
}

function onDeviceReady()
{
  // Un-gray buttons.
  $('button.app-start')
    .removeClass('mdl-button--disabled')
    .addClass('mdl-color--green-A700')
  $('button.app-stop')
    .removeClass('mdl-button--disabled')
    .addClass('mdl-color--deep-orange-900')

  // Attach event listeners.
  $('.app-start').on('click', onStart)
  $('.app-stop').on('click', onStop)

  $('.app-show-graph').on('click', onShowGraph)
  $('.app-show-table').on('click', onShowTable)

  // Show initial page.
  //setTimeout(onShowMap, 100)
}

function onStart()
{
  clearUpdateTimer()

  // Start update timer with interval in milliseconds.
  mUpdateTimer = setInterval(fetchSensorData, 10000)

  // Do first fetch directly.
  fetchSensorData()

  // Update UI.
  showMessage('Fetching data')
}

function onStop()
{
  clearUpdateTimer()

  // Update UI.
  showMessage('Stopped fetching data')
}

function clearUpdateTimer()
{
  // Stop update timer.
  if (mUpdateTimer)
  {
    clearInterval(mUpdateTimer)
    mUpdateTimer = null
  }
}

function onShowGraph()
{
  $('.app-page-table').hide()
  $('.app-page-graph').show()
  hideDrawerIfVisible()
}

function onShowTable()
{
  $('.app-page-graph').hide()
  $('.app-page-table').show()
  hideDrawerIfVisible()
}


function hideDrawerIfVisible()
{
  if ($('.mdl-layout__drawer').hasClass('mdl-layout__drawer is-visible'))
  {
    document.querySelector('.mdl-layout').MaterialLayout.toggleDrawer()
  }
}

function showMessage(message)
{
  document.querySelector('.mdl-snackbar').MaterialSnackbar.showSnackbar(
  {
    message: message
  })
}

function fetchSensorData()
{
  // This is the URL to the sensor data.
  var url = 'http://smartspaces.r1.kth.se:8082/output/' +
    'J3Wgj9qegGFX4r9KlxxGfaeMXQB.json?limit=50'

  $.ajax({
    url: url,
    jsonp: 'callback',
    cache: true,
    dataType: 'jsonp',
    success: function(response)
    {
      if (response)
      {
        updateSensorData(response)
      }
    }
  })
}

/**
 * @param data Array with samples.
 */
function updateSensorData(data)
{
  // Show max 50 data points.
  if (data.length > 50) { data = data.slice(0,50) }

  // Update graphs (update while hidden causes Flotr error).
  if ($('.app-page-graph').is(':visible')) { updateGraphs(data) }

  // Update table.
  updateTable(data)
}

/**
 * @param data Array with samples.
 */
function updateGraphs(data)
{
  // Arrays that collect samples.
  var samplesC = []
  var samplesH = []
  var samplesT = []

  // Collect samples in a format suitable for graph drawing.
  for (var i in data)
  {
    try
    {
      // Get next sample.
      var sample = data[i]

      // Set timestamp.
      var timestamp = new Date(sample.timestamp).getTime()

      // Add sample.
      samplesC.push([timestamp, sample.c])
      samplesH.push([timestamp, sample.h])
      samplesT.push([timestamp, sample.t])
    }
    catch (error)
    {
      console.log('Error updating sensor data: ' + error)
    }
  }

  // Update graphs.
  updateGraph('graph-c', 'c', samplesC)
  updateGraph('graph-h', 'h', samplesH)
  updateGraph('graph-t', 't', samplesT)
}

function updateGraph(graphID, label, samples)
{
  // Draw sensor data.
  drawGraph(
    document.getElementById(graphID),
    samples,
    label)
}

function drawGraph(container, data, title)
{
  var options =
  {
      xaxis: { mode: 'time' },
      HtmlText: false,
      title: title
  }
  Flotr.draw(container, [data], options)
}

function updateTable(data)
{
  var html = '<table>'

  // Header row.
  html += '<tr class="table-header"><td>c</td><td>h</td><td>t</td><td>timestamp</td></tr>'

  // Data rows.
  for (var i in data)
  {
    // Get next sample.
    var sample = data[i]

    html += '<tr>'
    html += '<td>' + sample.c + '</td>'
    html += '<td>' + sample.h + '</td>'
    html += '<td>' + sample.t + '</td>'
    html += '<td>' + sample.timestamp + '</td>'
    html += '</tr>'
  }

  html += '</table>'

  $('#sensor-table').html(html)
}

// Call main function to initialise app.
main()

})();
