const STORAGE_KEY = 'nexatechCalendarEvents'

let calendar

function loadEvents() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		return raw ? JSON.parse(raw) : []
	} catch {
		return []
	}
}

function saveEvents() {
	if (!calendar) {
		return
	}
	const events = calendar.getEvents().map((event) => ({
		id: event.id,
		calendarId: event.calendarId,
		title: event.title,
		start: event.start.toISOString(),
		end: event.end.toISOString(),
		isAllday: event.isAllday,
	}))
	localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
}

function hydrateEvents(events) {
	return events.map((event) => ({
		...event,
		start: new Date(event.start),
		end: new Date(event.end),
	}))
}

function updateRange() {
	if (!calendar) {
		return
	}
	const formatter = new Intl.DateTimeFormat(undefined, {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	})
	const start = calendar.getDateRangeStart()
	const end = calendar.getDateRangeEnd()
	document.getElementById('calRange').textContent = `${formatter.format(start)} – ${formatter.format(end)}`
}

function initCalendar() {
	const CalendarClass = window.tui?.Calendar
	const root = document.getElementById('calendar')

	if (!CalendarClass) {
		root.innerHTML = '<p class="error">Calendar could not load. Please refresh the page.</p>'
		return
	}

	const stored = hydrateEvents(loadEvents())

	calendar = new CalendarClass(root, {
		defaultView: 'month',
		usageStatistics: false,
		isReadOnly: false,
		useFormPopup: true,
		useDetailPopup: true,
		week: { startDayOfWeek: 1 },
		calendars: [
			{
				id: 'default',
				name: 'Events',
				backgroundColor: '#2d5a4a',
				borderColor: '#2d5a4a',
				dragBackgroundColor: '#3d7a64',
			},
		],
	})

	if (stored.length) {
		calendar.createEvents(stored)
	}

	;['beforeCreateEvent', 'beforeUpdateEvent', 'beforeDeleteEvent'].forEach((name) => {
		calendar.on(name, () => {
			setTimeout(saveEvents, 0)
		})
	})

	updateRange()

	document.getElementById('calPrev').addEventListener('click', () => {
		calendar.prev()
		updateRange()
	})
	document.getElementById('calNext').addEventListener('click', () => {
		calendar.next()
		updateRange()
	})
	document.getElementById('calToday').addEventListener('click', () => {
		calendar.today()
		updateRange()
	})
	document.getElementById('calView').addEventListener('change', (e) => {
		calendar.changeView(e.target.value)
		updateRange()
	})

	window.addEventListener('resize', () => calendar.render())
}

function setCalendarHeight() {
	const root = document.getElementById('calendar')
	const toolbar = document.querySelector('.toolbar')
	const credit = document.querySelector('.credit')
	const height = window.innerHeight - toolbar.offsetHeight - credit.offsetHeight
	root.style.height = `${Math.max(height, 400)}px`
}

window.addEventListener('DOMContentLoaded', () => {
	setCalendarHeight()
	initCalendar()
})

window.addEventListener('resize', setCalendarHeight)
