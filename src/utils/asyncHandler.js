const asyncHandler = (requestHandler) => { 
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next))
      .catch((err) => next(err))
      //.reject((err)=> next(err)) // using this here is a bug cause read in the writeup , but use catch
  }
}

export { asyncHandler }

// const asyncHandler = () => { () => { } } //higher order function, takes a function as a parameter and executes it
// const asyncHandler = (fn) => () => { }  
// const asyncHandler = (fn) => async () => { }

// const asyncHandler = (func) => async (req, res, next) => { 
//   try { 
//     await func(req, res, next)
//   } catch (error) {
//     res.status(error.code || 500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }