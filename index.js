require('dotenv').config()

const express = require('express')
const app = express()

const Person = require('./models/person')

app.use(express.json())

app.use(express.static('dist'))

const morgan = require('morgan')
morgan.token('body', req => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

// let persons = [
//   {
//     id: "1",
//     name: "Arto Hellas",
//     number: "040-123456"
//   },
//   {
//     id: "2",
//     name: "Ada Lovelace",
//     number: "39-44-5323523"
//   },
//   {
//     id: "3",
//     name: "Dan Abramov",
//     number: "12-43-234345"
//   },
//   {
//     id: "4",
//     name: "Mary Poppendieck",
//     number: "39-23-6423122"
//   }
// ]

const cors = require('cors')
app.use(cors())

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  // response.json(persons)
  Person.find({})
    .then(people => {
      response.json(people)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  // Interesting. request.params.id is a string. But, a value like 123 as an
  // integer is not malformatted since an integer is an acceptable id. So,
  // should I also be trying to convert the id to an integer and, if that
  //  works, use that as id to the call to findById (in the case where the
  // string fails as id)?
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const {name, number} = request.body

  // Check for errors in the request
  let error = ''
  if (!name && !number) {
    error = 'name and number are missing'
  } else {
    if (!number) {
      error = 'number is missing'
    }
    if (!name) {
      error = 'name is missing'
    }
  }
  if (error !== '') {
    // There's an error so return it now
    return response.status(400).json({
      error: error
    })
  }

  Person.find({name: name}).exec()
    .then(found => {
      // find() returns an array so we need to check the length
      if (found.length !== 0) {
        return response.status(400).json({
          error: 'person already exists!'
        })
      } else {
        const person = new Person({
          name: name,
          number: number
        })
        return person.save().then(savedPerson => {
          response.json(savedPerson)
        })
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const {number} = request.body

  Person.findById(request.params.id)
    .then(person => {
      if(!person) {
        response.status(404).end()
      }
      // Update the number, the name shouldn't be changed so we leave it
      // alone
      person.number = number
      return person.save()
        .then(updatedPerson => {
          response.json(updatedPerson)
        })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({error: 'malformatted id'})
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT)
console.log(`Server running on port ${PORT}`)