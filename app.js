// ===== GLOBAL VARIABLES =====

const routineTable = document.getElementById('routine');
const routineCells = routineTable.querySelectorAll('td[data-course]');

const modals = {
  routine: document.getElementById('modal'),
  info: document.getElementById('info-modal'),
  teachers: document.getElementById('teachers-modal'),
  developer: document.getElementById('developer-modal'),
  courses: document.getElementById('courses-modal'),
};

const buttons = {
  print: document.getElementById('print-btn'),
  openInfo: document.getElementById('open-info'),
  openTeachers: document.getElementById('open-teachers'),
  openDeveloper: document.getElementById('open-developer'),
  openCourses: document.getElementById('open-courses'),
  portal: document.querySelector('.portal-btn'),
};

const routineTitle = document.getElementById('routine-modal-title');
const routineRoom = document.getElementById('routine-modal-room');
const routineTeacher = document.getElementById('routine-modal-teacher');
const routineTime = document.getElementById('routine-modal-time');

const teacherList = document.getElementById('teacher-list');

const resourceForm = document.getElementById('resource-form');
const appNameSelect = document.getElementById('app-name');
const resourceTitleInput = document.getElementById('resource-title');
const resourceLinkInput = document.getElementById('resource-link');
const resourceList = document.getElementById('resource-list');

// ===== DATA STRUCTURES =====

// Teachers data: shortName -> { fullName, phone, email, courses: [] }
let teachersData = {
  "NHR": {
    fullName: "Mohammed Nur Hassan Raja",
    phone: "+8801673830931",
    email: "",
    courses: ["English Language Skills"]
  },
  "MUT": {
    fullName: "Monowar Uddin Talukdar",
    phone: "+8801718650131",
    email: "",
    courses: ["Fundamental of Accounting"]
  },
  "IH": {
    fullName: "Iftekhar Haider",
    phone: "+8801741718424",
    email: "",
    courses: [
      "Electronics Devices and Circuits",
      "Electronics Devices and Circuits Sessional"
    ]
  },
  "FAS": {
    fullName: "Foysal Ahmed Shipon",
    phone: "+8801632581306",
    email: "",
    courses: [
      "Differential Equations and Coordinate Geometry",
      "Discrete Mathematics"
    ]
  },
  "TAP": {
    fullName: "Tanzila Akter Pushpu",
    phone: "+8801738462900",
    email: "",
    courses: [
      "Structured Programming Language",
      "Structured Programming Language Sessional"
    ]
  }
};

// Resources data: array of { appName, title, link }
let resourcesData = [];

// ===== HELPERS =====

function saveTeachersToStorage() {
  localStorage.setItem('teachersData', JSON.stringify(teachersData));
}

function loadTeachersFromStorage() {
  const data = localStorage.getItem('teachersData');
  return data ? JSON.parse(data) : teachersData;
}

function saveResourcesToStorage() {
  localStorage.setItem('resourcesData', JSON.stringify(resourcesData));
}

function loadResourcesFromStorage() {
  const data = localStorage.getItem('resourcesData');
  return data ? JSON.parse(data) : [];
}

function openModal(modal) {
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function clearResourceForm() {
  resourceForm.reset();
  resourceForm.removeAttribute('data-edit-index');
}

// ===== RENDERERS =====

function renderTeacherList() {
  teacherList.innerHTML = '';
  if (Object.keys(teachersData).length === 0) {
    teacherList.innerHTML = '<li>No teachers added yet.</li>';
    return;
  }
  for (const [shortName, teacher] of Object.entries(teachersData)) {
    const li = document.createElement('li');
    li.innerHTML = `<strong>${shortName}</strong> – ${teacher.fullName} <br/> 📞 <a href="tel:${teacher.phone}">${teacher.phone}</a>`;
    teacherList.appendChild(li);
  }
}

function renderResourceList() {
  resourceList.innerHTML = '';
  if (resourcesData.length === 0) {
    resourceList.innerHTML = '<li>No resources added yet.</li>';
    return;
  }
  resourcesData.forEach(res => {
    const li = document.createElement('li');
    li.innerHTML = `${getAppIcon(res.appName)} <a href="${res.link}" target="_blank">${res.title}</a> (${res.appName})`;
    resourceList.appendChild(li);
  });
}

function getAppIcon(appName) {
  switch (appName) {
    case 'Facebook': return '📘';
    case 'WhatsApp': return '📱';
    case 'Instagram': return '📸';
    case 'Website': return '🌐';
    default: return '🔗';
  }
}

// ===== ROUTINE MODAL LOGIC =====

// কোর্স কোড -> ফুল নাম ও ক্রেডিট ম্যাপিং
const courseCodeMap = {
  "ENG 0131-1294": { title: "English Language Skills", credit: 3 },
  "HUM 0411-1295": { title: "Fundamental of Accounting", credit: 3 },
  "EEE 0714-1279": { title: "Electronics Devices and Circuits", credit: 3 },
  "MAT 0541-1284": { title: "Differential Equations and Coordinate Geometry", credit: 3 },
  "CSE 0611-1203": { title: "Discrete Mathematics", credit: 2 },
  "CSE 0613-1205": { title: "Structured Programming Language", credit: 3 },
  "CSE 0613-1206": { title: "Structured Programming Language Sessional", credit: 1 },
};

routineCells.forEach(cell => {
  cell.style.cursor = 'pointer'; // show pointer on hover

  cell.addEventListener('click', () => {
    const courseCode = cell.getAttribute('data-course');
    if (!courseCode) return;

    const courseDetails = courseCodeMap[courseCode];
    if (!courseDetails) return;

    let room = (cell.textContent.split('#')[1] || '').trim();
    if (!room) room = 'Room not specified';

    let time = cell.getAttribute('data-time') || '';

    // যেই শিক্ষক কোর্সের সাথে মিলে যায় তাদের নাম সংগ্রহ
    let assignedTeachers = [];
    for (const [shortName, teacher] of Object.entries(teachersData)) {
      if (teacher.courses.includes(courseDetails.title)) {
        assignedTeachers.push(`${teacher.fullName} (${shortName})`);
      }
    }

    routineTitle.textContent = `${courseCode} - ${courseDetails.title}`;
    routineRoom.textContent = `Room: ${room}`;
    routineTime.textContent = `Time: ${time}`;
    routineTeacher.textContent = assignedTeachers.length
      ? `Teacher(s): ${assignedTeachers.join(', ')}`
      : 'Teacher(s): Not assigned';

    openModal(modals.routine);
  });
});

// ===== OPEN MODALS BUTTONS =====

buttons.openInfo.addEventListener('click', () => openModal(modals.info));
buttons.openTeachers.addEventListener('click', () => openModal(modals.teachers));
buttons.openDeveloper.addEventListener('click', () => openModal(modals.developer));
buttons.openCourses.addEventListener('click', () => openModal(modals.courses));
buttons.print.addEventListener('click', () => window.print());

// ===== CLOSE MODALS WHEN CLICKING OUTSIDE =====

Object.values(modals).forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
});

// ===== LOAD DATA ON PAGE LOAD =====

function init() {
  teachersData = loadTeachersFromStorage();
  resourcesData = loadResourcesFromStorage();

  renderTeacherList();
  renderResourceList();
}

init();

// ESC key closes all modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    Object.values(modals).forEach(modal => {
      if (!modal.classList.contains('hidden')) {
        closeModal(modal);
      }
    });
  }
});

// ===== RESOURCE FORM =====

resourceForm.addEventListener('submit', e => {
  e.preventDefault();

  const appName = appNameSelect.value;
  const title = resourceTitleInput.value.trim();
  const link = resourceLinkInput.value.trim();

  if (!appName || !title || !link) {
    alert('Please fill all resource fields.');
    return;
  }

  const editIndex = resourceForm.getAttribute('data-edit-index');

  if (editIndex !== null && editIndex !== undefined) {
    resourcesData[editIndex] = { appName, title, link };
  } else {
    resourcesData.push({ appName, title, link });
  }

  saveResourcesToStorage();
  renderResourceList();
  clearResourceForm();
  closeModal(modals.info);
});

resourceForm.addEventListener('reset', e => {
  e.preventDefault();
  clearResourceForm();
});
