//DOM elements
const tasksList = document.getElementById("taskslist");
const taskNameBox = document.getElementById("tasknamebox");
const priorityBox = document.getElementById("pbox");
const listName = document.getElementById("ln");
const notifier = document.getElementById("notifier");
const tList = document.getElementById("lists");

class TasksApp{
	constructor() {
		this.state = {
			activeTask:0,
			taskListCount:0,
			taskLists:{}
		}
	}

	renderNewTaskListItem = (listName, tlc) => {
		let template = `
		<li class="lst sr" id="tli-${tlc}" data-tli="${tlc}" onclick="app.activateTaskListItem(this);">
			<div class="lstn">
				<input type="text" class="listname" id="tln-${tlc}" value="${listName}" readonly="true" spellcheck="false"/>
			</div>
			<div class="tlops">
				<button class="btn-outline-danger ml-2 tlopb" data-tli="${tlc}" onclick="app.deleteTaskListItem(this);">
					<img src="images/deleteicon.svg" class="icox">
				</button>
				<button class="btn-outline-primary ml-1 tlopb" data-tli="${tlc}" onclick="app.editTaskListItem(this);">
					<img src="images/editicon.svg" class="icox">
				</button>
			</div>
		</li>
		`;
		tList.innerHTML += template;
	}

	taskListRebuiler = () => {
		tList.innerHTML = "";
		[...Array(this.state.taskListCount).keys()].forEach(i=>{
			let x = this.state.taskLists[i];
			if(x['taskListName'])
				this.renderNewTaskListItem(x['taskListName'], i);
		});
	};

	addNewTaskListItem = () => {
		this.renderNewTaskListItem("New List", this.state.taskListCount)
		this.state.taskLists[this.state.taskListCount] = {
			taskListName:"New List",
			wfilter:'all',
			taskcount:0,
			tasks:{}
		}
		this.state.taskListCount++;
		this.taskListRebuiler();
	}

	editTaskListItem = (el) => {
		let id = el.dataset.tli;
		let textbox = document.getElementById(`tln-${id}`);
		textbox.readOnly=!textbox.readOnly;
		if([...el.classList].includes("btn-outline-primary")){
			//start editing
			notifier.innerHTML = "Edit Mode On";
			textbox.classList.add("editallowed");
			el.classList.remove("btn-outline-primary");
			el.classList.add("btn-primary");
			textbox.focus();
		}else if([...el.classList].includes("btn-primary")){
			//end editing
			notifier.innerHTML = "";
			textbox.classList.remove("editallowed");
			el.classList.remove("btn-primary");
			el.classList.add("btn-outline-primary");

			//submit changes
			this.state.taskLists[id]['taskListName'] = textbox.value;
			console.log(`Taskname of Task(${id}) has been changed to: ${textbox.value}`)
		}
	};

	deleteTaskListItem = (el) => {
		let id=el.dataset.tli;
		this.state.taskLists[id] = {};
		this.taskListRebuiler();
		console.log(`TaskList(${el.dataset.tli}) has been deleted`)
	}
	
	activateTaskListItem = (el) => {
		let x = el.dataset.tli;
		//user has deleted taskListItem
		if(Object.keys(this.state.taskLists[x]).length === 0){
			document.getElementById("listnotifier").innerHTML = "";
			this.state.activeTask = -1;
			tasksList.innerHTML = "";

			[...Object.keys(this.state.taskLists)].forEach(i => {
				if(Object.keys(this.state.taskLists[i]).length !== 0){
					this.state.activeTask = i;
				}
			});

			if(this.state.activeTask === -1){
				alert("No more tasklists left! Please create a new Tasklist");
			}else{
				this.rebuild();
				document.getElementById("listnotifier").innerHTML = this.state.taskLists[this.state.activeTask]['taskListName'];
				console.log(`TaskList(${this.state.activeTask}) has been activated`)
			}
		}else{
			this.state.activeTask = x;
			this.rebuild();
			document.getElementById("listnotifier").innerHTML = this.state.taskLists[el.dataset.tli]['taskListName'];
			console.log(`TaskList(${el.dataset.tli}) has been activated`)
		}
	};

	preventEmptyTaskListActions = () => {
		if(Object.keys(this.state.taskLists).length <= 0) alert("Please create a new list before accessing these controls");
	};
	
	renderTask = (taskName, tc, priority) => {	
		let tli = this.state.activeTask;
		let template = `
			<li class="taskitem mb-1" id="t-${tli}-${tc}">
				<div id="checkgroup">
					<label class="chkcontainer">
						<input type="checkbox" id="chk-${tli}-${tc}" data-tli="${tli}" data-tsk="${tc}" onchange="app.completeTask(this);">
						<span class="checkmark"></span>
					</label>
				</div>
				<div id="taskcontentgroup">
					<input type="text" class="taskName" id="tn-${tli}-${tc}" value="${taskName}" readonly="true" spellcheck="false"/>
				</div>
				<div id="optiongroup">
					<div class="ops">
						<span class="badge badge-dark p-1 text-muted">${priority}</span>
						<button class="btn-outline-danger ml-1 opb" data-tli="${tli}" data-tsk="${tc}" onclick="app.deleteTask(this);">
							<img src="images/deleteicon.svg" class="ico">
						</button>
						<button class="btn-outline-primary ml-1 opb" data-tli="${tli}" data-tsk="${tc}" onclick="app.editTask(this);">
							<img src="images/editicon.svg" class="ico">
						</button>
					</div>
				</div>
			</li>
		`;
		tasksList.innerHTML+=template;	
	};

	rebuild = () => {
		let tli = this.state.activeTask;
		let wf = this.state.taskLists[tli].wfilter;
		if(wf === 'all'){
			//Regular Rebuild
			listName.innerHTML = "My Tasks";
			tasksList.innerHTML = "";
			[...Array(this.state.taskLists[tli]['taskcount']).keys()].forEach(i=>{
				let task = this.state.taskLists[tli]['tasks'][i];
				if(task['status'] !== 'deleted')
					this.renderTask(task['name'], i, task['priority']);
			});
			[...Array(this.state.taskLists[tli]['taskcount']).keys()].forEach(i=>{
				let task = this.state.taskLists[tli]['tasks'][i];
				if(task['status'] === 'completed'){
					document.getElementById(`t-${tli}-${i}`).classList.add("completedTask");
					document.getElementById(`chk-${tli}-${i}`).checked=true;
				}
			});
		}
		else if(wf === 'active')
			//Active Tasks Rebuild
			this.showActiveTasks();
		else if(wf === 'completed')
			//Completed Tasks Rebuild
			this.showCompletedTasks();
		else
			console.log("Unknown Window Filter")
	};

	addTask = () => {
		let taskName = taskNameBox.value;
		let tli=this.state.activeTask;
		if(Object.keys(this.state.taskLists).length != 0){
			let priority = (priorityBox.value) ? priorityBox.value : "Low";
			this.renderTask(taskName, this.state.taskLists[tli]['taskcount'], priority);
			this.state.taskLists[tli]['tasks'][this.state.taskLists[tli]['taskcount']] = {
				'name': taskName,
				'priority': priority,
				'status': 'active'
			};
			this.state.taskLists[tli]['taskcount']++;

			this.rebuild();
		}else{
			alert("Please create a new list before adding tasks!");
		}
	};

	completeTask = (el) => {
		let id = el.dataset.tsk;
		let tli = this.state.activeTask;
		let taskItem = document.getElementById(`t-${tli}-${id}`);
		if([...taskItem.classList].includes("completedTask")){
			taskItem.classList.remove("completedTask");
			this.state['taskLists'][tli]['tasks'][id]['status'] = 'active';
			console.log(`Activated Task(${id})`);
		}else{
			taskItem.classList.add("completedTask");
			this.state['taskLists'][tli]['tasks'][id]['status'] = 'completed';
			console.log(`Completed Task(${id})`);
		}
		this.rebuild();
	};

	deleteTask = (el) => {
		//handle window filtering
		let id=el.dataset.tsk;
		let tli = this.state.activeTask;
		this.state.taskLists[tli]['tasks'][id]['status'] = 'deleted';
		document.getElementById(`t-${tli}-${id}`).remove();
		console.log(`Deleted Task(${id})`);
	};

	editTask = (el) => {
		let id = el.dataset.tsk;
		let tli = this.state.activeTask;
		let textbox = document.getElementById(`tn-${tli}-${id}`);
		textbox.readOnly=!textbox.readOnly;
		if([...el.classList].includes("btn-outline-primary")){
			//start editing
			notifier.innerHTML = "Edit Mode On";
			textbox.classList.add("editallowed");
			el.classList.remove("btn-outline-primary");
			el.classList.add("btn-primary");
			textbox.focus();
		}else if([...el.classList].includes("btn-primary")){
			//end editing
			notifier.innerHTML = "";
			textbox.classList.remove("editallowed");
			el.classList.remove("btn-primary");
			el.classList.add("btn-outline-primary");

			//submit changes
			this.state.taskLists[tli]['tasks'][id]['name'] = textbox.value;
			console.log(`Taskname of Task(${id}) has been changed to: ${textbox.value}`)
		}
	};

	clearTasks = () => {
		let tli = this.state.activeTask;
		this.preventEmptyTaskListActions();
		this.state.taskLists[tli] = {
			taskcount:0,
			tasks:{},
			wfilter:'all'
		};
		tasksList.innerHTML = "";
	};

	showAllTasks = () => {
		let tli = this.state.activeTask;
		this.preventEmptyTaskListActions();
		listName.innerHTML = "My Tasks";
		this.state.taskLists[tli].wfilter = 'all';
		this.rebuild();
	};

	showActiveTasks = () => {
		this.preventEmptyTaskListActions();
		let tli = this.state.activeTask;
		listName.innerHTML = "Active Tasks";
		this.state.taskLists[tli].wfilter = 'active';
		tasksList.innerHTML = "";
		[...Array(this.state.taskLists[tli]['taskcount']).keys()].forEach(i=>{
			let task = this.state.taskLists[tli]['tasks'][i];
			if(task['status'] === 'active'){
				this.renderTask(task['name'], i, task['priority']);
			}
		});
	}

	showCompletedTasks = () => {
		this.preventEmptyTaskListActions();
		let tli = this.state.activeTask;
		listName.innerHTML = "Completed Tasks";
		this.state.taskLists[tli].wfilter = 'completed';
		tasksList.innerHTML = "";
		[...Array(this.state.taskLists[tli]['taskcount']).keys()].forEach(i=>{
			let task = this.state.taskLists[tli]['tasks'][i];
			if(task['status'] === 'completed'){
				this.renderTask(task['name'], i, task['priority']);
			}
		});
		//highlighting
		[...Array(this.state.taskLists[tli]['taskcount']).keys()].forEach(i=>{
			let task = this.state.taskLists[tli]['tasks'][i];
			if(task['status'] === 'completed'){
				document.getElementById(`t-${tli}-${i}`).classList.add("completedTask");
				document.getElementById(`chk-${tli}-${i}`).checked=true;
			}
		});
	};

	restoreDeletedTasks = () => {
		this.preventEmptyTaskListActions();
		let tli = this.state.activeTask;
		this.state.taskLists[tli].wfilter = 'all';
		[...Array(this.state.taskLists[tli]['taskcount']).keys()].forEach(i=>{
			let task = this.state.taskLists[tli]['tasks'][i];
			if(task['status'] === 'deleted')
				this.state.taskLists[tli]['tasks'][i]['status'] = 'active';
			});
		this.rebuild();
	};

	filterByPriority = (p) => {
		this.preventEmptyTaskListActions();
		let tli = this.state.activeTask;
		if(p === "No"){
			this.state.taskLists[tli].wfilter = 'all';
			this.rebuild();
			return;
		}
		this.state.taskLists[tli].wfilter = 'p';
		listName.innerHTML = `${p} Priority Tasks`;
		tasksList.innerHTML = "";
		[...Array(this.state.taskLists[tli]['taskcount']).keys()].forEach(i=>{
			let task = this.state.taskLists[tli]['tasks'][i];
			if(task['priority'] === p && task['status'] !== 'deleted'){
				this.renderTask(task['name'], i, task['priority']);
			}
		});
		[...Array(this.state.taskLists[tli]['taskcount']).keys()].forEach(i=>{
			let task = this.state.taskLists[tli]['tasks'][i];
			if(task['status'] === 'completed' && task['priority'] === p){
				document.getElementById(`t-${tli}-${i}`).classList.add("completedTask");
				document.getElementById(`chk-${tli}-${i}`).checked=true;
			}
		});
	};
}

let app;
app = new TasksApp();

new Sortable(tList, {
    animation: 150,
});

//Allow the TaskObjects' order to be changed via drag event
new Sortable(document.getElementById("taskslist"), {
    animation: 150,
});