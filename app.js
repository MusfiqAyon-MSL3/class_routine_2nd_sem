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
const teacherForm = document.getElementById('teacher-form');
const tnameInput = document.getElementById('tname');
const tsnameInput = document.getElementById('tsname');
const tphoneInput = document.getElementById('tphone');
const temailInput = document.getElementById('temail');
const tcoursesSelect = document.getElementById('tcourses');
const editShortNameInput = document.getElementById('edit-short-name');
const saveTeacherBtn = document.getElementById('save-teacher-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const resourceForm = document.getElementById('resource-form');
const appNameSelect = document.getElementById('app-name');
const resourceTitleInput = document.getElementById('resource-title');
const resourceLinkInput = document.getElementById('resource-link');
const resourceList = document.getElementById('resource-list');

// ===== DATA STRUCTURES =====

let teachersData = {}; // key: shortName, value: {fullName, phone, email, courses: []}
let resourcesData = []; // array of {appName, title, link}

// ===== HELPERS =====

function saveTeachersToStorage() {
  localStorage.setItem('teachersData', JSON.stringify(teachersData));
}

function loadTeachersFromStorage() {
  const data = localStorage.getItem('teachersData');
  return data ? JSON.parse(data) : {};
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
  clearTeacherForm();
  clearResourceForm();
}

function clearTeacherForm() {
  teacherForm.reset();
  editShortNameInput.value = '';
  cancelEditBtn.classList.add('hidden');
  saveTeacherBtn.textContent = 'Save';
  clearCoursesSelection();
}

function clearResourceForm() {
  resourceForm.reset();
  resourceForm.removeAttribute('data-edit-index');
}

function clearCoursesSelection() {
  Array.from(tcoursesSelect.options).forEach(opt => (opt.selected = false));
}

// ===== RENDERERS =====

function renderTeacherList() {
  teacherList.innerHTML = '';
  if (Object.keys(teachersData).length === 0) {
    teacherList.innerHTML = '<li>No teachers added yet.</li>';
    return;
  }
  Object.entries(teachersData).forEach(([shortName, teacher]) => {
    const li = document.createElement('li');
    li.className = 'teacher-item';

    const coursesText = teacher.courses.length ? teacher.courses.join(', ') : 'No courses assigned';

    li.innerHTML = `
      <strong>${teacher.fullName} (${shortName})</strong><br/>
      Phone: ${teacher.phone || '-'}<br/>
      Email: ${teacher.email || '-'}<br/>
      Courses: ${coursesText}<br/>
      <button class="edit-teacher-btn btn-secondary">Edit</button>
      <button class="delete-teacher-btn btn-danger">Delete</button>
    `;

    // Edit
    li.querySelector('.edit-teacher-btn').addEventListener('click', () => {
      loadTeacherIntoForm(shortName);
    });

    // Delete
    li.querySelector('.delete-teacher-btn').addEventListener('click', () => {
      if (confirm(`Delete teacher "${teacher.fullName}"?`)) {
        delete teachersData[shortName];
        saveTeachersToStorage();
        renderTeacherList();
      }
    });

    teacherList.appendChild(li);
  });
}

function renderResourceList() {
  resourceList.innerHTML = '';
  if (resourcesData.length === 0) {
    resourceList.innerHTML = '<li>No resources added yet.</li>';
    return;
  }
  resourcesData.forEach((res, idx) => {
    const li = document.createElement('li');
    li.className = 'resource-item';

    const icon = getAppIcon(res.appName);

    li.innerHTML = `
      <span class="resource-icon">${icon}</span>
      <a href="${res.link}" target="_blank" class="resource-link">${res.title}</a> (${res.appName})
      <button class="edit-resource-btn btn-secondary">Edit</button>
      <button class="delete-resource-btn btn-danger">Delete</button>
    `;

    li.querySelector('.edit-resource-btn').addEventListener('click', () => {
      loadResourceIntoForm(idx);
    });

    li.querySelector('.delete-resource-btn').addEventListener('click', () => {
      if (confirm(`Delete resource "${res.title}"?`)) {
        resourcesData.splice(idx, 1);
        saveResourcesToStorage();
        renderResourceList();
      }
    });

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

// ===== LOAD INTO FORMS =====

function loadTeacherIntoForm(shortName) {
  const teacher = teachersData[shortName];
  if (!teacher) return;

  tnameInput.value = teacher.fullName;
  tsnameInput.value = shortName;
  tphoneInput.value = teacher.phone || '';
  temailInput.value = teacher.email || '';

  clearCoursesSelection();
  teacher.courses.forEach(courseName => {
    Array.from(tcoursesSelect.options).forEach(opt => {
      if (opt.value === courseName) {
        opt.selected = true;
      }
    });
  });

  editShortNameInput.value = shortName;
  saveTeacherBtn.textContent = 'Update';
  cancelEditBtn.classList.remove('hidden');

  openModal(modals.teachers);
}

function loadResourceIntoForm(index) {
  const res = resourcesData[index];
  if (!res) return;

  appNameSelect.value = res.appName;
  resourceTitleInput.value = res.title;
  resourceLinkInput.value = res.link;
  resourceForm.setAttribute('data-edit-index', index);

  openModal(modals.info);
}

// ===== FORM HANDLERS =====

teacherForm.addEventListener('submit', e => {
  e.preventDefault();

  const fullName = tnameInput.value.trim();
  const shortName = tsnameInput.value.trim();
  const phone = tphoneInput.value.trim();
  const email = temailInput.value.trim();
  const selectedCourses = Array.from(tcoursesSelect.selectedOptions).map(o => o.value);

  if (!fullName || !shortName || selectedCourses.length === 0) {
    alert('Please fill all required fields and select at least one course.');
    return;
  }

  if (editShortNameInput.value && editShortNameInput.value !== shortName) {
    // Rename key if shortName changed
    if (teachersData[shortName]) {
      alert('Short Name already exists. Use a unique one.');
      return;
    }
    delete teachersData[editShortNameInput.value];
  }

  teachersData[shortName] = {
    fullName,
    phone,
    email,
    courses: selectedCourses,
  };

  saveTeachersToStorage();
  renderTeacherList();
  clearTeacherForm();
  closeModal(modals.teachers);
});

cancelEditBtn.addEventListener('click', e => {
  e.preventDefault();
  clearTeacherForm();
});

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
  if (editIndex !== null) {
    // Update existing
    resourcesData[editIndex] = { appName, title, link };
  } else {
    // Add new
    resourcesData.push({ appName, title, link });
  }

  saveResourcesToStorage();
  renderResourceList();
  clearResourceForm();
  closeModal(modals.info);
});

// ===== ROUTINE MODAL LOGIC =====

// ম্যাপিং: কোর্স কোড -> ফুল কোর্স নাম ও ক্রেডিট
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
  cell.addEventListener('click', () => {
    const courseCode = cell.getAttribute('data-course');
    if (!courseCode) return;

    // কোর্স ডিটেইলস নাও
    const courseDetails = courseCodeMap[courseCode];
    if (!courseDetails) return;

    // রুম নাম
    let room = cell.textContent.split('#')[1]?.trim() || 'Room not specified';

    // টাইম
    let time = cell.getAttribute('data-time') || '';

    // শিক্ষক খুঁজো - teachersData থেকে যাদের courses এর মধ্যে কোর্স টা আছে
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

// ESC key to close all modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    Object.values(modals).forEach(modal => {
      if (!modal.classList.contains('hidden')) {
        closeModal(modal);
      }
    });
  }
});
