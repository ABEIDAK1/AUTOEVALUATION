// ========== GLOBAL VARIABLES ==========
// Stores the currently logged-in username
let currentUser = ""; 

// Stores the selected evaluation period (reserved for future use)
let currentPeriode = "";

// Array that holds all evaluation tasks entered by the user during the current session
let evalTasks = [];

// ========== SPLASH SCREEN ==========
// Display splash page for 2 seconds, then show login page when app loads
setTimeout(()=>{
    document.getElementById("splashPage").style.display="none";  // Hide splash screen
    document.getElementById("loginPage").style.display="flex";   // Show login form
},2000);


// ========== ADMIN PASSWORD INITIALIZATION ==========
// Check if admin password exists in browser local storage
// If not, initialize with default admin password "IGE2026"
if(localStorage.getItem("ADMINIGE_pass")==null){
    localStorage.setItem("ADMINIGE_pass","IGE2026");
}


// ========== LOGIN FUNCTIONALITY ==========
// Listen for username input changes
document.getElementById("username").addEventListener("change", ()=>{
    let user = document.getElementById("username").value;
    
    // Show admin password reset button if username is "ADMINIGE"
    document.getElementById("resetAdmin").style.display = (user==="ADMINIGE") ? "block":"none";
    
    // Show password confirmation field if username is new (not in storage)
    if(user!="" && localStorage.getItem(user+"_pass")==null){
        document.getElementById("confirmDiv").style.display="block";
    } else { 
        document.getElementById("confirmDiv").style.display="none"; 
    }
});

// Main login function - handles user registration and authentication
function login(){
    let user=document.getElementById("username").value;
    let pass=document.getElementById("password").value;
    let confirmPass=document.getElementById("confirmPassword").value;
    
    // Validate username is not empty
    if(user===""){ alert("Choisir un utilisateur"); return; }

    // ===== NEW USER REGISTRATION FLOW =====
    if(localStorage.getItem(user+"_pass")==null){
        // Validate both password fields are filled
        if(pass==""||confirmPass==""){ alert("Créer un mot de passe"); return; }
        // Verify passwords match
        if(pass!==confirmPass){ alert("Les mots de passe ne correspondent pas"); return; }
        // Save new user password to local storage
        localStorage.setItem(user+"_pass",pass); 
        alert("Mot de passe créé");
    }
    
    // ===== EXISTING USER LOGIN FLOW =====
    // Verify entered password matches stored password
    if(pass!==localStorage.getItem(user+"_pass")){ alert("Mot de passe incorrect"); return; }

    // Set global current user variable
    currentUser = user;

    // ===== ADMIN LOGIN ROUTE =====
    if(user==="ADMINIGE"){
        document.getElementById("loginPage").style.display="none";
        document.getElementById("adminPage").style.display="flex";
        document.getElementById("adminButtons").style.display="none";
        document.getElementById("adminList").innerHTML="";
        return;
    }

    // ===== REGULAR USER LOGIN ROUTE =====
    document.getElementById("loginPage").style.display="none";
    document.getElementById("userPage").style.display="flex";

    // Load and display user's saved grade (if exists)
    document.getElementById("userNameSelect").value=user;
    document.getElementById("userGradeSelect").value = localStorage.getItem(user+"_grade")||"";
}


// ========== ADMIN PASSWORD RESET ==========
// Allows admin to reset their password with a secret code
function resetAdminPass(){
    let code=prompt("Entrez le code secret");
    
    // Validate secret code before allowing password change
    if(code==="CODE2026"){
        let newPass=prompt("Nouveau mot de passe admin");
        if(newPass){ 
            localStorage.setItem("ADMINIGE_pass",newPass); 
            alert("Mot de passe admin réinitialisé"); 
        }
    } else { 
        alert("Code incorrect"); 
    }
}

// ========== LOGOUT FUNCTIONALITY ==========
// Clear user session and return to login page
function logout(){
    // Hide all pages except login
    document.getElementById("loginPage").style.display="flex";
    document.getElementById("adminPage").style.display="none";
    document.getElementById("userPage").style.display="none";
    document.getElementById("evaluationPage").style.display="none";

    // Clear all login form fields
    document.getElementById("password").value="";
    document.getElementById("confirmPassword").value="";
    document.getElementById("username").value="";
}


// ========== USER GENERAL INFORMATION ==========
// Listen for changes to user's grade selection and save it
document.getElementById("userGradeSelect").addEventListener("change", ()=>{
    localStorage.setItem(currentUser+"_grade", document.getElementById("userGradeSelect").value);
});

// Navigate from user dashboard to evaluation form
function goToEvaluation(){
    document.getElementById("userPage").style.display="none";
    document.getElementById("evaluationPage").style.display="flex";
    loadTasks();  // Load any previously saved tasks
}

// ========== SELF-EVALUATION (AUTOÉVALUATION) ==========
// Add a new evaluation task to the current session
function addEvalTask(){
    let periode = document.getElementById("evalPeriode").value;
    let date = document.getElementById("evalDate").value;
    
    // Validate that period and submission date are selected
    if(!periode || !date){ alert("Choisir d'abord la période et la date de soumission"); return; }

    // Create task object with form field values
    let t={
        activite: document.getElementById("taskActivite").value,
        role: document.getElementById("taskRole").value,
        periode: document.getElementById("taskPeriode").value,
        livrables: document.getElementById("taskLivrables").value,
        resultats: document.getElementById("taskResultats").value
    };
    
    // Ensure mandatory fields (activity and role) are not empty
    if(!t.activite || !t.role){ alert("Compléter les champs essentiels"); return; }

    // Add task to array, save, and refresh display
    evalTasks.push(t);
    saveAllTasks();
    loadTasks();

    // Clear form fields for entering next task
    document.getElementById("taskActivite").value="";
    document.getElementById("taskRole").value="";
    document.getElementById("taskPeriode").value="";
    document.getElementById("taskLivrables").value="";
    document.getElementById("taskResultats").value="";

    // Show task table now that there are entries
    document.getElementById("tasksTableContainer").style.display="block";
}

// Load and display all evaluation tasks in table format
function loadTasks(){
    // Retrieve tasks from local storage, or initialize as empty array
    evalTasks = JSON.parse(localStorage.getItem(currentUser+"_tasks")) || [];
    
    let tbody = document.getElementById("evalTasksBody");
    tbody.innerHTML="";  // Clear previous table content
    
    // Create a table row for each task
    evalTasks.forEach((t,i)=>{
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${t.activite}</td><td>${t.role}</td><td>${t.periode}</td><td>${t.livrables}</td><td>${t.resultats}</td>
            <td>
                <button onclick="editTask(${i})">Modifier</button>
                <button onclick="deleteTask(${i})">Supprimer</button>
            </td>`;
        tbody.appendChild(tr);
    });
    
    // Hide table if no tasks exist
    if(evalTasks.length===0) document.getElementById("tasksTableContainer").style.display="none";
}

// Load task data into form for editing
function editTask(i){
    let t = evalTasks[i];
    
    // Populate form fields with selected task data
    document.getElementById("taskActivite").value=t.activite;
    document.getElementById("taskRole").value=t.role;
    document.getElementById("taskPeriode").value=t.periode;
    document.getElementById("taskLivrables").value=t.livrables;
    document.getElementById("taskResultats").value=t.resultats;
    
    // Remove task from array (will be re-added when user submits the form)
    evalTasks.splice(i,1);
    saveAllTasks();
    loadTasks();  // Refresh table
}

// Delete a task from the evaluation list
function deleteTask(i){
    evalTasks.splice(i,1);  // Remove task at index i from array
    saveAllTasks();
    loadTasks();  // Refresh table
}

// Save current session tasks to local storage
function saveAllTasks(){ 
    localStorage.setItem(currentUser+"_tasks", JSON.stringify(evalTasks)); 
}


// ========== EVALUATION SUBMISSION ==========
// Submit the completed self-evaluation to storage
function submitEvaluation(){

    let periode = document.getElementById("evalPeriode").value;
    let date = document.getElementById("evalDate").value;

    // Validate required fields
    if(!periode || !date){ alert("Choisir période et date"); return; }
    if(evalTasks.length===0){ alert("Ajouter au moins une activité"); return; }

    // Collect all selected competency rules/standards from checkboxes
    let rules = [];
    ["ruleDelais","ruleAssiduite","ruleDeontologie","ruleCommunication","ruleCollaboration"].forEach(id=>{
        if(document.getElementById(id).checked){
            rules.push(document.getElementById(id).parentElement.textContent.trim());
        }
    });

    // Get initiative/additional notes from text field
    let initiative = document.getElementById("initiativeText").value;

    // Create complete evaluation object containing all submission data
    let evaluation = {
        user: currentUser,
        periode: periode,
        date: date,
        tasks: [...evalTasks],  // Deep copy of tasks array
        rules: rules,           // Array of selected competency standards
        initiative: initiative  // User's initiative/notes text
    };

    // Save evaluation to global evaluations list (accessible to admin)
    let evaluations = JSON.parse(localStorage.getItem("evaluations"))||[];
    evaluations.push(evaluation);
    localStorage.setItem("evaluations", JSON.stringify(evaluations));

    // Save evaluation to user's personal archive
    let archive = JSON.parse(localStorage.getItem(currentUser+"_archive"))||[];
    archive.push(evaluation);
    localStorage.setItem(currentUser+"_archive", JSON.stringify(archive));

    // Clear session data
    evalTasks=[];
    saveAllTasks();

    // Reset UI
    document.getElementById("tasksTableContainer").style.display="none";
    document.getElementById("initiativeText").value="";

    alert("Auto-évaluation soumise !");
}

// ========== DISPLAY SUBMITTED EVALUATIONS ==========
// Show user's previously submitted evaluations from their archive
function showSubmittedArchive(){

    // Retrieve user's archived evaluations from storage
    let archive = JSON.parse(localStorage.getItem(currentUser+"_archive"))||[];

    // Alert if user has no submitted evaluations
    if(archive.length===0){
        alert("Aucune auto-évaluation transmise");
        return;
    }

    // Display the task table container
    document.getElementById("tasksTableContainer").style.display="block";
    let tbody = document.getElementById("evalTasksBody");
    tbody.innerHTML="";

    // Display each task from all submitted evaluations
    archive.forEach((evalItem)=>{
        evalItem.tasks.forEach(t=>{
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${t.activite}</td>
                            <td>${t.role}</td>
                            <td>${t.periode}</td>
                            <td>${t.livrables}</td>
                            <td>${t.resultats}</td>
                            <td>Soumis</td>`;  <!-- Status column showing submission -->
            tbody.appendChild(tr);
        });
    });
}


// ========== NAVIGATION HELPER FUNCTIONS ==========
// Navigate back from evaluation page to user dashboard
function backFromEvaluation(){ 
    document.getElementById("evaluationPage").style.display="none"; 
    document.getElementById("userPage").style.display="flex"; 
}

// Navigate back from admin page to user dashboard
function backToDashboard(){ 
    document.getElementById("userPage").style.display="flex"; 
    document.getElementById("adminPage").style.display="none"; 
}

// Filter evaluations by selected period (admin function - placeholder)
function filterByPeriode(){ 
    // TODO: Implement period-based filtering for admin dashboard
}

// Show submitted evaluations to admin (placeholder)
function showSubmitted(){ 
    // TODO: Implement display of submitted evaluations in admin view
}

// Show non-submitted evaluations to admin (placeholder)
function showNonSubmitted(){ 
    // TODO: Implement display of incomplete evaluations in admin view
}