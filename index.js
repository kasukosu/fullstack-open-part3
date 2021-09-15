require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))
app.use(express.json())


const Person = require('./models/person')


morgan.token('body', (req) => JSON.stringify(req.body))

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))

})

app.get('/info', async (request, response) => {
  const number = await Person.countDocuments()
  const res = `Phonebook has info for ${number} people`
  const dateNow = new Date()
  const info =
  {
    'message':res,
    'date':dateNow.toString()
  }

  response.json(info)

})

app.post('/api/persons', (request, response) => {

  const body = request.body

  if (!body.name ||!body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number,

  })


  Person.exists({name:body.name}).then((err, res) => {
    if(err){
      response.send(err)
    }
    else{
      if(res){
        response.json({error: 'name must be unique'})
      }
      else{
        person.save().then(savedPerson => {
          console.log(`added ${body.name} number ${body.number} to phonebook`)
          response.json({savedPerson})
        })
      }
    }

  })
    .catch(error => {
      console.log(error)
      response.status(500).end()
    })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    number: body.number,

  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      console.log(result)
      response.status(204).end()
    })
    .catch(error => next(error))
  response.status(204).end()
})

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)