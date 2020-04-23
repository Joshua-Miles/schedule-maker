const { DateTime, Duration } = luxon
const fileInput = document.querySelector('.file-input')
const startInput = document.querySelector('.start-input')
const calendarInput = document.querySelector('.calendar-input')
const lectureHallInput = document.querySelector('.lecture-hall-input')
const instructorEmailInput = document.querySelector('.instructor-email-input')
const progressContainer = document.querySelector('.progress-container')
const progressMessage = document.querySelector('.progress-message')
const progressBar = document.querySelector('.progress-bar')
const submitButton = document.querySelector('.submit-button')

const sleep = time => new Promise(resolve => setTimeout(resolve, time))

let startDate, calendarId, icsEvents, lectureHall, instructorEmail;

startInput.addEventListener('change', e => {
    startDate = DateTime.fromString(e.target.value, 'yyyy-MM-dd')
})

calendarInput.addEventListener('change', e => {
    calendarId = e.target.value
})

// lectureHallInput.addEventListener('change', e => {
//     lectureHall = e.target.value
// })

// instructorEmailInput.addEventListener('change', e => {
//     instructorEmail = e.target.value
// })

fileInput.addEventListener('change', async e => {
    const icsString = await parseFile(e)
    icsEvents = icsToJson(icsString)
})

submitButton.addEventListener('click', async () => {
    const translate = createTranslator(icsEvents[0])
    const gCalEvents = icsEvents.map(({ summary, description, location, startDate, endDate }) => ({
        summary,
        description,
        start: {
            dateTime: translate(startDate),
            timeZone: 'America/Chicago'
        },
        end: {
            dateTime: translate(endDate),
            timeZone: 'America/Chicago'
        },
        attendees: getAttendeesFor(summary)
    }))

    progressContainer.style.display = 'block'
    submitButton.disabled = true
    for (let index in gCalEvents) {
        let event = gCalEvents[index]
        progressMessage.innerText = `Copying: ${event.summary}`
        progressBar.style.width = `${index / gCalEvents.length * 100}%`
        let tries = 0
        while (tries < 5) {
            try {
                await createEvent(event)
                break;
            } catch (err) {
                tries++
                progressMessage.innerText = `Retrying (${tries}): ${event.summary}`
                await sleep(500)
            }
        }
    }
    submitButton.disabled = false
    progressContainer.style.display = 'none'
})


const createTranslator = (firstEvent) => {
    let formerStartDate = DateTime.fromISO(firstEvent.startDate)
    let offsetDuration = Duration.fromObject({ weeks: Math.round(startDate.diff(formerStartDate).shiftTo('weeks').weeks) })
    return formerTimeString => {
        let formerTime = DateTime.fromISO(formerTimeString)
        return formerTime.plus(offsetDuration).toJSDate()
    }
}

const getAttendeesFor = (summary) => {
    let attendees = []
    if (summary.includes('Lecture')) {
        if (lectureHall) {
            attendees.push({
                email: lectureHall
            })
        }
        if (instructorEmail) {
            attendees.push({
                email: instructorEmail
            })
        }
    }
    return attendees;
}