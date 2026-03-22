// ---------- VARIABLES ----------
let currentUser = ""; 
let currentPeriode = "";
let evalTasks = [];

// ---------- SPLASH ----------
setTimeout(()=>{
    document.getElementById("splashPage").style.display="none";
    document.getElementById("loginPage").style.display="flex";
},2000);

// ---------- ADMIN PASS DEFAUT ----------
if(localStorage.getItem("ADMINIGE_pass")==null){
    localStorage.setItem("ADMINIGE_pass","IGE2026");
}

// ---------- LOGIN ----------
document.getElementById("username").addEventListener("change", ()=>{
    let user = document.getElementById("username").value;
    document.getElementById("resetAdmin").style.display = (user==="ADMINIGE") ? "block":"none";
    if(user!="" && localStorage.getItem(user+"_pass")==null){
        document.getElementById("confirmDiv").style.display="block";
    } else { document.getElementById("confirmDiv").style.display="none"; }
});

function login(){
    let user=document.getElementById("username").value;
    let pass=document.getElementById("password").value;
    let confirmPass=document.getElementById("confirmPassword").value;
    if(user===""){ alert("Choisir un utilisateur"); return; }

    if(localStorage.getItem(user+"_pass")==null){
        if(pass==""||confirmPass==""){ alert("Créer un mot de passe"); return; }
        if(pass!==confirmPass){ alert("Les mots de passe ne correspondent pas"); return; }
        localStorage.setItem(user+"_pass",pass); alert("Mot de passe créé");
    }
    if(pass!==localStorage.getItem(user+"_pass")){ alert("Mot de passe incorrect"); return; }

    currentUser = user;

    if(user==="ADMINIGE"){
        document.getElementById("loginPage").style.display="none";
        document.getElementById("adminPage").style.display="flex";
        document.getElementById("adminButtons").style.display="none";
        document.getElementById("adminList").innerHTML="";
        return;
    }

    document.getElementById("loginPage").style.display="none";
    document.getElementById("userPage").style.display="flex";

    document.getElementById("userNameSelect").value=user;
    document.getElementById("userGradeSelect").value = localStorage.getItem(user+"_grade")||"";
}

// ---------- RESET ADMIN ----------
function resetAdminPass(){
    let code=prompt("Entrez le code secret");
    if(code==="CODE2026"){
        let newPass=prompt("Nouveau mot de passe admin");
        if(newPass){ localStorage.setItem("ADMINIGE_pass",newPass); alert("Mot de passe admin réinitialisé"); }
    } else { alert("Code incorrect"); }
}

// ---------- LOGOUT ----------
function logout(){
    document.getElementById("loginPage").style.display="flex";
    document.getElementById("adminPage").style.display="none";
    document.getElementById("userPage").style.display="none";
    document.getElementById("evaluationPage").style.display="none";

    document.getElementById("password").value="";
    document.getElementById("confirmPassword").value="";
    document.getElementById("username").value="";
}

// ---------- INFOS GÉNÉRALES ----------
document.getElementById("userGradeSelect").addEventListener("change", ()=>{
    localStorage.setItem(currentUser+"_grade", document.getElementById("userGradeSelect").value);
});

function goToEvaluation(){
    document.getElementById("userPage").style.display="none";
    document.getElementById("evaluationPage").style.display="flex";
    loadTasks();
}

// ---------- AUTOÉVALUATION ----------
function addEvalTask(){
    let periode = document.getElementById("evalPeriode").value;
    let date = document.getElementById("evalDate").value;
    if(!periode || !date){ alert("Choisir d'abord la période et la date de soumission"); return; }

    let t={
        activite: document.getElementById("taskActivite").value,
        role: document.getElementById("taskRole").value,
        periode: document.getElementById("taskPeriode").value,
        livrables: document.getElementById("taskLivrables").value,
        resultats: document.getElementById("taskResultats").value
    };
    if(!t.activite || !t.role){ alert("Compléter les champs essentiels"); return; }

    evalTasks.push(t);
    saveAllTasks();
    loadTasks();

    document.getElementById("taskActivite").value="";
    document.getElementById("taskRole").value="";
    document.getElementById("taskPeriode").value="";
    document.getElementById("taskLivrables").value="";
    document.getElementById("taskResultats").value="";

    document.getElementById("tasksTableContainer").style.display="block";
}

function loadTasks(){
    evalTasks = JSON.parse(localStorage.getItem(currentUser+"_tasks")) || [];
    let tbody = document.getElementById("evalTasksBody");
    tbody.innerHTML="";
    evalTasks.forEach((t,i)=>{
        let tr = document.createElement("tr");
        tr.innerHTML = `<td>${t.activite}</td><td>${t.role}</td><td>${t.periode}</td><td>${t.livrables}</td><td>${t.resultats}</td>
            <td>
                <button onclick="editTask(${i})">Modifier</button>
                <button onclick="deleteTask(${i})">Supprimer</button>
            </td>`;
        tbody.appendChild(tr);
    });
    if(evalTasks.length===0) document.getElementById("tasksTableContainer").style.display="none";
}

function editTask(i){
    let t = evalTasks[i];
    document.getElementById("taskActivite").value=t.activite;
    document.getElementById("taskRole").value=t.role;
    document.getElementById("taskPeriode").value=t.periode;
    document.getElementById("taskLivrables").value=t.livrables;
    document.getElementById("taskResultats").value=t.resultats;
    evalTasks.splice(i,1);
    saveAllTasks();
    loadTasks();
}

function deleteTask(i){
    evalTasks.splice(i,1);
    saveAllTasks();
    loadTasks();
}

function saveAllTasks(){ 
    localStorage.setItem(currentUser+"_tasks", JSON.stringify(evalTasks)); 
}

function submitEvaluation(){

    let periode = document.getElementById("evalPeriode").value;
    let date = document.getElementById("evalDate").value;

    if(!periode || !date){ alert("Choisir période et date"); return; }
    if(evalTasks.length===0){ alert("Ajouter au moins une activité"); return; }

    let rules = [];

    ["ruleDelais","ruleAssiduite","ruleDeontologie","ruleCommunication","ruleCollaboration"].forEach(id=>{
        if(document.getElementById(id).checked){
            rules.push(document.getElementById(id).parentElement.textContent.trim());
        }
    });

    // NOUVEAU CHAMP
    let initiative = document.getElementById("initiativeText").value;

    let evaluation = {
        user: currentUser,
        periode: periode,
        date: date,
        tasks: [...evalTasks],
        rules: rules,
        initiative: initiative
    };

    let evaluations = JSON.parse(localStorage.getItem("evaluations"))||[];
    evaluations.push(evaluation);
    localStorage.setItem("evaluations", JSON.stringify(evaluations));

    let archive = JSON.parse(localStorage.getItem(currentUser+"_archive"))||[];
    archive.push(evaluation);
    localStorage.setItem(currentUser+"_archive", JSON.stringify(archive));

    evalTasks=[];
    saveAllTasks();

    document.getElementById("tasksTableContainer").style.display="none";
    document.getElementById("initiativeText").value="";

    alert("Auto-évaluation soumise !");
}

function showSubmittedArchive(){

    let archive = JSON.parse(localStorage.getItem(currentUser+"_archive"))||[];

    if(archive.length===0){
        alert("Aucune auto-évaluation transmise");
        return;
    }

    document.getElementById("tasksTableContainer").style.display="block";

    let tbody = document.getElementById("evalTasksBody");

    tbody.innerHTML="";

    archive.forEach((evalItem)=>{

        evalItem.tasks.forEach(t=>{

            let tr = document.createElement("tr");

            tr.innerHTML = `<td>${t.activite}</td>
                            <td>${t.role}</td>
                            <td>${t.periode}</td>
                            <td>${t.livrables}</td>
                            <td>${t.resultats}</td>
                            <td>Soumis</td>`;

            tbody.appendChild(tr);

        });

    });

}

// Les fonctions admin et dashboard restent inchangées
function backFromEvaluation(){ document.getElementById("evaluationPage").style.display="none"; document.getElementById("userPage").style.display="flex"; }
function backToDashboard(){ document.getElementById("userPage").style.display="flex"; document.getElementById("adminPage").style.display="none"; }
function filterByPeriode(){ /* ton code existant */ }
function showSubmitted(){ /* ton code existant */ }
function showNonSubmitted(){ /* ton code existant */ }