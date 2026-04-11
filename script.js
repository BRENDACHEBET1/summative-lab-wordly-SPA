// Getting elements
const form = document.getElementById("form")
const input = document.getElementById("text-input");

const image = document.getElementById("initial-image");
const loading = document.getElementById("loading-state");
const results = document.getElementById("result-state");
const errorBox = document.getElementById("error-state");

const wordOutput = document.getElementById("word");
const pronunciation = document.getElementById("pronunciation");
const definitionOutput = document.getElementById("definitions");
const audioOutput = document.getElementById("audio");
const errorMessage = document.getElementById("error-message");
const speakerBtn = document.getElementById("speakerBtn");
const saveBtn = document.getElementById("saveBtn");
const savedWordsList = document.getElementById("saved-words");



// Function to control what is visble
// takes state as aparameter and switches bewteen states
function setState(state) {
  image.classList.add("hidden");
  loading.classList.add("hidden");
  results.classList.add("hidden");
  errorBox.classList.add("hidden");

  // if (state === "idle") image.classList.remove("hidden");
  if (state === "loading") loading.classList.remove("hidden");
  if (state === "result") results.classList.remove("hidden");
  if (state === "error") errorBox.classList.remove("hidden");
}

// Validate input:Numeric and special charactrs
function isValidWord(word) {
  return /^[a-zA-Z']+$/.test(word);
}

// ASync function to fetch word

async function fetchWord(word) {
  setState("loading");

  try {
   if (!isValidWord(word)) {
      throw new Error("invalid"); //caught in catch block to show invalid word
    }

    // getting word
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
      
    );

    if (!res.ok) throw new Error("notfound"); //catch block to display invalid

    const data = await res.json(); //parsing data
    
   const entry = data[0];

    // WORD
    wordOutput.textContent = entry.word 

    // PRONUNCIATION
    let phonetic = "";

    if (entry.phonetic) {
      phonetic = entry.phonetic;
    
     }

    if (phonetic) {
      pronunciation.textContent = "/" + phonetic + "/";
    } else {
      pronunciation.textContent = "";
    }

    // AUDIO 
    let audio = "";

     if (entry.phonetics && entry.phonetics.length > 0) { //check if phonetics exist
       for (let i = 0; i < entry.phonetics.length; i++) { //oop through phonetics
        if (entry.phonetics[i].audio && entry.phonetics[i].audio !== "") { //find audio 
          audio = entry.phonetics[i].audio;
           break;
         }
       }
     }

    audioOutput.src = audio;
   


    // DEFINITIONS 
    const meanings = entry.meanings ;
    const defs = meanings[0].definitions;

    definitionOutput.innerHTML = defs
      .slice(0, 2)
      .map(item => "<li>" + item.definition + "</li>")
      .join("") //removes comma
    setState("result");

    // clear input field after results are displayed
input.value = "";

  } catch (err) {
    if (err.message === "invalid") {
      errorMessage.textContent = "Invalid word. Please enter letters only.";
    } else if (err.message === "notfound") {
      errorMessage.textContent = "Word not found.";
    } else {
      errorMessage.textContent = "Something went wrong. Try again";
    }
    setState("error");
  }
}

// Prevent page from reloading
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const word = input.value.trim();
  if (!word) return;

  fetchWord(word);
});

 // connecting audio to speaker
speakerBtn.addEventListener("click", () => {
  if (audioOutput.src) {
    audioOutput.play();
  }
});


// Save words
let savedWords = JSON.parse(localStorage.getItem("words")) || [];


// adding event listener to save button and limiting displayed words to three
saveBtn.addEventListener("click", () => {
  const currentWord = wordOutput.textContent

  if (savedWords.includes(currentWord)) return;

  if (savedWords.length >= 3) {
    savedWords.shift(); // remove oldest
  }

  savedWords.push(currentWord);
  localStorage.setItem("words", JSON.stringify(savedWords)); //local storage, stringfy converts aray to strings
  renderSavedWords(); //reloads the saved words
});

// functionality to click on saved words and show definition
function renderSavedWords() {
  savedWordsList.innerHTML = savedWords
    .map(word => `<li onclick="fetchWord('${word}')">${word}</li>`)
    .join("");
}


