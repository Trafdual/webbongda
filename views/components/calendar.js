// Set up initial month and year
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Load calendar for the current month and year
function loadCalendar() {
  const monthYear = document.getElementById('monthYear');
  monthYear.innerText = `${currentMonth + 1} / ${currentYear}`;
  
  // Example of loading days with notes from localStorage
  const calendarGrid = document.querySelector('.calendar-grid');
  calendarGrid.innerHTML = ''; // Clear current grid

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${currentMonth + 1}-${day}`;
    const note = localStorage.getItem(dateStr) || '';

    const dayCell = document.createElement('div');
    dayCell.classList.add('day-cell');
    dayCell.onclick = () => openNoteModal(dateStr);
    dayCell.innerHTML = `<span>${day}</span><div class="note">${note}</div>`;
    calendarGrid.appendChild(dayCell);
  }
}

// Change to previous or next month
function previousMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  loadCalendar();
}

function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  loadCalendar();
}

// Modal functionality for adding notes
let selectedDate = '';

function openNoteModal(date) {
  selectedDate = date;
  document.getElementById('selectedDate').innerText = date;
  document.getElementById('noteInput').value = localStorage.getItem(date) || '';
  document.getElementById('noteModal').style.display = 'flex';
}

function closeNoteModal() {
  document.getElementById('noteModal').style.display = 'none';
}

function saveNote() {
  const note = document.getElementById('noteInput').value;
  localStorage.setItem(selectedDate, note);
  closeNoteModal();
  loadCalendar(); // Refresh calendar to show updated note
}

// Initialize calendar on load
loadCalendar();
