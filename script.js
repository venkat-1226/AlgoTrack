console.log("🚀 Welcome to CodeHub!");

// ==========================================
// Platform Data
// ==========================================

const platforms = [

    {
        id: "leetcode",
        name: "🟡 LeetCode",
        rating: "--",
        solved: "--",
        url: "https://leetcode.com/"
    },

    {
        id: "codeforces",
        name: "🔵 Codeforces",
        rating: "--",
        solved: "--",
        rank: "--",
        maxRating: "--",
        url: "https://codeforces.com/profile/"
    },

    {
        id: "codechef",
        name: "⭐ CodeChef",
        rating: "--",
        solved: "--",
        url: "https://www.codechef.com/users/"
    },

    {
        id: "atcoder",
        name: "🔴 AtCoder",
        rating: "--",
        solved: "--",
        url: "https://atcoder.jp/users/"
    }

];

// ==========================================
// Platform Cards
// ==========================================

const container = document.getElementById("platform-container");

function displayPlatforms(platformList){

    container.innerHTML = "";

    platformList.forEach(platform => {

        container.innerHTML += `

        <div class="platform-card">

            <h3>${platform.name}</h3>

            <p>

                <strong>Rating:</strong>

                <span id="${platform.id}-rating">

                    ${platform.rating ?? "--"}

                </span>

            </p>

            <p>

                <strong>Solved:</strong>

                <span id="${platform.id}-solved">

                    ${platform.solved ?? "--"}

                </span>

            </p>

            ${
                platform.id === "codeforces"

                ?

                `

                <p>

                    <strong>Rank:</strong>

                    <span id="codeforces-rank">

                        ${platform.rank ?? "--"}

                    </span>

                </p>

                <p>

                    <strong>Max Rating:</strong>

                    <span id="codeforces-maxRating">

                        ${platform.maxRating ?? "--"}

                    </span>

                </p>

                `

                :

                ""

            }

            <button

                class="view-btn"

                id="${platform.id}-profile">

                View Profile

            </button>

        </div>

        `;

    });

    attachProfileButtons();

}

function attachProfileButtons(){

    platforms.forEach(platform => {

        const button = document.getElementById(`${platform.id}-profile`);

        if(!button) return;

        button.onclick = () => {

            let username = "";

            switch(platform.id){

                case "leetcode":
                    username = document.getElementById("leetcode-user").value.trim();
                    break;
                case "codeforces":
                    username = document.getElementById("codeforces-user").value.trim();
                    break;
                case "codechef":
                    username = document.getElementById("codechef-user").value.trim();
                    break;
                case "atcoder":
                    username = document.getElementById("atcoder-user").value.trim();
                    break;

            }

            if(username === ""){
                alert("Please enter your username first.");
                return;
            }

            window.open(platform.url + username, "_blank");

        };

    });

}

function updateStatistics(){

    document.getElementById("total-platforms").textContent = platforms.length;

    const ratings = platforms.map(p=>Number(p.rating)).filter(r=>!isNaN(r));

    document.getElementById("highest-rating").textContent =
        ratings.length ? Math.max(...ratings) : "--";

    const solved = platforms.map(p=>Number(p.solved)).filter(s=>!isNaN(s));

    document.getElementById("total-solved").textContent =
        solved.reduce((a,b)=>a+b,0);

}

function updateProgress(){

    const goal = 1000;

    const solved = platforms
        .map(p=>Number(p.solved))
        .filter(s=>!isNaN(s))
        .reduce((a,b)=>a+b,0);

    const percentage = Math.min(Math.round((solved/goal)*100),100);

    document.getElementById("progress-fill").style.width = percentage + "%";
    document.getElementById("progress-text").textContent = percentage + "%";
    document.getElementById("progress-details").textContent =
        `${solved} / ${goal} Problems Solved`;

}

const searchBox=document.getElementById("search-box");

searchBox.addEventListener("input",()=>{

    const text=searchBox.value.toLowerCase();

    displayPlatforms(
        platforms.filter(p=>p.name.toLowerCase().includes(text))
    );

});

document.getElementById("save-btn").addEventListener("click",()=>{

    const profile={
        leetcode:document.getElementById("leetcode-user").value,
        codeforces:document.getElementById("codeforces-user").value,
        codechef:document.getElementById("codechef-user").value,
        atcoder:document.getElementById("atcoder-user").value,
        college:document.getElementById("college").value
    };

    localStorage.setItem("profile",JSON.stringify(profile));

    alert("✅ Profile Saved Successfully!");

});

const savedProfile=JSON.parse(localStorage.getItem("profile"));

if(savedProfile){

    document.getElementById("leetcode-user").value=savedProfile.leetcode||"";
    document.getElementById("codeforces-user").value=savedProfile.codeforces||"";
    document.getElementById("codechef-user").value=savedProfile.codechef||"";
    document.getElementById("atcoder-user").value=savedProfile.atcoder||"";
    document.getElementById("college").value=savedProfile.college||"";

}

const themeButton=document.getElementById("theme-btn");

if(localStorage.getItem("theme")==="dark"){
    document.body.classList.add("dark");
    themeButton.textContent="☀️ Light Mode";
}

themeButton.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    const dark=document.body.classList.contains("dark");

    localStorage.setItem("theme",dark?"dark":"light");

    themeButton.textContent=dark?"☀️ Light Mode":"🌙 Dark Mode";

});

document.getElementById("load-btn").addEventListener("click",loadCodeforcesProfile);

async function loadCodeforcesProfile(){

    const username=document.getElementById("codeforces-user").value.trim();

    if(username===""){
        alert("Please enter your Codeforces username.");
        return;
    }

    try{

        const response=await fetch(`https://codeforces.com/api/user.info?handles=${username}`);
        const data=await response.json();

        if(data.status!=="OK"){
            alert("Codeforces user not found.");
            return;
        }

        const user=data.result[0];

        platforms[1].rating=user.rating ?? "Unrated";
        platforms[1].rank=user.rank ?? "Unrated";
        platforms[1].maxRating=user.maxRating ?? "Unrated";

        displayPlatforms(platforms);
        updateStatistics();
        updateProgress();
        drawChart();

        document.getElementById("codeforces-profile").onclick=()=>{
            window.open(`https://codeforces.com/profile/${user.handle}`,"_blank");
        };

        alert("✅ Codeforces profile loaded successfully!");

    }catch(error){

        console.error(error);
        alert("Unable to connect to Codeforces API.");

    }

}

function initializeApp(){

    displayPlatforms(platforms);
    updateStatistics();
    updateProgress();

}

initializeApp();

// ==========================================
// Rating Graph
// ==========================================

let ratingChart;

function drawChart(){

    const labels = platforms.map(platform =>

        platform.name.replace(/[^a-zA-Z]/g,"")

    );

    const ratings = platforms.map(platform =>

        Number(platform.rating) || 0

    );

    if(ratingChart){

        ratingChart.destroy();

    }

    const ctx =
        document.getElementById("ratingChart");

    ratingChart = new Chart(ctx,{

        type:"bar",

        data:{

            labels:labels,

            datasets:[{

                label:"Current Rating",

                data:ratings

            }]

        },

        options:{

            responsive:true,

            scales:{

                y:{

                    beginAtZero:true

                }

            }

        }

    });

}

drawChart();

// ==========================================
// Upcoming Contests
// ==========================================

loadContests();

async function loadContests(){

    const table = document.getElementById("contest-table");

    table.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

    try{

        const response = await fetch(
            "https://kontests.net/api/v1/all"
        );

        const contests = await response.json();

        const upcoming = contests
            .filter(contest => contest.status === "BEFORE")
            .slice(0,10);

        table.innerHTML = "";

        upcoming.forEach(contest => {

            table.innerHTML += `

            <tr>

                <td>${contest.site}</td>

                <td>${contest.name}</td>

                <td>${new Date(contest.start_time).toLocaleString()}</td>

            </tr>

            `;

        });

    }

    catch(error){

        console.log(error);

        table.innerHTML = `

        <tr>

            <td colspan="3">

                Unable to load contests

            </td>

        </tr>

        `;

    }

}