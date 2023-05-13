function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }
  

function generateNextDate(){
    currentDate = new Date()
    nextMidnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDay(), 0, 0, 0, 0)

    return nextMidnight
}


console.log(generateNextDate().toString());
