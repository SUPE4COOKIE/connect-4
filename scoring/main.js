let scores = localStorage.getItem("scores").split(","); // Get the scores from local storage and split them into an array
scores.forEach(element => {
    document.getElementById("scores").innerHTML += "<li>" + element + "</li>"; // Add each score to the list
});
