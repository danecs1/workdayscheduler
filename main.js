//configuration for the app
const config = {
  businessHours: {
    // time where business hours should start
    start: "9:00",
    // time where business hours should end
    end: "5:00 pm",

    // timeframe between rows (in this case, 60 minutes)
    gridDistance: 60,
  },

  // displays the current date on the top of the screen as a
  // string
  currentDateOnDisplay: null
};

const schedulder = {};

// Code used to show calender once open// 
$(function () {
  //this loads the calendar and applies logic when we do click on it
  $("#datepicker").datepicker({
    onSelect: function (dateText, instance) {
      var selectedDate = moment(
        {
          years: instance.currentYear,
          months: instance.currentMonth,
          days: instance.currentDay
        }
      ).format('MM/DD/yyyy')
      buildUI(selectedDate)
    }
  })

  // we build the ui given the current date by default
  const onLoadDate = moment(new Date()).format('MM/DD/yyyy')

  // runs the UI based on the date we want to use, in this case the one above.
  buildUI(onLoadDate)

});

function buildUI(date) {
  // we default the current date to the date passed to this function
  config.currentDateOnDisplay = date

  // we update the date string on the top of the screen
  LabelCurrentDate(config.currentDateOnDisplay)

  // we load from storage the date we want to use
  var tempScheduler = localStorage.getItem(config.currentDateOnDisplay)

  // if there is data...
  if (tempScheduler) {
    // convert the string information for that day into its previous JSON format
    tempScheduler = JSON.parse(tempScheduler)
    // and apply that data for that day.
    schedulder[config.currentDateOnDisplay] = tempScheduler
  } else {
    // if no data, leave things empty
    schedulder[config.currentDateOnDisplay] = {}
  }

  // finally build the grid
  buildGrid()
}

// This changes the date on the top of the screen 
function LabelCurrentDate(date) {
  $("#currentDay").html(moment(date).format('MMMM dddd DD YYYY'))
}

//function that returns an html Element for the list of events
function eventTemplate(time, event) {

  return `
<div class="row m-0" data-ms="${time}">
  <div class="col-10 pl-0 pt-1 pr-1">  
    <div class="input-group input-group-sm" data-ms="${time}">
      <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon1">${time}</span>
      </div>
      <input
        type="text"
        class="form-control eventDetails"
        placeholder="Enter Event Name"
        value="${event}"
      />
    </div>
  </div>
  <div class="col-2  pl-0 pt-1 pr-1"><button
  type="button"
  class="saveButton btn btn-primary btn-sm btn-block">
  Save
</button></div>
</div>`
}

// This function builds the grid that is going to be shown on the scheduler
function buildGrid() {
  //scale will determine how many minutes we should add to the 
  //currentSlot
  var scale = 0

  //initial value of the slot, it will return us the time we should point
  //on the first slot. Note that 2013 is a mock date where we can use to build
  //the time format we want to show.
  var currentSlot = moment(`2013-01-01 ${config.businessHours.start}`)
    .add(scale, 'minutes')
    .format('hh:mm a')

  //startHour will take the value of a HH format hour (00 to 23) as as string
  //to later be parse as integer
  var startHour = parseInt(moment(`2013-01-01 ${config.businessHours.start}`)
    .format('HH'))

  //endHour is an Interger Value from the HH string format hour
  var endHour = parseInt(moment(`2013-01-01 ${config.businessHours.end}`)
    .format('HH'))

  // arrayOfTimes will contain the grid of times
  var arrayOfTimes = []

  //do while startHour is minor or equals to endHour
  while (startHour <= endHour) {

    // this fetches from the scheduler from the currentday on display,
    // on the current slot, the text stored on that slot. if there is not data, it should use an empty string
    var textEvent = schedulder[config.currentDateOnDisplay][currentSlot] || ""

    // we push the current slot into the array
    arrayOfTimes.push(eventTemplate(currentSlot, textEvent))

    // update the value of the scale for the next iteration
    scale += config.businessHours.gridDistance

    // update the current slot time for the next iteration
    currentSlot = moment(`2013-01-01 ${config.businessHours.start}`)
      .add(scale, 'minutes')
      .format('hh:mm a')

    // update the currentValue of the slot for the next iteration
    startHour = parseInt(moment(`2013-01-01 ${config.businessHours.start}`)
      .add(scale, 'minutes')
      .format('HH'))
  }

  // since ArrayOfTimes is an array of HTML string values, we want to
  // convert them into  a whole string by using .join('') (this is a
  // property of an arrau)
  $("#gridTimes").html(arrayOfTimes.join(''))

  //every time we hit the save button we do this:
  $(".saveButton").click(function (event) {

    // 1. find the eventDetails value given the current tartget
    var eventDetails = $(event.currentTarget)
      .closest('div[data-ms]') // look into jquery API Manual on how this works
      .find('.eventDetails').val()

    //2. find the time that is applied on the data of the parent
    var timeString = $(event.currentTarget)
      .closest('div[data-ms]') //it will look for a div with an attribute data-ms
      .data('ms') //get the value of ms

    // if somehow the scheduler with the currentDate  with display is unset, set one.
    if (!schedulder[config.currentDateOnDisplay]) {
      schedulder[config.currentDateOnDisplay] = {}
    }

    //then apply the value of the event to that current date, on the selected time
    schedulder[config.currentDateOnDisplay][timeString] = eventDetails
    // save on the currentDate, all the schedule of that date
    // in JSON String Format
    var scheduleDayString = JSON.stringify(schedulder[config.currentDateOnDisplay])

    localStorage.setItem(config.currentDateOnDisplay, scheduleDayString)
  })

}