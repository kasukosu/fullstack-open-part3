const mongoose = require('mongoose')

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
  })

const Person = mongoose.model('Person', personSchema)


if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://fullstack-open:${password}@cluster0.aquiw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(url)

if(process.argv.length < 4){
    Person.find({}).then(result => {
        console.log("phonebook:")

        result.forEach(person => {
          console.log(person.name + " " + person.number);
        })
        mongoose.connection.close()
        process.exit(1)

    })

}

const name = process.argv[3]
const number = process.argv[4]


const person = new Person({
  name: name,
  number: number,

})

person.save().then(response => {
  console.log(`added ${name} number ${number} to phonebook`)
  mongoose.connection.close()
})