// ==========================================
// CodeHub API Practice
// Day 27
// ==========================================

console.log("🚀 CodeHub API Practice");

// Replace this with your Codeforces username
const username = "tourist";

const url =
`https://codeforces.com/api/user.info?handles=${username}`;

fetch(url)

.then(response => response.json())

.then(data => {

    console.log("===== User Information =====");

    console.log("Handle :", data.result[0].handle);

    console.log("Rating :", data.result[0].rating);

    console.log("Max Rating :", data.result[0].maxRating);

    console.log("Rank :", data.result[0].rank);

    console.log("Max Rank :", data.result[0].maxRank);

})

.catch(error => {

    console.log("Something went wrong!");

    console.log(error);

});