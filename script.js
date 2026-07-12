// ==========================================
// Dark Mode
// ==========================================

const themeButton = document.getElementById("theme-btn");

if(localStorage.getItem("theme")==="dark"){

    document.body.classList.add("dark");

    themeButton.textContent="☀️ Light Mode";

}

themeButton.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeButton.textContent="☀️ Light Mode";

    }

    else{

        localStorage.setItem("theme","light");

        themeButton.textContent="🌙 Dark Mode";

    }

});

// ==========================================
// Platform Data
// ==========================================

const platforms=[

    {
        name:"🟡 LeetCode",
        rating:1650,
        solved:540,
        username:"leetcode-user",
        url:"https://leetcode.com/"
    },

    {
        name:"🔵 Codeforces",
        rating:1550,
        solved:220,
        username:"codeforces-user",
        url:"https://codeforces.com/profile/"
    },

    {
        name:"⭐ CodeChef",
        rating:1800,
        solved:310,
        username:"codechef-user",
        url:"https://www.codechef.com/users/"
    },

    {
        name:"🔴 AtCoder",
        rating:1450,
        solved:150,
        username:"atcoder-user",
        url:"https://atcoder.jp/users/"
    }

];

// ==========================================
// Create Cards
// ==========================================

const container=document.getElementById("platform-container");

container.innerHTML="";

platforms.forEach(platform=>{

    container.innerHTML+=`

    <div class="platform-card">

        <h3>${platform.name}</h3>

        <p><strong>Rating:</strong> ${platform.rating}</p>

        <p><strong>Solved:</strong> ${platform.solved}</p>

        <button
            class="view-btn"
            onclick="openProfile('${platform.username}','${platform.url}')">

            View Profile

        </button>

    </div>

    `;

});

// ==========================================
// Open Profile
// ==========================================

function openProfile(inputId,baseUrl){

    const username=document.getElementById(inputId).value.trim();

    if(username===""){

        alert("Please enter your username first.");

        return;

    }

    window.open(baseUrl+username,"_blank");

}
// ==========================================
// Save Usernames
// ==========================================

const saveButton = document.getElementById("save-btn");

saveButton.addEventListener("click", () => {

    const profile = {

        leetcode: document.getElementById("leetcode-user").value,

        codeforces: document.getElementById("codeforces-user").value,

        codechef: document.getElementById("codechef-user").value,

        atcoder: document.getElementById("atcoder-user").value,

        college: document.getElementById("college").value

    };

    localStorage.setItem("profile", JSON.stringify(profile));

    alert("Profile Saved Successfully!");

});
// ==========================================
// Load Saved Usernames
// ==========================================

const savedProfile = JSON.parse(localStorage.getItem("profile"));

if(savedProfile){

    document.getElementById("leetcode-user").value = savedProfile.leetcode;

    document.getElementById("codeforces-user").value = savedProfile.codeforces;

    document.getElementById("codechef-user").value = savedProfile.codechef;

    document.getElementById("atcoder-user").value = savedProfile.atcoder;

    document.getElementById("college").value = savedProfile.college;

}