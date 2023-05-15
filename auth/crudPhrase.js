const {Phrase} = require("../model/Phrase")

exports.createPhrase = async (phrase) => {
    await Phrase.create({
        phrase: phrase,
    })
}

exports.getCurrentPhrase = async () => {
    currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    phrase = await(await Phrase.find().sort({date: -1}).limit(1)).at(0)
    console.log(phrase._id)
    return phrase._id.toString()
}