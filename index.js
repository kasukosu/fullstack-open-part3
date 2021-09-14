const express = require('express')
const morgan = require('morgan');
const cors = require('cors');

const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(cors())
app.use(express.static('build'))


let persons = [
    {
      "name": "qw",
      "number": "123",
      "id": 17
    },
    {
      "name": "qw",
      "number": "12344",
      "id": 18
    },
    {
      "name": "asd",
      "number": "123",
      "id": 19
    }
]

morgan.token('body', (req, res) => JSON.stringify(req.body))

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => {
        console.log(person.id, typeof person.id, id, typeof id, person.id === id)
        return person.id === id
    })
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    response.json(person)

})

app.get('/info', (request, response) => {
  const res = `Phonebook has info for ${persons.length} people`;
  const dateNow = new Date();
  const info =
  {
    "message":res,
    "date":dateNow.toString()
  }

  response.json(info)

})

const generateId = () => {
  const maxId = persons.length > 0
    ? Math.max(...persons.map(n => n.id))
    : 0
  return maxId + 1
}

app.post('/api/persons', (request, response) => {

  const body = request.body

  if (!body.name ||!body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    })
  }

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  const exists = persons.find(e => e.name === person.name);

  if( !exists ){
    persons = persons.concat(person)
    response.json(person)
  }else{
    response.json({error: 'name must be unique'})
  }



})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})