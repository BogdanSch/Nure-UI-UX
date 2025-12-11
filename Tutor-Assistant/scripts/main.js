const ROLES = { TEACHER: "teacher", STUDENT: "student" };
const TEACHER_LOGIN = "anastasia";
const CLASS_NAME = "9-А";
const STUDENTS = [
  { id: 1, name: "Новосад А.", group: CLASS_NAME },
  { id: 2, name: "Щерба В.", group: CLASS_NAME },
  { id: 3, name: "Сидорова Г.", group: CLASS_NAME },
  { id: 4, name: "Коваль І.", group: CLASS_NAME },
  { id: 5, name: "Мельник О.", group: CLASS_NAME },
];

if (!localStorage.getItem("students")) {
  localStorage.setItem("students", JSON.stringify(STUDENTS));
  localStorage.setItem("assignments", JSON.stringify([]));
  localStorage.setItem("currentUser", JSON.stringify(null));
}

let assignments = JSON.parse(localStorage.getItem("assignments"));
let students = JSON.parse(localStorage.getItem("students"));
let currentUser = JSON.parse(localStorage.getItem("currentUser"));

const authSection = document.getElementById("auth-section");
const teacherDashboard = document.getElementById("teacher-dashboard");
const studentDashboard = document.getElementById("student-dashboard");
const loginForm = document.getElementById("login-form");
const logoutBtn = document.getElementById("logout-btn");
const studentLogoutBtn = document.getElementById("student-logout-btn");
const assignmentForm = document.getElementById("assignment-form");
const assignmentsList = document.getElementById("assignments-list");
const studentAssignmentsList = document.getElementById(
  "student-assignments-list"
);
const studentGreeting = document.getElementById("student-greeting");
const assignmentFilter = document.getElementById("assignment-filter");

const renderApp = (user) => {
  authSection.classList.add("hidden");
  teacherDashboard.classList.add("hidden");
  studentDashboard.classList.add("hidden");

  if (!user) {
    authSection.classList.remove("hidden");
    return;
  }

  if (user.role === ROLES.TEACHER) {
    teacherDashboard.classList.remove("hidden");
    renderTeacherAssignments();
  } else if (user.role === ROLES.STUDENT) {
    studentDashboard.classList.remove("hidden");
    studentGreeting.textContent = `Вітаємо, ${user.username}`;
    renderStudentAssignments(user.username);
  }
};

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const role = document.getElementById("role-select").value;
  const errorDiv = document.getElementById("login-error");

  if (role === ROLES.TEACHER && username.toLowerCase() === "anastasia") {
    currentUser = { username: "Анастасія Олексіївна", role: ROLES.TEACHER };
  } else if (
    role === ROLES.STUDENT &&
    STUDENTS.some((s) => s.name === username)
  ) {
    currentUser = {
      username: username,
      role: ROLES.STUDENT,
      id: STUDENTS.find((s) => s.name === username).id,
    };
  } else {
    errorDiv.textContent =
      "Неправильні дані для входу. Введіть дійсні дані про користувача.";
    errorDiv.style.display = "block";
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  renderApp(currentUser);
});

logoutBtn.addEventListener("click", () => {
  localStorage.setItem("currentUser", JSON.stringify(null));
  currentUser = null;
  renderApp(null);
});

studentLogoutBtn.addEventListener("click", () => {
  localStorage.setItem("currentUser", JSON.stringify(null));
  currentUser = null;
  renderApp(null);
});

const assignVariants = (studentsList, maxVariant) => {
  const minVariant = 1;
  return studentsList.map((student) => {
    const randomVariant =
      Math.floor(Math.random() * (maxVariant - minVariant + 1)) + minVariant;
    return {
      studentId: student.id,
      studentName: student.name,
      variant: randomVariant,
      isSubmitted: false,
      status: "assigned",
      grade: null,
    };
  });
};

assignmentForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("assignment-title").value;
  const date = document.getElementById("deadline-date").value;
  const time = document.getElementById("deadline-time").value;
  const variantsCount = document.getElementById(
    "assignment-variants-count"
  ).value;
  const content = document.getElementById("assignment-description").value;

  const deadline = `${date}T${time}:00`;
  const newSubmissions = assignVariants(students, variantsCount);

  const newAssignment = {
    assignmentId: Date.now().toString(),
    title: title,
    group: CLASS_NAME,
    deadline: deadline,
    variantsCount: variantsCount,
    content: content,
    submissions: newSubmissions,
    createdAt: Date.now(),
    isFinished: false,
  };

  assignments.push(newAssignment);
  localStorage.setItem("assignments", JSON.stringify(assignments));

  assignmentForm.reset();

  if (assignmentFilter) {
    assignmentFilter.value = "all";
  }
  alert(
    `ДЗ "${title}" призначено ${students.length} учням 9-А. Варіанти рандомізовані.`
  );

  renderTeacherAssignments();
});

const renderTeacherAssignments = (filter = "all") => {
  assignments.sort((a, b) => b.createdAt - a.createdAt);
  assignmentsList.innerHTML = "";

  const filteredAssignments = assignments.filter((a) => {
    const isOverdue = new Date(a.deadline) < new Date();
    if (filter === "overdue") return isOverdue && !a.isFinished;
    if (filter === "active") return !isOverdue && !a.isFinished;
    if (filter === "finished") return a.isFinished;
    return true;
  });

  if (filteredAssignments.length === 0) {
    assignmentsList.innerHTML = `<p class="text-center text-muted mt-3">Немає ${
      filter === "overdue"
        ? "прострочених"
        : filter === "active"
        ? "активних"
        : filter === "finished"
        ? "завершених"
        : ""
    } завдань.</p>`;
    return;
  }

  filteredAssignments.forEach((a) => {
    const totalStudents = a.submissions.length;
    const submittedCount = a.submissions.filter((s) => s.grade !== null).length;

    const isFinished = submittedCount >= totalStudents;
    a.isFinished = isFinished;
    localStorage.setItem("assignments", JSON.stringify(assignments));

    const isOverdue = new Date(a.deadline) < new Date();
    const overdueClass = isFinished
      ? "status--complited"
      : isOverdue
      ? "status--overdue"
      : "status--assigned";
    const statusText = isFinished
      ? "Завершено"
      : isOverdue
      ? "ПРОСТРОЧЕНО"
      : "Активно";

    const cardHtml = `
                <div class="list-group-item list-group-item-action flex-column align-items-start mb-3 shadow-sm">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">${a.title} (${a.group})</h6>
                        <small class="${overdueClass}">${statusText}</small>
                    </div>
                    <p class="mb-1 small">Дедлайн: ${new Date(
                      a.deadline
                    ).toLocaleString()}</p>
                    <p class="mb-1">${a.content}</p>
                    <small>
                        Здано: ${submittedCount} / ${totalStudents} | 
                        Залишилося: ${totalStudents - submittedCount}
                    </small>
                    <div class="button-group mt-2">
                        <button class="btn btn-sm btn-info evaluate-btn" data-id="${
                          a.assignmentId
                        }">
                            <i class="fas fa-percent"></i> Оцінити
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
                          a.assignmentId
                        }">
                            <i class="fa-solid fa-trash"></i> Видалити
                        </button>
                    </div>
                    <div class="mt-2 evaluation-form" data-id="${
                      a.assignmentId
                    }" style="display:none;">
                        <ul class="list-group list-group-flush small">
                            ${a.submissions
                              .map(
                                (s) => `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    <p class="mb-1 small">${
                                      s.studentName
                                    } (Варіант: ${s.variant})</p>
                                    <p class="mb-1 small ${
                                      s.grade === null
                                        ? s.isSubmitted
                                          ? "text-primary"
                                          : "text-accent"
                                        : ""
                                    }">${
                                  s.grade === null
                                    ? s.isSubmitted
                                      ? "Надіслано на перевірку"
                                      : "Ненадіслано на перевірку"
                                    : ""
                                }</p>
                                    <div class="d-flex align-items-center">
                                        <input type="number" class="form-control form-control-sm me-2" placeholder="Оцінка" min="0" max="100" value="${
                                          s.grade !== null ? s.grade : ""
                                        }" data-student-id="${
                                  s.studentId
                                }" style="width: 70px;">
                                        ${
                                          s.grade !== null
                                            ? `<span class="badge bg-success"><i class="fas fa-check"></i></span>`
                                            : ""
                                        }
                                    </div>
                                </li>
                            `
                              )
                              .join("")}
                        </ul>
                        <button class="btn btn-sm btn-primary mt-2 save-grades-btn" data-id="${
                          a.assignmentId
                        }">
                            <i class="fas fa-save"></i> Зберегти Оцінки
                        </button>
                    </div>
                </div>
            `;
    assignmentsList.innerHTML += cardHtml;
  });

  assignmentsList.querySelectorAll(".evaluate-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      const form = assignmentsList.querySelector(
        `.evaluation-form[data-id="${id}"]`
      );

      if (!form) return;
      form.style.display = form.style.display === "none" ? "block" : "none";
      e.target.textContent =
        form.style.display === "none" ? "Оцінити" : "Закрити";
    });
  });

  assignmentsList.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      assignments = assignments.filter((a) => a.assignmentId !== id);
      localStorage.setItem("assignments", JSON.stringify(assignments));

      const assignmentBlock = assignmentsList.querySelector(
        `.evaluation-form[data-id="${id}"]`
      ).parentNode;
      if (!assignmentBlock) return;
      assignmentBlock.style.display = "none";
    });
  });

  assignmentsList.querySelectorAll(".save-grades-btn").forEach((btn) => {
    btn.addEventListener("click", saveGradesHandler);
  });
};

const saveGradesHandler = (e) => {
  const assignmentId = e.target.dataset.id;
  const assignmentIndex = assignments.findIndex(
    (a) => a.assignmentId === assignmentId
  );
  if (assignmentIndex === -1) return;

  const form = assignmentsList.querySelector(
    `.evaluation-form[data-id="${assignmentId}"]`
  );

  if (!form) return;

  form.querySelectorAll('input[type="number"]').forEach((input) => {
    const studentId = parseInt(input.dataset.studentId);
    const grade = input.value === "" ? null : parseInt(input.value);

    const submissionIndex = assignments[assignmentIndex].submissions.findIndex(
      (s) => s.studentId === studentId
    );
    if (submissionIndex !== -1) {
      assignments[assignmentIndex].submissions[submissionIndex].grade = grade;
      assignments[assignmentIndex].submissions[submissionIndex].status =
        grade !== null ? "submitted" : "assigned";
    }
  });

  localStorage.setItem("assignments", JSON.stringify(assignments));
  renderTeacherAssignments(assignmentFilter.value);
  alert("Оцінки успішно збережено!");
};

assignmentFilter?.addEventListener("change", (e) => {
  renderTeacherAssignments(e.target.value);
});

const renderStudentAssignments = (studentName) => {
  studentAssignmentsList.innerHTML = "";

  const student = students.find((s) => s.name === studentName);
  if (!student) return;

  assignments.forEach((a) => {
    const submission = a.submissions.find((s) => s.studentId === student.id);
    if (!submission) return;

    const isSubmitted = submission.isSubmitted;
    const isOverdue = new Date(a.deadline) < new Date();
    const statusClass =
      submission.grade !== null || isSubmitted
        ? "status--submitted"
        : isOverdue
        ? "status--overdue"
        : "status--assigned";
    const statusText =
      submission.grade !== null
        ? `Оцінка: ${submission.grade}`
        : isSubmitted
        ? "Надіслано на перевірку"
        : isOverdue
        ? "ПРОСТРОЧЕНО"
        : "Активне";

    const cardHtml = `
                <div class="col-md-6 mb-4">
                    <div class="card h-100 shadow-sm card--${
                      submission.status
                    }">
                        <div class="card-body">
                            <h5 class="card-title">${a.title}</h5>
                            <p class="card-text small mb-3">Ваш варіант: <strong>${
                              submission.variant
                            }</strong></p>
                            <p class="card-text small mb-3">
                              ${a.content}
                            </p>
                            <p class="card-text small mb-1">Дедлайн: ${new Date(
                              a.deadline
                            ).toLocaleString("uk-UA", {
                              year: "numeric",
                              month: "numeric",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })}</p>
                            <p class="card-text small mb-0">Статус: <span class="${statusClass}">${statusText}</span></p>
                            <button class="btn btn-sm btn-primary mt-4 mark-finished-btn${
                              isSubmitted || submission.grade ? " hidden" : ""
                            }" data-id="${a.assignmentId}">
                                <i class="fa-solid fa-check"></i> Надіслати на перевірку
                            </button>
                        </div>
                    </div>
                </div>
            `;
    studentAssignmentsList.innerHTML += cardHtml;
  });

  studentAssignmentsList
    .querySelectorAll(".mark-finished-btn")
    .forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.dataset.id;

        const currentAssignment = assignments.find(
          (a) => a.assignmentId === id
        );
        if (!currentAssignment) return;
        const submission = currentAssignment.submissions.find(
          (s) => s.studentId === student.id
        );
        if (!submission) return;

        submission.isSubmitted = true;
        localStorage.setItem("assignments", JSON.stringify(assignments));

        location.reload();
        // btn.textContent = "Надіслано на перевірку";
      });
    });

  if (studentAssignmentsList.innerHTML === "") {
    studentAssignmentsList.innerHTML = `<p class="text-center text-muted mt-3">У Вас немає активних завдань.</p>`;
  }
};

renderApp(currentUser);
