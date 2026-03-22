// ========== GLOBAL VARIABLES ==========
// Stores the currently logged-in username
let currentUser = ""; 

// Stores the selected evaluation period (unused in code, kept for future use)
let currentPeriode = "";

// Array that holds all evaluation tasks entered by the user during current session
let evalTasks = [];

// ========== SPLASH SCREEN ==========
// Display splash page for 2 seconds, then show login page when app loads
setTimeout(()=>{
    document.getElementById("splashPage").style.display="none";  // Hide splash
    document.getElementById("loginPage").style.display="flex";   // Show login form
},2000);

// ========== ADMIN PASSWORD INITIALIZATION ==========
// Check if admin password exists in browser storage
// If not, set default admin password to "IGE2026"
if(localStorage.getItem("ADMINIGE_pass")==null){
    localStorage.setItem("ADMINIGE_pass","IGE2026");
}


// ========== LOGIN FUNCTIONALITY ==========
// Listen for changes when user types in username field
document.getElementById("username").addEventListener("change", ()=>{
    let user = document.getElementById("username").value;
    
    // Show admin reset button if username is "ADMINIGE"
    document.getElementById("resetAdmin").style.display = (user==="ADMINIGE") ? "block":"none";
    
    // If username is entered and no password exists for this user, show registration fields
    if(user!="" && localStorage.getItem(user+"_pass")==null){
        document.getElementById("confirmDiv").style.display="block";
    } else { 
        document.getElementById("confirmDiv").style.display="none"; 
    }
});

// Main login function - handles both registration and authentication
function login(){
    let user=document.getElementById("username").value;
    let pass=document.getElementById("password").value;
    let confirmPass=document.getElementById("confirmPassword").value;
    
    // Validate that username is entered
    if(user===""){ alert("Choisir un utilisateur"); return; }

    // NEW USER REGISTRATION: If user doesn't exist in storage
    if(localStorage.getItem(user+"_pass")==null){
        // Check both password fields are filled
        if(pass==""||confirmPass==""){ alert("Créer un mot de passe"); return; }
        // Check passwords match
        if(pass!==confirmPass){ alert("Les mots de passe ne correspondent pas"); return; }
        // Save new password to storage
        localStorage.setItem(user+"_pass",pass); 
        alert("Mot de passe créé");
    }
    
    // EXISTING USER LOGIN: Verify password matches stored password
    if(pass!==localStorage.getItem(user+"_pass")){ alert("Mot de passe incorrect"); return; }

    // Set current user globally
    currentUser = user;

    // ADMIN LOGIN: Show admin dashboard
    if(user==="ADMINIGE"){
        document.getElementById("loginPage").style.display="none";
        document.getElementById("adminPage").style.display="flex";
        document.getElementById("adminButtons").style.display="none";
        document.getElementById("adminList").innerHTML="";
        return;
    }

    // REGULAR USER LOGIN: Show user evaluation page
    document.getElementById("loginPage").style.display="none";
    document.getElementById("userPage").style.display="flex";

    // Load user's saved grade (if any)
    document.getElementById("userNameSelect").value=user;
    document.getElementById("userGradeSelect").value = localStorage.getItem(user+"_grade")||"";
}


// ========== ADMIN PASSWORD RESET ==========
// Allow admin to reset password using a secret code
function resetAdminPass(){
    let code=prompt("Entrez le code secret");
    
    // Verify the secret code is correct
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

    // Clear login form fields
    document.getElementById("password").value="";
    document.getElementById("confirmPassword").value="";
    document.getElementById("username").value="";
}


// ========== USER GENERAL INFO ==========
// Save user's grade selection to browser storage whenever it changes
document.getElementById("userGradeSelect").addEventListener("change", ()=>{
    localStorage.setItem(currentUser+"_grade", document.getElementById("userGradeSelect").value);
});

// Navigate from user info page to evaluation page
function goToEvaluation(){
    document.getElementById("userPage").style.display="none";
    document.getElementById("evaluationPage").style.display="flex";
    loadTasks();  // Load previously saved evaluation tasks
}


// ========== SELF-EVALUATION (AUTOÉVALUATION) ==========
// Add a new evaluation task to the list
function addEvalTask(){
    let periode = document.getElementById("evalPeriode").value;
    let date = document.getElementById("evalDate").value;
    
    // Validate that period and submission date are selected
    if(!periode || !date){ alert("Choisir d'abord la période et la date de soumission"); return; }

    // Create object with task information
    let t={
        activite: document.getElementById("taskActivite").value,
        role: document.getElementById("taskRole").value,
        periode: document.getElementById("taskPeriode").value,
        livrables: document.getElementById("taskLivrables").value,
        resultats: document.getElementById("taskResultats").value
    };
    
    // Ensure mandatory fields (activity and role) are filled
    if(!t.activite || !t.role){ alert("Compléter les champs essentiels"); return; }

    // Add task to array and save to storage
    evalTasks.push(t);
    saveAllTasks();
    loadTasks();

    // Clear input fields for next task entry
    document.getElementById("taskActivite").value="";
    document.getElementById("taskRole").value="";
    document.getElementById("taskPeriode").value="";
    document.getElementById("taskLivrables").value="";
    document.getElementById("taskResultats").value="";

    // Show the task table now that there are tasks
    document.getElementById("tasksTableContainer").style.display="block";
}

// Load and display all evaluation tasks in table format
function loadTasks(){
    // Retrieve tasks from storage, or empty array if none exist
    evalTasks = JSON.parse(localStorage.getItem(currentUser+"_tasks")) || [];
    let tbody = document.getElementById("evalTasksBody");
    tbody.innerHTML="";  // Clear previous content
    
    // Create table row for each task
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

// Load task data into form fields for editing
function editTask(i){
    let t = evalTasks[i];
    
    // populate form with task data
    document.getElementById("taskActivite").value=t.activite;
    document.getElementById("taskRole").value=t.role;
    document.getElementById("taskPeriode").value=t.periode;
    document.getElementById("taskLivrables").value=t.livrables;
    document.getElementById("taskResultats").value=t.resultats;
    
    // Remove task from array (user will re-add when saving)
    evalTasks.splice(i,1);
    saveAllTasks();
    loadTasks();  // Refresh table view
}

// Delete a task from the list
function deleteTask(i){
    evalTasks.splice(i,1);  // Remove task at index i
    saveAllTasks();
    loadTasks();  // Refresh table view
}

// Save all current tasks to browser storage
function saveAllTasks(){ 
    localStorage.setItem(currentUser+"_tasks", JSON.stringify(evalTasks)); 
}


// ========== EVALUATION SUBMISSION ==========
// Submit the completed self-evaluation
function submitEvaluation(){

    let periode = document.getElementById("evalPeriode").value;
    let date = document.getElementById("evalDate").value;

    // Validate required fields
    if(!periode || !date){ alert("Choisir période et date"); return; }
    if(evalTasks.length===0){ alert("Ajouter au moins une activité"); return; }

    // Collect all selected competency rules/standards
    let rules = [];
    ["ruleDelais","ruleAssiduite","ruleDeontologie","ruleCommunication","ruleCollaboration"].forEach(id=>{
        if(document.getElementById(id).checked){
            rules.push(document.getElementById(id).parentElement.textContent.trim());
        }
    });

    // Get initiative/additional notes text
    let initiative = document.getElementById("initiativeText").value;

    // Create complete evaluation object with all information
    let evaluation = {
        user: currentUser,
        periode: periode,
        date: date,
        tasks: [...evalTasks],  // Copy of all tasks
        rules: rules,           // Selected competency standards
        initiative: initiative  // Additional notes
    };

    // Save to global evaluations list
    let evaluations = JSON.parse(localStorage.getItem("evaluations"))||[];
    evaluations.push(evaluation);
    localStorage.setItem("evaluations", JSON.stringify(evaluations));

    // Save to user's personal archive
    let archive = JSON.parse(localStorage.getItem(currentUser+"_archive"))||[];
    archive.push(evaluation);
    localStorage.setItem(currentUser+"_archive", JSON.stringify(archive));

    // Clear current session data
    evalTasks=[];
    saveAllTasks();

    // Reset UI
    document.getElementById("tasksTableContainer").style.display="none";
    document.getElementById("initiativeText").value="";

    alert("Auto-évaluation soumise !");
}

// ========== DISPLAY SUBMITTED EVALUATIONS ==========
// Show all previously submitted evaluations from user's archive
function showSubmittedArchive(){

    // Get user's archived evaluations
    let archive = JSON.parse(localStorage.getItem(currentUser+"_archive"))||[];

    // Alert if no evaluations exist
    if(archive.length===0){
        alert("Aucune auto-évaluation transmise");
        return;
    }

    // Show the table container
    document.getElementById("tasksTableContainer").style.display="block";
    let tbody = document.getElementById("evalTasksBody");
    tbody.innerHTML="";

    // Display each task from each submitted evaluation
    archive.forEach((evalItem)=>{
        evalItem.tasks.forEach(t=>{
            let tr = document.createElement("tr");
            tr.innerHTML = `<td>${t.activite}</td>
                            <td>${t.role}</td>
                            <td>${t.periode}</td>
                            <td>${t.livrables}</td>
                            <td>${t.resultats}</td>
                            <td>Soumis</td>`;  <!-- Mark as submitted -->
            tbody.appendChild(tr);
        });
    });
}


// ========== NAVIGATION HELPER FUNCTIONS ==========
// Navigate back from evaluation page to user info page
function backFromEvaluation(){ 
    document.getElementById("evaluationPage").style.display="none"; 
    document.getElementById("userPage").style.display="flex"; 
}

// Navigate back to user dashboard from admin page
function backToDashboard(){ 
    document.getElementById("userPage").style.display="flex"; 
    document.getElementById("adminPage").style.display="none"; 
}

// Filter evaluations by selected period (admin function - placeholder)
function filterByPeriode(){ 
    /* Admin dashboard filtering logic */ 
}

// Show submitted evaluations (admin function - placeholder)
function showSubmitted(){ 
    /* Admin view for submitted evaluations */ 
}

// Show non-submitted evaluations (admin function - placeholder)
function showNonSubmitted(){ 
    /* Admin view for incomplete evaluations */ 
}