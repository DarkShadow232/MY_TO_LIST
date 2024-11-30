// استدعاء العناصر من DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksGroups = document.getElementById('tasks-groups');
const tasksCount = document.getElementById('tasks-count');
const clearCompletedBtn = document.getElementById('clear-completed');
const filterBtns = document.querySelectorAll('.filter-btn');
const generateTasksBtn = document.getElementById('generate-tasks-btn');
const aiModal = document.getElementById('ai-modal');
const generatedTasksContainer = document.getElementById('generated-tasks');
const addSelectedTasksBtn = document.getElementById('add-selected-tasks');
const closeModalBtn = document.getElementById('close-modal');

// تهيئة معلومات المستخدم
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
document.getElementById('profile-name').textContent = currentUser.name;
document.getElementById('profile-email').textContent = currentUser.email;
document.getElementById('profile-image').textContent = currentUser.name.charAt(0).toUpperCase();

// تهيئة المصفوفة التي ستخزن المهام
const defaultTasks = [
    {
        name: "مهام العمل",
        tasks: [
            { text: "إعداد جدول المهام الأسبوعي", completed: false },
            { text: "تحضير العرض التقديمي للاجتماع", completed: false },
            { text: "الاتصال بفريق العمل لمناقشة المشروع", completed: false },
            { text: "إكمال تقرير المشروع الشهري", completed: false }
        ]
    },
    {
        name: "مهام شخصية",
        tasks: [
            { text: "حجز موعد لصيانة السيارة", completed: false },
            { text: "شراء مستلزمات المنزل", completed: false },
            { text: "تحديث السيرة الذاتية", completed: false }
        ]
    },
    {
        name: "مهام إدارية",
        tasks: [
            { text: "مراجعة البريد الإلكتروني وتنظيمه", completed: false },
            { text: "دفع فواتير الخدمات", completed: false },
            { text: "تنظيم ملفات العمل", completed: false }
        ]
    }
];

// الحصول على مهام المستخدم
function getUserTasks() {
    const allUserTasks = JSON.parse(localStorage.getItem('userTasks')) || {};
    return allUserTasks[currentUser.id] || defaultTasks;
}

let taskGroups = getUserTasks();

// دالة لتحديث العداد
function updateTasksCount() {
    const remainingTasks = taskGroups.reduce((count, group) => {
        return count + group.tasks.filter(task => !task.completed).length;
    }, 0);
    tasksCount.textContent = `${remainingTasks} مهام متبقية`;
}

// دالة لحفظ المهام في localStorage
function saveTasks() {
    const allUserTasks = JSON.parse(localStorage.getItem('userTasks')) || {};
    allUserTasks[currentUser.id] = taskGroups;
    localStorage.setItem('userTasks', JSON.stringify(allUserTasks));
    updateTasksCount();
}

// دالة لإنشاء عنصر مهمة جديد
function createTaskElement(task, groupIndex, taskIndex) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;
    div.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <span class="task-text">${task.text}</span>
        <button class="delete-btn">
            <i class="fas fa-trash-alt"></i>
        </button>
    `;

    // إضافة مستمع حدث للصندوق
    const checkbox = div.querySelector('.task-checkbox');
    checkbox.addEventListener('change', () => {
        task.completed = checkbox.checked;
        div.classList.toggle('completed');
        saveTasks();
    });

    // إضافة مستمع حدث لزر الحذف
    const deleteBtn = div.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        taskGroups[groupIndex].tasks.splice(taskIndex, 1);
        if (taskGroups[groupIndex].tasks.length === 0) {
            taskGroups.splice(groupIndex, 1);
        }
        renderTasks();
        saveTasks();
    });

    return div;
}

// دالة لإنشاء مجموعة مهام
function createTaskGroup(group, groupIndex) {
    const div = document.createElement('div');
    div.className = 'tasks-group';
    
    const header = document.createElement('div');
    header.className = 'group-header';
    header.innerHTML = `<h3 class="group-title">${group.name}</h3>`;
    
    const tasks = document.createElement('div');
    tasks.className = 'group-tasks';
    
    group.tasks.forEach((task, taskIndex) => {
        tasks.appendChild(createTaskElement(task, groupIndex, taskIndex));
    });
    
    div.appendChild(header);
    div.appendChild(tasks);
    return div;
}

// دالة لعرض المهام
function renderTasks(filterType = 'all') {
    tasksGroups.innerHTML = '';
    let filteredGroups = taskGroups.map(group => {
        let filteredTasks = group.tasks;
        if (filterType === 'active') {
            filteredTasks = group.tasks.filter(task => !task.completed);
        } else if (filterType === 'completed') {
            filteredTasks = group.tasks.filter(task => task.completed);
        }
        return { ...group, tasks: filteredTasks };
    }).filter(group => group.tasks.length > 0);

    filteredGroups.forEach((group, index) => {
        tasksGroups.appendChild(createTaskGroup(group, index));
    });
    
    updateTasksCount();
}

// إضافة مهمة جديدة
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    
    if (taskText) {
        const newTask = {
            text: taskText,
            completed: false
        };
        
        // إضافة المهمة إلى مجموعة "مهام أخرى" أو إنشاء مجموعة جديدة
        let otherTasks = taskGroups.find(group => group.name === "مهام أخرى");
        if (!otherTasks) {
            otherTasks = {
                name: "مهام أخرى",
                tasks: []
            };
            taskGroups.push(otherTasks);
        }
        
        otherTasks.tasks.push(newTask);
        renderTasks();
        saveTasks();
        taskInput.value = '';
    }
});

// توليد المهام باستخدام AI
generateTasksBtn.addEventListener('click', async () => {
    const userInput = taskInput.value.trim();
    if (!userInput) {
        alert('الرجاء إدخال وصف للمهام المطلوبة');
        return;
    }

    generateTasksBtn.innerHTML = '<div class="loading-spinner"></div>';
    generateTasksBtn.disabled = true;

    try {
        const result = await generateTasks(userInput);
        showGeneratedTasks(result.groups);
    } catch (error) {
        alert('حدث خطأ أثناء توليد المهام. الرجاء المحاولة مرة أخرى.');
        console.error(error);
    } finally {
        generateTasksBtn.innerHTML = '<i class="fas fa-magic"></i> توليد مهام ذكية';
        generateTasksBtn.disabled = false;
    }
});

// عرض المهام المولدة في النافذة المنبثقة
function showGeneratedTasks(groups) {
    generatedTasksContainer.innerHTML = '';
    
    groups.forEach(group => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'generated-task-group';
        groupDiv.innerHTML = `
            <h3>${group.name}</h3>
            ${group.tasks.map(task => `
                <div class="generated-task-item">
                    <input type="checkbox" checked>
                    <span>${task}</span>
                </div>
            `).join('')}
        `;
        generatedTasksContainer.appendChild(groupDiv);
    });
    
    aiModal.style.display = 'block';
}

// إضافة المهام المحددة
addSelectedTasksBtn.addEventListener('click', () => {
    const selectedTasks = document.querySelectorAll('#generated-tasks input[type="checkbox"]:checked');
    const tasksByGroup = {};
    
    selectedTasks.forEach(checkbox => {
        const taskText = checkbox.nextElementSibling.textContent;
        const groupName = checkbox.closest('.generated-task-group').querySelector('h3').textContent;
        
        if (!tasksByGroup[groupName]) {
            tasksByGroup[groupName] = [];
        }
        tasksByGroup[groupName].push({
            text: taskText,
            completed: false
        });
    });
    
    // إضافة المهام المحددة إلى القائمة
    Object.entries(tasksByGroup).forEach(([groupName, tasks]) => {
        let group = taskGroups.find(g => g.name === groupName);
        if (!group) {
            group = {
                name: groupName,
                tasks: []
            };
            taskGroups.push(group);
        }
        group.tasks.push(...tasks);
    });
    
    renderTasks();
    saveTasks();
    aiModal.style.display = 'none';
    taskInput.value = '';
});

// إغلاق النافذة المنبثقة
closeModalBtn.addEventListener('click', () => {
    aiModal.style.display = 'none';
});

// مستمع حدث لزر حذف المهام المكتملة
clearCompletedBtn.addEventListener('click', () => {
    taskGroups = taskGroups.map(group => ({
        ...group,
        tasks: group.tasks.filter(task => !task.completed)
    })).filter(group => group.tasks.length > 0);
    
    renderTasks();
    saveTasks();
});

// إضافة مستمعات أحداث لأزرار التصفية
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTasks(btn.dataset.filter);
    });
});

// عرض المهام عند تحميل الصفحة
renderTasks();
