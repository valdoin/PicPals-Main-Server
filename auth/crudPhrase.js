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

    return phrase._id
}

exports.getPhrase = async (req, res, next) => {
    currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    Phrase.find().sort({date: -1}).limit(1).then((phrase) => {
        res.status(200).json({ phrase: phrase.at(0)})
    })
    .catch((err)=>res.status(400).json({message: "could not get phrase", error: err}))
}