//Gestion de difficulté :
//Du niveau 1 à 5, il n'y a que 3 billets ou pièces (sans centimes)
//5 à 10, 5 billets ou pièces (sans ct)
//10 à 15, 7 billets ou pièces (sans ct)
//15 à 20, aléatoirement 7 à 9 billets ou pièces (sans ct)
//20 à 25, aléatoiremet 3 à 5 billets ou pièces (avec ct)
//25 à 30, aléatoirement 5 à 7 billets ou pièces (avec ct)
//30 à 35, 7 à 9 billets ou pièces (avec ct)
//de 35 à 40, 9 billets ou pièces (avec ct)
//A partir de 40, 10 billets ou pièces avec ct, avec une réduction du chrono à chaque niveau de -2 secondes


let totalCorrect = 0;
let score = 0;
let level = 1;
let timeLeft = 120;
let timer;
let isPaused = false;

//initialisation des pièces et billets
const coinValues = [0.01, 0.02, 0.05, 0.10, 0.50, 1.00, 2.00];
const billValues = [5, 10, 20, 50, 100];

//fonction pour lancer le jeu
function startGame() {
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  resetGame();
}

//remet les infos du jeu à 0 (score et level) puis lance le jeu
function resetGame() {
  score = 0;
  level = 1;
  document.getElementById("player-score").textContent = score;
  document.getElementById("level").textContent = level;
  startLevel();
}

//fonction de niveau
function startLevel() {
  clearInterval(timer); //reset le timer
  document.getElementById("cash-register").innerHTML = "";
  document.getElementById("player-total").value = "";
  totalCorrect = 0;

  timeLeft = level < 40 ? 120 : Math.max(10, 120 - (level - 40) * 2); //si niveau < 40 le timer est 12à, sinon il diminue de 2s à chaque niveau
  generateCash(); //génère les pièces et billets
  maybeShowObstacle(); //fait apparaitre une chaussette (probable)
  startTimer(); //lance le chrono du niveau actuel
}

let placedCoins = []; //tableau pour garder la trace des positions des pièces

function generateRandomPosition() { //fonction de génération de position aléatoires
  const container = document.getElementById("cash-register"); 
  const containerRect = container.getBoundingClientRect();

  //dimensions des pièces
  const coinSize = 50;

  //calcule une position aléatoire à l'intérieur du conteneur sans superposer les éléments
  let x, y, isValidPosition;
  do {
    //Position aléatoire
    x = Math.floor(Math.random() * (containerRect.width - coinSize)); //random x
    y = Math.floor(Math.random() * (containerRect.height - coinSize)); //random y
    //vérifie si la position superpose une pièce déjà placée
    isValidPosition = true;
    for (let coin of placedCoins) {
      const distance = Math.sqrt(Math.pow(coin.x - x, 2) + Math.pow(coin.y - y, 2));
      if (distance < coinSize) {
        isValidPosition = false; //si les pièces sont trop proches, cherche une nouvelle position
        break;
      }
    }
  } while (!isValidPosition); //continue à générer une position jusqu'à ce qu'elle soit valide

  //ajoute la nouvelle position dans le tableau
  placedCoins.push({ x, y });

  return { x, y }; //donne position
}

function generateCash() { //génère les pièces/billets
  const container = document.getElementById("cash-register");
  const nbItems = getNbItemsForLevel(level);
  const possibleCoins = level < 20 ? [1.00, 2.00] : coinValues; //entre level 0 et 20, on génère pas de centimes mais après level 20 on génère tout types de pièces
  const possibleBills = [5, 10, 20, 50, 100]; //billets
  
  const allItems = []; //vérifie qu'il n'y ait pas de superposition
  
  for (let i = 0; i < nbItems; i++) {
    let isCoin = Math.random() < 0.5;
    let value;
    
    if (isCoin) {
      value = possibleCoins[Math.floor(Math.random() * possibleCoins.length)]; //génère une pièce aléatoire parmis possibleCoins
    } else {
      value = possibleBills[Math.floor(Math.random() * possibleBills.length)]; //sinon génère un billet alléatoire
    }
    
    const filename = value.toFixed(2).replace('.', '_') + '.png';
    const img = document.createElement("img");
    
    img.src = value < 5 ? `games/cashierGame/assets/coins/${filename}` : `games/cashierGame/assets/bills/${filename}`;
    img.alt = value + "€";
    img.title = value + "€";
    img.classList.add("money-img");

    //ajoute la classe coin ou bill pour ajuster la taille
    if (value < 5) {
      img.classList.add("coin");
    } else {
      img.classList.add("bill");
    }

    //génére une position aléatoire pour chaque élément
    let x, y;
    let overlaps = true;
    
    //cherche une position aléatoire qui ne superpose pas les autres éléments
    while (overlaps) {
      x = Math.floor(Math.random() * (container.offsetWidth - 75)); //largeur de la zone de jeu
      y = Math.floor(Math.random() * (container.offsetHeight - 75)); //hauteur de la zone de jeu

      //vérifie si la nouvelle position superpose une position existante
      overlaps = allItems.some(item => {
        const distX = Math.abs(item.x - x);
        const distY = Math.abs(item.y - y);
        return distX < 50 && distY < 50; // 50px de distance pour éviter le chevauchement
      });
    }
    
    img.style.left = `${x}px`;  //affiche à la position x générée
    img.style.top = `${y}px`; //affiche à la position y générée
    container.appendChild(img);

    //enregistre la position pour éviter les superpositions futures
    allItems.push({ x, y, value });

    //mise à jour du montant total
    totalCorrect += value;
  }

  //met à jour le montant total
  updateTotalAmount();
}

//fonction de difficulté de niveau (explications en haut)
function getNbItemsForLevel(level) {
  if (level >= 40) {
    return 10; //10 pièces/billets
  } else if (level >= 35) {
    return 9; //9 pièces/billets
  } else if (level >= 30) {
    return Math.floor(Math.random() * 3) + 7; //entre 7 et 9
  } else if (level >= 25) {
    return Math.floor(Math.random() * 3) + 5; //entre 5 et 7
  } else if (level >= 20) {
    return Math.floor(Math.random() * 3) + 3; //entre 3 et 5
  } else if (level >= 15) {
    return Math.floor(Math.random() * 3) + 7; //entre 7 et 9
  } else if (level >= 10) {
    return 7; //7 pièces/billets
  } else if (level >= 5) {
    return 5; //5 pièces/billets
  } else {
    return 3; //3 pièces/billets
  }
}

function updateTotalAmount() {
  const totalAmountElement = document.getElementById("total-amount");
  if (totalAmountElement) {
    totalAmountElement.textContent = `Montant total : ${totalCorrect.toFixed(2)}e`;
  }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//fonction chrono
function startTimer() {
  document.getElementById("timer").textContent = timeLeft;
  timer = setInterval(() => {
    if (!isPaused) { //met en pause le timer si la pause est activée
      timeLeft--;
      document.getElementById("timer").textContent = timeLeft;
      if (timeLeft <= 0) { //si chrono = 0 alors fin
        clearInterval(timer);
        handleGameOver(); //game over
      }
    }
  }, 1000);
}

//fonction pour afficher la chaussette de temps en temps
function maybeShowObstacle() {
  const obstacle = document.getElementById("obstacle");
  if (Math.random() < 0.6) { //chance d'apparition <60%
    var x = Math.floor(Math.random() * 500) + 50; //génère position x
    var y = Math.floor(Math.random() * 200) + 100; //génère position y
    obstacle.style.left = `${x}px`; //met à la position x générée
    obstacle.style.top = `${y}px`; //met à la position y générée
    obstacle.style.display = "block"; //est affichée
  } else {
    obstacle.style.display = "none"; //sinon n'est pas affichée
  }
}

//fonction pour retirer la chaussette
function removeObstacle() {
  document.getElementById("obstacle").style.display = "none";
}

function submitTotal() {
  const userTotal = parseFloat(document.getElementById("player-total").value);
  const roundedUser = Math.round(userTotal * 100);
  const roundedCorrect = Math.round(totalCorrect * 100);

  
  if (roundedUser === roundedCorrect) { //si le montant est correct
    score = level; //on actualise le score
    level++; //on augmente de niveau
    document.getElementById("player-score").textContent = score;
    document.getElementById("level").textContent = level;
    startLevel(); //commence nouveau niveau
  } else {
    alert(`Mauvais montant !`); //préviens que le montant est incorrect
  }
}

function handleGameOver() {
  alert(`Temps écoulé ! Score final : ${score}`); //indique le score au joueur
  fetch(`/add-score?score=${score}&idJeu=3`).finally(() => {
    showStartScreen(); //renvoie au menu
  });
}

//affiche meu
function showStartScreen() {
  document.getElementById("game-container").style.display = "none";
  document.getElementById("start-screen").style.display = "flex";
}


function togglePause() {
  const pauseBtn = document.getElementById("pause-btn");
  const pauseOverlay = document.getElementById("pause-overlay");


  //pause du jeu
  console.log("Pause Button Clicked");
  
  if (!isPaused) {
    clearInterval(timer);  //arrête le chrono
    pauseBtn.textContent = "Reprendre";  //change texte du bouton
    isPaused = true;  //est en pause
    pauseOverlay.style.display = "flex";  //affiche overlay pause
    console.log("Jeu en pause");
  } else {
    isPaused = false;  //n'est plus en pause
    startTimer();  //reprend le timer
    pauseBtn.textContent = "Pause";  //change texte du bouton
    pauseOverlay.style.display = "none";  //masque overlay
    console.log("Jeu repris");
  }
}

