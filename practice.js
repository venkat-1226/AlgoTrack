// ==========================================
// Day 20 - map(), filter(), find()
// ==========================================

console.log("===== Day 20 =====");

const platforms = [

    {
        name: "LeetCode",
        rating: 1650,
        solved: 540
    },

    {
        name: "Codeforces",
        rating: 1550,
        solved: 220
    },

    {
        name: "CodeChef",
        rating: 1800,
        solved: 310
    },

    {
        name: "AtCoder",
        rating: 1450,
        solved: 150
    }

];

// ----------------------------
// map()
// ----------------------------

const platformNames = platforms.map(platform => platform.name);

console.log("Platform Names");

console.log(platformNames);

// ----------------------------
// filter()
// ----------------------------

const highRatedPlatforms = platforms.filter(platform => platform.rating >= 1600);

console.log("High Rated Platforms");

console.log(highRatedPlatforms);

// ----------------------------
// find()
// ----------------------------

const codechef = platforms.find(platform => platform.name === "CodeChef");

console.log("Found Platform");

console.log(codechef);

// ----------------------------
// Extra Practice
// ----------------------------

const solvedAbove300 = platforms.filter(platform => platform.solved > 300);

console.log("Solved More Than 300");

console.log(solvedAbove300);

const ratings = platforms.map(platform => platform.rating);

console.log("Ratings");

console.log(ratings);

const atcoder = platforms.find(platform => platform.name === "AtCoder");

console.log("AtCoder");

console.log(atcoder);

console.log("===== End Day 20 =====");
