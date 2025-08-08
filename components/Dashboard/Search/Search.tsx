import React from 'react'

const Search = () => {



  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-full max-w-md"> 
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="search">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search..."
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Search
            </button>
          </div>
        </form>
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Search Results</h2>
          <ul className="list-disc pl-5">
            {/* Example search results */}
            <li>Result 1</li>
            <li>Result 2</li>
            <li>Result 3</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Search