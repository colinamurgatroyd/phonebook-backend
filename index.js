const express = require('express')
const app = express()

app.use(express.json())

// app.use(express.static('dist'))

const morgan = require('morgan')
morgan.token('body', req => {
    return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456"
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523"
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345"
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122"
  }
]

const cors = require('cors')
app.use(cors())

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(p => p.id === id)

    if (person) {
        response.json(person)
    } else {
        response.status(404).end()        
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(p => p.id != id)

    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body

    // Check for errors in the request
    let error = ''
    if (!body.name && !body.number) {
        error = 'name and number are missing'
    } else {
        if (!body.number) {
            error = 'number is missing'
        }
        if (!body.name) {
            error = 'name is missing'
        } else {
            if (persons.find(person => person.name === body.name) !== undefined) {
                error = 'name must be unique'
            }            
        }
    }

    if (error !== '') {
        // There's an error so return it now
        return response.status(400).json({
            error: error
        })
    }

    // Generating an id this way because the exercise asked to use Math.random.
    // I don't particularly like that it can result in multple entries with the
    // same id.
    const id = Math.floor(Math.random() * 100000)

    const person = {
        id: id,
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    console.log(person)
    response.json(person)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)