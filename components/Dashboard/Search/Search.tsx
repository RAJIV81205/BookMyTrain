import React from 'react'

const Search = () => {


  function getTimeOfDay() {
    const hour = new Date().getHours(); // returns 0 - 23

    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      return 'evening';
    } else {
      return 'night';
    }
  }




  return (
    <div className='font-poppins'>
      <h1 className="text-2xl font-semibold">Good {getTimeOfDay()}!</h1>
    </div>
  )
}

export default Search