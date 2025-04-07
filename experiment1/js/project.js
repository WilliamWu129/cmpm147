// project.js - purpose and description here
// Author: William Wu
// Date: 4/6/2025

// NOTE: This is how we might start a basic JavaaScript OOP project

// Constants - User-servicable parts
// In a longer project I like to put these in a separate file

// define a class
class MyProjectClass {
  // constructor function
  constructor(param1, param2) {
    // set properties using 'this' keyword
    this.property1 = param1;
    this.property2 = param2;
  }
  
  // define a method
  myMethod() {
    // code to run when method is called
  }
}

function main() {
  // create an instance of the class
  let myInstance = new MyProjectClass("value1", "value2");

  // call a method on the instance
  myInstance.myMethod();
}

// let's get this party started - uncomment me
//main();

const fillers = {
  adventurer: ["Point guard", "Star", "Shooting guard", "Center", "Small forward","Power forward"],
  battle: ["game", "battle", "match","tournament", "event", "contest", "meeting", "final", "semi-final", "quarter-final", "playoffs", "champs"],
  player: ["Lebron", "Kareem", "Larry Bird", "Wilt Chamberlain", "Kobe", "Micheal Jordan", "Shaq", "Stephan Curry", "Nikola Jokic", "James Harder"],
  prep: ["gyming", "eating a healthy meal", "practice", "relax", "team activity", "buying new gear"],
  focus: ["focus", "lock in", "get in the zone"],
  rewards: ["ring", "fame", "money", "legacy", "riches", "pride","contracts"],
  baddies: ["Cavs", "Celtics", "Knicks", "Pacers", "Bucks", "Thunder", "Rockets", "Lakers", "Nuggets", "Warriors", "Timberwolves"],
  message: ["call", "cry", "post", "chant", "roar", "choice", "dream"],
  
};

const template = `$adventurer, heed my $message!

Tommorow we will play against $baddies. It will be a hard fought $battle. During this game we will need to watch out for $player.\n
Today we should prepare by $prep. If we win we will we will win the $battle. All of us will gain a $rewards. So let us $focus and win!!

`;


// STUDENTS: You don't need to edit code below this line.

const slotPattern = /\$(\w+)/;

function replacer(match, name) {
  let options = fillers[name];
  if (options) {
    return options[Math.floor(Math.random() * options.length)];
  } else {
    return `<UNKNOWN:${name}>`;
  }
}

function generate() {
  let story = template;
  while (story.match(slotPattern)) {
    story = story.replace(slotPattern, replacer);
  }

  /* global box */
  box.innerText = story;
}

/* global clicker */
clicker.onclick = generate;

generate();
